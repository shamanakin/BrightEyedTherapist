-- Migration: Add clinical_email column to users table
-- Run this on your DreamHost MySQL database
-- This adds the clinical_email field for the "Share with Client" feature

-- Add clinical_email column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS clinical_email VARCHAR(255) AFTER last_name;

-- Verify the change
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'clinical_email';


