import { flags } from '@oclif/command';

import { EtCommand, EtFlags, EtContext } from '../base';

interface HelloFlags extends EtFlags {
  name: string;
}

export default class Hello extends EtCommand<HelloFlags> {
  static description = 'describe the command here';

  static examples = [
    `$ et hello
hello world from ./src/hello.ts!
`,
  ];

  static flags = {
    ...EtCommand.flags,
    name: flags.string({ char: 'n', description: 'name to print' }),
  };

  static args = [{ name: 'file' }];

  async run() {
    this.log('before run');
    this.runTask(async (ctx: EtContext<HelloFlags>) => {
      const { flags, args } = ctx;
      this.log('ctx from hello', ctx);

      const name = flags.name || 'world';
      this.log(`hello ${name} from ./src/commands/hello.ts${args.file ? ` - file: ${args.file}` : ''}`);
    });
  }
}
