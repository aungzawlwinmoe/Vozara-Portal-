import React from 'react';
import { User, InterpreterProfile } from '../types';
import { Shield, Sparkles, UserCheck, Eye, Compass, HelpCircle } from 'lucide-react';

interface RoleSwitcherProps {
  currentSimulatedUser: User;
  allSimulatedUsers: User[];
  interpreterProfiles: InterpreterProfile[];
  onUserSelect: (user: User) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentSimulatedUser,
  allSimulatedUsers,
  interpreterProfiles,
  onUserSelect
}) => {
  return (
    <div id="role-switcher-panel" className="bg-slate-900 border-b border-slate-800 text-slate-300 py-2.5 px-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500/10 text-indigo-400 p-1 rounded-md">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <span className="font-semibold text-white tracking-wider uppercase text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 mr-2">
              Simulation Sandbox
            </span>
            <span className="text-slate-400">
              Switch profiles below to test complete compliance, pending reviewers & admin panels.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-medium">Simulate Profile:</span>
          {allSimulatedUsers.map((u) => {
            const isSelected = u.id === currentSimulatedUser.id;
            const profile = interpreterProfiles.find(p => p.userId === u.id);
            const rate = profile ? `${profile.completionRate}%` : null;
            
            let colorStyle = 'bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-400';
            if (isSelected) {
              if (u.role === 'admin') colorStyle = 'bg-indigo-600 border-indigo-500 text-white font-semibold ring-2 ring-indigo-400/20';
              else if (u.role === 'reviewer') colorStyle = 'bg-sky-600 border-sky-500 text-white font-semibold ring-2 ring-sky-400/20';
              else if (profile?.riskFlag) colorStyle = 'bg-rose-600 border-rose-500 text-white font-semibold ring-2 ring-rose-400/20';
              else if (rate === '100%') colorStyle = 'bg-emerald-600 border-emerald-500 text-white font-semibold ring-2 ring-emerald-400/20';
              else colorStyle = 'bg-slate-750 border-slate-600 text-white font-semibold ring-2 ring-slate-550/20';
            }

            return (
              <button
                key={u.id}
                id={`switcher-btn-${u.id}`}
                onClick={() => onUserSelect(u)}
                className={`flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg border transition-all duration-200 cursor-pointer ${colorStyle}`}
              >
                {u.role === 'admin' && <Shield className="w-3.5 h-3.5" />}
                {u.role === 'reviewer' && <Eye className="w-3.5 h-3.5" />}
                {u.role === 'interpreter' && <UserCheck className="w-3.5 h-3.5" />}
                
                <span className="truncate max-w-[110px]">{u.name}</span>

                {u.role === 'interpreter' && rate && (
                  <span className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {profile?.riskFlag ? '⚠️ Flagged' : rate}
                  </span>
                )}
                {u.role === 'reviewer' && (
                  <span className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-black/30' : 'bg-slate-850'
                  } text-sky-200`}>Reviewer</span>
                )}
                {u.role === 'admin' && (
                  <span className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-black/30' : 'bg-slate-850'
                  } text-indigo-200`}>Admin</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
