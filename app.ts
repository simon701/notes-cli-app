import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { addNote } from './notes';

yargs(hideBin(process.argv))
  .command({
    command: 'add',
    describe: 'Add a new note',
    builder: {
        title: {
            describe: 'Note title',
            demandOption: true,
            type: 'string',
        },
        body: {
            describe: 'Note body',
            demandOption: true,
            type: 'string',
        }
    },
    handler(argv) {
        if (typeof argv.title === 'string' && typeof argv.body === 'string') {
            addNote(argv.title, argv.body);
        }
    }
  })
  .parse();