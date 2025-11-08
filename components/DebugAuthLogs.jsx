"use client";
import { useState, useEffect } from "react";

export default function DebugAuthLogs() {
  const [logs, setLogs] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const authLogs =
        sessionStorage.getItem("authDebugLogs") || "No logs found";
      setLogs(authLogs);
    }
  }, []);

  const clearLogs = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("authDebugLogs");
      setLogs("Logs cleared");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600"
      >
        {isOpen ? "Hide" : "Show"} Auth Debug Logs
      </button>

      {isOpen && (
        <div className="mt-2 bg-gray-900 text-green-400 p-4 rounded-lg shadow-xl w-96 max-h-96 overflow-auto font-mono text-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-bold">Authentication Debug Logs</h3>
            <button
              onClick={clearLogs}
              className="text-red-400 hover:text-red-300 text-xs"
            >
              Clear
            </button>
          </div>
          <pre className="whitespace-pre-wrap">{logs}</pre>
        </div>
      )}
    </div>
  );
}
