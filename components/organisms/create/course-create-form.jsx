"use client";
import React, { useState } from "react";
import VideoUpload from "@/components/atoms/form/VideoUpload";
import { Textarea } from "@/components/ui/textarea";
import Button from "@/components/atoms/form/Button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUpload from "@/components/atoms/form/ImageInput";
import { toast } from "sonner";
import { createCourse } from "@/lib/actions/courses/create-course";
import CategoryCombobox from "@/components/atoms/form/ComboBox";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { Progress } from "@/components/ui/progress";

const CreateCourseForm = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
  });

  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);

  const thumbnailUpload = useCloudinaryUpload("dnb_courses_thumbnails", {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/*"],
  });

  const videoUpload = useCloudinaryUpload("dnb_courses_videoss", {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ["video/*"],
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
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

      const data = await createCourse({
        form,
        thumbnailUrl,
        videoUrl,
        category: form.category,
      });

      if (data && data.success) {
        toast.success("Course created successfully!");
        router.push(`/dashboard/courses/${data.course._id}`);
      } else {
        toast.error(data?.message || "Failed to create course.");
      }
    } catch (error) {
      toast.error(
        error?.message || "An error occurred while creating the course."
      );
    } finally {
      setLoading(false);
      thumbnailUpload.reset();
      videoUpload.reset();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-sm sm:w-lg mx-auto  rounded-xl p-1 space-y-3"
    >
      <Label htmlFor="title">Course title</Label>
      <Input
        id="title"
        name="title"
        placeholder="Course Title"
        value={form.title}
        onChange={handleChange}
        required
      />
      <Label htmlFor="description">Course description</Label>
      <Textarea
        id="description"
        name="description"
        placeholder="Book Description"
        value={form.description}
        onChange={handleChange}
        required
        className="w-full h-24 resize-none overflow-y-auto"
      />
      <Label htmlFor="category">Course Category</Label>
      <CategoryCombobox
        id="category"
        category={form.category}
        setCategory={(value) =>
          setForm((prev) => ({ ...prev, category: value }))
        }
      />
      <Label htmlFor="price">Course price</Label>
      <Input
        id="price"
        name="price"
        type="number"
        placeholder="Price (₦)"
        value={form.price}
        onChange={handleChange}
        required
      />

      <div className="my-4">
        <Label htmlFor="thumbnail" className="block mb-1 text-sm font-medium">
          Upload Course Thumbnail Image
        </Label>
        <ImageUpload
          id="thumbnail"
          image={thumbnail}
          onChange={(e) => setThumbnail(e.target.files[0])}
        />
        {thumbnailUpload.uploading && (
          <div className="mt-2 space-y-1">
            <Progress value={thumbnailUpload.progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Uploading thumbnail: {thumbnailUpload.progress}%
            </p>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="file" className="block mb-1 text-sm font-medium">
          Upload Course video
        </Label>
        <VideoUpload
          id="file"
          video={video}
          onChange={(e) => setVideo(e.target.files[0])}
        />
        {videoUpload.uploading && (
          <div className="mt-2 space-y-1">
            <Progress value={videoUpload.progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Uploading video: {videoUpload.progress}%
            </p>
          </div>
        )}
      </div>

      <Button
        loading={loading || thumbnailUpload.uploading || videoUpload.uploading}
        round
        wide
        type="submit"
        disabled={loading || thumbnailUpload.uploading || videoUpload.uploading}
        className="w-full bg-accent hover:bg-highlight transition"
      >
        {thumbnailUpload.uploading
          ? "Uploading Thumbnail..."
          : videoUpload.uploading
          ? `Uploading Video... ${videoUpload.progress}%`
          : loading
          ? "Creating Course..."
          : "Create Course"}
      </Button>
    </form>
  );
};
export default CreateCourseForm;