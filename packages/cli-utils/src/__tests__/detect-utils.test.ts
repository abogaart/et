import * as which from 'which';
import * as findJavaHome from 'find-java-home';
import * as path from 'path';

import { detectJavaPath, tryWhich } from '../detect-utils';

jest.mock('which');
jest.mock('find-java-home');

describe('detect utils', () => {
  describe('tryWhich', () => {
    it('returns null if which lookup fails', async () => {
      which.mockImplementation(() => { throw new Error('boom'); });
      expect(await tryWhich('boom')).toBeNull();
    });

    it('returns which lookup result', async () => {
      which.mockImplementation(() => 'found');
      expect(await tryWhich('boom')).toBe('found');
    });
  });

  describe('detectJavaPath', () => {
    it('returns null on errors', async () => {
      findJavaHome.mockImplementation((_cfg, cb) => {
        cb(true);
      });

      expect(await detectJavaPath()).toBeNull();
    });

    it('returns result of findJavaHome lookup', async () => {
      const javaHome = path.resolve('./test/java-home-path');
      findJavaHome.mockImplementation((_cfg, cb) => {
        cb(false, javaHome);
      });

      expect(await detectJavaPath()).toBe(path.resolve(javaHome, 'bin', 'java'));
    });
  });
});
