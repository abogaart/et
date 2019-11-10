import Command, { flags } from '@oclif/command';

export interface EtFlags {
  loglevel: 'error' | 'warn' | 'info' | 'debug';
}

export interface EtContext<F extends EtFlags> {
  flags: F;
  args: any;
}

export abstract class EtCommand<F extends EtFlags> extends Command {
  static flags = {
    loglevel: flags.string({ options: ['error', 'warn', 'info', 'debug'] })
  };

  protected ctx!: EtContext<F>;

  async init() {
    const { args, flags } = this.parse(this.constructor as any);
    this.ctx = { flags, args } as EtContext<F>;
    this.log('init ctx', this.ctx);
  }

  async catch(err: any) {
    // handle any error from the command
    if (err) {
      this.error(err);
    }
  }

  async finally(err: any) {
    // called after run and catch regardless of whether or not the command errored
    if (err) {
      this.error(err);
    }
  }
}
