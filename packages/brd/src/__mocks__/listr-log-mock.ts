// listr-verbose-renderer is a transitive dependency of listr and is installed in the node_modules folder of the
// listr dependency. If we make it an implicit dependency, we end up forking the wrong class
// (from <project-dir>/node_modules instead of <project-dir>/node_modules/listr/node_modules).
// eslint-disable-next-line import/no-extraneous-dependencies
import { log } from 'listr-verbose-renderer/lib/utils';

export function mockListerLog(): void {
  jest.mock('listr-verbose-renderer');
  log.mockImplementation((_cfg: any, message: 'string') => {
    process.stdout.write(`${message}\n`);
  });
}
