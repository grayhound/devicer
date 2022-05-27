import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });

import postgresConfig from './postgresql.config';

/**
 * Getting configuration data.
 */
export default () => ({
  // api settings
  api: {
    port: parseInt(process.env.DEVICER_API_PORT, 10) || 3000,
  },

  // postgress database setting
  postgres: postgresConfig,
});