import { tryWhich, detectJavaPath } from '@bloomreach/cli-utils';

import { JavaExecutable } from '../java-executable';
import { JavaExecutableLookup } from '../java-executable-lookup';

jest.mock('../java-executable.ts');
jest.mock('@bloomreach/cli-utils');

describe('java executable lookup', () => {
  beforeEach(() => {
    detectJavaPath.mockClear();
    tryWhich.mockClear();
    JavaExecutable.mockClear();
  });

  it('queries the "which" command with value "java"', async () => {
    tryWhich.mockReturnValue('try-path');
    const execs = await new JavaExecutableLookup().resolve();
    expect(execs).toHaveLength(4);
    expect(tryWhich).toHaveBeenCalledWith('java');
    expect(JavaExecutable).toHaveBeenCalledWith('java');
    expect(JavaExecutable).toHaveBeenCalledWith('try-path');
  });

  it('tries to detect the java home path', async () => {
    tryWhich.mockReturnValue(null);
    detectJavaPath.mockReturnValue('java-home-path');
    const execs = await new JavaExecutableLookup().resolve();
    expect(execs).toHaveLength(1);
    expect(JavaExecutable).toHaveBeenCalledWith('java-home-path');
  });

  it('can have zero results', async () => {
    tryWhich.mockReturnValue(null);
    detectJavaPath.mockReturnValue(null);
    const execs = await new JavaExecutableLookup().resolve();
    expect(execs).toHaveLength(0);
  });

  it('creates a java executable', () => {
    new JavaExecutableLookup().createExecutable('path');
    expect(JavaExecutable).toHaveBeenCalledWith('path');
  });
});
