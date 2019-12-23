import { ExecutableLookup } from './executable-lookup';
import { Executable } from './executable';
import { MavenExecutable } from './maven-executable';

export class MavenExecutableLookup extends ExecutableLookup {
  constructor() {
    super(MavenExecutable.CMD);
  }

  createExecutable(path: string): Executable {
    return new MavenExecutable(path);
  }
}
