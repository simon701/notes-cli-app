import http from 'http';
import { addNote, listNotes, readByTitle, removeFromList } from './notes';

const getRequest=(req: http.IncomingMessage): Promise<any>=> {
  return new Promise((resolve, reject) => {
    let body='';
    req.on('data', chunk => (body+=chunk));
    req.on('end', ()=>{
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
  });
};

const server=http.createServer(async (req, res) => {
  const url=req.url || '';
  const method=req.method || '';
  
  if (method==='GET' && url==='/notes') {
    const notes=listNotes();
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(notes));
    return;
  }

  if (method==='GET' && url.startsWith('/notes/')) {
    const title=decodeURIComponent(url.split('/notes/')[1]);
    const note=readByTitle(title);
    if (note) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(note));
    } else {
      res.writeHead(404, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({message: 'Note not found'}));
    }
    return;
  }
  if (method==='POST' && url==='/notes') {
    try {
      const {title, body} =await getRequest(req);
      addNote(title, body);
      res.writeHead(201, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({message: 'Note added'}));
    } catch (err) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({message: 'Invalid JSON body'}));
    }
    return;
  }

  if (method==='DELETE' && url.startsWith('/notes/')) {
    const title=decodeURIComponent(url.split('/notes/')[1]);
    const success=removeFromList(title);
    if (success) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ message: 'Note deleted' }));
    } else {
      res.writeHead(404, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({message: 'Note not found'}));
    }
    return;
  }
  res.writeHead(404, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({message: 'Route not found'}));
});

server.listen(3000, ()=>{
  console.log('Server is running on http://localhost:3000');
});
