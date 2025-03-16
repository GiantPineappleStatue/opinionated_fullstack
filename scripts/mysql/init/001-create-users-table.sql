-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_token VARCHAR(255),
  verification_token_expires TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add role column if it doesn't exist
SET @exist := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'users'
  AND COLUMN_NAME = 'role'
  AND TABLE_SCHEMA = DATABASE()
);

SET @query = IF(
  @exist = 0,
  'ALTER TABLE users ADD COLUMN role ENUM("user", "admin") NOT NULL DEFAULT "user" AFTER name',
  'SELECT "Role column already exists" AS message'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update name column to be nullable if it's not already
SET @nameNotNull := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'users'
  AND COLUMN_NAME = 'name'
  AND IS_NULLABLE = 'NO'
  AND TABLE_SCHEMA = DATABASE()
);

SET @queryName = IF(
  @nameNotNull > 0,
  'ALTER TABLE users MODIFY COLUMN name VARCHAR(255) NULL',
  'SELECT "Name column is already nullable" AS message'
);

PREPARE stmtName FROM @queryName;
EXECUTE stmtName;
DEALLOCATE PREPARE stmtName; 