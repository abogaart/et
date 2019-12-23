import * as path from 'path';
import { ListrTask, ListrContext, ListrTaskWrapper } from 'listr';
import { Executable, executableLookupService } from '@bloomreach/cli-services';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const listrInquirer = require('listr-inquirer');

export interface InquirerLike {
  type: string;
  name: string;
  message: string;
}

export const Tasks = {
  fail(reason: string, task: ListrTaskWrapper, cmd: any): void {
    task.title = reason;
    cmd.exit(1);
  },

  /**
   * Returns a listr task sequence that detects the path to an executable. When multiple paths are found,
   * the user is presented with a list to pick from.
   *
   * @param name The name of the executable, e.g. git
   * @param success Success handler called when an executable is found
   * @param error Error handler in case something goes wrong
   * @param defaultMode If defaultMode is true, the first valid executable found is used automatically,
   *                    otherwise the user is presented with a list to pick from
   */
  detectExecutable(
    name: string,
    success: (path: string, listrCtx: ListrContext) => void,
    error: (reason: string, task: ListrTaskWrapper) => void,
    defaultMode = false,
  ): ListrTask {
    return {
      title: `Detect ${name} executable`,
      task: async (listrCtx: ListrContext, task: ListrTaskWrapper): Promise<void> => {
        const next = async (exec: Executable): Promise<void> => {
          const version = await exec.getVersion();
          if (!version) {
            error(`Failed to verify ${exec.getName()} executable at '${exec.getPath()}'`, task);
          }

          task.title = `${exec.getName()} found at '${exec.getPath()}' (v${version})`;
          success(exec.getPath(), listrCtx);
        };

        const execs = await executableLookupService.lookup(name);
        if (execs.length) {
          return execs.length === 1 || defaultMode === true
            ? next(execs[0])
            : Tasks.choice(
              `How should the ${name} command be invoked?`,
              execs.map((exec) => ({
                name: exec.getPath(),
                value: exec,
              })),
              next,
            );
        }

        return Tasks.customPath(
          `Failed to detect ${name} executable. Do you want to set a custom path?`,
          'Absolute path:',
          async (customPath: string) => next(executableLookupService.create(name, customPath)),
          async () => error('Setup failed', task),
        );
      },
    };
  },

  choice(
    message: string,
    choices: string[] | { name: string; value: any }[],
    next: (exec: any) => Promise<void>,
  ): Promise<any> {
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

  confirm(message: string): InquirerLike {
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
