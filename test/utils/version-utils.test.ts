const path = require('path');
const execa = require('execa');
jest.mock('execa');

import { getJavaVersion, getGitVersion, getMavenVersion } from '../../src/utils/version-utils';

describe('version utils', () => {
  describe('getJavaVersion', () => {
    it('returns the java version', async () => {
      execa.sync.mockReturnValue({ stdout: 'java version 1.2.3' });
      expect(await getJavaVersion('java')).toBe('1.2.3');

      execa.sync.mockReturnValue({ stdout: 'java version 1.2.3' });
      expect(await getJavaVersion('java')).toBe('1.2.3');

      execa.sync.mockReturnValue({ stdout: 'java version "1.2.3"' });
      expect(await getJavaVersion('java')).toBe('1.2.3');

      execa.sync.mockReturnValue({ stdout: 'java version "1.2.3"\nLorem ipsum' });
      expect(await getJavaVersion('java')).toBe('1.2.3');
    });

    it('returns the java version from stderr', async () => {
      execa.sync.mockReturnValue({ stderr: 'java version "1.2.3"' });
      expect(await getJavaVersion('java')).toBe('1.2.3');
    });

    it('returns null if version check fails', async () => {
      execa.sync.mockReturnValue({ stdout: 'other version 1.2.3' });
      expect(await getJavaVersion('java')).toBeNull();

      execa.sync.mockImplementation(() => { throw new Error('boom'); });
      expect(await getJavaVersion('java')).toBeNull();
    });
  });

  describe('getGitVersion', () => {
    it('returns the git version', async () => {
      execa.sync.mockReturnValue({ stdout: 'git version 1.2.3.y' });
      expect(await getGitVersion('git')).toBe('1.2.3.y');
    });

    it('returns null if version check fails', async () => {
      execa.sync.mockReturnValue({ stdout: 'other version 1.2.3.y' });
      expect(await getGitVersion('git')).toBeNull();

      execa.sync.mockImplementation(() => { throw new Error('boom'); });
      expect(await getGitVersion('git')).toBeNull();
    });
  });

  describe('getMavenVersion', () => {
    it('returns the maven version', async () => {
      execa.sync.mockReturnValue({ stdout: 'Apache Maven 1.2.3 #hash#\nLorem ipsum' });
      expect(await getMavenVersion('mvn')).toBe('1.2.3');
    });

    it('returns the maven version from stderr', async () => {
      execa.sync.mockReturnValue({ stderr: 'Apache Maven 1.2.3 #hash#\nLorem ipsum' });
      expect(await getMavenVersion('mvn')).toBe('1.2.3');
    });

    it('returns null if version check fails', async () => {
      execa.sync.mockReturnValue({ stdout: 'other version 1.2.3' });
      expect(await getMavenVersion('mvn')).toBeNull();

      execa.sync.mockImplementation(() => { throw new Error('boom'); });
      expect(await getMavenVersion('mvn')).toBeNull();
    });
  });
});
