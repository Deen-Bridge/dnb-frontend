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
    <div className="fixed inset-0 bg-[rgb(0,0,0,0.25)] flex items-center p-6 justify-center z-50 w-full ">
      <div className="bg-white rounded-lg tablet:w-[434px] xxs:w-full shadow-lg">
        <div className="flex justify-between items-center mb-2 px-8 py-2">
          <h2
            className={cn(
              "text-xl font-bold text-truncate",
              poppins_700.className
            )}
          >
            {" "}
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={25} />
          </button>
        </div>
        <div className="border-b border-gray4"></div>
        <div className="p-6 ">{children}</div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default Modal;
