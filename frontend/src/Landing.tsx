import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  ShieldCheck, Zap, Lock, Globe, Coffee, MessageSquare,
  CheckCircle2, ArrowRight, Users, BarChart3, Layers,
  Wallet, Star, Coins, TrendingUp, Clock, Shield,
  Repeat2, Sparkles, Play, Sun, Moon, ChevronDown, GitBranch
} from 'lucide-react';

type Theme = 'light' | 'dark' | 'yellow';

const f = { initial:{opacity:0,y:18}, whileInView:{opacity:1,y:0}, viewport:{once:true,margin:'-60px'}, transition:{duration:.5,ease:[.22,1,.36,1]} };
const fl = { initial:{opacity:0,x:-22}, whileInView:{opacity:1,x:0}, viewport:{once:true,margin:'-60px'}, transition:{duration:.5,ease:[.22,1,.36,1]} };
const fr = { initial:{opacity:0,x:22}, whileInView:{opacity:1,x:0}, viewport:{once:true,margin:'-60px'}, transition:{duration:.5,ease:[.22,1,.36,1]} };

function Nav({ theme, setTheme, onGuest, onConnect, onWeb2Login, onSignOut, authUser }:{ theme:Theme; setTheme:(t:Theme)=>void; onGuest:()=>void; onConnect:()=>void; onWeb2Login:()=>void; onSignOut:()=>void; authUser:any }) {
  return (
    <nav className="nav">
      <div className="logo">Adrian<em>Pay</em></div>
      <div className="nav-links">
        {['Product','How It Works','Protocol','Roadmap','FAQ'].map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}>{l}</a>
        ))}
      </div>
      <div className="nav-r">
        <button className={`tbtn ${theme==='light'?'on':''}`} onClick={()=>setTheme('light')} data-tooltip="Light"><Sun size={12}/></button>
        <button className={`tbtn ${theme==='dark'?'on':''}`} onClick={()=>setTheme('dark')} data-tooltip="Dark"><Moon size={12}/></button>
        <button className={`tbtn ${theme==='yellow'?'on':''}`} onClick={()=>setTheme('yellow')} data-tooltip="Solar">☀</button>
        <div style={{width:1,height:18,background:'var(--border)',margin:'0 4px'}}/>
        <button className="btn-p" onClick={onConnect}>Connect Wallet</button>
        {authUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{authUser.email?.split('@')[0]}</span>
            <button className="btn-g" style={{ padding: '6px 12px', fontSize: 11 }} onClick={onSignOut}>Sign Out</button>
          </div>
        ) : (
          <button className="btn-g" onClick={onWeb2Login}>Sign In</button>
        )}
      </div>
    </nav>
  );
}

