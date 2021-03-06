import { checkPathExists, writeJson } from '@bloomreach/cli-utils';
import Command, { flags } from '@oclif/command';
import { IConfig } from '@oclif/config';
import * as convict from 'convict';
import * as Listr from 'listr';
import * as path from 'path';

import defaultSchema from './schema';

// Use the forked version of default listr renderer
// eslint-disable-next-line @typescript-eslint/no-var-requires
const UpdateRenderer = require('listr-update-renderer');

export interface EtFlags {
  loglevel: 'error' | 'warn' | 'info' | 'debug';
  config: string;
}

export interface EtContext<F extends EtFlags> {
  flags: F;
  args: any;
  config: {
    app: convict.Config<object>;
    cli: IConfig;
    env: {
      configFile: string;
      globalConfigFile: string;
      projectConfigFile: string;
    };
  };
}

export abstract class EtCommand<F extends EtFlags | EtFlags> extends Command {
  static flags = {
    loglevel: flags.string({
      description: 'define the logging verbosity',
      options: ['error', 'warn', 'info', 'debug'],
    }),
    config: flags.string({
      description: 'define the name of the config file, e.g. <name>.json',
      default: 'et',
    }),
  };

  public tasks: Listr.ListrTask[] = [];

  private ctx!: EtContext<F>;

  async init(): Promise<any> {
    await super.init();

    // eslint-disable-next-line no-shadow
    const { args, flags } = this.parse(this.constructor as any);

    const configFile = `${flags.config}.json`;
    const globalConfigFile = path.resolve(this.config.configDir, configFile);
    const projectConfigFile = path.resolve(this.config.root, configFile);

    const configConvict = convict<object>(this.getDefaultConfig());
    await this.loadConvictConfiguration(configConvict, globalConfigFile);
    await this.loadConvictConfiguration(configConvict, projectConfigFile);

    this.ctx = {
      flags,
      args,
      config: {
        app: configConvict,
        cli: this.config,
        env: {
          configFile,
          globalConfigFile,
          projectConfigFile,
        },
      },
    };
  }

  public async runTask(task: (ctx: EtContext<F>) => PromiseLike<void>): Promise<void> {
    if (!this.ctx) {
      this.error('Init must be called before trying to access this.ctx');
    }

    this.debug('Running task');
    await task(this.ctx);
    this.debug('Finished task');
  }

  public async runTasks<Result>(
    generateTasks: (ctx: EtContext<F>) => Listr.ListrTask[],
    options?: Listr.ListrOptions | ((ctx: EtContext<F>) => Listr.ListrOptions),
  ): Promise<Result> {
    if (!this.ctx) {
      this.error('Init must be called before trying to access this.ctx');
    }

    const tasks = [...this.tasks, ...await generateTasks(this.ctx)];
    this.debug(`Running tasks ${tasks}`);
    return new Listr(tasks, {
      renderer: UpdateRenderer,
      ...(process.env.NODE_ENV === 'test' && { renderer: 'verbose', nonTTYRenderer: 'verbose' }),
      ...(options && typeof options === 'function' ? options(this.ctx) : options),
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore This option is added by https://github.com/SamVerschueren/listr-verbose-renderer#options
      dateFormat: false,
    }).run();
  }

  protected getContext(): EtContext<F> {
    return this.ctx;
  }

  protected getDefaultConfig(): string | object {
    return defaultSchema;
  }

  protected async writeGlobalConfigFile(): Promise<boolean> {
    return writeJson(this.ctx.config.env.globalConfigFile, this.ctx.config.app.getProperties());
  }

  private async loadConvictConfiguration(configConvict: convict.Config<any>, configFile: string): Promise<void> {
    this.debug(`Loading convict configuration from ${configFile}`);
    const exists = await checkPathExists(configFile);
    if (!exists) {
      this.debug(`File ${configFile} does not exist, skipping`);
      return;
    }

    try {
      configConvict.loadFile(configFile);
    } catch (error) {
      this.error(`Failed to load configuration from ${configFile}\n${error}`);
    }

    try {
      configConvict.validate({ allowed: 'strict' });
    } catch (error) {
      this.error(`Failed to validate configuration after merging with ${configFile}\n${error}`);
    }

    this.debug(`Successfully loaded and validated convict configuration from ${configFile}`);
    this.debug(configConvict.getProperties());
  }
}
