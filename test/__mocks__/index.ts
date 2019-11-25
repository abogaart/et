import { EtCommand, EtFlags } from '../../src/base';

// tslint:disable-next-line: no-string-literal
export const jestExpect = global['jestExpect'];

export class TestCommand<Flags extends EtFlags> extends EtCommand<Flags> {
  static flags = EtCommand.flags;

  run = jest.fn();

  get context() {
    return this.getContext();
  }
}
