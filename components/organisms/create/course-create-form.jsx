'use client';
import React, { useState } from 'react';
import axios from 'axios';
import VideoUpload from '@/components/atoms/form/VideoUpload';
import { Textarea } from '@/components/ui/textarea';
import Button from '@/components/atoms/form/Button';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUpload from '@/components/atoms/form/ImageInput';
import { toast } from 'sonner';
import { createCourse } from '@/lib/actions/courses/create-course';
const CreateCourseForm = () => {
    const router = useRouter();
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
    });

    const [video, setVideo] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const data = await createCourse({ form, thumbnail, video });

    if (data && data.success) {
      toast.success("Course created successfully!");
    
      router.push(`/dashboard/courses/${data.course._id}`);
    } else {
      toast.error(data?.message || "Failed to create course.");
    }
  } catch (error) {
    toast.error(error?.message || "An error occurred while creating the course.");
  } finally {
    setLoading(false);
  }
};


    return (
        <form
            onSubmit={handleSubmit}
            className="w-sm sm:w-lg mx-auto  rounded-xl p-1 space-y-3"
        >
            <h2 className="text-2xl font-bold mb-4">Create a New Course</h2>
            <Label htmlFor="title">Course title</Label>
            <Input
                name="title"
                placeholder="Course Title"
                value={form.title}
                onChange={handleChange}
                required
            />
            <Label htmlFor="title">Course description</Label>
            <Textarea
                name="description"
                placeholder="Book Description"
                value={form.description}
                onChange={handleChange}
                required
                className="w-full h-24 resize-none overflow-y-auto"
            />
            <Label htmlFor="title">Course Category</Label>
            <Input
                name="category"
                placeholder="Category (e.g., Aqeedah)"
                value={form.category}
                onChange={handleChange}
                required
            />
            <Label htmlFor="title">Course price</Label>
            <Input
                name="price"
                type="number"
                placeholder="Price (₦)"
                value={form.price}
                onChange={handleChange}
                required
            />

            <div className="my-4">
                <Label id="thumbail" className="block mb-1 text-sm font-medium">Upload Course Thumbnail Image</Label>
                <ImageUpload id="thumbnail" image={thumbnail} onChange={(e) => setThumbnail(e.target.files[0])} />
            </div>

            <div>
                <Label id="file" className="block mb-1 text-sm font-medium">Upload Course video</Label>
                <VideoUpload id="file" video={video} onChange={(e) => setVideo(e.target.files[0])} />
            </div>


            <Button loading={loading} round wide type="submit" disabled={loading} className="w-full bg-accent hover:bg-highlight transition">
                Create Course
            </Button>
        </form>
    );
};
export default CreateCourseForm;
