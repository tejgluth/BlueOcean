import type { Role } from '../types/demo';

export const roleDisplayNames: Record<Role, string> = {
  'Staff Nurse': 'J. Patel, RN',
  'Charge Nurse': 'E. Flores, RN',
  Leadership: 'M. Chen, Director',
  'QA Reviewer': 'K. Singh, QA',
  'Biomed Tech': 'A. Romero, Biomed',
  'Unit Manager': 'T. Wallace, Unit Manager',
  Admin: 'System Admin',
};

export function canCreateReport(role: Role) {
  return role === 'Leadership' || role === 'QA Reviewer' || role === 'Admin';
}

export function canViewFalseAlertQueue(role: Role) {
  return role === 'Leadership' || role === 'QA Reviewer' || role === 'Admin';
}

export function canViewDevices(role: Role) {
  return role === 'Biomed Tech' || role === 'Unit Manager' || role === 'Admin';
}

export function canViewAnalytics(role: Role) {
  return role === 'Leadership' || role === 'QA Reviewer' || role === 'Unit Manager' || role === 'Admin';
}

export function canRevealIdentifiers(role: Role) {
  return role === 'Admin';
}
