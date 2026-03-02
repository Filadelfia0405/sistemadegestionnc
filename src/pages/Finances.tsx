import React, { useState } from 'react';
import { useStorage } from '../context/StorageContext';
import { useAuth } from '../context/AuthContext';
import { Transaction, TransactionType, TransactionCategory } from '../types';
import { Wallet, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '../utils/cn';
import { format } from 'date-fns';

export default function Finances() {
    const { transactions, addTransaction } = useStorage();
    const { user } = useAuth();

    // Filters
    const [filterCategory, setFilterCategory] = useState<'ALL' | TransactionCategory>('ALL');
    const [filterMonth, setFilterMonth] = useState<number | 'ALL'>('ALL'); // 0-11
    const [filterYear, setFilterYear] = useState<number | 'ALL'>(new Date().getFullYear());

    const [formData, setFormData] = useState<Partial<Transaction>>({
        amount: 0,
        type: 'INGRESO',
        category: 'DIEZMO',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    // --- Filter Logic ---
    const filteredTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);

        const matchesCategory = filterCategory === 'ALL' || t.category === filterCategory;
        const matchesMonth = filterMonth === 'ALL' || tDate.getMonth() === (filterMonth as number);
        const matchesYear = filterYear === 'ALL' || tDate.getFullYear() === (filterYear as number);

        return matchesCategory && matchesMonth && matchesYear;
    });

    // --- Totals based on FILTERED data ---
    const income = filteredTransactions
        .filter(t => t.type === 'INGRESO')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const expenses = filteredTransactions
        .filter(t => t.type === 'EGRESO')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const balance = income - expenses;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.amount || formData.amount <= 0) return;

        const newTransaction: Transaction = {
            ...formData as Transaction,
            id: crypto.randomUUID(),
            registeredBy: user?.username || 'Unknown'
        };

        addTransaction(newTransaction);
        setFormData({
            amount: 0,
            type: 'INGRESO',
            category: 'DIEZMO',
            description: '',
            date: new Date().toISOString().split('T')[0]
        });
    };

    // Helper for generating years
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Wallet className="w-8 h-8 text-blue-500" />
                    Finanzas y Tesorería
                </h1>

                {/* Filters Toolbar */}
                <div className="flex flex-wrap gap-2">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value as 'ALL' | TransactionCategory)}
                        className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
                        title="Filtrar por categoría"
                    >
                        <option value="ALL">Todas las Categorías</option>
                        <option value="DIEZMO">Diezmos</option>
                        <option value="OFRENDA">Ofrendas</option>
                        <option value="PRO_TEMPLO">Pro-Templo</option>
                        <option value="GASTO_OPERATIVO">Gastos Op.</option>
                        <option value="GASTO_INSUMOS">Gasto de Insumos</option>
                        <option value="GENEROSIDAD">Generosidad</option>
                        <option value="OTRO">Otros</option>
                    </select>

                    <select
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
                        className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
                    >
                        <option value="ALL">Todos los Meses</option>
                        <option value={0}>Enero</option>
                        <option value={1}>Febrero</option>
                        <option value={2}>Marzo</option>
                        <option value={3}>Abril</option>
                        <option value={4}>Mayo</option>
                        <option value={5}>Junio</option>
                        <option value={6}>Julio</option>
                        <option value={7}>Agosto</option>
                        <option value={8}>Septiembre</option>
                        <option value={9}>Octubre</option>
                        <option value={10}>Noviembre</option>
                        <option value={11}>Diciembre</option>
                    </select>

                    <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
                        className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
                    >
                        <option value="ALL">Todos los Años</option>
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Balance Periodo</p>
                            <h3 className={cn("text-3xl font-bold mt-1", balance >= 0 ? "text-white" : "text-red-400")}>
                                ${balance.toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <DollarSign className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                    <div className="h-1 w-full bg-gray-800 rounded-full mt-2">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                </div>

                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Ingresos Periodo</p>
                            <h3 className="text-3xl font-bold text-green-400 mt-1">${income.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Gastos Periodo</p>
                            <h3 className="text-3xl font-bold text-red-400 mt-1">${expenses.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <TrendingDown className="w-6 h-6 text-red-400" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Entry Form */}
                <div className="lg:col-span-1 bg-gray-900 p-6 rounded-xl border border-gray-800 h-fit">
                    <h2 className="text-lg font-bold text-white mb-4">Registrar Movimiento</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'INGRESO', category: 'DIEZMO' })}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                                    formData.type === 'INGRESO'
                                        ? "bg-green-600 text-white"
                                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                )}
                            >
                                Ingreso
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'EGRESO', category: 'GASTO_OPERATIVO' })}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                                    formData.type === 'EGRESO'
                                        ? "bg-red-600 text-white"
                                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                )}
                            >
                                Egreso
                            </button>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Monto</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.amount || ''}
                                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-8 p-3 text-white focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Categoría</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value as TransactionCategory })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
                            >
                                {formData.type === 'INGRESO' ? (
                                    <>
                                        <option value="DIEZMO">Diezmo</option>
                                        <option value="OFRENDA">Ofrenda</option>
                                        <option value="PRO_TEMPLO">Pro-Templo</option>
                                        <option value="OTRO">Otro</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="GASTO_OPERATIVO">Gasto Operativo</option>
                                        <option value="GASTO_INSUMOS">Gasto de Insumos</option>
                                        <option value="GENEROSIDAD">Generosidad</option>
                                        <option value="OTRO">Otro</option>
                                    </>
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Descripción</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
                                placeholder="Detalle del movimiento"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Fecha</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors"
                        >
                            Registrar {formData.type === 'INGRESO' ? 'Ingreso' : 'Egreso'}
                        </button>
                    </form>
                </div>

                {/* Recent Transactions List */}
                <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 flex flex-col">
                    <div className="p-6 border-b border-gray-800">
                        <h2 className="text-lg font-bold text-white">Historial de Movimientos</h2>
                    </div>
                    <div className="flex-1 overflow-auto p-4 space-y-3 max-h-[500px]">
                        {filteredTransactions.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">
                                No hay movimientos en este periodo
                            </div>
                        ) : (
                            [...filteredTransactions].reverse().map((t) => (
                                <div key={t.id} className="flex items-center justify-between bg-gray-950 p-4 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            t.type === 'INGRESO' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                        )}>
                                            {t.type === 'INGRESO' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{t.category.replace(/_/g, ' ')}</p>
                                            <p className="text-xs text-gray-500">{t.description || 'Sin descripción'} • {t.registeredBy}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn(
                                            "font-bold",
                                            t.type === 'INGRESO' ? "text-green-400" : "text-red-400"
                                        )}>
                                            {t.type === 'INGRESO' ? '+' : '-'}${t.amount.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500">{t.date}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
