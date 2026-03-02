import React, { createContext, useContext, useState } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    hasPermission: (requiredRole: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Persist user in session storage to survive refreshes (optional but good DX)
const USER_KEY = 'sistema_nc_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = sessionStorage.getItem(USER_KEY);
        return stored ? JSON.parse(stored) : null;
    });

    const login = (newUser: User) => {
        setUser(newUser);
        sessionStorage.setItem(USER_KEY, JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem(USER_KEY);
    };

    const hasPermission = (allowedRoles: Role[]) => {
        if (!user) return false;
        if (user.role === 'ADMINISTRADOR') return true; // Administrator has all access
        return allowedRoles.includes(user.role);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
}
