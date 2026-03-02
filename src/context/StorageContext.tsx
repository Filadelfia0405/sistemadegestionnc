import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Person, Transaction, User } from '../types';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

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
    isLoading: boolean;
}

const initialState: AppState = {
    people: [],
    transactions: [],
    systemUsers: [],
    ministries: [],
    leadershipRoles: [],
};

const StorageContext = createContext<StorageContextType | undefined>(undefined);

// Helper to convert DB snake_case to app camelCase for Person
const mapPersonFromDB = (db: any): Person => ({
    id: db.id,
    fullName: db.full_name,
    email: db.email,
    phone: db.phone,
    address: db.address,
    streetName: db.street_name,
    houseNumber: db.house_number,
    municipality: db.municipality,
    sector: db.sector,
    age: db.age,
    status: db.status as Person['status'],
    firstVisitDate: db.first_visit_date,
    lastVisitDate: db.last_visit_date,
    visitCount: db.visit_count,
    photoUrl: db.photo_url,
    profession: db.profession,
    civilStatus: db.civil_status,
    spouseName: db.spouse_name,
    hasChildren: db.has_children,
    childrenCount: db.children_count,
    residenceZone: db.residence_zone,
    alliesCourseStatus: db.allies_course_status,
    previousChurchMember: db.previous_church_member,
    isBaptized: db.is_baptized,
    baptizedInEvangelicalChurch: db.baptized_in_evangelical_church,
    wantsBaptism: db.wants_baptism,
    occupation: db.occupation,
    hobbies: db.hobbies,
    serviceAvailability: db.service_availability,
    preferredServiceAreas: db.preferred_service_areas,
    otherServiceArea: db.other_service_area,
    experienceDescription: db.experience_description,
    previousServiceExperience: db.previous_service_experience,
    skills: db.skills,
    otherSkill: db.other_skill,
    talents: db.talents,
    previousChurch: db.previous_church,
    timeSinceLeftChurch: db.time_since_left_church,
    pactCompleted: db.pact_completed,
    ministryId: db.ministry_id,
    leadershipId: db.leadership_id,
    family: db.family || [],
    notes: db.notes,
    pastoralObservations: db.pastoral_observations,
    bloodType: db.blood_type,
    medicationAllergies: db.medication_allergies,
    emergencyContactName: db.emergency_contact_name,
    emergencyContactPhone: db.emergency_contact_phone,
    emergencyContactRelationship: db.emergency_contact_relationship,
});

const mapPersonToDB = (p: Partial<Person>): any => {
    const db: any = {};
    if (p.id !== undefined) db.id = p.id;
    if (p.fullName !== undefined) db.full_name = p.fullName;
    if (p.email !== undefined) db.email = p.email;
    if (p.phone !== undefined) db.phone = p.phone;
    if (p.address !== undefined) db.address = p.address;
    if (p.streetName !== undefined) db.street_name = p.streetName;
    if (p.houseNumber !== undefined) db.house_number = p.houseNumber;
    if (p.municipality !== undefined) db.municipality = p.municipality;
    if (p.sector !== undefined) db.sector = p.sector;
    if (p.age !== undefined) db.age = p.age;
    if (p.status !== undefined) db.status = p.status;
    if (p.firstVisitDate !== undefined) db.first_visit_date = p.firstVisitDate;
    if (p.lastVisitDate !== undefined) db.last_visit_date = p.lastVisitDate;
    if (p.visitCount !== undefined) db.visit_count = p.visitCount;
    if (p.photoUrl !== undefined) db.photo_url = p.photoUrl;
    if (p.profession !== undefined) db.profession = p.profession;
    if (p.civilStatus !== undefined) db.civil_status = p.civilStatus;
    if (p.spouseName !== undefined) db.spouse_name = p.spouseName;
    if (p.hasChildren !== undefined) db.has_children = p.hasChildren;
    if (p.childrenCount !== undefined) db.children_count = p.childrenCount;
    if (p.residenceZone !== undefined) db.residence_zone = p.residenceZone;
    if (p.alliesCourseStatus !== undefined) db.allies_course_status = p.alliesCourseStatus;
    if (p.previousChurchMember !== undefined) db.previous_church_member = p.previousChurchMember;
    if (p.isBaptized !== undefined) db.is_baptized = p.isBaptized;
    if (p.baptizedInEvangelicalChurch !== undefined) db.baptized_in_evangelical_church = p.baptizedInEvangelicalChurch;
    if (p.wantsBaptism !== undefined) db.wants_baptism = p.wantsBaptism;
    if (p.occupation !== undefined) db.occupation = p.occupation;
    if (p.hobbies !== undefined) db.hobbies = p.hobbies;
    if (p.serviceAvailability !== undefined) db.service_availability = p.serviceAvailability;
    if (p.preferredServiceAreas !== undefined) db.preferred_service_areas = p.preferredServiceAreas;
    if (p.otherServiceArea !== undefined) db.other_service_area = p.otherServiceArea;
    if (p.experienceDescription !== undefined) db.experience_description = p.experienceDescription;
    if (p.previousServiceExperience !== undefined) db.previous_service_experience = p.previousServiceExperience;
    if (p.skills !== undefined) db.skills = p.skills;
    if (p.otherSkill !== undefined) db.other_skill = p.otherSkill;
    if (p.talents !== undefined) db.talents = p.talents;
    if (p.previousChurch !== undefined) db.previous_church = p.previousChurch;
    if (p.timeSinceLeftChurch !== undefined) db.time_since_left_church = p.timeSinceLeftChurch;
    if (p.pactCompleted !== undefined) db.pact_completed = p.pactCompleted;
    if (p.ministryId !== undefined) db.ministry_id = p.ministryId;
    if (p.leadershipId !== undefined) db.leadership_id = p.leadershipId;
    if (p.family !== undefined) db.family = p.family;
    if (p.notes !== undefined) db.notes = p.notes;
    if (p.pastoralObservations !== undefined) db.pastoral_observations = p.pastoralObservations;
    if (p.bloodType !== undefined) db.blood_type = p.bloodType;
    if (p.medicationAllergies !== undefined) db.medication_allergies = p.medicationAllergies;
    if (p.emergencyContactName !== undefined) db.emergency_contact_name = p.emergencyContactName;
    if (p.emergencyContactPhone !== undefined) db.emergency_contact_phone = p.emergencyContactPhone;
    if (p.emergencyContactRelationship !== undefined) db.emergency_contact_relationship = p.emergencyContactRelationship;
    return db;
};

