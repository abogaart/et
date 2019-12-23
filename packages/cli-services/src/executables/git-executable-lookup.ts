import { ExecutableLookup } from './executable-lookup';
import { Executable } from './executable';
import { GitExecutable } from './git-executable';

export class GitExecutableLookup extends ExecutableLookup {
  constructor() {
    super(GitExecutable.CMD);
  }

  createExecutable(path: string): Executable {
    return new GitExecutable(path);
  }
}
