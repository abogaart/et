import { EtCommand, EtFlags } from '../src/base';
import { flags } from '@oclif/command';
jest.mock('convict');

import * as _mockConvict from 'convict';
const mockConvict =  _mockConvict as any as jest.Mock;

class TestCommand extends EtCommand<EtFlags> {
  static flags = EtCommand.flags;
  run = jest.fn()
}

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
        configDir: './test/__mocks__/user-dir'
      } as any);
    });

    it('errors if it can not load an existing configuration file', async () => {
      convictConfig.loadFile = () => { throw new Error('File not found'); };
      try {
        await cmd.init();
      } catch (e) {
        expect(e.message).toContain('Error: File not found');
        return;
      }
      fail('should have thrown an error');
    });

    it('errors if the loaded configuration is not valid', async () => {
      convictConfig.validate = () => { throw new Error('Config not valid'); };
      try {
        await cmd.init();
      } catch (e) {
        expect(e.message).toContain('Error: Config not valid');
        return;
      }
      fail('should have thrown an error');
    });

  })
});
