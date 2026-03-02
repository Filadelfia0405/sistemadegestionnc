import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStorage } from '../context/StorageContext';
import { Users, UserPlus, Award, UserCheck, DollarSign, Wallet, Download, ClipboardList, X, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

export default function Dashboard() {
    const { user, hasPermission } = useAuth();
    const { people, transactions } = useStorage();
    const navigate = useNavigate();
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

    // --- Metrics ---
    const totalVisits = people.filter(p => p.status === 'VISITA').length;
    const candPuertas = people.filter(p => p.status === 'CANDIDATO_PUERTAS_ABIERTAS').length;
    const candAliados = people.filter(p => p.status === 'CANDIDATO_ALIADOS').length;
    const candBautizo = people.filter(p => p.status === 'CANDIDATO_BAUTIZO').length;

    // Total candidates for general reporting if needed, but we show specifics now

    const members = people.filter(p => p.status === 'MIEMBRO_ACTIVO').length;
    const estancados = people.filter(p => p.status === 'ESTANCADO').length;
    const bajas = people.filter(p => p.status === 'BAJA').length;

    // Tracking Notes Metric (Pastoral Only)
    const peopleWithNotes = people.filter(p => p.notes && p.notes.trim().length > 0);
    const countWithNotes = peopleWithNotes.length;
    const showTrackingMetric = hasPermission(['PASTOR_PRINCIPAL', 'PASTOR_ASOCIADO']);

    // --- CSV Export Functions ---
    const downloadCSV = (data: string, filename: string) => {
        const blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const exportFinancesCSV = () => {
        const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'];
        const rows = transactions.map(t => [
            t.date,
            t.type === 'INGRESO' ? 'Ingreso' : 'Egreso',
            t.category,
            t.description,
            t.amount.toString()
        ]);
        const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        downloadCSV(csv, `finanzas_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const exportMembersCSV = () => {
        const headers = ['Nombre', 'Estado', 'Teléfono', 'Email', 'Zona', 'Municipio', 'Fecha Ingreso', 'Ministerio'];
        const rows = people.map(p => [
            p.fullName,
            p.status,
            p.phone || '',
            p.email || '',
            p.residenceZone || p.address || '',
            p.municipality || '',
            p.firstVisitDate || '',
            p.ministryId || ''
        ]);
        const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        downloadCSV(csv, `miembros_${new Date().toISOString().split('T')[0]}.csv`);
    };

    // --- Chart Data Preparation ---

    // 1. Monthly Growth (Last 6 Months)
    const getMonthlyGrowth = () => {
        const months = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = d.toLocaleString('es-ES', { month: 'short' });
            const count = people.filter(p => {
                const visitDate = new Date(p.firstVisitDate);
                return visitDate.getMonth() === d.getMonth() && visitDate.getFullYear() === d.getFullYear();
            }).length;
            months.push({ name: monthName, Nuevos: count });
        }
        return months;
    };
    const growthData = getMonthlyGrowth();

    // 2. Status Distribution
    const statusData = [
        { name: 'Visitas', value: totalVisits, color: '#3b82f6' }, // Blue
        { name: 'Puertas A.', value: candPuertas, color: '#eab308' }, // Yellow
        { name: 'Aliados', value: candAliados, color: '#6366f1' }, // Indigo
        { name: 'Bautizo', value: candBautizo, color: '#a855f7' }, // Purple
        { name: 'Miembros', value: members, color: '#10b981' }, // Green
        { name: 'Estancados', value: estancados, color: '#f97316' }, // Orange
        { name: 'Bajas', value: bajas, color: '#6b7280' }, // Gray
    ].filter(d => d.value > 0);

    // 3. Finance History (Mock monthly data generation based on transactions)
    const getFinanceHistory = () => {
        // Group transactions by month
        const history = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = d.toLocaleString('es-ES', { month: 'short' });

            const monthTransactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
            });

            const income = monthTransactions.filter(t => t.type === 'INGRESO').reduce((acc, c) => acc + c.amount, 0);
            const expenses = monthTransactions.filter(t => t.type === 'EGRESO').reduce((acc, c) => acc + c.amount, 0);

            history.push({ name: monthName, Ingresos: income, Egresos: expenses });
        }
        return history;
    };
    const financeData = getFinanceHistory();


    // --- Totals for Finance Cards ---
    const income = transactions.filter(t => t.type === 'INGRESO').reduce((acc, c) => acc + c.amount, 0);
    const expenses = transactions.filter(t => t.type === 'EGRESO').reduce((acc, c) => acc + c.amount, 0);
    const balance = income - expenses;

    const showFinance = hasPermission(['ADMINISTRADOR', 'FINANZAS', 'PASTOR_PRINCIPAL', 'PASTOR_ASOCIADO']);

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Hola, {user?.username}</h1>
                    <p className="text-gray-400">Aquí tienes un resumen de la actividad de la iglesia.</p>
                </div>
                <button
                    onClick={exportMembersCSV}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    title="Exportar datos de membresía a CSV"
                >
                    <Download className="w-4 h-4" />
                    Exportar Membresía
                </button>
            </div>

            {/* People Funnel Cards */}
            <section>
                <div className={`grid gap-3 ${showTrackingMetric ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-7'}`}>
                    {/* 1. VISITAS */}
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => navigate('/personas?status=VISITA')}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-xs font-medium truncate" title="Visitas Activas">Visitas</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{totalVisits}</h3>
                            </div>
                            <div className="p-1.5 bg-blue-500/10 rounded-md">
                                <UserPlus className="w-4 h-4 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    {/* 2. CANDIDATOS PUERTAS ABIERTAS */}
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 hover:border-yellow-500/50 transition-colors cursor-pointer" onClick={() => navigate('/personas?status=CANDIDATO_PUERTAS_ABIERTAS')}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-xs font-medium" title="Candidatos Puertas Abiertas">Candidatos Puertas Abiertas</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{candPuertas}</h3>
                            </div>
                            <div className="p-1.5 bg-yellow-500/10 rounded-md">
                                <Award className="w-4 h-4 text-yellow-400" />
                            </div>
                        </div>
                    </div>

                    {/* 3. CANDIDATOS ALIADOS */}
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 hover:border-indigo-500/50 transition-colors cursor-pointer" onClick={() => navigate('/personas?status=CANDIDATO_ALIADOS')}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-xs font-medium" title="Candidatos Aliados">Candidatos Aliados</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{candAliados}</h3>
                            </div>
                            <div className="p-1.5 bg-indigo-500/10 rounded-md">
                                <Award className="w-4 h-4 text-indigo-400" />
                            </div>
                        </div>
                    </div>

                    {/* 4. CANDIDATOS BAUTIZO */}
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 hover:border-purple-500/50 transition-colors cursor-pointer" onClick={() => navigate('/personas?status=CANDIDATO_BAUTIZO')}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-xs font-medium" title="Candidatos Bautizo">Candidatos Bautizo</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{candBautizo}</h3>
                            </div>
                            <div className="p-1.5 bg-purple-500/10 rounded-md">
                                <Award className="w-4 h-4 text-purple-400" />
                            </div>
                        </div>
                    </div>

                    {/* 5. MIEMBROS */}
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 hover:border-green-500/50 transition-colors cursor-pointer" onClick={() => navigate('/personas?status=MIEMBRO_ACTIVO')}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-xs font-medium" title="Miembros Activos">Miembros Activos</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{members}</h3>
                            </div>
                            <div className="p-1.5 bg-green-500/10 rounded-md">
                                <UserCheck className="w-4 h-4 text-green-400" />
                            </div>
                        </div>
                    </div>

                    {/* 6. ESTANCADOS (URGENTE) */}
                    <div className="bg-gray-900 p-3 rounded-lg border border-orange-500/30 hover:border-orange-500 transition-colors cursor-pointer relative overflow-hidden group" onClick={() => navigate('/personas?status=ESTANCADO')}>
                        <div className="absolute inset-0 bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div className="overflow-hidden">
                                <p className="text-orange-400 text-xs font-bold truncate" title="Estancados > 30 días">Estancados</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{estancados}</h3>
                                <p className="text-[10px] text-orange-500/80 truncate">Revisar</p>
                            </div>
                            <div className="p-1.5 bg-orange-500/10 rounded-md border border-orange-500/20">
                                <Users className="w-4 h-4 text-orange-500" />
                            </div>
                        </div>
                    </div>

                    {/* 7. BAJAS */}
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 hover:border-red-500/50 transition-colors cursor-pointer" onClick={() => navigate('/personas?status=BAJA')}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-xs font-medium truncate" title="Bajas / Inactivos">Bajas</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{bajas}</h3>
                            </div>
                            <div className="p-1.5 bg-red-500/10 rounded-md">
                                <Users className="w-4 h-4 text-red-400" />
                            </div>
                        </div>
                    </div>

                    {/* 8. SEGUIMIENTO (PASTORAL) */}
                    {showTrackingMetric && (
                        <div className="bg-gray-900 p-3 rounded-lg border border-purple-500/30 hover:border-purple-500 transition-colors cursor-pointer relative overflow-hidden group" onClick={() => setIsTrackingModalOpen(true)}>
                            <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors"></div>
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <p className="text-purple-400 text-xs font-bold truncate" title="Personas con notas de seguimiento">En Seguimiento</p>
                                    <h3 className="text-2xl font-bold text-white mt-1">{countWithNotes}</h3>
                                    <p className="text-[10px] text-purple-500/80 truncate">Ver detalles</p>
                                </div>
                                <div className="p-1.5 bg-purple-500/10 rounded-md border border-purple-500/20">
                                    <ClipboardList className="w-4 h-4 text-purple-500" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Tracking Modal */}
            {isTrackingModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 rounded-t-xl">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-purple-500" />
                                Personas en Seguimiento
                            </h3>
                            <button
                                onClick={() => setIsTrackingModalOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {peopleWithNotes.length > 0 ? (
                                <div className="space-y-1">
                                    {peopleWithNotes.map(person => (
                                        <div
                                            key={person.id}
                                            onClick={() => navigate(`/personas/${person.id}`)}
                                            className="p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors group flex items-center justify-between border border-transparent hover:border-gray-700"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-xs ring-1 ring-purple-500/20">
                                                    {person.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                                                        {person.fullName}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${person.status === 'MIEMBRO_ACTIVO' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                            person.status === 'ESTANCADO' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                                person.status === 'BAJA' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                            }`}>
                                                            {person.status.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No hay personas con notas de seguimiento.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-t border-gray-800 bg-gray-900/50 rounded-b-xl text-center">
                            <span className="text-xs text-gray-500">
                                Total: {countWithNotes} personas
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bar Chart: Growth */}
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-lg font-bold text-white mb-6">Nuevas Personas (Últimos 6 Meses)</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={growthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="name" stroke="#9ca3af" tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                                    itemStyle={{ color: '#2dd4bf' }}
                                />
                                <Bar dataKey="Nuevos" fill="#2dd4bf" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut Chart: Distribution */}
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-lg font-bold text-white mb-6">Distribución de Miembros</h3>
                    <div className="h-64 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* Finance Section */}
            {showFinance && (
                <section>
                    <div className="flex justify-between items-center mb-4 mt-8">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-green-500" />
                            Resumen Financiero
                        </h2>
                        <button
                            onClick={exportFinancesCSV}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                            title="Exportar datos financieros a CSV"
                        >
                            <Download className="w-4 h-4" />
                            Exportar Finanzas
                        </button>
                    </div>

                    {/* Finance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 relative overflow-hidden">
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <p className="text-gray-400 text-sm font-medium">Balance Neto</p>
                                    <h3 className={["text-3xl font-bold mt-2", balance >= 0 ? "text-white" : "text-red-400"].join(' ')}>
                                        ${balance.toLocaleString()}
                                    </h3>
                                </div>
                                <div className="p-3 bg-green-600/20 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-green-400" />
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none"></div>
                        </div>

                        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">Total Ingresos</p>
                                <h3 className="text-2xl font-bold text-green-400">+${income.toLocaleString()}</h3>
                            </div>
                            <div className="mt-4 h-1 w-full bg-gray-800 rounded-full">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>

                        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">Total Gastos</p>
                                <h3 className="text-2xl font-bold text-red-400">-${expenses.toLocaleString()}</h3>
                            </div>
                            <div className="mt-4 h-1 w-full bg-gray-800 rounded-full">
                                <div className="h-full bg-red-500 rounded-full" style={{ width: `${income > 0 ? Math.min((expenses / income) * 100, 100) : 0}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Finance Line Chart */}
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                        <h3 className="text-lg font-bold text-white mb-6">Flujo de Caja (Últimos 6 Meses)</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={financeData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="name" stroke="#9ca3af" tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="Ingresos" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                                    <Line type="monotone" dataKey="Egresos" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
