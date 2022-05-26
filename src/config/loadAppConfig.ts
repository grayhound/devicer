export function loadAppConfig(env = 'main') {
  let config;
  switch (env) {
    case 'dev':
      config = require('./envs/main/app.config');
      break;
    case 'test':
      config = require('./envs/test/app.config');
      break;
    default:
      config = require('./envs/main/app.config');
  }

  return config.default;
}
