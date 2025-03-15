import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly appUrl: string;
  private readonly isDev: boolean;

  constructor(private readonly configService: ConfigService) {
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@example.com';
    this.appUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    this.isDev = this.configService.get<string>('NODE_ENV') !== 'production';
  }

  /**
   * Send an email
   * In development, this just logs the email content
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // In development, just log the email
      if (this.isDev) {
        this.logger.debug(`
          --------------------------------
          📧 MOCK EMAIL SENT
          --------------------------------
          To: ${options.to}
          From: ${this.fromEmail}
          Subject: ${options.subject}
          --------------------------------
          ${options.text || options.html}
          --------------------------------
        `);
        return true;
      }

      // In production, this would connect to a real email service
      // For now, we'll just log a message
      this.logger.log(`Email would be sent to ${options.to} with subject "${options.subject}"`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Send a verification email
   */
  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationLink = `${this.appUrl}/verify-email?token=${token}`;
    
    return this.sendEmail({
      to: email,
      subject: 'Verify your email address',
      html: `
        <h1>Email Verification</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationLink}">Verify Email</a></p>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
      `,
      text: `
        Email Verification
        
        Please verify your email address by visiting the link below:
        
        ${verificationLink}
        
        This link will expire in 24 hours.
      `,
    });
  }

  /**
   * Send a password reset email
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const resetLink = `${this.appUrl}/reset-password?token=${token}`;
    
    return this.sendEmail({
      to: email,
      subject: 'Reset your password',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${resetLink}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      text: `
        Password Reset
        
        You requested a password reset. Visit the link below to reset your password:
        
        ${resetLink}
        
        This link will expire in 1 hour.
        
        If you didn't request this, please ignore this email.
      `,
    });
  }
} 