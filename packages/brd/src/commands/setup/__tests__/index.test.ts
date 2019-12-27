import { Tasks } from '@bloomreach/cli-tasks';

import Setup from '../index';

describe('Setup', () => {
  let mockCtx;
  let setup;

  beforeEach(() => {
    mockCtx = {
      config: {
        app: {
          get: jest.fn(),
          set: jest.fn(),
        },
        cli: {
          version: 'mock-app-version',
        },
        env: {
          configFile: 'mock-brd.json',
          globalConfigFile: 'global-mock-brd.json',
          projectConfigFile: 'project-mock-brd.json',
        },
      },
      flags: {},
    };
    setup = new Setup([], null);
    (setup as any).getContext = jest.fn().mockReturnValue(mockCtx);
    setup.runTasks = jest.fn();
    setup.log = jest.fn();
    setup.writeGlobalConfigFile = jest.fn().mockReturnValue(true);

    Tasks.detectExecutable = jest.fn().mockImplementation((name: string) => name);
  });

  it('does not execute tasks if already installed', async () => {
    mockCtx.config.app.get.mockReturnValue(true);
    await setup.run();
    expect(setup.log).toHaveBeenCalled();
    expect(setup.runTasks).not.toHaveBeenCalled();
    expect(setup.writeGlobalConfigFile).not.toHaveBeenCalled();
  });

  it('detects executable for git, java and maven and writes a config file', async () => {
    await setup.run();

    expect(Tasks.detectExecutable).toHaveBeenCalledTimes(3);
    expect(Tasks.detectExecutable.mock.calls[0][0]).toBe('git');
    expect(Tasks.detectExecutable.mock.calls[1][0]).toBe('java');
    expect(Tasks.detectExecutable.mock.calls[2][0]).toBe('mvn');

    const runTasksArgs = setup.runTasks.mock.calls[0][0];
    expect(runTasksArgs()).toHaveLength(3);
  });

  it('it only enables java/maven task if previous task has finished successfully', async () => {
    await setup.run();

    const tasks = setup.runTasks.mock.calls[0][0]();
    expect(tasks[1].enabled).toBeDefined();
    expect(tasks[1].enabled({})).toBe(false);
    expect(tasks[1].enabled({ java: true })).toBe(true);

    expect(tasks[2].enabled).toBeDefined();
    expect(tasks[2].enabled({})).toBe(false);
    expect(tasks[2].enabled({ maven: true })).toBe(true);
  });

  it('writes a config file', async () => {
    await setup.run();

    expect(setup.writeGlobalConfigFile).toHaveBeenCalled();
  });

  it('prints an error if unable to write globabl config file', async () => {
    setup.writeGlobalConfigFile.mockReturnValue(false);
    setup.error = jest.fn();
    await setup.run();

    expect(setup.error).toHaveBeenCalledWith('Failed to write global config file global-mock-brd.json');
  });
});
