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
      },
      flags: {},
    };
    setup = new Setup([], null);
    (setup as any).getContext = jest.fn().mockReturnValue(mockCtx);
    setup.runTasks = jest.fn();
    setup.log = jest.fn();

    Tasks.detectExecutable = jest.fn().mockImplementation((name: string) => name);
  });

  it('Does not execute tasks if already installed', async () => {
    mockCtx.config.app.get.mockReturnValue(true);
    await setup.run();
    expect(setup.log).toHaveBeenCalled();
    expect(setup.runTasks).not.toHaveBeenCalled();
  });

  it('Detects executable for git, java and maven', async () => {
    await setup.run();

    expect(Tasks.detectExecutable).toHaveBeenCalledTimes(3);
    expect(Tasks.detectExecutable.mock.calls[0][0]).toBe('git');
    expect(Tasks.detectExecutable.mock.calls[1][0]).toBe('java');
    expect(Tasks.detectExecutable.mock.calls[2][0]).toBe('mvn');

    const runTasksArgs = setup.runTasks.mock.calls[0][0];
    expect(runTasksArgs()).toHaveLength(3);
  });

  it('Detect java/maven task is only enabled if previous task finished successfully', async () => {
    await setup.run();

    const tasks = setup.runTasks.mock.calls[0][0]();
    expect(tasks[1].enabled).toBeDefined();
    expect(tasks[1].enabled({})).toBe(false);
    expect(tasks[1].enabled({ java: true })).toBe(true);

    expect(tasks[2].enabled).toBeDefined();
    expect(tasks[2].enabled({})).toBe(false);
    expect(tasks[2].enabled({ maven: true })).toBe(true);
  });
});
