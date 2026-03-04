import { useState, useEffect } from 'react';
import { useStorage } from '../context/StorageContext';
import { useAuth } from '../context/AuthContext';
import { Person, SpiritualStatus } from '../types';
import { Search, UserCheck, Eye, ArrowRightLeft, TriangleAlert, UserMinus, Users, Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SECTORS } from '../data/sectors';

const STATUS_COLORS: Record<SpiritualStatus, string> = {
    'VISITA': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'CANDIDATO_PUERTAS_ABIERTAS': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'CANDIDATO_ALIADOS': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'CANDIDATO_BAUTIZO': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'MIEMBRO_ACTIVO': 'bg-green-500/10 text-green-400 border-green-500/20',
    'ESTANCADO': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'BAJA': 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function PeopleList() {
    const { people, ministries, updatePerson, deletePerson } = useStorage();
    const { user, hasPermission } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Modals state
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<SpiritualStatus>('VISITA');

    const [personToDeactivate, setPersonToDeactivate] = useState<Person | null>(null);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

    // Delete Modal State
    const [personToDelete, setPersonToDelete] = useState<Person | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    // List of municipalities (can be moved to a constants file if reused)
    const MUNICIPALITIES = [
        "Distrito Nacional",
        "Santo Domingo Este",
        "Santo Domingo Norte",
        "Santo Domingo Oeste",
        "Boca Chica",
        "Los Alcarrizos",
        "Pedro Brand",
        "San Antonio de Guerra"
    ];

    const [statusFilter, setStatusFilter] = useState<'ALL' | SpiritualStatus>('ALL');
    const [ministryFilter, setMinistryFilter] = useState<'ALL' | string>('ALL');
    const [sectorFilter, setSectorFilter] = useState<string>('ALL');
    const [municipalityFilter, setMunicipalityFilter] = useState<string>('ALL');


    // Read status from URL on mount
    useEffect(() => {
        const statusFromUrl = searchParams.get('status') as SpiritualStatus | null;
        if (statusFromUrl && Object.keys(STATUS_COLORS).includes(statusFromUrl)) {
            setStatusFilter(statusFromUrl);
        }
    }, [searchParams]);

    const canSeeSensitiveData = hasPermission(['PASTOR_PRINCIPAL', 'PASTOR_ASOCIADO']);
    // Explicitly check role to avoid any context issues
    const canDeactivate = user?.role === 'ADMINISTRADOR' || user?.role === 'PASTOR_PRINCIPAL';

    const filteredPeople = people.filter(p => {
        const matchesSearch = p.fullName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
        const matchesMinistry = ministryFilter === 'ALL' || p.ministryId === ministryFilter;
        const matchesSector = sectorFilter === 'ALL' || p.sector === sectorFilter;
        const matchesMunicipality = municipalityFilter === 'ALL' || p.municipality === municipalityFilter;
        return matchesSearch && matchesStatus && matchesMinistry && matchesSector && matchesMunicipality;
    });



    const openStatusModal = (person: Person) => {
        setSelectedPerson(person);
        setNewStatus(person.status);
        setIsStatusModalOpen(true);
    };

    const handleUpdateStatus = () => {
        if (selectedPerson) {
            updatePerson(selectedPerson.id, { status: newStatus });
            setIsStatusModalOpen(false);
            setSelectedPerson(null);
        }
    };

    const openDeactivateModal = (person: Person) => {
        setPersonToDeactivate(person);
        setIsDeactivateModalOpen(true);
    };

    const handleConfirmDeactivate = () => {
        if (personToDeactivate) {
            updatePerson(personToDeactivate.id, { status: 'BAJA' });
            setIsDeactivateModalOpen(false);
            setPersonToDeactivate(null);
        }
    };

    const openDeleteModal = (person: Person) => {
        setPersonToDelete(person);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (personToDelete) {
            deletePerson(personToDelete.id);
            setIsDeleteModalOpen(false);
            setPersonToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-lg font-bold text-white flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-blue-500" />
                        Directorio de Personas
                    </h1>
                    <p className="text-gray-400">Total: {people.length} registros</p>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'ALL' | SpiritualStatus)}
                        className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm w-40"
                    >
                        <option value="ALL">Estados</option>
                        {Object.keys(STATUS_COLORS).map((status) => (
                            <option key={status} value={status}>
                                {status.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>

                    {/* Ministry Filter */}
                    <select
                        value={ministryFilter}
                        onChange={(e) => setMinistryFilter(e.target.value)}
                        className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm w-40"
                    >
                        <option value="ALL">Ministerios</option>
                        {ministries.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>

                    {/* Municipality Filter */}
                    <div className="flex items-center gap-2">
                        <select
                            value={municipalityFilter}
                            onChange={(e) => setMunicipalityFilter(e.target.value)}
                            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm w-40"
                        >
                            <option value="ALL">Municipios</option>
                            {MUNICIPALITIES.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sector Filter */}
                    <select
                        value={sectorFilter}
                        onChange={(e) => setSectorFilter(e.target.value)}
                        className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm w-40"
                    >
                        <option value="ALL">Sectores</option>
                        {Object.entries(SECTORS).map(([municipality, sectors]) => (
                            <optgroup key={municipality} label={municipality}>
                                {sectors.map(sector => (
                                    <option key={sector} value={sector}>{sector}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-900 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-40 text-[10px]"
                        />
                    </div>
                </div>
            </div>

            {/* Municipality Summary */}
            {municipalityFilter !== 'ALL' && (
                <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm text-blue-300 font-medium">Personas en: <span className="text-white font-bold">{municipalityFilter}</span></p>
                        <p className="text-2xl font-bold text-white">{filteredPeople.length}</p>
                    </div>
                </div>
            )}

            {/* Sector Summary */}
            {sectorFilter !== 'ALL' && (
                <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm text-blue-300 font-medium">Personas en: <span className="text-white font-bold">{sectorFilter}</span></p>
                        <p className="text-2xl font-bold text-white">{filteredPeople.length}</p>
                    </div>
                </div>
            )}

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-950/50">
                                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Nombre</th>
                                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Ministerio</th>
                                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha de Ingreso</th>
                                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Acceso Portal</th>
                                {canSeeSensitiveData && (
                                    <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Contacto</th>
                                )}
                                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filteredPeople.map((person) => (
                                <tr key={person.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-white flex items-center gap-2">
                                            {person.fullName}
                                            {person.notes && person.notes.length > 0 && (
                                                <TriangleAlert className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
                                            )}
                                        </div>
                                        {!canSeeSensitiveData && <div className="text-xs text-gray-600">ID: {person.id.slice(0, 8)}</div>}
                                    </td>
                                    <td className="p-4">
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-[10px] font-medium border whitespace-nowrap",
                                            STATUS_COLORS[person.status]
                                        )}>
                                            {person.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-300 text-sm">
                                        {ministries.find(m => m.id === person.ministryId)?.name || '-'}
                                    </td>
                                    <td className="p-4 text-gray-300 text-sm">
                                        {person.firstVisitDate}
                                    </td>
                                    <td className="p-4">
                                        {['PASTOR_PRINCIPAL', 'PASTOR_ASOCIADO', 'ADMINISTRADOR'].includes(user?.role || '') ? (
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => updatePerson(person.id, { pactCompleted: !person.pactCompleted })}
                                                    className={cn(
                                                        "px-2 py-1 rounded-lg text-[10px] font-bold border transition-all hover:scale-105 active:scale-95",
                                                        person.pactCompleted
                                                            ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                                                            : "bg-gray-800 text-gray-500 border-gray-700 hover:text-gray-300 hover:border-gray-600"
                                                    )}
                                                >
                                                    {person.pactCompleted ? 'FINALIZADO' : 'INCOMPLETO'}
                                                </button>
                                                {!person.pactCompleted && ['CANDIDATO_PUERTAS_ABIERTAS', 'CANDIDATO_ALIADOS', 'CANDIDATO_BAUTIZO'].includes(person.status) && (
                                                    <span className="text-[9px] text-blue-400/60 font-medium text-center italic">En progreso...</span>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                {person.pactCompleted ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 uppercase">
                                                        Finalizado
                                                    </span>
                                                ) : ['CANDIDATO_PUERTAS_ABIERTAS', 'CANDIDATO_ALIADOS', 'CANDIDATO_BAUTIZO'].includes(person.status) ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                                                        Activa
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-600 text-xs">-</span>
                                                )}
                                            </>
                                        )}
                                    </td>
                                    {canSeeSensitiveData && (
                                        <td className="p-4">
                                            <div className="text-sm text-gray-300">{person.phone || '-'}</div>
                                            <div className="text-xs text-gray-500">{person.email}</div>
                                        </td>
                                    )}
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* View Profile */}
                                            <button
                                                onClick={() => navigate(`/personas/${person.id}`)}
                                                title="Ver Perfil Completo"
                                                className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>



                                            {/* Manual Status Move (Admin/Pastor/LiderConexion/EquipoConexion) */}
                                            {(canSeeSensitiveData || ((user?.role === 'LIDER_CONEXION' || user?.role === 'EQUIPO_CONEXION') && ['VISITA', 'CANDIDATO_PUERTAS_ABIERTAS', 'CANDIDATO_ALIADOS'].includes(person.status))) && (
                                                <button
                                                    onClick={() => openStatusModal(person)}
                                                    title="Mover de Estado Manualmente"
                                                    className="p-2 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
                                                >
                                                    <ArrowRightLeft className="w-5 h-5" />
                                                </button>
                                            )}

                                            {canDeactivate && person.status !== 'BAJA' && (
                                                <button
                                                    onClick={() => openDeactivateModal(person)}
                                                    title="Dar de baja"
                                                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                                >
                                                    <UserMinus className="w-5 h-5" />
                                                </button>
                                            )}

                                            {/* Delete Button (Only for BAJA) */}
                                            {canDeactivate && person.status === 'BAJA' && (
                                                <button
                                                    onClick={() => openDeleteModal(person)}
                                                    title="Eliminar permanentemente"
                                                    className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredPeople.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No se encontraron personas
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Status Change Modal */}
            {isStatusModalOpen && selectedPerson && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-2">Cambiar Estado Manualmente</h3>
                        <p className="text-gray-400 mb-6">Administrando a: <span className="text-white font-medium">{selectedPerson.fullName}</span></p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Nuevo Estado</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value as SpiritualStatus)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                >
                                    {Object.keys(STATUS_COLORS)
                                        .filter(status => canSeeSensitiveData || ((user?.role === 'LIDER_CONEXION' || user?.role === 'EQUIPO_CONEXION') && ['VISITA', 'CANDIDATO_PUERTAS_ABIERTAS', 'CANDIDATO_ALIADOS'].includes(status)))
                                        .map((status) => (
                                            <option key={status} value={status}>
                                                {status.replace(/_/g, ' ')}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsStatusModalOpen(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdateStatus}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Guardar Cambio
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Deactivate Confirmation Modal */}
            {isDeactivateModalOpen && personToDeactivate && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center gap-3 mb-4 text-red-400">
                            <TriangleAlert className="w-8 h-8" />
                            <h3 className="text-xl font-bold text-white">Confirmar Baja</h3>
                        </div>

                        <p className="text-gray-300 mb-6">
                            ¿Estás seguro de que deseas dar de baja a <span className="text-white font-bold">{personToDeactivate.fullName}</span>?
                            <br /><br />
                            <span className="text-sm text-gray-400">Esta acción cambiará su estado a "BAJA". Podrás reactivarlo manualmente después si es necesario.</span>
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeactivateModalOpen(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDeactivate}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Confirmar Baja
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Permanent Delete Modal */}
            {isDeleteModalOpen && personToDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl border-red-500/20">
                        <div className="flex items-center gap-3 mb-4 text-red-500">
                            <Trash2 className="w-8 h-8" />
                            <h3 className="text-xl font-bold text-white">Eliminar Permanentemente</h3>
                        </div>

                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
                            <p className="text-red-200 text-sm font-medium flex gap-2">
                                <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
                                Advertencia: Esta acción es irreversible.
                            </p>
                        </div>

                        <p className="text-gray-300 mb-6">
                            ¿Estás seguro de que deseas eliminar permanentemente a <span className="text-white font-bold">{personToDelete.fullName}</span>?
                            <br /><br />
                            <span className="text-sm text-gray-400">Se perderá todo el historial de visitas y datos asociados.</span>
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-500/20"
                            >
                                Eliminar Definitivamente
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
