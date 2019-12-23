import { EtFlags } from '@bloomreach/cli';
import { Tasks } from '@bloomreach/cli-tasks';
import { flags } from '@oclif/command';
import { ListrContext, ListrTaskWrapper } from 'listr';

import { BrdCommand } from '../../brd-command';

interface SetupFlags extends EtFlags {
  default: boolean;
}

export default class Setup extends BrdCommand<SetupFlags> {
  static description = 'Setup the Bloomreach environment';

  static examples = [
    '$ brd setup',
  ];

  static flags = {
    ...BrdCommand.flags,
    default: flags.boolean({ char: 'y', description: 'Use default settigs' }),
  };

  async run(): Promise<any> {
    const ctx = this.getContext();
    const { app, cli } = ctx.config;

    if (app.get('installed')) {
      this.log('The "brd" command is installed with the following properties');
      this.log(app.toString());
    } else {
      this.log(`\nThe "brd" command has not been installed yet, starting initial setup of version ${cli.version}\n`);

      // is git installed?
      // is java installed?
      // is maven installed?
      // is BR related data installed?
      const tasks = [
        Tasks.detectExecutable('git',
          (path: string, listrCtx: ListrContext) => {
            app.set('git.path', path);
            listrCtx.java = true;
          },
          (reason: string, task: ListrTaskWrapper) => {
            Tasks.fail(`${reason}, please ensure Git is properly installed. For more info see https://www.atlassian.com/git/tutorials/install-git`, task, this);
          },
          ctx.flags.default),

        {
          enabled: (listrCtx: ListrContext): boolean => !!listrCtx.java,
          ...Tasks.detectExecutable('java',
            (path: string, listrCtx: ListrContext) => {
              app.set('java.path', path);
              listrCtx.maven = true;
            },
            (reason: string, task: ListrTaskWrapper) => {
              Tasks.fail(`${reason}. Please ensure Java is properly installed. For more info see https://www.java.com/en/download/help/download_options.xml`, task, this);
            },
            ctx.flags.default),
        },
        {
          enabled: (listrCtx: ListrContext): boolean => !!listrCtx.maven,
          ...Tasks.detectExecutable('mvn',
            (path: string) => app.set('mvn.path', path),
            (error: string, task: ListrTaskWrapper) => {
              Tasks.fail(`${error}. Please ensure Maven is properly installed. For more info see https://maven.apache.org/install.html`, task, this);
            },
            ctx.flags.default),
        },
      ];

      await this.runTasks(() => tasks);

      app.set('installed', true);
      this.log(`\nSetup has successfully finished\n${app}`);
    }
  }
}
