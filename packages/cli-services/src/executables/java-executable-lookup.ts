import { detectJavaPath } from '@bloomreach/cli-utils';
import { ExecutableLookup } from './executable-lookup';
import { Executable } from './executable';
import { JavaExecutable } from './java-executable';

export class JavaExecutableLookup extends ExecutableLookup {
  constructor() {
    super(JavaExecutable.CMD);
  }

  async resolve(): Promise<Executable[]> {
    const execs = await super.resolve();

    const fromJavaPath = await detectJavaPath();
    if (fromJavaPath !== null) {
      execs.push(this.createExecutable(fromJavaPath));
    }

    return execs;
  }

  createExecutable(path: string): Executable {
    return new JavaExecutable(path);
  }
}
