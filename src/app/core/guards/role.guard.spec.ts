import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { Roles } from '../constants/roles.constants';

describe('roleGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => roleGuard(...guardParameters));

  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access when user role is allowed', () => {
    const user = {
      id: 1,
      role_id: Roles.ESTUDIANTE.id,
      currentRole: Roles.ESTUDIANTE,
      roles: [],
      ci: '123',
      name: 'Test',
      first_lastname: 'Test',
      second_lastname: null,
      email: 'test@test.com',
      cellphone: '123',
      status: 1,
    };
    const authService = TestBed.inject(AuthService);
    authService.saveSession('token', user);

    const result = executeGuard(
      { data: { roles: [Roles.ESTUDIANTE.id] } } as any,
      {} as any,
    );
    expect(result).toBeTrue();
  });

  it('should redirect to the role default route when not allowed', () => {
    const user = {
      id: 1,
      role_id: Roles.ESTUDIANTE.id,
      currentRole: Roles.ESTUDIANTE,
      roles: [],
      ci: '123',
      name: 'Test',
      first_lastname: 'Test',
      second_lastname: null,
      email: 'test@test.com',
      cellphone: '123',
      status: 1,
    };
    const authService = TestBed.inject(AuthService);
    authService.saveSession('token', user);

    const tree = executeGuard(
      { data: { roles: [Roles.ADMIN.id] } } as any,
      {} as any,
    ) as ReturnType<typeof router.createUrlTree>;

    expect(tree.toString()).toBe('/home/my-pensul');
  });

  it('should redirect to login when there is no user', () => {
    const result = executeGuard(
      { data: { roles: [Roles.ADMIN.id] } } as any,
      {} as any,
    );
    expect((result as any)?.toString?.()).toBe('/login');
  });
});
