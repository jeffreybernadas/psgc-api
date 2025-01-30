import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the .env.test file
config({ path: resolve(__dirname, '../../../.env.test') });

// Now you can access your environment variables via process.env
console.log(process.env.YOUR_ENV_VARIABLE);
