import { findLinkedFile, tryWhich } from '@bloomreach/cli-utils';

import { ExecutableLookup } from '../executable-lookup';
import { Executable } from '../executable';

jest.mock('@bloomreach/cli-utils');

function mockExecutable(name: string, path: string, version: string): any {
  return {
    getName: jest.fn().mockReturnValue(name),
    getPath: jest.fn().mockReturnValue(path),
    getVersion: jest.fn().mockReturnValue(version),
  };
}

class MockExecutableLookup extends ExecutableLookup {
  createExecutable(path: string): Executable {
    return mockExecutable(this.name, path, `${path}-version`);
  }
}

describe('class ExecutableLookup', () => {
  it('looks up paths to an executable by querying "which" and resolving symlinks', async () => {
    tryWhich.mockReturnValue('brd-path');
    findLinkedFile.mockReturnValue('brd-symlink');
    const lookup = new MockExecutableLookup('brd');

    const execs = await lookup.resolve();
    expect(execs).toHaveLength(3);

    const [global, path, link] = execs;
    expect(global.getName()).toBe('brd');
    expect(global.getPath()).toBe('brd');
    expect(global.getVersion()).toBe('brd-version');

    expect(path.getName()).toBe('brd');
    expect(path.getPath()).toBe('brd-path');
    expect(path.getVersion()).toBe('brd-path-version');

    expect(link.getName()).toBe('brd');
    expect(link.getPath()).toBe('brd-symlink');
    expect(link.getVersion()).toBe('brd-symlink-version');
  });

  it('returns empty array if no paths found', async () => {
    tryWhich.mockReturnValue(null);
    const lookup = new MockExecutableLookup('brd');
    expect(await lookup.resolve()).toHaveLength(0);
  });
});
