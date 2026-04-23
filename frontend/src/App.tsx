import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Users, 
  Wallet, 
  ArrowUpRight, 
  History, 
  DollarSign, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import DecentraSplitContract from './contracts/DecentraSplit.json';

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

// --- Types ---
interface Group {
  id: number;
  name: string;
  creator: string;
  members: string[];
  expenseCount: number;
  totalExpenses: string;
  createdAt: number;
}

interface Expense {
  id: number;
  payer: string;
  amount: string;
  description: string;
  participants: string[];
  timestamp: number;
}

interface Balance {
  address: string;
  amount: string;
}

export default function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseParticipants, setExpenseParticipants] = useState<string[]>([]);

  const connectWallet = async () => {
    // Check for demo mode in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true') {
      setAccount('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
      setGroups([
        {
          id: 0,
          name: 'Goa Trip 2024',
          creator: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          members: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'],
          expenseCount: 2,
          totalExpenses: '0.45',
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 2
        }
      ]);
      return;
    }

    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        setAccount(accounts[0]);

        const contractInstance = new ethers.Contract(
          DecentraSplitContract.address,
          DecentraSplitContract.abi,
          signer
        );
        setContract(contractInstance);
      } catch (error) {
        console.error("Connection error:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const loadGroups = async () => {
    if (!contract || !account) return;
    try {
      const groupIds = await contract.getUserGroups(account);
      const loadedGroups = [];
      for (const id of groupIds) {
        const g = await contract.getGroup(id);
        loadedGroups.push({
          id: Number(g[0]),
          name: g[1],
          creator: g[2],
          members: Array.from(g[3]),
          expenseCount: Number(g[4]),
          totalExpenses: ethers.formatEther(g[5]),
          createdAt: Number(g[6])
        });
      }
      setGroups(loadedGroups);
    } catch (error) {
      console.error("Load groups error:", error);
    }
  };

  const loadGroupDetails = async (groupId: number) => {
    // Demo Mode Logic
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true') {
      setSelectedGroupId(groupId);
      setExpenses([
        { id: 1, payer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', amount: '0.3', description: 'Beach Resort Stay', participants: [], timestamp: Math.floor(Date.now() / 1000) - 3600 },
        { id: 0, payer: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', amount: '0.15', description: 'Scuba Diving', participants: [], timestamp: Math.floor(Date.now() / 1000) - 7200 }
      ]);
      setBalances([
        { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', amount: '0.1' },
        { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', amount: '-0.05' },
        { address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', amount: '-0.05' }
      ]);
      return;
    }

    if (!contract) return;
    setLoading(true);
    try {
      setSelectedGroupId(groupId);
      const group = groups.find(g => g.id === groupId);
      if (!group) return;

      const loadedExpenses = [];
      for (let i = 0; i < group.expenseCount; i++) {
        const e = await contract.getExpense(groupId, i);
        loadedExpenses.push({
          id: Number(e[0]),
          payer: e[1],
          amount: ethers.formatEther(e[2]),
          participants: Array.from(e[3]),
          description: e[4],
          timestamp: Number(e[5])
        });
      }
      setExpenses(loadedExpenses.reverse());

      const loadedBalances = [];
      for (const member of group.members) {
        const bal = await contract.getBalance(groupId, member);
        loadedBalances.push({
          address: member,
          amount: ethers.formatEther(bal)
        });
      }
      setBalances(loadedBalances);
    } catch (error) {
      console.error("Load details error:", error);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !newGroupName) return;
    setLoading(true);
    try {
      const memberArray = newGroupMembers.split(',').map(m => m.trim()).filter(m => ethers.isAddress(m));
      const tx = await contract.createGroup(newGroupName, memberArray);
      await tx.wait();
      setShowCreateGroup(false);
      setNewGroupName('');
      setNewGroupMembers('');
      loadGroups();
    } catch (error) {
      console.error("Create group error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || selectedGroupId === null) return;
    setLoading(true);
    try {
      const amountWei = ethers.parseEther(expenseAmount);
      const tx = await contract.addExpense(selectedGroupId, amountWei, expenseParticipants, expenseDesc);
      await tx.wait();
      setShowAddExpense(false);
      setExpenseAmount('');
      setExpenseDesc('');
      loadGroupDetails(selectedGroupId);
    } catch (error) {
      console.error("Add expense error:", error);
    } finally {
      setLoading(false);
    }
  };

  const settleDebt = async (to: string, amount: string) => {
    if (!contract || selectedGroupId === null) return;
    setLoading(true);
    try {
      const amountWei = ethers.parseEther(amount);
      const tx = await contract.settle(selectedGroupId, to, { value: amountWei });
      await tx.wait();
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0ea5e9', '#6366f1', '#10b981']
      });

      loadGroupDetails(selectedGroupId);
    } catch (error) {
      console.error("Settle error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract) loadGroups();
  }, [contract, account]);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  return (
    <div className="min-h-screen pb-20 selection:bg-primary-500/30">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center glass sticky top-0 z-50 px-4 sm:px-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-2xl shadow-xl shadow-primary-500/20 rotate-3">
            D
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter leading-none">DecentraSplit</h1>
            <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mt-1">Trustless Settlement</span>
          </div>
        </motion.div>
        
        {account ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4"
          >
            <div className="hidden md:flex items-center gap-2 glass px-4 py-2 rounded-2xl text-xs font-bold border-white/5 bg-white/5 uppercase tracking-wider">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              {account.slice(0, 6)}...{account.slice(-4)}
            </div>
            <button className="btn-secondary py-2.5 px-5 text-sm font-bold" onClick={() => setAccount(null)}>
              Disconnect
            </button>
          </motion.div>
        ) : (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary" 
            onClick={connectWallet}
          >
            <Wallet size={18} />
            Connect Wallet
          </motion.button>
        )}
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-8 mt-4 sm:mt-8">
        {!account ? (
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] -z-10"></div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 sm:py-40 glass rounded-[40px] border-white/5 overflow-hidden px-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass bg-white/5 border-white/10 text-xs font-bold text-primary-400 uppercase tracking-widest mb-8">
                <ShieldCheck size={14} /> Built on Polygon / Ethereum
              </div>
              <h2 className="text-5xl sm:text-7xl font-black mb-8 text-gradient tracking-tighter leading-tight">
                Expenses, but <br className="hidden sm:block" /> trustless.
              </h2>
              <p className="text-slate-400 text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                The only app where transparency is guaranteed by code. <br className="hidden sm:block" />
                No more manual tracking. No more disputes. Just pure blockchain logic.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg px-10 py-5 rounded-2xl w-full sm:w-auto" 
                  onClick={connectWallet}
                >
                  Get Started Now <ChevronRight size={20} />
                </motion.button>
                <button className="btn-secondary text-lg px-10 py-5 rounded-2xl w-full sm:w-auto">
                  View Demo Repo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-24 max-w-4xl mx-auto">
                {[
                  { icon: <Zap className="text-yellow-400" />, title: 'Instant', desc: 'Real-time settlements via smart contracts' },
                  { icon: <Users className="text-primary-400" />, title: 'Social', desc: 'Unlimited groups and members' },
                  { icon: <ShieldCheck className="text-green-400" />, title: 'Immutable', desc: 'Your history is safe on the blockchain' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl glass bg-white/5 flex items-center justify-center mb-4">{item.icon}</div>
                    <h4 className="font-bold mb-2">{item.title}</h4>
                    <p className="text-slate-500 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar: Groups */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-4 space-y-6"
            >
              <div className="flex justify-between items-center px-2">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Users size={20} className="text-primary-400" />
                  Your Groups
                </h3>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors border-white/10"
                  onClick={() => setShowCreateGroup(true)}
                >
                  <Plus size={20} />
                </motion.button>
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {groups.length === 0 ? (
                    <p className="text-slate-500 text-sm italic px-4 py-8 glass rounded-2xl border-dashed border-2 border-white/5 text-center">No groups found. Start by creating one!</p>
                  ) : (
                    groups.map((g, i) => (
                      <motion.button
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        key={g.id}
                        onClick={() => loadGroupDetails(g.id)}
                        className={`w-full text-left p-5 rounded-3xl transition-all group relative overflow-hidden ${
                          selectedGroupId === g.id ? 'glass bg-primary-500/10 border-primary-500/40' : 'glass-card border-white/5'
                        }`}
                      >
                        {selectedGroupId === g.id && <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/20 blur-[40px] -mr-12 -mt-12"></div>}
                        <h4 className="font-bold text-lg mb-1 group-hover:text-primary-400 transition-colors">{g.name}</h4>
                        <div className="flex justify-between items-center mt-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5">
                            <Users size={12} /> {g.members.length}
                          </span>
                          <span className="text-primary-400 flex items-center gap-1">
                            Ξ {g.totalExpenses}
                          </span>
                        </div>
                      </motion.button>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Main Section: Group Content */}
            <motion.div 
              layout
              className="lg:col-span-8"
            >
              {selectedGroupId === null ? (
                <div className="h-full min-h-[500px] glass rounded-[40px] flex flex-col items-center justify-center text-slate-500 border-dashed border-2 border-white/5 p-12 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 text-4xl shadow-inner border border-white/10">
                    📂
                  </div>
                  <h3 className="text-xl font-bold text-slate-300 mb-2">No Group Selected</h3>
                  <p className="max-w-xs text-sm text-slate-500">Pick a group from the sidebar to view detailed expenses and settle up.</p>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={selectedGroupId}
                  className="space-y-6"
                >
                  {/* Group Header Card */}
                  <div className="glass p-10 rounded-[40px] relative overflow-hidden border-white/10">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/15 blur-[100px] -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 blur-[60px] -ml-20 -mb-20"></div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                             <h2 className="text-4xl font-black tracking-tight">{selectedGroup?.name}</h2>
                             <div className="bg-primary-500/10 text-primary-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-500/20">Active</div>
                          </div>
                          <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                             <History size={14} /> Created {new Date((selectedGroup?.createdAt || 0) * 1000).toLocaleDateString()}
                          </p>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn-primary py-3 px-8 text-sm font-black shadow-primary-500/40" 
                          onClick={() => {
                            setExpenseParticipants(selectedGroup?.members || []);
                            setShowAddExpense(true);
                          }}
                        >
                          <Plus size={18} /> Add Expense
                        </motion.button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                        {[
                          { label: 'Total Volume', value: `Ξ ${selectedGroup?.totalExpenses}`, icon: <DollarSign size={14} /> },
                          { label: 'Transactions', value: selectedGroup?.expenseCount, icon: <History size={14} /> },
                          { label: 'Network', value: 'Polygon', icon: <Zap size={14} /> },
                          { 
                            label: 'Your Status', 
                            value: balances.find(b => b.address.toLowerCase() === account.toLowerCase())?.amount || '0',
                            isBalance: true 
                          },
                        ].map((stat, i) => (
                          <div key={i} className={`glass bg-white/5 p-5 rounded-3xl border-white/5 ${stat.isBalance ? 'border-primary-500/20' : ''}`}>
                            <p className="text-slate-500 text-[10px] font-black mb-2 uppercase tracking-widest flex items-center gap-1.5">
                              {stat.icon} {stat.label}
                            </p>
                            <p className={`text-xl font-black ${stat.isBalance ? (Number(stat.value) >= 0 ? 'text-green-400' : 'text-rose-400') : 'text-slate-200'}`}>
                              {stat.isBalance && Number(stat.value) >= 0 ? '+' : ''}{stat.isBalance ? `Ξ ${stat.value}` : stat.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Main Grid: Settlements & History */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Settlements Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <h4 className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter">
                           Settlements
                        </h4>
                        <span className="text-[10px] font-black text-slate-500 bg-white/5 px-2 py-1 rounded-md">Real-time</span>
                      </div>
                      <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                        {balances.map(b => {
                          const amt = Number(b.amount);
                          if (amt >= 0 || b.address.toLowerCase() === account.toLowerCase()) return null;
                          return (
                            <motion.div 
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              key={b.address} 
                              className="glass-card p-5 rounded-[32px] flex justify-between items-center border-white/5 hover:border-primary-500/30"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                   <CreditCard size={18} />
                                </div>
                                <div>
                                  <p className="font-bold text-xs text-slate-400">{b.address.slice(0,6)}...{b.address.slice(-4)}</p>
                                  <p className="text-rose-400 text-lg font-black tracking-tight">Ξ {Math.abs(amt).toFixed(4)}</p>
                                </div>
                              </div>
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-primary-500/30 transition-all flex items-center gap-2"
                                onClick={() => settleDebt(b.address, Math.abs(amt).toString())}
                              >
                                Settle <ArrowUpRight size={14} />
                              </motion.button>
                            </motion.div>
                          );
                        })}
                        {balances.every(b => Number(b.amount) >= 0 || b.address.toLowerCase() === account.toLowerCase()) && (
                          <div className="flex flex-col items-center justify-center py-12 glass bg-white/2 rounded-[32px] border-dashed border-2 border-white/5">
                            <CheckCircle2 size={32} className="text-green-500 mb-3 opacity-50" />
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Fully Settled Up</p>
                          </div>
                        )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* History Section */}
                    <div className="space-y-4">
                       <div className="flex items-center justify-between px-2">
                        <h4 className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter">
                           Expense Feed
                        </h4>
                        <History size={16} className="text-slate-500" />
                      </div>
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                        {expenses.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 glass bg-white/2 rounded-[32px] border-dashed border-2 border-white/5">
                             <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">No activity yet</p>
                          </div>
                        ) : (
                          expenses.map((e, i) => (
                            <motion.div 
                              layout
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              key={e.id} 
                              className="glass-card p-5 rounded-[32px] border-white/5"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <h5 className="font-black text-slate-200 tracking-tight">{e.description}</h5>
                                <span className="bg-primary-500/10 text-primary-400 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-primary-500/20">Ξ {e.amount}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                   <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[8px] font-black text-slate-400 border border-white/5">0x</div>
                                   <span className="text-[10px] font-bold text-slate-500">Paid by {e.payer.slice(0,6)}...</span>
                                </div>
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{new Date(e.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </motion.div>
                          ))
                        )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </main>

      {/* Modals with Animation */}
      <AnimatePresence>
        {showCreateGroup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
              onClick={() => setShowCreateGroup(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass p-10 rounded-[40px] w-full max-w-md relative z-10 border-white/10 shadow-2xl"
            >
              <h3 className="text-3xl font-black mb-8 tracking-tighter">Create Group</h3>
              <form onSubmit={createGroup} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Group Name</label>
                  <input 
                    type="text" 
                    className="w-full text-lg font-bold py-4 px-6" 
                    placeholder="e.g. Europe Trip"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Members (Wallet Addresses)</label>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-[24px] px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all min-h-[120px] text-sm font-mono" 
                    placeholder="0x..., 0x..."
                    value={newGroupMembers}
                    onChange={(e) => setNewGroupMembers(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" className="btn-secondary flex-1 font-black uppercase text-xs tracking-widest" onClick={() => setShowCreateGroup(false)}>Cancel</button>
                  <button type="submit" className="btn-primary flex-1 font-black uppercase text-xs tracking-widest" disabled={loading}>
                    {loading ? 'Processing...' : 'Deploy Group'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showAddExpense && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
              onClick={() => setShowAddExpense(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass p-10 rounded-[40px] w-full max-w-md relative z-10 border-white/10 shadow-2xl"
            >
              <h3 className="text-3xl font-black mb-8 tracking-tighter">Add Expense</h3>
              <form onSubmit={addExpense} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Amount (ETH)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.0001" 
                      className="w-full text-2xl font-black py-4 px-6 pr-16" 
                      placeholder="0.00"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      required
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-500">Ξ</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Description</label>
                  <input 
                    type="text" 
                    className="w-full font-bold py-4 px-6" 
                    placeholder="e.g. Dinner"
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Split Between</label>
                  <div className="max-h-[160px] overflow-y-auto space-y-2 p-3 bg-white/2 rounded-[24px] border border-white/5 custom-scrollbar">
                    {selectedGroup?.members.map(member => (
                      <label key={member} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-white/5">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded-lg border-white/20 bg-transparent text-primary-500 focus:ring-offset-0 focus:ring-primary-500"
                          checked={expenseParticipants.includes(member)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setExpenseParticipants([...expenseParticipants, member]);
                            } else {
                              setExpenseParticipants(expenseParticipants.filter(m => m !== member));
                            }
                          }}
                        />
                        <span className="text-xs text-slate-300 font-black tracking-tight">{member === account ? 'Me' : `${member.slice(0,6)}...${member.slice(-4)}`}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" className="btn-secondary flex-1 font-black uppercase text-xs tracking-widest" onClick={() => setShowAddExpense(false)}>Cancel</button>
                  <button type="submit" className="btn-primary flex-1 font-black uppercase text-xs tracking-widest" disabled={loading}>
                    {loading ? 'Logging...' : 'Add Expense'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-400">
                <Zap size={24} className="animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
