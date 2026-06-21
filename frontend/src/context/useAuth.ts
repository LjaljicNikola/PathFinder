import { useContext } from 'react';
import { AuthContext } from './authContextDefinition';

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth mora biti korišćen unutar AuthProvider-a.');
    return ctx;
}