import "./index.css";
import ListNotes from "./components/ListNotes";
import Login from "./components/Login";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { logoutUser, isTokenExpired } from "./services/noteService";

interface JwtPayload {
  username: string;
  exp: number;
  iat?: number;
}

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const username = localStorage.getItem("username");

  const autoLogout = (token: string) => {
    const decoded = jwtDecode<JwtPayload>(token);
    const expiryTime = decoded.exp * 1000;
    const timeLeft = expiryTime - Date.now();

    setTimeout(() => {
      handleLogout();
      alert("Session expired. You have been logged out.");
    }, timeLeft);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !isTokenExpired(token)) {
      setAuthenticated(true);
      autoLogout(token);
    } else {
      setAuthenticated(false);
      localStorage.removeItem("token");
      localStorage.removeItem("username");
    }
  }, []);

  const handleLogout = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).finally(() => {
      logoutUser();
      setAuthenticated(false);
    });
  };

  if (!authenticated) {
    return (
      <Login
        onLogin={() => {
          setAuthenticated(true);
          const token = localStorage.getItem("token");
          if (token) autoLogout(token);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b bg-white shadow-sm gap-2 sm:gap-0">
        <p className="text-sm sm:text-base text-gray-700">
          Logged in as{" "}
          <span className="font-bold text-purple-700">{username}</span>
        </p>
        <button
          onClick={handleLogout}
          className="text-sm sm:text-base px-4 py-2 rounded bg-purple-600 sm:bg-red-600 text-white hover:bg-purple-700 sm:hover:bg-red-700 transition-all"
        >
          Logout
        </button>
      </div>

      <div className="px-2 sm:px-8">
        <ListNotes />
      </div>
    </div>
  );
}

export default App;