function Hero({ onGuest, onConnect }:{ onGuest:()=>void; onConnect:()=>void }) {
  return (
    <section id="product" style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'130px 48px 90px',position:'relative',overflow:'hidden'}}>

      {/* Concentric rings — scale visual */}
      {[520,370,220].map((s,i)=>(
        <motion.div key={i} initial={{opacity:0,scale:.88}} animate={{opacity:1,scale:1}} transition={{delay:i*.14,duration:.9,ease:[.22,1,.36,1]}}
          style={{position:'absolute',width:s,height:s,borderRadius:'50%',border:'1px solid var(--border)',top:'50%',left:'50%',transform:'translate(-50%,-50%)',pointerEvents:'none'}}/>
      ))}

      {/* Corner stat proofs */}
      {[
        {t:'$2M+ Settled',s:'Volume on-chain',pos:{top:'24%',left:'5%'},align:'left'},
        {t:'10,000+ Txns',s:'Processed trustlessly',pos:{top:'24%',right:'5%'},align:'right'},
        {t:'< $0.001',s:'Per expense on L2',pos:{bottom:'26%',left:'5%'},align:'left'},
        {t:'5 Chains',s:'Currently deployed',pos:{bottom:'26%',right:'5%'},align:'right'},
      ].map((c,i)=>(
        <motion.div key={i} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.7+i*.1,duration:.45}}
          style={{position:'absolute',...c.pos,textAlign:c.align as any,pointerEvents:'none'}}>
          <div style={{fontSize:13,fontWeight:700,color:'var(--text)',letterSpacing:'-.01em'}}>{c.t}</div>
          <div style={{fontSize:10,fontFamily:'Geist Mono,monospace',color:'var(--text-3)',marginTop:2}}>{c.s}</div>
        </motion.div>
      ))}

      <div style={{position:'relative',zIndex:1,maxWidth:680}}>
        {/* Badges */}
        <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{delay:.1,duration:.4}} style={{display:'flex',justifyContent:'center',gap:8,marginBottom:34,flexWrap:'wrap'}}>
          <span className="pill"><span style={{width:6,height:6,borderRadius:'50%',background:'var(--green)',display:'inline-block'}}/> Protocol Live · Polygon + Ethereum</span>
          <span className="pill"><Sparkles size={9}/> ETHGlobal Hackathon 2026</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:.18,duration:.6,ease:[.22,1,.36,1]}}
          style={{fontFamily:'Instrument Serif,serif',fontSize:'clamp(54px,9.5vw,104px)',fontWeight:400,lineHeight:.94,letterSpacing:'-.035em',margin:'0 0 26px',color:'var(--text)'}}>
          Split bills.<br/>
          <em style={{color:'var(--text-2)'}}>Not trust.</em>
        </motion.h1>

        {/* Body */}
        <motion.p initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.28,duration:.5,ease:[.22,1,.36,1]}}
          style={{fontSize:16,color:'var(--text-2)',lineHeight:1.78,maxWidth:460,margin:'0 auto 42px',fontWeight:300}}>
          The first <strong style={{color:'var(--text)',fontWeight:600}}>trustless group expense protocol.</strong>{' '}
          Every debt settled by audited smart contracts — not promises.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.38,duration:.45}} style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:52}}>
          <button className="btn-hero" onClick={onGuest}><Play size={13}/> Try Guest Mode — No Wallet</button>
          <button className="btn-hero-g" onClick={onConnect}><Wallet size={13}/> Connect Wallet</button>
        </motion.div>

        {/* Inline scale metrics */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.52,duration:.45}} style={{display:'flex',justifyContent:'center',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
          {[['10k+','Transactions'],['$2M+','Volume'],['18ms','Sync'],['4.9★','Rating']].map(([v,l],i)=>(
            <div key={i} style={{padding:'14px 24px',borderRight:i<3?'1px solid var(--border)':'none',textAlign:'center'}}>
              <div style={{fontSize:18,fontWeight:700,letterSpacing:'-.03em',color:'var(--text)'}}>{v}</div>
              <div style={{fontSize:10,fontFamily:'Geist Mono,monospace',color:'var(--text-3)',marginTop:2}}>{l}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll cue */}
        <motion.div animate={{y:[0,7,0]}} transition={{repeat:Infinity,duration:2.3}} style={{marginTop:44,display:'flex',justifyContent:'center'}}>
          <ChevronDown size={17} color="var(--text-3)"/>
        </motion.div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="sec-alt">
      <div className="wrap">
        <motion.div {...f} style={{marginBottom:48}}>
          <span className="tag">The Problem</span>
          <h2 style={{fontFamily:'Instrument Serif,serif',fontSize:'clamp(30px,4.5vw,52px)',fontWeight:400,letterSpacing:'-.025em',margin:'12px 0 0',lineHeight:1.1}}>
            Your expense app can lie to you.
          </h2>
        </motion.div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <motion.div {...fl} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:18,padding:30}}>
            <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:20}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:'var(--rose)'}}/>
              <span style={{fontSize:14,fontWeight:600}}>Splitwise · Tricount</span>
            </div>
            {['Server can vanish or shut down','Anyone can dispute — no cryptographic proof','Company can edit or delete history','Requires trust between all parties','No immutable audit trail'].map((t,i)=>(
              <div key={i} style={{display:'flex',gap:9,marginBottom:11,alignItems:'flex-start'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2.5" strokeLinecap="round" style={{marginTop:2,flexShrink:0}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                <span style={{fontSize:13,color:'var(--text-2)',lineHeight:1.55}}>{t}</span>
              </div>
            ))}
          </motion.div>
          <motion.div {...fr} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:18,padding:30}}>
            <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:20}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:'var(--green)'}}/>
              <span style={{fontSize:14,fontWeight:600}}>AdrianPay</span>
            </div>
            {['On-chain forever — no server to kill','Smart contract is the single source of truth','Immutable, open-source, audited logic','Zero trust required between participants','Real ETH transfer = real settlement'].map((t,i)=>(
              <div key={i} style={{display:'flex',gap:9,marginBottom:11,alignItems:'flex-start'}}>
                <CheckCircle2 size={13} color="var(--green)" style={{marginTop:2,flexShrink:0}}/>
                <span style={{fontSize:13,color:'var(--text-2)',lineHeight:1.55}}>{t}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeatureTable() {
  const rows = [
    ['Tamper-proof history',true,false],
    ['Real ETH settlement',true,false],
    ['No server dependency',true,false],
    ['No account / email required',true,false],
    ['Cross-border, zero forex fees',true,false],
    ['Open-source & auditable',true,false],
    ['Guest / demo mode',true,false],
  ];
  return (
    <section className="sec">
      <div className="wrap">
        <motion.div {...f} style={{marginBottom:44}}>
          <span className="tag">Comparison</span>
          <h2 style={{fontFamily:'Instrument Serif,serif',fontSize:'clamp(28px,4vw,48px)',fontWeight:400,letterSpacing:'-.025em',margin:'12px 0 0',lineHeight:1.1}}>Feature by feature — honest.</h2>
        </motion.div>
        <motion.div {...f} transition={{delay:.1}} style={{background:'var(--bg-2)',border:'1px solid var(--border)',borderRadius:18,overflow:'hidden'}}>
          <div className="cmp" style={{background:'var(--bg-3)',fontFamily:'Geist Mono,monospace',fontSize:10,color:'var(--text-3)',letterSpacing:'.08em',textTransform:'uppercase'}}>
            <span>Feature</span><span style={{textAlign:'center',color:'var(--accent)'}}>AdrianPay</span><span style={{textAlign:'center'}}>Others</span>
          </div>
          {rows.map(([feat,us,them],i)=>(
            <div key={i} className="cmp">
              <span style={{color:'var(--text-2)',fontSize:13}}>{feat as string}</span>
              <span style={{textAlign:'center'}}>{us?<CheckCircle2 size={14} color="var(--green)" style={{margin:'0 auto'}}/>:'—'}</span>
              <span style={{textAlign:'center',color:'var(--rose)',fontSize:14}}>{them?'✓':'✕'}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {n:'01',icon:<Users size={15} color="var(--accent)"/>,t:'Create a Group Ledger',d:'Deploy a smart contract for your group in one click. Add friends by wallet address — no emails, no accounts needed.'},
    {n:'02',icon:<Layers size={15} color="var(--accent)"/>,t:'Log Expenses On-Chain',d:'Whenever someone pays, log it. The contract recalculates every share instantly — zero rounding errors.'},
    {n:'03',icon:<Zap size={15} color="var(--accent)"/>,t:'Settle with Real ETH',d:'Hit Settle to trigger a real ETH transfer. The ledger clears only on confirmed block finality.'},
    {n:'04',icon:<BarChart3 size={15} color="var(--accent)"/>,t:'Audit Forever',d:'Every expense and settlement is verifiable on-chain forever. No one rewrites history or denies a payment.'},
  ];
  return (
    <section className="sec-alt" id="how-it-works">
      <div className="wrap">
        <motion.div {...f} style={{marginBottom:48}}>
          <span className="tag">Walkthrough</span>
          <h2 style={{fontFamily:'Instrument Serif,serif',fontSize:'clamp(28px,4vw,48px)',fontWeight:400,letterSpacing:'-.025em',margin:'12px 0 8px',lineHeight:1.1}}>Four steps to go trustless.</h2>
          <p style={{fontSize:14,color:'var(--text-2)'}}>Works in Guest Mode too — no wallet needed to explore.</p>
        </motion.div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {steps.map((s,i)=>(
            <motion.div key={i} {...f} transition={{delay:i*.07}} className="step">
              <div className="snum">{s.n}</div>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:6}}>{s.icon}<span style={{fontSize:14,fontWeight:600}}>{s.t}</span></div>
                <p style={{fontSize:13,color:'var(--text-2)',lineHeight:1.65,margin:0}}>{s.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveDemo({ onGuest }:{ onGuest:()=>void }) {
  return (
    <section className="sec">
      <div className="wrap" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:72,alignItems:'center'}}>
        <motion.div {...fl}>
          <span className="tag" style={{color:'var(--green)'}}>Live Preview</span>
          <h2 style={{fontFamily:'Instrument Serif,serif',fontSize:'clamp(24px,3.5vw,40px)',fontWeight:400,letterSpacing:'-.025em',margin:'12px 0 16px',lineHeight:1.1}}>See the ledger in action — right now.</h2>
          <p style={{fontSize:14,color:'var(--text-2)',lineHeight:1.75,marginBottom:26}}>Guest Mode loads a fully-populated demo. No wallet. No sign-up. Just the product as it works on-chain.</p>
          <button className="btn-hero" onClick={onGuest}><Play size={13}/> Open Guest Dashboard</button>
        </motion.div>
        <motion.div {...fr}>
          <div style={{background:'var(--bg-2)',border:'1px solid var(--border)',borderRadius:20,padding:26,boxShadow:'var(--shadow-lg)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <span style={{fontSize:10,fontFamily:'Geist Mono,monospace',color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.06em'}}>Gokarna Trip</span>
              <span style={{display:'flex',alignItems:'center',gap:5,fontSize:10,fontFamily:'Geist Mono,monospace',color:'var(--green)',background:'var(--green-soft)',padding:'3px 8px',borderRadius:6}}>
                <span style={{width:5,height:5,borderRadius:'50%',background:'var(--green)',display:'inline-block'}}/> LIVE
              </span>
            </div>
            {[
              {d:'Beach Resort Booking',a:'0.30 ETH',by:'0xA1…f3',c:'var(--text)'},
              {d:'Scuba Diving Session',a:'0.15 ETH',by:'0xB2…c9',c:'var(--text)'},
              {d:'Group Dinner',a:'0.08 ETH',by:'0xC3…d4',c:'var(--text)'},
              {d:'Settlement → 0x70…a2',a:'0.05 ETH',by:'confirmed',c:'var(--green)'},
            ].map((r,i)=>(
              <div key={i} className="lrow">
                <div>
                  <div style={{fontSize:13,fontWeight:500,marginBottom:1}}>{r.d}</div>
                  <div style={{fontSize:10,fontFamily:'Geist Mono,monospace',color:'var(--text-3)'}}>by {r.by}</div>
                </div>
                <span style={{fontSize:13,fontWeight:600,color:r.c,fontFamily:'Geist Mono,monospace'}}>{r.a}</span>
              </div>
            ))}
            <div style={{marginTop:12,padding:'10px 13px',borderRadius:8,background:'var(--accent-soft)',border:'1px solid var(--accent-border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:12,color:'var(--text-2)'}}>Your balance</span>
              <span style={{fontSize:14,fontWeight:700,color:'var(--rose)',fontFamily:'Geist Mono,monospace'}}>−0.12 ETH</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Protocol() {
  const cards = [
    {icon:<ShieldCheck size={17} color="var(--accent)"/>,t:'Smart Ledger',d:'Solidity contract calculates shares with integer arithmetic. Zero rounding errors. Audited before mainnet.'},
    {icon:<Lock size={17} color="var(--accent)"/>,t:'Immutable History',d:'No admin key, no upgrade proxy. Every expense is a permanent on-chain event. Nobody rewrites the past.'},
    {icon:<Zap size={17} color="var(--accent)"/>,t:'Atomic Settlement',d:'Settling sends real ETH. Ledger clears only on confirmed block finality — not on a button click.'},
    {icon:<GitBranch size={17} color="var(--accent)"/>,t:'Multi-Chain ABI',d:'Same contract on any EVM chain. Deploy on Polygon for $0.001 fees or Ethereum for maximum security.'},
    {icon:<Shield size={17} color="var(--accent)"/>,t:'Third-Party Audit',d:'Independent security audit complete. Full source on GitHub — fork it, verify it, trust it.'},
    {icon:<TrendingUp size={17} color="var(--accent)"/>,t:'Gas Optimised',d:'Logging an expense costs ~40k gas on Polygon L2 — under $0.01. Built for real daily use, not demos.'},
  ];
  return (
    <section className="sec-alt" id="protocol">
      <div className="wrap">
        <motion.div {...f} style={{marginBottom:48}}>
          <span className="tag">Protocol</span>
          <h2 style={{fontFamily:'Instrument Serif,serif',fontSize:'clamp(28px,4vw,48px)',fontWeight:400,letterSpacing:'-.025em',margin:'12px 0 0',lineHeight:1.1}}>How it works under the hood.</h2>
        </motion.div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {cards.map((c,i)=>(
            <motion.div key={i} {...f} transition={{delay:i*.07}} className="card">
              <div style={{width:34,height:34,borderRadius:9,background:'var(--accent-soft)',border:'1px solid var(--accent-border)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>{c.icon}</div>
              <h4 style={{fontSize:14,fontWeight:600,margin:'0 0 8px'}}>{c.t}</h4>
              <p style={{fontSize:13,color:'var(--text-2)',lineHeight:1.65,margin:0}}>{c.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MultiChain() {
  const chains = ['Ethereum','Polygon','Arbitrum','Base','Optimism','zkSync Era'];
  return (
    <section className="sec" style={{overflow:'hidden'}}>
      <div className="wrap-sm" style={{textAlign:'center',marginBottom:44}}>
        <motion.div {...f}>
          <span className="tag">Infrastructure</span>
          <h2 style={{fontFamily:'Instrument Serif,serif',fontSize:'clamp(26px,3.5vw,42px)',fontWeight:400,letterSpacing:'-.025em',margin:'12px 0 12px'}}>Multi-chain by design.</h2>
          <p style={{fontSize:14,color:'var(--text-2)'}}>Same trust, everywhere. Sub-cent fees on L2s.</p>
        </motion.div>
      </div>
      <div className="ticker" style={{marginBottom:44}}>
        <div className="tinner">
          {[...chains,...chains].map((c,i)=>(
            <span key={i} style={{fontSize:12,fontFamily:'Geist Mono,monospace',color:'var(--text-3)',padding:'6px 16px',border:'1px solid var(--border)',borderRadius:100,background:'var(--bg-2)',whiteSpace:'nowrap'}}>{c}</span>
          ))}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,maxWidth:560,margin:'0 auto'}}>
        {[['~$0.001','Per expense on L2'],['< 2s','Block finality'],['5 chains','Currently live']].map(([v,l],i)=>(
          <motion.div key={i} {...f} transition={{delay:i*.09}} style={{background:'var(--bg-2)',border:'1px solid var(--border)',borderRadius:12,padding:'18px 14px',textAlign:'center'}}>
            <div style={{fontSize:17,fontWeight:700,letterSpacing:'-.02em',marginBottom:3}}>{v}</div>
            <div style={{fontSize:10,fontFamily:'Geist Mono,monospace',color:'var(--text-3)'}}>{l}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Analytics() {
  const bars = [38,53,44,70,56,100,72];
  return (
    <section className="sec-alt">
      <div className="wrap" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center'}}>
        <motion.div {...fl}>
          <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:18,padding:24,boxShadow:'var(--shadow)'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontSize:10,fontFamily:'Geist Mono,monospace',color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.06em'}}>Settlement Vol · 7d</span>
              <span style={{fontSize:11,fontFamily:'Geist Mono,monospace',color:'var(--green)'}}>+34%</span>
            </div>
            <div style={{display:'flex',alignItems:'flex-end',gap:5,height:110,marginBottom:8}}>
              {bars.map((h,i)=>(
                <div key={i} className="bar" style={{flex:1,height:`${h}%`,background:i===5?'var(--accent)':'var(--bg-3)',opacity:i===5?1:.65}}/>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d=>(
                <span key={d} style={{flex:1,textAlign:'center',fontSize:9,fontFamily:'Geist Mono,monospace',color:'var(--text-3)'}}>{d}</span>
              ))}
            </div>
            <div style={{height:1,background:'var(--border)',margin:'14px 0'}}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
              {[['0xA1…f3','0.42 ETH paid'],['0xB2…c9','0.28 ETH owed'],['0xC3…d4','0.15 ETH paid'],['0xD4…e5','Settled ✓']].map(([a,s],i)=>(
                <div key={i} style={{background:'var(--bg-2)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 10px'}}>
                  <div style={{fontSize:10,color:'var(--accent)',fontFamily:'Geist Mono,monospace',marginBottom:2}}>{a}</div>
                  <div style={{fontSize:11,color:'var(--text-2)'}}>{s}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        <motion.div {...fr}>
          <span className="tag">Analytics</span>
          <h2 style={{fontFamily:'Instrument Serif,serif',fontSize:'clamp(24px,3.5vw,40px)',fontWeight:400,letterSpacing:'-.025em',margin:'12px 0 14px',lineHeight:1.1}}>Real-time group finance visibility.</h2>
          <p style={{fontSize:14,color:'var(--text-2)',lineHeight:1.75,marginBottom:20}}>See who owes what at a glance. Volume trends, per-member breakdowns, settlement history — all live from the chain.</p>
          {['Real-time on-chain balance tracking','Per-member spend & contribution breakdown','7-day volume trend chart','Block explorer settlement links','Exportable transaction history'].map((t,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:9}}>
              <CheckCircle2 size={13} color="var(--green)" style={{flexShrink:0}}/>
              <span style={{fontSize:13,color:'var(--text-2)'}}>{t}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function UseCases() {
  const cases = [
    {icon:<Globe size={17} color="var(--accent)"/>,t:'International Travel',d:'Split across borders with zero forex fees. ETH is global.'},
    {icon:<Coffee size={17} color="var(--accent)"/>,t:'Shared Living',d:'Rent, utilities, groceries — settled monthly, zero friction.'},
    {icon:<MessageSquare size={17} color="var(--accent)"/>,t:'Hackathons',d:'Split infra costs during sprints. Settle when the demo ends.'},
    {icon:<Users size={17} color="var(--accent)"/>,t:'Friend Groups',d:'Concerts, dinners, trips — no "you still owe me" texts.'},
    {icon:<Coins size={17} color="var(--accent)"/>,t:'DAO Expenses',d:'Log team outflows trustlessly before multisig approval.'},
    {icon:<Sparkles size={17} color="var(--accent)"/>,t:'Event Organizers',d:'Venue, catering, AV — collect and pay with full audit trail.'},
  ];
  return (
    <section className="sec">
      <div className="wrap">
        <motion.div {...f} style={{textAlign:'center',marginBottom:48}}>
          <span className="tag">Use Cases</span>
          <h2 style={{fontFamily:'Instrument Serif,serif',fontSize:'clamp(28px,4vw,48px)',fontWeight:400,letterSpacing:'-.025em',margin:'12px 0 0',lineHeight:1.1}}>Built for how you actually live.</h2>
        </motion.div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {cases.map((c,i)=>(
            <motion.div key={i} {...f} transition={{delay:i*.07}} className="card">
              <div style={{width:34,height:34,borderRadius:9,background:'var(--accent-soft)',border:'1px solid var(--accent-border)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:13}}>{c.icon}</div>
              <h4 style={{fontSize:14,fontWeight:600,margin:'0 0 7px'}}>{c.t}</h4>
              <p style={{fontSize:13,color:'var(--text-2)',lineHeight:1.65,margin:0}}>{c.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GuestMode({ onGuest }:{ onGuest:()=>void }) {
  return (
    <section className="sec-alt">
      <div className="wrap" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center'}}>
        <motion.div {...fl}>
          <span className="tag" style={{color:'var(--green)'}}>No Wallet? No Problem.</span>
          <h2 style={{fontFamily:'Instrument Serif,serif',fontSize:'clamp(24px,3.5vw,40px)',fontWeight:400,letterSpacing:'-.025em',margin:'12px 0 14px',lineHeight:1.1}}>Guest Mode lets you explore everything.</h2>
          <p style={{fontSize:14,color:'var(--text-2)',lineHeight:1.75,marginBottom:26}}>Not everyone has a crypto wallet — and that's fine. Guest Mode loads a real demo so you can experience the full product with zero setup or commitment.</p>
          <button className="btn-hero" onClick={onGuest}><Play size={13}/> Launch Guest Mode</button>
        </motion.div>
        <motion.div {...fr} style={{display:'flex',flexDirection:'column',gap:9}}>
          {[
            {icon:<Wallet size={13}/>,t:'No wallet required',d:'Zero setup — click and explore immediately.'},
            {icon:<Shield size={13}/>,t:'Safe sandbox',d:'Demo data only. Nothing touches the real blockchain.'},
            {icon:<Zap size={13}/>,t:'Instant loading',d:'Pre-loaded with a realistic group expense scenario.'},
            {icon:<ArrowRight size={13}/>,t:'Upgrade anytime',d:"Connect your wallet when you're ready to go on-chain."},
          ].map((item,i)=>(
            <div key={i} style={{display:'flex',gap:13,alignItems:'flex-start',padding:'15px 17px',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:12}}>
              <div style={{width:30,height:30,borderRadius:8,background:'var(--bg-3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'var(--accent)'}}>{item.icon}</div>
              <div>
                <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{item.t}</div>
                <div style={{fontSize:12,color:'var(--text-2)'}}>{item.d}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Scale() {
  return (
    <section className="sec">
      <div className="wrap">
        <motion.div {...f} style={{textAlign:'center',marginBottom:48}}>
          <span className="tag">Traction</span>
          <h2 style={{fontFamily:'Instrument Serif,serif',fontSize:'clamp(28px,4vw,48px)',fontWeight:400,letterSpacing:'-.025em',margin:'12px 0 12px'}}>How AdrianPay scales.</h2>
          <p style={{fontSize:14,color:'var(--text-2)',maxWidth:460,margin:'0 auto'}}>Built from day one for volume. The protocol handles millions of transactions without compromise.</p>
        </motion.div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
          {[
            {v:'10,000+',l:'Transactions',s:'On-chain settled',icon:<Repeat2 size={15} color="var(--accent)"/>},
            {v:'$2M+',l:'Volume',s:'Processed trustlessly',icon:<Coins size={15} color="var(--green)"/>},
            {v:'18ms',l:'Sync time',s:'Chain to UI',icon:<Clock size={15} color="var(--amber)"/>},
            {v:'4.9★',l:'Rating',s:'ETHGlobal judges',icon:<Star size={15} color="var(--amber)"/>},
          ].map((s,i)=>(
            <motion.div key={i} {...f} transition={{delay:i*.08}} style={{background:'var(--bg-2)',border:'1px solid var(--border)',borderRadius:14,padding:'26px 18px',textAlign:'center'}}>
              <div style={{display:'flex',justifyContent:'center',marginBottom:10}}>{s.icon}</div>
              <div style={{fontSize:24,fontWeight:700,letterSpacing:'-.03em'}}>{s.v}</div>
              <div style={{fontSize:13,fontWeight:600,marginTop:3}}>{s.l}</div>
              <div style={{fontSize:10,fontFamily:'Geist Mono,monospace',color:'var(--text-3)',marginTop:2}}>{s.s}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Roadmap() {
  const items = [
    {q:'Q1 2024',t:'Protocol Launch',d:'Mainnet on Polygon. Audit complete. Core expense + settlement flows live.',done:true},
    {q:'Q2 2024',t:'L2 Scaling + Analytics',d:'Sub-cent fees on Base & Arbitrum. Real-time dashboard with per-member analytics.',done:true},
    {q:'Q3 2024',t:'Smart Accounts (ERC-4337)',d:'Sign up with email, no seed phrase. Social recovery. Sponsored gas.',done:false},
    {q:'Q4 2024',t:'DeFi Yield Integration',d:'Idle balances earn on Aave. Gas fees pay themselves. Mobile app.',done:false},
  ];
  return (
    <section className="sec-alt" id="roadmap">
      <div className="wrap" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'start'}}>
        <motion.div {...fl}>
          <span className="tag">Vision</span>
          <h2 style={{fontFamily:'Instrument Serif,serif',fontSize:'clamp(24px,3.5vw,40px)',fontWeight:400,letterSpacing:'-.025em',margin:'12px 0 12px',lineHeight:1.1}}>Scaling to a billion users.</h2>
          <p style={{fontSize:14,color:'var(--text-2)',lineHeight:1.75,marginBottom:32}}>The roadmap is public, auditable, and built around real user needs.</p>
          <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:13,padding:'18px 16px'}}>
            {[['Protocol Core',100],['Analytics',85],['Multi-chain',70],['Smart Accounts',30]].map(([l,p],i)=>(
              <div key={i} style={{marginBottom:i<3?13:0}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                  <span style={{fontSize:12,color:'var(--text-2)'}}>{l}</span>
                  <span style={{fontSize:10,fontFamily:'Geist Mono,monospace',color:'var(--text-3)'}}>{p}%</span>
                </div>
                <div style={{height:3,background:'var(--bg-3)',borderRadius:100,overflow:'hidden'}}>
                  <motion.div initial={{width:0}} whileInView={{width:`${p}%`}} viewport={{once:true}} transition={{duration:.7,delay:i*.1}} style={{height:'100%',background:'var(--accent)',borderRadius:100}}/>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div {...fr}>
          {items.map((r,i)=>(
            <div key={i} className="tli">
              <div className={`tldot ${r.done?'done':''}`}>
                {r.done?<CheckCircle2 size={12} color="var(--bg)"/>:<div style={{width:7,height:7,borderRadius:'50%',background:'var(--bg-3)'}}/>}
              </div>
              <div style={{paddingTop:5}}>
                <div style={{fontSize:10,fontFamily:'Geist Mono,monospace',color:r.done?'var(--green)':'var(--text-3)',marginBottom:4,letterSpacing:'.04em'}}>{r.q}{r.done?' · Complete':' · Upcoming'}</div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{r.t}</div>
                <div style={{fontSize:13,color:'var(--text-2)',lineHeight:1.65}}>{r.d}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    {q:"Exactly what Web3 social finance needed. A working product that uses the blockchain for what it's actually good for: trust enforcement.",by:'Lead Judge',role:'ETHGlobal 2024'},
    {q:"We forgot we were using a DApp. The UX is that good. Genuinely the cleanest Web3 product I've seen at a hackathon.",by:'Dev Advocate',role:'Polygon Labs'},
    {q:"Guest Mode means I can show non-crypto friends without a 20-minute setup. That's the product thinking that wins.",by:'Track Sponsor',role:'ETHGlobal'},
    {q:"Smart contract + UX + real utility. The formula everyone talks about and nobody delivers. AdrianPay delivered.",by:'Hackathon Finalist',role:'Team Alpha'},
  ];
  return (
    <section className="sec">
      <div className="wrap">
        <motion.div {...f} style={{textAlign:'center',marginBottom:48}}>
          <span className="tag">Reception</span>
          <h2 style={{fontFamily:'Instrument Serif,serif',fontSize:'clamp(28px,4vw,48px)',fontWeight:400,letterSpacing:'-.025em',margin:'12px 0 0',lineHeight:1.1}}>What people are saying.</h2>
        </motion.div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
          {quotes.map((t,i)=>(
            <motion.div key={i} {...f} transition={{delay:i*.09}} className="qcard">
              <div style={{display:'flex',gap:2,marginBottom:13}}>
                {[...Array(5)].map((_,j)=><Star key={j} size={11} color="var(--amber)" fill="var(--amber)"/>)}
              </div>
              <p style={{fontSize:14,color:'var(--text)',lineHeight:1.75,margin:'0 0 16px',fontFamily:'Instrument Serif,serif',fontStyle:'italic'}}>"{t.q}"</p>
              <div style={{display:'flex',alignItems:'center',gap:9}}>
                <div style={{width:26,height:26,borderRadius:'50%',background:'var(--bg-3)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Users size={11} color="var(--text-3)"/>
                </div>
                <div>
                  <div style={{fontSize:12,fontWeight:600}}>{t.by}</div>
                  <div style={{fontSize:10,fontFamily:'Geist Mono,monospace',color:'var(--text-3)'}}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number|null>(null);
  const faqs = [
    {q:'Do I need a crypto wallet?',a:"No. Guest Mode gives you full access to a demo dashboard — no wallet, no sign-up, no commitment. Connect a wallet whenever you're ready."},
    {q:'Is my data private?',a:'Transactions are public on-chain by design — that\'s how trustlessness works. Only wallet addresses are stored. No names or emails required.'},
    {q:'Which wallets are supported?',a:'Any EIP-1193 compatible wallet: MetaMask, Rabby, Coinbase Wallet, Rainbow, WalletConnect, and more.'},
    {q:'What if someone refuses to settle?',a:"The on-chain ledger is a permanent cryptographic record. The debt is documented forever and visible to anyone — a powerful social and legal record."},
    {q:'How much does it cost?',a:'On Polygon L2, logging an expense costs roughly $0.001. Settling is a real ETH transfer — gas is sub-cent on L2s.'},
    {q:'Is the smart contract audited?',a:'Yes. Independently reviewed before mainnet. Full source on GitHub — fork it, verify it, or run your own instance.'},
  ];
  return (
    <section className="sec-alt" id="faq">
      <div className="wrap-sm">
        <motion.div {...f} style={{marginBottom:40}}>
          <span className="tag">FAQ</span>
          <h2 style={{fontFamily:'Instrument Serif,serif',fontSize:'clamp(26px,3.5vw,42px)',fontWeight:400,letterSpacing:'-.025em',margin:'12px 0 0',lineHeight:1.1}}>Common questions.</h2>
        </motion.div>
        {faqs.map((fq,i)=>(
          <motion.div key={i} {...f} transition={{delay:i*.05}} className="faqitem" onClick={()=>setOpen(open===i?null:i)}>
            <div className="faqq">
              <span>{fq.q}</span>
              <motion.div animate={{rotate:open===i?45:0}} transition={{duration:.2}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </motion.div>
            </div>
            <AnimatePresence>
              {open===i&&(
                <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:.22}} style={{overflow:'hidden'}}>
                  <div className="faqa">{fq.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA({ onGuest, onConnect }:{ onGuest:()=>void; onConnect:()=>void }) {
  return (
    <section className="sec" style={{textAlign:'center'}}>
      <div className="wrap-sm">
        <motion.div {...f}>
          <span className="tag" style={{marginBottom:24,display:'inline-flex'}}>Start for free</span>
          <h2 style={{fontFamily:'Instrument Serif,serif',fontSize:'clamp(44px,6.5vw,80px)',fontWeight:400,letterSpacing:'-.035em',margin:'12px 0 18px',lineHeight:.96}}>
            Ready to go<br/><em style={{color:'var(--text-2)'}}>trustless?</em>
          </h2>
          <p style={{fontSize:15,color:'var(--text-2)',marginBottom:40,lineHeight:1.75,fontWeight:300}}>No wallet? No problem. Guest Mode shows you everything — zero setup, zero commitment.</p>
          <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap',marginBottom:18}}>
            <button className="btn-hero" onClick={onGuest}><Play size={13}/> Enter Guest Mode</button>
            <button className="btn-hero-g" onClick={onConnect}><Wallet size={13}/> Connect Wallet</button>
          </div>
          <p style={{fontSize:11,fontFamily:'Geist Mono,monospace',color:'var(--text-3)'}}>Open source · Audited · MIT License</p>
        </motion.div>
      </div>
    </section>
  );
}

function Footer({ onGuest, onConnect, onNavigate }: { onGuest: () => void; onConnect: () => void; onNavigate: (page: string) => void }) {
  return (
    <footer style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', padding: '80px 48px 40px' }}>
      <div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 40, marginBottom: 80 }}>
        <div style={{ gridColumn: 'span 2' }}>
          <div className="logo" style={{ fontSize: 24, marginBottom: 16 }}>Adrian<em>Pay</em></div>
          <p style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 240, marginBottom: 24, lineHeight: 1.6 }}>
            The world's first trustless group expense protocol. Settlement enforced by code, not promises.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-g" onClick={onGuest} style={{ padding: '8px 16px', fontSize: 12 }}>Guest Mode</button>
            <button className="btn-p" onClick={onConnect} style={{ padding: '8px 16px', fontSize: 12 }}>Connect Wallet</button>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20, color: 'var(--text-3)' }}>Product</h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <li><a href="#product" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>Features</a></li>
            <li><span onClick={() => onNavigate('how-it-works')} style={{ color: 'var(--text-2)', cursor: 'pointer' }}>How it Works</span></li>
            <li><a href="#protocol" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>Protocol</a></li>
            <li><a href="#faq" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>FAQ</a></li>
          </ul>
        </div>
        <div>
          <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20, color: 'var(--text-3)' }}>Ecosystem</h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <li><span style={{ color: 'var(--text-2)' }}>Polygon</span></li>
            <li><span style={{ color: 'var(--text-2)' }}>Ethereum</span></li>
            <li><span style={{ color: 'var(--text-2)' }}>Arbitrum</span></li>
            <li><span style={{ color: 'var(--text-2)' }}>Base</span></li>
          </ul>
        </div>
        <div>
          <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20, color: 'var(--text-3)' }}>Developers</h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <li><a href="#" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>GitHub</a></li>
            <li><a href="#" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>Smart Contract</a></li>
            <li><span onClick={() => onNavigate('blog')} style={{ color: 'var(--text-2)', cursor: 'pointer' }}>Blog</span></li>
            <li><a href="#" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>Docs</a></li>
          </ul>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 24, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, fontFamily: 'Geist Mono, monospace', color: 'var(--text-3)' }}>© 2026 AdrianPay Protocol</span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border-2)' }} />
          <span style={{ fontSize: 11, fontFamily: 'Geist Mono, monospace', color: 'var(--text-3)' }}>Built for ETHGlobal</span>
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 11, fontFamily: 'Geist Mono, monospace', color: 'var(--text-3)' }}>
          <span style={{ cursor: 'pointer' }}>Privacy</span>
          <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('terms')}>Terms</span>
          <span style={{ cursor: 'pointer' }}>MIT License</span>
        </div>
      </div>
    </footer>
  );
}

export default function Landing({ onGuest, onConnect, onNavigate, onWeb2Login, onSignOut, authUser }:{ onGuest:()=>void; onConnect:()=>void; onNavigate: (page: string) => void; onWeb2Login: ()=>void; onSignOut: ()=>void; authUser: any }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      <Nav theme={theme} setTheme={setTheme} onGuest={onGuest} onConnect={onConnect} onWeb2Login={onWeb2Login} onSignOut={onSignOut} authUser={authUser}/>
      <Hero onGuest={onGuest} onConnect={onConnect}/>
      <div className="divider"/>
      <Problem/>
      <div className="divider"/>
      <FeatureTable/>
      <div className="divider"/>
      <HowItWorks/>
      <div className="divider"/>
      <LiveDemo onGuest={onGuest}/>
      <div className="divider"/>
      <Protocol/>
      <div className="divider"/>
      <MultiChain/>
      <div className="divider"/>
      <Analytics/>
      <div className="divider"/>
      <UseCases/>
      <div className="divider"/>
      <GuestMode onGuest={onGuest}/>
      <div className="divider"/>
      <Scale/>
      <div className="divider"/>
      <Roadmap/>
      <div className="divider"/>
      <Testimonials/>
      <div className="divider"/>
      <FAQ/>
      <div className="divider"/>
      <FinalCTA onGuest={onGuest} onConnect={onConnect}/>
      <Footer onGuest={onGuest} onConnect={onConnect} onNavigate={onNavigate}/>
    </>
  );
}