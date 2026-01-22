import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";

type ProtectedRouteProps = {
    children : ReactNode;
};

export default function ProtectedRoute ({children}:ProtectedRouteProps) {
    const {user , loading} = useAuth();
    if(loading) return null;
    if(!user) return <Navigate to="/login" replace />;

    return children;
}