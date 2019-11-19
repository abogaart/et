const fs = require('fs');

export async function checkFileExists(filePath: string) {
  return new Promise((resolve: any) => {
    fs.access(filePath, fs.F_OK, (error: Error) => {
      resolve(!error);
    });
  });
}
