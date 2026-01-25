import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type User = {
    token: string;
    role: "candidate" | "recruiter";
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (token: string, role: "candidate" | "recruiter") => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthContextProps = {
    children: ReactNode;
};

export const AuthProvider = ({ children }: AuthContextProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role") as "candidate" | "recruiter";
        if (token && role) {
            setUser({ token, role });
        }

        setLoading(false);
    }, []);

    const login = (token: string, role: "candidate" | "recruiter" = "candidate"): void => {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        setUser({ token, role });
    };

    const logout = (): void => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AUthProvider");
    }

    return context;
}