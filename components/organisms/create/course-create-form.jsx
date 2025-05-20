'use client';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import FileInput from '@/components/atoms/form/FileInput';
const CreateCourseForm = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
  });

  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('price', form.price);
      if (image) formData.append('image', image);
      if (video) formData.append('video', video);

      const res = await fetch('/api/courses/create', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        router.push('/courses');
      } else {
        alert(data.message || 'Course creation failed');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-muted rounded-xl p-6 shadow-md space-y-4"
    >
      <h2 className="text-2xl font-bold mb-4">Create a New Course</h2>
      <Input
        name="title"
        placeholder="Course Title"
        value={form.title}
        onChange={handleChange}
        required
      />
      <Textarea
        name="description"
        placeholder="Course Description"
        value={form.description}
        onChange={handleChange}
        required
      />
      <Input
        name="category"
        placeholder="Category (e.g., Programming)"
        value={form.category}
        onChange={handleChange}
        required
      />
      <Input
        name="price"
        type="number"
        placeholder="Price (₦)"
        value={form.price}
        onChange={handleChange}
        required
      />

      <div>
        <label className="block mb-1 text-sm font-medium">Upload Course Image</label>
        <FileInput type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Upload Course Video</label>
        <FileInput type="file" accept="video/*" onChange={(e) => setVideo(e.target.files[0])} />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating...' : 'Create Course'}
      </Button>
    </form>
  );
};

export default CreateCourseForm;
