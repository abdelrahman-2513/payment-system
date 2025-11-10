import { SetMetadata } from '@nestjs/common';


export const ROLES_KEY = 'roles';
// Should be edited if there are any modification on the roels that can access the system
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);