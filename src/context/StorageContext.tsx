import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Person, Transaction, User } from '../types';

interface StorageContextType extends AppState {
    addPerson: (person: Person) => void;
    updatePerson: (id: string, updates: Partial<Person>) => void;
    deletePerson: (id: string) => void;
    addTransaction: (transaction: Transaction) => void;
    addVisit: (id: string) => void;
    // User management
    addSystemUser: (user: User) => void;
    updateSystemUser: (id: string, updates: Partial<User>) => void;
    deleteSystemUser: (id: string) => void;
    // Computed helpers
    getPersonById: (id: string) => Person | undefined;
}

const STORAGE_KEY = 'sistema_nc_data_v1';

const initialState: AppState = {
    people: [],
    transactions: [],
    systemUsers: [
        {
            id: 'admin-1',
            username: 'Josesalcedo1978',
            email: 'jose@nuevoscomienzos.com',
            password: 'clairet0405',
            role: 'ADMINISTRADOR',
            createdAt: new Date().toISOString()
        }
    ],
    ministries: [
        { id: '1', name: 'Ministerio Pastoral' },
        { id: '2', name: 'Ministerio de Matrimonios' },
        { id: '3', name: 'Ministerio Hombres' },
        { id: '4', name: 'Ministerio de Mujeres' },
        { id: '5', name: 'Ministerio de Adolescentes' },
        { id: '6', name: 'Ministerio de Niños' },
        { id: '7', name: 'Ministerio de Protocolo' },
        { id: '8', name: 'Ministerio de Conexión' },
        { id: '9', name: 'Ministerio de Comunicación' },
        { id: '10', name: 'Ministerio de Proyección' },
        { id: '11', name: 'Ministerio de Multimedia' },
        { id: '12', name: 'Ministerio de Producción' },
        { id: '13', name: 'Ministerio de Limpieza' },
        { id: '14', name: 'Ministerio de Seguridad' },
        { id: '15', name: 'Ministerio de GPS' },
        { id: '16', name: 'Ministerio Cantico Nuevo' },
    ],
    leadershipRoles: [
        { id: '1', name: 'Pastor Principal' },
        { id: '2', name: 'Pastor Asociado' },
        { id: '3', name: 'Pastora Principal' },
        { id: '4', name: 'Pastora Asociada' },
        { id: '5', name: 'Líder Matrimonios' },
        { id: '6', name: 'Líder Hombres' },
        { id: '7', name: 'Líder Mujeres' },
        { id: '8', name: 'Líder Adolescentes' },
        { id: '9', name: 'Líder Niños' },
        { id: '10', name: 'Líder Protocolo' },
        { id: '11', name: 'Líder Conexión' },
        { id: '12', name: 'Líder Comunicación' },
        { id: '13', name: 'Líder Proyección' },
        { id: '14', name: 'Líder Multimedia' },
        { id: '15', name: 'Líder Producción' },
        { id: '16', name: 'Líder de Limpieza' },
        { id: '17', name: 'Líder Seguridad' },
        { id: '18', name: 'Líder de GPS' },
        { id: '19', name: 'Líder Cantico Nuevo' },
    ],
};

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export function StorageProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<AppState>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            let updated = { ...parsed };
            // Migrate if systemUsers doesn't exist
            if (!parsed.systemUsers || parsed.systemUsers.length === 0) {
                updated.systemUsers = initialState.systemUsers;
            } else {
                // Force update the specific admin role for the requested user
                updated.systemUsers = parsed.systemUsers.map((u: any) =>
                    u.username === 'Josesalcedo1978' ? { ...u, role: 'ADMINISTRADOR' } : u
                );

                const hasSalcedo = updated.systemUsers.some((u: any) => u.username === 'Josesalcedo1978');
                if (!hasSalcedo) {
                    updated.systemUsers = [...updated.systemUsers, initialState.systemUsers[0]];
                }
            }
            // Migrate: Reset ministries if they look like leadership roles (e.g. "Pastor Principal") OR if the list is too short/generic
            const firstMinistry = parsed.ministries?.[0];
            const isCorruptedWithLeadership = firstMinistry && (firstMinistry.name === 'Pastor Principal' || firstMinistry.name === 'Pastor Asociado');

            if (!parsed.ministries || parsed.ministries.length < 16 || isCorruptedWithLeadership) {
                // FORCE RESET to Generic Ministries
                updated.ministries = initialState.ministries;
            }

            // Ensure leadershipRoles are initialized
            if (!parsed.leadershipRoles || parsed.leadershipRoles.length === 0) {
                updated.leadershipRoles = initialState.leadershipRoles;
            }
            return updated;
        }
        return initialState;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [data]);

    // Auto-Archive Logic (>90 days)
    useEffect(() => {
        const checkStatusUpdates = () => {
            const now = new Date();
            const ninetyDaysAgo = new Date(now);
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const needsUpdate = data.people.some(p => {
                const lastVisit = new Date(p.lastVisitDate);
                if (isNaN(lastVisit.getTime())) return false;

                // Check for BAJA (> 90 days)
                if (p.status !== 'BAJA' && lastVisit < ninetyDaysAgo) return true;

                // Check for ESTANCADO (> 30 days)
                // Applies to anyone who is NOT 'MIEMBRO_ACTIVO', NOT 'BAJA', and NOT already 'ESTANCADO'
                if (p.status !== 'MIEMBRO_ACTIVO' && p.status !== 'BAJA' && p.status !== 'ESTANCADO' && lastVisit < thirtyDaysAgo) return true;

                return false;
            });

            if (needsUpdate) {
                setData(prev => ({
                    ...prev,
                    people: prev.people.map(p => {
                        const lastVisit = new Date(p.lastVisitDate);
                        if (isNaN(lastVisit.getTime())) return p;

                        // Priority 1: BAJA
                        if (p.status !== 'BAJA' && lastVisit < ninetyDaysAgo) {
                            return { ...p, status: 'BAJA' };
                        }

                        // Priority 2: ESTANCADO
                        if (p.status !== 'MIEMBRO_ACTIVO' && p.status !== 'BAJA' && p.status !== 'ESTANCADO' && lastVisit < thirtyDaysAgo) {
                            return {
                                ...p,
                                status: 'ESTANCADO',
                                notes: p.notes ? p.notes + '\n⚠️ Requiere seguimiento urgente (Estancado > 30 días)' : '⚠️ Requiere seguimiento urgente (Estancado > 30 días)'
                            };
                        }

                        return p;
                    })
                }));
            }
        };

        // Use a timeout to avoid immediate state updates during render or mount conflicts
        const timer = setTimeout(checkStatusUpdates, 1000);
        return () => clearTimeout(timer);
    }, [data.people]);

    const addPerson = (person: Person) => {
        setData(prev => ({ ...prev, people: [...prev.people, person] }));
    };

    const updatePerson = (id: string, updates: Partial<Person>) => {
        setData(prev => ({
            ...prev,
            people: prev.people.map(p => (p.id === id ? { ...p, ...updates } : p)),
        }));
    };

    const addVisit = (id: string) => {
        setData(prev => {
            return {
                ...prev,
                people: prev.people.map(p => {
                    if (p.id !== id) return p;

                    const newCount = p.visitCount + 1;
                    let newStatus = p.status;

                    // Auto-Advance Logic
                    if (newStatus === 'VISITA' && newCount >= 2) {
                        newStatus = 'CANDIDATO_PUERTAS_ABIERTAS';
                    }

                    return {
                        ...p,
                        visitCount: newCount,
                        lastVisitDate: new Date().toISOString().split('T')[0],
                        status: newStatus
                    };
                })
            };
        });
    };

    const deletePerson = (id: string) => {
        setData(prev => ({
            ...prev,
            people: prev.people.filter(p => p.id !== id)
        }));
    };

    const addTransaction = (transaction: Transaction) => {
        setData(prev => ({ ...prev, transactions: [...prev.transactions, transaction] }));
    };

    const addSystemUser = (user: User) => {
        setData(prev => ({ ...prev, systemUsers: [...prev.systemUsers, user] }));
    };

    const updateSystemUser = (id: string, updates: Partial<User>) => {
        setData(prev => ({
            ...prev,
            systemUsers: prev.systemUsers.map(u => (u.id === id ? { ...u, ...updates } : u)),
        }));
    };

    const deleteSystemUser = (id: string) => {
        setData(prev => ({
            ...prev,
            systemUsers: prev.systemUsers.filter(u => u.id !== id),
        }));
    };

    const getPersonById = (id: string) => data.people.find(p => p.id === id);

    return (
        <StorageContext.Provider value={{
            ...data,
            addPerson,
            updatePerson,
            addVisit,
            addTransaction,
            deletePerson,
            addSystemUser,
            updateSystemUser,
            deleteSystemUser,
            getPersonById
        }}>
            {children}
        </StorageContext.Provider>
    );
}

export function useStorage() {
    const context = useContext(StorageContext);
    if (!context) {
        throw new Error('useStorage must be used within a StorageProvider');
    }
    return context;
}
