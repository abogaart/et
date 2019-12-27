import * as fs from 'fs-extra';
import * as path from 'path';

import {
  checkPathExists,
  findLinkedFile,
  readFile,
  readJson,
  writeFile,
  writeJson,
} from '../file-utils';

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
    it('resolves symbolic links to a canonical path', () => {
      const target = path.resolve(__dirname, '__fixtures__/bet.json');
      const link = path.resolve(__dirname, '__fixtures__/bet-link.json');
      const link2link = path.resolve(__dirname, '__fixtures__/bet-link-link.json');

      createLink(target, link);
      createLink(link, link2link);

      expect(findLinkedFile(link)).toBe(target);
      expect(findLinkedFile(link2link)).toBe(target);

      fs.removeSync(link2link);
      fs.removeSync(link);
    });

    it('return as-is if path is not a symbolic link', () => {
      expect(findLinkedFile('./package.json')).toBe('./package.json');
    });
  });

  describe('readFile', () => {
    it('read string data', async () => {
      const betJsonFile = path.resolve(__dirname, '__fixtures__/bet.json');
      expect(await readFile(betJsonFile)).toBe('{\n  "version": "bet"\n}\n');
    });

    it('returns null on error', async () => {
      const nonExistingFile = path.resolve(__dirname, '__fixtures__/non-existing.json');
      expect(await readFile(nonExistingFile)).toBe(null);
    });
  });

  describe('writeFile', () => {
    it('writes string data', async () => {
      const randomFileName = Math.random().toString(8);
      const randomFilePath = path.resolve(__dirname, `__fixtures__/${randomFileName}.json`);
      expect(await writeFile(randomFilePath, `{ id: '${randomFileName}'}`)).toBe(true);
      expect(await fs.pathExists(randomFilePath)).toBe(true);

      await fs.remove(randomFilePath);
    });

    it('returns false on error', async () => {
      expect(await writeFile('/', '')).toBe(false);
    });
  });

  describe('readJson', () => {
    it('reads json data', async () => {
      const betJsonFile = path.resolve(__dirname, '__fixtures__/bet.json');
      expect(await readJson(betJsonFile)).toStrictEqual({ version: 'bet' });
    });

    it('returns null on error', async () => {
      expect(await readJson('non-existing')).toBe(null);
    });
  });

  describe('writeJson', () => {
    it('writes a json blob', async () => {
      const randomFileName = Math.random().toString(8);
      const randomFilePath = path.resolve(__dirname, `__fixtures__/${randomFileName}.json`);
      const jsonData = { id: randomFileName };
      expect(await writeJson(randomFilePath, jsonData)).toBe(true);
      expect(await readJson(randomFilePath)).toStrictEqual(jsonData);

      await fs.remove(randomFilePath);
    });

    it('returns false on error', async () => {
      expect(await writeJson('/', '')).toBe(false);
    });
  });
});
