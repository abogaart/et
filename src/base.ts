import Command, { flags } from '@oclif/command';
import { IConfig } from '@oclif/config';
import * as convict from 'convict';
import * as Listr from 'listr';
import * as path from 'path';

// Use the forked version of default listr renderer
const UpdateRenderer = require('listr-update-renderer');

import defaultConfig from './config/schema';
import { checkPathExists } from './utils/file-utils';

export interface EtFlags {
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  configFile: string;
}

export interface EtContext<F extends EtFlags> {
  flags: F;
  args: any;
  config: {
    app: convict.Config<object>;
    cli: IConfig;
  };
}

export abstract class EtCommand<F extends EtFlags> extends Command {
  static flags = {
    logLevel: flags.string({
      description: 'define the verbosity of ET logging',
      options: ['error', 'warn', 'info', 'debug']
    }),
    configFile: flags.string({
      description: 'define the name of the config file, e.g. <name>.json',
      default: 'et',
    })
  };

  public tasks: Listr.ListrTask[] = [];

  private ctx!: EtContext<F>;

  async init() {
    await super.init();

    const { args, flags } = this.parse(this.constructor as any);

    const configFile = `${flags.configFile}.json`;
    const configFromConfigDir = path.resolve(this.config.configDir, configFile);
    const configFromProjectDir = path.resolve(this.config.root, configFile);

    const configConvict = convict<object>(defaultConfig);
    await this.loadConvictConfiguration(configConvict, configFromConfigDir);
    await this.loadConvictConfiguration(configConvict, configFromProjectDir);

    this.ctx = {
      flags,
      args,
      config: {
        app: configConvict,
        cli: this.config,
      }
    };
  }

  public async runTask(task: (ctx: EtContext<F>) => PromiseLike<void>) {
    if (!this.ctx) {
      this.error('Init must be called before trying to access this.ctx');
    }

    this.debug('Running task');
    await task(this.ctx);
    this.debug('Finished task');
  }

  public async runTasks<Result>(
    generateTasks: (ctx: EtContext<F>) => Listr.ListrTask[],
    options?: Listr.ListrOptions | ((ctx: EtContext<F>) => Listr.ListrOptions)
  ): Promise<Result> {
    if (!this.ctx) {
      this.error('Init must be called before trying to access this.ctx');
    }

    const tasks = [...this.tasks, ...await generateTasks(this.ctx)];
    this.debug('Running tasks ' + tasks);
    return new Listr(tasks, {
      renderer: UpdateRenderer,
      ...(process.env.NODE_ENV === 'test' && { renderer: 'verbose', nonTTYRenderer: 'verbose' }),
      ...(options && typeof options === 'function' ? options(this.ctx) : options),
      // @ts-ignore This option is added by https://github.com/SamVerschueren/listr-verbose-renderer#options
      dateFormat: false
    }).run();
  }

  protected getContext(): EtContext<F> {
    return this.ctx;
  }

  private async loadConvictConfiguration(configConvict: convict.Config<any>, configDir: string) {
    this.debug(`Loading convict configuration from ${configDir}`);
    const exists = await checkPathExists(configDir);
    if (!exists) {
      this.debug(`File ${configDir} does not exist, skipping`);
      return;
    }

    try {
      configConvict.loadFile(configDir);
    } catch (error) {
      this.error(`Failed to load configuration from ${configDir}\n${error}`);
    }

    try {
      configConvict.validate({ allowed: 'strict' });
    } catch (error) {
      this.error(`Failed to validate configuration after merging with ${configDir}\n${error}`);
    }

    this.debug(`Successfully loaded and validated convict configuration from ${configDir}`);
    this.debug(configConvict.getProperties());
  }
}
