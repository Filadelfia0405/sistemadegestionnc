import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StorageProvider } from './context/StorageContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import PeopleList from './pages/PeopleList';
import Registration from './pages/Registration';
import Finances from './pages/Finances';
import CandidatePortal from './pages/CandidatePortal';
import PersonDetail from './pages/PersonDetail';
import Users from './pages/Users';

function App() {
    return (
        <BrowserRouter>
            <StorageProvider>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        <Route element={<ProtectedRoute />}>
                            <Route element={<Layout />}>
                                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/personas" element={<PeopleList />} />
                                <Route path="/registro" element={<Registration />} />
                                <Route path="/personas/:id" element={<PersonDetail />} />

                                {/* Admin/Finanzas Only */}
                                <Route element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'FINANZAS']} />}>
                                    <Route path="/finanzas" element={<Finances />} />
                                </Route>
                                <Route element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'PASTOR_PRINCIPAL']} />}>
                                    <Route path="/usuarios" element={<Users />} />
                                </Route>
                            </Route>
                        </Route>

                        {/* Portal de Aliado */}
                        <Route path="/aliados" element={<CandidatePortal />} />

                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </AuthProvider>
            </StorageProvider>
        </BrowserRouter>
    );
}

export default App;
