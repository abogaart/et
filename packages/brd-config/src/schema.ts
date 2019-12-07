import { defaultSchema } from '@bloomreach/cli';

export default {
  ...defaultSchema,
  git: {
    path: {
      doc: 'The path to the git executable, absolute or relative in case of a global symlink',
      format: String,
      default: 'git',
    },
  },
  java: {
    path: {
      doc: 'The path to the java executable, absolute or relative in case of a global symlink',
      format: String,
      default: 'java',
    },
  },
  mvn: {
    path: {
      doc: 'The path to the maven executable, absolute or relative in case of a global symlink',
      format: String,
      default: 'mvn',
    },
  },
};
