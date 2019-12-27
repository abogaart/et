import { test } from '@oclif/test';
import * as cliUtilsModule from '@bloomreach/cli-utils';
import { jestExpect } from '@bloomreach/test-utils';
import { Tasks } from '@bloomreach/cli-tasks';

import { mockListerLog } from '../../../__mocks__/listr-log-mock';
import { mockLookupExecutable, mockExecutable } from '../../../__mocks__/executables';
import { mockChoices, mockCustomPath } from '../../../__mocks__/tasks';

// setup mocks
jest.mock('listr-verbose-renderer/lib/utils');
mockListerLog();

// eslint-disable-next-line global-require
jest.mock('@bloomreach/cli-services', () => require('../../../__mocks__/executables').mockCliServices);

Tasks.choice = jest.fn();
Tasks.fail = jest.fn();

jest.spyOn(cliUtilsModule, 'writeJson').mockReturnValue(true);

const gitExec = {
  name: 'git',
  execs: [
    mockExecutable('git', 'git', 'git-global-version'),
    mockExecutable('git', '/abs/path/to/git', 'git-abs-version'),
    mockExecutable('git', '/symlink/path/to/git', 'git-symlink-version'),
  ],
};

const javaExec = {
  name: 'java',
  execs: [
    mockExecutable('java', 'java', 'java-global-version'),
    mockExecutable('java', '/abs/path/to/java', 'java-abs-version'),
    mockExecutable('java', '/symlink/path/to/java', 'java-symlink-version'),
  ],
};

const mvnExec = {
  name: 'mvn',
  execs: [
    mockExecutable('mvn', 'mvn', 'maven-global-version'),
    mockExecutable('mvn', '/abs/path/to/mvn', 'maven-abs-version'),
    mockExecutable('mvn', '/symlink/path/to/mvn', 'maven-symlink-version'),
  ],
};

const cmd = ['setup', '--config', 'test-config'];

describe('setup', () => {
  beforeEach(() => {
    Tasks.choice.mockClear();
    Tasks.fail.mockClear();

    mockLookupExecutable(gitExec, javaExec, mvnExec);
  });

  describe('initial', () => {
    test
      .stdout()
      .command([...cmd, '--default'])
      .it('picks first path of git, java and mvn executables in default mode', (ctx: any) => {
        jestExpect(ctx.stdout).toMatchSnapshot();
        jestExpect(Tasks.choice).not.toHaveBeenCalled();
      });

    test
      .do(() => mockChoices(0))
      .stdout()
      .command(cmd)
      .it('finds global installed git, java and mvn executables', (ctx: any) => {
        jestExpect(ctx.stdout).toMatchSnapshot();
        jestExpect(Tasks.choice).toHaveBeenCalledTimes(3);
      });

    test
      .do(() => mockChoices(1))
      .stdout()
      .command(cmd)
      .it('can select absolute path from global installed git, java and mvn executables', (ctx: any) => {
        jestExpect(ctx.stdout).toMatchSnapshot();
        jestExpect(Tasks.choice).toHaveBeenCalledTimes(3);
      });

    test
      .do(() => mockChoices(2))
      .stdout()
      .command(cmd)
      .it('can select symlink resolved absolute path from global installed git, java and mvn executables', (ctx: any) => {
        jestExpect(ctx.stdout).toMatchSnapshot();
        jestExpect(Tasks.choice).toHaveBeenCalledTimes(3);
      });

    test
      .do(() => {
        mockLookupExecutable(
          { ...gitExec, execs: [] },
          { ...javaExec, execs: [] },
          { ...mvnExec, execs: [] },
        );
        mockCustomPath('git', 'java', 'mvn');
      })
      .stdout()
      .command(cmd)
      .it('present option to set custom paths', (ctx: any) => {
        jestExpect(ctx.stdout).toMatchSnapshot();
      });

    test
      .do(() => {
        const invalidVersion = '';
        mockLookupExecutable(
          { name: 'git', execs: [mockExecutable('git', '/invalid/git/path', invalidVersion)] },
          { name: 'java', execs: [mockExecutable('java', '/invalid/java/path', invalidVersion)] },
          { name: 'mvn', execs: [mockExecutable('mvn', '/invalid/maven/path', invalidVersion)] },
        );
      })
      .stdout()
      .stderr()
      .command(cmd)
      .it('prints an error if custom path is invalid', () => {
        jestExpect(Tasks.fail.mock.calls).toHaveLength(3);
        jestExpect(Tasks.fail.mock.calls[0][0]).toMatchSnapshot();
        jestExpect(Tasks.fail.mock.calls[1][0]).toMatchSnapshot();
        jestExpect(Tasks.fail.mock.calls[2][0]).toMatchSnapshot();
      });
  });

  describe('already installed', () => {
    test
      .stdout()
      .command(['setup', '--config', 'src/commands/setup/__tests__/__fixtures__/et-installed'])
      .it('print merged config if already stalled', (ctx: any) => {
        jestExpect(ctx.stdout).toMatchSnapshot();
      });
  });
});
