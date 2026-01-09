import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import type { LoginDto } from './auth.dto';

/**
 * Auth Service
 * Contains all business logic and database operations for authentication
 * Controllers should never call Prisma directly - use this service instead
 */
export class AuthService {
  /**
   * Login user with email and password
   * Returns user data and JWT token if successful
   */
  async login(data: LoginDto) {
    const { email, password } = data;

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email },
    });

    // Check if user exists
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Check if user has a password_hash (account was created with password)
    if (!user.password_hash) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Check approval status (admins can login regardless of approval_status)
    if (user.role !== 'admin' && user.approval_status !== 'approved') {
      throw new Error('ACCOUNT_NOT_APPROVED');
    }

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: '7d', // Token expires in 7 days
      }
    );

    // Format address if it exists
    let address = null;
    if (user.address && typeof user.address === 'object') {
      const addr = user.address as Record<string, unknown>;
      address = {
        street: addr.street || '',
        city: addr.city || '',
        province: addr.province || '',
        zipCode: addr.zipCode || addr.zip_code || '',
        country: addr.country || 'Philippines',
      };
    }

    // Return user data without password_hash
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || null,
      role: user.role,
      client_level: user.client_level || null,
      approval_status: user.approval_status || null,
      address,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return {
      user: userResponse,
      token,
    };
  }
}

