import { expect } from '@oclif/test';
import { EtCommand, EtFlags, EtContext } from '../src/base';
import { flags } from '@oclif/command';

interface TestFlags extends EtFlags {
  name: string;
}

class TestCommand extends EtCommand<TestFlags> {
  static flags = {
    ...EtCommand.flags,
    name: flags.string(),
  };

  static args = [
    { name: 'testArg1' },
    { name: 'testArg2' },
  ];

  run = jest.fn()

  get context() {
    return this.getContext();
  }
}

describe('base command', () => {
  describe('init', () => {
    let cfg;

    beforeEach(() => {
      cfg = {
        configDir: './test/__mocks__/user-dir',
        root: './test/__mocks__/project-dir'
      };
    });

    it('creates a context', async () => {
      const cmd = new TestCommand([], cfg);
      await cmd.init();

      expect(cmd.context).to.not.be.null;
      expect(cmd.context).to.not.be.undefined;
    });

    it('parses CLI args and flags', async () => {
      const cmd = new TestCommand(['arg1', 'arg2', '--name', 'myName'], cfg);
      await cmd.init();

      expect(cmd.context.args).to.not.be.null;
      expect(cmd.context.args).to.not.be.undefined;
      expect(cmd.context.args.testArg1).to.equal('arg1');
      expect(cmd.context.args.testArg2).to.equal('arg2');

      expect(cmd.context.flags).to.not.be.null;
      expect(cmd.context.flags).to.not.be.undefined;
      expect(cmd.context.flags.name).to.equal('myName');
    });

    it('creates a default configuration', async () => {
      const cmd = new TestCommand([], { ...cfg, root: './noop', configDir: './noop' });
      await cmd.init();

      const config = cmd.context.config;
      expect(config).to.not.be.null;
      expect(config).to.not.be.undefined;
      expect(config.get('installed')).to.be.false;
      expect(config.get('version')).to.equal('0.0.0');
    });

    it('has a configurable config file name', async () => {
      const cmd = new TestCommand(['--configFile', 'bet'], { ...cfg, root: './test/__mocks__' });
      await cmd.init();

      expect(cmd.context.config.get('version')).to.equal('bet');
    });

    it('reads from the user config dir', async () => {
      const cmd = new TestCommand([], { ...cfg, root: '' });
      await cmd.init();

      const config = cmd.context.config;
      expect(config.get('installed')).to.be.true;
      expect(config.get('version')).to.equal("user-dir");
    });

    it('reads from the project dir', async () => {
      const cmd = new TestCommand([], cfg);
      await cmd.init();

      const config = cmd.context.config;
      expect(config.get('installed')).to.be.true;
      expect(config.get('version')).to.equal("project-dir");
    });

    it('runs a task', async () => {
      const cmd = new TestCommand([], { ...cfg, root: '', configDir: '' });
      await cmd.init();
      await cmd.runTask(async (ctx: EtContext<TestFlags>) => {
        expect(ctx.config.get('installed')).to.be.false;
        expect(ctx.config.get('version')).to.equal('0.0.0');
      });
    });

  })
});
