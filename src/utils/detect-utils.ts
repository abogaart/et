import * as findJavaHome from 'find-java-home';
import * as path from 'path';
const which = require('which');

export async function tryWhich(exec: string): Promise<string | null> {
  try {
    return await which(exec);
  } catch (e) {
    return null;
  }
}

export async function detectJavaPath(): Promise<string | null> {
  return new Promise(resolve => {
    findJavaHome({ allowJre: false }, (err, home) => {
      if (err) {
        resolve(null);
      }
      resolve(path.resolve(home, 'bin', 'java'));
    });
  });
}
