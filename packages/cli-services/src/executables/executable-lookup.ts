import { findLinkedFile, tryWhich } from '@bloomreach/cli-utils';
import { Executable } from './executable';

export interface ExecutableLookup {
  resolve(): Promise<Executable[]>;
}

export abstract class ExecutableLookup implements ExecutableLookup {
  constructor(protected name: string) {}

  async resolve(): Promise<Executable[]> {
    const execs = [];

    const fromWhich = await tryWhich(this.name);
    if (fromWhich !== null) {
      execs.push(this.createExecutable(this.name));
      execs.push(this.createExecutable(fromWhich));
      execs.push(this.createExecutable(findLinkedFile(fromWhich)));
    }

    // TODO: filter dups
    return execs;
  }

  abstract createExecutable(path: string): Executable;
}
