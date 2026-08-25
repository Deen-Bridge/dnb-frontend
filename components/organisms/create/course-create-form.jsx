"use client";
import React from "react";
import VideoUpload from "@/components/atoms/form/VideoUpload";
import { Textarea } from "@/components/ui/textarea";
import Button from "@/components/atoms/form/Button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import ImageUpload from "@/components/atoms/form/ImageInput";
import { toast } from "sonner";
import { createCourse } from "@/lib/actions/courses/create-course";
import CategoryCombobox from "@/components/atoms/form/ComboBox";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { Progress } from "@/components/ui/progress";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { validateFile } from "@/lib/utils/cloudinaryUpload";

const courseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().min(1, "Description is required").max(5000, "Description is too long"),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0, "Price must be 0 or greater").max(100000, "Price seems too high"),
});

const CreateCourseForm = () => {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: { title: "", description: "", category: "", price: "" },
  });

  const [thumbnail, setThumbnail] = React.useState(null);
  const [video, setVideo] = React.useState(null);

  const thumbnailUpload = useCloudinaryUpload("dnb_courses_thumbnails", {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ["image/*"],
  });

  const videoUpload = useCloudinaryUpload("dnb_courses_videoss", {
    maxSize: 100 * 1024 * 1024,
    allowedTypes: ["video/*"],
  });

  const handleThumbnailChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      const result = validateFile(f, { maxSize: 5 * 1024 * 1024, allowedTypes: ["image/*"] });
      if (!result.valid) { toast.error(result.error); setThumbnail(null); return; }
    }
    setThumbnail(f || null);
  };

  const handleVideoChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      const result = validateFile(f, { maxSize: 100 * 1024 * 1024, allowedTypes: ["video/*"] });
      if (!result.valid) { toast.error(result.error); setVideo(null); return; }
    }
    setVideo(f || null);
  };

  const onSubmit = async (data) => {
    try {
      let thumbnailUrl = null;
      let videoUrl = null;

      if (thumbnail) {
        toast.info("Uploading thumbnail...");
        thumbnailUrl = await thumbnailUpload.uploadFile(thumbnail);
      }

      if (video) {
        toast.info("Uploading video... This may take a while.");
        videoUrl = await videoUpload.uploadFile(video);
      }

      const result = await createCourse({
        form: data,
        thumbnailUrl,
        videoUrl,
      });

      if (result && result.success) {
        toast.success("Course created successfully!");
        router.push(`/dashboard/courses/${result.course._id}`);
      } else {
        toast.error(result?.message || "Failed to create course.");
      }
    } catch (error) {
      toast.error(error?.message || "An error occurred while creating the course.");
    } finally {
      thumbnailUpload.reset();
      videoUpload.reset();
    }
  };

  const isUploading = thumbnailUpload.uploading || videoUpload.uploading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-sm sm:w-lg mx-auto rounded-xl p-1 space-y-3">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Course title</FormLabel>
            <FormControl><Input placeholder="Course Title" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Course description</FormLabel>
            <FormControl><Textarea placeholder="Course Description" className="w-full h-24 resize-none overflow-y-auto" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Controller control={form.control} name="category" render={({ field }) => (
          <FormItem>
            <FormLabel>Course Category</FormLabel>
            <FormControl>
              <CategoryCombobox id="course-category" category={field.value} setCategory={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="price" render={({ field }) => (
          <FormItem>
            <FormLabel>Course price (USDC)</FormLabel>
            <FormControl><Input type="number" min={0} step="0.01" placeholder="0.00" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="my-4">
          <FormLabel htmlFor="course-thumbnail">Upload Course Thumbnail Image</FormLabel>
          <ImageUpload id="course-thumbnail" image={thumbnail} onChange={handleThumbnailChange} />
          {thumbnailUpload.uploading && (
            <div className="mt-2 space-y-1">
              <Progress value={thumbnailUpload.progress} className="h-2" />
              <p className="text-xs text-muted-foreground">Uploading thumbnail: {thumbnailUpload.progress}%</p>
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="course-video">Upload Course Video</FormLabel>
          <VideoUpload id="course-video" video={video} onChange={handleVideoChange} />
          {videoUpload.uploading && (
            <div className="mt-2 space-y-1">
              <Progress value={videoUpload.progress} className="h-2" />
              <p className="text-xs text-muted-foreground">Uploading video: {videoUpload.progress}%</p>
            </div>
          )}
        </div>

        <Button
          loading={form.formState.isSubmitting || isUploading}
          round wide
          type="submit"
          disabled={form.formState.isSubmitting || isUploading}
          className="w-full bg-accent hover:bg-highlight transition"
        >
          {thumbnailUpload.uploading
            ? "Uploading Thumbnail..."
            : videoUpload.uploading
            ? `Uploading Video... ${videoUpload.progress}%`
            : form.formState.isSubmitting
            ? "Creating Course..."
            : "Create Course"}
        </Button>
      </form>
    </Form>
  );
};
export default CreateCourseForm;