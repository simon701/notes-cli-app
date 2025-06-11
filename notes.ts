import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const notesFilePath = path.join(__dirname, 'data', 'notes.json');
interface Note {
    title: string;
    body: string;
}

function loadNotes(): Note[] {
    try {
    const fileRead = fs.readFileSync(notesFilePath, "utf-8");
    return JSON.parse(fileRead);
    } catch (error) {
    return [];
    }
}

function saveNotes(notes: Note[]): void {
    fs.writeFileSync(notesFilePath,JSON.stringify(notes, null, 2));
}

export function addNote(title: string, body: string): void {
    const notes = loadNotes();
    const duplicateNote=notes.find((note)=>note.title===title);
    if (duplicateNote) {
        console.log("Note already exists!");
        return;
    }
    notes.push({ title, body });
    saveNotes(notes);
    console.log("Note added");
}

export function listNotes(): void {
    const notes=loadNotes();
    if (notes.length === 0) {
        console.log("No notes found.");
        return;
    }
    console.log(chalk.cyan("Your notes: "));
    notes.forEach((note, index) => {
        console.log(chalk.yellow(`${index+1}. ${note.title}`))
        console.log(chalk.white(`   ${note.body}`));
    });
}