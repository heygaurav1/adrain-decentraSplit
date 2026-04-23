import { motion } from 'framer-motion';

export default function Terms({ onBack }: { onBack: () => void }) {
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
            <span className="tag" style={{ marginBottom: 16 }}>Legal</span>
            <h1 style={{ fontSize: 48, fontWeight: 400, fontFamily: "'Instrument Serif', serif", letterSpacing: '-0.03em', marginBottom: 24 }}>
              Terms & <em>Conditions</em>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 48, fontFamily: "'Geist Mono', monospace" }}>
              Last updated: April 2026
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 32, fontSize: 15, lineHeight: 1.8, color: 'var(--text-2)' }}>
            <section>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>1. Introduction</h2>
              <p>Welcome to AdrianPay. By accessing or using our protocol, you agree to be bound by these Terms and Conditions. AdrianPay provides a trustless, decentralized expense-splitting protocol deployed on various EVM-compatible blockchains.</p>
            </section>

            <section>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>2. Smart Contract Risks</h2>
              <p>Our platform interacts with smart contracts on public blockchains. While our code has been audited, interacting with blockchain protocols carries inherent risks. AdrianPay is provided "as is" without any warranties. We are not responsible for any loss of funds resulting from contract vulnerabilities or underlying network issues.</p>
            </section>

            <section>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>3. User Responsibilities</h2>
              <p>You are solely responsible for the security of your private keys and wallet phrases. We do not have custody of your funds. It is your responsibility to verify the addresses and amounts before approving any transactions.</p>
            </section>

            <section>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>4. Decentralized Nature</h2>
              <p>AdrianPay operates in a fully decentralized manner. We cannot reverse transactions, modify the ledger, or intervene in disputes between parties using the protocol. All settlements executed by the smart contract are final.</p>
            </section>

            <section>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>5. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. Continued use of the protocol after any changes constitutes your consent to such changes.</p>
            </section>
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
