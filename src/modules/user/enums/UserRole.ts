export enum UserRole {
  Admin = 1,
  Buyer = 2,
  Driver = 3,
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Admin]: 'Admin',
  [UserRole.Buyer]: 'Cliente',
  [UserRole.Driver]: 'Driver',
}
