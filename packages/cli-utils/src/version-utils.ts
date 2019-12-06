const execa = require('execa');

export async function getJavaVersion(path: string): Promise<string | null> {
  try {
    const { stdout, stderr } = await execa.sync(path, ['-version']);
    const out = stdout || stderr;
    if (out.startsWith('java version')) {
      return out.split('\n')[0].split(' ')[2].replace(/"/g, '');
    }
  // tslint:disable-next-line:no-unused
  } catch (e) {}

  return null;
}

export async function getGitVersion(path: string): Promise<string | null> {
  try {
    const { stdout } = await execa.sync(path, ['--version']);
    if (stdout.startsWith('git version')) {
      return stdout.split(' ')[2];
    }
  // tslint:disable-next-line:no-unused
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
  // tslint:disable-next-line:no-unused
  } catch (e) {}

  return null;
}
