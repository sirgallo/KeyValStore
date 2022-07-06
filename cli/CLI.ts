import { CLIProvider } from '@cli/providers/CLIProvider';

export class CLI {
  constructor(private cliProv: CLIProvider) {}

  async run(): Promise<boolean> {
    try {
      const resp = await this.cliProv[args[args.length - 2].toLocaleLowerCase()](JSON.parse(args[args.length - 1]));
      
      console.log('Current response object for method', args[args.length - 2]);
      console.log(JSON.stringify(resp, null, 2));

      return true;
    } catch (err) {
      throw err;
    }
  }
}

const args = process.argv;
console.log(args.length);
if (args.length !== 7) throw new Error('Incorrect arguments provided');

const cli = new CLIProvider(args[args.length - 4], parseInt(args[args.length - 3]));

new CLI(cli)
  .run()
  .then( resp => console.log(resp))
  .catch( err => console.log(err));