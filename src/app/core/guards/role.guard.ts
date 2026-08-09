import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Roles } from '../constants/roles.constants';

export function getDefaultRoute(roleId: number): string {
  switch (Number(roleId)) {
    case Roles.ADMIN.id:
      return '/home/dashboard';
    case Roles.DOCENTE.id:
      return '/home/professor/subjets';
    case Roles.ESTUDIANTE.id:
      return '/home/my-pensul';
    case Roles.SECRETARIA.id:
      return '/home/payments';
    default:
      return '/home/profile';
  }
}

export const roleGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.user;
  if (!user) {
    return router.createUrlTree(['/login']);
  }

  const allowedRoles: number[] = (route.data['roles'] as number[]) ?? [];
  const currentRoleId = Number(user.currentRole?.id);

  if (allowedRoles.includes(currentRoleId)) {
    return true;
  }

  return router.createUrlTree([getDefaultRoute(currentRoleId)]);
};

export const homeRoleGuard: CanActivateFn = (): UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.user;
  if (!user) {
    return router.createUrlTree(['/login']);
  }

  return router.createUrlTree([getDefaultRoute(Number(user.currentRole?.id))]);
};
