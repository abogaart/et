import Command, { flags } from '@oclif/command';
import * as convict from 'convict';
import * as path from 'path';

import defaultConfig from './config/schema';
import { checkFileExists } from './utils/file-utils';

export interface EtFlags {
  'log-level': 'error' | 'warn' | 'info' | 'debug';
}

export interface EtContext<F extends EtFlags> {
  flags: F;
  args: any;
  config: any;
}

export abstract class EtCommand<F extends EtFlags> extends Command {
  static flags = {
    'log-level': flags.string({ options: ['error', 'warn', 'info', 'debug'] })
  };

  private ctx!: EtContext<F>;

  async init() {
    const { args, flags } = this.parse(this.constructor as any);
    const configFromConfigDir = path.resolve(this.config.configDir, 'et.json');
    const configFromProjectDir = path.resolve(this.config.root, 'et.json');

    const configConvict = convict(defaultConfig);
    await this.loadConvictConfiguration(configConvict, configFromConfigDir);
    await this.loadConvictConfiguration(configConvict, configFromProjectDir);

    this.ctx = { flags, args, config: configConvict };
  }

  public async runTask(task: (ctx: EtContext<F>) => Promise<void>) {
    this.debug(`Running task`);
    await task(this.ctx);
    this.debug(`Finished task`);
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
