import { taskError } from '../error-tasks';

import Listr = require('listr');

const mockTask = {} as any as Listr.ListrTaskWrapper;

describe('taskError', () => {
  it('sets the task title to error message and exits the app', () => {
    const exit = jest.fn();
    taskError('task-title', mockTask, { exit });

    expect(mockTask.title).toBe('task-title');
    expect(exit).toHaveBeenCalledWith(1);
  });
});
