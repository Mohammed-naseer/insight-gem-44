import { useSyncExternalStore } from "react";
import { useAuth } from "./auth-store";

export type Role = "Admin" | "Analyst" | "Viewer" | "Reader" | "Pending";

export type Permission =
  | "users:manage"
  | "users:approve"
  | "users:delete"
  | "users:assign_role"
  | "reports:view"
  | "models:manage"
  | "dashboard:view"
  | "analysis:run"
  | "reports:export"
  | "history:view"
  | "analytics:view";

const rolePerms: Record<Role, Permission[]> = {
  Admin: [
    "users:manage",
    "users:approve",
    "users:delete",
    "users:assign_role",
    "reports:view",
    "models:manage",
    "dashboard:view",
  ],
  Analyst: [
    "analysis:run",
    "dashboard:view",
    "reports:export",
    "history:view",
  ],
  Viewer: [
    "dashboard:view",
    "reports:view",
  ],
  Reader: [
    "reports:view",
    "analytics:view",
  ],
  Pending: [],
};

let simulatedRole: Role | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function setRole(role: Role) {
  simulatedRole = role;
  emit();
}

export function useRole(): Role {
  const { user } = useAuth();
  const authRole = (user?.role || "Viewer") as Role;

  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => simulatedRole || authRole,
    () => simulatedRole || authRole,
  );
}

export function useCan(perm: Permission): boolean {
  const role = useRole();
  return rolePerms[role]?.includes(perm) || false;
}

export function can(role: Role, perm: Permission): boolean {
  return rolePerms[role]?.includes(perm) || false;
}

export const ROLES: Role[] = ["Admin", "Analyst", "Viewer", "Reader", "Pending"];