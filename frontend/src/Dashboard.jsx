import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Activity, Database,
  CheckCircle2, AlertTriangle, Blocks, TrendingUp, Bug, X,
  Users, Target, BarChart3, Zap
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

// Backend API endpoint
const API_BASE = `http://${window.location.hostname}:8000/api`;

const DEFAULT_INPUT = {
  credit_score: 700,
  income: 60000,
  loan_amount: 20000,
  existing_debt: 5000,
  employment_status: 'employed',
  loan_term: 36,
};

const Dashboard = ({ onLogout }) => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    total_applicants: 0,
    average_credit_score: 0,
    loan_approval_rate: 0,
    credit_score_distribution: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab ] = useState('overview'); // overview | engine | audit
  const [systemStatus, setSystemStatus] = useState('SAFE');
  const [fairnessData, setFairnessData] = useState(null);
  const [loadingFairness, setLoadingFairness] = useState(false);
  
  const [formData, setFormData] = useState(DEFAULT_INPUT);
  const [tamperingRecord, setTamperingRecord] = useState(null);
  const [tamperForm, setTamperForm] = useState({ 
    decision: '', 
    confidence: 0,
    income: 0,
    loan_amount: 0,
    existing_debt: 0,
    employment_status: 'employed',
    loan_term: 36
  });

  const [stockFormData, setStockFormData] = useState({ ticker: 'AAPL' });
  const [stockRecords, setStockRecords] = useState([]);
  const [lastStockResult, setLastStockResult] = useState(null);
  const [stockTamperingRecord, setStockTamperingRecord] = useState(null);
  const [stockTamperForm, setStockTamperForm] = useState({
    decision: '',
    confidence: 0,
    current_price: 0,
    ma_50: 0,
    rsi_14: 0
  });

  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(null);
  const [replayResult, setReplayResult] = useState(null);
  const [replaying, setReplaying] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [stockHistory, setStockHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [auditRes, stockRes, statusRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/audits`),
        fetch(`${API_BASE}/stock/audits`),
        fetch(`${API_BASE}/system/status`),
        fetch(`${API_BASE}/stats`),
      ]);
      if (auditRes.ok) setRecords(await auditRes.json());
      if (stockRes.ok) setStockRecords(await stockRes.json());
      if (statusRes.ok) setSystemStatus((await statusRes.json()).status);
      if (statsRes.ok) setStats(await statsRes.json());
      fetchFairnessData();
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const fetchFairnessData = async () => {
    try {
      const res = await fetch(`${API_BASE}/fairness/analysis`);
      if (res.ok) setFairnessData(await res.json());
    } catch (err) {
      console.error('Fairness fetch error:', err);
    }
  };

  const fetchStockHistory = async (ticker) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE}/stock/history/${ticker}`);
      if (res.ok) {
        const data = await res.json();
        setStockHistory(data);
      }
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview' && stockFormData.ticker) {
      fetchStockHistory(stockFormData.ticker);
    }
  }, [activeTab, stockFormData.ticker]);

  const verifyRecord = async (decisionId) => {
    setVerifying(decisionId);
    setVerifyResult(null);
    try {
      const res = await fetch(`${API_BASE}/verify/${decisionId}`, { method: 'POST' });
      const data = await res.json();
      setVerifyResult({ id: decisionId, ...data });
      setTimeout(() => setVerifyResult(null), 8000);
    } catch (err) {
      console.error('Verify error:', err);
    } finally {
      setVerifying(null);
    }
  };

  const replayDecision = async (decisionId) => {
    setReplaying(decisionId);
    setReplayResult(null);
    try {
      const res = await fetch(`${API_BASE}/replay/${decisionId}`, { method: 'POST' });
      const data = await res.json();
      setReplayResult({ id: decisionId, ...data });
      // Keep it open until manually dismissed, or auto dismiss after 10s
    } catch (err) {
      console.error('Replay error:', err);
      setReplayResult({ error: true, message: "Failed to connect to backend for replay." });
    } finally {
      setReplaying(null);
    }
  };

  const verifyStockRecord = async (decisionId) => {
    setVerifying(decisionId);
    setVerifyResult(null);
    try {
      const res = await fetch(`${API_BASE}/stock/verify/${decisionId}`, { method: 'POST' });
      const data = await res.json();
      setVerifyResult({ id: decisionId, ...data });
      setTimeout(() => setVerifyResult(null), 8000);
    } catch (err) {
      console.error('Verify error:', err);
    } finally {
      setVerifying(null);
    }
  };

  const replayStockDecision = async (decisionId) => {
    setReplaying(decisionId);
    setReplayResult(null);
    try {
      const res = await fetch(`${API_BASE}/stock/replay/${decisionId}`, { method: 'POST' });
      const data = await res.json();
      setReplayResult({ id: decisionId, ...data });
    } catch (err) {
      console.error('Replay error:', err);
      setReplayResult({ error: true, message: "Failed to connect to backend for replay." });
    } finally {
      setReplaying(null);
    }
  };

  const runDecision = async () => {
    setSubmitting(true);
    setLastResult(null);
    try {
      const payload = {
        ...formData,
        credit_score: parseInt(formData.credit_score),
        income: parseFloat(formData.income),
        loan_amount: parseFloat(formData.loan_amount),
        existing_debt: parseFloat(formData.existing_debt),
        loan_term: parseInt(formData.loan_term),
      };
      const res = await fetch(`${API_BASE}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Error: ${data.detail}`);
      } else {
        setLastResult(data);
        await fetchData();
        // Commented out automatic tab switch as requested
        // setActiveTab('audit');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const runStockDecision = async () => {
    setSubmitting(true);
    setLastStockResult(null);
    try {
      const res = await fetch(`${API_BASE}/stock/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockFormData),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Error: ${data.detail}`);
      } else {
        setLastStockResult(data);
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const openTamperModal = (record) => {
    setTamperingRecord(record);
    setTamperForm({
      decision: record.decision === 'Loan Approved' ? 'Loan Rejected' : 'Loan Approved',
      confidence: parseFloat((1.0 - record.confidence).toFixed(2)),
      income: record.income || 0,
      loan_amount: record.loan_amount || 0,
      existing_debt: record.existing_debt || 0,
      employment_status: record.employment_status || 'employed',
      loan_term: record.loan_term || 36
    });
  };

  const handleTamper = async () => {
    if (!tamperingRecord) return;
    try {
      const res = await fetch(`${API_BASE}/tamper/${tamperingRecord.decision_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tamperForm),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || 'Tamper failed');
        return;
      }
      await fetchData();
      setTamperingRecord(null);
    } catch (err) {
      console.error('Tamper error:', err);
    }
  };

  const openStockTamperModal = (record) => {
    setStockTamperingRecord(record);
    setStockTamperForm({
      decision: record.decision === 'BUY' ? 'SELL' : 'BUY',
      confidence: parseFloat((1.0 - record.confidence).toFixed(2)),
      current_price: record.current_price || 0,
      ma_50: record.ma_50 || 0,
      rsi_14: record.rsi_14 || 0
    });
  };

  const handleStockTamper = async () => {
    if (!stockTamperingRecord) return;
    try {
      const res = await fetch(`${API_BASE}/stock/tamper/${stockTamperingRecord.decision_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockTamperForm),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || 'Tamper failed');
        return;
      }
      await fetchData();
      setStockTamperingRecord(null);
    } catch (err) {
      console.error('Tamper error:', err);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'engine', label: 'Loan Engine', icon: <Activity className="w-4 h-4" /> },
    { id: 'stock_engine', label: 'Stock AI Engine', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Log', icon: <Blocks className="w-4 h-4" /> },
    { id: 'stock_audit', label: 'Stock Audit Log', icon: <Database className="w-4 h-4" /> },
    { id: 'fairness', label: 'Fairness Panel', icon: <Target className="w-4 h-4" /> }
  ];

  const downloadCSV = () => {
    let headers, rows, filename;

    if (activeTab === 'stock_audit' || (activeTab !== 'audit' && stockRecords.length > 0 && records.length === 0)) {
        // Stock CSV
        headers = ["Decision ID", "Timestamp", "Ticker", "Price", "MA50", "RSI14", "Decision", "Confidence", "Status", "Execution Hash"];
        rows = stockRecords.map(rec => [
            `"${rec.decision_id}"`, `"${new Date(rec.timestamp).toLocaleString()}"`, `"${rec.ticker}"`, `"${rec.current_price}"`, `"${rec.ma_50}"`, `"${rec.rsi_14}"`, `"${rec.decision}"`, `"${(rec.confidence * 100).toFixed(2)}%"`, `"${rec.status}"`, `"${rec.execution_hash}"`
        ]);
        filename = `Stock_AI_Audit_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
        // Loan CSV
        if (records.length === 0) return;
        headers = ["Decision ID", "Timestamp", "Model", "Score", "Income", "Amount", "Debt", "Employment", "Term", "Decision", "Confidence", "Status", "Execution Hash"];
        rows = records.map(rec => [
            `"${rec.decision_id}"`, `"${new Date(rec.timestamp).toLocaleString()}"`, `"${rec.model_version}"`, `"${rec.credit_score}"`, `"${rec.income}"`, `"${rec.loan_amount}"`, `"${rec.existing_debt}"`, `"${rec.employment_status}"`, `"${rec.loan_term}"`, `"${rec.decision}"`, `"${(rec.confidence * 100).toFixed(2)}%"`, `"${rec.status}"`, `"${rec.execution_hash}"`
        ]);
        filename = `Loan_AI_Audit_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.style.display = 'none'; a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    const base = "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border backdrop-blur-md transition-all duration-500 shadow-lg";
    switch (status) {
      case 'Verified': return <span className={`${base} bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10`}><ShieldCheck className="w-4 h-4 text-emerald-500"/> Verified</span>;
      case 'Anchored': return <span className={`${base} bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-indigo-500/10`}><Blocks className="w-4 h-4 text-indigo-500"/> Anchored</span>;
      case 'Anchoring': return <span className={`${base} bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse shadow-amber-500/10`}><Activity className="w-4 h-4 text-amber-500"/> Anchoring</span>;
      case 'Tampering Detected': return <span className={`${base} bg-rose-500/10 text-rose-400 border-rose-500/20 animate-bounce shadow-rose-500/20 glow-rose`}><AlertTriangle className="w-4 h-4 text-rose-500"/> Breach Detected</span>;
      default: return <span className={`${base} bg-white/5 text-slate-400 border-white/10`}>{status}</span>;
    }
  };

  const labelClass = 'block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3';
  const fieldClass = 'w-full px-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/[0.05] outline-none text-sm font-bold text-white transition-all backdrop-blur-md';

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-8 font-sans selection:bg-indigo-500/30 premium-scrollbar">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-16 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-4 mb-3">
             <div className="bg-indigo-600 p-3 rounded-2xl shadow-2xl shadow-indigo-600/20 glow-indigo">
                <ShieldCheck className="w-8 h-8 text-white" />
             </div>
             <h1 className="text-4xl font-black text-white tracking-tighter">AI Audit <span className="text-indigo-500">PRO</span></h1>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Immutable Accountability Protocol v2.4</p>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={downloadCSV}
            className="group bg-white/5 hover:bg-white/10 text-white font-black py-4 px-8 rounded-[24px] border border-white/5 shadow-2xl transition-all duration-300 flex items-center gap-3 text-xs uppercase tracking-widest backdrop-blur-md"
          >
            <Database className="w-4 h-4 group-hover:scale-110 transition-transform text-indigo-400" />
            Export Audit Trial
          </button>

          <button
            onClick={onLogout}
            className="group bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 font-black py-4 px-8 rounded-[24px] border border-rose-500/20 shadow-2xl transition-all duration-300 flex items-center gap-3 text-xs uppercase tracking-widest backdrop-blur-md"
          >
            <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Exit Protocol
          </button>

          <div className={`px-8 py-4 rounded-[24px] font-black flex items-center gap-3 shadow-2xl border transition-all backdrop-blur-md ${
              systemStatus === 'SAFE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
            }`}>
            <div className={`w-3 h-3 rounded-full ${systemStatus === 'SAFE' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'}`}></div>
            <span className="uppercase tracking-[0.2em] text-[10px]">{systemStatus === 'SAFE' ? 'SAFE OPERATIONAL' : 'SYSTEM HALTED'}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-12">
        {/* Suspicious Behavior Alert */}
        {stats.behavior_analysis?.is_suspicious && (
          <div className="bg-rose-600/10 p-8 rounded-[40px] shadow-2xl shadow-rose-900/10 text-white flex items-center justify-between border border-rose-500/30 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-600/10 to-transparent"></div>
            <div className="flex items-center gap-8 relative z-10">
              <div className="bg-rose-600 p-4 rounded-3xl shadow-xl shadow-rose-900/20 animate-pulse">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Suspicious AI Behavior Detected</h3>
                <p className="text-rose-300 font-bold text-xs uppercase tracking-widest">{stats.behavior_analysis.reason}</p>
              </div>
            </div>
            <div className="flex gap-6 relative z-10">
              <div className="bg-white/5 px-8 py-4 rounded-3xl backdrop-blur-sm border border-white/10 text-center">
                <p className="text-[10px] font-black uppercase text-rose-400 mb-1">Recent Rejection Rate</p>
                <p className="text-2xl font-black text-white">{stats.behavior_analysis.rejection_rate}%</p>
              </div>
              <div className="bg-white/5 px-8 py-4 rounded-3xl backdrop-blur-sm border border-white/10 text-center">
                <p className="text-[10px] font-black uppercase text-rose-400 mb-1">Consecutive Count</p>
                <p className="text-2xl font-black text-white">{stats.behavior_analysis.consecutive_rejections}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <nav className="flex p-2 bg-white/[0.03] backdrop-blur-2xl rounded-[32px] w-fit border border-white/5 shadow-inner mx-auto mb-16">
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`px-10 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-3 ${
                 activeTab === tab.id
                   ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 scale-105'
                   : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
               }`}
             >
               <span className={`${activeTab === tab.id ? 'text-white' : 'text-indigo-400'}`}>{tab.icon}</span>
               {tab.label}
             </button>
           ))}
        </nav>

        {/* --- Overview Tab --- */}
        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Stock Performance Chart Section */}
            <div className="glass-card p-12 glow-indigo">
               <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Market Intelligence Terminal</h3>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Live Asset Performance & AI Baseline</p>
                  </div>
                  <select
                    className="bg-white/5 border border-white/10 text-white text-xs font-black p-4 rounded-2xl outline-none hover:bg-white/10 transition-colors"
                    value={stockFormData.ticker}
                    onChange={(e) => setStockFormData({...stockFormData, ticker: e.target.value})}
                  >
                    <option className="bg-[#0a0a0c]" value="AAPL">Apple (AAPL)</option>
                    <option className="bg-[#0a0a0c]" value="TSLA">Tesla (TSLA)</option>
                    <option className="bg-[#0a0a0c]" value="MSFT">Microsoft (MSFT)</option>
                    <option className="bg-[#0a0a0c]" value="GOOGL">Alphabet (GOOGL)</option>
                    <option className="bg-[#0a0a0c]" value="AMZN">Amazon (AMZN)</option>
                  </select>
               </div>

               <div className="h-[400px] w-full mt-8">
                  {loadingHistory ? (
                    <div className="h-full flex items-center justify-center text-slate-500 font-black italic animate-pulse">Synchronizing Market Data...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stockHistory}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" hide />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip 
                          contentStyle={{background: '#111114', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', padding: '20px'}}
                          itemStyle={{fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#fff'}}
                        />
                        <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorPrice)" />
                        <Area type="monotone" dataKey="ma50" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
               </div>

               <div className="flex gap-8 mt-10 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Price</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">50-Day Moving Average</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               {[
                 { label: 'Total Executions', val: stats.total_applicants, icon: <Users/>, col: 'indigo' },
                 { label: 'Integrity Score', val: '99.9%', icon: <ShieldCheck/>, col: 'emerald' },
                 { label: 'Approval Index', val: `${stats.loan_approval_rate}%`, icon: <Activity/>, col: 'blue' },
                 { label: 'Recent Rejection Rate', val: `${stats.behavior_analysis?.rejection_rate || 0}%`, icon: <Bug/>, col: stats.behavior_analysis?.is_suspicious ? 'rose' : 'slate' },
                 { label: 'Consecutive Rejections', val: stats.behavior_analysis?.consecutive_rejections || 0, icon: <AlertTriangle/>, col: stats.behavior_analysis?.is_suspicious ? 'rose' : 'slate' }
               ].map((s, i) => (
                 <div key={i} className={`glass-card p-8 flex items-center gap-6 group hover:scale-[1.02] ${s.col === 'rose' ? 'border-rose-500/30' : ''}`}>
                   <div className={`p-4 rounded-2xl bg-white/5 text-white shadow-inner group-hover:text-indigo-400 transition-colors`}>{s.icon}</div>
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                     <h3 className="text-3xl font-black text-white tracking-tight">{s.val}</h3>
                   </div>
                 </div>
               ))}
               <div className="md:col-span-3 glass-card p-10">
                  <div className="flex justify-between items-start mb-12">
                     <div className="flex items-center gap-4">
                        <BarChart3 className="w-6 h-6 text-indigo-500" />
                        <h2 className="font-black text-sm uppercase tracking-[0.2em] text-white">Decision Landscape</h2>
                     </div>
                  </div>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.credit_score_distribution}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} unit="%" />
                        <Tooltip 
                           cursor={{fill: 'rgba(255,255,255,0.03)'}}
                           contentStyle={{background: '#111114', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'}}
                           itemStyle={{color: '#fff', fontSize: '11px', fontWeight: 'bold'}}
                        />
                        <Bar dataKey="approval_rate" fill="#6366f1" radius={[12, 12, 0, 0]} barSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* --- Engine Tab --- */}
        {activeTab === 'engine' && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="glass-card p-16 glow-indigo relative overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-16">
                    <div className="bg-indigo-600 p-4 rounded-3xl shadow-xl shadow-indigo-600/20 text-white glow-indigo"><Activity className="w-8 h-8"/></div>
                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tight">AI Decision Engine</h2>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-1">Algorithmic Risk Assessment</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {['credit_score', 'income', 'loan_amount', 'existing_debt'].map(f => (
                      <div key={f} className="group">
                        <label className={labelClass}>{f.replace('_', ' ')}</label>
                        <input type="number" value={formData[f]} onChange={(e) => setFormData({...formData, [f]: e.target.value})} className={fieldClass} />
                      </div>
                    ))}
                    <div className="group">
                      <label className={labelClass}>Employment</label>
                      <select className={fieldClass} value={formData.employment_status} onChange={(e) => setFormData({...formData, employment_status: e.target.value})}>
                        <option className="bg-[#0a0a0c]" value="employed">Employed</option>
                        <option className="bg-[#0a0a0c]" value="self_employed">Self Employed</option>
                        <option className="bg-[#0a0a0c]" value="unemployed">Unemployed</option>
                      </select>
                    </div>
                    <div className="group">
                      <label className={labelClass}>Loan Term</label>
                      <input type="number" value={formData.loan_term} onChange={(e) => setFormData({...formData, loan_term: e.target.value})} className={fieldClass} />
                    </div>
                  </div>

                  <button onClick={runDecision} disabled={submitting} className="w-full mt-16 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-7 rounded-[32px] transition-all duration-500 shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-4 uppercase tracking-[0.4em] text-sm group glow-indigo">
                    {submitting ? 'Executing Protocol...' : 'Generate Verified Decision'}
                    <Database className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  </button>
               </div>

               {/* Result Card Integration */}
               {lastResult && (
                 <div className={`mt-12 p-12 rounded-[48px] border-2 animate-in zoom-in-95 slide-in-from-bottom-5 duration-700 backdrop-blur-md ${
                   lastResult.decision === 'Loan Approved' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'
                 }`}>
                   <div className="flex justify-between items-start mb-10">
                     <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-2">AI Protocol Verdict</p>
                        <h3 className={`text-5xl font-black tracking-tighter ${lastResult.decision === 'Loan Approved' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {lastResult.decision}
                        </h3>
                     </div>
                     <div className="bg-white/5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 shadow-xl">
                        Status: <span className={lastResult.status === 'Verified' ? 'text-emerald-400' : 'text-amber-400'}>{lastResult.status}</span>
                     </div>
                   </div>
                   
                   <div className="space-y-6">
                     <div className="flex justify-between items-end">
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-1">Confidence Score</p>
                          <p className="text-2xl font-black text-white">{(lastResult.confidence * 100).toFixed(1)}% Trust Accuracy</p>
                       </div>
                       <button onClick={() => setActiveTab('audit')} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">View in Audit Ledger →</button>
                     </div>
                     <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5 shadow-inner">
                        <div 
                           className={`h-full rounded-full transition-all duration-[1500ms] ${lastResult.decision === 'Loan Approved' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]'}`} 
                           style={{ width: `${(lastResult.confidence * 100).toFixed(0)}%` }}
                        ></div>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* --- Stock Engine Tab --- */}
        {activeTab === 'stock_engine' && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="glass-card p-16 glow-indigo relative overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-16">
                    <div className="bg-indigo-600 p-4 rounded-3xl shadow-xl shadow-indigo-600/20 text-white glow-indigo"><BarChart3 className="w-8 h-8"/></div>
                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tight">Stock AI Engine</h2>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-1">Real-time Trading Intelligence</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="group">
                      <label className={labelClass}>Select Stock Ticker</label>
                      <select 
                        className={fieldClass} 
                        value={stockFormData.ticker} 
                        onChange={(e) => setStockFormData({...stockFormData, ticker: e.target.value})}
                      >
                        <option className="bg-[#0a0a0c]" value="AAPL">AAPL (Apple Inc.)</option>
                        <option className="bg-[#0a0a0c]" value="TSLA">TSLA (Tesla Inc.)</option>
                        <option className="bg-[#0a0a0c]" value="MSFT">MSFT (Microsoft Corp.)</option>
                        <option className="bg-[#0a0a0c]" value="GOOGL">GOOGL (Alphabet Inc.)</option>
                        <option className="bg-[#0a0a0c]" value="AMZN">AMZN (Amazon.com Inc.)</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={runStockDecision} 
                    disabled={submitting} 
                    className="w-full mt-16 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-7 rounded-[32px] transition-all duration-500 shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-4 uppercase tracking-[0.4em] text-sm group glow-indigo"
                  >
                    {submitting ? 'Fetching & Executing Protocol...' : 'Generate Verified Decision'}
                    <Database className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  </button>
               </div>

               {/* Result Card Integration */}
               {lastStockResult && (
                 <div className={`mt-12 p-12 rounded-[48px] border-2 animate-in zoom-in-95 slide-in-from-bottom-5 duration-700 backdrop-blur-md ${
                   lastStockResult.decision === 'BUY' ? 'bg-emerald-500/5 border-emerald-500/20' : (lastStockResult.decision === 'SELL' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-slate-500/5 border-white/10')
                 }`}>
                   <div className="flex justify-between items-start mb-10">
                     <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-2">AI Protocol Verdict ({lastStockResult.ticker})</p>
                        <h3 className={`text-5xl font-black tracking-tighter ${lastStockResult.decision === 'BUY' ? 'text-emerald-400' : (lastStockResult.decision === 'SELL' ? 'text-rose-400' : 'text-slate-400')}`}>
                          {lastStockResult.decision}
                        </h3>
                     </div>
                     <div className="bg-white/5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 shadow-xl">
                        Status: <span className={lastStockResult.status === 'Verified' ? 'text-emerald-400' : 'text-amber-400'}>{lastStockResult.status}</span>
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-3 gap-8 mb-10 mt-6 border-y border-white/5 py-8">
                     <div>
                       <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Current Price</p>
                       <p className="text-2xl font-black text-white">${lastStockResult.current_price.toFixed(2)}</p>
                     </div>
                     <div>
                       <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">50-Day MA</p>
                       <p className="text-2xl font-black text-white">${lastStockResult.ma_50.toFixed(2)}</p>
                     </div>
                     <div>
                       <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">14-Day RSI</p>
                       <p className="text-2xl font-black text-white">{lastStockResult.rsi_14.toFixed(2)}</p>
                     </div>
                   </div>

                   <div className="space-y-6">
                     <div className="flex justify-between items-end">
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-1">Confidence Score</p>
                          <p className="text-2xl font-black text-white">{(lastStockResult.confidence * 100).toFixed(1)}% Trust Accuracy</p>
                       </div>
                       <button onClick={() => setActiveTab('stock_audit')} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">View in Audit Ledger →</button>
                     </div>
                     <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5 shadow-inner">
                        <div 
                           className={`h-full rounded-full transition-all duration-[1500ms] ${lastStockResult.decision === 'BUY' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : (lastStockResult.decision === 'SELL' ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-slate-500')}`} 
                           style={{ width: `${(lastStockResult.confidence * 100).toFixed(0)}%` }}
                        ></div>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* --- Fairness Tab --- */}
        {activeTab === 'fairness' && fairnessData && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Overall Fairness Score */}
              <div className="glass-card p-12 glow-indigo flex flex-col items-center justify-center text-center border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-4 relative z-10">Integrity + Fairness Score</p>
                <div className="relative w-48 h-48 mb-8 z-10">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={552} strokeDashoffset={552 - (552 * fairnessData.overall_fairness_score) / 100} className="text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-5xl font-black text-white glow-indigo">{fairnessData.overall_fairness_score.toFixed(0)}</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Fairness pts</span>
                    </div>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight relative z-10 font-black">System Accountability Rating</h3>
                <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-[0.2em] relative z-10">Aggregated Across All Decision Modules</p>
              </div>

              {/* Bias Alerts */}
              <div className="glass-card p-12 glow-rose border-white/5">
                <div className="flex items-center gap-6 mb-10">
                  <div className="bg-rose-500/10 p-5 rounded-3xl text-rose-500 border border-rose-500/20 shadow-lg shadow-rose-900/10"><AlertTriangle className="w-8 h-8"/></div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight font-black">Bias Alerts</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Discriminatory Pattern Detection</p>
                  </div>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 premium-scrollbar">
                  {[...fairnessData.loan.bias_alerts, ...fairnessData.stock.bias_alerts].length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                      <ShieldCheck className="w-16 h-16 mb-6 opacity-20 text-indigo-500" />
                      <p className="font-black uppercase tracking-[0.3em] text-[10px]">No Discriminatory Patterns Detected</p>
                    </div>
                  ) : (
                    [...fairnessData.loan.bias_alerts, ...fairnessData.stock.bias_alerts].map((alert, i) => (
                      <div key={i} className="bg-rose-500/5 p-8 rounded-3xl border border-rose-500/10 flex items-start gap-5 group hover:bg-rose-500/10 transition-all duration-300 animate-in fade-in slide-in-from-left-4">
                        <div className="w-2.5 h-2.5 mt-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse shrink-0"></div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-rose-400 tracking-[0.25em] mb-2">{alert.segment} - {alert.metric}</p>
                          <p className="text-sm font-black text-slate-200 leading-relaxed mb-2">{alert.message}</p>
                          <p className="text-[10px] font-black text-rose-500/70 uppercase tracking-widest bg-rose-500/5 px-3 py-1 rounded-lg inline-block">Detection Value: {alert.value}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="glass-card p-12 border-white/5 glow-indigo relative overflow-hidden">
               <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>
               <h3 className="text-2xl font-black text-white tracking-tight mb-12 relative z-10 font-black">Decision Distribution (Bias Detection)</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-20 relative z-10">
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-10 flex items-center gap-3"><Users className="w-4 h-4 text-indigo-500" /> Loan Decisions (By Credit Band)</h4>
                    <div className="space-y-8">
                      {Object.entries(fairnessData.loan.distribution_data).map(([band, rate]) => (
                        <div key={band} className="group">
                          <div className="flex justify-between mb-3 items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{band}</span>
                            <span className="text-xs font-black text-white">{rate}% Rejection</span>
                          </div>
                          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                            <div className={`h-full rounded-full transition-all duration-[1500ms] shadow-[0_0_15px] ${rate > 80 ? 'bg-rose-500 shadow-rose-500/40' : 'bg-indigo-500 shadow-indigo-500/40'}`} style={{width: `${rate}%`}}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-10 flex items-center gap-3"><BarChart3 className="w-4 h-4 text-emerald-500" /> Stock Decisions (By Asset)</h4>
                    <div className="space-y-8">
                      {Object.entries(fairnessData.stock.distribution_data).map(([ticker, rate]) => (
                        <div key={ticker} className="group">
                          <div className="flex justify-between mb-3 items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{ticker}</span>
                            <span className="text-xs font-black text-white">{rate}% Sell Bias</span>
                          </div>
                          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                            <div className={`h-full rounded-full transition-all duration-[1500ms] shadow-[0_0_15px] ${rate > 80 ? 'bg-rose-500 shadow-rose-500/40' : 'bg-emerald-500 shadow-emerald-500/40'}`} style={{width: `${rate}%`}}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}
        {/* --- Audit Tab --- */}
        {activeTab === 'audit' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="glass-card overflow-hidden border-white/5">
              <div className="p-12 border-b border-white/5 flex justify-between items-end bg-white/[0.02]">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Audit Trail Ledger</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Immutable Execution Evidence</p>
                  </div>
              </div>

              <div className="overflow-x-auto premium-scrollbar">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th className="px-12 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Execution Identity</th>
                      <th className="px-8 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">AI Verdict</th>
                      <th className="px-8 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Integrity Hash</th>
                      <th className="px-8 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Fairness (Stability)</th>
                      <th className="px-8 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Status</th>
                      <th className="px-12 py-8 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Transparency Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {records.map((rec) => (
                      <tr key={rec.decision_id} className="hover:bg-white/[0.03] transition-colors group">
                        <td className="px-12 py-8">
                           <div className="flex flex-col gap-1">
                             <span className="font-mono text-xs font-black text-indigo-400 group-hover:text-indigo-300 transition-colors uppercase">{rec.decision_id}</span>
                             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{new Date(rec.timestamp).toLocaleDateString()}</span>
                           </div>
                        </td>
                        <td className="px-8 py-8">
                           <span className={`text-sm font-black tracking-tight ${rec.decision === 'Loan Approved' ? 'text-emerald-400' : 'text-rose-400'}`}>{rec.decision}</span>
                        </td>
                        <td className="px-8 py-8">
                           <div className="flex items-center gap-4">
                              <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                 <div className={`h-full rounded-full ${rec.decision === 'Loan Approved' ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{width: `${rec.confidence * 100}%`}}></div>
                              </div>
                              <span className="font-mono text-[10px] text-slate-500 uppercase group-hover:text-slate-300 transition-colors">{rec.execution_hash.substring(0,10)}...</span>
                           </div>
                        </td>
                        <td className="px-8 py-8">
                            {rec.fairness_check && (
                              <div className="flex items-center gap-3">
                                <span className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px] ${rec.fairness_check.status === 'PASS' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-amber-500 shadow-amber-500/50'}`}></span>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">{(rec.fairness_check.stability_score * 100).toFixed(0)}% Stable</span>
                              </div>
                            )}
                         </td>
                        <td className="px-8 py-8">{getStatusBadge(rec.status)}</td>
                        <td className="px-12 py-8 text-right space-x-4">
                            <button onClick={() => replayDecision(rec.decision_id)} disabled={replaying === rec.decision_id} 
                                    className="bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 text-slate-300 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md">
                              {replaying === rec.decision_id ? 'Replaying...' : 'Replay'}
                            </button>
                            <button onClick={() => verifyRecord(rec.decision_id)} disabled={verifying === rec.decision_id} 
                                    className="bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 text-indigo-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md shadow-lg shadow-indigo-600/5">
                              {verifying === rec.decision_id ? 'Verifying...' : 'Validate'}
                            </button>
                            <button onClick={() => openTamperModal(rec)} className="bg-white/5 hover:bg-rose-600/20 text-slate-500 hover:text-rose-500 p-3 rounded-2xl transition-all border border-transparent hover:border-rose-500/30"><Bug className="w-5 h-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- Stock Audit Tab --- */}
        {activeTab === 'stock_audit' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="glass-card overflow-hidden border-white/5">
              <div className="p-12 border-b border-white/5 flex justify-between items-end bg-white/[0.02]">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Stock AI Audit Ledger</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Immutable Execution Evidence</p>
                  </div>
              </div>

              <div className="overflow-x-auto premium-scrollbar">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th className="px-12 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Execution Identity</th>
                      <th className="px-8 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Stock</th>
                      <th className="px-8 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">AI Verdict</th>
                      <th className="px-8 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Integrity Hash</th>
                      <th className="px-8 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Fairness (Stability)</th>
                      <th className="px-8 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Status</th>
                      <th className="px-12 py-8 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Transparency Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stockRecords.map((rec) => (
                      <tr key={rec.decision_id} className="hover:bg-white/[0.03] transition-colors group">
                        <td className="px-12 py-8">
                           <div className="flex flex-col gap-1">
                             <span className="font-mono text-xs font-black text-indigo-400 group-hover:text-indigo-300 transition-colors uppercase">{rec.decision_id}</span>
                             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{new Date(rec.timestamp).toLocaleDateString()}</span>
                           </div>
                        </td>
                        <td className="px-8 py-8">
                           <span className="text-sm font-black text-white tracking-tight">{rec.ticker}</span>
                        </td>
                        <td className="px-8 py-8">
                           <span className={`text-sm font-black tracking-tight ${rec.decision === 'BUY' ? 'text-emerald-400' : (rec.decision === 'SELL' ? 'text-rose-400' : 'text-slate-400')}`}>{rec.decision}</span>
                        </td>
                        <td className="px-8 py-8">
                           <div className="flex items-center gap-4">
                              <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                 <div className={`h-full rounded-full ${rec.decision === 'BUY' ? 'bg-emerald-500' : (rec.decision === 'SELL' ? 'bg-rose-500' : 'bg-slate-500')}`} style={{width: `${rec.confidence * 100}%`}}></div>
                              </div>
                              <span className="font-mono text-[10px] text-slate-500 uppercase group-hover:text-slate-300 transition-colors">{rec.execution_hash.substring(0,10)}...</span>
                           </div>
                        </td>
                        <td className="px-8 py-8">
                            {rec.fairness_check && (
                              <div className="flex items-center gap-3">
                                <span className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px] ${rec.fairness_check.status === 'PASS' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-amber-500 shadow-amber-500/50'}`}></span>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">{(rec.fairness_check.stability_score * 100).toFixed(0)}% Stable</span>
                              </div>
                            )}
                         </td>
                        <td className="px-8 py-8">{getStatusBadge(rec.status)}</td>
                        <td className="px-12 py-8 text-right space-x-4">
                            <button onClick={() => replayStockDecision(rec.decision_id)} disabled={replaying === rec.decision_id} 
                                    className="bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 text-slate-300 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md">
                              {replaying === rec.decision_id ? 'Replaying...' : 'Replay'}
                            </button>
                            <button onClick={() => verifyStockRecord(rec.decision_id)} disabled={verifying === rec.decision_id} 
                                    className="bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 text-indigo-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md shadow-lg shadow-indigo-600/5">
                              {verifying === rec.decision_id ? 'Verifying...' : 'Validate'}
                            </button>
                            <button onClick={() => openStockTamperModal(rec)} className="bg-white/5 hover:bg-rose-600/20 text-slate-500 hover:text-rose-500 p-3 rounded-2xl transition-all border border-transparent hover:border-rose-500/30"><Bug className="w-5 h-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal & Toast remain unchanged logic-wise */}
      {/* Modal & Toast Integration */}
      {tamperingRecord && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl z-[500] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-[#0a0a0c] border border-rose-500/20 rounded-[56px] shadow-[0_0_100px_rgba(244,63,94,0.1)] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500 relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/5 rounded-full blur-[120px] -mr-48 -mt-48"></div>
            <div className="bg-rose-600 p-12 text-white flex justify-between items-center relative z-10 glow-rose">
              <div className="flex items-center gap-6"><Bug className="w-10 h-10 animate-bounce" /><h3 className="text-2xl font-black uppercase tracking-tight">System Breach Simulation</h3></div>
              <button onClick={() => setTamperingRecord(null)} className="hover:bg-white/10 p-3 rounded-full transition-all"><X className="w-10 h-10" /></button>
            </div>
            <div className="p-16 space-y-12 relative z-10">
              <div className="grid grid-cols-2 gap-10">
                <div className="col-span-2 group">
                  <label className={labelClass}>Manual Decision Alteration</label>
                  <select value={tamperForm.decision} onChange={e=>setTamperForm({...tamperForm, decision:e.target.value})} className={fieldClass}>
                    <option className="bg-[#0a0a0c]" value="Loan Approved">Loan Approved</option>
                    <option className="bg-[#0a0a0c]" value="Loan Rejected">Loan Rejected</option>
                  </select>
                </div>
                {['confidence', 'income', 'loan_amount', 'existing_debt'].map(f=>(
                  <div key={f} className="group">
                    <label className={labelClass}>{f.replace('_', ' ')}</label>
                    <input type="number" step="0.01" value={tamperForm[f]} onChange={e=>setTamperForm({...tamperForm, [f]:f==='loan_term'?parseInt(e.target.value):parseFloat(e.target.value)})} className={fieldClass}/>
                  </div>
                ))}
              </div>
              <button onClick={handleTamper} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-7 rounded-[32px] transition-all duration-500 shadow-2xl shadow-rose-600/20 flex items-center justify-center gap-4 uppercase tracking-[0.4em] text-sm group glow-rose">
                Execute Compromise Protocol
                <ShieldAlert className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {stockTamperingRecord && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl z-[500] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-[#0a0a0c] border border-rose-500/20 rounded-[56px] shadow-[0_0_100px_rgba(244,63,94,0.1)] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500 relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/5 rounded-full blur-[120px] -mr-48 -mt-48"></div>
            <div className="bg-rose-600 p-12 text-white flex justify-between items-center relative z-10 glow-rose">
              <div className="flex items-center gap-6"><Bug className="w-10 h-10 animate-bounce" /><h3 className="text-2xl font-black uppercase tracking-tight">System Breach Simulation (Stock)</h3></div>
              <button onClick={() => setStockTamperingRecord(null)} className="hover:bg-white/10 p-3 rounded-full transition-all"><X className="w-10 h-10" /></button>
            </div>
            <div className="p-16 space-y-12 relative z-10">
              <div className="grid grid-cols-2 gap-10">
                <div className="col-span-2 group">
                  <label className={labelClass}>Manual Decision Alteration</label>
                  <select value={stockTamperForm.decision} onChange={e=>setStockTamperForm({...stockTamperForm, decision:e.target.value})} className={fieldClass}>
                    <option className="bg-[#0a0a0c]" value="BUY">BUY</option>
                    <option className="bg-[#0a0a0c]" value="SELL">SELL</option>
                    <option className="bg-[#0a0a0c]" value="HOLD">HOLD</option>
                  </select>
                </div>
                {['confidence', 'current_price', 'ma_50', 'rsi_14'].map(f=>(
                  <div key={f} className="group">
                    <label className={labelClass}>{f.replace('_', ' ')}</label>
                    <input type="number" step="0.01" value={stockTamperForm[f]} onChange={e=>setStockTamperForm({...stockTamperForm, [f]:parseFloat(e.target.value)})} className={fieldClass}/>
                  </div>
                ))}
              </div>
              <button onClick={handleStockTamper} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-7 rounded-[32px] transition-all duration-500 shadow-2xl shadow-rose-600/20 flex items-center justify-center gap-4 uppercase tracking-[0.4em] text-sm group glow-rose">
                Execute Compromise Protocol
                <ShieldAlert className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {verifyResult && (
        <div className={`fixed bottom-10 right-10 p-10 rounded-[48px] shadow-[0_0_50px_rgba(0,0,0,0.5)] border-2 z-[600] animate-in slide-in-from-right-10 duration-700 backdrop-blur-xl ${verifyResult.result ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'}`}>
           <div className="flex gap-8">
              <div className={`p-5 rounded-3xl shadow-lg ${verifyResult.result ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 glow-emerald' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 glow-rose'}`}>
                {verifyResult.result ? <ShieldCheck className="w-12 h-12"/> : <ShieldAlert className="w-12 h-12"/>}
              </div>
              <div>
                <h4 className={`font-black uppercase tracking-[0.2em] text-xl mb-2 ${verifyResult.result ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {verifyResult.result ? 'Ledger Verified' : 'Breach Detected'}
                </h4>
                <p className="max-w-xs text-xs text-slate-400 font-bold mb-6 leading-relaxed uppercase tracking-wider">{verifyResult.message}</p>
                <div className="bg-black/40 p-5 rounded-2xl border border-white/5 font-mono text-[10px] text-slate-500 break-all leading-relaxed shadow-inner">
                  <span className="text-slate-600 block mb-1 uppercase tracking-tighter">Cryptographic Hash:</span>
                  {verifyResult.recomputed_hash}
                </div>
              </div>
           </div>
        </div>
      )}

      {replayResult && !replayResult.error && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl z-[600] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-[#0a0a0c] border border-white/5 rounded-[56px] shadow-[0_0_100px_rgba(99,102,241,0.1)] w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-500 relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[150px] -mr-64 -mt-64"></div>
            <div className={`p-12 text-white flex justify-between items-center relative z-10 ${replayResult.match ? 'bg-emerald-600 glow-emerald' : 'bg-amber-500 glow-amber'}`}>
              <div className="flex items-center gap-6">
                {replayResult.match ? <ShieldCheck className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                <h3 className="text-2xl font-black uppercase tracking-widest">AI Decision Transparency Report</h3>
              </div>
              <button onClick={() => setReplayResult(null)} className="hover:bg-white/10 p-3 rounded-full transition-all"><X className="w-10 h-10" /></button>
            </div>
            
            <div className="p-20 relative z-10">
              <div className={`mb-16 text-center p-10 rounded-[40px] border-2 backdrop-blur-md ${replayResult.match ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-900/10' : 'bg-amber-500/5 border-amber-500/20 text-amber-400 shadow-lg shadow-amber-900/10'}`}>
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">{replayResult.status}</h2>
                <p className="text-xs font-bold opacity-80 uppercase tracking-[0.3em] max-w-2xl mx-auto leading-relaxed">
                  {replayResult.match 
                    ? "Protocol Integrity Check: The AI model reproduced the exact same decision when re-run on original immutable inputs." 
                    : "ALERT: Cryptographic variance detected! The AI model produced a different result. Possible model drift or ledger tempering identified."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-16">
                <div className="space-y-8">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] border-b border-white/5 pb-6">Stored Distributed Ledger</h4>
                  <div className="bg-white/[0.02] p-10 rounded-[40px] border border-white/5 shadow-inner">
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Historical Verdict</p>
                    <p className={`text-4xl font-black mb-6 ${
                      replayResult.stored_decision === 'Loan Approved' || replayResult.stored_decision === 'BUY' 
                        ? 'text-emerald-400' 
                        : (replayResult.stored_decision === 'Loan Rejected' || replayResult.stored_decision === 'SELL' ? 'text-rose-400' : 'text-slate-400')
                    }`}>
                      {replayResult.stored_decision}
                    </p>
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Historical Confidence</p>
                    <p className="text-xl font-bold text-white">{(replayResult.stored_confidence * 100).toFixed(2)}% <span className="text-slate-500 text-xs ml-1 uppercase">Probability</span></p>
                  </div>
                </div>

                <div className="space-y-8">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] border-b border-indigo-500/20 pb-6">Live Execution Replay</h4>
                  <div className="bg-indigo-500/5 p-10 rounded-[40px] border border-indigo-500/10 shadow-lg shadow-indigo-900/5">
                    <p className="text-[10px] font-black uppercase text-indigo-400/70 mb-2 tracking-widest">Current Verdict</p>
                    <p className={`text-4xl font-black mb-6 ${
                      replayResult.replayed_decision === 'Loan Approved' || replayResult.replayed_decision === 'BUY' 
                        ? 'text-emerald-400' 
                        : (replayResult.replayed_decision === 'Loan Rejected' || replayResult.replayed_decision === 'SELL' ? 'text-rose-400' : 'text-white')
                    }`}>
                      {replayResult.replayed_decision}
                    </p>
                    <p className="text-[10px] font-black uppercase text-indigo-400/70 mb-2 tracking-widest">Current Confidence</p>
                    <p className="text-xl font-bold text-white">{(replayResult.replayed_confidence * 100).toFixed(2)}% <span className="text-slate-500 text-xs ml-1 uppercase">Probability</span></p>
                  </div>
                </div>
              </div>

              <div className="mt-20 flex justify-center">
                 <button onClick={() => setReplayResult(null)} className="bg-white/5 hover:bg-white/10 text-white font-black px-16 py-6 rounded-full uppercase tracking-[0.3em] transition-all border border-white/10 text-xs shadow-xl backdrop-blur-md">
                   Dismiss Transparency Report
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
