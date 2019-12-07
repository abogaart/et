const listrInquirer = require('listr-inquirer');
const path = require('path');

export const Tasks = {
  choice(message: string, choices: string[], next: (path: string) => Promise<void>) {
    return listrInquirer([
      {
        type: 'list',
        name: 'choice',
        message,
        choices,
      },
    ], async (answers: any) => next(answers.choice));
  },

  confirm(message: string) {
    return {
      type: 'confirm',
      name: 'continue',
      message,
    };
  },

  async customPath(
    confirmMsg: string,
    pathLabel: string,
    next: (path: string) => Promise<void>,
    error: () => Promise<void>) {
    return listrInquirer([
      Tasks.confirm(confirmMsg),
      {
        when: (answers: any) => answers.continue,
        type: 'input',
        name: 'customPath',
        message: pathLabel,
        validate: (str: string) => {
          if (str && str.trim() !== '') {
            return path.isAbsolute(str) || 'Path should be absolute';
          }
          return 'Value is required';
        },
      },
    ], async (answers: any) => (answers.continue === false
      ? error()
      : next(answers.customPath.trim())));
  },
};
