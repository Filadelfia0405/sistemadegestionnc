import React, { useState, useEffect } from 'react';
import { useStorage } from '../context/StorageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Upload, UserCheck, AlertCircle, CheckSquare, TriangleAlert } from 'lucide-react';
import { cn } from '../utils/cn';
import { Person } from '../types';

const SERVICE_AREAS = [
    "Música",
    "Acompañamiento espiritual",
    "Servicio social",
    "Logística y eventos",
    "Niños/Adolescentes",
    "Oración",
    "Otra área"
];

const SKILLS_LIST = [
    "Tocar instrumentos musicales",
    "Actuar",
    "Hablar en público",
    "Hacer reir a los demás",
    "Payaso",
    "Animador",
    "Escuchar/Consejería",
    "Escribir",
    "Organizar actividades/planificación de eventos",
    "Bailar/Danzar",
    "Limpieza",
    "Defensa personal",
    "Traducir",
    "Edición de audio",
    "Maestro constructor",
    "Diseño de interior",
    "Cocinar",
    "Pintar",
    "Ebanistería",
    "Mecánica",
    "Carpintería",
    "Cantar",
    "Otro"
];

const CIVIL_STATUS_OPTIONS = [
    'Soltero/a', 'Casado/a', 'En una relación / Noviazgo',
    'Comprometido/a', 'Unión libre', 'Divorciado/a', 'Separado/a'
];

