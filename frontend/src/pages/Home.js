import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Activity,
  Users,
  User,
  Lock,
  Database,
  Stethoscope,
  Heart,
  Zap,
  CheckCircle2,
  ChevronRight,
  Plus,
  FileText
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-sans antialiased overflow-hidden text-slate-900">
      {/* Premium Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-3xl border-b border-slate-100 px-8 py-4 transition-all duration-500">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">SECUREHEALTH</span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            {['Platforms', 'Security', 'Enterprise', 'Resources'].map(item => (
              <button key={item} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">{item}</button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-black text-slate-500 hover:text-slate-900 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-sm font-black shadow-2xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50 rounded-full blur-[120px] -mr-96 -mt-96 opacity-50" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-50 rounded-full blur-[100px] -ml-64 -mb-64 opacity-50" />

        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative z-10 space-y-10 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-xs font-black uppercase tracking-widest shadow-sm">
              <Zap className="w-3 h-3 fill-indigo-600" />
              Now HIPAA & GDPR Certified
            </div>
            <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-[1.05]">
              Modernizing <br />
              <span className="text-indigo-600 bg-clip-text">Healthcare</span> <br />
              Infrastructures.
            </h1>
            <p className="text-xl text-slate-500 font-bold max-w-xl leading-relaxed">
              A military-grade operating system for hospitals. Manage patients, clinicians, and assets with decentralized security and real-time telemetry.
            </p>
            <div className="flex items-center gap-6 pt-6">
              <button
                onClick={() => navigate('/register')}
                className="bg-indigo-600 text-white px-10 py-5 rounded-3xl text-[13px] font-black uppercase tracking-[0.1em] shadow-2xl shadow-indigo-600/40 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
              >
                Provision Account
              </button>
              <button className="flex items-center gap-3 text-slate-400 font-black hover:text-slate-900 transition-colors uppercase tracking-widest text-xs group">
                Watch Demo
                <div className="p-3 rounded-full bg-slate-100 group-hover:bg-indigo-100 transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
              </button>
            </div>

            <div className="flex items-center gap-10 pt-12">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-50 shadow-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-300" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900">Over 500+ Healthcare Units</span>
                <span className="text-xs font-bold text-slate-400">Actively managed globally</span>
              </div>
            </div>
          </div>

          <div className="relative group animate-fade-in-up delay-200">
            <div className="absolute inset-0 bg-indigo-600/5 rounded-[60px] blur-3xl group-hover:bg-indigo-600/10 transition-colors" />
            <div className="relative bg-white border border-slate-100 rounded-[60px] p-10 shadow-2xl shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-700">
              <div className="grid grid-cols-2 gap-8">
                <div className="p-8 bg-slate-50 rounded-[40px] space-y-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                    <Activity className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Real-time Triage</h3>
                  <p className="text-xs font-bold text-slate-400 leading-relaxed italic">Managing patient flow with AI-driven weighted ranking and workload distribution.</p>
                </div>
                <div className="p-8 bg-indigo-600 rounded-[40px] space-y-6 text-white shadow-2xl shadow-indigo-600/30 translate-y-8">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Secure Vault</h3>
                  <p className="text-[11px] font-bold text-indigo-100 leading-relaxed">Cryptographically secured medical records with multi-factor audit trails.</p>
                </div>
                <div className="p-8 bg-slate-50 rounded-[40px] space-y-6 mt-8">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                    <Database className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Lab Analytics</h3>
                  <p className="text-xs font-bold text-slate-400 leading-relaxed">Integrated telemetry for clinical assets and laboratory operations.</p>
                </div>
                <div className="p-8 bg-white border border-slate-100 rounded-[40px] space-y-6 translate-y-8 shadow-xl">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">MD Console</h3>
                  <p className="text-xs font-bold text-slate-400 leading-relaxed">Specialized MD portal with full clinical history and prescription modules.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-20 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex flex-wrap justify-between items-center gap-12 opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all duration-700">
            {['RED CROSS', 'CLINIC-X', 'HEALTH-VAULT', 'MD-OS', 'BIO-LAB'].map(name => (
              <span key={name} className="text-3xl font-black text-slate-300 group-hover:text-slate-900 transition-colors tracking-tighter">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-32 px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center space-y-6 mb-24">
            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em]">Core Architecture</h2>
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">Engineered for Reliability.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: 'RBAC Security', desc: 'Role-Based Access Control ensuring only authorized personnel can view sensitive telemetry.', icon: ShieldCheck, color: 'indigo' },
              { title: 'Audit Engine', desc: 'Immutable logging of every interaction within the platform for regulatory compliance.', icon: FileText, color: 'rose' },
              { title: 'Vitals Sync', desc: 'Synchronized patient data across Reception, Doctor, and Lab portals in real-time.', icon: Activity, color: 'emerald' },
            ].map((feat, i) => (
              <div key={i} className="group p-10 bg-white border border-slate-100 rounded-[48px] hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500">
                <div className={`w-16 h-16 bg-${feat.color}-500/10 rounded-[28px] flex items-center justify-center mb-8 border border-${feat.color}-500/10 transition-colors group-hover:bg-${feat.color}-600`}>
                  <feat.icon className={`w-8 h-8 text-${feat.color}-600 group-hover:text-white transition-colors`} />
                </div>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-4 uppercase">{feat.title}</h4>
                <p className="text-slate-500 font-bold leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CSS for Scrollbars and Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-200 { animation-delay: 0.2s; }
      `}} />
    </div>
  );
};

export default Home;
