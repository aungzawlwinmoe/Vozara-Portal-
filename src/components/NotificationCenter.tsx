import React, { useState } from 'react';
import { Notification } from '../types';
import { Bell, BellOff, Check, AlertTriangle, CheckCircle, Info, X, Trash2 } from 'lucide-react';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-sky-500" />;
    }
  };

  return (
    <div className="relative">
      {/* BELL COUNTER */}
      <button
        id="bell-icon-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        title="Check system notifications log"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {unreadCount > 0 && (
          <span 
            id="unread-badge-cnt"
            className="absolute top-1 right-1 bg-rose-500 text-white font-sans text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN OVERLAY panel */}
      {isOpen && (
        <div id="notif-dropdown-dialog" className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 overflow-hidden animate-slideDown">
          <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
            <div className="flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-xs uppercase tracking-wider">Automated Notification Alerts</span>
            </div>
            {notifications.length > 0 && (
              <button 
                onClick={onClearAll}
                className="text-[10px] bg-white/10 hover:bg-white/20 text-white font-bold py-1 px-2.5 rounded-lg border border-white/5 cursor-pointer text-center"
              >
                Clear Archs
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-150 max-h-[320px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400 font-medium italic flex flex-col items-center justify-center gap-1.5">
                <BellOff className="w-6 h-6 text-slate-300" />
                No notification alerts logged yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  id={`notif-${notif.id}`} 
                  className={`p-3.5 flex items-start gap-3 text-xs transition-colors hover:bg-slate-50/50 ${
                    notif.read ? 'bg-white opacity-70' : 'bg-slate-50/70 border-l-4 border-indigo-500 font-medium'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="font-bold text-slate-800 flex items-center justify-between gap-2">
                      <span className="truncate">{notif.title}</span>
                      {!notif.read && (
                        <button
                          onClick={() => onMarkAsRead(notif.id)}
                          className="text-[9.5px] text-indigo-650 hover:underline hover:text-indigo-805 cursor-pointer shrink-0"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                    <p className="text-slate-600 mt-1 leading-normal select-text">{notif.message}</p>
                    <span className="text-[9px] text-slate-400 font-mono block mt-1.5">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 bg-slate-50 border-t border-slate-150 text-[10px] text-slate-450 text-center font-normal">
            Logs demonstrate background sending of emails triggered by our reviewer lifecycle events.
          </div>
        </div>
      )}
    </div>
  );
};
