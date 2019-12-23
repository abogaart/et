import { tryWhich } from '@bloomreach/cli-utils';

import { GitExecutable } from '../git-executable';
import { GitExecutableLookup } from '../git-executable-lookup';

jest.mock('../git-executable.ts');
jest.mock('@bloomreach/cli-utils');

describe('git executable lookup', () => {
  beforeEach(() => {
    GitExecutable.mockClear();
  });

  it('queries the "which" command with value "git"', async () => {
    tryWhich.mockReturnValue('try-path');
    const execs = await new GitExecutableLookup().resolve();
    expect(execs).toHaveLength(3);
    expect(tryWhich).toHaveBeenCalledWith('git');
    expect(GitExecutable).toHaveBeenCalledWith('try-path');
  });

  it('creates a git executable', () => {
    new GitExecutableLookup().createExecutable('path');
    expect(GitExecutable).toHaveBeenCalledWith('path');
  });
});
