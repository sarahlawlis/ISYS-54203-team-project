import { Request, Response, NextFunction } from "express";
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

export function hasPermission(user: User | undefined, permission: Permission): boolean {
  if (!user || user.isActive !== 'true') {
    return false;
  }

  const role = user.role as keyof PermissionRules;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User | undefined;

    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!hasPermission(user, permission)) {
      return res.status(403).json({ 
        error: "Insufficient permissions",
        message: `You don't have permission to perform this action. Required permission: ${permission}`,
      });
    }

    next();
  };
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User | undefined;

    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ 
        error: "Insufficient permissions",
        message: `This action requires one of the following roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
}

export function canModifyProject(user: User, projectOwnerId: string): boolean {
  if (user.role === 'admin') {
    return true; // Admins can modify any project
  }
  if (user.role === 'user') {
    return user.id === projectOwnerId; // Users can only modify their own projects
  }
  return false; // Viewers cannot modify projects
}
