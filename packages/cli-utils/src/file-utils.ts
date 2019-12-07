import * as fs from 'fs';

export async function checkPathExists(filePath: string): Promise<boolean> {
  return new Promise((resolve: any) => {
    fs.access(filePath, fs.constants.F_OK, (error: Error | null) => {
      resolve(!error);
    });
  });
}

export function findLinkedFile(file: string): string {
  if (!fs.lstatSync(file).isSymbolicLink()) return file;
  return findLinkedFile(fs.realpathSync(file));
}
