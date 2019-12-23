import { Executable } from '../executable';

class MockExecutable extends Executable {
  constructor(name: string, path: string, version: string) {
    super(name, path);
    this.parseVersion = jest.fn().mockReturnValue(version);
  }

  protected async parseVersion(): Promise<string> {
    return '';
  }

  getParseVersionMock(): jest.Mock<Promise<string>> {
    return this.parseVersion;
  }
}

describe('Executable', () => {
  it('has a name, a path and a version', async () => {
    const exec = new MockExecutable('name', 'path', 'version');
    expect(exec.getName()).toBe('name');
    expect(exec.getPath()).toBe('path');
    expect(await exec.getVersion()).toBe('version');
  });

  it('parses the version once', async () => {
    const exec = new MockExecutable('name', 'path', 'version');
    await exec.getVersion();
    await exec.getVersion();
    expect(exec.getParseVersionMock()).toHaveBeenCalledTimes(1);
  });

  it('returns empty string if version is invalid', async () => {
    const exec = new MockExecutable('name', 'path', 'version');
    exec.getParseVersionMock().mockImplementation(() => { throw new Error('Fail'); });
    expect(await exec.getVersion()).toBe('');
  });
});
