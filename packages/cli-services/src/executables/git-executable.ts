import * as execa from 'execa';

import { Executable } from './executable';

export class GitExecutable extends Executable {
  static CMD = 'git';

  constructor(path: string) {
    super(GitExecutable.CMD, path);
  }

  protected async parseVersion(path: string): Promise<string> {
    const { stdout } = await execa.sync(path, ['--version']);
    if (stdout.startsWith('git version')) {
      return stdout.split(' ')[2];
    }
    return '';
  }
}
