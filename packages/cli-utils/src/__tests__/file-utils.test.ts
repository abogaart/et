import * as fs from 'fs';
import * as path from 'path';

import { checkPathExists, findLinkedFile } from '../file-utils';

function isLink(link: string): boolean {
  try {
    const stat = fs.lstatSync(link);
    return stat.isSymbolicLink();
  } catch (ignore) {
    return false;
  }
}

function createLink(target: string, link: string): void {
  if (!isLink(link)) {
    fs.symlinkSync(target, link);
  }
}

function removeLink(link: string): void {
  fs.unlinkSync(link);
}

describe('File utils tests', () => {
  describe('checkFileExists', () => {
    it('resolves if folder or file exists', async () => {
      expect(await checkPathExists(__dirname)).toBe(true);
      expect(await checkPathExists('./package.json')).toBe(true);
    });

    it('rejects if path does not exist', async () => {
      expect(await checkPathExists('./non-existing')).toBe(false);
      expect(await checkPathExists('./non-existing.ts')).toBe(false);
    });
  });

  describe('findLinkedFile', () => {
    const target = path.resolve(__dirname, '__fixtures__/bet.json');
    const link = path.resolve(__dirname, '__fixtures__/bet-link.json');
    const link2link = path.resolve(__dirname, '__fixtures__/bet-link-link.json');

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
