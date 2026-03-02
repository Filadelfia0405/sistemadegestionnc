import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import {
    LayoutDashboard,
    Users,
    Wallet,
    LogOut,
    UserPlus,
    Shield,
    X
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { user, logout, hasPermission } = useAuth();

    const links = [
        {
            to: '/dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            show: hasPermission([
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
            ])
        },
        {
            to: '/personas',
            label: 'Personas',
            icon: Users,
            show: hasPermission([
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
            ])
        },
        {
            to: '/registro',
            label: 'Nueva Visita',
            icon: UserPlus,
            show: hasPermission([
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
            ])
        },
        {
            to: '/finanzas',
            label: 'Finanzas',
            icon: Wallet,
            show: hasPermission(['ADMINISTRADOR', 'FINANZAS'])
        },
        {
            to: '/usuarios',
            label: 'Usuarios',
            icon: Shield,
            show: hasPermission(['ADMINISTRADOR', 'PASTOR_PRINCIPAL'])
        },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo Area */}
                <div className="h-24 flex items-center justify-between px-4 border-b border-gray-800">
                    <div className="flex items-center">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0 mr-3 overflow-hidden shadow-sm border border-gray-800/50">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain transform scale-110" />
                        </div>
                        <span className="text-white font-bold tracking-tight text-sm leading-tight text-balance">Gestión Nuevos Comienzos</span>
                    </div>
                    {/* Close button for mobile inside sidebar */}
                    <button
                        onClick={onClose}
                        className="md:hidden text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {links.map((link) => (
                        link.show && (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                onClick={() => onClose()} // Close sidebar on mobile when link is clicked
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-blue-600/10 text-blue-400"
                                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                    )
                                }
                            >
                                <link.icon className="w-5 h-5 mr-3" />
                                {link.label}
                            </NavLink>
                        )
                    ))}
                </nav>

                {/* User Footer */}
                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-3" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>
        </>
    );
}
