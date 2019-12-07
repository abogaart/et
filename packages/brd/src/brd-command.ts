import { brdSchema } from '@bloomreach/brd-config';
import { EtCommand, EtFlags } from '@bloomreach/cli';

export abstract class BrdCommand<F extends EtFlags> extends EtCommand<F> {
  static flags = {
    ...EtCommand.flags,
  };

  // eslint-disable-next-line class-methods-use-this
  protected getDefaultConfig(): string | object {
    return brdSchema;
  }
}
