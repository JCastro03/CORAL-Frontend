export type UserRole = 'ra' | 'scheduling_admin' | 'full_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}