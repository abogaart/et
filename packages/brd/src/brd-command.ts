import { brdSchema } from '@bloomreach/brd-config';
import { EtCommand, EtFlags } from '@bloomreach/cli';

export abstract class BrdCommand<F extends EtFlags> extends EtCommand<F> {
  static flags = {
    ...EtCommand.flags
  };

  protected getDefaultConfig(): string | object {
    return brdSchema;
  }

}
