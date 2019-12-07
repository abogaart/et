import * as convict from 'convict';

import { fixturesPath, TestCommand } from '../__mocks__';

jest.mock('convict');
const mockConvict = convict as any as jest.Mock;

describe('base command', () => {
  describe('init', () => {
    let cmd;
    let convictConfig;

    beforeEach(() => {
      convictConfig = {
        loadFile: jest.fn(),
        validate: jest.fn(),
      };
      mockConvict.mockReturnValue(convictConfig);

      cmd = new TestCommand([], {
        root: '',
        configDir: fixturesPath('user-dir'),
      } as any);
    });

    it('errors if it can not load an existing configuration file', async () => {
      convictConfig.loadFile = (): void => { throw new Error('File not found'); };
      try {
        await cmd.init();
        fail('should have thrown an error');
      } catch (e) {
        expect(e.message).toContain('Error: File not found');
      }
    });

    it('errors if the loaded configuration is not valid', async () => {
      convictConfig.validate = (): void => { throw new Error('Config not valid'); };
      try {
        await cmd.init();
        fail('should have thrown an error');
      } catch (e) {
        expect(e.message).toContain('Error: Config not valid');
      }
    });

    it('errors if a task is ran without calling init()', async () => {
      try {
        await cmd.runTask();
        fail('should have thrown an error');
      } catch (e) {
        expect(e.message).toContain('Init must be called before trying to access this.ctx');
      }

      try {
        await cmd.runTasks();
        fail('should have thrown an error');
      } catch (e) {
        expect(e.message).toContain('Init must be called before trying to access this.ctx');
      }
    });
  });
});
