import { ListrTaskWrapper } from 'listr';

export function taskError(msg: string, task: ListrTaskWrapper, cmd: any): void {
  task.title = msg;
  cmd.exit(1);
}
