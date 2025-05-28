"use client";
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { poppins_700 } from "@/lib/config/font.config";
const Modal = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-[rgb(0,0,0,0.25)] flex items-center justify-center z-50 w-full p-0 sm:p-6">
      <div className="bg-white rounded-none sm:rounded-lg w-full h-full sm:w-fit sm:h-fit shadow-lg overscroll-y-auto overflow-y-auto flex flex-col max-h-screen">
        <div className="flex justify-between items-center mb-2 px-4 sm:px-8 py-2 bg-accent ">
          <h2
            className={cn(
              "text-lg sm:text-xl font-bold text-truncate text-white ",
              poppins_700.className
            )}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-accent focus:ring-white"
          >
            <X size={25} />
          </button>
        </div>
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default Modal;
