export const Roles = {
  ADMIN: {
    id: 1,
    name: 'Administrador',
  },
  SECRETARIA: {
    id: 2,
    name: 'Secretaria',
  },
  DOCENTE: {
    id: 3,
    name: 'Docente',
  },
  ESTUDIANTE: {
    id: 4,
    name: 'Estudiante',
  },
} as const;

export const RolesList = Object.values(Roles);