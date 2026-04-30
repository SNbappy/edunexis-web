import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type {
  AuthResponseDto,
  LoginRequest,
  RegisterRequest,
  SyncUserRequest,
  UserDto,
  ChangePasswordRequest,
} from '@/types/auth.types'

export const authService = {
  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponseDto>>('/auth/register', data).then((r) => r.data),
  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponseDto>>('/auth/login', data).then((r) => r.data),
  refresh: (refreshToken: string) =>
    api.post<ApiResponse<AuthResponseDto>>('/auth/refresh', { refreshToken }).then((r) => r.data),
  logout: () =>
    api.post<ApiResponse>('/auth/logout').then((r) => r.data),
  sync: (data: SyncUserRequest) =>
    api.post<ApiResponse<UserDto>>('/auth/sync', data).then((r) => r.data),
  me: () =>
    api.get<ApiResponse<UserDto>>('/auth/me').then((r) => r.data),
  changePassword: (data: ChangePasswordRequest) =>
    api.post<ApiResponse<boolean>>('/auth/change-password', data).then((r) => r.data),
}