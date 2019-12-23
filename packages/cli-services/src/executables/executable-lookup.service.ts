import { ExecutableLookup } from './executable-lookup';
import { Executable } from './executable';

export interface ExecutableLookupService {
  create(exec: string, path: string): Executable;
  lookup(exec: string): Promise<Executable[]>;
  register(exec: string, lookup: ExecutableLookup): void;
}

export class ExecutableLookupService implements ExecutableLookupService {
  private lookups = new Map<string, ExecutableLookup>();

  create(exec: string, path: string): Executable {
    const lookup = this.lookups.get(exec);
    if (!lookup) {
      throw new Error(`Failed to create executable ${exec} with path ${path}. No executable lookup defined for ${exec}.`);
    }
    return lookup.createExecutable(path);
  }

  async lookup(exec: string): Promise<Executable[]> {
    const lookup = this.lookups.get(exec);
    if (!lookup) {
      return Promise.resolve([]);
    }
    return lookup.resolve();
  }

  register(exec: string, lookup: ExecutableLookup): void {
    this.lookups.set(exec, lookup);
  }
}
