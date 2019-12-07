import { taskError, Tasks } from '@bloomreach/cli-tasks';
import {
  checkPathExists,
  detectJavaPath,
  findLinkedFile,
  getGitVersion,
  getJavaVersion,
  getMavenVersion,
  tryWhich,
} from '@bloomreach/cli-utils';
import { jestExpect } from '@bloomreach/test-utils';
import { test } from '@oclif/test';

import { mockListerLog } from '../../../__mocks__/listr-log-mock';

mockListerLog();
jest.mock('listr-inquirer');
jest.mock('listr-verbose-renderer/lib/utils');
jest.mock('@bloomreach/cli-utils');
jest.mock('@bloomreach/cli-tasks');

const actualCheckPathExists = jest.requireActual('@bloomreach/cli-utils').checkPathExists;
checkPathExists.mockImplementation((path: string) => actualCheckPathExists(path));

function mockChoices(index: number): void {
  Tasks.choice.mockImplementation((
    _message: string,
    choices: string[],
    next: (path: string) => Promise<void>,
  ) => next(choices[index]));
}

function mockTryWhich(...includes: string[]): void {
  tryWhich.mockImplementation(async (name: string) => (includes.includes(name) ? `${name}.which` : null));
}

function mockCustomPath(...ids: string[]): void {
  Tasks.customPath.mockImplementation((
    confirmMsg: string,
    _pathLabel: string,
    next: (path: string) => Promise<void>,
  ) => {
    const pathId = ids.find((id: string) => confirmMsg.includes(id));
    return pathId
      ? next(`/custom-path/${pathId}`)
      : next('/custom-path');
  });
}

function mockJavaPath(value: string | null): void {
  detectJavaPath.mockImplementation(async () => value);
}

function expectTaskError(): void {
  jestExpect(taskError.mock.calls.length).toBe(1);
  jestExpect(taskError.mock.calls[0][0]).toMatchSnapshot();
}

describe('setup -', () => {
  beforeEach(() => {
    taskError.mockClear();

    mockChoices(0);
    mockCustomPath('git', 'java', 'maven');
    mockTryWhich('git', 'java', 'mvn');
    mockJavaPath('./java-home');

    findLinkedFile.mockImplementation((name: string) => `${name}.canonical`);
    getGitVersion.mockReturnValue('1.2.3');
    getJavaVersion.mockReturnValue('2.3.4');
    getMavenVersion.mockReturnValue('3.4.5');
  });

  describe('initial setup -', () => {
    test
      .stdout()
      .command(['setup'])
      .it('finds global installed git, java and mvn executables', (ctx: any) => {
        jestExpect(ctx.stdout).toMatchSnapshot();
      });

    test
      .do(() => mockChoices(1))
      .stdout()
      .command(['setup'])
      .it('can select absolute path from global installed git, java and mvn executables', (ctx: any) => {
        jestExpect(ctx.stdout).toMatchSnapshot();
      });

    test
      .do(() => mockChoices(2))
      .stdout()
      .command(['setup'])
      .it('can select symlink resolved absolute path from global installed git, java and mvn executables', (ctx: any) => {
        jestExpect(ctx.stdout).toMatchSnapshot();
      });

    test
      .do(() => mockTryWhich('git', 'mvn'))
      .stdout()
      .command(['setup'])
      .it('tries to find java-home when "which" command fails', (ctx: any) => {
        jestExpect(ctx.stdout).toMatchSnapshot();
      });

    test
      .do(() => {
        mockTryWhich();
        mockJavaPath(null);
      })
      .stdout()
      .command(['setup'])
      .it('present option to set custom paths', (ctx: any) => {
        jestExpect(ctx.stdout).toMatchSnapshot();
      });

    test
      .do(() => getGitVersion.mockReturnValue(null))
      .stdout()
      .stderr()
      .command(['setup'])
      .it('prints an error if git path is invalid', () => expectTaskError());

    test
      .do(() => getJavaVersion.mockReturnValue(null))
      .stdout()
      .stderr()
      .command(['setup'])
      .it('prints an error if java path is invalid', () => expectTaskError());

    test
      .do(() => getMavenVersion.mockReturnValue(null))
      .stdout()
      .stderr()
      .command(['setup'])
      .it('prints an error if maven path is invalid', () => expectTaskError());

    describe('custom path not set -', () => {
      beforeEach(() => {
        mockJavaPath(null);
        Tasks.customPath.mockImplementation((_confirmMsg: string,
          _pathLabel: string,
          _next: (path: string) => Promise<void>,
          error: () => Promise<void>) => error());
      });

      test
        .do(() => mockTryWhich())
        .stdout()
        .stderr()
        .command(['setup'])
        .it('prints an error if custom git path is not set', () => expectTaskError());

      test
        .do(() => mockTryWhich('git'))
        .stdout()
        .stderr()
        .command(['setup'])
        .it('prints an error if custom java path is not set', () => expectTaskError());

      test
        .do(() => mockTryWhich('git', 'java'))
        .stdout()
        .stderr()
        .command(['setup'])
        .it('prints an error if custom mvn path is not set', () => expectTaskError());
    });
  });
});

describe('already installed', () => {
  test
    .stdout()
    .command(['setup', '--configFile', 'test/__fixtures__/et-installed'])
    .it('print merged config if already stalled', (ctx: any) => {
      jestExpect(ctx.stdout).toMatchSnapshot();
    });
});
