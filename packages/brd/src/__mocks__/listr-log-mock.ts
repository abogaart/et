export function mockListerLog() {
  jest.mock('listr-verbose-renderer');
  // listr-verbose-renderer is a transitive dependency of listr and is installed in the node_modules of the listr module
  // If we make it an implicit dependency, we end up forking the wrong class (from <project-dir>/node_modules instead of <project-dir>/node_modules/listr/node_modules)
  // tslint:disable-next-line:no-implicit-dependencies
  const { log } = require('listr-verbose-renderer/lib/utils');
  log.mockImplementation((_cfg: any, message: 'string') => {
    process.stdout.write(message + '\n');
  });

  log;
}
