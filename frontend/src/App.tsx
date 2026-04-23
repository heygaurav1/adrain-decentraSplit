import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import Landing from './Landing';
import Blog from './Blog';
import Terms from './Terms';
import HowItWorksPage from './HowItWorksPage';
import AdrianPayContract from './contracts/AdrianPay.json';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

declare global { interface Window { ethereum?: any; } }

interface Group { id: number; name: string; creator: string; members: string[]; expenseCount: number; totalExpenses: string; createdAt: number; }
interface Expense { id: number; payer: string; amount: string; description: string; participants: string[]; timestamp: number; }
interface Balance { address: string; amount: string; }

const DEMO_GROUPS: Group[] = [{ id: 0, name: 'Hackathon Team Lunch', creator: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', members: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'], expenseCount: 3, totalExpenses: '0.85', createdAt: Math.floor(Date.now() / 1000) - 86400 }];
const DEMO_EXPENSES: Expense[] = [
  { id: 2, payer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', amount: '0.5', description: 'Server Hosting', participants: [], timestamp: Math.floor(Date.now() / 1000) - 1800 },
  { id: 1, payer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', amount: '0.2', description: 'Coffee & Food', participants: [], timestamp: Math.floor(Date.now() / 1000) - 3600 },
  { id: 0, payer: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', amount: '0.15', description: 'Gala Dinner', participants: [], timestamp: Math.floor(Date.now() / 1000) - 7200 },
];
const DEMO_BALANCES: Balance[] = [
  { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', amount: '0.35' },
  { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', amount: '-0.15' },
  { address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', amount: '-0.20' },
];

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'Geist', sans-serif" },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: 58, background: 'var(--bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(12px)' },
  btn: { padding: '10px 22px', fontSize: 13, fontWeight: 600, background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Geist', sans-serif" },
  btnGhost: { padding: '10px 22px', fontSize: 13, fontWeight: 500, background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Geist', sans-serif" },
  card: { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px', transition: 'all 0.2s' },
  input: { width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: 'var(--text)', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s', boxSizing: 'border-box' as const },
  label: { fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, display: 'block', marginBottom: 8, fontFamily: "'Geist Mono', monospace" },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal: { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '36px', width: '100%', maxWidth: 460, boxShadow: '0 24px 80px rgba(0,0,0,0.4)' },
};

// ✅ THE FIX: Wait for window to load, then check ethereum properly
const getEthereum = (): Promise<any> => {
  return new Promise((resolve) => {
    if (typeof window.ethereum !== 'undefined') {
      resolve(window.ethereum);
      return;
    }
    // Wait up to 3 seconds for MetaMask to inject
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (typeof window.ethereum !== 'undefined') {
        clearInterval(interval);
        resolve(window.ethereum);
      } else if (attempts >= 30) {
        clearInterval(interval);
        resolve(null); // Not found after 3s
      }
    }, 100);
  });
};

export default function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'landing' | 'dashboard' | 'blog' | 'terms' | 'how-it-works'>('landing');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState('');
  const [expAmt, setExpAmt] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [authUser, setAuthUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);

  const isGuest = account === '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' && !contract;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setAuthUser(u));
    return () => unsubscribe();
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLoginMode) await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
      setShowAuthModal(false);
    } catch (err: any) { alert(err.message); }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setShowAuthModal(false);
    } catch (err: any) { alert(err.message); }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setAccount(null);
      setContract(null);
      setGroups([]);
      setSelectedGroupId(null);
      setView('landing');
    } catch (err: any) { console.error(err); }
  };

  const enterGuest = () => {
    setLoading(true);
    setTimeout(() => {
      setAccount('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
      setGroups(DEMO_GROUPS);
      setView('dashboard');
      setLoading(false);
    }, 800);
  };

  // ✅ FIXED connectWallet — uses getEthereum() instead of checking window.ethereum directly
  const connectWallet = async () => {
    setLoading(true);
    try {
      const ethereum = await getEthereum();

      if (!ethereum) {
        alert('MetaMask not detected. Please install the MetaMask extension and refresh the page.');
        setLoading(false);
        return;
      }

      const provider = new ethers.BrowserProvider(ethereum);

      // Switch to or add Localhost 31337
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7a69' }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x7a69',
                chainName: 'Localhost 8545',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['http://127.0.0.1:8545'],
              }],
            });
          } catch (addError) {
            console.error('Could not add network:', addError);
          }
        }
      }

      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      setAccount(accounts[0]);
      setContract(new ethers.Contract(
        AdrianPayContract.address,
        AdrianPayContract.abi,
        signer
      ));
      setView('dashboard');
    } catch (e: any) {
      console.error("Wallet connection error:", e);
      if (e.code === 4001) {
        alert('Connection rejected. Please approve the MetaMask request.');
      } else {
        alert('Failed to connect wallet: ' + (e.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    if (!contract || !account) return;
    try {
      const ids = await contract.getUserGroups(account);
      const gs = await Promise.all(ids.map(async (id: any) => {
        const g = await contract.getGroup(id);
        return { id: Number(g[0]), name: g[1], creator: g[2], members: [...g[3]], expenseCount: Number(g[4]), totalExpenses: ethers.formatEther(g[5]), createdAt: Number(g[6]) };
      }));
      setGroups(gs);
    } catch (e) { console.error(e); }
  };

  const selectGroup = async (gid: number) => {
    setSelectedGroupId(gid);
    if (isGuest) { setExpenses(DEMO_EXPENSES); setBalances(DEMO_BALANCES); return; }
    if (!contract) return;
    setLoading(true);
    try {
      const g = groups.find(x => x.id === gid)!;
      const exps = await Promise.all(Array.from({ length: g.expenseCount }, (_, i) => contract.getExpense(gid, i)));
      setExpenses(exps.map(e => ({ id: Number(e[0]), payer: e[1], amount: ethers.formatEther(e[2]), participants: [...e[3]], description: e[4], timestamp: Number(e[5]) })).reverse());
      const bals = await Promise.all(g.members.map(async (m: string) => ({ address: m, amount: ethers.formatEther(await contract.getBalance(gid, m)) })));
      setBalances(bals);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;
    setLoading(true);
    try {
      const members = groupMembers.split(',').map(m => m.trim()).filter(m => ethers.isAddress(m));
      const tx = await contract.createGroup(groupName, members);
      await tx.wait();
      setShowCreateGroup(false);
      setGroupName('');
      setGroupMembers('');
      loadGroups();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || selectedGroupId === null) return;
    setLoading(true);
    try {
      const tx = await contract.addExpense(selectedGroupId, ethers.parseEther(expAmt), [], expDesc);
      await tx.wait();
      setShowAddExpense(false);
      setExpAmt('');
      setExpDesc('');
      selectGroup(selectedGroupId);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const settleDebt = async (to: string, amount: string) => {
    if (!contract || selectedGroupId === null) return;
    setLoading(true);
    try {
      const tx = await contract.settle(selectedGroupId, to, { value: ethers.parseEther(amount) });
      await tx.wait();
      confetti({ particleCount: 80, spread: 60, colors: ['#0ea5e9', '#10b981', '#6366f1'] });
      selectGroup(selectedGroupId);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { if (contract) loadGroups(); }, [contract]);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  if (view === 'landing') return (
    <>
      {loading && (
        <div style={S.overlay}>
          <div style={{ width: 40, height: 40, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
      <Landing onGuest={enterGuest} onConnect={connectWallet} onNavigate={setView} onWeb2Login={() => setShowAuthModal(true)} onSignOut={handleSignOut} authUser={authUser} />
      
      <AnimatePresence>
        {showAuthModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={S.overlay} onClick={() => setShowAuthModal(false)}>
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} style={S.modal} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: 24, fontWeight: 400, fontFamily: "'Instrument Serif', serif", margin: '0 0 28px', color: 'var(--text)' }}>
                {isLoginMode ? 'Sign In' : 'Create Account'}
              </h3>
              <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div><label style={S.label}>Email</label><input type="email" style={S.input} value={email} onChange={e => setEmail(e.target.value)} required /></div>
                <div><label style={S.label}>Password</label><input type="password" style={S.input} value={password} onChange={e => setPassword(e.target.value)} required /></div>
                <button type="submit" style={{ ...S.btn, marginTop: 8 }}>{isLoginMode ? 'Login' : 'Sign Up'}</button>
              </form>
              <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-3)', fontSize: 12, textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace" }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} /> OR <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>
              <button style={{ ...S.btnGhost, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }} onClick={handleGoogleAuth}>
                Continue with Google
              </button>
              <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-2)' }}>
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => setIsLoginMode(!isLoginMode)}>
                  {isLoginMode ? 'Sign Up' : 'Log In'}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  if (view === 'blog') return <Blog onBack={() => setView('landing')} />;
  if (view === 'terms') return <Terms onBack={() => setView('landing')} />;
  if (view === 'how-it-works') return <HowItWorksPage onBack={() => setView('landing')} />;

  return (
    <div style={S.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; }
      `}</style>

      {/* Nav */}
      <nav style={S.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setView('landing')}>
          <div style={{ width: 30, height: 30, background: 'var(--accent)', color: 'var(--bg)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, fontFamily: "'Instrument Serif', serif" }}>D</div>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 19, letterSpacing: '-0.01em' }}>Adrian<em>Pay</em></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isGuest && (
            <span style={{ fontSize: 10, fontFamily: "'Geist Mono', monospace", padding: '4px 12px', borderRadius: 100, background: 'var(--green-soft)', border: '1px solid var(--green)', color: 'var(--green)', fontWeight: 600 }}>
              GUEST MODE
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-2)', fontFamily: "'Geist Mono', monospace", padding: '7px 14px', borderRadius: 9, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </div>
          <button style={S.btnGhost} onClick={handleSignOut}>
            Disconnect
          </button>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="dash-grid">

        {/* Sidebar */}
        <div className="dash-sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '0 8px' }}>
            <span style={{ fontSize: 10, fontFamily: "'Geist Mono', monospace", color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Ledgers</span>
            {!isGuest && (
              <button onClick={() => setShowCreateGroup(true)} style={{ ...S.btn, padding: '6px 12px', fontSize: 11, borderRadius: 7, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Plus size={13} /> New
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {groups.length === 0
              ? <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 12, fontFamily: "'Geist Mono', monospace" }}>No ledgers yet</div>
              : groups.map(g => (
                <button key={g.id} onClick={() => selectGroup(g.id)} style={{ textAlign: 'left', padding: '14px 18px', borderRadius: 12, background: selectedGroupId === g.id ? 'var(--accent-soft)' : 'transparent', border: `1px solid ${selectedGroupId === g.id ? 'var(--accent-border)' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: "'Geist', sans-serif", marginBottom: 5 }}>{g.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontFamily: "'Geist Mono', monospace", color: 'var(--text-3)' }}>{g.members.length} members</span>
                    <span style={{ fontSize: 11, fontFamily: "'Geist Mono', monospace", color: 'var(--green)', fontWeight: 600 }}>Ξ {g.totalExpenses}</span>
                  </div>
                </button>
              ))
            }
          </div>
        </div>

        {/* Main Content */}
        <div style={{ padding: '40px 50px', overflowY: 'auto', background: 'var(--bg-2)' }}>
          {!selectedGroupId
            ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-3)', gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={32} strokeWidth={1} />
                </div>
                <span style={{ fontSize: 14, fontFamily: "'Geist Mono', monospace" }}>Select a ledger to view details</span>
              </div>
            )
            : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={selectedGroupId}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
                  <div>
                    <h2 style={{ fontSize: 36, fontWeight: 400, fontFamily: "'Instrument Serif', serif", letterSpacing: '-0.02em', margin: '0 0 8px', color: 'var(--text)' }}>{selectedGroup?.name}</h2>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ padding: '3px 10px', fontSize: 11, borderRadius: 100, border: '1px solid var(--border)', color: 'var(--text-3)', fontFamily: "'Geist Mono', monospace" }}>Active Protocol Ledger</span>
                      {isGuest && <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 100, background: 'var(--amber)', color: '#fff', fontFamily: "'Geist Mono', monospace", fontWeight: 600 }}>DEMO</span>}
                    </div>
                  </div>
                  {!isGuest && (
                    <button style={{ ...S.btn, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setShowAddExpense(true)}>
                      <Plus size={14} /> Log Expense
                    </button>
                  )}
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 36 }}>
                  {[
                    { l: 'Network', v: 'Polygon POS' },
                    { l: 'Total Volume', v: `Ξ ${selectedGroup?.totalExpenses}` },
                    { l: 'Members', v: String(selectedGroup?.members.length) },
                    { l: 'Your Balance', v: balances.find(b => b.address.toLowerCase() === account?.toLowerCase())?.amount || '0', isBal: true },
                  ].map((s, i) => (
                    <div key={i} style={S.card}>
                      <div style={{ fontSize: 10, fontFamily: "'Geist Mono', monospace", color: 'var(--text-3)', marginBottom: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>{s.l}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Geist', sans-serif", letterSpacing: '-0.03em', color: s.isBal ? (Number(s.v) >= 0 ? 'var(--green)' : 'var(--rose)') : 'var(--text)' }}>
                        {s.isBal && Number(s.v) >= 0 ? '+' : ''}{s.isBal ? `Ξ ${s.v}` : s.v}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Settlements + History */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 11, fontFamily: "'Geist Mono', monospace", color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>Pending Settlements</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {balances.filter(b => Number(b.amount) < 0 && b.address.toLowerCase() !== account?.toLowerCase()).length === 0
                        ? (
                          <div style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 12, opacity: 0.6 }}>
                            <CheckCircle2 size={18} color="var(--green)" />
                            <span style={{ fontSize: 14 }}>All settled on-chain</span>
                          </div>
                        )
                        : balances.map(b => {
                          const amt = Number(b.amount);
                          if (amt >= 0 || b.address.toLowerCase() === account?.toLowerCase()) return null;
                          return (
                            <div key={b.address} style={S.card}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontSize: 11, fontFamily: "'Geist Mono', monospace", color: 'var(--text-3)', marginBottom: 6 }}>{b.address.slice(0, 10)}...</div>
                                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--rose)' }}>Ξ {Math.abs(amt).toFixed(4)}</div>
                                </div>
                                {!isGuest
                                  ? <button style={{ ...S.btn, padding: '9px 18px', fontSize: 12 }} onClick={() => settleDebt(b.address, Math.abs(amt).toString())}>Settle</button>
                                  : <span style={{ fontSize: 11, fontFamily: "'Geist Mono', monospace", color: 'var(--text-3)' }}>Demo Mode</span>
                                }
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontFamily: "'Geist Mono', monospace", color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>Expense History</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 450, overflowY: 'auto', paddingRight: 5 }}>
                      {expenses.length === 0
                        ? <div style={{ ...S.card, opacity: 0.6, fontSize: 14 }}>No records found</div>
                        : expenses.map(e => (
                          <div key={e.id} style={S.card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{e.description}</span>
                              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', fontFamily: "'Geist Mono', monospace" }}>Ξ {e.amount}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: "'Geist Mono', monospace", color: 'var(--text-3)' }}>
                              <span>by {e.payer.slice(0, 8)}...</span>
                              <span>{new Date(e.timestamp * 1000).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          }
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateGroup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={S.overlay} onClick={() => setShowCreateGroup(false)}>
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} style={S.modal} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: 24, fontWeight: 400, fontFamily: "'Instrument Serif', serif", margin: '0 0 28px', color: 'var(--text)' }}>New Ledger</h3>
              <form onSubmit={createGroup} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={S.label}>Ledger Name</label>
                  <input style={S.input} placeholder="e.g. Hackathon Team" value={groupName} onChange={e => setGroupName(e.target.value)} required />
                </div>
                <div>
                  <label style={S.label}>Member Addresses (comma-separated)</label>
                  <textarea style={{ ...S.input, minHeight: 90, resize: 'none' }} placeholder="0x..." value={groupMembers} onChange={e => setGroupMembers(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" style={{ ...S.btnGhost, flex: 1 }} onClick={() => setShowCreateGroup(false)}>Cancel</button>
                  <button type="submit" style={{ ...S.btn, flex: 1 }} disabled={loading}>{loading ? 'Creating...' : 'Deploy Ledger'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showAddExpense && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={S.overlay} onClick={() => setShowAddExpense(false)}>
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} style={S.modal} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: 24, fontWeight: 400, fontFamily: "'Instrument Serif', serif", margin: '0 0 28px', color: 'var(--text)' }}>Log Expense</h3>
              <form onSubmit={addExpense} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={S.label}>Total Amount (ETH)</label>
                  <input type="number" step="0.0001" style={S.input} placeholder="0.00" value={expAmt} onChange={e => setExpAmt(e.target.value)} required />
                </div>
                <div>
                  <label style={S.label}>Description</label>
                  <input style={S.input} placeholder="e.g. Server Costs" value={expDesc} onChange={e => setExpDesc(e.target.value)} required />
                </div>

                {expAmt && selectedGroup && parseFloat(expAmt) > 0 && (
                  <div style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', padding: '16px', borderRadius: '12px', marginTop: '4px' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Zap size={14} /> Smart Contract Split
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
                      This expense will be trustlessly divided among all <strong>{selectedGroup.members.length} members</strong> of the ledger. Each member's internal balance will be adjusted by exactly <strong>{(parseFloat(expAmt) / selectedGroup.members.length).toFixed(4)} ETH</strong>.
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" style={{ ...S.btnGhost, flex: 1 }} onClick={() => setShowAddExpense(false)}>Cancel</button>
                  <button type="submit" style={{ ...S.btn, flex: 1 }} disabled={loading}>{loading ? 'Logging...' : 'Confirm Expense'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ ...S.overlay, zIndex: 999 }}>
            <div style={{ width: 44, height: 44, border: '3px solid rgba(14,165,233,0.2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
