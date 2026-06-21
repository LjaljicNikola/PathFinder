import accountApi from '../../../api/accountApi';
import type { AuthResponse } from '../types/AuthResponse';
import type { LoginRequest } from '../types/LoginRequest';
import type { RegisterRequest } from '../types/RegisterRequest';

export const authApi = {
    login: (data: LoginRequest) =>
        accountApi.post<AuthResponse>('/account/login', data).then((r) => r.data),

    register: (data: RegisterRequest) =>
        accountApi.post<AuthResponse>('/account/register', data).then((r) => r.data),
};