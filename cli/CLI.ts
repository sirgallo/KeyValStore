import '../modAlias';

import { CLIProvider } from '@cli/providers/CLIProvider';

export class CLI {
  constructor(private cliProv: CLIProvider) {}

  async run(): Promise<boolean> {
    try {
      const resp = await this.cliProv[args[6].toLocaleLowerCase()](JSON.parse(args[7]));
      
      console.log('Current response object for method', args[6]);
      console.log(JSON.stringify(resp, null, 2));

      return true;
    } catch (err) {
      throw err;
    }
  }
}

const args = process.argv;
if (args.length !== 8) throw new Error('Incorrect arguments provided');

const cli = new CLIProvider(args[4], parseInt(args[5]));

new CLI(cli)
  .run()
  .then( resp => console.log(resp))
  .catch( err => console.log(err));