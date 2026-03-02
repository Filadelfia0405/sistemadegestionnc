import React, { useState } from 'react';
import { useStorage } from '../context/StorageContext';
import { User, Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Edit2, Trash2, Shield, Mail, Calendar, Key, User as UserIcon } from 'lucide-react';
import { cn } from '../utils/cn';

const ROLE_LABELS: Record<Role, string> = {
    ADMINISTRADOR: 'Administrador',
    FINANZAS: 'Finanzas',
    PASTOR_PRINCIPAL: 'Pastor Principal',
    PASTOR_ASOCIADO: 'Pastor Asociado',
    ALIADO: 'Aliado',
    LIDER_MATRIMONIOS: 'Líder Matrimonios',
    LIDER_HOMBRES: 'Líder Hombres',
    LIDER_MUJERES: 'Líder Mujeres',
    LIDER_ADOLESCENTES: 'Líder Adolescentes',
    LIDER_NINOS: 'Líder Niños',
    LIDER_PROTOCOLO: 'Líder Protocolo',
    LIDER_COMUNICACION: 'Líder Comunicación',
    LIDER_PROYECCION: 'Líder Proyección',
    LIDER_MULTIMEDIA: 'Líder Multimedia',
    LIDER_PRODUCCION: 'Líder Producción',
    LIDER_LIMPIEZA: 'Líder Limpieza',
    LIDER_SEGURIDAD: 'Líder Seguridad',
    LIDER_GPS: 'Líder GPS',
    LIDER_CANTICO_NUEVO: 'Líder Cántico Nuevo',
    LIDER_CONEXION: 'Líder Conexión',
    EQUIPO_CONEXION: 'Equipo Conexión'
};

const ROLE_COLORS: Record<Role, string> = {
    ADMINISTRADOR: 'bg-red-100 text-red-700 border-red-200',
    FINANZAS: 'bg-amber-100 text-amber-700 border-amber-200',
    PASTOR_PRINCIPAL: 'bg-purple-100 text-purple-700 border-purple-200',
    PASTOR_ASOCIADO: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    ALIADO: 'bg-gray-100 text-gray-700 border-gray-200',
    LIDER_MATRIMONIOS: 'bg-blue-100 text-blue-700 border-blue-200',
    LIDER_HOMBRES: 'bg-blue-100 text-blue-700 border-blue-200',
    LIDER_MUJERES: 'bg-blue-100 text-blue-700 border-blue-200',
    LIDER_ADOLESCENTES: 'bg-blue-100 text-blue-700 border-blue-200',
    LIDER_NINOS: 'bg-blue-100 text-blue-700 border-blue-200',
    LIDER_PROTOCOLO: 'bg-blue-100 text-blue-700 border-blue-200',
    LIDER_COMUNICACION: 'bg-blue-100 text-blue-700 border-blue-200',
    LIDER_PROYECCION: 'bg-blue-100 text-blue-700 border-blue-200',
    LIDER_MULTIMEDIA: 'bg-blue-100 text-blue-700 border-blue-200',
    LIDER_PRODUCCION: 'bg-blue-100 text-blue-700 border-blue-200',
    LIDER_LIMPIEZA: 'bg-blue-100 text-blue-700 border-blue-200',
    LIDER_SEGURIDAD: 'bg-blue-100 text-blue-700 border-blue-200',
    LIDER_GPS: 'bg-blue-100 text-blue-700 border-blue-200',
    LIDER_CANTICO_NUEVO: 'bg-blue-100 text-blue-700 border-blue-200',
    LIDER_CONEXION: 'bg-teal-100 text-teal-700 border-teal-200',
    EQUIPO_CONEXION: 'bg-teal-100 text-teal-700 border-teal-200'
};