const defaultMinistries = [
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
];

const defaultLeadershipRoles = [
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
];

const defaultAdmin = {
    id: 'admin-1',
    username: 'Josesalcedo1978',
    email: 'jose@nuevoscomienzos.com',
    password: 'clairet0405',
    role: 'ADMINISTRADOR',
    createdAt: new Date().toISOString()
};

export function StorageProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<AppState>(initialState);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSupabaseData = async () => {
            setIsLoading(true);
            try {
                // Fetch all data in parallel
                const [
                    peopleRes,
                    transactionsRes,
                    usersRes,
                    ministriesRes,
                    leadershipRolesRes
                ] = await Promise.all([
                    supabase.from('people').select('*'),
                    supabase.from('transactions').select('*'),
                    supabase.from('system_users').select('*'),
                    supabase.from('ministries').select('*'),
                    supabase.from('leadership_roles').select('*')
                ]);

                let loadedData: AppState = {
                    people: (peopleRes.data || []).map(mapPersonFromDB),
                    transactions: (transactionsRes.data || []).map(t => ({
                        id: t.id,
                        date: t.date,
                        amount: Number(t.amount),
                        type: t.type,
                        category: t.category,
                        description: t.description,
                        registeredBy: t.registered_by
                    })),
                    systemUsers: (usersRes.data || []).map(u => ({
                        id: u.id,
                        username: u.username,
                        email: u.email,
                        password: u.password,
                        role: u.role,
                        createdAt: u.created_at
                    })),
                    ministries: ministriesRes.data || [],
                    leadershipRoles: leadershipRolesRes.data || []
                };

                // Seed data if empty
                if (loadedData.systemUsers.length === 0) {
                    await supabase.from('system_users').insert({
                        id: '00000000-0000-0000-0000-000000000001',
                        username: defaultAdmin.username,
                        email: defaultAdmin.email,
                        password: defaultAdmin.password,
                        role: defaultAdmin.role,
                    });
                    loadedData.systemUsers = [defaultAdmin as any];
                }

                if (loadedData.ministries.length === 0) {
                    await supabase.from('ministries').insert(defaultMinistries);
                    loadedData.ministries = defaultMinistries;
                }

                if (loadedData.leadershipRoles.length === 0) {
                    await supabase.from('leadership_roles').insert(defaultLeadershipRoles);
                    loadedData.leadershipRoles = defaultLeadershipRoles;
                }

                setData(loadedData);
            } catch (error) {
                console.error("Error loading Supabase data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSupabaseData();
    }, []);

    // Auto-Archive Logic (Optimistic update on mount)
    useEffect(() => {
        if (isLoading || data.people.length === 0) return;

        const checkStatusUpdates = async () => {
            const now = new Date();
            const ninetyDaysAgo = new Date(now);
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const updatesToSave: any[] = [];

            const newDataPeople = data.people.map(p => {
                const lastVisit = new Date(p.lastVisitDate);
                if (isNaN(lastVisit.getTime())) return p;

                // Priority 1: BAJA
                if (p.status !== 'BAJA' && lastVisit < ninetyDaysAgo) {
                    updatesToSave.push({ id: p.id, status: 'BAJA' });
                    return { ...p, status: 'BAJA' as const };
                }

                // Priority 2: ESTANCADO
                if (p.status !== 'MIEMBRO_ACTIVO' && p.status !== 'BAJA' && p.status !== 'ESTANCADO' && lastVisit < thirtyDaysAgo) {
                    const newNotes = p.notes ? p.notes + '\n⚠️ Requiere seguimiento urgente (Estancado > 30 días)' : '⚠️ Requiere seguimiento urgente (Estancado > 30 días)';
                    updatesToSave.push({ id: p.id, status: 'ESTANCADO', notes: newNotes });
                    return {
                        ...p,
                        status: 'ESTANCADO' as const,
                        notes: newNotes
                    };
                }

                return p;
            });

            if (updatesToSave.length > 0) {
                setData(prev => ({ ...prev, people: newDataPeople }));
                // Fire and forget remote updates
                updatesToSave.forEach(async update => {
                    await supabase.from('people').update(update).eq('id', update.id);
                });
            }
        };

        const timer = setTimeout(checkStatusUpdates, 1000);
        return () => clearTimeout(timer);
    }, [data.people, isLoading]);

    const addPerson = async (person: Person) => {
        const id = person.id || uuidv4();
        const newPerson = { ...person, id };

        // Optimistic UI Update
        setData(prev => ({ ...prev, people: [...prev.people, newPerson] }));

        // Remote write
        const { error } = await supabase.from('people').insert(mapPersonToDB(newPerson));
        if (error) console.error("Error adding person:", error);
    };

    const updatePerson = async (id: string, updates: Partial<Person>) => {
        // Optimistic
        setData(prev => ({
            ...prev,
            people: prev.people.map(p => (p.id === id ? { ...p, ...updates } : p)),
        }));

        await supabase.from('people').update(mapPersonToDB(updates)).eq('id', id);
    };

    const addVisit = async (id: string) => {
        const person = data.people.find(p => p.id === id);
        if (!person) return;

        const newCount = person.visitCount + 1;
        let newStatus = person.status;

        if (newStatus === 'VISITA' && newCount >= 2) {
            newStatus = 'CANDIDATO_PUERTAS_ABIERTAS';
        }

        const updates = {
            visitCount: newCount,
            lastVisitDate: new Date().toISOString().split('T')[0],
            status: newStatus
        };

        // Optimistic
        setData(prev => ({
            ...prev,
            people: prev.people.map(p => (p.id === id ? { ...p, ...updates } : p))
        }));

        await supabase.from('people').update(mapPersonToDB(updates)).eq('id', id);
    };

    const deletePerson = async (id: string) => {
        setData(prev => ({ ...prev, people: prev.people.filter(p => p.id !== id) }));
        const { error } = await supabase.from('people').delete().eq('id', id);
        if (error) console.error("Error deleting person:", error);
    };

    const addTransaction = async (transaction: Transaction) => {
        const id = transaction.id || uuidv4();
        const newTx = { ...transaction, id };

        setData(prev => ({ ...prev, transactions: [...prev.transactions, newTx] }));

        await supabase.from('transactions').insert({
            id: newTx.id,
            date: newTx.date,
            amount: newTx.amount,
            type: newTx.type,
            category: newTx.category,
            description: newTx.description,
            registered_by: newTx.registeredBy
        });
        if (error) console.error("Error adding transaction:", error);
    };

    const addSystemUser = async (user: User) => {
        const id = user.id || uuidv4();
        const newUser = { ...user, id };
        setData(prev => ({ ...prev, systemUsers: [...prev.systemUsers, newUser] }));

        await supabase.from('system_users').insert({
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            password: newUser.password,
            role: newUser.role,
        });
        if (error) console.error("Error adding user:", error);
    };

    const updateSystemUser = async (id: string, updates: Partial<User>) => {
        setData(prev => ({
            ...prev,
            systemUsers: prev.systemUsers.map(u => (u.id === id ? { ...u, ...updates } : u)),
        }));

        const dbUpdates: any = {};
        if (updates.username) dbUpdates.username = updates.username;
        if (updates.email) dbUpdates.email = updates.email;
        if (updates.password) dbUpdates.password = updates.password;
        if (updates.role) dbUpdates.role = updates.role;

        const { error } = await supabase.from('system_users').update(dbUpdates).eq('id', id);
        if (error) console.error("Error updating user:", error);
    };

    const deleteSystemUser = async (id: string) => {
        setData(prev => ({
            ...prev,
            systemUsers: prev.systemUsers.filter(u => u.id !== id),
        }));
        const { error } = await supabase.from('system_users').delete().eq('id', id);
        if (error) console.error("Error deleting user:", error);
    };

    const getPersonById = (id: string) => data.people.find(p => p.id === id);

    return (
        <StorageContext.Provider value={{
            ...data,
            isLoading,
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
