export interface User {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    createdAt?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
    role?: "admin" | "user";
}

export interface ApiError {
    success: boolean;
    message: string;
}