import { UserRole } from '../../common/guards/roles.guard';

/**
 * User entity representing a user in the database
 * This is not an ORM entity, but a simple class to represent the structure
 * of a user in the database and provide type safety
 */
export class User {
  /**
   * The unique identifier for the user (UUIDv7)
   */
  id: string;

  /**
   * The user's email address (unique)
   */
  email: string;

  /**
   * The user's hashed password
   */
  password: string;

  /**
   * The user's display name (nullable)
   */
  name?: string | null;

  /**
   * The user's role (user or admin)
   */
  role: UserRole;

  /**
   * Whether the user's email has been verified
   */
  email_verified: boolean;

  /**
   * Token for email verification
   */
  verification_token?: string | null;

  /**
   * Expiration timestamp for the verification token
   */
  verification_token_expires?: Date | null;

  /**
   * The timestamp when the user was created
   */
  created_at: Date;

  /**
   * The timestamp when the user was last updated
   */
  updated_at: Date;

  /**
   * Creates a new User instance
   */
  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  /**
   * Creates a User instance from a database row
   */
  static fromDatabaseRow(row: any): User {
    return new User({
      id: row.id,
      email: row.email,
      password: row.password,
      name: row.name || null,
      role: row.role || UserRole.USER,
      email_verified: row.email_verified || false,
      verification_token: row.verification_token || null,
      verification_token_expires: row.verification_token_expires || null,
      created_at: row.created_at || row.createdAt,
      updated_at: row.updated_at || row.updatedAt,
    });
  }

  /**
   * Returns a sanitized version of the user (without password)
   */
  toSafeObject(): {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    email_verified: boolean;
    created_at: Date;
    updated_at: Date;
  } {
    const { password, verification_token, verification_token_expires, ...safeUser } = this;
    return safeUser as any;
  }

  /**
   * Returns a JSON representation of the user for API responses
   */
  toResponseObject(): {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      emailVerified: this.email_verified,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    };
  }
} 