export default function Users() {
    const { systemUsers, addSystemUser, updateSystemUser, deleteSystemUser } = useStorage();
    const { user } = useAuth();
    const canCreate = user?.role === 'ADMINISTRADOR' || user?.role === 'PASTOR_PRINCIPAL';
    const canManage = user?.role === 'ADMINISTRADOR'; // Full Edit/Delete
    const canDelete = user?.role === 'ADMINISTRADOR' || user?.role === 'PASTOR_PRINCIPAL'; // Delete (with restrictions)

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'LIDER_MATRIMONIOS' as Role
    });

    const resetForm = () => {
        setFormData({ username: '', email: '', password: '', role: 'LIDER_MATRIMONIOS' });
        setEditingUser(null);
    };

    const handleOpenAdd = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email || '',
            password: user.password || '',
            role: user.role
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            updateSystemUser(editingUser.id, {
                ...formData
            });
        } else {
            const newUser: User = {
                id: crypto.randomUUID(),
                ...formData,
                createdAt: new Date().toISOString().split('T')[0]
            };
            addSystemUser(newUser);
        }
        setIsModalOpen(false);
        resetForm();
    };

    const confirmDelete = (id: string, targetRole: Role) => {
        // Pastor Principal cannot delete Administrador
        if (user?.role === 'PASTOR_PRINCIPAL' && targetRole === 'ADMINISTRADOR') {
            alert('No tienes permisos para eliminar un Administrador.');
            setDeletingId(null);
            return;
        }
        if (!canDelete) return;
        deleteSystemUser(id);
        setDeletingId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
                    <p className="text-gray-400">Administra los accesos y permisos del sistema</p>
                </div>
                {canCreate && (
                    <button
                        onClick={handleOpenAdd}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                    >
                        <UserPlus className="w-5 h-5" />
                        Nuevo Usuario
                    </button>
                )}
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {systemUsers.map(sUser => (
                    <div key={sUser.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all group relative">
                        {/* Delete confirmation overlay */}
                        {deletingId === sUser.id && (
                            <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-200">
                                <Trash2 className="w-10 h-10 text-red-500 mb-2" />
                                <p className="text-sm font-bold text-white mb-4">¿Eliminar este usuario definitivamente?</p>
                                <div className="flex gap-2 w-full">
                                    <button
                                        onClick={() => setDeletingId(null)}
                                        className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(sUser.id, sUser.role)}
                                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-gray-800 rounded-xl">
                                    <UserIcon className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {/* Edit: Admin can edit all, Pastor Principal can edit non-Admin */}
                                    {(canManage || (user?.role === 'PASTOR_PRINCIPAL' && sUser.role !== 'ADMINISTRADOR')) && (
                                        <button
                                            onClick={() => handleEdit(sUser)}
                                            title="Editar Usuario"
                                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    {/* Show delete button for: canDelete AND (not trying to delete Admin as Pastor) */}
                                    {canDelete && !(user?.role === 'PASTOR_PRINCIPAL' && sUser.role === 'ADMINISTRADOR') && (
                                        <button
                                            onClick={() => setDeletingId(sUser.id)}
                                            title="Eliminar Usuario"
                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{sUser.username}</h3>
                                    <span className={cn(
                                        "inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border mt-1",
                                        ROLE_COLORS[sUser.role]
                                    )}>
                                        {ROLE_LABELS[sUser.role]}
                                    </span>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-gray-800">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Mail className="w-4 h-4" />
                                        {sUser.email || 'Sin correo'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        Creado: {sUser.createdAt}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">
                                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Nombre Completo</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        required
                                        type="text"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej: Juan Pérez"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="usuario@correo.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Contraseña</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        required={!editingUser}
                                        type="text"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Contraseña de acceso"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Rol / Permisos</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <select
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                        title="Seleccionar rol del usuario"
                                    >
                                        {user?.role === 'ADMINISTRADOR' && (
                                            <option value="ADMINISTRADOR">Administrador (Permiso Total)</option>
                                        )}
                                        <option value="FINANZAS">Finanzas (Solo Finanzas)</option>
                                        <option value="PASTOR_PRINCIPAL">Pastor Principal</option>
                                        <option value="PASTOR_ASOCIADO">Pastor Asociado</option>
                                        <optgroup label="Líderes de Ministerio">
                                            <option value="LIDER_MATRIMONIOS">Líder Matrimonios</option>
                                            <option value="LIDER_HOMBRES">Líder Hombres</option>
                                            <option value="LIDER_MUJERES">Líder Mujeres</option>
                                            <option value="LIDER_ADOLESCENTES">Líder Adolescentes</option>
                                            <option value="LIDER_NINOS">Líder Niños</option>
                                            <option value="LIDER_PROTOCOLO">Líder Protocolo</option>
                                            <option value="LIDER_COMUNICACION">Líder Comunicación</option>
                                            <option value="LIDER_PROYECCION">Líder Proyección</option>
                                            <option value="LIDER_MULTIMEDIA">Líder Multimedia</option>
                                            <option value="LIDER_PRODUCCION">Líder Producción</option>
                                            <option value="LIDER_LIMPIEZA">Líder Limpieza</option>
                                            <option value="LIDER_SEGURIDAD">Líder Seguridad</option>
                                            <option value="LIDER_GPS">Líder GPS</option>
                                            <option value="LIDER_CANTICO_NUEVO">Líder Cántico Nuevo</option>
                                            <option value="LIDER_CONEXION">Líder Conexión</option>
                                            <option value="EQUIPO_CONEXION">Equipo Conexión</option>
                                        </optgroup>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all"
                                >
                                    {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
