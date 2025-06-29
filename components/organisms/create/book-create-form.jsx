'use client';
import React, { useState } from 'react';
import FileUpload from '@/components/atoms/form/FileInput';
import { Textarea } from '@/components/ui/textarea';
import Button from '@/components/atoms/form/Button';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUpload from '@/components/atoms/form/ImageInput';
import { createBook } from '@/lib/actions/library/create-book';
import { toast } from 'sonner';

const BookCreateForm = ({ onBookCreated }) => {
    const router = useRouter();
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
    });

    const [file, setFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await createBook({ form, thumbnail, file });
            if (data.success) {
                toast.success('Book created successfully');
                if (onBookCreated) onBookCreated();
                // Redirect to the book detail page
                setTimeout(() => {
                    router.push(`/dashboard/library/${data.book._id}`);
                }, 2000);
            } else {
                alert(data.message || 'Book creation failed');
            }
        } catch (error) {
            console.log(error);
            alert('Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-sm sm:w-lg mx-auto  rounded-xl p-1 space-y-3"
        >
            <Label htmlFor="title">Book title</Label>
            <Input
                name="title"
                placeholder="Book Title"
                value={form.title}
                onChange={handleChange}
                required
            />
            <Label htmlFor="title">Book description</Label>
            <Textarea
                name="description"
                placeholder="Book Description"
                value={form.description}
                onChange={handleChange}
                required
                className="w-full h-24 resize-none overflow-y-auto"
            />
            <Label htmlFor="title">Book Category</Label>
            <Input
                name="category"
                placeholder="Category (e.g., Aqeedah)"
                value={form.category}
                onChange={handleChange}
                required
            />
            <Label htmlFor="title">Book price</Label>
            <Input
                name="price"
                type="number"
                placeholder="Price (₦)"
                value={form.price}
                onChange={handleChange}
                required
            />

            <div className="my-4">
                <Label id="thumbail" className="block mb-1 text-sm font-medium">Upload Book Thumbnail Image</Label>
                <ImageUpload id="thumbnail" image={thumbnail} onChange={(e) => setThumbnail(e.target.files[0])} />
            </div>

            <div>
                <Label id="file" className="block mb-1 text-sm font-medium">Upload Book File</Label>
                <FileUpload id="file" file={file} onChange={(e) => setFile(e.target.files[0])} />
            </div>


            <Button round wide loading={loading} type="submit" disabled={loading} className="w-full bg-accent hover:bg-highlight transition">
                Create Book
            </Button>
        </form>
    );
};
export default BookCreateForm;
