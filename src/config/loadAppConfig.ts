export function loadAppConfig(env = 'main') {
  let config;
  switch (env) {
    case 'dev':
      config = require('./envs/dev/app.config');
      break;
    case 'test':
      config = require('./envs/test/app.config');
      break;
    default:
      config = require('./envs/dev/app.config');
  }

  return config.default;
}
