import React, { useState } from "react";
import { addNote } from "../services/noteService";

type Props = {
  onClose: () => void;
  onNoteAdded: () => void;
};

const AddNote: React.FC<Props> = ({ onClose, onNoteAdded }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const colors = [
    "bg-yellow-200",
    "bg-orange-200",
    "bg-green-200",
    "bg-blue-200",
    "bg-purple-200",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    await addNote({ title, body, color: randomColor });
    setTitle("");
    setBody("");
    onNoteAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-[1000] px-2 sm:px-0">
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">
          Add Note
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 sm:p-3 mb-3 rounded-lg text-sm sm:text-base bg-white/90 shadow-inner text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <textarea
            placeholder="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="resize-y h-[100px] w-full p-2 sm:p-3 mb-3 rounded-lg text-sm sm:text-base bg-white/90 shadow-inner text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <div className="flex flex-col sm:flex-row justify-center gap-2 mt-4">
            <button
              type="submit"
              className="w-full sm:flex-1 px-3 py-2 text-white text-sm sm:text-base rounded-md transition-transform hover:scale-105 bg-green-600 hover:bg-green-700"
            >
              Add
            </button>
            <button
              type="button"
              className="w-full sm:flex-1 px-3 py-2 text-white text-sm sm:text-base rounded-md transition-transform hover:scale-105 bg-gray-500 hover:bg-gray-600"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNote;
