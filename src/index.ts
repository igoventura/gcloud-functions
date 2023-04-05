import dotenv from 'dotenv';

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config();

// Import all functions from list-instances.ts
export * from './list-instances';