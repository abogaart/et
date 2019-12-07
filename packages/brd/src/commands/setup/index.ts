import { EtFlags } from '@bloomreach/cli';
import { taskError, Tasks } from '@bloomreach/cli-tasks';
import {
  detectJavaPath, findLinkedFile, getGitVersion, getJavaVersion, getMavenVersion, tryWhich,
} from '@bloomreach/cli-utils';
import { ListrContext, ListrTaskWrapper } from 'listr';

import { BrdCommand } from '../../brd-command';

interface SetupFlags extends EtFlags {
  name: string;
}

export default class Setup extends BrdCommand<SetupFlags> {
  static description = 'Setup the Bloomreach environment';

  static examples = [
    '$ et setup',
  ];

  static flags = {
    ...BrdCommand.flags,
    // name: flags.string({ char: 'n', description: 'name to print' }),
  };

  async run(): Promise<any> {
    const { app } = this.getContext().config;

    if (app.get('installed')) {
      this.log('ET is installed with the following properties');
      this.log(app.toString());
    } else {
      this.log(`\nET has not been installed yet, starting initial setup of version ${this.config.version}\n`);

      // is git installed?
      // is java installed?
      // is maven installed?
      // is BR related data installed?
      const tasks = [
        {
          title: 'Detect git executable',
          task: async (listrCtx: ListrContext, task: ListrTaskWrapper): Promise<void> => {
            const next = async (path: string): Promise<void> => {
              const gitVersion = await getGitVersion(path);
              if (gitVersion === null) {
                taskError(`Failed to verify git executable at '${path}'`, task, this);
              }

              app.set('git.path', path);
              task.title = `Git found at '${path}' (v${gitVersion})`;
              listrCtx.java = true;
            };

            const gitPath = await tryWhich('git');
            if (gitPath !== null) {
              return Tasks.choice(
                'How should the git command be invoked?',
                ['git', gitPath, findLinkedFile(gitPath)],
                next,
              );
            }

            return Tasks.customPath(
              'Failed to detect git executable. Do you want to set a custom path?',
              'Absolute git path:',
              next, async () => taskError('Setup failed, please install Git first. For more info see https://www.atlassian.com/git/tutorials/install-git', task, this),
            );
          },
        },
        {
          title: 'Detect Java executable',
          enabled: (listrCtx: ListrContext): boolean => !!listrCtx.java,
          task: async (listrCtx: ListrContext, task: ListrTaskWrapper): Promise<void> => {
            const next = async (path: string): Promise<void> => {
              const javaVersion = await getJavaVersion(path);
              if (javaVersion === null) {
                taskError(`Failed to verify java executable at '${path}'`, task, this);
              }

              app.set('java.path', path);
              task.title = `Java detected at '${path}' (v${javaVersion})`;
              listrCtx.maven = true;
            };

            let javaPath = await tryWhich('java');
            if (javaPath !== null) {
              return Tasks.choice(
                'How should the java command be invoked?',
                ['java', javaPath, findLinkedFile(javaPath)],
                next,
              );
            }

            javaPath = await detectJavaPath();
            if (javaPath !== null) {
              return next(javaPath);
            }

            return Tasks.customPath(
              'Failed to detect java executable. Do you want to set a custom path?',
              'Absolute java path:',
              next,
              async () => taskError('Setup failed, please install Java first. For more info see https://www.java.com/en/download/help/download_options.xml', task, this),
            );
          },
        },
        {
          title: 'Detect Maven',
          enabled: (listrCtx: ListrContext): boolean => !!listrCtx.maven,
          task: async (_listrCtx: ListrContext, task: ListrTaskWrapper): Promise<ListrContext> => {
            const next = async (path: string): Promise<void> => {
              const mvnVersion = await getMavenVersion(path);
              if (mvnVersion === null) {
                taskError(`Failed to verify Maven executable at '${path}'`, task, this);
              }

              app.set('mvn.path', path);
              task.title = `Maven detected at '${path}' (v${mvnVersion})`;
            };

            const mvnPath = await tryWhich('mvn');
            if (mvnPath !== null) {
              return Tasks.choice(
                'How should the mvn command be invoked?',
                ['mvn', mvnPath, findLinkedFile(mvnPath)],
                next,
              );
            }

            return Tasks.customPath(
              'Failed to detect maven executable. Do you want to set a custom path?',
              'Absolute maven path:',
              next,
              async () => taskError('Setup failed, please install Maven first. For more info see https://maven.apache.org/install.html', task, this),
            );
          },
        },
      ];
      await this.runTasks(() => tasks);

      app.set('installed', true);
      this.log(`\nSetup has successfully finished\n${app}`);
    }
  }
}
