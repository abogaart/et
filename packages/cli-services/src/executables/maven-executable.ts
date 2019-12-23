import * as execa from 'execa';

import { Executable } from './executable';

export class MavenExecutable extends Executable {
  static CMD = 'mvn';

  constructor(path: string) {
    super(MavenExecutable.CMD, path);
  }

  protected async parseVersion(path: string): Promise<string> {
    const { stdout } = await execa.sync(path, ['--version']);
    if (stdout.startsWith('Apache Maven')) {
      return stdout.split('\n')[0].split(' ')[2];
    }
    return '';
  }
}
