'use client';
import React from 'react';
import { Input } from '@/components/ui/input';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import { Textarea } from '@/components/ui/textarea';
import Button from '@/components/atoms/form/Button';
import ImageUpload from '@/components/atoms/form/ImageInput';
import { useRouter } from 'next/navigation';
import { createSpace } from '@/lib/actions/spaces/create-space';
import { toast } from 'sonner';
import { DatePicker } from '@/components/atoms/form/Date-Picker';
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

const spaceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description is too long'),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater').max(100000, 'Price seems too high'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 minute').max(1440, 'Duration cannot exceed 24 hours'),
  eventDate: z.date({ required_error: 'Event date is required' }),
  eventTime: z.string().min(1, 'Event time is required'),
});

const SpaceCreateForm = ({ onSpaceCreated }) => {
    const router = useRouter();

    const form = useForm({
      resolver: zodResolver(spaceSchema),
      defaultValues: { title: '', description: '', category: '', price: '', duration: '', eventDate: null, eventTime: '' },
    });

    const [thumbnail, setThumbnail] = React.useState(null);
    const [thumbnailError, setThumbnailError] = React.useState('');

    const handleThumbnailChange = (e) => {
      const f = e.target.files[0];
      if (f) {
        const result = validateFile(f, { maxSize: 5 * 1024 * 1024, allowedTypes: ['image/*'] });
        if (!result.valid) { setThumbnailError(result.error); setThumbnail(null); return; }
      }
      setThumbnailError('');
      setThumbnail(f || null);
    };

    const onSubmit = async (data) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('price', String(data.price));
      formData.append('duration', String(data.duration));
      formData.append('eventDate', data.eventDate ? data.eventDate.toISOString() : '');
      formData.append('eventTime', data.eventTime);

      if (thumbnail) formData.append('thumbnail', thumbnail);

      try {
        const result = await createSpace(formData);

        if (result.success) {
          toast.success('Space created successfully');
          if (onSpaceCreated) onSpaceCreated();
          setTimeout(() => {
            router.push(`/dashboard/spaces/${result.space._id}`);
          }, 2000);
        } else {
          toast.error(result.message || 'Unknown error');
        }
      } catch (error) {
        toast.error(error?.message || 'Something went wrong!');
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-xs sm:w-lg mx-auto rounded-xl p-1 space-y-3">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input placeholder="Space Title" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea placeholder="Space Description" className="w-full h-24 resize-none overflow-y-auto" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl><Input placeholder="Category (e.g., Fiqh, Aqeedah)" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="price" render={({ field }) => (
            <FormItem>
              <FormLabel>Price (USDC)</FormLabel>
              <FormControl><Input type="number" min={0} step="0.01" placeholder="0.00" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Controller control={form.control} name="eventDate" render={({ field }) => (
            <FormItem>
              <FormLabel>Event Date</FormLabel>
              <FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Controller control={form.control} name="eventTime" render={({ field }) => (
            <FormItem>
              <FormLabel>Event Time</FormLabel>
              <FormControl>
                <TimePicker onChange={field.onChange} value={field.value} disableClock className="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="duration" render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl><Input type="number" min={1} placeholder="Duration in minutes" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="my-4">
            <FormLabel htmlFor="space-thumbnail">Upload Thumbnail Image</FormLabel>
            <ImageUpload id="space-thumbnail" image={thumbnail} onChange={handleThumbnailChange} />
            {thumbnailError && <p className="text-sm text-destructive mt-1">{thumbnailError}</p>}
          </div>

          <Button
            round wide
            loading={form.formState.isSubmitting}
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full bg-accent hover:bg-highlight transition"
          >
            Create Space
          </Button>
        </form>
      </Form>
    );
};

export default SpaceCreateForm;
