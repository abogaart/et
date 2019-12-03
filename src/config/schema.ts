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
  },
  git: {
    path: {
      doc: 'The path to the git executable, absolute or relative in case of a global symlink',
      format: String,
      default: 'git'
    }
  },
  java: {
    path: {
      doc: 'The path to the java executable, absolute or relative in case of a global symlink',
      format: String,
      default: 'java'
    }
  },
  mvn: {
    path: {
      doc: 'The path to the maven executable, absolute or relative in case of a global symlink',
      format: String,
      default: 'mvn'
    }
  }
};
