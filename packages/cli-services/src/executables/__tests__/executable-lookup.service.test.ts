import { ExecutableLookupService, ExecutableLookup, Executable } from '..';

function mockExecutable(name: string, path: string, version: string): any {
  return {
    getName: jest.fn().mockReturnValue(name),
    getPath: jest.fn().mockReturnValue(path),
    getVersion: jest.fn().mockReturnValue(version),
  };
}

class MockExecutableLookup extends ExecutableLookup {
  createExecutable(path: string): Executable {
    return mockExecutable(this.name, path, `${path}-version`);
  }
}

describe('Executable Lookup Service class', () => {
  let brdLookup: ExecutableLookup;

  beforeEach(() => {
    brdLookup = new MockExecutableLookup('brd');
  });

  describe('create', () => {
    it('creates an executable', () => {
      const service = new ExecutableLookupService();
      service.register('brd', brdLookup);

      const exec = service.create('brd', 'brd-path');
      expect(exec).not.toBeNull();
      expect(exec.getName()).toBe('brd');
      expect(exec.getPath()).toBe('brd-path');
      expect(exec.getVersion()).toBe('brd-path-version');
    });

    it('throws an error if executable lookup is not found', () => {
      const service = new ExecutableLookupService();
      try {
        service.create('brd', 'brd-path');
        fail('Should have thrown an error');
      } catch (e) {
        expect(e.message).toMatchSnapshot();
      }
    });
  });

  describe('lookup', () => {
    it('looks up an executable', async () => {
      const exec1 = mockExecutable('brd', 'brd-path', 'brd-version');
      const exec2 = mockExecutable('brd2', 'brd2-path', 'brd2-version');

      brdLookup.resolve = jest.fn().mockReturnValue([exec1, exec2]);
      const service = new ExecutableLookupService();
      service.register('brd', brdLookup);

      const execs = await service.lookup('brd');
      expect(execs).toEqual([exec1, exec2]);
    });

    it('returns zero executables if no executable lookup found', async () => {
      const service = new ExecutableLookupService();
      const execs = await service.lookup('brd');

      expect(execs).toHaveLength(0);
    });
  });
});
