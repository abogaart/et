export interface Executable {
  getName(): string;
  getPath(): string;
  getVersion(): Promise<string>;
}

export abstract class Executable implements Executable {
  private version: string | undefined;

  constructor(private name: string, private path: string) {
  }

  getName(): string {
    return this.name;
  }

  getPath(): string {
    return this.path;
  }

  async getVersion(): Promise<string> {
    if (this.version === undefined) {
      try {
        this.version = await this.parseVersion(this.path);
      } catch (ignore) {
        this.version = '';
      }
    }
    return this.version;
  }

  protected abstract async parseVersion(path: string): Promise<string>;
}
