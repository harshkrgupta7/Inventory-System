import {
    createContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import type { User, LoginCredentials, RegisterCredentials } from "../types";
import { authService } from "../services/auth.service";

interface UpdateProfileInput {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => void;
    updateProfile: (data: UpdateProfileInput) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }

        setIsLoading(false);
    }, []);

    const login = async (credentials: LoginCredentials): Promise<void> => {
        const response = await authService.login(credentials);
        const { user, token } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);
        setToken(token);
    };

    const register = async (credentials: RegisterCredentials): Promise<void> => {
        const response = await authService.register(credentials);
        const { user, token } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);
        setToken(token);
    };

    const logout = (): void => {
        authService.logout();
        setUser(null);
        setToken(null);
    };

    const updateProfile = async (data: UpdateProfileInput): Promise<void> => {
        const response = await authService.updateProfile(data);
        const updatedUser = response.data.user;

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!token,
                login,
                register,
                logout,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};