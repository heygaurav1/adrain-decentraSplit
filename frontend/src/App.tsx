import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Wallet, History, DollarSign, CheckCircle2, Globe, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import Landing from './Landing';
import DecentraSplitContract from './contracts/DecentraSplit.json';

declare global { interface Window { ethereum?: any; } }

interface Group { id: number; name: string; creator: string; members: string[]; expenseCount: number; totalExpenses: string; createdAt: number; }
interface Expense { id: number; payer: string; amount: string; description: string; participants: string[]; timestamp: number; }
interface Balance { address: string; amount: string; }

const DEMO_GROUPS: Group[] = [{ id: 0, name: 'Hackathon Team Lunch', creator: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', members: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266','0x70997970C51812dc3A010C7d01b50e0d17dc79C8','0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'], expenseCount: 3, totalExpenses: '0.85', createdAt: Math.floor(Date.now()/1000)-86400 }];
const DEMO_EXPENSES: Expense[] = [
  { id: 2, payer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', amount: '0.5', description: 'Server Hosting', participants: [], timestamp: Math.floor(Date.now()/1000)-1800 },
  { id: 1, payer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', amount: '0.2', description: 'Coffee & Food', participants: [], timestamp: Math.floor(Date.now()/1000)-3600 },
  { id: 0, payer: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', amount: '0.15', description: 'Gala Dinner', participants: [], timestamp: Math.floor(Date.now()/1000)-7200 },
];
const DEMO_BALANCES: Balance[] = [
  { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', amount: '0.35' },
  { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', amount: '-0.15' },
  { address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', amount: '-0.20' },
];

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#080b10', color: '#f0f4ff', fontFamily: "'DM Sans', system-ui, sans-serif" },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 60, background: 'rgba(8,11,16,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  btn: { padding: '9px 20px', fontSize: 13, fontWeight: 600, background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' },
  btnGhost: { padding: '9px 20px', fontSize: 13, fontWeight: 500, background: 'transparent', color: 'rgba(240,244,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' },
  card: { background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 24px' },
  input: { width: '100%', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#f0f4ff', outline: 'none', fontFamily: 'inherit' },
  label: { fontSize: 11, fontWeight: 600, color: 'rgba(240,244,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, display: 'block', marginBottom: 6 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal: { background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '32px 28px', width: '100%', maxWidth: 440 },
};

export default function App() {
  const [account, setAccount] = useState<string|null>(null);
  const [contract, setContract] = useState<any>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number|null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'landing'|'dashboard'>('landing');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState('');
  const [expAmt, setExpAmt] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const isGuest = account === '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' && !contract;

  const enterGuest = () => {
    setLoading(true);
    setTimeout(() => { setAccount('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'); setGroups(DEMO_GROUPS); setView('dashboard'); setLoading(false); }, 800);
  };

  const connectWallet = async () => {
    if (!window.ethereum) { alert('Please install MetaMask!'); return; }
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      setAccount(accounts[0]);
      setContract(new ethers.Contract(DecentraSplitContract.address, DecentraSplitContract.abi, signer));
      setView('dashboard');
    } catch(e) { console.error(e); } finally { setLoading(false); }
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
    } catch(e) { console.error(e); }
  };

  const selectGroup = async (gid: number) => {
    setSelectedGroupId(gid);
    if (isGuest) { setExpenses(DEMO_EXPENSES); setBalances(DEMO_BALANCES); return; }
    if (!contract) return;
    setLoading(true);
    try {
      const g = groups.find(x => x.id === gid)!;
      const exps = await Promise.all(Array.from({length: g.expenseCount}, (_, i) => contract.getExpense(gid, i)));
      setExpenses(exps.map(e => ({ id: Number(e[0]), payer: e[1], amount: ethers.formatEther(e[2]), participants: [...e[3]], description: e[4], timestamp: Number(e[5]) })).reverse());
      const bals = await Promise.all(g.members.map(async (m: string) => ({ address: m, amount: ethers.formatEther(await contract.getBalance(gid, m)) })));
      setBalances(bals);
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault(); if (!contract) return; setLoading(true);
    try {
      const members = groupName.split(',').map(m => m.trim()).filter(m => ethers.isAddress(m));
      const tx = await contract.createGroup(groupName, members); await tx.wait();
      setShowCreateGroup(false); setGroupName(''); setGroupMembers(''); loadGroups();
    } catch(err) { console.error(err); } finally { setLoading(false); }
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault(); if (!contract || selectedGroupId === null) return; setLoading(true);
    try {
      const tx = await contract.addExpense(selectedGroupId, ethers.parseEther(expAmt), [], expDesc); await tx.wait();
      setShowAddExpense(false); setExpAmt(''); setExpDesc(''); selectGroup(selectedGroupId);
    } catch(err) { console.error(err); } finally { setLoading(false); }
  };

  const settleDebt = async (to: string, amount: string) => {
    if (!contract || selectedGroupId === null) return; setLoading(true);
    try {
      const tx = await contract.settle(selectedGroupId, to, { value: ethers.parseEther(amount) }); await tx.wait();
      confetti({ particleCount: 80, spread: 60, colors: ['#0ea5e9','#10b981','#6366f1'] });
      selectGroup(selectedGroupId);
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { if (contract) loadGroups(); }, [contract]);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  if (view === 'landing') return (
    <>
      {loading && <div style={{ ...S.overlay }}><div style={{ width: 40, height: 40, border: '3px solid rgba(14,165,233,0.2)', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}
      <Landing onGuest={enterGuest} onConnect={connectWallet} />
    </>
  );

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono&display=swap');`}</style>
      {/* Navbar */}
      <nav style={S.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setView('landing')}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>D</div>
          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>DecentraSplit</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isGuest && <span style={{ fontSize: 11, fontFamily: 'DM Mono,monospace', padding: '4px 10px', borderRadius: 100, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>GUEST MODE</span>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(240,244,255,0.5)', fontFamily: 'DM Mono,monospace', padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            {account?.slice(0,6)}...{account?.slice(-4)}
          </div>
          <button style={S.btnGhost} onClick={() => { setAccount(null); setContract(null); setGroups([]); setView('landing'); }}>Disconnect</button>
        </div>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '100vh', paddingTop: 60 }}>
        {/* Sidebar */}
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.07)', padding: '28px 16px', background: '#0a0a0a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '0 8px' }}>
            <span style={{ fontSize: 11, fontFamily: 'DM Mono,monospace', color: 'rgba(240,244,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Ledgers</span>
            {!isGuest && <button onClick={() => setShowCreateGroup(true)} style={{ ...S.btn, padding: '5px 10px', fontSize: 12, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={12} /> New</button>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {groups.length === 0
              ? <div style={{ padding: '40px 12px', textAlign: 'center', color: 'rgba(240,244,255,0.2)', fontSize: 12, fontFamily: 'DM Mono,monospace' }}>No ledgers yet</div>
              : groups.map(g => (
                <button key={g.id} onClick={() => selectGroup(g.id)} style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 10, background: selectedGroupId === g.id ? 'rgba(14,165,233,0.1)' : 'transparent', border: `1px solid ${selectedGroupId === g.id ? 'rgba(14,165,233,0.25)' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f4ff', fontFamily: 'Syne,sans-serif', marginBottom: 4 }}>{g.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontFamily: 'DM Mono,monospace', color: 'rgba(240,244,255,0.35)' }}>{g.members.length} members</span>
                    <span style={{ fontSize: 11, fontFamily: 'DM Mono,monospace', color: '#0ea5e9' }}>Ξ {g.totalExpenses}</span>
                  </div>
                </button>
              ))
            }
          </div>
        </div>

        {/* Main Panel */}
        <div style={{ padding: '32px 36px', overflowY: 'auto' }}>
          {!selectedGroupId
            ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', color: 'rgba(240,244,255,0.25)', gap: 12 }}>
                <Users size={40} strokeWidth={1} />
                <span style={{ fontSize: 14, fontFamily: 'DM Mono,monospace' }}>Select a ledger to view details</span>
              </div>
            : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={selectedGroupId}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                  <div>
                    <h2 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Syne,sans-serif', letterSpacing: '-0.03em', margin: '0 0 6px', color: '#f0f4ff' }}>{selectedGroup?.name}</h2>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontFamily: 'DM Mono,monospace', color: 'rgba(240,244,255,0.3)' }}>Active Ledger</span>
                      {isGuest && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontFamily: 'DM Mono,monospace' }}>DEMO DATA</span>}
                    </div>
                  </div>
                  {!isGuest && <button style={{ ...S.btn, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setShowAddExpense(true)}><Plus size={14} /> Log Expense</button>}
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
                  {[
                    { l: 'Network', v: 'Polygon' },
                    { l: 'Total Volume', v: `Ξ ${selectedGroup?.totalExpenses}` },
                    { l: 'Members', v: String(selectedGroup?.members.length) },
                    { l: 'Your Balance', v: balances.find(b => b.address.toLowerCase() === account?.toLowerCase())?.amount || '0', isBal: true },
                  ].map((s, i) => (
                    <div key={i} style={S.card}>
                      <div style={{ fontSize: 10, fontFamily: 'DM Mono,monospace', color: 'rgba(240,244,255,0.3)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.l}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Syne,sans-serif', color: s.isBal ? (Number(s.v) >= 0 ? '#10b981' : '#f43f5e') : '#f0f4ff' }}>
                        {s.isBal && Number(s.v) >= 0 ? '+' : ''}{s.isBal ? `Ξ ${s.v}` : s.v}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Two columns */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {/* Settlements */}
                  <div>
                    <div style={{ fontSize: 11, fontFamily: 'DM Mono,monospace', color: 'rgba(240,244,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Settlements Required</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {balances.filter(b => Number(b.amount) < 0 && b.address.toLowerCase() !== account?.toLowerCase()).length === 0
                        ? <div style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 10, opacity: 0.4 }}><CheckCircle2 size={16} color="#10b981" /><span style={{ fontSize: 13 }}>All settled</span></div>
                        : balances.map(b => {
                            const amt = Number(b.amount);
                            if (amt >= 0 || b.address.toLowerCase() === account?.toLowerCase()) return null;
                            return (
                              <div key={b.address} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontSize: 11, fontFamily: 'DM Mono,monospace', color: 'rgba(240,244,255,0.35)', marginBottom: 4 }}>{b.address.slice(0,8)}...</div>
                                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Syne,sans-serif', color: '#f43f5e' }}>Ξ {Math.abs(amt).toFixed(4)}</div>
                                </div>
                                {!isGuest
                                  ? <button style={{ ...S.btn, padding: '8px 16px', fontSize: 12 }} onClick={() => settleDebt(b.address, Math.abs(amt).toString())}>Settle</button>
                                  : <span style={{ fontSize: 11, fontFamily: 'DM Mono,monospace', color: 'rgba(240,244,255,0.3)' }}>Demo</span>
                                }
                              </div>
                            );
                          })
                      }
                    </div>
                  </div>

                  {/* Expense Feed */}
                  <div>
                    <div style={{ fontSize: 11, fontFamily: 'DM Mono,monospace', color: 'rgba(240,244,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Expense History</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
                      {expenses.length === 0
                        ? <div style={{ ...S.card, opacity: 0.4, fontSize: 13 }}>No expenses logged</div>
                        : expenses.map(e => (
                          <div key={e.id} style={S.card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                              <span style={{ fontSize: 14, fontWeight: 600, color: '#f0f4ff' }}>{e.description}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#0ea5e9', fontFamily: 'DM Mono,monospace' }}>Ξ {e.amount}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: 'DM Mono,monospace', color: 'rgba(240,244,255,0.3)' }}>
                              <span>by {e.payer.slice(0,6)}...</span>
                              <span>{new Date(e.timestamp * 1000).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </motion.div>
          }
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateGroup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={S.overlay} onClick={() => setShowCreateGroup(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={S.modal} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Syne,sans-serif', margin: '0 0 24px', color: '#f0f4ff' }}>New Ledger</h3>
              <form onSubmit={createGroup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div><label style={S.label}>Group Name</label><input style={S.input} placeholder="e.g. Goa Trip" value={groupName} onChange={e => setGroupName(e.target.value)} required /></div>
                <div><label style={S.label}>Member Addresses (comma-separated)</label><textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' as const }} placeholder="0x..." value={groupMembers} onChange={e => setGroupMembers(e.target.value)} /></div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" style={{ ...S.btnGhost, flex: 1 }} onClick={() => setShowCreateGroup(false)}>Cancel</button>
                  <button type="submit" style={{ ...S.btn, flex: 1 }} disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        {showAddExpense && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={S.overlay} onClick={() => setShowAddExpense(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={S.modal} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Syne,sans-serif', margin: '0 0 24px', color: '#f0f4ff' }}>Log Expense</h3>
              <form onSubmit={addExpense} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div><label style={S.label}>Amount (ETH)</label><input type="number" step="0.0001" style={S.input} placeholder="0.00" value={expAmt} onChange={e => setExpAmt(e.target.value)} required /></div>
                <div><label style={S.label}>Description</label><input style={S.input} placeholder="e.g. Dinner" value={expDesc} onChange={e => setExpDesc(e.target.value)} required /></div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" style={{ ...S.btnGhost, flex: 1 }} onClick={() => setShowAddExpense(false)}>Cancel</button>
                  <button type="submit" style={{ ...S.btn, flex: 1 }} disabled={loading}>{loading ? 'Logging...' : 'Confirm'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ ...S.overlay, zIndex: 999 }}>
            <div style={{ width: 44, height: 44, border: '3px solid rgba(14,165,233,0.2)', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
