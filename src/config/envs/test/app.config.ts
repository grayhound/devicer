import * as dotenv from 'dotenv';
dotenv.config();

import postgresConfig from './postgresql.config';

/**
 * Getting configuration data for testing.
 */
export default () => ({
  // api settings
  api: {
    port: parseInt(process.env.DEVICER_TEST_API_PORT, 10) || 5012,
  },

  // postgress database setting
  postgres: postgresConfig,
});
