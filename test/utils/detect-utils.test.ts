const which = require('which');
jest.mock('which');

const findJavaHome = require('find-java-home');
jest.mock('find-java-home');

const path = require('path');

import { detectJavaPath, tryWhich } from '../../src/utils/detect-utils';

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
