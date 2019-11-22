import Command, { flags } from '@oclif/command';
import * as convict from 'convict';
import * as path from 'path';

import defaultConfig from './config/schema';
import { checkFileExists } from './utils/file-utils';

export interface EtFlags {
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  configFile: string;
}

export interface EtContext<F extends EtFlags> {
  flags: F;
  args: any;
  config: convict.Config<object>;
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

    this.ctx = { flags, args, config: configConvict };
  }

  public async runTask(task: (ctx: EtContext<F>) => PromiseLike<void>) {
    this.debug('Running task');
    await task(this.ctx);
    this.debug('Finished task');
  }

  protected getContext(): EtContext<F> {
    return this.ctx;
  }

  private async loadConvictConfiguration(configConvict: convict.Config<any>, configDir: string) {
    this.debug(`Loading convict configuration from ${configDir}`);
    const exists = await checkFileExists(configDir);
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
  }
}
