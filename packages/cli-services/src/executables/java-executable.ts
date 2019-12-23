import * as execa from 'execa';

import { Executable } from './executable';

export class JavaExecutable extends Executable {
  static CMD = 'java';

  constructor(path: string) {
    super(JavaExecutable.CMD, path);
  }

  protected async parseVersion(path: string): Promise<string> {
    const { stdout, stderr } = await execa.sync(path, ['-version']);
    const out = stdout || stderr;
    if (out.startsWith('java version')) {
      return out.split('\n')[0].split(' ')[2].replace(/"/g, '');
    }
    return '';
  }
}
