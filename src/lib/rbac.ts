import { useSyncExternalStore } from "react";

export type Role = "Admin" | "Analyst" | "Viewer";

export type Permission =
  | "users:assign_role"
  | "users:block"
  | "users:delete"
  | "users:invite"
  | "reports:generate"
  | "analysis:run";

const rolePerms: Record<Role, Permission[]> = {
  Admin: [
    "users:assign_role",
    "users:block",
    "users:delete",
    "users:invite",
    "reports:generate",
    "analysis:run",
  ],
  Analyst: ["reports:generate", "analysis:run"],
  Viewer: [],
};

let current: Role = "Admin";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function setRole(role: Role) {
  current = role;
  emit();
}

export function useRole(): Role {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => current,
  );
}

export function useCan(perm: Permission): boolean {
  const role = useRole();
  return rolePerms[role].includes(perm);
}

export function can(role: Role, perm: Permission): boolean {
  return rolePerms[role].includes(perm);
}

export const ROLES: Role[] = ["Admin", "Analyst", "Viewer"];