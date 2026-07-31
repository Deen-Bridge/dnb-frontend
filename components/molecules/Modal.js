"use client";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Modal = ({ isOpen, onClose, children, title, className }) => (
  <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgb(0,0,0,0.25)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-[50%] top-[50%] z-50 w-full max-h-screen max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] flex flex-col bg-white rounded-lg shadow-lg sm:w-fit sm:h-fit data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200",
          className
        )}
      >
        <div className="flex justify-between items-center mb-2 px-4 sm:px-8 py-2 bg-accent rounded-t-lg">
          <DialogPrimitive.Title className="text-lg sm:text-2xl font-bold text-white">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close
            aria-label="Close"
            className="text-white hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-accent focus:ring-white rounded-sm"
          >
            <X size={25} />
          </DialogPrimitive.Close>
        </div>
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

export default Modal;
