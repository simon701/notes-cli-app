import { createContext, useState } from "react";
import type { ReactNode } from "react";

type authenticatedCont = {
  authenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  username: string | null;
};

export const authContext = createContext<authenticatedCont | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const username = localStorage.getItem("username");

  return (
    <authContext.Provider value={{ authenticated, setAuthenticated, username }}>
      {children}
    </authContext.Provider>
  );
};
