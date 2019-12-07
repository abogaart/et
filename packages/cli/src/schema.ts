export default {
  installed: {
    doc: 'Has the app been installed',
    default: false,
    format: 'Boolean',
  },
  version: {
    doc: 'The installed version',
    format: String,
    default: '0.0.0',
  },
};
