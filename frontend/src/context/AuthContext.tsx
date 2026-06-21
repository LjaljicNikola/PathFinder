import { useState, type ReactNode } from 'react';
import type { AuthUser } from './AuthUser';
import { AuthContext } from './authContextDefinition';

function loadStoredUser(): AuthUser | null {
    const savedUser = sessionStorage.getItem('pf_user');
    if (!savedUser) return null;

    try {
        return JSON.parse(savedUser);
    } catch {
        sessionStorage.removeItem('pf_user');
        sessionStorage.removeItem('pf_token');
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(loadStoredUser);

    const signIn = (token: string, user: AuthUser) => {
        sessionStorage.setItem('pf_token', token);
        sessionStorage.setItem('pf_user', JSON.stringify(user));
        setCurrentUser(user);
    };

    const signOut = () => {
        sessionStorage.removeItem('pf_token');
        sessionStorage.removeItem('pf_user');
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                isLoggedIn: !!currentUser,
                isAdmin: currentUser?.role === 'Admin',
                signIn,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}