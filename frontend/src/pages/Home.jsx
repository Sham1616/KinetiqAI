import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Activity, MessageSquare, ArrowRight, Zap, Target, HeartPulse, BrainCircuit, Scan, Settings, LineChart, Users, Monitor, Server, Database, RefreshCw, Dna, ClipboardList, TrendingUp } from 'lucide-react';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
    }
  };

  return (
    <div className="home-container">
      {/* Navbar */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="navbar"
      >
        <div className="nav-logo">
          <Shield size={24} className="text-teal" />
          <span>KinetiqAI</span>
        </div>
        <ul className="nav-links">
          <li><a href="#purpose">Our Purpose</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#technology">Technology</a></li>
        </ul>
        <div className="nav-cta">
          <Link to="/auth" className="btn btn-outline btn-sm">Sign In</Link>
          <Link to="/auth" className="btn btn-primary btn-sm" style={{ marginLeft: '12px' }}>Start Recovery</Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-split">
          {/* Left Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="hero-content"
          >
            <motion.div variants={itemVariants} className="badge">
              <div className="badge-dot"></div>
              Precision AI Rehabilitation
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="hero-title">
              Recovery <span className="gradient-text">Redefined</span><br/>by AI
            </motion.h1>
            
            <motion.p variants={itemVariants} className="hero-desc">
              Your injury is unique. Your recovery should be too. KinetiqAI synthesizes clinical data with your daily progress to engineer a safer, faster path back to performance.
            </motion.p>

            <motion.div variants={itemVariants} className="hero-actions">
              <Link to="/auth" className="btn btn-primary">Begin Your Assessment <ArrowRight size={18} /></Link>
            </motion.div>

            <motion.div variants={itemVariants} style={{ marginTop: '32px' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>TRUSTED INFRASTRUCTURE</p>
              <div style={{ display: 'flex', gap: '24px', opacity: 0.6, color: 'var(--text)' }}>
                <Shield size={24} /> <Activity size={24} /> <HeartPulse size={24} />
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual (Project Purpose / Value Prop) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            className="hero-visual"
            id="purpose"
          >
             <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                   <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>The Core Purpose</h3>
                   <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Bridge the gap between clinic and home.</p>
                </div>

                <div className="grid-2" style={{ gap: '16px' }}>
                   <PurposeStep 
                      icon={<Scan className="text-teal" />} 
                      title="1. Assessment" 
                      desc="Deep-dive analyze of your specific injury and age."
                      delay={0.1}
                   />
                   <PurposeStep 
                      icon={<BrainCircuit className="text-teal" />} 
                      title="2. Synthesis" 
                      desc="AI engineers a protocol based on clinical data."
                      delay={0.3}
                   />
                   <PurposeStep 
                      icon={<Settings className="text-teal" />} 
                      title="3. Adaptation" 
                      desc="Plan evolves daily based on your pain feedback."
                      delay={0.5}
                   />
                   <PurposeStep 
                      icon={<LineChart className="text-teal" />} 
                      title="4. Evolution" 
                      desc="Track measurable gains toward full mobility."
                      delay={0.7}
                   />
                </div>

                <div style={{ marginTop: '10px', padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '16px', border: '1px dashed var(--teal)', textAlign: 'center' }}>
                   <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--teal)' }}>Result: Accelerated, Data-Backed Healing</span>
                </div>
             </div>
          </motion.div>
        </div>
      </main>


      {/* How It Works Section */}
      <section id="how-it-works" style={{ padding: '80px 20px', scrollMarginTop: '80px', background: 'transparent' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <div className="badge" style={{ margin: '0 auto 16px' }}>
              <div className="badge-dot"></div>
              Step-by-Step Process
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text)' }}>
              How KinetiqAI Works
            </h2>
            <p style={{ maxWidth: '560px', margin: '0 auto', color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.7 }}>
              From your first login to a full recovery — a four-step clinical journey built around you.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {[
              { step: '01', title: 'Create Your Profile', desc: 'Tell us your injury type, activity level, and current pain score. Takes less than 60 seconds.', icon: <Dna className="text-teal" /> },
              { step: '02', title: 'Get Your AI Plan', desc: 'KinetiqAI generates a personalized, evidence-based protocol tailored to your exact recovery stage.', icon: <Zap className="text-teal" fill="var(--teal)" /> },
              { step: '03', title: 'Log Daily Sessions', desc: 'After each session, sync your pain level and completion rate. Our AI reads your body\'s feedback.', icon: <ClipboardList className="text-teal" /> },
              { step: '04', title: 'Plan Evolves With You', desc: 'Every check-in adapts your next-day plan — fewer plateaus, faster progression, safer recovery.', icon: <TrendingUp className="text-teal" /> },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.7 }}
                whileHover={{ y: -4 }}
                className="card"
                style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--teal)', letterSpacing: '1px', marginBottom: '12px' }}>STEP {item.step}</div>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text)' }}>{item.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</p>
                <div style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '3.5rem', fontWeight: 900, color: 'var(--border)' }}>{item.step}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology / Features Section */}
      <section id="technology" style={{ padding: '80px 20px', scrollMarginTop: '80px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <div className="badge" style={{ margin: '0 auto 16px' }}>
            <div className="badge-dot"></div>
            Under the Hood
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text)' }}>Clinical-Grade Technology</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--muted)', lineHeight: 1.7 }}>We leverage the same logic used in professional rehabilitation centers to bring expert oversight directly to your recovery journey.</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
          <FeatureCard icon={<Shield size={24} />} title="Secure & Private" desc="Your medical data is encrypted and handled with clinical-standard privacy protocols." />
          <FeatureCard icon={<Zap size={24} />} title="Instant Adaptation" desc="No more waiting for the next check-up. Your plan adapts to your body's response today." />
          <FeatureCard icon={<MessageSquare size={24} />} title="Expert AI Support" desc="Get immediate answers to your recovery questions from our clinical AI model." />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 40px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text)' }}>
            <Shield className="text-teal" /> KinetiqAI
         </div>
         <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>&copy; 2026 KinetiqAI. Leading the frontier of AI rehabilitation.</p>
      </footer>
    </div>
  );
};

const PurposeStep = ({ icon, title, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.8 }}
    style={{ padding: '16px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}
  >
     <div style={{ marginBottom: '12px' }}>{icon}</div>
     <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text)' }}>{title}</h4>
     <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.4 }}>{desc}</p>
  </motion.div>
);

const FeatureCard = ({ icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="card" 
    style={{ padding: '32px' }}
  >
    <div style={{ marginBottom: '20px', color: 'var(--teal)' }}>{icon}</div>
    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>{title}</h3>
    <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{desc}</p>
  </motion.div>
);

export default Home;
