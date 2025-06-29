'use client';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Button from '@/components/atoms/form/Button';
import ImageUpload from '@/components/atoms/form/ImageInput';
import { useRouter } from 'next/navigation';
import { createSpace } from '@/lib/actions/spaces/create-space'; // <-- implement this action
import { toast } from 'sonner';
import { DatePicker } from '@/components/atoms/form/Date-Picker'; // <-- import DatePicker


const SpaceCreateForm = ({ onSpaceCreated }) => {
    const router = useRouter();
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
        duration: '',
    });
    const [eventDate, setEventDate] = useState(null); // <-- use Date object for date picker
    const [thumbnail, setThumbnail] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("description", form.description);
            formData.append("category", form.category);
            formData.append("price", form.price);
            formData.append("duration", form.duration);
            formData.append("eventDate", eventDate ? eventDate.toISOString() : "");
            if (thumbnail) formData.append("thumbnail", thumbnail);

            console.log("Submitting space with FormData:");
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const data = await createSpace(formData); // pass true to indicate FormData

            console.log("Response from createSpace:", data);

            if (data.success) {
                toast.success('Space created successfully');
                if (onSpaceCreated) onSpaceCreated();
                setTimeout(() => {
                    router.push(`/dashboard/spaces/${data.space._id}`);
                }, 2000);
            } else {
                console.log("Space creation failed:", data.message || 'Unknown error');
            }
        } catch (error) {
            console.log("Error in handleSubmit:", error);
            alert('Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-xs sm:w-lg mx-auto rounded-xl p-1 space-y-3"
        >
            <Label htmlFor="title">Title</Label>
            <Input
                name="title"
                placeholder="Space Title"
                value={form.title}
                onChange={handleChange}
                required
            />
            <Label htmlFor="description">Description</Label>
            <Textarea
                name="description"
                placeholder="Space Description"
                value={form.description}
                onChange={handleChange}
                required
                className="w-full h-24 resize-none overflow-y-auto"
            />
            <Label htmlFor="category">Category</Label>
            <Input
                name="category"
                placeholder="Category (e.g., Fiqh, Aqeedah)"
                value={form.category}
                onChange={handleChange}
                required
            />
            <Label htmlFor="price">Price</Label>
            <Input
                name="price"
                type="number"
                placeholder="Price ($)"
                value={form.price}
                onChange={handleChange}
                min={0}
                required
            />
            <Label htmlFor="eventDate">Event Date</Label>
            <DatePicker value={eventDate} onChange={setEventDate} /> {/* <-- Use DatePicker here */}
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
                name="duration"
                type="number"
                placeholder="Duration in minutes"
                value={form.duration}
                onChange={handleChange}
                min={1}
                required
            />
            <div className="my-4">
                <Label className="block mb-1 text-sm font-medium">Upload Thumbnail Image</Label>
                <ImageUpload id="thumbnail" image={thumbnail} onChange={(e) => setThumbnail(e.target.files[0])} />
            </div>
            <Button round wide loading={loading} type="submit" disabled={loading} className="w-full bg-accent hover:bg-highlight transition">
                Create Space
            </Button>
        </form>
    );
};

export default SpaceCreateForm;