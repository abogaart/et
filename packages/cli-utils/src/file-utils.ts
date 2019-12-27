import * as fs from 'fs-extra';

export async function checkPathExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
  // return new Promise((resolve: any) => {
  //   fs.access(filePath, fs.constants.F_OK, (error: Error | null) => {
  //     resolve(!error);
  //   });
  // });
}

export function findLinkedFile(file: string): string {
  if (!fs.lstatSync(file).isSymbolicLink()) return file;
  return findLinkedFile(fs.realpathSync(file));
}

export async function writeFile(path: string, data: string): Promise<boolean> {
  try {
    await fs.outputFile(path, data);
    return true;
  } catch (ignore) {
    // TODO: log error
    return false;
  }
}

export async function readFile(path: string): Promise<string | null> {
  try {
    const buffer = await fs.readFile(path);
    return buffer.toString('utf8');
  } catch (ignore) {
    // TODO: log error
    return null;
  }
}

export async function readJson(path: string): Promise<any | null> {
  try {
    const result = await fs.readJSON(path);
    return result;
  } catch (ignore) {
    // TODO: log error
    return null;
  }
}

export async function writeJson(path: string, data: any): Promise<boolean> {
  try {
    await fs.outputJSON(path, data);
    return true;
  } catch (ignore) {
    // TODO: log error
    return false;
  }
}
