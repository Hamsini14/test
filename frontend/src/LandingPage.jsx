import React from 'react';
import { 
  ShieldCheck, 
  Database, 
  Lock, 
  Zap, 
  ArrowRight, 
  LineChart, 
  Users, 
  Search,
  Scale
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="glass-card p-8 group">
    <div className="bg-indigo-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
      <Icon className="w-8 h-8 text-indigo-400" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
  </div>
);

const LandingPage = ({ onEnter }) => {
  return (
    <div className="min-h-screen text-slate-200 premium-scrollbar overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">
            AI Audit <span className="text-indigo-500">PRO</span>
          </span>
        </div>
        <button 
          onClick={onEnter}
          className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full transition-all shadow-xl shadow-indigo-600/20"
        >
          Launch Protocol
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] mb-12 animate-float">
          <Zap className="w-3 h-3 text-indigo-400" />
          Powered by Algorand Blockchain
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-gradient max-w-5xl leading-[1.05]">
          Immutable Transparency for the 
          <span className="text-indigo-500 block">AI-Driven World.</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          The definitive open-source framework for auditing AI executions, verifying model behavior, and ensuring algorithmic fairness with zero-tamper blockchain anchoring.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6">
          <button 
            onClick={onEnter}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 px-12 rounded-[24px] transition-all text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/20"
          >
            Access Dashboard
          </button>
        </div>

        {/* Hero Background Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] -z-10"></div>
      </section>

      {/* Stats/Social Proof */}
      <section className="py-20 border-y border-white/5 bg-[#0a0a0c]/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: 'Integrity Rating', value: '100%' },
            { label: 'Block Time', value: '3.4s' },
            { label: 'Audits Run', value: '42k+' },
            { label: 'Drift Detected', value: '0.01%' },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-4xl font-black text-white mb-2 tracking-tighter">{stat.value}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 text-white">Comprehensive AI Accountability.</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Built from the ground up to solve the "black box" problem in modern machine learning systems.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Database}
            title="Immutable Records"
            description="Every AI decision is hashed and anchored to the Algorand blockchain, creating a permanent, verifiable audit trail that cannot be altered."
          />
          <FeatureCard 
            icon={Scale}
            title="Fairness Engine"
            description="Automatically run counterfactual tests and analyze rejection rates across demographic segments to detect and prevent algorithmic bias."
          />
          <FeatureCard 
            icon={LineChart}
            title="Behavioral Fingerprinting"
            description="Real-time monitoring of model drift and stability. Our circuit breaker halts execution if suspicious behavioral instability is detected."
          />
          <FeatureCard 
            icon={Lock}
            title="Zero-Tamper Verification"
            description="Cryptographically verify any execution record against its blockchain anchor at the touch of a button to ensure data integrity."
          />
          <FeatureCard 
            icon={Users}
            title="Audit-Ready UI"
            description="A high-fidelity dashboard designed for auditors and compliance teams to visualize risk landscape and drill down into specific decisions."
          />
          <FeatureCard 
            icon={Search}
            title="Open protocol"
            description="Extensible architecture allowing you to plug in any custom AI engine—from loan processing to high-frequency trading."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto glass rounded-[64px] p-20 text-center relative overflow-hidden glow-indigo">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-8 text-white tracking-tighter">Ready to secure your AI future?</h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">Join the new standard for trust in artificial intelligence. Deploy AI Audit Pro today.</p>
            <button 
              onClick={onEnter}
              className="bg-white text-black hover:bg-slate-200 font-black py-6 px-16 rounded-[24px] transition-all text-sm uppercase tracking-widest shadow-2xl"
            >
              Start Auditing Now
            </button>
          </div>
          {/* Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          © 2026 AI Accountability Framework • Hackathon Submission
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
