import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStorage } from '../context/StorageContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'liderazgo' | 'aliados'>('liderazgo');
    const { login, user: currentUser } = useAuth();
    const { people, systemUsers } = useStorage();
    const navigate = useNavigate();

    // Auto-login for Ally Portal tab
    useEffect(() => {
        if (activeTab === 'aliados' && email.includes('@') && email.length > 5) {
            // Prevent infinite loop: if already logged in as THIS person, skip
            const found = people.find(p => p.email && p.email.toLowerCase() === email.toLowerCase());

            if (found) {
                const isAlreadyLoggedIn = currentUser?.role === 'ALIADO' && (currentUser.id === found.id || currentUser.username === found.fullName);

                if (!isAlreadyLoggedIn) {
                    login({
                        id: found.id,
                        username: found.fullName,
                        role: 'ALIADO',
                        createdAt: found.firstVisitDate
                    });
                    navigate('/aliados');
                }
            }
        }
    }, [email, activeTab, people, login, navigate, currentUser]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (activeTab === 'aliados') {
            if (!email.trim()) {
                setError('Por favor ingresa tu correo electrónico');
                return;
            }

            // Find person with this email
            const person = people.find(p => p.email?.toLowerCase() === email.toLowerCase());

            if (person) {
                login({
                    id: person.id,
                    username: person.fullName,
                    role: 'ALIADO',
                    createdAt: person.firstVisitDate
                });
                navigate('/aliados');
            } else {
                setError('No encontramos un registro con este correo. Contacta a un líder.');
            }
            return;
        }

        // Authenticate against system users
        const user = systemUsers.find(u =>
            (u.username === username || u.email === username) &&
            u.password === password
        );

        if (user) {
            login(user);
            navigate('/dashboard');
        } else {
            setError('Credenciales inválidas');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#1a1b2e] p-4 font-sans">
            {/* Main Card */}
            <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden p-8 md:p-12">

                {/* Header Section */}
                <div className="flex flex-col items-center mb-8">
                    {/* Logo Container */}
                    <div className="w-40 h-40 flex items-center justify-center mb-6">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain transform scale-125" />
                    </div>

                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#2d305e] text-center mb-6">
                        Gestión de integración
                    </h2>

                    {/* Toggle Switch */}
                    <div className="w-full bg-[#f3f4f6] p-1.5 rounded-2xl flex relative">
                        <button
                            type="button"
                            onClick={() => setActiveTab('liderazgo')}
                            className={cn(
                                "flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 z-10",
                                activeTab === 'liderazgo'
                                    ? "bg-white text-[#2d305e] shadow-md"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Liderazgo
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('aliados')}
                            className={cn(
                                "flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 z-10",
                                activeTab === 'aliados'
                                    ? "bg-white text-[#2d305e] shadow-md"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Portal Aliados
                        </button>
                    </div>
                </div>

                {/* Form Section */}
                {/* Form Section */}
                <form onSubmit={handleLogin} className="space-y-6">
                    {activeTab === 'liderazgo' ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Usuario</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#4f46e5] transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        title="Usuario o correo"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className={cn(
                                            "block w-full pl-11 pr-4 py-4 bg-[#1e2030] border border-transparent rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4f46e5/50] focus:bg-[#25283d] transition-all",
                                            error && "border-red-500 focus:ring-red-500"
                                        )}
                                        placeholder="Tu usuario"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Contraseña</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#4f46e5] transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        title="Contraseña"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={cn(
                                            "block w-full pl-11 pr-4 py-4 bg-[#1e2030] border border-transparent rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4f46e5/50] focus:bg-[#25283d] transition-all",
                                            error && "border-red-500 focus:ring-red-500"
                                        )}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Correo de Acceso</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#4f46e5] transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    title="Correo registrado"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={cn(
                                        "block w-full pl-11 pr-4 py-4 bg-[#1e2030] border border-transparent rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4f46e5/50] focus:bg-[#25283d] transition-all",
                                        error && "border-red-500 focus:ring-red-500"
                                    )}
                                    placeholder="ejemplo@correo.com"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2 px-1">Ingresa el correo registrado para acceder a tu cuenta.</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-[#353888] hover:bg-[#2d3075] text-white font-bold py-4 rounded-2xl transition-all transform active:scale-[0.98] shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
                    >
                        {activeTab === 'liderazgo' ? (
                            <>
                                <ShieldCheck className="w-5 h-5" />
                                Iniciar Sesión
                            </>
                        ) : (
                            "Ingresar al Portal"
                        )}
                    </button>
                </form>
            </div>

            {/* Background Decoration */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
                <div className="absolute -top-[20%] -right-[10%] w-[70vh] h-[70vh] rounded-full bg-purple-900/20 blur-3xl"></div>
                <div className="absolute -bottom-[20%] -left-[10%] w-[70vh] h-[70vh] rounded-full bg-blue-900/10 blur-3xl"></div>
            </div>
        </div>
    );
}
