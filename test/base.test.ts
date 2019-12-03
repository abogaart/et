import { flags } from '@oclif/command';
import { IConfig } from '@oclif/config';
import { expect } from '@oclif/test';
import * as Listr from 'listr';

import { EtContext, EtFlags } from '../src/base';

import { jestExpect, TestCommand } from './__mocks__';
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
  configDir: './test/__fixtures__/user-dir',
  root: './test/__fixtures__/project-dir'
} as IConfig;
const defaultCfg = { ...cfg, root: '', configDir: '' };

describe('base command', () => {
  describe('init', () => {
    it('creates a context', async () => {
      const cmd = new BaseTestCommand([], cfg);
      await cmd.init();

      expect(cmd.context).to.not.be.null;
      expect(cmd.context).to.not.be.undefined;
    });

    it('parses CLI args and flags', async () => {
      const cmd = new BaseTestCommand(['arg1', 'arg2', '--name', 'myName'], cfg);
      await cmd.init();

      expect(cmd.context.args).to.not.be.null;
      expect(cmd.context.args).to.not.be.undefined;
      expect(cmd.context.args.testArg1).to.equal('arg1');
      expect(cmd.context.args.testArg2).to.equal('arg2');

      expect(cmd.context.flags).to.not.be.null;
      expect(cmd.context.flags).to.not.be.undefined;
      expect(cmd.context.flags.name).to.equal('myName');
    });

    it('creates a default app and cli configuration', async () => {
      const cliConfig = { ...cfg, root: './noop', configDir: './noop' };
      const cmd = new BaseTestCommand([], cliConfig);
      await cmd.init();

      const config = cmd.context.config;
      expect(config).to.not.be.null;
      expect(config).to.not.be.undefined;
      expect(config.app.get('installed')).to.be.false;
      expect(config.app.get('version')).to.equal('0.0.0');
      expect(config.cli).to.equal(cliConfig);
    });

    it('has a configurable config file name', async () => {
      const cmd = new BaseTestCommand(['--configFile', 'bet'], { ...cfg, root: './test/__fixtures__' });
      await cmd.init();

      expect(cmd.context.config.app.get('version')).to.equal('bet');
    });

    it('reads from the user config dir', async () => {
      const cmd = new BaseTestCommand([], { ...cfg, root: '' });
      await cmd.init();

      const config = cmd.context.config.app;
      expect(config.get('installed')).to.be.true;
      expect(config.get('version')).to.equal('user-dir');
    });

    it('reads from the project dir', async () => {
      const cmd = new BaseTestCommand([], cfg);
      await cmd.init();

      const config = cmd.context.config.app;
      expect(config.get('installed')).to.be.true;
      expect(config.get('version')).to.equal('project-dir');
    });
  });

  describe('runTask', () => {
    it('runs a task', async () => {
      const cmd = new BaseTestCommand([], defaultCfg);
      await cmd.init();
      await cmd.runTask(async (ctx: EtContext<TestFlags>) => {
        expect(ctx).to.equal(cmd.context);
      });
    });
  });

  describe('runTasks', () => {
    it('runs Listr tasks', async () => {
      const cmd = new BaseTestCommand([], defaultCfg);
      await cmd.init();

      const tasks = [
        { title: 'task 1', task:  jest.fn() },
        { title: 'task 2', task:  jest.fn() },
      ];
      const generateTasks = jest.fn().mockReturnValue(tasks);
      await cmd.runTasks(generateTasks, { renderer: 'silent', nonTTYRenderer: 'silent' });

      jestExpect(generateTasks).toHaveBeenCalledWith(cmd.context);
      jestExpect(Listr).toHaveBeenCalledWith(tasks, { dateFormat: false, renderer: 'silent', nonTTYRenderer: 'silent' });
    });

    it('generates options from a function if argument is a function', async () => {
      const cmd = new BaseTestCommand([], defaultCfg);
      await cmd.init();

      const tasks = [{ title: 'task 1', task:  jest.fn() }];
      const generateOptions = jest.fn().mockReturnValue({ testOption: true });
      await cmd.runTasks(() => tasks, generateOptions);

      jestExpect(generateOptions).toHaveBeenCalledWith(cmd.context);
      jestExpect(Listr).toHaveBeenCalledWith(tasks, jestExpect.objectContaining({ testOption: true }));
    });
  });
});
