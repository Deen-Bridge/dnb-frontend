"use cleint";
import React from 'react';
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import Modal from '@/components/molecules/Modal';
const Notybell = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const handleClick = () => {
        setModalOpen(!modalOpen);
    }

    return (
        <>
            <div className="relative p-2 rounded-full hover:bg-accent/10 transition duration-300 cursor-pointer" onClick={handleClick}>
                <Bell size={22} className="text-accent" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            </div>
            <Modal isOpen={modalOpen}
                onClose={() => setModalOpen(false)} title="Notifications">
                <div>Notifications</div>
            </Modal>
        </>);
};

export default Notybell;
