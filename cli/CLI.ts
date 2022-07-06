import { LogProvider } from '@core/providers/LogProvider';

import { CLIProvider } from '@cli/providers/CLIProvider';

const NAME = 'Key Val Store CLI';

export class CLI {
  private cliLog: LogProvider = new LogProvider(NAME);

  constructor(private cliProv: CLIProvider) {}

  async run(): Promise<boolean> {
    try {
      const resp = await this.cliProv[args[args.length - 2]](JSON.parse(args[args.length - 1]));
      
      this.cliLog.info(`Current response object for method ${args[args.length - 2]}`);
      this.cliLog.debug(JSON.stringify(resp, null, 2));

      return true;
    } catch (err) {
      throw err;
    }
  }
}

const args = process.argv;
if (args.length !== 7) throw new Error('Incorrect arguments provided');

const cli = new CLIProvider(args[args.length - 4], parseInt(args[args.length - 3]));

new CLI(cli)
  .run()
  .then( resp => console.log(resp))
  .catch( err => console.log(err));