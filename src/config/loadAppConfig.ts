export function loadAppConfig(env = 'main') {
  let config;
  switch (env) {
    case 'main':
      config = require('./envs/main/app.config');
    case 'test':
      config = require('./envs/test/app.config.test');
  }

  return config.default;
}
