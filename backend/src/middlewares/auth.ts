import { FastifyRequest, FastifyReply } from 'fastify';
import { Role } from '../generated/client/enums';

// Extend FastifyRequest to include user information
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: string;
      email: string;
      name: string;
      role: Role;
    };
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
    };
  }
}

/**
 * Authentication middleware to verify JWT token
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    
    // The user information is now available in request.user
    // after jwtVerify() successfully decodes the token
  } catch (err) {
    if (!reply.raw.headersSent) {
      reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }
    throw err;
  }
}

/**
 * Role-based authorization middleware factory
 * @param allowedRoles Array of roles that are allowed to access the route
 * @returns Middleware function that checks if user has required role
 */
export function requireRole(allowedRoles: Role[]) {
  return async function(request: FastifyRequest, reply: FastifyReply) {
    try {
      // First ensure user is authenticated
      await authenticate(request, reply);
      
      // Check if user has the required role
      if (!request.user || !allowedRoles.includes(request.user.role)) {
        if (!reply.raw.headersSent) {
          reply.code(403).send({
            error: 'Forbidden',
            message: 'You do not have permission to access this resource'
          });
        }
        return;
      }
    } catch (err) {
      // Error already handled in authenticate
      return;
    }
  };
}

/**
 * Helper function to create role-specific middleware
 */
export const requireAdmin = requireRole([Role.ADMIN]);
export const requireManager = requireRole([Role.ADMIN, Role.MANAGER]);
export const requireStaff = requireRole([Role.ADMIN, Role.MANAGER, Role.STAFF]);
export const requireCashier = requireRole([Role.ADMIN, Role.MANAGER, Role.STAFF, Role.CASHIER]);
export const requireWaiter = requireRole([Role.ADMIN, Role.MANAGER, Role.STAFF, Role.CASHIER, Role.WAITER]);