export default {
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  installed: {
    doc: 'Has the app been installed',
    default: false,
    format: 'Boolean',
  },
  version: {
    doc: 'The installed version',
    format: String,
    default: '0.0.0'
  }
};
