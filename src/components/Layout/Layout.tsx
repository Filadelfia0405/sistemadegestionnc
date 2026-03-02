import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-950">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Mobile Header */}
            <div className="md:hidden flex items-center p-4 border-b border-gray-800 bg-gray-900 sticky top-0 z-30">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="text-gray-400 hover:text-white mr-4 p-1"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <span className="text-white font-bold text-sm">Gestión Nuevos Comienzos</span>
            </div>

            <main className="md:ml-64 p-4 md:p-8 min-h-screen transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
