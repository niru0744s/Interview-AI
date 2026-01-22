import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type User = {
    token: string;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthContextProps = {
    children: ReactNode;
};

export const AuthProvider = ({children}: AuthContextProps) =>{
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(()=>{
        const token = localStorage.getItem("token");
        if(token){
            setUser({token});
        }

        setLoading(false);
    },[]);

    const login = (token:string):void =>{
        localStorage.setItem("token",token);
        setUser({token});
    };

    const logout = (): void =>{
        localStorage.removeItem("token");
        setUser(null);
    };

    return(
        <AuthContext.Provider value={{user ,loading, login , logout}}>
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