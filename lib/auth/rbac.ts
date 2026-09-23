import type { Role } from "@/types/database";

export const ROLES = {
  ADMIN: "admin",
  TECHNICIAN: "technician",
} as const satisfies Record<string, Role>;

export const ADMIN_ONLY: Role[] = [ROLES.ADMIN];
export const ALL_ROLES: Role[] = [ROLES.ADMIN, ROLES.TECHNICIAN];

export function isAdmin(role: Role) {
  return role === ROLES.ADMIN;
}

export function hasRole(role: Role, allowed: Role[]) {
  return allowed.includes(role);
}

export function canManageMachines(role: Role) {
  return isAdmin(role);
}

export function canDeleteMaintenance(role: Role) {
  return isAdmin(role);
}

export function canChangeAlarmStatus(role: Role) {
  return role === ROLES.ADMIN || role === ROLES.TECHNICIAN;
}