import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Search, Star, Send, FileText, Trash2, Mail,
  ChevronDown, MoreHorizontal, Reply, Forward, Mails, Pin,
  Plus, Circle, LogOut, Sun, Moon, Palette, ArrowLeft, X, Check, Loader2,
  Settings, Bell, Shield, HelpCircle, Inbox, RefreshCw,
  Clock, Calendar, Archive, AlertCircle, RotateCcw
} from 'lucide-react';
import { ThemeMode } from '../App';
import { LogoBlack, LogoWhite } from './Logo';
import api from '../axios';

const MotionDiv = motion.div as any;

const THEMES = {
  light: {
    sidebarBg: '#FFFFFF',
    middlePaneBg: '#F8F9FA',
    rightPaneBg: '#FFFFFF',
    textMain: '#000000',
    textMuted: '#6C757D',
    border: '#E9ECEF',
    itemBg: '#F8F9FA',
    itemActiveBg: '#E3F2FD',
    primary: '#2D62ED',
    unread: '#FF6B6B',
    attachmentBg: '#F1F3F4',
    inputBg: '#F8F9FA',
  },
  dark: {
    sidebarBg: '#1A1A1A',
    middlePaneBg: '#121212',
    rightPaneBg: '#1A1A1A',
    textMain: '#FFFFFF',
    textMuted: '#B0B0B0',
    border: '#333333',
    itemBg: '#1A1A1A',
    itemActiveBg: '#2D2D2D',
    primary: '#4A90E2',
    unread: '#FF6B6B',
    attachmentBg: '#2D2D2D',
    inputBg: '#2D2D2D',
  },
  colored: {
    sidebarBg: '#FFFFFF',
    middlePaneBg: '#F8F9FA',
    rightPaneBg: '#FFFFFF',
    textMain: '#0e4c6d',
    textMuted: '#6C757D',
    border: '#E9ECEF',
    itemBg: '#F8F9FA',
    itemActiveBg: '#E3F2FD',
    primary: '#2D62ED',
    unread: '#FF6B6B',
    attachmentBg: '#F1F3F4',
    inputBg: '#F8F9FA',
  },
};

interface ThemeColors {
  sidebarBg: string;
  middlePaneBg: string;
  rightPaneBg: string;
  textMain: string;
  textMuted: string;
  border: string;
  itemBg: string;
  itemActiveBg: string;
  primary: string;
  unread: string;
  attachmentBg: string;
  inputBg: string;
}

interface Message {
  id: string;
  sender: string;
  senderEmail: string;
  to: string;
  toEmail: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  unread?: boolean;
  flagged?: boolean;
  categoryColor?: string;
  category?: string;
  attachments?: boolean;
  avatar: string;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash';
  important?: boolean;
}

const MOCK_MESSAGES: Message[] = [
];

