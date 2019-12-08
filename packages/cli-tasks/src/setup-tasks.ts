import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const listrInquirer = require('listr-inquirer');

export interface TaskLike {
  type: string;
  name: string;
  message: string;
}

export const Tasks = {
  choice(message: string, choices: string[], next: (path: string) => Promise<void>): Promise<any> {
    return listrInquirer([
      {
        type: 'list',
        name: 'choice',
        message,
        choices,
      },
    ],
    async (answers: any) => next(answers.choice));
  },

  confirm(message: string): TaskLike {
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
    error: () => Promise<void>,
  ): Promise<any> {
    return listrInquirer([
      Tasks.confirm(confirmMsg),
      {
        when: (answers: any): boolean => !!answers.continue,
        type: 'input',
        name: 'customPath',
        message: pathLabel,
        validate: (str: string): boolean | string => {
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
