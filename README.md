# Notes CLI App  
A simple command-line application built with TypeScript and Node.js that allows users to manage notes from the terminal.

## Description  
The **Notes CLI Application** enables users to add, list, read, and remove notes using terminal commands. Notes are saved locally in a JSON file which makes it a lightweight and fast tool for quick note taking and retrieval.

This web app was built using **TypeScript** which allows for static typing, improved code reliability, and better developer tooling such as IntelliSense and compile-time error checking. TypeScript also helps in organizing large codebases and maintaining clean, scalable architecture.

It also uses **Node.js** a fast and efficient JavaScript runtime that enables server-side scripting and file system operations. Node.js is ideal for building command-line tools allowing this app to read, write, and manage notes seamlessly in a local environment.

## How to run the app locally:  
Follow the following steps to be able to run the project locally:

1. **Download Node.js**  
   First to be able to run the application you will need to have Node.js installed on your machine you can download it here: [Node.js](https://nodejs.org/) make sure you download version 18 or later.  
2. **Clone the repository**  
    Open your terminal and run the following command:
    ```bash
    git clone https://github.com/simon701/notes-cli-app
    ```
    This command will create a local copy of the project on your machine in a folder named User-List-App
3. **Navigate to the project directory**  
    ```bash
    cd notes-cli-app
    ```
4. **Install the dependencies**  
   Run the following command in the project directory to install all required packages:
   ```bash
   npm install
   ```
   This will download everything specified in the *package.json*, such as TypeScript, Yargs, and other tools needed to run the app.
5. **Done!**  
   Once everything is installed you will now be able to run the application in your terminal by running the following command:
   ```bash
   npx ts-node app.ts <command>
   ```
   Here's a list of commands you can run:
   | **Command** | **Description** |
   |-------------|-----------------|
   |    'add'    |  Add a new note |
   |    'list'   |  List all notes |
   |    'read'   |  Read a note by title |
   |   'remove'  |  Remove a note by title |

## Example usage  
```bash
npx ts-node app.ts add --title="Goals" --body="Finish the TypeScript project" //Adds a note
npx ts-node app.ts list //List all notes basically shows all the notes that are saved in notes.json
npx ts-node app.ts read --title="Goals" //Read a note by title in this case "Goals"
npx ts-node app.ts remove --title="Goals" //Remove a note by title in this case "Goals"
```

## Screenshots  

*The screenshot below shows how a user can add a new note titled "Groceries" and then list all saved notes using the CLI app. Each note is displayed with a title and body, styled for easy readability.*
![Image](https://github.com/user-attachments/assets/ee33d471-b05a-4501-bbff-f01025c10fb0)

*The screenshot below demonstrates how to read and remove a note using the CLI commands.*
![Image](https://github.com/user-attachments/assets/285a9566-4871-4e02-a52d-1f73d11a4489)

## Future Improvements  

- Support for note editing
- Add timestamps for created notes
- Allow note categories/tags