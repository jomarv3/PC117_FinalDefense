import type { AuthResponse, MeResponse, RegisterResponse } from '@/types/api';
import { requestJson } from '@/api/client';

export function login(email: string, password: string) {
  return requestJson<AuthResponse>('/mobile/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function register(name: string, email: string, password: string) {
  return requestJson<RegisterResponse>('/mobile/register', {
    method: 'POST',
    body: { name, email, password },
  });
}

export function logout(token: string) {
  return requestJson<{ message: string }>('/mobile/logout', {
    method: 'POST',
    token,
  });
}

export function getMe(token: string) {
  return requestJson<MeResponse>('/mobile/me', {
    method: 'GET',
    token,
  });
}
