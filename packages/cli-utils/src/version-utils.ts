import * as execa from 'execa';

export async function getJavaVersion(path: string): Promise<string | null> {
  try {
    const { stdout, stderr } = await execa.sync(path, ['-version']);
    const out = stdout || stderr;
    if (out.startsWith('java version')) {
      return out.split('\n')[0].split(' ')[2].replace(/"/g, '');
    }
  // eslint-disable-next-line no-empty
  } catch (e) {}

  return null;
}

export async function getGitVersion(path: string): Promise<string | null> {
  try {
    const { stdout } = await execa.sync(path, ['--version']);
    if (stdout.startsWith('git version')) {
      return stdout.split(' ')[2];
    }
  // eslint-disable-next-line no-empty
  } catch (e) {}

  return null;
}

export async function getMavenVersion(path: string): Promise<string | null> {
  try {
    const { stdout, stderr } = await execa.sync(path, ['--version']);
    const out = stdout || stderr;
    if (out.startsWith('Apache Maven')) {
      return out.split('\n')[0].split(' ')[2];
    }
  // eslint-disable-next-line no-empty
  } catch (e) {}

  return null;
}
