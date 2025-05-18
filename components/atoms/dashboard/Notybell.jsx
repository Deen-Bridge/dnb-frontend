// components/atoms/dashboard/Notybell.jsx
"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCircle, MessageCircle, Calendar, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/components/molecules/Modal";

const mockNotifications = [
    {
        id: 1,
        type: "course",
        title: "New lesson available",
        description: "Your course “Mastering React” has a new module: Hooks Deep Dive.",
        time: "2h ago",
    },
    {
        id: 2,
        type: "message",
        title: "New message from Ali",
        description: "Ali: “Salaam! Are you ready for tomorrow’s live session?”",
        time: "4h ago",
    },
    {
        id: 3,
        type: "reminder",
        title: "Upcoming session",
        description: "Your 1:1 call with Sheikh Azeem starts in 30 minutes.",
        time: "1d ago",
    },
];

const iconMap = {
    course: <CheckCircle className="w-5 h-5 text-accent" />,
    message: <MessageCircle className="w-5 h-5 text-green-400" />,
    reminder: <Calendar className="w-5 h-5 text-yellow-400" />,
};

export default function Notybell() {
    const [open, setOpen] = useState(false);
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        // replace with real fetch later
        setNotes(mockNotifications);
    }, []);

    return (
        <>
            <div
                className="relative p-2 rounded-full hover:bg-highlight/20 bg-accent/10 transition cursor-pointer"
                onClick={() => setOpen(true)}
            >
                <Bell size={20} className="text-highlight hover:text-black" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            </div>

            <AnimatePresence>
                {open && (
                    <Modal
                        isOpen={open}
                        onClose={() => setOpen(false)}
                        title="Notifications"
                        className="max-w-md w-full"
                    >
                        <div className="space-y-4">
                            {notes.map((n) => (
                                <motion.div
                                    key={n.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex justify-center items-start gap-3 p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition"
                                >
                                    <div className="flex-shrink-0 pt-4">{iconMap[n.type]}</div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold">{n.title}</h4>
                                        <p className="text-sm ">{n.description}</p>
                                    </div>
                                    <span className="text-xs ">{n.time}</span>
                                </motion.div>
                            ))}

                            {notes.length === 0 && (
                                <p className="text-center text-sm text-white/70">
                                    You’re all caught up!
                                </p>
                            )}
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </>
    );
}
