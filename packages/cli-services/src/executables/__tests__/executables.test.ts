import * as execa from 'execa';

import { GitExecutable, JavaExecutable, MavenExecutable } from '..';

jest.mock('execa');

describe('executables', () => {
  it('parses the "git" version', async () => {
    execa.sync.mockReturnValue({ stdout: 'git version 1.2.3' });

    const exec = new GitExecutable('path');
    const version = await exec.getVersion();
    expect(version).toBe('1.2.3');
  });

  it('returns an empty string if it cannot parse "git" version', async () => {
    execa.sync.mockReturnValue({ stdout: 'java version 1.2.3' });

    const exec = new GitExecutable('path');
    const version = await exec.getVersion();
    expect(version).toBe('');
  });

  it('parses the "java" version from stdout and stderr', async () => {
    execa.sync.mockReturnValue({ stdout: 'java version "1.2.3"\nMore' });

    let exec = new JavaExecutable('path');
    expect(await exec.getVersion()).toBe('1.2.3');

    execa.sync.mockReturnValue({ stderr: 'java version "1.2.3"\nMore' });

    exec = new JavaExecutable('path');
    expect(await exec.getVersion()).toBe('1.2.3');
  });

  it('returns an empty string if it cannot parse "java" version', async () => {
    execa.sync.mockReturnValue({ stdout: 'git version 1.2.3' });

    const exec = new JavaExecutable('path');
    const version = await exec.getVersion();
    expect(version).toBe('');
  });

  it('parses the "mvn" version', async () => {
    execa.sync.mockReturnValue({ stdout: 'Apache Maven 1.2.3\nMore' });

    const exec = new MavenExecutable('path');
    const version = await exec.getVersion();
    expect(version).toBe('1.2.3');
  });

  it('returns an empty string if it cannot parse "mvn" version', async () => {
    execa.sync.mockReturnValue({ stdout: 'java version 1.2.3' });

    const exec = new MavenExecutable('path');
    const version = await exec.getVersion();
    expect(version).toBe('');
  });
});
