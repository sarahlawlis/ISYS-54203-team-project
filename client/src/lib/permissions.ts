import type { User } from "@shared/schema";

export type Permission = 
  | "manage_users"
  | "manage_forms"
  | "manage_workflows"
  | "create_projects"
  | "edit_own_projects"
  | "edit_all_projects"
  | "delete_own_projects"
  | "delete_all_projects"
  | "view_projects"
  | "view_reports";

export interface PermissionRules {
  admin: Permission[];
  user: Permission[];
  viewer: Permission[];
}

export const ROLE_PERMISSIONS: PermissionRules = {
  admin: [
    "manage_users",
    "manage_forms",
    "manage_workflows",
    "create_projects",
    "edit_own_projects",
    "edit_all_projects",
    "delete_own_projects",
    "delete_all_projects",
    "view_projects",
    "view_reports",
  ],
  user: [
    "create_projects",
    "edit_own_projects",
    "delete_own_projects",
    "view_projects",
    "view_reports",
  ],
  viewer: [
    "view_projects",
    "view_reports",
  ],
};

export function hasPermission(user: Omit<User, 'password'> | undefined, permission: Permission): boolean {
  if (!user || user.isActive !== 'true') {
    return false;
  }

  const role = user.role as keyof PermissionRules;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function isAdmin(user: Omit<User, 'password'> | undefined): boolean {
  return user?.role === 'admin';
}

export function isUser(user: Omit<User, 'password'> | undefined): boolean {
  return user?.role === 'user';
}

export function isViewer(user: Omit<User, 'password'> | undefined): boolean {
  return user?.role === 'viewer';
}

export function canModifyProject(user: Omit<User, 'password'> | undefined, projectOwnerId: string): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'user') return user.id === projectOwnerId;
  return false;
}

export function getRoleDisplay(role: string): string {
  const displays: Record<string, string> = {
    admin: "Administrator",
    user: "User",
    viewer: "Viewer",
  };
  return displays[role] || role;
}

export function getRoleDescription(role: string): string {
  const descriptions: Record<string, string> = {
    admin: "Full access to all features including user management, forms, workflows, and all projects",
    user: "Can create and manage their own projects, use existing forms and workflows",
    viewer: "Read-only access to projects and reports they have permission to view",
  };
  return descriptions[role] || "";
}
