const fs = require('fs');

export async function checkPathExists(filePath: string) {
  return new Promise((resolve: any) => {
    fs.access(filePath, fs.F_OK, (error: Error) => {
      resolve(!error);
    });
  });
}

export function findLinkedFile(file: string): string {
  if (!fs.lstatSync(file).isSymbolicLink()) return file;
  return findLinkedFile(fs.realpathSync(file));
}
