
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Mail, Database, Activity, 
  Settings, ArrowLeft, RefreshCw,
  MoreVertical, ShieldCheck, AlertCircle, 
  Clock, Server, Search, Filter, 
  CheckCircle2, PauseCircle, ChevronRight,
  Sun, Moon, Palette
} from 'lucide-react';
import { View, ThemeMode } from '../App';
import { LogoBlack, LogoWhite } from './Logo';

const MotionDiv = motion.div as any;

interface AdminPageProps {
  onNavigate: (v: View) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const THEME_COLORS = {
  light: {
    bg: 'bg-[#F8F9FA]',
    card: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-900',
    muted: 'text-gray-500',
    primary: 'text-[#2D62ED]',
    accent: 'bg-[#2D62ED]'
  },
  dark: {
    bg: 'bg-[#0B0C0D]',
    card: 'bg-[#131416]',
    border: 'border-[#25282B]',
    text: 'text-[#ECEEF2]',
    muted: 'text-[#9499A1]',
    primary: 'text-[#4D7FFF]',
    accent: 'bg-[#4D7FFF]'
  },
  colored: {
    bg: 'bg-[#F8F9FA]',
    card: 'bg-white',
    border: 'border-[#E2E8F0]',
    text: 'text-gray-900',
    muted: 'text-slate-500',
    primary: 'text-[#2D62ED]',
    accent: 'bg-[#2D62ED]'
  }
};

const MetricCard: React.FC<{ 
  icon: any; 
  label: string; 
  value: string; 
  subValue: string; 
  theme: any;
}> = ({ icon: Icon, label, value, subValue, theme }) => (
  <div className={`p-6 rounded-2xl border ${theme.card} ${theme.border} shadow-sm transition-all duration-700`}>
    <div className="flex items-center gap-4 mb-4">
      <div className={`p-2.5 rounded-xl ${theme.bg} ${theme.primary}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className={`text-xs font-bold uppercase tracking-widest ${theme.muted}`}>{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <h4 className={`text-2xl font-black tracking-tight ${theme.text}`}>{value}</h4>
      <span className="text-[10px] font-bold text-green-500">{subValue}</span>
    </div>
  </div>
);

const HealthChart: React.FC<{ theme: any }> = ({ theme }) => (
  <div className="h-24 w-full flex items-end gap-1 px-1">
    {[40, 45, 38, 52, 60, 58, 65, 70, 68, 75, 80, 78, 85, 90, 88, 92, 95, 98, 97, 99].map((h, i) => (
      <div 
        key={i} 
        className={`flex-1 rounded-t-sm transition-all duration-1000 ${theme.accent}`} 
        style={{ height: `${h}%`, opacity: 0.1 + (i * 0.04) }}
      ></div>
    ))}
  </div>
);

const AdminPage: React.FC<AdminPageProps> = ({ onNavigate, themeMode, setThemeMode }) => {
  const t = THEME_COLORS[themeMode];
  const [activeTab, setActiveTab] = useState('overview');

  const users = [
    { name: 'Alex Rivera', email: 'alex@shoora.io', role: 'Admin', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=alex' },
    { name: 'Jordan Smith', email: 'jordan.s@gmail.com', role: 'User', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=jordan' },
    { name: 'Maria Garcia', email: 'm.garcia@outlook.com', role: 'User', status: 'Suspended', avatar: 'https://i.pravatar.cc/150?u=maria' },
    { name: 'Sam Wilson', email: 'sam@tech.co', role: 'User', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=sam' },
    { name: 'Elena Vance', email: 'vance@blackmesa.org', role: 'Admin', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=elena' },
  ];

  const getToggleButtonStyles = (btnMode: ThemeMode) => {
    const isActive = themeMode === btnMode;
    if (themeMode === 'light') {
      if (isActive) return { background: '#000000', color: '#ffffff' };
      return { background: 'transparent', color: '#000000' };
    }
    if (themeMode === 'dark') {
      if (isActive) return { background: '#ffffff', color: '#000000' };
      return { background: 'transparent', color: '#ffffff' };
    }
    if (themeMode === 'colored') {
      if (isActive) return { background: 'linear-gradient(45deg, #2D62ED, #1E40AF)', color: '#ffffff' };
      return { background: 'transparent', color: '#2D62ED' };
    }
    return { background: 'transparent', color: 'inherit' };
  };

  return (
    <div className={`min-h-screen ${t.bg} transition-colors duration-700`}>
      <div className="max-w-[1600px] mx-auto flex h-screen overflow-hidden">
        
        {/* Sidebar Nav - Fixed height to match viewport */}
        <div className={`w-64 h-full border-r ${t.border} p-6 hidden xl:flex flex-col gap-8`}>
          <div className="flex items-center gap-3 px-2">
            {themeMode === 'dark' ? <LogoWhite className="w-8 h-8" /> : <LogoBlack className="w-8 h-8" style={{ fill: themeMode === 'colored' ? '#2D62ED' : 'black' }} />}
            <span className={`text-xl font-black tracking-tighter ${t.text}`}>Admin</span>
          </div>

          <div className="flex flex-col gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'servers', label: 'Server Status', icon: Server },
              { id: 'logs', label: 'System Logs', icon: Clock },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === item.id ? `${t.accent} text-white shadow-md` : `${t.muted} hover:bg-black/5 dark:hover:bg-white/5`
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-4">
            {/* Theme Toggle Switch */}
            <div className={`flex items-center gap-1 p-1 rounded-2xl border transition-all duration-700 bg-black/5 dark:bg-white/5`} style={{ borderColor: t.border.split('-')[1] }}>
               {(['light', 'dark', 'colored'] as ThemeMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setThemeMode(mode)}
                    className={`p-2 rounded-xl flex-1 flex items-center justify-center transition-all duration-700 ${themeMode === mode ? 'shadow-lg scale-105 opacity-100' : 'opacity-60 hover:opacity-100'}`}
                    style={getToggleButtonStyles(mode)}
                  >
                    {mode === 'light' && <Sun className="w-4 h-4" />}
                    {mode === 'dark' && <Moon className="w-4 h-4" />}
                    {mode === 'colored' && <Palette className="w-4 h-4" />}
                  </button>
               ))}
            </div>

            <button 
              onClick={() => onNavigate('landing')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold w-full transition-all ${t.muted} hover:bg-black/5 dark:hover:bg-white/5`}
            >
              <ArrowLeft className="w-4 h-4" />
              Exit Dashboard
            </button>
          </div>
        </div>

        {/* Main Content - No top padding, just internal content margins */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className={`text-3xl font-black tracking-tighter mb-1 ${t.text}`}>Admin Command Center</h1>
              <p className={`text-sm font-medium ${t.muted}`}>Monitor system health and manage global workspace configurations.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className={`p-3 rounded-xl border ${t.border} ${t.card} ${t.muted} hover:shadow-sm transition-all`}>
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className={`px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all active:scale-95 ${t.accent}`}>
                System Maintenance
              </button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <MetricCard icon={Users} label="Total Users" value="1,248,810" subValue="+1.2k today" theme={t} />
            <MetricCard icon={Mail} label="Emails Sent (24h)" value="450,292" subValue="+14% vs avg" theme={t} />
            <MetricCard icon={Database} label="Storage Used" value="12.4 PB" subValue="82% capacity" theme={t} />
            <MetricCard icon={Activity} label="Active Sessions" value="8,241" subValue="Stable" theme={t} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
            
            {/* Table Area */}
            <div className={`lg:col-span-2 rounded-[32px] border ${t.border} ${t.card} overflow-hidden shadow-sm transition-all duration-700`}>
              <div className="p-8 border-b transition-colors duration-700" style={{ borderColor: t.border.split('-')[1] }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className={`text-xl font-black tracking-tight ${t.text}`}>Recent Users</h3>
                  <div className="flex items-center gap-2">
                    <div className={`relative flex-1 sm:w-64`}>
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.muted}`} />
                      <input 
                        type="text" 
                        placeholder="Search users..." 
                        className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm border ${t.border} bg-transparent outline-none focus:ring-1 focus:ring-blue-500`} 
                      />
                    </div>
                    <button className={`p-2 rounded-xl border ${t.border} ${t.muted}`}><Filter className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`text-[10px] font-black uppercase tracking-widest ${t.muted} bg-black/5 dark:bg-white/5`}>
                      <th className="px-8 py-4">User Details</th>
                      <th className="px-8 py-4">Email Address</th>
                      <th className="px-8 py-4">Role</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors duration-700`} style={{ borderColor: t.border.split('-')[1] }}>
                    {users.map((user, i) => (
                      <tr key={i} className="group hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <img src={user.avatar} className="w-9 h-9 rounded-xl object-cover shadow-sm" alt="" />
                            <span className={`text-sm font-bold ${t.text}`}>{user.name}</span>
                          </div>
                        </td>
                        <td className={`px-8 py-5 text-sm font-medium ${t.muted}`}>{user.email}</td>
                        <td className="px-8 py-5">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                            user.role === 'Admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            {user.status === 'Active' ? (
                              <div className="flex items-center gap-1.5 text-green-500">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold uppercase tracking-wide">Active</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-amber-500">
                                <PauseCircle className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold uppercase tracking-wide">Suspended</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button className={`p-2 rounded-lg opacity-20 group-hover:opacity-100 transition-all ${t.text}`}>
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Health Visualizer */}
            <div className="flex flex-col gap-8">
              <div className={`p-8 rounded-[32px] border ${t.border} ${t.card} shadow-sm transition-all duration-700`}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Server className={`w-5 h-5 ${t.primary}`} />
                    <h3 className={`text-lg font-black tracking-tight ${t.text}`}>System Health</h3>
                  </div>
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    99.98% Uptime
                  </span>
                </div>
                
                <HealthChart theme={t} />
                
                <div className="mt-8 space-y-4">
                  {[
                    { label: 'Cloud API', status: 'Healthy', delay: '12ms' },
                    { label: 'Auth Engine', status: 'Healthy', delay: '4ms' },
                    { label: 'DB Cluster', status: 'Stable', delay: '18ms' },
                  ].map((item, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5`}>
                      <span className={`text-xs font-bold ${t.text}`}>{item.label}</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold ${t.muted}`}>{item.delay}</span>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-8 rounded-[32px] border ${t.border} ${t.accent} text-white shadow-xl transition-all duration-700 group cursor-pointer`}>
                <h3 className="text-xl font-black mb-2 tracking-tight">Security Audit</h3>
                <p className="text-sm font-medium opacity-80 mb-6 leading-relaxed">Run a global security scan across all user workspaces to detect vulnerabilities.</p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-8 h-8 rounded-full border-2 border-white/20" />)}
                  </div>
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
