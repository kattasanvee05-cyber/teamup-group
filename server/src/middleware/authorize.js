/**
 * Role-based access control middleware.
 *
 * Usage:
 *   router.get('/admin', authenticate, authorize('admin'), handler)
 *   router.get('/manage', authenticate, authorize('teacher', 'admin'), handler)
 *   router.get('/strict', authenticate, authorize({ roles: ['teacher'], strict: true }), handler)
 *
 * Hierarchy: admin > teacher > student (admin inherits all unless strict=true)
 */

const HIERARCHY = { admin: 3, teacher: 2, student: 1 };

export function authorize(...args) {
  // Support: authorize('admin', 'teacher') or authorize({ roles, strict })
  let roles;
  let strict = false;

  if (args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0])) {
    roles = args[0].roles;
    strict = args[0].strict ?? false;
  } else {
    roles = args;
  }

  return (req, res, next) => {
    const role = req.profile?.role;
    if (!role) return res.status(403).json({ error: 'Role not found' });

    const allowed = strict
      ? roles.includes(role)
      : hasAccess(role, roles);

    if (!allowed) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: roles,
        current: role,
      });
    }
    next();
  };
}

function hasAccess(userRole, allowedRoles) {
  if (userRole === 'admin') return true; // admin can do everything
  const userLevel = HIERARCHY[userRole] ?? 0;
  return allowedRoles.some((r) => userRole === r || userLevel >= (HIERARCHY[r] ?? 99));
}

// Shorthand helpers
export const adminOnly    = authorize({ roles: ['admin'], strict: true });
export const teacherUp    = authorize('teacher', 'admin');
export const studentUp    = authorize('student', 'teacher', 'admin');
