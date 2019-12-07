import * as path from 'path';

import { EtCommand, EtFlags, EtContext } from '../base';

export class TestCommand<Flags extends EtFlags> extends EtCommand<Flags> {
  static flags = EtCommand.flags;

  run = jest.fn();

  get context(): EtContext<Flags> {
    return this.getContext();
  }
}

export function fixturesPath(...paths): string {
  return path.resolve(__dirname, '../__fixtures__', ...paths);
}
