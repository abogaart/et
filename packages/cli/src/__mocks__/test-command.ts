import { EtCommand, EtFlags } from '../base';

export class TestCommand<Flags extends EtFlags> extends EtCommand<Flags> {
  static flags = EtCommand.flags;

  run = jest.fn();

  get context() {
    return this.getContext();
  }

}
