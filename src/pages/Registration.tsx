import React, { useState } from 'react';
import { useStorage } from '../context/StorageContext';
import { useNavigate } from 'react-router-dom';
import { Person } from '../types';
import { User, Phone, Mail, MapPin } from 'lucide-react';
import { SECTORS } from '../data/sectors';

export default function Registration() {
    const { addPerson } = useStorage();
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState<Partial<Person>>({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        status: 'VISITA',
        firstVisitDate: new Date().toISOString().split('T')[0],
        visitCount: 1,
        family: [],
        municipality: '',
        sector: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newPerson: Person = {
            ...formData as Person,
            id: crypto.randomUUID(),
            family: [],
            lastVisitDate: new Date().toISOString().split('T')[0],
        };
        addPerson(newPerson);
        navigate('/personas');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <User className="w-8 h-8 text-blue-500" />
                    Registro de Nueva Visita
                </h1>
                <p className="text-gray-400 mt-2">
                    Complete la información para registrar una nueva persona en el sistema.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Personal Data */}
                <section className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-400" />
                        Datos Personales
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Nombre Completo *</label>
                            <input
                                required
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Ej. Juan Pérez"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Edad</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age || ''}
                                onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Edad"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-300 block mb-2">Número de Visita</label>
                            <div className="flex gap-4">
                                <label className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all ${formData.visitCount === 1 ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'}`}>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="visitCount"
                                            checked={formData.visitCount === 1}
                                            onChange={() => setFormData({ ...formData, visitCount: 1, status: 'VISITA' })}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 bg-gray-900 border-gray-700"
                                        />
                                        <span className="font-medium">1ra Vez</span>
                                    </div>
                                </label>
                                <label className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all ${formData.visitCount === 2 ? 'bg-yellow-600/20 border-yellow-500 text-yellow-400' : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'}`}>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="visitCount"
                                            checked={formData.visitCount === 2}
                                            onChange={() => setFormData({
                                                ...formData,
                                                visitCount: 2,
                                                status: 'CANDIDATO_PUERTAS_ABIERTAS'
                                            })}
                                            className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 bg-gray-900 border-gray-700"
                                        />
                                        <span className="font-medium">2da Vez (Candidato Puertas Abiertas)</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Communication */}
                <section className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-green-400" />
                        Contacto
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Teléfono</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="+58 414..."
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="juan@ejemplo.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-300">Dirección</label>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Municipio</label>
                                    <select
                                        name="municipality"
                                        title="Seleccione un municipio"
                                        value={formData.municipality}
                                        onChange={handleChange}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Selecciona un municipio...</option>
                                        {Object.keys(SECTORS).map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>

                                {formData.municipality && SECTORS[formData.municipality] && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <label className="text-xs text-gray-400 mb-1 block">Sector</label>
                                        <select
                                            name="sector"
                                            title="Seleccione un sector"
                                            value={formData.sector}
                                            onChange={handleChange}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="">Selecciona un sector...</option>
                                            {SECTORS[formData.municipality].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Detalles adicionales (Calle, Casa, etc.)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                    >
                        Registrar Visita
                    </button>
                </div>
            </form>
        </div>
    );
}
