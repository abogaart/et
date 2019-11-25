import { expect, test } from '@oclif/test';

const listrVerboseRenderer = require('listr-verbose-renderer');
jest.mock('listr-verbose-renderer');

import { jestExpect } from '../__mocks__';
jest.useFakeTimers();
setTimeout.mockImplementation(fn => fn());

describe('hello', () => {
  test
    .stdout()
    .command(['hello'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world');
      jestExpect(listrVerboseRenderer).toHaveBeenCalled();
      const tasks = listrVerboseRenderer.mock.calls[0][0];
      jestExpect(tasks[0]).toEqual(jestExpect.objectContaining({ title: 'Git' }));
      jestExpect(tasks[1]).toEqual(jestExpect.objectContaining({ title: 'Git2' }));
    });

  test
    .stdout()
    .command(['hello', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff');
    });

  test
    .stdout()
    .command(['hello', 'dude'])
    .it('runs hello dude', ctx => {
      expect(ctx.stdout).to.contain('file: dude');
    });
});
