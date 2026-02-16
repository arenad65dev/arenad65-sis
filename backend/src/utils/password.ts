import bcrypt from 'bcryptjs';

export class PasswordUtils {
  private static readonly SALT_ROUNDS = 10;

  /**
   * Hash a password using bcrypt
   * @param password - The plain text password to hash
   * @returns Promise<string> - The hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare a plain text password with a hashed password
   * @param password - The plain text password to compare
   * @param hashedPassword - The hashed password to compare against
   * @returns Promise<boolean> - True if passwords match, false otherwise
   */
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}