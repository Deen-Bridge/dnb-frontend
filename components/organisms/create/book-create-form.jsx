'use client';
import React from 'react';
import FileUpload from '@/components/atoms/form/FileInput';
import { Textarea } from '@/components/ui/textarea';
import Button from '@/components/atoms/form/Button';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import ImageUpload from '@/components/atoms/form/ImageInput';
import { createBook } from '@/lib/actions/library/create-book';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { validateFile } from '@/lib/utils/cloudinaryUpload';

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description is too long'),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater').max(100000, 'Price seems too high'),
});

const BookCreateForm = ({ onBookCreated }) => {
    const router = useRouter();

    const form = useForm({
      resolver: zodResolver(bookSchema),
      defaultValues: { title: '', description: '', category: '', price: '' },
    });

    const [thumbnail, setThumbnail] = React.useState(null);
    const [file, setFile] = React.useState(null);
    const [thumbnailError, setThumbnailError] = React.useState('');
    const [fileError, setFileError] = React.useState('');

    const handleThumbnailChange = (e) => {
      const f = e.target.files[0];
      if (f) {
        const result = validateFile(f, { maxSize: 5 * 1024 * 1024, allowedTypes: ['image/*'] });
        if (!result.valid) { setThumbnailError(result.error); setThumbnail(null); return; }
      }
      setThumbnailError('');
      setThumbnail(f || null);
    };

    const handleFileChange = (e) => {
      const f = e.target.files[0];
      if (f) {
        const result = validateFile(f, { maxSize: 100 * 1024 * 1024 });
        if (!result.valid) { setFileError(result.error); setFile(null); return; }
      }
      setFileError('');
      setFile(f || null);
    };

    const onSubmit = async (data) => {
      try {
        const payload = await createBook({ form: data, thumbnail, file });
        if (payload.success) {
          toast.success('Book created successfully');
          if (onBookCreated) onBookCreated();
          setTimeout(() => {
            router.push(`/dashboard/library/${payload.book._id}`);
          }, 2000);
        } else {
          toast.error(payload.message || 'Book creation failed');
        }
      } catch (error) {
        toast.error(error?.message || 'Something went wrong!');
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-sm sm:w-lg mx-auto rounded-xl p-1 space-y-3">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel>Book title</FormLabel>
              <FormControl><Input placeholder="Book Title" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Book description</FormLabel>
              <FormControl><Textarea placeholder="Book Description" className="w-full h-24 resize-none overflow-y-auto" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Book Category</FormLabel>
              <FormControl><Input placeholder="Category (e.g., Aqeedah)" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="price" render={({ field }) => (
            <FormItem>
              <FormLabel>Book price (USDC)</FormLabel>
              <FormControl><Input type="number" min={0} step="0.01" placeholder="0.00" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="my-4">
            <FormLabel>Upload Book Thumbnail Image</FormLabel>
            <ImageUpload id="book-thumbnail" image={thumbnail} onChange={handleThumbnailChange} />
            {thumbnailError && <p className="text-sm text-destructive mt-1">{thumbnailError}</p>}
          </div>

          <div>
            <FormLabel>Upload Book File</FormLabel>
            <FileUpload id="book-file" file={file} onChange={handleFileChange} />
            {fileError && <p className="text-sm text-destructive mt-1">{fileError}</p>}
          </div>

          <Button
            round wide
            loading={form.formState.isSubmitting}
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full bg-accent hover:bg-highlight transition"
          >
            Create Book
          </Button>
        </form>
      </Form>
    );
};
export default BookCreateForm;
