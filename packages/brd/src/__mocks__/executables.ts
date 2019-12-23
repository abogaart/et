
import { ExecutableLookupService } from '@bloomreach/cli-services';

export function mockExecutable(name: string, path: string, version: string): any {
  return {
    getName: jest.fn().mockReturnValue(name),
    getPath: jest.fn().mockReturnValue(path),
    getVersion: jest.fn().mockReturnValue(version),
  };
}

export const mockExecutableLookupService: jest.Mock & ExecutableLookupService = {
  create: jest.fn()
    .mockImplementation((name: string, path: string) => mockExecutable(name, path, `${name}-custom-path-version`)),
  lookup: jest.fn(),
};

export const mockCliServices: jest.Mock = {
  get executableLookupService(): ExecutableLookupService {
    return mockExecutableLookupService;
  },
};

export function mockLookupExecutable(...execs): void {
  mockExecutableLookupService.lookup.mockImplementation((name: string) => {
    const r = execs.find((exec) => name === exec.name);
    return r ? r.execs : [];
  });
}
