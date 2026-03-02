
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

interface ProtectedRouteProps {
    allowedRoles?: Role[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { user, hasPermission } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !hasPermission(allowedRoles)) {
        // Determine fallback based on roles that don't have dashboard access by default (though they do in this app)
        // If a role is restricted from a page, redirect to their main working area.
        const restrictedRoles = ['LIDER', 'MIN_CONEXION'];
        const fallback = restrictedRoles.includes(user.role) ? '/personas' : '/dashboard';
        return <Navigate to={fallback} replace />;
    }

    return <Outlet />;
}
