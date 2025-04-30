"use client"

import { useState } from "react";

const usePasswordMatch = () => {
  const [passwordError, setPasswordError] = useState("");

  const checkPasswords = (password, confirmPassword) => {
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