const SidebarItem: React.FC<{ icon: any; label: string; count?: number; active?: boolean; color?: string; isCollapsed: boolean; colors: ThemeColors; onClick?: () => void }> = ({ icon: Icon, label, count, active, color, isCollapsed, colors, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center ${isCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'justify-between px-4 py-2.5'} rounded-xl cursor-pointer transition-all duration-700 ease-in-out group`}
    style={{ backgroundColor: active ? colors.itemActiveBg : 'transparent' }}
  >
    <div className="flex items-center gap-3">
      {color ? (
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors duration-700" style={{ backgroundColor: color }}></div>
      ) : (
        <Icon className="w-5 h-5 flex-shrink-0 transition-colors duration-700" style={{ color: active ? colors.primary : colors.textMuted }} />
      )}
      {!isCollapsed && (
        <span className="text-[13px] font-bold whitespace-nowrap transition-colors duration-700" style={{ color: active ? (colors.primary) : colors.textMuted }}>{label}</span>
      )}
    </div>
    {!isCollapsed && count && (
      <span className="text-[11px] font-bold opacity-60 group-hover:opacity-100 transition-all duration-700" style={{ color: colors.textMuted }}>{count.toLocaleString()}</span>
    )}
  </div>
);

interface UserData {
  userName: string;
  email: string;
  inboxMails?: any[];
}
interface DashboardProps {
  userData: UserData;
  onLogout?: () => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  customTextColor: string;
  customBgColor: string;
  setCustomTextColor: (color: string) => void;
  setCustomBgColor: (color: string) => void;
}

const getAvatarColor = (name: string) => {
  const colors = [
    '#C62828', '#AD1457', '#6A1B9A', '#4527A0', '#283593',
    '#1565C0', '#0277BD', '#00838F', '#00695C', '#2E7D32',
    '#558B2F', '#9E9D24', '#F9A825', '#FF8F00', '#EF6C00',
    '#D84315', '#4E342E', '#424242', '#37474F'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const Dashboard: React.FC<DashboardProps> = ({ onLogout, themeMode, setThemeMode, userData, customTextColor, customBgColor, setCustomTextColor, setCustomBgColor }) => {
  const initialMessages = MOCK_MESSAGES;
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMailId, setSelectedMailId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<string>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isComposeMode, setIsComposeMode] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [isDeleteWarningOpen, setIsDeleteWarningOpen] = useState(false);
  const [isLogoutWarningOpen, setIsLogoutWarningOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: string, message: string, type: 'success' | 'error' }[]>([]);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });
  const [isReloading, setIsReloading] = useState(false);
  const [settings, setSettings] = useState({ notifications: true, autoReply: false });
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tempCustomTextColor, setTempCustomTextColor] = useState(customTextColor);
  const [tempCustomBgColor, setTempCustomBgColor] = useState(customBgColor);

  const textColors = ['#72bad5', '#0e4c6d', '#03324e', '#ef4043', '#be1e2d', '#c43240', '#ff8c00'];
  const bgColors = ['#84e3c8', '#dcedc1', '#b6e2dd', '#FFFFFF'];

  const colors = themeMode === 'colored' ? {
    ...THEMES.colored,
    textMain: tempCustomTextColor,
    sidebarBg: tempCustomBgColor,
    middlePaneBg: tempCustomBgColor,
    rightPaneBg: tempCustomBgColor,
    itemActiveBg: tempCustomBgColor,
    inputBg: tempCustomBgColor,
  } : THEMES[themeMode];

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    fetchMessages();
  }, [activeFolder]);

  // Auto-save drafts
  useEffect(() => {
    const saveDraft = async () => {
      if (isComposeMode && (composeData.to || composeData.subject || composeData.body)) {
        try {
          await api.post('/api/save-draft', { ...composeData, email: userData.email });
        } catch (e) { /* Silent fail for drafts */ }
      }
    };
    const timer = setTimeout(saveDraft, 2000);
    return () => clearTimeout(timer);
  }, [composeData, isComposeMode]);

  const selectedMail = messages.find(m => m.id === selectedMailId) || null;

  const filteredMessages = messages.filter(msg => {
    let matchesFolder = false;
    if (activeFolder === 'inbox') matchesFolder = msg.folder === 'inbox';
    else if (activeFolder === 'starred') matchesFolder = !!msg.flagged;
    else if (activeFolder === 'important') matchesFolder = !!msg.important;
    else if (activeFolder === 'sent') matchesFolder = msg.folder === 'sent';
    else if (activeFolder === 'drafts') matchesFolder = msg.folder === 'drafts';
    else if (activeFolder === 'all') matchesFolder = msg.folder !== 'trash';
    else if (activeFolder === 'trash') matchesFolder = msg.folder === 'trash';
    else if (['work', 'personal', 'promotions'].includes(activeFolder)) matchesFolder = msg.category === activeFolder && msg.folder !== 'trash';

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      msg.subject.toLowerCase().includes(searchLower) ||
      msg.sender.toLowerCase().includes(searchLower) ||
      msg.preview.toLowerCase().includes(searchLower);

    return matchesFolder && matchesSearch;
  });

  const handleSelectMail = (mail: Message) => {
    setSelectedMailId(mail.id);
    if (mail.unread) {
      setMessages(prev => prev.map(m => m.id === mail.id ? { ...m, unread: false } : m));
      api.post('/api/mark-read', { messageId: mail.id, email: userData.email, password: localStorage.getItem('password'), read: true }).catch(() => { });
    }
  };

  const handleDelete = () => {
    if (!selectedMail) return;
    if (selectedMail.folder === 'trash') {
      setIsDeleteWarningOpen(true);
    } else {
      setMessages(prev => prev.map(m => m.id === selectedMail.id ? { ...m, folder: 'trash' } : m));
      setSelectedMailId(null);
      showToast('Moved to trash', 'success');
      api.post('/api/move-mail', { messageId: selectedMail.id, email: userData.email, password: localStorage.getItem('password'), destinationFolder: 'Trash' }).catch(() => {
        showToast('Failed to move to trash', 'error');
        // Revert logic could be added here
      });
    }
  };

  const confirmDelete = () => {
    if (!selectedMail) return;
    setMessages(prev => prev.filter(m => m.id !== selectedMail.id));
    setSelectedMailId(null);
    setIsDeleteWarningOpen(false);
    showToast('Deleted permanently', 'success');
    api.post('/api/delete-mail', { messageId: selectedMail.id, email: userData.email, password: localStorage.getItem('password') }).catch(() => {
      showToast('Failed to delete', 'error');
    });
  };

  const confirmLogout = () => {
    if (onLogout) onLogout();
    setIsLogoutWarningOpen(false);
  };

  const handleImportant = () => {
    if (!selectedMail) return;
    setMessages(prev => prev.map(m => m.id === selectedMail.id ? { ...m, important: !m.important } : m));
    api.post('/api/toggle-important', { messageId: selectedMail.id, important: !selectedMail.important, email: userData.email, password: localStorage.getItem('password') }).catch(() => { });
  };

  const handleRestore = () => {
    if (!selectedMail) return;
    setMessages(prev => prev.map(m => m.id === selectedMail.id ? { ...m, folder: 'inbox' } : m));
    setSelectedMailId(null);
    api.post('/api/move-mail', { messageId: selectedMail.id, email: userData.email, password: localStorage.getItem('password'), destinationFolder: 'INBOX' }).catch(() => { });
  };

  const handleStar = () => {
    if (!selectedMail) return;
    setMessages(prev => prev.map(m => m.id === selectedMail.id ? { ...m, flagged: !m.flagged } : m));
    api.post('/api/toggle-star', { messageId: selectedMail.id, starred: !selectedMail.flagged, email: userData.email, password: localStorage.getItem('password') }).catch(() => { });
  };

  const fetchMessages = async () => {
    setIsReloading(true);
    try {
      const password = localStorage.getItem('password');
      let endpoint = '/api/inbox-fetch';
      let payload: any = { email: userData.email, password: password || '' };
      let currentFolder = 'inbox';

      // Use folder-fetch for specific IMAP folders
      const specificFolders = ['sent', 'drafts', 'trash'];
      if (specificFolders.includes(activeFolder)) {
        endpoint = '/api/folder-fetch';
        const folderMap: Record<string, string> = {
          sent: 'Sent',
          drafts: 'Drafts',
          trash: 'Trash',
          snoozed: 'Snoozed',
          scheduled: 'Scheduled'
        };
        payload.folder = folderMap[activeFolder];
        currentFolder = activeFolder;
      } else {
        // For inbox, all, starred, important, categories - fetch all and filter client-side
        currentFolder = activeFolder === 'all' ? 'inbox' : activeFolder;
      }

      const response = await api.post(endpoint, payload);
      const data = response.data;

      if (data.success) {
        const rawMails = data.data.mails;
        const fetchedMails = Array.isArray(rawMails) ? rawMails : [];
        const categories = ['work', 'personal', 'promotions'];

        const mappedMessages: Message[] = fetchedMails.map((mail: any, index: number) => {
          // Robust sender extraction to handle objects/arrays from IMAP parsers
          let senderName = mail.sender;
          let senderAddress = mail.senderEmail;

          // Assign category randomly for demo purposes
          const assignedCategory = categories[index % categories.length];

          return {
            id: mail.messageId || mail.id || String(index + 1),
            sender: senderName,
            senderEmail: senderAddress,
            to: mail.to,
            toEmail: mail.toEmail,
            subject: typeof mail.subject === 'string' ? mail.subject : (mail.subject?.text || '(No Subject)'),
            preview: (mail.preview || '').replace(/<[^>]*>?/gm, ''),
            body: mail.body || '',
            date: mail.date ? new Date(mail.date).toLocaleDateString() : new Date().toLocaleDateString(),
            unread: mail.unread,
            flagged: mail.flagged,
            categoryColor: '#2D62ED',
            category: assignedCategory,
            attachments: !!mail.attachments && mail.attachments.length > 0,
            avatar: `https://i.pravatar.cc/100?u=${senderAddress}`,
            folder: currentFolder as any,
            important: mail.important, // Could be set based on some logic or randomly for demo
          };
        });

        userData.inboxMails = mappedMessages;
        setMessages(mappedMessages);
        showToast(`${activeFolder} synced successfully`, 'success');
      }
    } catch (error) {
      console.error("Failed to fetch mails", error);
      showToast('Failed to sync', 'error');
    } finally {
      setIsReloading(false);
    }
  };

  const handleSend = async () => {
    if (!composeData.to || !composeData.subject || !composeData.body) {
      showToast('Please fill all fields', 'error');
      return;
    }
    setIsReloading(true);
    try {
      await api.post('/api/send-mail', { ...composeData, email: userData.email, password: localStorage.getItem('password') });
      showToast('Email sent successfully', 'success');

      const sentMsg: Message = {
        id: Date.now().toString(),
        sender: userData.userName || 'Me',
        senderEmail: userData.email,
        to: composeData.to,
        toEmail: composeData.to,
        subject: composeData.subject,
        preview: composeData.body.substring(0, 100),
        body: composeData.body,
        date: 'Just now',
        folder: 'sent',
        avatar: `https://i.pravatar.cc/100?u=${userData.email}`,
        unread: false
      };
      setMessages(prev => [sentMsg, ...prev]);
      setIsComposeMode(false);
      setComposeData({ to: '', subject: '', body: '' });
    } catch (e) {
      showToast('Failed to send email', 'error');
    } finally {
      setIsReloading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!composeData.to && !composeData.subject && !composeData.body) {
      showToast('Nothing to save', 'error');

      return;
    }
    setIsReloading(true);
    try {
      await api.post('/api/save-draft', { ...composeData, email: userData.email, password: localStorage.getItem('password') });
      showToast('Draft saved successfully', 'success');
    } catch (e) {
      showToast('Failed to save draft', 'error');
    } finally {
      setIsReloading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.post('/api/settings', { email: userData.email, ...settings });
      showToast('Settings saved', 'success');
      setIsSettingsOpen(false);
    } catch (e) {
      showToast('Failed to save settings', 'error');
    }
  };


  const scrollbarClass = `custom-scrollbar ${themeMode !== 'light' ? 'dark-scrollbar' : ''}`;

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
      if (isActive) return { background: customBgColor, color: customTextColor };
      return { background: 'transparent', color: customTextColor };
    }

    return { background: 'transparent', color: 'inherit' };
  };

  return (
    <>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=DynaPuff:wght@400..700&display=swap');`}
      </style>
      <div className={`flex h-screen w-full overflow-hidden font-sans transition-colors duration-700 ease-in-out`} style={{ backgroundColor: colors.middlePaneBg }}>
        <MotionDiv
          initial={false}
          animate={{
            width: isMobile ? '280px' : (isCollapsed ? 88 : '20%'),
            x: (isMobile && !mobileSidebarOpen) ? -300 : 0,
            opacity: 1
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`fixed lg:relative z-50 lg:z-auto h-full border-r flex flex-col transition-all duration-700 ease-in-out`}
          style={{
            backgroundColor: colors.sidebarBg,
            borderColor: colors.border,
          }}
        >
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center gap-4 h-12 overflow-hidden mb-8">
              <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-4 rounded-xl hidden lg:block hover:bg-black/5 transition-colors duration-700" style={{ color: colors.textMuted }}>
                <Menu className="w-6 h-6 " />
              </button>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-2 rounded-xl lg:hidden hover:bg-black/5 transition-colors duration-700" style={{ color: colors.textMuted }}>
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2 min-w-max">
                {themeMode === 'dark' ? <LogoWhite className="w-7 h-7" style={{ fill: colors.textMain }} /> : <LogoBlack className="w-7 h-7" style={{ fill: colors.textMain }} />}
                <span className="text-xl font-black tracking-tighter transition-colors duration-700" style={{ color: colors.textMain }}>ShooraMail</span>
              </div>
            </div>

            <div className={`flex flex-col gap-1 overflow-y-auto ${scrollbarClass} flex-grow`}>
              <SidebarItem icon={Inbox} label="Inbox" count={messages.filter(m => m.folder === 'inbox' && m.flagged).length || undefined} active={activeFolder === 'inbox'} onClick={() => setActiveFolder('inbox')} isCollapsed={isCollapsed && !isMobile} colors={colors} />
              <SidebarItem icon={Star} label="Starred" count={messages.filter(m => m.flagged).length || undefined} active={activeFolder === 'starred'} onClick={() => setActiveFolder('starred')} isCollapsed={isCollapsed && !isMobile} colors={colors} />
              <SidebarItem icon={Pin} label="Important" count={messages.filter(m => m.important).length || undefined} active={activeFolder === 'important'} onClick={() => setActiveFolder('important')} isCollapsed={isCollapsed && !isMobile} colors={colors} />
              <SidebarItem icon={Send} label="Sent" count={messages.filter(m => m.folder === 'sent').length || undefined} active={activeFolder === 'sent'} onClick={() => setActiveFolder('sent')} isCollapsed={isCollapsed && !isMobile} colors={colors} />
              <SidebarItem icon={FileText} label="Drafts" count={messages.filter(m => m.folder === 'drafts').length || undefined} active={activeFolder === 'drafts'} onClick={() => setActiveFolder('drafts')} isCollapsed={isCollapsed && !isMobile} colors={colors} />
              <SidebarItem icon={Mails} label="All Mails" count={messages.filter(m => m.folder !== 'trash').length || undefined} active={activeFolder === 'all'} onClick={() => setActiveFolder('all')} isCollapsed={isCollapsed && !isMobile} colors={colors} />
              <SidebarItem icon={Settings} label="Settings" onClick={() => setIsSettingsOpen(true)} isCollapsed={isCollapsed && !isMobile} colors={colors} />
              <SidebarItem icon={Trash2} label="Trash" count={messages.filter(m => m.folder === 'trash').length || undefined} active={activeFolder === 'trash'} onClick={() => setActiveFolder('trash')} isCollapsed={isCollapsed && !isMobile} colors={colors} />

              {(!isCollapsed || isMobile) && (
                <p className="px-4 mt-8 mb-2 text-[10px] font-black uppercase tracking-widest opacity-40 transition-colors duration-700" style={{ color: colors.textMain }}>Categories</p>
              )}
              <SidebarItem icon={Circle} label="Work" color="#34A853" active={activeFolder === 'work'} onClick={() => setActiveFolder('work')} isCollapsed={isCollapsed && !isMobile} colors={colors} />
              <SidebarItem icon={Circle} label="Personal" color="#FFB800" active={activeFolder === 'personal'} onClick={() => setActiveFolder('personal')} isCollapsed={isCollapsed && !isMobile} colors={colors} />
              <SidebarItem icon={Circle} label="Promotions" color="#2D62ED" active={activeFolder === 'promotions'} onClick={() => setActiveFolder('promotions')} isCollapsed={isCollapsed && !isMobile} colors={colors} />
            </div>

            <div className="flex flex-col gap-4 pt-4 border-t mt-auto transition-colors duration-700" style={{ borderColor: colors.border }}>
              <div className={`flex items-center gap-1 p-1 rounded-2xl border transition-all duration-700 ${isCollapsed && !isMobile ? 'flex-col' : 'justify-between'}`} style={{ backgroundColor: colors.inputBg, borderColor: colors.border }}>
                {(['light', 'dark', 'colored'] as ThemeMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      if (mode === 'colored' && themeMode === 'colored') {
                        setThemeMode('colored');
                        setIsColorPaletteOpen(true);
                      }
                      else if (mode === 'colored') {
                        setThemeMode('colored');

                      } else {
                        setThemeMode(mode);
                      }
                    }}
                    className={`p-2 rounded-xl flex-1 flex items-center justify-center transition-all duration-700 ${themeMode === mode ? 'shadow-lg scale-105 opacity-100' : 'opacity-60 hover:opacity-100'}`}
                    style={getToggleButtonStyles(mode)}
                  >
                    {mode === 'light' && <Sun className="w-4 h-4" />}
                    {mode === 'dark' && <Moon className="w-4 h-4" />}
                    {mode === 'colored' && <Palette className="w-4 h-4" />}
                  </button>
                ))}
              </div>

              <div
                onClick={() => setIsLogoutWarningOpen(true)}
                className={`border p-1 rounded-[15px] flex items-center gap-2 cursor-pointer group hover:opacity-80 transition-all duration-700 ${isCollapsed && !isMobile ? 'justify-center p-2' : ''}`}
                style={{ backgroundColor: colors.itemActiveBg, borderColor: colors.border }}
              >
                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-2xl font-black" style={{ backgroundColor: getAvatarColor(userData.userName || 'User'), fontFamily: '"DynaPuff", cursive', WebkitTextStroke: '1px black', textShadow: '0px 0px 4px #ffffff80' }}>
                  {(userData.userName || 'U').charAt(0).toUpperCase()}
                </div>
                {(!isCollapsed || isMobile) && (
                  <div className="flex-1 overflow-hidden transition-all duration-700">
                    <span className="text-[12px] font-black block truncate transition-colors duration-700" style={{ color: colors.textMain }}>{userData.userName}</span>
                    <span className="text-[10px] font-bold opacity-60 truncate block transition-colors duration-700" style={{ color: colors.textMuted }}>{userData.email}</span>
                  </div>
                )}
                {(!isCollapsed || isMobile) && (
                  <LogOut className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-all duration-700" style={{ color: colors.textMain }} />
                )}
              </div>
            </div>
          </div>
        </MotionDiv>

        {mobileSidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-700" onClick={() => setMobileSidebarOpen(false)}></div>
        )}

        <div
          className={`w-full lg:w-[32%] xl:w-[30%] border-r flex flex-col h-full relative transition-all duration-700 ease-in-out
          ${(selectedMail && isMobile) ? 'hidden' : 'flex'}`}
          style={{ backgroundColor: colors.middlePaneBg, borderColor: colors.border }}
        >
          <div className="p-4 md:p-6 border-b z-10 sticky top-0 transition-all duration-700 ease-in-out" style={{ backgroundColor: colors.middlePaneBg, borderColor: colors.border }}>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3 lg:hidden">
                <button onClick={() => setMobileSidebarOpen(true)} className="p-2 hover:bg-black/5 rounded-lg transition-colors duration-700" style={{ color: colors.textMain }}>
                  <Menu className="w-6 h-6 transition-colors duration-700" style={{ color: colors.textMain }} />
                </button>
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter transition-colors duration-700 capitalize" style={{ color: colors.textMain }}>{activeFolder}</h2>
              <button onClick={() => { setSelectedMailId(null); setIsComposeMode(true); }} className={`p-2 rounded-full transition-all duration-700 ${themeMode === 'colored' ? 'bg-[#2D62ED]/10 text-[#2D62ED]' : 'hover:bg-black/5 text-current'}`} style={{ color: colors.textMain }}>
                <Plus className="w-6 h-6" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-700" style={{ color: colors.textMuted }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm outline-none transition-all duration-700 focus:ring-2"
                style={{ backgroundColor: colors.inputBg, color: colors.textMain } as any}
              />
            </div>
          </div>

          <div className={`flex-1 overflow-y-auto ${scrollbarClass} pb-24 transition-colors duration-700`}>
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleSelectMail(msg)}
                className="px-6 py-5 border-b cursor-pointer transition-all duration-700"
                style={{
                  backgroundColor: selectedMailId === msg.id ? colors.primary + '0D' : 'transparent',
                  borderColor: colors.border,
                  borderLeft: selectedMailId === msg.id ? `4px solid ${colors.primary}` : '4px solid transparent'
                }}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    {msg.unread ? <div className="w-2 h-2 rounded-full transition-colors duration-700" style={{ backgroundColor: colors.unread }}></div> : null}
                    <span className={`text-sm transition-colors duration-700 ${msg.unread ? 'font-black' : 'font-bold'}`} style={{ color: colors.textMain }}>{activeFolder === 'sent' ? msg.to : msg.sender}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider transition-colors duration-700" style={{ color: colors.textMuted }}>{msg.date}</span>
                </div>
                <h4 className="text-[13px] font-bold truncate mb-1 transition-colors duration-700" style={{ color: colors.textMain }}>{msg.subject}</h4>
                <p className="text-[11px] line-clamp-2 leading-relaxed transition-colors duration-700" style={{ color: colors.textMuted }}>{msg.preview}</p>
              </div>
            ))}

            <div className="p-6 flex justify-center">
              <button
                onClick={fetchMessages}
                disabled={isReloading}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all duration-700 hover:shadow-md active:scale-95 ${isReloading ? 'opacity-60 cursor-wait' : 'hover:scale-105'}`}
                style={{ backgroundColor: colors.itemActiveBg, color: colors.primary }}
              >
                <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
                <span>{isReloading ? 'Syncing...' : 'Reload Mails'}</span>
              </button>
            </div>
          </div>
        </div>

        <div
          className={`flex-1 flex flex-col h-full relative transition-all duration-700 ease-in-out
          ${(!selectedMail && !isComposeMode && isMobile) ? 'hidden' : 'flex'}`}
          style={{ backgroundColor: colors.rightPaneBg }}
        >
          {isComposeMode ? (
            <div className={`flex-1 overflow-y-auto p-6 md:p-12 lg:p-16 ${scrollbarClass} transition-colors duration-700`}>
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-[1.1] transition-colors duration-700" style={{ color: colors.textMain }}>New Message</h1>
                  <button onClick={() => setIsComposeMode(false)} className="p-2 rounded-lg hover:bg-black/5 transition-colors duration-700">
                    <X className="w-6 h-6 transition-colors duration-700" style={{ color: colors.textMuted }} />
                  </button>
                </div>
                <div className="flex flex-col gap-6">
                  <input value={composeData.to} onChange={e => setComposeData({ ...composeData, to: e.target.value })} placeholder="To" className="w-full p-4 rounded-xl border bg-transparent outline-none transition-colors" style={{ borderColor: colors.border, color: colors.textMain }} />
                  <input value={composeData.subject} onChange={e => setComposeData({ ...composeData, subject: e.target.value })} placeholder="Subject" className="w-full p-4 rounded-xl border bg-transparent outline-none transition-colors" style={{ borderColor: colors.border, color: colors.textMain }} />
                  <textarea value={composeData.body} onChange={e => setComposeData({ ...composeData, body: e.target.value })} placeholder="Message" className="w-full p-4 rounded-xl border bg-transparent outline-none h-64 resize-none transition-colors" style={{ borderColor: colors.border, color: colors.textMain }}></textarea>
                  <div className="flex justify-end gap-4">
                    <button onClick={handleSaveDraft} disabled={isReloading} className="px-6 py-2.5 rounded-xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2" style={{ backgroundColor: colors.itemActiveBg, color: colors.primary }}>
                      {isReloading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Draft
                    </button>
                    <button onClick={handleSend} disabled={isReloading} className="px-6 py-2.5 rounded-xl font-bold text-white shadow-lg hover:scale-105 transition-all flex items-center gap-2" style={{ backgroundColor: colors.primary }}>
                      {isReloading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedMail ? (
            <>
              <div className="p-4 border-b flex items-center justify-between sticky top-0 z-20 backdrop-blur-md transition-all duration-700" style={{ backgroundColor: colors.rightPaneBg + 'CC', borderColor: colors.border }}>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedMailId(null)} className="p-2 rounded-lg lg:hidden hover:bg-black/5 transition-colors duration-700">
                    <ArrowLeft className="w-6 h-6 transition-colors duration-700" style={{ color: colors.textMain }} />
                  </button>
                  <div className="hidden sm:flex gap-1">
                    {selectedMail.folder === 'trash' ? (
                      <button onClick={handleRestore} className={`p-2 rounded-lg hover:bg-black/5 transition-colors duration-700 ${themeMode === 'colored' ? 'text-[#2D62ED]' : ''}`} title="Restore"><RotateCcw className="w-5 h-5 opacity-60" /></button>
                    ) : (
                      <>
                        <button className={`p-2 rounded-lg hover:bg-black/5 transition-colors duration-700 ${themeMode === 'colored' ? 'text-[#2D62ED]' : ''}`} title="Reply"><Reply className="w-5 h-5 opacity-60" /></button>
                        <button className={`p-2 rounded-lg hover:bg-black/5 transition-colors duration-700 ${themeMode === 'colored' ? 'text-[#2D62ED]' : ''}`} title="Forward"><Forward className="w-5 h-5 opacity-60" /></button>
                        <button onClick={handleImportant} className="p-2 rounded-lg hover:bg-black/5 transition-colors duration-700" title="Mark as Important"><Pin className={`w-5 h-5 transition-all duration-700 ${selectedMail.important ? 'fill-red-500 text-red-500 opacity-100' : 'opacity-60'} ${themeMode === 'colored' ? 'text-[#2D62ED]' : ''}`} /></button>
                        <button onClick={handleStar} className="p-2 rounded-lg hover:bg-black/5 transition-colors duration-700" title="Star"><Star className={`w-5 h-5 transition-all duration-700 ${selectedMail.flagged ? 'fill-yellow-400 text-yellow-400 opacity-100' : 'opacity-60'} ${themeMode === 'colored' ? 'text-[#2D62ED]' : ''}`} /></button>
                      </>
                    )}
                    <button onClick={handleDelete} className="p-2 rounded-lg hover:bg-black/5 transition-colors duration-700" title={selectedMail.folder === 'trash' ? "Delete Permanently" : "Delete"}><Trash2 className="w-5 h-5 opacity-60 text-red-400" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest transition-all duration-700" style={{ borderColor: colors.border, color: colors.textMuted }}>
                    <Shield className="w-3 h-3 text-green-500" /> Secure
                  </div>
                  <button className={`p-2 rounded-lg hover:bg-black/5 transition-colors duration-700 ${themeMode === 'colored' ? 'text-[#2D62ED]' : ''}`}><MoreHorizontal className="w-5 h-5 opacity-60" /></button>
                </div>
              </div>

              <div className={`flex-1 overflow-y-auto p-6 md:p-12 lg:p-16 ${scrollbarClass} transition-colors duration-700`}>
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-3xl md:text-5xl font-black mb-10 tracking-tighter leading-[1.1] transition-colors duration-700" style={{ color: colors.textMain }}>{selectedMail.subject}</h1>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10 border-b pb-10 transition-colors duration-700" style={{ borderColor: colors.border }}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center text-white text-4xl font-black" style={{ backgroundColor: getAvatarColor(selectedMail.sender), fontFamily: '"DynaPuff", cursive', WebkitTextStroke: '1px black', textShadow: '0px 0px 4px #ffffff80' }}>
                        {selectedMail.sender.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-xl transition-colors duration-700" style={{ color: colors.textMain }}>{activeFolder === 'sent' ? selectedMail.to : selectedMail.sender}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase transition-all duration-700 ${themeMode === 'colored' ? 'bg-[#2D62ED]/10 text-[#2D62ED]' : 'bg-black/5'}`} style={{ color: colors.textMuted }}>Verified</span>
                        </div>
                        <p className="text-sm font-bold opacity-60 transition-colors duration-700" style={{ color: colors.textMuted }}>{activeFolder === 'sent' ? selectedMail.toEmail.toLowerCase() : selectedMail.senderEmail.toLowerCase()}</p>
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1 transition-colors duration-700" style={{ color: colors.textMuted }}>{activeFolder === 'sent' ? 'Sent' : 'Received'}</p>
                      <p className="text-sm font-black transition-colors duration-700" style={{ color: colors.textMain }}>{selectedMail.date}, 10:24 AM</p>
                    </div>
                  </div>

                  <div className="space-y-8 text-lg md:text-xl leading-[1.6] font-medium transition-colors duration-700" style={{ color: colors.textMain }}>
                    {selectedMail.body.includes('<') ? (
                      <div dangerouslySetInnerHTML={{ __html: selectedMail.body }}></div>
                    ) : (
                      <p>{selectedMail.body}</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-40 transition-all duration-700">
              <div className="w-24 h-24 rounded-full border-4 border-dashed mb-6 flex items-center justify-center transition-colors duration-700" style={{ borderColor: colors.border }}>
                <Mail className="w-10 h-10 transition-colors duration-700" style={{ color: colors.textMain }} />
              </div>
              <h3 className="text-xl font-black mb-2 transition-colors duration-700" style={{ color: colors.textMain }}>No message selected</h3>
              <p className="text-sm font-bold max-w-xs transition-colors duration-700" style={{ color: colors.textMuted }}>Select a conversation from the list to read its content here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id} initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-bold backdrop-blur-md border ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-red-500/10 border-red-500/20 text-red-600'}`}
            >
              {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>



      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ backgroundColor: colors.middlePaneBg }}
            >
              <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: colors.border }}>
                <h3 className="font-bold" style={{ color: colors.textMain }}>Settings</h3>
                <button onClick={() => setIsSettingsOpen(false)}><X className="w-5 h-5" style={{ color: colors.textMuted }} /></button>
              </div>
              <div className="p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <span className="font-bold" style={{ color: colors.textMain }}>Email Signature</span>
                  <button className="text-xs font-bold px-3 py-1 rounded-full bg-black/5" style={{ color: colors.primary }}>Edit</button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold" style={{ color: colors.textMain }}>Notifications</span>
                  <button
                    onClick={() => setSettings(s => ({ ...s, notifications: !s.notifications }))}
                    className={`w-10 h-6 rounded-full relative transition-colors ${settings.notifications ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.notifications ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold" style={{ color: colors.textMain }}>Auto-Reply</span>
                  <button
                    onClick={() => setSettings(s => ({ ...s, autoReply: !s.autoReply }))}
                    className={`w-10 h-6 rounded-full relative transition-colors ${settings.autoReply ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.autoReply ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
              <div className="p-4 border-t bg-black/5 flex justify-end" style={{ borderColor: colors.border }}>
                <button onClick={handleSaveSettings} className="px-6 py-2 rounded-xl font-bold text-white shadow-lg" style={{ backgroundColor: colors.primary }}>Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteWarningOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 gap-4" style={{ backgroundColor: colors.middlePaneBg }}
            >
              <h3 className="text-lg font-bold" style={{ color: colors.textMain }}>Delete Permanently?</h3>
              <p className="text-sm" style={{ color: colors.textMuted }}>This action cannot be undone. Are you sure you want to permanently delete this message?</p>
              <div className="flex justify-end gap-3 mt-2">
                <button onClick={() => setIsDeleteWarningOpen(false)} className="px-4 py-2 rounded-xl font-bold text-sm transition-colors hover:bg-black/5" style={{ color: colors.textMain }}>Cancel</button>
                <button onClick={confirmDelete} className="px-4 py-2 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLogoutWarningOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 gap-4" style={{ backgroundColor: colors.middlePaneBg }}
            >
              <h3 className="text-lg font-bold" style={{ color: colors.textMain }}>Log Out?</h3>
              <p className="text-sm" style={{ color: colors.textMuted }}>Are you sure you want to log out of your account?</p>
              <div className="flex justify-end gap-3 mt-2">
                <button onClick={() => setIsLogoutWarningOpen(false)} className="px-4 py-2 rounded-xl font-bold text-sm transition-colors hover:bg-black/5" style={{ color: colors.textMain }}>Cancel</button>
                <button onClick={confirmLogout} className="px-4 py-2 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg">Log Out</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isColorPaletteOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ backgroundColor: colors.middlePaneBg }}
            >
              <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: colors.border }}>
                <h3 className="font-bold" style={{ color: colors.textMain }}>Customize Colors</h3>
                <button onClick={() => setIsColorPaletteOpen(false)}><X className="w-5 h-5" style={{ color: colors.textMuted }} /></button>
              </div>
              <div className="p-6 flex flex-col gap-6">
                <div>
                  <h4 className="font-bold mb-3" style={{ color: colors.textMain }}>Text Color</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {textColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setTempCustomTextColor(color)}
                        className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                        style={{ backgroundColor: color, borderColor: tempCustomTextColor === color ? colors.primary : colors.border }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-3" style={{ color: colors.textMain }}>Background Color</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {bgColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setTempCustomBgColor(color)}
                        className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                        style={{ backgroundColor: color, borderColor: tempCustomBgColor === color ? colors.primary : colors.border }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t flex justify-end" style={{ borderColor: colors.border }}>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Dashboard;