import * as mysql from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { uuidv7 } from 'uuidv7';

// Load environment variables
dotenv.config();

async function createAdminUser() {
  // Default admin credentials
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Admin User';

  // Create database connection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'fullstack_boilerplate',
  });

  try {
    console.log('Connected to database');

    // Check if admin user already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [adminEmail]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      console.log(`Admin user with email ${adminEmail} already exists`);
      
      // Update the existing user to have admin role
      await connection.execute(
        'UPDATE users SET role = ? WHERE email = ?',
        ['admin', adminEmail]
      );
      
      console.log(`Updated user ${adminEmail} to admin role`);
      return;
    }

    // Generate UUID v7
    const userId = uuidv7();

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    await connection.execute(
      'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [userId, adminEmail, hashedPassword, adminName, 'admin']
    );

    console.log(`Admin user created with email: ${adminEmail} and ID: ${userId}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await connection.end();
    console.log('Database connection closed');
  }
}

// Run the function
createAdminUser()
  .then(() => {
    console.log('Admin user creation process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error in admin user creation process:', error);
    process.exit(1);
  }); 