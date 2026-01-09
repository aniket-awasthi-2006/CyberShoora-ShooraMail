export type View = 'landing' | 'pricing' | 'signin' | 'signup' | 'dashboard' | 'admin';
export type ThemeMode = 'light' | 'dark' | 'colored';

export interface UserData {
  userName: string;
  email: string;
  inboxMails?: any[];
}
