export type Role =
    | 'ADMINISTRADOR'
    | 'FINANZAS'
    | 'PASTOR_PRINCIPAL'
    | 'PASTOR_ASOCIADO'
    | 'ALIADO'
    | 'LIDER_MATRIMONIOS'
    | 'LIDER_HOMBRES'
    | 'LIDER_MUJERES'
    | 'LIDER_ADOLESCENTES'
    | 'LIDER_NINOS'
    | 'LIDER_PROTOCOLO'
    | 'LIDER_COMUNICACION'
    | 'LIDER_PROYECCION'
    | 'LIDER_MULTIMEDIA'
    | 'LIDER_PRODUCCION'
    | 'LIDER_LIMPIEZA'
    | 'LIDER_SEGURIDAD'
    | 'LIDER_GPS'
    | 'LIDER_CANTICO_NUEVO'
    | 'LIDER_CONEXION'
    | 'EQUIPO_CONEXION';

export type SpiritualStatus =
    | 'VISITA'
    | 'CANDIDATO_PUERTAS_ABIERTAS'
    | 'CANDIDATO_ALIADOS'
    | 'CANDIDATO_BAUTIZO'
    | 'MIEMBRO_ACTIVO'
    | 'ESTANCADO'
    | 'BAJA';

export interface User {
    id: string;
    username: string;
    email?: string;
    password?: string; // Only for system users
    role: Role;
    createdAt: string;
    isActive?: boolean;
}

export interface FamilyMember {
    name: string;
    relation: string;
    age?: number;
}

export interface Ministry {
    id: string;
    name: string;
}

export interface Person {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    address?: string;
    streetName?: string;
    houseNumber?: string;
    municipality?: string;
    sector?: string;
    age?: number;
    birthDate?: string;

    // Status tracking
    status: SpiritualStatus;
    firstVisitDate: string;
    lastVisitDate: string;
    visitCount: number;

    // Ally Profile (filled later)
    photoUrl?: string;
    profession?: string;
    educationLevel?: 'Primaria' | 'Secundaria' | 'Técnico' | 'Universitaria' | 'Grados';
    technicalCourses?: string[];
    otherTechnicalCourse?: string;
    civilStatus?: 'Soltero/a' | 'Casado/a' | 'En una relación / Noviazgo' | 'Comprometido/a' | 'Unión libre' | 'Divorciado/a' | 'Separado/a';
    spouseName?: string;
    hasChildren?: boolean;
    childrenCount?: number;
    residenceZone?: string;

    // Spiritual Path
    alliesCourseStatus?: 'SI' | 'NO' | 'EN_PROCESO';
    previousChurchMember?: boolean;

    // Baptism
    isBaptized?: boolean; // General/Legacy
    baptizedInEvangelicalChurch?: boolean; // Specific question
    wantsBaptism?: boolean; // "Sí" or "No por ahora" mapped to boolean

    // Service & Skills
    occupation?: string;
    hobbies?: string;
    serviceAvailability?: 'SI' | 'NO' | 'NO_SEGURO';
    preferredServiceAreas?: string[];
    otherServiceArea?: string;
    experienceDescription?: string; // talents/dones narrative
    previousServiceExperience?: boolean;

    skills?: string[]; // Checkbox skills ("Cocinar", etc.)
    otherSkill?: string;

    talents?: string[]; // Legacy array, maybe keep for compat? Or replace with skills? keeping for now.
    previousChurch?: string;
    timeSinceLeftChurch?: string;
    pactCompleted?: boolean;

    // Ministry & Leadership Assignment
    ministryId?: string; // ID of the ministry they belong to
    leadershipId?: string; // ID of the leadership role they hold

    // Family
    family: FamilyMember[];

    // Notes
    notes?: string;
    pastoralObservations?: string;

    // Health Information
    bloodType?: string;
    medicationAllergies?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
}

export type TransactionType = 'INGRESO' | 'EGRESO';
export type TransactionCategory = 'DIEZMO' | 'OFRENDA' | 'PRO_TEMPLO' | 'GASTO_OPERATIVO' | 'GASTO_INSUMOS' | 'GENEROSIDAD' | 'PAGO_NOMINA' | 'OTRO';

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    description: string;
    registeredBy: string; // username
}

export interface AppState {
    people: Person[];
    transactions: Transaction[];
    systemUsers: User[];
    ministries: Ministry[];
    leadershipRoles: Ministry[]; // Reusing Ministry interface for id/name structure
}
