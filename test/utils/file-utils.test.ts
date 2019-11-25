import { checkPathExists } from '../../src/utils/file-utils';

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
});
