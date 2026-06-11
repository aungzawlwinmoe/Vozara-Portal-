import React, { useState } from 'react';
import { User, UserRole, InterpreterProfile } from '../types';
import { getInitialsAvatar } from '../utils/avatar';
import { KeyRound, ShieldAlert, Sparkles, UserPlus, LogIn, ArrowRight, CheckCircle2, Globe, Phone, MapPin } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
  allUsers: User[];
  onRegisterAccount: (data: { name: string; email: string; phone: string; languagePair: string; interpreterType: 'medical' | 'legal' | 'community' }) => void;
  systemSettings: { allowSelfRegistration: boolean };
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  allUsers,
  onRegisterAccount,
  systemSettings
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Login input states
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Signup inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLang, setRegLang] = useState('Spanish ↔ English');
  const [regType, setRegType] = useState<'medical' | 'legal' | 'community'>('medical');
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const matchedUser = allUsers.find(
      u => u.email.toLowerCase().trim() === emailInput.toLowerCase().trim()
    );

    if (matchedUser) {
      onLoginSuccess(matchedUser);
    } else {
      setLoginError('Could not verify credentials. Tip: Tap any "Quick Sandbox Bypass" avatar below for instant entry.');
    }
  };

  const handleStandardSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone) {
      alert('Please fill out all registration fields.');
      return;
    }

    onRegisterAccount({
      name: regName,
      email: regEmail,
      phone: regPhone,
      languagePair: regLang,
      interpreterType: regType
    });

    setSignupSuccess(true);
    setTimeout(() => {
      setSignupSuccess(false);
      // Main app automatically logs them in upon registration! But let's fallback to tab switch:
      setActiveTab('login');
    }, 1500);
  };

  const bypassLogin = (user: User) => {
    onLoginSuccess(user);
  };

  return (
    <div id="auth-canvas" className="min-h-[calc(100vh-100px)] py-12 px-4 flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-fadeIn">
        
        {/* Banner graphics */}
        <div className="bg-slate-900 px-6 py-8 text-center text-white relative">
          <div className="absolute inset-x-0 bottom-0 top-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400 via-indigo-900 to-slate-900" />
          <div className="relative space-y-2">
            <div className="mx-auto w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/5 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 id="portal-title-banner" className="text-xl font-bold tracking-tight">Vozara LS</h2>
            <p className="text-xs text-slate-350 tracking-wide font-medium uppercase">Compliance & Onboarding Portal</p>
          </div>
        </div>

        {/* Tab choice */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
          <button
            onClick={() => { setActiveTab('login'); setLoginError(''); }}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'login' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-450 hover:text-slate-700'
            }`}
          >
            <LogIn className="w-4 h-4" /> Secure Portal login
          </button>
          
          {systemSettings.allowSelfRegistration && (
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'signup' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-450 hover:text-slate-700'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Apply as Interpreter
            </button>
          )}
        </div>

        <div className="p-6">
          {activeTab === 'login' ? (
            <div className="space-y-6">
              <form onSubmit={handleStandardLogin} className="space-y-4">
                {loginError && (
                  <div className="text-xs bg-rose-50 text-rose-600 border border-rose-200 p-3 rounded-lg flex items-start gap-1.5 leading-normal animate-shake">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Registered Email Address</label>
                  <input 
                    type="email" 
                    id="login-email-field"
                    required
                    placeholder="name@vozarals.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 transition-all font-medium text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Password Key</label>
                  <input 
                    type="password" 
                    id="login-pass-field"
                    required
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 transition-all font-medium text-slate-800"
                  />
                  <div className="text-right">
                    <a href="#" onClick={(e) => { e.preventDefault(); alert('In the prototype sandbox, please use the Quick Bypass panel below.'); }} className="text-[10px] text-indigo-600 hover:underline font-semibold">Forgot password?</a>
                  </div>
                </div>

                <button 
                  type="submit"
                  id="auth-login-submit"
                  className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 hover:bg-indigo-700 cursor-pointer transition-all flex items-center justify-center gap-1"
                >
                  Enter Portal <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* DEMO BYPASS METRIC */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-455 tracking-wider block text-center">
                  🔐 Simulation Sandbox Quick Bypass:
                </span>
                
                <div id="quick-login-grid" className="grid grid-cols-2 gap-2 text-xs">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      id={`demo-user-login-${u.id}`}
                      onClick={() => bypassLogin(u)}
                      className="text-left p-2 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-350 cursor-pointer transition-colors flex items-center gap-1.5 min-w-0"
                    >
                      <img src={u.avatarUrl || getInitialsAvatar(u.name)} alt="" className="w-7 h-7 rounded-lg object-cover shrink-0" />
                      <div className="truncate min-w-0">
                        <div className="font-bold text-[11px] text-slate-800 truncate leading-none">{u.name.split(' ')[0]}</div>
                        <span className="text-[9px] font-semibold text-slate-400 capitalize">{u.role}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // SIGNUP PORTAL
            <form onSubmit={handleStandardSignup} className="space-y-4">
              {signupSuccess && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-250 p-3.5 rounded-xl flex items-center gap-1.5 text-xs font-bold animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-555" />
                  Account created successfully! Redirecting...
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Your Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Liam Thompson"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 transition-all font-medium text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Primary Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="liam@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-650 transition-all font-medium text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Primary Mobile Phone</label>
                <input 
                  type="text" 
                  required
                  placeholder="+1 (555) 123-4567"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-655 transition-all font-medium text-slate-805"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pb-1">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-0.5">Language Channel</label>
                  <select
                    value={regLang}
                    onChange={(e) => setRegLang(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-semibold"
                  >
                    <option value="Spanish ↔ English">Spanish ↔ English</option>
                    <option value="Russian ↔ English">Russian ↔ English</option>
                    <option value="Mandarin ↔ English">Mandarin ↔ English</option>
                    <option value="Vietnamese ↔ English">Vietnamese ↔ English</option>
                    <option value="French ↔ English">French ↔ English</option>
                    <option value="Arabic ↔ English">Arabic ↔ English</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-0.5">Specialist Class</label>
                  <select
                    value={regType}
                    onChange={(e) => setRegType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-semibold"
                  >
                    <option value="medical">Medical Specialist</option>
                    <option value="legal">Legal Specialist</option>
                    <option value="community">Community / General</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 cursor-pointer hover:bg-indigo-700 transition-all flex items-center justify-center gap-1 mt-2.5"
              >
                Launch Onboarding Application <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        <div className="bg-slate-50 border-t border-slate-100 p-4 font-normal text-[10px] text-slate-455 leading-relaxed text-center">
          By utilizing the simulator, you agree to comply with standard evaluation rules. Vozara document review cycles are logged and tracked for audit trace metrics.
        </div>
      </div>
    </div>
  );
};
