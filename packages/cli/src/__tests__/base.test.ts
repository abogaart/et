import { jestExpect } from '@bloomreach/test-utils';
import { flags } from '@oclif/command';
import { IConfig } from '@oclif/config';
import * as Listr from 'listr';

import { fixturesPath, TestCommand } from '../__mocks__';
import { EtContext, EtFlags } from '../base';

jest.mock('listr');

interface TestFlags extends EtFlags {
  name: string;
}

class BaseTestCommand extends TestCommand<TestFlags> {
  static flags = {
    ...TestCommand.flags,
    name: flags.string(),
  };

  static args = [
    { name: 'testArg1' },
    { name: 'testArg2' },
  ];
}

const cfg = {
  configDir: fixturesPath('user-dir'),
  root: fixturesPath('project-dir'),
} as IConfig;

describe('base command', () => {
  describe('init', () => {
    it('creates a context', async () => {
      const cmd = new BaseTestCommand([], cfg);
      await cmd.init();

      expect(cmd.context).not.toBeNull();
      expect(cmd.context).not.toBeUndefined();
    });

    it('parses CLI args and flags', async () => {
      const cmd = new BaseTestCommand(['arg1', 'arg2', '--name', 'myName'], cfg);
      await cmd.init();

      expect(cmd.context.args).not.toBeNull();
      expect(cmd.context.args).not.toBeUndefined();
      expect(cmd.context.args.testArg1).toEqual('arg1');
      expect(cmd.context.args.testArg2).toEqual('arg2');

      expect(cmd.context.flags).not.toBeNull();
      expect(cmd.context.flags).not.toBeUndefined();
      expect(cmd.context.flags.name).toEqual('myName');
    });

    it('creates a default app and cli configuration', async () => {
      const cliConfig = { ...cfg, root: './noop', configDir: './noop' };
      const cmd = new BaseTestCommand([], cliConfig);
      await cmd.init();

      const { config } = cmd.context;
      expect(config).not.toBeNull();
      expect(config).not.toBeUndefined();
      expect(config.app.get('installed')).toBe(false);
      expect(config.app.get('version')).toEqual('0.0.0');
      expect(config.cli).toEqual(cliConfig);
    });

    it('has a configurable config file name', async () => {
      const cmd = new BaseTestCommand(['--configFile', 'bet'], { ...cfg, root: fixturesPath() });
      await cmd.init();

      expect(cmd.context.config.app.get('version')).toEqual('bet');
    });

    it('reads from the user config dir', async () => {
      const cmd = new BaseTestCommand([], { ...cfg, root: '' });
      await cmd.init();

      const config = cmd.context.config.app;
      expect(config.get('installed')).toBe(true);
      expect(config.get('version')).toEqual('user-dir');
    });

    it('reads from the project dir', async () => {
      const cmd = new BaseTestCommand([], cfg);
      await cmd.init();

      const config = cmd.context.config.app;
      expect(config.get('installed')).toBe(true);
      expect(config.get('version')).toEqual('project-dir');
    });
  });

  describe('runTask', () => {
    it('runs a task', async () => {
      const cmd = new BaseTestCommand([], { ...cfg, root: '', configDir: '' });
      await cmd.init();
      await cmd.runTask(async (ctx: EtContext<TestFlags>) => {
        expect(ctx).toEqual(cmd.context);
      });
    });
  });

  describe('runTasks', () => {
    it('runs Listr tasks', async () => {
      const cmd = new BaseTestCommand([], { ...cfg, root: '', configDir: '' });
      await cmd.init();

      const tasks = [
        { title: 'task 1', task: jest.fn() },
        { title: 'task 2', task: jest.fn() },
      ];
      const generateTasks = jest.fn().mockReturnValue(tasks);
      await cmd.runTasks(generateTasks, { renderer: 'silent', nonTTYRenderer: 'silent' });

      jestExpect(generateTasks).toHaveBeenCalledWith(cmd.context);
      jestExpect(Listr).toHaveBeenCalledWith(tasks, {
        dateFormat: false,
        renderer: 'silent',
        nonTTYRenderer: 'silent',
      });
    });

    it('generates options from a function if argument is a function', async () => {
      const cmd = new BaseTestCommand([], { ...cfg, root: '', configDir: '' });
      await cmd.init();

      const tasks = [{ title: 'task 1', task: jest.fn() }];
      const generateOptions = jest.fn().mockReturnValue({ testOption: true });
      await cmd.runTasks(() => tasks, generateOptions);

      jestExpect(generateOptions).toHaveBeenCalledWith(cmd.context);
      jestExpect(Listr).toHaveBeenCalledWith(tasks, jestExpect.objectContaining({ testOption: true }));
    });
  });
});
