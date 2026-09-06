import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from "react";
import api from "../lib/axios";

export type User = {
    role: "candidate" | "recruiter";
    email?: string;
    name?: string;
    plan?: string;
    credits?: number | string;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (user: User) => void;
    logout: () => void;
    switchRole: () => Promise<"candidate" | "recruiter">;
    setUserContext: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthContextProps = {
    children: ReactNode;
};

export const AuthProvider = ({ children }: AuthContextProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get("/auth/me");
                setUser(res.data.user);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = useCallback((userData: User): void => {
        setUser(userData);
    }, []);

    const logout = useCallback(async (): Promise<void> => {
        try {
            await api.post("/auth/logout");
        } catch {
            console.error("Logout failed");
        } finally {
            setUser(null);
        }
    }, []);

    const switchRole = useCallback(async (): Promise<"candidate" | "recruiter"> => {
        try {
            const res = await api.post("/auth/switch-role");
            const newRole = res.data.role;
            setUser(prev => prev ? { ...prev, role: newRole } : null);
            return newRole;
        } catch (err) {
            console.error("Failed to switch role", err);
            throw err;
        }
    }, []);

    const setUserContext = useCallback((userData: User | null) => {
        setUser(userData);
    }, []);

    const value = useMemo(() => ({
        user,
        loading,
        login,
        logout,
        switchRole,
        setUserContext
    }), [user, loading, login, logout, switchRole, setUserContext]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}