import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStorage } from '../context/StorageContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Users, Award, FileText, TriangleAlert, Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { Person, SpiritualStatus } from '../types';

const STATUS_COLORS: Record<SpiritualStatus, string> = {
    'VISITA': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'CANDIDATO_PUERTAS_ABIERTAS': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'CANDIDATO_ALIADOS': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'CANDIDATO_BAUTIZO': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'MIEMBRO_ACTIVO': 'bg-green-500/10 text-green-400 border-green-500/20',
    'ESTANCADO': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'BAJA': 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function PersonDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { people, updatePerson, ministries, leadershipRoles } = useStorage();
    const { user, hasPermission } = useAuth();
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedPerson, setEditedPerson] = useState<Partial<Person>>({});

    // Permission Logic
    // Permission Logic
    const canSeeSensitiveData = hasPermission(['PASTOR_PRINCIPAL', 'PASTOR_ASOCIADO']);
    const canViewNotes = hasPermission(['PASTOR_PRINCIPAL', 'PASTOR_ASOCIADO']);
    const canWriteNotes = hasPermission([
        'ADMINISTRADOR',
        'PASTOR_PRINCIPAL',
        'PASTOR_ASOCIADO',
        'LIDER_MATRIMONIOS',
        'LIDER_HOMBRES',
        'LIDER_MUJERES',
        'LIDER_ADOLESCENTES',
        'LIDER_NINOS',
        'LIDER_PROTOCOLO',
        'LIDER_COMUNICACION',
        'LIDER_PROYECCION',
        'LIDER_MULTIMEDIA',
        'LIDER_PRODUCCION',
        'LIDER_LIMPIEZA',
        'LIDER_SEGURIDAD',
        'LIDER_GPS',
        'LIDER_CANTICO_NUEVO',
        'LIDER_CONEXION',
        'EQUIPO_CONEXION'
    ]);
    const canDeleteNotes = hasPermission(['PASTOR_PRINCIPAL', 'PASTOR_ASOCIADO']);

    // Pastoral Observations Permissions
    const canViewPastoralObservations = hasPermission(['ADMINISTRADOR', 'PASTOR_PRINCIPAL', 'PASTOR_ASOCIADO']);
    const canEditPastoralObservations = hasPermission(['ADMINISTRADOR', 'PASTOR_PRINCIPAL', 'PASTOR_ASOCIADO']);

    const handleAddNote = () => {
        if (!newNote.trim() || !person) return;

        const timestamp = new Date().toLocaleString();
        const header = `\n\n--- [${timestamp}] ${user?.username || 'Líder'} escribió: ---\n`;
        const updatedNotes = (person.notes || '') + header + newNote;

        updatePerson(person.id, { notes: updatedNotes });
        setNewNote('');
        alert('Nota agregada correctamente.');
    };

    const handleDeleteNote = (noteIndex: number) => {
        if (!person || !canDeleteNotes) return;

        const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar esta nota? Esta acción no se puede deshacer.');
        if (!confirmDelete) return;

        const notes = person.notes?.split(/(?=\n\n--- \[)/) || [];
        notes.splice(noteIndex, 1);
        const updatedNotes = notes.join('');

        updatePerson(person.id, { notes: updatedNotes });
        alert('Nota eliminada correctamente.');
    };

    const person = people.find(p => p.id === id);

    const handleEditClick = () => {
        if (person) {
            setEditedPerson(person);
            setIsEditing(true);
        }
    };

    const handleSaveClick = async () => {
        if (person && editedPerson) {
            await updatePerson(person.id, editedPerson);
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedPerson({});
    };

    const handleChange = (field: keyof Person, value: any) => {
        setEditedPerson(prev => ({ ...prev, [field]: value }));
    };

    if (!person) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <p>Persona no encontrada</p>
                <button onClick={() => navigate('/personas')} className="mt-4 text-blue-400 hover:text-blue-300">
                    Volver al directorio
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            {/* Header / Back */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => navigate('/personas')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Volver
                </button>
                {user?.role === 'ADMINISTRADOR' && (
                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveClick}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                                >
                                    Guardar Cambios
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleEditClick}
                                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm border border-gray-700"
                            >
                                Editar Perfil
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Main Profile Card */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                {/* Cover/Top Section */}
                <div className="bg-gray-800/50 p-8 border-b border-gray-800 flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div
                        onClick={() => person.photoUrl && setIsImageModalOpen(true)}
                        className={cn(
                            "w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center shrink-0 border-4 border-gray-900 overflow-hidden",
                            person.photoUrl ? "cursor-zoom-in group relative" : ""
                        )}
                    >
                        {person.photoUrl ? (
                            <img src={person.photoUrl} alt={person.fullName} className="w-full h-full rounded-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                            <User className="w-12 h-12 text-gray-400" />
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedPerson.fullName || ''}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                    className="text-3xl font-bold bg-gray-900 border border-gray-700 rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
                                />
                            ) : (
                                <h1 className="text-3xl font-bold text-white">{person.fullName}</h1>
                            )}
                            {isEditing ? (
                                <select
                                    value={editedPerson.status || 'VISITA'}
                                    onChange={(e) => handleChange('status', e.target.value as SpiritualStatus)}
                                    className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                                >
                                    {Object.keys(STATUS_COLORS).map(s => (
                                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            ) : (
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-sm font-medium border w-fit",
                                    STATUS_COLORS[person.status]
                                )}>
                                    {person.status.replace(/_/g, ' ')}
                                </span>
                            )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4 text-gray-400 text-sm">
                            {person.age && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {person.age} años
                                </div>
                            )}
                            {person.leadershipId && (
                                <div className="flex items-center gap-2 text-purple-400">
                                    <Award className="w-4 h-4" />
                                    {leadershipRoles.find(l => l.id === person.leadershipId)?.name || 'Líder'}
                                </div>
                            )}
                            {person.profession && (
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    {person.profession}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Contact Info */}
                    {canSeeSensitiveData && (
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Phone className="w-5 h-5 text-gray-500" />
                                Contacto
                            </h3>
                            <div className="bg-gray-950/50 p-4 rounded-lg border border-gray-800 space-y-3">
                                <div className="flex gap-3 items-center">
                                    <Phone className="w-5 h-5 text-gray-600 shrink-0" />
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedPerson.phone || ''}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-300 w-full"
                                        />
                                    ) : (
                                        <span className="text-gray-300">{person.phone || 'No registrado'}</span>
                                    )}
                                </div>
                                <div className="flex gap-3 items-center">
                                    <Mail className="w-5 h-5 text-gray-600 shrink-0" />
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={editedPerson.email || ''}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-300 w-full"
                                        />
                                    ) : (
                                        <span className="text-gray-300">{person.email || 'No registrado'}</span>
                                    )}
                                </div>
                                <div className="flex gap-3 mt-3">
                                    <MapPin className="w-5 h-5 text-gray-600 shrink-0 mt-1" />
                                    {isEditing ? (
                                        <div className="space-y-2 w-full">
                                            <input
                                                type="text"
                                                placeholder="Calle y número / Dirección"
                                                value={editedPerson.address || ''}
                                                onChange={(e) => handleChange('address', e.target.value)}
                                                className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-300 w-full text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Sector"
                                                    value={editedPerson.sector || ''}
                                                    onChange={(e) => handleChange('sector', e.target.value)}
                                                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-300 w-full text-sm flex-1"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Municipio"
                                                    value={editedPerson.municipality || ''}
                                                    onChange={(e) => handleChange('municipality', e.target.value)}
                                                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-300 w-full text-sm flex-1"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-gray-300">
                                            {person.residenceZone || person.address || 'No registrada'}
                                            {person.streetName && (
                                                <span className="block text-sm text-gray-500">
                                                    {person.streetName}{person.houseNumber && ` #${person.houseNumber}`}
                                                </span>
                                            )}
                                            {person.sector && (
                                                <span className="block text-sm text-gray-500">{person.sector}</span>
                                            )}
                                            {person.municipality && (
                                                <span className="block text-sm text-gray-500">{person.municipality}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Family Info */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-500" />
                            Familia
                        </h3>
                        <div className="bg-gray-950/50 p-4 rounded-lg border border-gray-800 space-y-3">
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Estado Civil</p>
                                {isEditing ? (
                                    <select
                                        value={editedPerson.civilStatus || ''}
                                        onChange={(e) => handleChange('civilStatus', e.target.value)}
                                        className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-300 w-full text-sm"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Soltero/a">Soltero/a</option>
                                        <option value="Casado/a">Casado/a</option>
                                        <option value="En una relación / Noviazgo">En una relación / Noviazgo</option>
                                        <option value="Comprometido/a">Comprometido/a</option>
                                        <option value="Unión libre">Unión libre</option>
                                        <option value="Divorciado/a">Divorciado/a</option>
                                        <option value="Separado/a">Separado/a</option>
                                    </select>
                                ) : (
                                    <p className="text-gray-300 font-medium">{person.civilStatus || 'No registrado'}</p>
                                )}
                            </div>
                            {(person.spouseName || isEditing) && (
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Cónyuge</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedPerson.spouseName || ''}
                                            onChange={(e) => handleChange('spouseName', e.target.value)}
                                            className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-300 w-full text-sm"
                                            placeholder="Nombre del cónyuge"
                                        />
                                    ) : (
                                        <p className="text-gray-300 font-medium">{person.spouseName}</p>
                                    )}
                                </div>
                            )}
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Hijos</p>
                                {isEditing ? (
                                    <div className="flex gap-3">
                                        <label className="flex items-center gap-2 text-sm text-gray-300">
                                            <input
                                                type="checkbox"
                                                checked={!!editedPerson.hasChildren}
                                                onChange={(e) => handleChange('hasChildren', e.target.checked)}
                                                className="rounded bg-gray-900 border border-gray-700"
                                            />
                                            Tiene hijos
                                        </label>
                                        {editedPerson.hasChildren && (
                                            <input
                                                type="number"
                                                min="1"
                                                value={editedPerson.childrenCount || ''}
                                                onChange={(e) => handleChange('childrenCount', parseInt(e.target.value) || 0)}
                                                className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-300 w-20 text-sm"
                                                placeholder="Cant."
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-300 font-medium">
                                        {person.hasChildren ? `Sí ${person.childrenCount ? `(${person.childrenCount})` : ''}` : 'No'}
                                    </p>
                                )}
                            </div>



                        </div>
                    </section>

                    {/* Health Information */}
                    {(person.bloodType || person.medicationAllergies || person.emergencyContactName) && (
                        <section className="space-y-4 md:col-span-2">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <TriangleAlert className="w-5 h-5 text-red-400" />
                                Información de Salud
                            </h3>
                            <div className="bg-red-950/30 p-6 rounded-lg border border-red-900/50 grid grid-cols-1 md:grid-cols-3 gap-6">
                                {person.bloodType && (
                                    <div>
                                        <p className="text-gray-500 text-xs uppercase tracking-wide">Tipo de Sangre</p>
                                        <p className="text-red-400 font-bold text-lg">{person.bloodType}</p>
                                    </div>
                                )}
                                {person.medicationAllergies && (
                                    <div>
                                        <p className="text-gray-500 text-xs uppercase tracking-wide">Alergias a Medicamentos</p>
                                        <p className="text-gray-300 font-medium">{person.medicationAllergies}</p>
                                    </div>
                                )}
                                {person.emergencyContactName && (
                                    <div className="pt-2 border-t border-red-900/30">
                                        <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Contacto de Emergencia</p>
                                        <p className="text-gray-300 font-medium">
                                            {person.emergencyContactName}
                                            {person.emergencyContactRelationship && (
                                                <span className="text-gray-500 ml-2">({person.emergencyContactRelationship})</span>
                                            )}
                                        </p>
                                        {person.emergencyContactPhone && (
                                            <a href={`tel:${person.emergencyContactPhone}`} className="text-red-400 hover:text-red-300 text-sm">
                                                📞 {person.emergencyContactPhone}
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Ministry Assignment (Pastor Principal Only for Active Members) */}
                    <section className="space-y-4 md:col-span-2">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Award className="w-5 h-5 text-gray-500" />
                            Ministerio
                        </h3>
                        <div className="bg-gray-950/50 p-6 rounded-lg border border-gray-800">
                            {(user?.role === 'PASTOR_PRINCIPAL' || user?.role === 'ADMINISTRADOR') && person.status === 'MIEMBRO_ACTIVO' ? (
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-400">Asignar esta persona a un ministerio:</p>
                                    <select
                                        value={person.ministryId || ''}
                                        onChange={(e) => updatePerson(person.id, { ministryId: e.target.value })}
                                        className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- Sin Ministerio --</option>
                                        {ministries.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>

                                    <div className="pt-2 border-t border-gray-800 mt-2">
                                        <p className="text-sm text-gray-400 mb-1">Asignar Liderazgo (Pastor Principal / Administrador):</p>
                                        <select
                                            value={person.leadershipId || ''}
                                            onChange={(e) => updatePerson(person.id, { leadershipId: e.target.value })}
                                            className="w-full max-w-md bg-gray-900 border border-purple-900/40 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">-- Sin Liderazgo --</option>
                                            {leadershipRoles.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <Award className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400 font-medium">Ministerio Asignado</p>
                                            <p className="text-white font-bold">
                                                {person.ministryId
                                                    ? ministries.find(m => m.id === person.ministryId)?.name
                                                    : 'No asignado todavía'}
                                            </p>
                                        </div>
                                    </div>

                                    {person.leadershipId && (
                                        <div className="flex items-center gap-3 bg-purple-900/10 p-2 rounded-lg border border-purple-500/20">
                                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                                <Users className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-purple-400/80 font-medium uppercase tracking-wider">Liderazgo</p>
                                                <p className="text-white font-bold">
                                                    {leadershipRoles.find(r => r.id === person.leadershipId)?.name || 'Rol Desconocido'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Church Life & Spiritual Path */}
                    <section className="space-y-4 md:col-span-2">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            Vida Eclesial y Camino Espiritual
                        </h3>
                        <div className="bg-gray-950/50 p-6 rounded-lg border border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Fechas Importantes */}
                            <div>
                                <h4 className="text-blue-400 font-semibold mb-3 text-sm uppercase">Fechas</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Fecha de Ingreso</span>
                                        {user?.role === 'ADMINISTRADOR' ? (
                                            <input
                                                type="date"
                                                value={person.firstVisitDate}
                                                onChange={(e) => updatePerson(person.id, { firstVisitDate: e.target.value })}
                                                className="bg-gray-900 border border-gray-700 rounded px-2 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        ) : (
                                            <span className="text-white font-medium">{person.firstVisitDate}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Pacto de Aliado</span>
                                        <span className={cn(
                                            "font-medium",
                                            person.pactCompleted ? "text-green-400" : "text-gray-300"
                                        )}>{person.pactCompleted ? 'Firmado' : 'Pendiente'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Estado Espiritual */}
                            <div>
                                <h4 className="text-blue-400 font-semibold mb-3 text-sm uppercase">Camino Espiritual</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Curso Aliados</span>
                                        <span className={cn(
                                            "font-medium",
                                            person.alliesCourseStatus === 'SI' ? "text-green-400" :
                                                person.alliesCourseStatus === 'EN_PROCESO' ? "text-yellow-400" : "text-gray-300"
                                        )}>{person.alliesCourseStatus === 'SI' ? 'Completado' : person.alliesCourseStatus === 'EN_PROCESO' ? 'En Proceso' : 'No iniciado'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Iglesia Anterior</span>
                                        <span className="text-white font-medium">{person.previousChurchMember ? 'Sí' : 'No'}</span>
                                    </div>
                                    {person.previousChurchMember && (
                                        <>
                                            <div className="flex justify-between pl-4 border-l border-gray-700">
                                                <span className="text-gray-500 text-sm">Congregación</span>
                                                <span className="text-gray-300 text-sm">{person.previousChurch}</span>
                                            </div>
                                            <div className="flex justify-between pl-4 border-l border-gray-700">
                                                <span className="text-gray-500 text-sm">Fecha Salida</span>
                                                <span className="text-gray-300 text-sm">{person.timeSinceLeftChurch}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Bautismo */}
                            <div className="md:col-span-2 pt-4 border-t border-gray-800">
                                <h4 className="text-cyan-400 font-semibold mb-3 text-sm uppercase">Bautismo</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-900 p-3 rounded border border-gray-800">
                                        <p className="text-gray-400 text-xs mb-1">¿Bautizado en iglesia evangélica?</p>
                                        <p className={cn("font-bold text-lg", person.baptizedInEvangelicalChurch ? "text-green-400" : "text-gray-300")}>
                                            {person.baptizedInEvangelicalChurch ? 'SÍ' : 'NO'}
                                        </p>
                                    </div>
                                    {!person.baptizedInEvangelicalChurch && (
                                        <div className="bg-gray-900 p-3 rounded border border-gray-800">
                                            <p className="text-gray-400 text-xs mb-1">Interés en Bautismo</p>
                                            <p className={cn("font-bold text-lg", person.wantsBaptism ? "text-cyan-400" : "text-gray-500")}>
                                                {person.wantsBaptism ? 'Desea Bautizarse' : 'No por ahora'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Personal Profile & Skills */}
                    <section className="space-y-4 md:col-span-2">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-500" />
                            Perfil Personal y Habilidades
                        </h3>
                        <div className="bg-gray-950/50 p-6 rounded-lg border border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-gray-500 text-xs uppercase tracking-wide mb-1">Ocupación</h4>
                                    <p className="text-white font-medium">{person.occupation || 'No registrado'}</p>
                                </div>
                                <div>
                                    <h4 className="text-gray-500 text-xs uppercase tracking-wide mb-1">Pasatiempos / Hobbies</h4>
                                    <p className="text-gray-300 text-sm">{person.hobbies || 'No registrado'}</p>
                                </div>
                                <div>
                                    <h4 className="text-gray-500 text-xs uppercase tracking-wide mb-1">Disponibilidad de Servicio</h4>
                                    <span className={cn(
                                        "px-2 py-1 rounded text-xs font-semibold",
                                        person.serviceAvailability === 'SI' ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                            person.serviceAvailability === 'NO' ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                                "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                    )}>
                                        {person.serviceAvailability === 'SI' ? 'DISPONIBLE' :
                                            person.serviceAvailability === 'NO' ? 'NO DISPONIBLE' :
                                                person.serviceAvailability === 'NO_SEGURO' ? 'NO SEGURO' : 'No especificado'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-gray-500 text-xs uppercase tracking-wide mb-2">Áreas de Interés</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {person.preferredServiceAreas && person.preferredServiceAreas.length > 0 ? (
                                            person.preferredServiceAreas.map((area, i) => (
                                                <span key={i} className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs border border-blue-500/30">
                                                    {area === 'Otra área' && person.otherServiceArea
                                                        ? `Otro: ${person.otherServiceArea}`
                                                        : area}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-600 text-sm italic">Ninguna seleccionada</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-gray-500 text-xs uppercase tracking-wide mb-2">Habilidades / Talentos</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {person.skills && person.skills.length > 0 ? (
                                            person.skills.map((skill, i) => (
                                                <span key={i} className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded text-xs border border-purple-500/30">
                                                    {skill === 'Otro' && person.otherSkill
                                                        ? `Otro: ${person.otherSkill}`
                                                        : skill}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-600 text-sm italic">Ninguna seleccionada</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {person.experienceDescription && (
                                <div className="md:col-span-2 pt-4 border-t border-gray-800">
                                    <h4 className="text-gray-500 text-xs uppercase tracking-wide mb-2">Experiencia y Dones (Descripción)</h4>
                                    <p className="text-gray-300 text-sm italic bg-gray-900 p-3 rounded border border-gray-800">
                                        "{person.experienceDescription}"
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Experiencia previa en servicio: <span className="text-white">{person.previousServiceExperience ? 'SÍ' : 'NO'}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Pastoral Observations - NEW field */}
                    {/* Pastoral Observations - Updated Permissions */}
                    {canViewPastoralObservations && (
                        <section className="md:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Award className="w-5 h-5 text-purple-500" />
                                    Observaciones Pastorales
                                </h3>
                            </div>
                            <div className="bg-gray-950/50 p-6 rounded-lg border border-purple-900/20">
                                <div className="space-y-3">
                                    {canEditPastoralObservations ? (
                                        <>
                                            <textarea
                                                value={person.pastoralObservations || ''}
                                                onChange={(e) => updatePerson(person.id, { pastoralObservations: e.target.value })}
                                                className="w-full bg-gray-900 border border-purple-900/30 rounded-lg p-4 text-gray-300 focus:ring-2 focus:ring-purple-500 min-h-[120px] resize-y placeholder:text-gray-600 font-mono text-sm"
                                                placeholder="Espacio reservado para observaciones pastorales confidenciales..."
                                            />
                                            <p className="text-xs text-purple-400/60 text-right">
                                                Solo editables por Pastores y Administradores.
                                            </p>
                                        </>
                                    ) : (
                                        <div className="bg-gray-900 border border-purple-900/10 rounded-lg p-4 text-gray-300 min-h-[60px] font-mono text-sm whitespace-pre-wrap">
                                            {person.pastoralObservations ? person.pastoralObservations : (
                                                <span className="text-gray-600 italic">No hay observaciones registradas.</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Notes */}
                    <section className="md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-500" />
                                Notas de Seguimiento
                                {person.notes && person.notes.length > 0 && (
                                    <span className="flex items-center gap-1 text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/20">
                                        <TriangleAlert className="w-3 h-3" />
                                        Tiene observaciones
                                    </span>
                                )}
                            </h3>
                        </div>
                        <div className="bg-gray-950/50 p-6 rounded-lg border border-gray-800">
                            {canViewNotes ? (
                                // Admin/Pastor View: Full Access with formatted display
                                <div className="space-y-4">
                                    {/* Display existing notes with formatting */}
                                    {person.notes && person.notes.length > 0 ? (
                                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                                            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                                                {person.notes.split(/(?=\n\n--- \[)/).map((note, idx) => {
                                                    // Check if this part has the author header
                                                    const headerMatch = note.match(/--- \[(.+?)\] (.+?) escribió: ---/);
                                                    if (headerMatch) {
                                                        const [_fullHeader, timestamp, username] = headerMatch;
                                                        const content = note.replace(/\n\n--- \[.+?\] .+? escribió: ---\n/, '');
                                                        return (
                                                            <div key={idx} className="mb-4 last:mb-0 group">
                                                                <div className="flex items-center justify-between text-xs text-purple-400 mb-1 border-b border-gray-700 pb-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-semibold">{username}</span>
                                                                        <span className="text-gray-500">•</span>
                                                                        <span className="text-gray-400">{timestamp}</span>
                                                                    </div>
                                                                    {canDeleteNotes && (
                                                                        <button
                                                                            onClick={() => handleDeleteNote(idx)}
                                                                            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20"
                                                                            title="Eliminar nota"
                                                                        >
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <span className="text-gray-300">{content}</span>
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <div key={idx} className="mb-4 last:mb-0 group">
                                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1 border-b border-gray-700 pb-1">
                                                                <span className="italic">Nota registrada</span>
                                                                {canDeleteNotes && (
                                                                    <button
                                                                        onClick={() => handleDeleteNote(idx)}
                                                                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20"
                                                                        title="Eliminar nota"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <span className="text-gray-300">{note}</span>
                                                        </div>
                                                    );
                                                })}
                                            </pre>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic text-sm">No hay notas registradas.</p>
                                    )}

                                    {/* Add new note section */}
                                    <div className="space-y-2 border-t border-gray-700 pt-4">
                                        <label className="text-sm text-gray-400">Agregar nueva nota:</label>
                                        <textarea
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y placeholder:text-gray-600"
                                            placeholder="Escribe tu nota de seguimiento aquí..."
                                        />
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-gray-500">
                                                Modo Pastoral: Puedes ver todo el historial y agregar notas.
                                            </p>
                                            <button
                                                onClick={handleAddNote}
                                                disabled={!newNote.trim()}
                                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                                            >
                                                Guardar Nota
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : canWriteNotes ? (
                                // Leader View: Write Only (Append)
                                <div className="space-y-4">
                                    {person.notes && person.notes.length > 0 && (
                                        <div className="p-3 bg-yellow-900/10 border border-yellow-900/30 rounded-lg flex items-start gap-3">
                                            <TriangleAlert className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-yellow-500 font-medium text-sm">Hay observaciones registradas.</p>
                                                <p className="text-gray-400 text-xs mt-1">
                                                    Solo los pastores pueden ver el historial completo. Puedes agregar una nueva nota abajo.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Agregar nueva nota:</label>
                                        <textarea
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-purple-500 min-h-[100px] resize-y"
                                            placeholder="Escribe tu observación o reporte aquí..."
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                onClick={handleAddNote}
                                                disabled={!newNote.trim()}
                                                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                                            >
                                                Guardar Nota
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No tienes permisos para ver o agregar notas.</p>
                            )}
                        </div>
                    </section>

                </div>
            </div>

            {/* Image Detail Modal */}
            {isImageModalOpen && person.photoUrl && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
                    onClick={() => setIsImageModalOpen(false)}
                >
                    <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
                        <img
                            src={person.photoUrl}
                            alt={person.fullName}
                            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl animate-in zoom-in duration-300"
                        />
                        <button
                            className="absolute top-0 right-0 m-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                            onClick={() => setIsImageModalOpen(false)}
                        >
                            <ArrowLeft className="w-6 h-6 rotate-90" /> {/* Close icon would be better but ArrowLeft rotated is fine for now or I can import X */}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
