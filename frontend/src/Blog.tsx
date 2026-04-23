import { motion } from 'framer-motion';
import { ArrowRight, Clock, User, Tag } from 'lucide-react';

const POSTS = [
  {
    id: 1,
    title: "The Future of Trustless Settlements",
    excerpt: "How AdrianPay is revolutionizing group finances using zero-knowledge proofs and smart contracts.",
    author: "Alex Rivera",
    date: "April 12, 2026",
    category: "Protocol",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title: "Scaling Expense Splitting to Millions",
    excerpt: "A deep dive into our Layer 2 strategy and how we're keeping gas fees near zero for every transaction.",
    author: "Sarah Chen",
    date: "April 08, 2026",
    category: "Engineering",
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: "Privacy First: Dynamic Member Masking",
    excerpt: "Introducing our new privacy features that allow groups to split expenses without revealing wallet balances.",
    author: "Marcus Thorne",
    date: "March 28, 2026",
    category: "Product",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
  }
];

export default function Blog({ onBack }: { onBack: () => void }) {
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
        <div className="wrap">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="tag" style={{ marginBottom: 16 }}>Our Journal</span>
            <h1 style={{ fontSize: 64, fontWeight: 400, fontFamily: "'Instrument Serif', serif", letterSpacing: '-0.03em', marginBottom: 24 }}>
              Insights into the <br/> Decentralized <em>Economy</em>
            </h1>
            <p style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 600, marginBottom: 64, lineHeight: 1.6 }}>
              Deep dives into the tech, the philosophy, and the future of trustless group finance.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40 }}>
            {POSTS.map((post, i) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card"
                style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }}
              >
                <div style={{ height: 240, overflow: 'hidden' }}>
                  <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
                </div>
                <div style={{ padding: 32 }}>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 11, fontFamily: "'Geist Mono', monospace", color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Tag size={12}/> {post.category}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={12}/> {post.date}</span>
                  </div>
                  <h3 style={{ fontSize: 24, fontWeight: 500, marginBottom: 12, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{post.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24, lineHeight: 1.6 }}>{post.excerpt}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={14} color="var(--text-3)"/>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{post.author}</span>
                    </div>
                    <ArrowRight size={18} color="var(--accent)"/>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
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
