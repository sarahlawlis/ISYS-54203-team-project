
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  isActive: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
}

const AUTH_STORAGE_KEY = 'auth_token';
const USER_STORAGE_KEY = 'auth_user';

export const auth = {
  getToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEY);
  },

  getUser(): AuthUser | null {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  setAuth(token: string, user: AuthUser): void {
    localStorage.setItem(AUTH_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },

  clearAuth(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  },

  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return fetch(url, { ...options, headers });
  },
};
