export interface AuthResponse {
    token: string;
    userId: number;
    fullName: string;
    email: string;
    role: string;
}