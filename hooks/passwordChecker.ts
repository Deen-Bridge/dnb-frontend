"use client";

import { useState } from "react";

export interface PasswordMatchResult {
  passwordError: string;
  checkPasswords: (password?: string, confirmPassword?: string) => boolean;
}

const usePasswordMatch = (): PasswordMatchResult => {
  const [passwordError, setPasswordError] = useState<string>("");

  const checkPasswords = (password?: string, confirmPassword?: string): boolean => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    setPasswordError("");
    return true;
  };

  return { passwordError, checkPasswords };
};

export default usePasswordMatch;
