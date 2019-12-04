import { test } from '@oclif/test';
const normalizeNewline = require('normalize-newline');

import { taskError } from '../../../src/tasks/error-tasks';
import { Tasks } from '../../../src/tasks/setup-tasks';
import { detectJavaPath, tryWhich } from '../../../src/utils/detect-utils';
import { checkPathExists, findLinkedFile } from '../../../src/utils/file-utils';
import { getGitVersion, getJavaVersion, getMavenVersion } from '../../../src/utils/version-utils';
import { jestExpect, mockListerLog } from '../../__mocks__';

mockListerLog();
jest.mock('listr-inquirer');
jest.mock('listr-verbose-renderer/lib/utils');
jest.mock('../../../src/utils/detect-utils');
jest.mock('../../../src/utils/file-utils');
jest.mock('../../../src/utils/version-utils');
jest.mock('../../../src/tasks/setup-tasks');
jest.mock('../../../src/tasks/error-tasks');

const actualCheckPathExists = jest.requireActual('../../../src/utils/file-utils').checkPathExists;
checkPathExists.mockImplementation((path: string) => actualCheckPathExists(path));

function mockChoices(index: number) {
  Tasks.choice.mockImplementation((_message: string, choices: string[], next: (path: string) => Promise<void>) => next(choices[index]));
}

function mockTryWhich(...includes: string[]) {
  tryWhich.mockImplementation(async (name: string) => includes.includes(name) ? `${name}.which` : null);
}

function mockCustomPath(...ids: string[]) {
  Tasks.customPath.mockImplementation((confirmMsg: string,
                                       _pathLabel: string,
                                       next: (path: string) => Promise<void>) => {
    for (const id of ids) {
      if (confirmMsg.includes(id)) {
        return next(`/custom-path/${id}`);
      }
    }
    return next('/custom-path');
  });
}

function mockJavaPath(value: string | null) {
  detectJavaPath.mockImplementation(async () => value);
}

function expectTaskError() {
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
        jestExpect(normalizeNewline(ctx.stdout)).toMatchSnapshot();
      });

    test
      .do(() => mockChoices(1))
      .stdout()
      .command(['setup'])
      .it('can select absolute path from global installed git, java and mvn executables', (ctx: any) => {
        jestExpect(normalizeNewline(ctx.stdout)).toMatchSnapshot();
      });

    test
      .do(() => mockChoices(2))
      .stdout()
      .command(['setup'])
      .it('can select symlink resolved absolute path from global installed git, java and mvn executables', (ctx: any) => {
        jestExpect(normalizeNewline(ctx.stdout)).toMatchSnapshot();
      });

    test
      .do(() => mockTryWhich('git', 'mvn'))
      .stdout()
      .command(['setup'])
      .it('tries to find java-home when "which" command fails', (ctx: any) => {
        jestExpect(normalizeNewline(ctx.stdout)).toMatchSnapshot();
      });

    test
      .do(() => {
        mockTryWhich();
        mockJavaPath(null);
      })
      .stdout()
      .command(['setup'])
      .it('present option to set custom paths', (ctx: any) => {
        jestExpect(normalizeNewline(ctx.stdout)).toMatchSnapshot();
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
                                             error: () => Promise<void>) => {
          return error();
        });
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
