import { Tasks } from '../setup-tasks';

import listrInquirer = require('listr-inquirer');

jest.mock('listr-inquirer');

describe('setup tasks', () => {
  beforeEach(() => {
    listrInquirer.mockReset();
  });

  describe('choice', () => {
    const next = jest.fn();

    beforeEach(() => {
      next.mockReset();
      Tasks.choice('msg', ['choice1', 'choice2'], next);
    });

    it('invokes listr-inquirer with a choice list', () => {
      const [config] = listrInquirer.mock.calls[0];
      expect(config).toMatchSnapshot();
    });

    it('invokes next with the chosen value', async () => {
      const [, done] = listrInquirer.mock.calls[0];
      await done({ choice: 'return-value' });

      expect(next).toHaveBeenCalledWith('return-value');
    });
  });

  it('confirm', () => {
    expect(Tasks.confirm('confirm-msg')).toMatchSnapshot();
  });

  describe('customPath', () => {
    let config: any[];
    let error: () => Promise<void>;
    let next: (path: string) => Promise<void>;
    let done: (answers: any) => Promise<void>;

    beforeEach(async () => {
      error = jest.fn();
      next = jest.fn();

      await Tasks.customPath('confirm-msg', 'path-label', next, error);

      [[config, done]] = listrInquirer.mock.calls;
    });

    it('starts with a confirmation', async () => {
      const [confirm] = config;
      expect(confirm).toMatchSnapshot();
    });

    it('only shows the custom path input option if first step is confirmed', () => {
      const [, customPath] = config;
      expect(customPath.when({ continue: false })).toBe(false);
      expect(customPath.when({ continue: true })).toBe(true);
    });

    it('shows custom path input option', () => {
      const [, customPath] = config;
      expect(customPath).toMatchSnapshot();
    });

    it('validates that the input is not empty and an absolute path', () => {
      const [, customPath] = config;
      expect(customPath.validate('')).toBe('Value is required');
      expect(customPath.validate(' \n')).toBe('Value is required');
      expect(customPath.validate('path')).toBe('Path should be absolute');
      expect(customPath.validate('/path')).toBe(true);
    });

    it('invokes next with trimmed path when done', async () => {
      await done({ continue: true, customPath: '  /path\n' });
      expect(next).toHaveBeenCalledWith('/path');
    });

    it('invokes error if custom path is not set', async () => {
      await done({ continue: false });
      expect(error).toHaveBeenCalled();
    });
  });
});
