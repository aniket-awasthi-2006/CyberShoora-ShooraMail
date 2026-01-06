export type View = 'landing' | 'pricing' | 'signin' | 'signup' | 'dashboard' | 'admin';
export type ThemeMode = 'light' | 'dark' | 'colored';

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}
