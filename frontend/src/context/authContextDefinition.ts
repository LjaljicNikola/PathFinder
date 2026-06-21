import { createContext } from 'react';
import type { AuthUser } from './AuthUser';

export interface AuthContextValue {
    currentUser: AuthUser | null;
    isLoggedIn: boolean;
    isAdmin: boolean;
    signIn: (token: string, user: AuthUser) => void;
    signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);