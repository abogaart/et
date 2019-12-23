import { executableLookupService } from '@bloomreach/cli-services';
import { Tasks } from '..';

import Listr = require('listr');
import listrInquirer = require('listr-inquirer');

jest.mock('listr-inquirer');

describe('setup tasks', () => {
  beforeEach(() => {
    listrInquirer.mockReset();
  });

  describe('fail', () => {
    it('sets the task title to error reason and exits the app', () => {
      const mockTask = {} as any as Listr.ListrTaskWrapper;
      const exit = jest.fn();
      Tasks.fail('task-title', mockTask, { exit });

      expect(mockTask.title).toBe('task-title');
      expect(exit).toHaveBeenCalledWith(1);
    });
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

  describe('detectExecutable', () => {
    let success: (path: string, listrCtx: Listr.ListrContext) => void;
    let error: (reason: string, task: Listr.ListrTaskWrapper) => void;
    let mockCtx: any;
    let mockTask: Listr.ListrTaskWrapper;
    let brdExec1: any;
    let brdExec2: any;

    function mockChoices(result: any): void {
      Tasks.choice = jest.fn().mockImplementation((
        _message: string,
        _choices: { name: string; value: any }[],
        next: (choice: any) => Promise<void>,
      ) => next(result));
    }

    function mockExecutable(name: string, path: string, version: string): any {
      return {
        getName: jest.fn().mockReturnValue(name),
        getPath: jest.fn().mockReturnValue(path),
        getVersion: jest.fn().mockReturnValue(version),
      };
    }

    beforeEach(async () => {
      error = jest.fn();
      success = jest.fn();

      executableLookupService.lookup = jest.fn();
      executableLookupService.create = jest.fn();

      mockCtx = {};
      mockTask = {} as any as Listr.ListrTaskWrapper;

      brdExec1 = mockExecutable('brd', 'brd-path', 'brd-version');
      brdExec2 = mockExecutable('brd2', 'brd2-path', 'brd2-version');
    });

    it('has a title', async () => {
      const { title } = await Tasks.detectExecutable('brd', success, error);
      expect(title).toMatchSnapshot();
    });

    it('finishes without user interaction if there is only one executable path found', async () => {
      const { task } = await Tasks.detectExecutable('brd', success, error);
      executableLookupService.lookup.mockReturnValue([brdExec1]);
      await task(mockCtx, mockTask);

      expect(executableLookupService.lookup).toHaveBeenCalledWith('brd');
      expect(success).toHaveBeenCalledWith('brd-path', mockCtx);
      expect(mockTask.title).toMatchSnapshot();
    });

    it('finishes without user interaction and picks first executable path if option "default" is true', async () => {
      const { task } = await Tasks.detectExecutable('brd', success, error, true);
      executableLookupService.lookup.mockReturnValue([brdExec1, brdExec2]);
      await task(mockCtx, mockTask);

      expect(executableLookupService.lookup).toHaveBeenCalledWith('brd');
      expect(success).toHaveBeenCalledWith('brd-path', mockCtx);
      expect(mockTask.title).toMatchSnapshot();
    });

    it('presents a list if there is more than one executable path possible', async () => {
      const { task } = await Tasks.detectExecutable('brd', success, error);
      executableLookupService.lookup.mockReturnValue([brdExec1, brdExec2]);
      mockChoices(brdExec2);
      await task(mockCtx, mockTask);

      const [[title, [option1, option2]]] = Tasks.choice.mock.calls;
      expect(title).toMatchSnapshot();
      expect(option1.name).toBe('brd-path');
      expect(option1.value).toBe(brdExec1);
      expect(option2.name).toBe('brd2-path');
      expect(option2.value).toBe(brdExec2);
      expect(success).toHaveBeenCalledWith('brd2-path', mockCtx);
    });

    it('asks for a custom path if path(s) not automatically detected', async () => {
      Tasks.customPath = jest.fn();
      let customExec;

      const { task } = await Tasks.detectExecutable('brd', success, error);
      executableLookupService.lookup.mockReturnValue([]);
      executableLookupService.create.mockImplementation((name: string, path: string) => {
        customExec = mockExecutable(name, path, `${name}-version`);
        return customExec;
      });
      await task(mockCtx, mockTask);

      const [[title, label, customPathSuccess, customPathError]] = Tasks.customPath.mock.calls;
      expect({ title, label }).toMatchSnapshot();

      await customPathSuccess('test-path');
      expect(success).toHaveBeenCalledWith('test-path', mockCtx);

      customPathError();
      expect(error).toHaveBeenCalledWith('Setup failed', mockTask);
    });

    it('call the error handler if the executable path is invalid', async () => {
      const { task } = await Tasks.detectExecutable('brd', success, error);
      brdExec1.getVersion.mockReturnValue(null);
      executableLookupService.lookup.mockReturnValue([brdExec1]);
      await task(mockCtx, mockTask);

      expect(error).toHaveBeenCalledWith('Failed to verify brd executable at \'brd-path\'', mockTask);
    });
  });
});
