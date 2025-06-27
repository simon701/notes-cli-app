import { useState } from "react";

function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        onLogin();
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 max-w-md mx-auto p-4 sm:p-6"
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-center">Login</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-center text-sm sm:text-base">
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Username"
        className="p-2 sm:p-3 border rounded text-sm sm:text-base"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="p-2 sm:p-3 border rounded text-sm sm:text-base"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        type="submit"
        className="bg-purple-700 text-white py-2 sm:py-3 text-sm sm:text-base rounded hover:bg-purple-800 transition-all"
      >
        Login
      </button>
    </form>
  );
}

export default Login;
