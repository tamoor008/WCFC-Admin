"use client";

export interface AdminUser {
  _id: string;
  email: string;
  name: string;
  role: string;
}

export const getAdminToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
};

export const getAdminUser = (): AdminUser | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('admin_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const isAdmin = (): boolean => {
  const user = getAdminUser();
  return user?.role === 'admin';
};

export const isAuthenticated = (): boolean => {
  const token = getAdminToken();
  const user = getAdminUser();
  return !!token && !!user && user.role === 'admin';
};

export const logout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
};
