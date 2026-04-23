import { motion } from 'framer-motion';
import { Wallet, Users, Zap, Shield, CheckCircle2 } from 'lucide-react';

export default function HowItWorksPage({ onBack }: { onBack: () => void }) {
  const steps = [
    {
      icon: <Wallet size={24} color="var(--accent)" />,
      title: "1. Connect Your Wallet",
      desc: "Start by connecting your Web3 wallet (MetaMask, WalletConnect). No email, phone number, or KYC required. Your wallet address is your identity."
    },
    {
      icon: <Users size={24} color="var(--accent)" />,
      title: "2. Deploy a Ledger",
      desc: "Create a new expense group by deploying a lightweight smart contract. Add your friends' wallet addresses to the contract to form the group."
    },
    {
      icon: <Zap size={24} color="var(--accent)" />,
      title: "3. Log Expenses On-Chain",
      desc: "Anyone in the group can record an expense. Our smart contract mathematically splits the cost among participants and updates internal balances instantly."
    },
    {
      icon: <Shield size={24} color="var(--accent)" />,
      title: "4. Trustless Settlement",
      desc: "When it's time to settle up, the protocol automatically routes your funds to whoever is owed. If you owe 0.5 ETH, you send it to the contract, and it handles the distribution—no manual math needed."
    }
  ];

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', fontFamily: "'Geist', sans-serif" }}>
      <nav className="nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={onBack}>
          <div style={{ width: 30, height: 30, background: 'var(--accent)', color: 'var(--bg)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, fontFamily: "'Instrument Serif', serif" }}>D</div>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 19, letterSpacing: '-0.01em' }}>Adrian<em>Pay</em></span>
        </div>
        <button className="btn-g" onClick={onBack}>Back to Home</button>
      </nav>

      <div style={{ paddingTop: 120, paddingBottom: 100 }}>
        <div className="wrap-sm">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="tag" style={{ marginBottom: 16 }}>Tutorial</span>
            <h1 style={{ fontSize: 56, fontWeight: 400, fontFamily: "'Instrument Serif', serif", letterSpacing: '-0.03em', marginBottom: 24, lineHeight: 1.1 }}>
              How AdrianPay <em>Works</em>
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text-2)', marginBottom: 64, lineHeight: 1.6 }}>
              A complete walkthrough of the world's first trustless group expense protocol. Learn how we use smart contracts to eliminate counterparty risk.
            </p>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 + 0.3 }}
                className="card"
                style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                  {step.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>{step.title}</h3>
                  <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} style={{ marginTop: 80, padding: 32, background: 'var(--accent-soft)', borderRadius: 16, border: '1px solid var(--accent-border)' }}>
            <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 color="var(--green)" size={20}/> Technical Architecture
            </h4>
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
              Under the hood, AdrianPay uses a factory pattern. When you deploy a ledger, the <code>AdrianPayFactory.sol</code> deploys a minimal proxy clone of the base logic contract. This ensures gas efficiency while keeping groups completely isolated. The settlement engine uses a greedy algorithm to minimize the total number of on-chain transactions required to reach equilibrium.
            </p>
          </motion.div>
        </div>
      </div>

      <footer style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', padding: '60px 48px' }}>
        <div className="wrap" style={{ textAlign: 'center' }}>
          <div className="logo" style={{ fontSize: 24, marginBottom: 24 }}>Adrian<em>Pay</em></div>
          <p style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: "'Geist Mono', monospace" }}>© 2026 AdrianPay Protocol — Built for the Future of Finance</p>
        </div>
      </footer>
    </div>
  );
}
