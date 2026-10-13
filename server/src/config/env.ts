import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET.length < 32 ||
  process.env.JWT_SECRET.includes('your_super_secret') ||
  process.env.JWT_SECRET.includes('super_secret_jwt_key')
) {
  throw new Error('Configure a private JWT_SECRET of at least 32 characters in server/.env.');
}
if (
  !process.env.DEFAULT_ADMIN_PASSWORD ||
  process.env.DEFAULT_ADMIN_PASSWORD.length < 12 ||
  process.env.DEFAULT_ADMIN_PASSWORD === 'AdminPassword123!' ||
  process.env.DEFAULT_ADMIN_PASSWORD.startsWith('replace_')
) {
  throw new Error(
    'Configure a private DEFAULT_ADMIN_PASSWORD of at least 12 characters in server/.env.',
  );
}

if (process.env.NODE_ENV === 'production') {
  for (const key of ['MONGODB_URI', 'JWT_SECRET', 'DEFAULT_ADMIN_PASSWORD', 'CLIENT_URL'])
    if (!process.env[key]) throw new Error(key + ' is required in production.');
  if (
    process.env.JWT_SECRET!.length < 32 ||
    process.env.JWT_SECRET!.includes('your_super_secret') ||
    process.env.JWT_SECRET!.includes('super_secret_jwt_key')
  )
    throw new Error('Set a random JWT secret of at least 32 characters.');
  if (
    process.env.DEFAULT_ADMIN_PASSWORD!.length < 12 ||
    process.env.DEFAULT_ADMIN_PASSWORD === 'AdminPassword123!'
  )
    throw new Error('Set a private administrator password.');
}
export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/freelance_studio',
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL || 'admin@tejastudio.com',
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD!,
  DEFAULT_ADMIN_NAME: process.env.DEFAULT_ADMIN_NAME || 'Studio Admin',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'Teja Web Studio <hello@tejastudio.com>',
  ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@tejastudio.com',
  EMAIL_SERVICE_ENABLED: process.env.EMAIL_SERVICE_ENABLED === 'true',
};