export default function CandidatePortal() {
    const { people, updatePerson } = useStorage();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [emailToSearch, setEmailToSearch] = useState('');
    const [currentPerson, setCurrentPerson] = useState<Person | null>(() => {
        if (user?.role === 'ALIADO') {
            return people.find(p => p.id === user.id || p.fullName === user.username) || null;
        }
        return null;
    });

    // Check for restricted access
    const isRestricted = currentPerson &&
        ['VISITA', 'CANDIDATO_PUERTAS_ABIERTAS'].includes(currentPerson.status);

    const [error, setError] = useState<string | null>(null);
    const [finished, setFinished] = useState(false);
    const [showPact, setShowPact] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        photoUrl: '', // Add this line
        birthDate: '',
        // Family
        civilStatus: '',
        spouseName: '',
        hasChildren: 'NO', // Using string for radio, convert to bool on submit
        childrenCount: undefined as number | undefined,
        residenceZone: '',
        sector: '',

        // Spiritual Path
        alliesCourseStatus: '',
        previousChurchMember: 'NO',
        previousChurchName: '',
        timeSinceLeftChurch: '',

        // Baptism
        baptizedInEvangelicalChurch: 'NO',
        wantsBaptism: 'NO', // "Sí" or "No por ahora"

        // Personal Profile
        occupation: '',
        hobbies: '',
        serviceAvailability: '', // Si, No estoy disponible..., No estoy seguro
        preferredServiceAreas: [] as string[],
        otherServiceArea: '',
        experienceDescription: '',
        previousServiceExperience: 'NO',

        // Skills
        skills: [] as string[],
        otherSkill: '',

        // Health Information
        bloodType: '',
        medicationAllergies: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelationship: ''
    });

    // Load initial data
    useEffect(() => {
        if (currentPerson) {
            setFormData(prev => ({
                ...prev,
                photoUrl: currentPerson.photoUrl || '',
                birthDate: currentPerson.birthDate || '',
                civilStatus: currentPerson.civilStatus || '',
                spouseName: currentPerson.spouseName || '',
                hasChildren: currentPerson.hasChildren ? 'SI' : 'NO',
                sector: currentPerson.sector || '',

                alliesCourseStatus: currentPerson.alliesCourseStatus || '',
                previousChurchMember: currentPerson.previousChurchMember ? 'SI' : 'NO',
                previousChurchName: currentPerson.previousChurch || '',
                timeSinceLeftChurch: currentPerson.timeSinceLeftChurch || '',

                baptizedInEvangelicalChurch: currentPerson.baptizedInEvangelicalChurch ? 'SI' : 'NO',
                wantsBaptism: currentPerson.wantsBaptism ? 'SI' : 'NO',

                occupation: currentPerson.occupation || currentPerson.profession || '',
                hobbies: currentPerson.hobbies || '',
                serviceAvailability: currentPerson.serviceAvailability || '',
                preferredServiceAreas: currentPerson.preferredServiceAreas || [],
                otherServiceArea: currentPerson.otherServiceArea || '',
                experienceDescription: currentPerson.experienceDescription || '',
                previousServiceExperience: currentPerson.previousServiceExperience ? 'SI' : 'NO',

                skills: currentPerson.skills || [],
                otherSkill: currentPerson.otherSkill || '',

                // Health
                bloodType: currentPerson.bloodType || '',
                medicationAllergies: currentPerson.medicationAllergies || '',
                emergencyContactName: currentPerson.emergencyContactName || '',
                emergencyContactPhone: currentPerson.emergencyContactPhone || '',
                emergencyContactRelationship: currentPerson.emergencyContactRelationship || ''
            }));
        }
    }, [currentPerson]);

    // Auth effect
    useEffect(() => {
        if (user?.role === 'ALIADO' && !currentPerson && people.length > 0) {
            const found = people.find(p => p.id === user.id || p.fullName === user.username);
            if (found) setCurrentPerson(found);
        }
    }, [user, people]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const found = people.find(p => p.email && p.email.toLowerCase() === emailToSearch.toLowerCase());
        if (found) {
            setCurrentPerson(found);
            setError(null);
        } else {
            setError("No se encontró ningún registro con ese correo electrónico.");
        }
    };

    const toggleArrayItem = (field: 'preferredServiceAreas' | 'skills', value: string) => {
        setFormData(prev => {
            const current = prev[field];
            const exists = current.includes(value);
            return {
                ...prev,
                [field]: exists ? current.filter(item => item !== value) : [...current, value]
            };
        });
    };

    const handleContinueToPact = (e: React.FormEvent) => {
        e.preventDefault();
        setShowPact(true);
        window.scrollTo(0, 0);
    };

    const handleFinalSubmit = () => {
        if (!currentPerson) return;

        let newStatus = currentPerson.status;
        if (formData.wantsBaptism === 'SI' && formData.baptizedInEvangelicalChurch === 'NO') {
            newStatus = 'CANDIDATO_BAUTIZO';
        }

        updatePerson(currentPerson.id, {
            photoUrl: formData.photoUrl,
            birthDate: formData.birthDate,
            civilStatus: formData.civilStatus as any,
            spouseName: formData.civilStatus === 'Casado/a' ? formData.spouseName : undefined,
            hasChildren: formData.hasChildren === 'SI',
            childrenCount: formData.childrenCount,
            sector: formData.sector,

            alliesCourseStatus: formData.alliesCourseStatus as any,
            previousChurchMember: formData.previousChurchMember === 'SI',
            previousChurch: formData.previousChurchMember === 'SI' ? formData.previousChurchName : undefined,
            timeSinceLeftChurch: formData.previousChurchMember === 'SI' ? formData.timeSinceLeftChurch : undefined,

            baptizedInEvangelicalChurch: formData.baptizedInEvangelicalChurch === 'SI',
            wantsBaptism: formData.wantsBaptism === 'SI',
            isBaptized: formData.baptizedInEvangelicalChurch === 'SI',

            occupation: formData.occupation,
            hobbies: formData.hobbies,
            serviceAvailability: formData.serviceAvailability as any,
            preferredServiceAreas: formData.preferredServiceAreas,
            otherServiceArea: formData.preferredServiceAreas.includes("Otra área") ? formData.otherServiceArea : undefined,
            experienceDescription: formData.experienceDescription,
            previousServiceExperience: formData.previousServiceExperience === 'SI',

            skills: formData.skills,
            otherSkill: formData.skills.includes('Otro') ? formData.otherSkill : undefined,

            // Health Information
            bloodType: formData.bloodType,
            medicationAllergies: formData.medicationAllergies,
            emergencyContactName: formData.emergencyContactName,
            emergencyContactPhone: formData.emergencyContactPhone,
            emergencyContactRelationship: formData.emergencyContactRelationship,

            status: newStatus,
            pactCompleted: true
        });

        setFinished(true);
        setTimeout(() => {
            logout();
            navigate('/portal');
        }, 4000);
    };

    if (finished) {
        return (
            <div className="max-w-md mx-auto mt-20 p-10 bg-gray-900 rounded-3xl border border-green-500/30 shadow-2xl text-center space-y-6 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                    <UserCheck className="w-12 h-12 text-green-400" />
                </div>
                <h1 className="text-3xl font-bold text-white">¡Información Guardada!</h1>
                <p className="text-gray-300 leading-relaxed">
                    Hemos actualizado tu perfil de aliado exitosamente.
                    Gracias por ser parte de nuestra familia.
                </p>
            </div>
        );
    }

    if (showPact) {
        return (
            <div className="max-w-3xl mx-auto mt-10 p-8 bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl animate-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">Pacto del Aliado</h2>
                    <p className="text-gray-400">Por favor lee detenidamente tu compromiso.</p>
                </div>

                <div className="prose prose-invert max-w-none mb-8 bg-gray-950 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-blue-400 font-semibold mb-4">Mi Compromiso con la Casa</h3>
                    <p className="text-gray-300 mb-4">
                        Al completar este proceso y convertirme en un Aliado, reconozco que soy parte vital del cuerpo de Cristo en esta congregación.
                    </p>
                    <ul className="text-gray-300 list-disc pl-5 space-y-2 mb-4">
                        <li>Me comprometo a vivir una vida en integridad y crecimiento espiritual constante.</li>
                        <li>Me comprometo a servir con excelencia, poniendo mis dones y talentos al servicio de Dios y de los demás.</li>
                        <li>Me comprometo a honrar a mis líderes y a la visión de esta casa.</li>
                        <li>Me comprometo a cuidar la unidad de la iglesia y a no ser piedra de tropiezo para otros.</li>
                        <li>Entiendo que el servicio es un privilegio y una responsabilidad que asumo con gozo.</li>
                    </ul>
                    <p className="text-gray-400 italic text-sm border-t border-gray-800 pt-4 mt-4">
                        "Y todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres." - Colosenses 3:23
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-blue-900/10 p-6 rounded-xl border border-blue-500/20">
                    <button
                        onClick={() => setShowPact(false)}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        Volver al formulario
                    </button>
                    <button
                        onClick={handleFinalSubmit}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <CheckSquare className="w-5 h-5" />
                        Acepto mi Compromiso
                    </button>
                </div>
            </div>
        );
    }

    if (!currentPerson) {
        return (
            <div className="max-w-md mx-auto mt-20 p-8 bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-blue-600/10 rounded-2xl">
                        <UserCheck className="w-12 h-12 text-blue-500" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white text-center mb-2">Portal de Aliados</h2>
                <p className="text-gray-400 text-center mb-8 text-sm">Ingresa tu correo para completar tu perfil.</p>

                <form onSubmit={handleSearch} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Correo de Registro</label>
                        <input
                            required
                            type="email"
                            value={emailToSearch}
                            onChange={e => setEmailToSearch(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-700"
                            placeholder="ejemplo@correo.com"
                        />
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        Ingresar
                    </button>
                </form>
            </div>
        );
    }

    if (isRestricted) {
        return (
            <div className="max-w-md mx-auto mt-20 p-10 bg-gray-900 rounded-3xl border border-red-500/30 shadow-2xl text-center space-y-6 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                    <AlertCircle className="w-12 h-12 text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Acceso Restringido</h1>
                <p className="text-gray-300 leading-relaxed">
                    Hola <strong>{currentPerson?.fullName}</strong>.
                    <br /><br />
                    Este portal está habilitado únicamente para personas en proceso de <strong>Candidatos a Aliados</strong>.
                </p>
                <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 text-sm text-gray-400">
                    Tu estado actual: <span className="font-bold text-white">{currentPerson?.status.replace(/_/g, ' ')}</span>
                </div>
                <button
                    onClick={() => {
                        setCurrentPerson(null);
                        setEmailToSearch('');
                    }}
                    className="mt-4 text-blue-400 hover:text-blue-300 text-sm hover:underline"
                >
                    Volver al inicio
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-6 rounded-xl border border-blue-500/20">
                <h1 className="text-2xl font-bold text-white">Hola, {currentPerson.fullName}</h1>
                <p className="text-gray-300">Por favor completa la siguiente información.</p>
            </div>

            <form onSubmit={handleContinueToPact} className="space-y-8">

                {/* FOTO DE PERFIL */}
                <section className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex flex-col items-center">
                    <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider w-full border-b border-gray-800 pb-2">Foto de Perfil</h2>

                    <div className="relative group">
                        <div className={cn(
                            "w-32 h-32 rounded-full overflow-hidden border-4 border-gray-800 flex items-center justify-center bg-gray-950",
                            formData.photoUrl ? "border-blue-500" : "border-dashed"
                        )}>
                            {formData.photoUrl ? (
                                <img src={formData.photoUrl} alt="Perfil" className="w-full h-full object-cover" />
                            ) : (
                                <UserCheck className="w-12 h-12 text-gray-700" />
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110">
                            <Upload className="w-4 h-4" />
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </label>
                    </div>
                    <p className="text-gray-500 text-sm mt-4">Click en el icono para subir tu foto</p>
                </section>

                {/* FAMILIA */}
                <section className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-xl font-bold text-blue-400 mb-6 uppercase tracking-wider border-b border-gray-800 pb-2">Familia</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de nacimiento *</label>
                            <input
                                required
                                type="date"
                                value={formData.birthDate}
                                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Estado civil *</label>
                            <select
                                required
                                value={formData.civilStatus}
                                onChange={e => setFormData({ ...formData, civilStatus: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Seleccione...</option>
                                {CIVIL_STATUS_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        {formData.civilStatus === 'Casado/a' && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Cónyuge (Opcional)</label>
                                <input
                                    type="text"
                                    value={formData.spouseName}
                                    onChange={e => setFormData({ ...formData, spouseName: e.target.value })}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 placeholder:text-gray-700"
                                    placeholder="Nombre de tu esposo/a"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">¿Tienes hijos? *</label>
                            <div className="flex gap-4">
                                {['SI', 'NO'].map(opt => (
                                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="hasChildren"
                                            value={opt}
                                            checked={formData.hasChildren === opt}
                                            onChange={e => setFormData({
                                                ...formData,
                                                hasChildren: e.target.value,
                                                childrenCount: e.target.value === 'NO' ? undefined : formData.childrenCount
                                            })}
                                            className="text-blue-600 focus:ring-blue-500 bg-gray-950 border-gray-700"
                                        />
                                        <span className="text-gray-300 capitalize">{opt.toLowerCase()}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Conditional Children Count Field */}
                            {formData.hasChildren === 'SI' && (
                                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">¿Cuántos hijos tienes?</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={formData.childrenCount || ''}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setFormData(prev => ({ ...prev, childrenCount: isNaN(val) ? undefined : val }));
                                        }}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 placeholder:text-gray-700 font-mono"
                                        placeholder="Ej. 2"
                                    />
                                </div>
                            )}
                        </div>




                    </div>
                </section>

                {/* CAMINO ESPIRITUAL */}
                <section className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-xl font-bold text-blue-400 mb-6 uppercase tracking-wider border-b border-gray-800 pb-2">Sección 1: Camino Espiritual</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">¿Has completado el curso Aliados? *</label>
                            <select
                                required
                                value={formData.alliesCourseStatus}
                                onChange={e => setFormData({ ...formData, alliesCourseStatus: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Seleccione...</option>
                                <option value="SI">Sí</option>
                                <option value="NO">No</option>
                                <option value="EN_PROCESO">Actualmente en proceso</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">¿Has pertenecido a otra iglesia anteriormente?</label>
                            <div className="flex gap-4">
                                {['SI', 'NO'].map(opt => (
                                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="previousChurchMember"
                                            value={opt}
                                            checked={formData.previousChurchMember === opt}
                                            onChange={e => setFormData({ ...formData, previousChurchMember: e.target.value })}
                                            className="text-blue-600 focus:ring-blue-500 bg-gray-950 border-gray-700"
                                        />
                                        <span className="text-gray-300 capitalize">{opt.toLowerCase()}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {formData.previousChurchMember === 'SI' && (
                            <div className="animate-in fade-in slide-in-from-top-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Nombre de la iglesia</label>
                                    <input
                                        type="text"
                                        value={formData.previousChurchName}
                                        onChange={e => setFormData({ ...formData, previousChurchName: e.target.value })}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 placeholder:text-gray-700"
                                        placeholder="Nombre de la congregación"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de salida</label>
                                    <input
                                        type="text"
                                        value={formData.timeSinceLeftChurch}
                                        onChange={e => setFormData({ ...formData, timeSinceLeftChurch: e.target.value })}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 placeholder:text-gray-700"
                                        placeholder="Ej: Enero 2024, Hace 6 meses..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* BAUTISMO */}
                <section className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-xl font-bold text-cyan-400 mb-6 uppercase tracking-wider border-b border-gray-800 pb-2">Bautismo</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">¿Has sido bautizado por una iglesia evangélica?</label>
                            <div className="flex gap-4">
                                {['SI', 'NO'].map(opt => (
                                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="baptizedInEvangelicalChurch"
                                            value={opt}
                                            checked={formData.baptizedInEvangelicalChurch === opt}
                                            onChange={e => setFormData({ ...formData, baptizedInEvangelicalChurch: e.target.value })}
                                            className="text-cyan-600 focus:ring-cyan-500 bg-gray-950 border-gray-700"
                                        />
                                        <span className="text-gray-300 capitalize">{opt.toLowerCase()}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {formData.baptizedInEvangelicalChurch === 'NO' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">¿Te gustaría bautizarte?</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="wantsBaptism"
                                            value="SI"
                                            checked={formData.wantsBaptism === 'SI'}
                                            onChange={e => setFormData({ ...formData, wantsBaptism: e.target.value })}
                                            className="text-cyan-600 focus:ring-cyan-500 bg-gray-950 border-gray-700"
                                        />
                                        <span className="text-gray-300">Sí, me gustaría</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="wantsBaptism"
                                            value="NO"
                                            checked={formData.wantsBaptism === 'NO'}
                                            onChange={e => setFormData({ ...formData, wantsBaptism: e.target.value })}
                                            className="text-cyan-600 focus:ring-cyan-500 bg-gray-950 border-gray-700"
                                        />
                                        <span className="text-gray-300">No por ahora</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* PERFIL PERSONAL */}
                <section className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-xl font-bold text-blue-400 mb-6 uppercase tracking-wider border-b border-gray-800 pb-2">Sección 4: Perfil Personal</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">¿A qué te dedicas actualmente? *</label>
                            <input
                                required
                                type="text"
                                value={formData.occupation}
                                onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">¿Qué actividades disfrutas hacer? *</label>
                            <input
                                required
                                type="text"
                                value={formData.hobbies}
                                onChange={e => setFormData({ ...formData, hobbies: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">¿Estás disponible para servir? *</label>
                            <select
                                required
                                value={formData.serviceAvailability}
                                onChange={e => setFormData({ ...formData, serviceAvailability: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Seleccione...</option>
                                <option value="SI">Sí, estoy dispuesto/a</option>
                                <option value="NO">No estoy disponible por ahora</option>
                                <option value="NO_SEGURO">No estoy seguro/a</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">¿En cuál de las siguientes áreas te gustaría servir?</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {SERVICE_AREAS.map(area => (
                                    <label key={area} className="flex items-center gap-3 p-3 bg-gray-950 border border-gray-800 rounded-lg cursor-pointer hover:border-blue-500/50 transition-colors">
                                        <div className={cn(
                                            "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                            formData.preferredServiceAreas.includes(area)
                                                ? "bg-blue-600 border-blue-600 text-white"
                                                : "border-gray-600 text-transparent"
                                        )}>
                                            <CheckSquare className="w-3.5 h-3.5" />
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={formData.preferredServiceAreas.includes(area)}
                                                onChange={() => toggleArrayItem('preferredServiceAreas', area)}
                                            />
                                        </div>
                                        <span className="text-gray-300 text-sm">{area}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Conditional "Other" Area Specification */}
                            {formData.preferredServiceAreas.includes("Otra área") && (
                                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Por favor especifica qué otra área te interesa:</label>
                                    <input
                                        type="text"
                                        value={formData.otherServiceArea || ''}
                                        onChange={e => setFormData({ ...formData, otherServiceArea: e.target.value })}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 placeholder:text-gray-700"
                                        placeholder="Escribe el área de servicio..."
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Describe brevemente tus talentos, dones o experiencias relevantes *</label>
                            <textarea
                                required
                                rows={3}
                                value={formData.experienceDescription}
                                onChange={e => setFormData({ ...formData, experienceDescription: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">¿Tienes experiencia previa en servicio? *</label>
                            <div className="flex gap-4">
                                {['SI', 'NO'].map(opt => (
                                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="previousServiceExperience"
                                            value={opt}
                                            checked={formData.previousServiceExperience === opt}
                                            onChange={e => setFormData({ ...formData, previousServiceExperience: e.target.value })}
                                            className="text-blue-600 focus:ring-blue-500 bg-gray-950 border-gray-700"
                                        />
                                        <span className="text-gray-300 capitalize">{opt.toLowerCase()}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* HABILIDADES */}
                <section className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-lg font-bold text-white mb-2">Habilidades, Talentos y Dones</h2>
                    <p className="text-gray-400 text-sm mb-6">De los siguientes talentos o habilidades, elija aquellos que cree que tiene.</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {SKILLS_LIST.map(skill => (
                            <label key={skill} className="flex items-center gap-3 cursor-pointer group">
                                <div className={cn(
                                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                    formData.skills.includes(skill)
                                        ? "bg-purple-600 border-purple-600 text-white"
                                        : "border-gray-600 group-hover:border-purple-500"
                                )}>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.skills.includes(skill)}
                                        onChange={() => toggleArrayItem('skills', skill)}
                                    />
                                    {formData.skills.includes(skill) && <CheckSquare className="w-3 h-3" />}
                                </div>
                                <span className={cn(
                                    "text-sm transition-colors",
                                    formData.skills.includes(skill) ? "text-purple-300 font-medium" : "text-gray-400 group-hover:text-gray-300"
                                )}>{skill}</span>
                            </label>
                        ))}
                    </div>

                    {formData.skills.includes('Otro') && (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Por favor especifica qué otra habilidad tienes:</label>
                            <input
                                type="text"
                                value={formData.otherSkill || ''}
                                onChange={e => setFormData({ ...formData, otherSkill: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 placeholder:text-gray-700"
                                placeholder="Escribe tu habilidad..."
                            />
                        </div>
                    )}
                </section>

                {/* ========= HEALTH INFORMATION ========= */}
                <section className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-xl border border-gray-800 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TriangleAlert className="w-5 h-5 text-red-400" />
                        Información de Salud
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Tipo de Sangre</label>
                            <select
                                value={formData.bloodType}
                                onChange={e => setFormData({ ...formData, bloodType: e.target.value })}
                                title="Tipo de Sangre"
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-500"
                            >
                                <option value="">Selecciona...</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="No sé">No sé</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">¿Eres alérgico a algún medicamento?</label>
                            <input
                                type="text"
                                value={formData.medicationAllergies}
                                onChange={e => setFormData({ ...formData, medicationAllergies: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-500 placeholder:text-gray-700"
                                placeholder="Ej: Penicilina, Aspirina, Ninguno..."
                            />
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="mt-6 pt-4 border-t border-gray-800">
                        <p className="text-sm text-gray-400 mb-4">En caso de emergencia, ¿a quién podemos llamar?</p>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Nombre del contacto</label>
                                <input
                                    type="text"
                                    value={formData.emergencyContactName}
                                    onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-500 placeholder:text-gray-700"
                                    placeholder="Nombre completo..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Teléfono del contacto</label>
                                <input
                                    type="tel"
                                    value={formData.emergencyContactPhone}
                                    onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-500 placeholder:text-gray-700"
                                    placeholder="Ej: 809-555-1234"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Parentesco</label>
                            <select
                                value={formData.emergencyContactRelationship}
                                onChange={e => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                                title="Parentesco"
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-500"
                            >
                                <option value="">Selecciona...</option>
                                <option value="Padre">Padre</option>
                                <option value="Madre">Madre</option>
                                <option value="Esposo/a">Esposo/a</option>
                                <option value="Hijo/a">Hijo/a</option>
                                <option value="Hermano/a">Hermano/a</option>
                                <option value="Tío/a">Tío/a</option>
                                <option value="Primo/a">Primo/a</option>
                                <option value="Abuelo/a">Abuelo/a</option>
                                <option value="Amigo/a">Amigo/a</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-8 rounded-lg shadow-lg transition-all hover:scale-105 border border-gray-200"
                    >
                        Continuar al Pacto
                    </button>
                </div>
            </form>

            {/* Photo Modal remains loosely available if still in state but trigger removed from UI? 
                I'll keep it just in case, logic was kept above. */}
        </div>
    );
}
