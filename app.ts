import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { addNote, listNotes, readByTitle, removeFromList } from './notes';

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
  .command({
    command: 'list',
    describe: 'List all notes',
    handler() {
        listNotes();
    }
  })
  .command({
    command: 'read',
    describe: 'Read a note by Title',
    builder: {
        title: {
            describe: 'Note title',
            demandOption: true,
            type: 'string',
        }
    },
    handler(argv) {
        if (typeof argv.title==='string') {
            readByTitle(argv.title);
        }
    }
  })
  .command({
    command: 'remove',
    describe: 'Remove note from list',
    builder: {
        title: {
            describe: 'Note title',
            demandOption: true,
            type: 'string',
        }
    },
    handler(argv) {
        if (typeof argv.title==='string') {
            removeFromList(argv.title);
        }
    }
  })
  .parse();