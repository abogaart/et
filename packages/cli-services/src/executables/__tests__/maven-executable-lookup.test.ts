import { tryWhich } from '@bloomreach/cli-utils';
import { MavenExecutable } from '../maven-executable';
import { MavenExecutableLookup } from '../maven-executable-lookup';

jest.mock('../maven-executable.ts');
jest.mock('@bloomreach/cli-utils');

describe('maven executable lookup', () => {
  beforeEach(() => {
    MavenExecutable.mockClear();
  });

  it('queries the "which" command with value "mvn"', async () => {
    tryWhich.mockReturnValue('try-path');
    const execs = await new MavenExecutableLookup().resolve();
    expect(execs).toHaveLength(3);
    expect(tryWhich).toHaveBeenCalledWith('mvn');
    expect(MavenExecutable).toHaveBeenCalledWith('try-path');
  });

  it('creates a mvn executable', () => {
    new MavenExecutableLookup().createExecutable('path');
    expect(MavenExecutable).toHaveBeenCalledWith('path');
  });
});
