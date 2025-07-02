import { useContext } from "react";
import { authContext } from "./authenticatecontext";

export const useAuth = () => {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
