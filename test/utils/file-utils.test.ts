import * as fs from 'fs';
import * as path from 'path';

import { checkPathExists, findLinkedFile } from '../../src/utils/file-utils';

function createLink(target: string, link: string) {
  try {
    const stat = fs.lstatSync(link);
    if (stat.isSymbolicLink()) {
      return;
    }
  } catch (e) {
  }

  fs.symlinkSync(target, link);
}

function removeLink(link: string) {
  fs.unlinkSync(link);
}

describe('File utils tests', () => {
  describe('checkFileExists', () => {
    it('resolves if folder or file exists', async () => {
      expect(await checkPathExists('./test')).toBe(true);
      expect(await checkPathExists('./package.json')).toBe(true);
    });

    it('rejects if path does not exist', async () => {
      expect(await checkPathExists('./non-existing')).toBe(false);
      expect(await checkPathExists('./non-existing.ts')).toBe(false);
    });
  });

  describe('findLinkedFile', () => {
    const target = path.resolve('./test/__mocks__/bet.json');
    const link = path.resolve('./test/__mocks__/bet-link.json');
    const link2link = path.resolve('./test/__mocks__/bet-link-link.json');

    it('resolves symbolic links to a canonical path', () => {
      createLink(target, link);
      createLink(link, link2link);

      expect(findLinkedFile(link)).toBe(target);
      expect(findLinkedFile(link2link)).toBe(target);

      removeLink(link2link);
      removeLink(link);
    });

    it('return as-is if path is not a symbolic link', () => {
      expect(findLinkedFile('./package.json')).toBe('./package.json');
    });
  });
});
