export default {
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  log_file_path: {
    doc: 'Log file path',
    format: String,
    default: '/tmp/app.log'
  }
};
