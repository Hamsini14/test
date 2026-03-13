import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Activity, Database,
  CheckCircle2, AlertTriangle, Blocks, TrendingUp, Bug, X,
  Users, Target, BarChart3
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';

const API_BASE = 'http://localhost:8000/api';

const DEFAULT_INPUT = {
  credit_score: 700,
  income: 60000,
  loan_amount: 20000,
  existing_debt: 5000,
  employment_status: 'employed',
  loan_term: 36,
};

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState('SAFE');
  const [verifying, setVerifying] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [tamperingRecord, setTamperingRecord] = useState(null);
  const [tamperForm, setTamperForm] = useState({ decision: '', confidence: 0 });
  const [stats, setStats] = useState({
    total_applicants: 0,
    average_credit_score: 0,
    loan_approval_rate: 0,
    credit_score_distribution: [],
    decisions_over_time: []
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Polling faster to see status changes
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [auditRes, statusRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/audits`),
        fetch(`${API_BASE}/system/status`),
        fetch(`${API_BASE}/stats`),
      ]);
      if (auditRes.ok) setRecords(await auditRes.json());
      if (statusRes.ok) setSystemStatus((await statusRes.json()).status);
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (decisionId) => {
    setVerifying(decisionId);
    setVerifyResult(null);
    try {
      const res = await fetch(`${API_BASE}/verify/${decisionId}`, { method: 'POST' });
      const data = await res.json();
      setVerifyResult({ id: decisionId, ...data });
      // Keep result showing for a while
      setTimeout(() => setVerifyResult(null), 8000);
    } catch (err) {
      console.error('Verify error:', err);
    } finally {
      setVerifying(null);
    }
  };

  const runDecision = async () => {
    setSubmitting(true);
    setLastResult(null);
    try {
      const endpoint = '/decision';
      const payload = {
        ...input,
        credit_score: parseInt(input.credit_score),
        income: parseFloat(input.income),
        loan_amount: parseFloat(input.loan_amount),
        existing_debt: parseFloat(input.existing_debt),
        loan_term: parseInt(input.loan_term),
      };
      const res = await fetch(`${API_BASE}${endpoint}`, {
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
      confidence: parseFloat((1.0 - record.confidence).toFixed(2))
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
      console.log('Record tampered successfully.');
    } catch (err) {
      console.error('Tamper error:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Verified</span>;
      case 'Anchored':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1"><Blocks className="w-3 h-3"/> Anchored</span>;
      case 'Anchoring':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center gap-1"><Activity className="w-3 h-3 animate-pulse"/> Anchoring</span>;
      case 'Tampering Detected':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-400 animate-bounce flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Tampering Detected</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const fieldClass =
    'w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none text-sm bg-white transition-all';
  const labelClass = 'block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
                <ShieldCheck className="w-8 h-8 text-white" />
             </div>
             <h1 className="text-4xl font-black text-slate-800 tracking-tight">AI Audit <span className="text-indigo-600">Pro</span></h1>
          </div>
          <p className="text-slate-500 font-medium">Immutable Blockchain Accountability for AI Decisons</p>
        </div>
        
        <div className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-sm border transition-all ${
            systemStatus === 'SAFE' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse'
          }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${systemStatus === 'SAFE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          <span className="uppercase tracking-widest text-xs">System Status: {systemStatus}</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        
        {/* --- Stats Top Row --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
               <Users className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Applicants</p>
               <h3 className="text-2xl font-black text-slate-800">{stats.total_applicants}</h3>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
               <Target className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Credit Score</p>
               <h3 className="text-2xl font-black text-slate-800">{stats.average_credit_score}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
               <Activity className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approval Rate</p>
               <h3 className="text-2xl font-black text-slate-800">{stats.loan_approval_rate}%</h3>
            </div>
          </div>
        </div>

        {/* --- Graphs Row --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                 <BarChart3 className="w-5 h-5 text-indigo-600" />
                 <h2 className="font-bold text-sm uppercase tracking-wider">Approval Rate by Credit Score</h2>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.credit_score_distribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} unit="%" />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      cursor={{fill: '#f8fafc'}}
                    />
                    <Bar dataKey="approval_rate" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                 <Activity className="w-5 h-5 text-indigo-600" />
                 <h2 className="font-bold text-sm uppercase tracking-wider">Decisions Processed Over Time</h2>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.decisions_over_time}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Line type="monotone" dataKey="decisions" stroke="#6366f1" strokeWidth={3} dot={{r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* --- Left Column: Simulation Controller --- */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="bg-slate-800 p-4 text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <h2 className="font-bold text-sm uppercase tracking-wider">Simulation Controller</h2>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className={labelClass}>Credit Score</label>
                  <input type="number" value={input.credit_score} onChange={(e) => setInput({ ...input, credit_score: e.target.value })} className={fieldClass} />
                </div>
                <div className="col-span-1">
                  <label className={labelClass}>Annual Income ($)</label>
                  <input type="number" value={input.income} onChange={(e) => setInput({ ...input, income: e.target.value })} className={fieldClass} />
                </div>
                <div className="col-span-1">
                  <label className={labelClass}>Loan Amount ($)</label>
                  <input type="number" value={input.loan_amount} onChange={(e) => setInput({ ...input, loan_amount: e.target.value })} className={fieldClass} />
                </div>
                <div className="col-span-1">
                  <label className={labelClass}>Existing Debt ($)</label>
                  <input type="number" value={input.existing_debt} onChange={(e) => setInput({ ...input, existing_debt: e.target.value })} className={fieldClass} />
                </div>
                <div className="col-span-1">
                  <label className={labelClass}>Employment</label>
                  <select value={input.employment_status} onChange={(e) => setInput({ ...input, employment_status: e.target.value })} className={fieldClass}>
                    <option value="employed">Employed</option>
                    <option value="self_employed">Self-Employed</option>
                    <option value="unemployed">Unemployed</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className={labelClass}>Term (Mo)</label>
                  <select value={input.loan_term} onChange={(e) => setInput({ ...input, loan_term: e.target.value })} className={fieldClass}>
                    {[12, 24, 36, 48, 60].map((t) => <option key={t} value={t}>{t} Months</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  onClick={() => runDecision()}
                  disabled={submitting || systemStatus === 'HALTED'}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Run AI Decision
                </button>
                <p className="text-[10px] text-center text-slate-400 font-medium px-4">
                  Runs the full accountability pipeline: hashing, behavioral checks, and blockchain anchoring.
                </p>
              </div>
            </div>
          </div>

          {/* Result Card */}
          {lastResult && (
            <div className={`rounded-3xl border p-6 shadow-lg animate-in slide-in-from-left-4 duration-500 ${lastResult.decision === 'Loan Approved' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">AI Decision</p>
                    <h3 className={`text-2xl font-black ${lastResult.decision === 'Loan Approved' ? 'text-emerald-700' : 'text-rose-700'}`}>{lastResult.decision}</h3>
                 </div>
                 <div className="bg-white/50 px-3 py-1 rounded-full text-xs font-bold border border-white/50">{lastResult.status}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Confidence Score</span>
                    <span>{(lastResult.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-slate-200/50 rounded-full overflow-hidden border border-white/50">
                    <div className={`h-full transition-all duration-1000 ${lastResult.decision === 'Loan Approved' ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${(lastResult.confidence * 100).toFixed(0)}%` }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- Right Column: Audit Log --- */}
        <div className="xl:col-span-8">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[600px]">
             <div className="bg-slate-800 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-400" />
                    <h2 className="font-bold text-sm uppercase tracking-wider">Execution Audit Log</h2>
                </div>
                <div className="text-[10px] opacity-60 font-mono">LIVE_UPDATE: ON</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    <th className="py-5 px-6">ID & Model</th>
                    <th className="py-5 px-6">Decision Result</th>
                    <th className="py-5 px-6">Storage Proof</th>
                    <th className="py-5 px-6">Status</th>
                    <th className="py-5 px-6 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {records.map((rec) => (
                    <tr key={rec.decision_id} className={`border-b border-slate-50 transition-all ${rec.status === 'Tampering Detected' ? 'bg-rose-50/30' : 'hover:bg-indigo-50/30'}`}>
                      <td className="py-5 px-6">
                        <div className="font-mono text-[10px] text-slate-400 mb-1">{rec.decision_id}</div>
                        <div className="text-xs text-slate-600 font-bold uppercase">{rec.model_version}</div>
                      </td>
                      <td className="py-5 px-6">
                        <div className={`font-black ${rec.decision === 'Loan Approved' ? 'text-emerald-600' : 'text-rose-600'}`}>{rec.decision}</div>
                        <div className="text-[10px] text-slate-400 mt-1">Proof Hash: {rec.execution_hash.substring(0,12)}...</div>
                      </td>
                      <td className="py-5 px-6">
                         {rec.blockchain_tx_id !== 'Pending' ? (
                            <div className="space-y-1">
                                <div className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3"/> ALGO_TX_ANCHORED
                                </div>
                                <div className="font-mono text-[9px] text-slate-400 truncate w-32">{rec.blockchain_tx_id}</div>
                            </div>
                         ) : (
                            <div className="text-[10px] text-slate-300 italic">Awaiting Anchoring...</div>
                         )}
                      </td>
                      <td className="py-5 px-6">{getStatusBadge(rec.status)}</td>
                      <td className="py-5 px-6 text-right">
                      <div className="flex flex-col gap-2 items-end">
                        <button
                          onClick={() => handleVerify(rec.decision_id)}
                          disabled={verifying === rec.decision_id}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            rec.status === 'Anchoring' 
                              ? 'opacity-30 cursor-not-allowed bg-slate-100' 
                              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white shadow-sm'
                          }`}
                        >
                          {verifying === rec.decision_id ? 'Checking...' : 'Verify'}
                        </button>
                        
                        {rec.status === 'Verified' && (
                          <button
                            onClick={() => openTamperModal(rec)}
                            className="bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-1"
                          >
                            <Bug className="w-3 h-3" />
                            Simulate Tamper
                          </button>
                        )}
                      </div>
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && !loading && (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <div className="flex flex-col items-center opacity-20">
                            <Database className="w-16 h-16 mb-4" />
                            <p className="font-black uppercase tracking-[0.2em]">No Audit Data</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
      </main>

      {/* Interactive Tamper Modal */}
      {tamperingRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-rose-600 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Bug className="w-6 h-6" />
                <h3 className="text-xl font-black uppercase tracking-tight">Manual Tamper Proof</h3>
              </div>
              <button onClick={() => setTamperingRecord(null)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                You are about to modify the stored data for decision <span className="font-mono text-indigo-600 font-bold">{tamperingRecord.decision_id}</span>. 
                This simulates an unauthorized database breach.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Tampered Decision</label>
                  <select 
                    value={tamperForm.decision} 
                    onChange={(e) => setTamperForm({ ...tamperForm, decision: e.target.value })}
                    className={fieldClass}
                  >
                    <option value="Loan Approved">Loan Approved</option>
                    <option value="Loan Rejected">Loan Rejected</option>
                  </select>
                </div>
                
                <div>
                  <label className={labelClass}>Tampered Confidence (0.0 - 1.0)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="1" 
                    value={tamperForm.confidence} 
                    onChange={(e) => setTamperForm({ ...tamperForm, confidence: parseFloat(e.target.value) })}
                    className={fieldClass}
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  onClick={() => handleTamper()}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-rose-100 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                >
                  Confirm Tamper Attack
                </button>
                <p className="text-[10px] text-center text-slate-400 font-medium mt-4">
                  Note: The original cryptographic hash anchored on the blockchain will NOT be updated.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Notification Toast */}
      {verifyResult && (
        <div className={`fixed bottom-8 right-8 p-6 rounded-3xl shadow-2xl border-2 max-w-sm animate-in fade-in slide-in-from-right-8 duration-500 z-[100] ${
            verifyResult.result 
              ? 'bg-white border-emerald-500 shadow-emerald-200' 
              : 'bg-white border-rose-500 shadow-rose-200'
          }`}>
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-2xl ${verifyResult.result ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {verifyResult.result ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
            </div>
            <div>
              <h3 className={`font-black uppercase tracking-wider text-sm ${verifyResult.result ? 'text-emerald-700' : 'text-rose-700'}`}>
                {verifyResult.result ? 'Verification Success' : 'Tampering Detected'}
              </h3>
              <p className="text-xs text-slate-500 font-bold mt-1 mb-4 leading-relaxed">{verifyResult.message}</p>
              
              <div className="space-y-2">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <p className="text-[8px] font-black uppercase text-slate-400 mb-1 tracking-tighter">Blockchain Merkle Root</p>
                      <p className="font-mono text-[9px] text-slate-500 break-all">{verifyResult.merkle_root || 'Awaiting confirmation...'}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <p className="text-[8px] font-black uppercase text-slate-400 mb-1 tracking-tighter">Recomputed Execution Hash</p>
                      <p className="font-mono text-[9px] text-slate-500 break-all">{verifyResult.recomputed_hash}</p>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
