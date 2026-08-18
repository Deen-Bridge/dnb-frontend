"use client";
import React from "react";
import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import ImageUpload from "@/components/atoms/form/ImageInput";
import VideoUpload from "@/components/atoms/form/VideoUpload";
import { Info, Film } from "lucide-react";

export default function WizardStepMedia({ control, errors, watch }) {
  const lessons = watch("lessons") || [];

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h3 className="text-xl font-bold mb-1">Course Media</h3>
        <p className="text-sm text-muted-foreground">
          Upload cover image and select lesson videos.
        </p>
      </div>

      {/* Course Thumbnail */}
      <div className="space-y-2">
        <Label htmlFor="course-thumbnail-upload" className="font-medium block">
          Course Cover Thumbnail <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="thumbnailFile"
          control={control}
          render={({ field }) => (
            <ImageUpload
              id="course-thumbnail-upload"
              image={field.value}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) field.onChange(file);
              }}
            />
          )}
        />
        {errors.thumbnailFile && (
          <p className="text-xs text-red-500 font-medium">
            {errors.thumbnailFile.message}
          </p>
        )}
      </div>

      {/* Per-Lesson Video Pickers */}
      <div className="space-y-4 pt-4 border-t">
        <div>
          <h4 className="font-semibold text-base mb-1 flex items-center gap-2">
            <Film className="w-4 h-4 text-accent" /> Lesson Videos
          </h4>
          <p className="text-xs text-muted-foreground">
            Select a video file for each lesson created in the curriculum step.
          </p>
        </div>

        {lessons.map((lesson, idx) => (
          <div
            key={lesson.id || idx}
            className="p-4 border rounded-xl bg-card space-y-2"
          >
            <div className="flex justify-between items-center text-sm font-semibold">
              <span>
                Lesson {idx + 1}: {lesson.title || "Untitled Lesson"}
              </span>
              {idx === 0 && (
                <span className="text-[10px] bg-accent/10 text-accent font-bold px-2 py-0.5 rounded-full">
                  Primary Video
                </span>
              )}
            </div>

            <Label htmlFor={`lesson-video-${idx}`} className="font-medium block">
              Lesson {idx + 1} Video <span className="text-red-500">*</span>
            </Label>
            <Controller
              name={`lessons.${idx}.videoFile`}
              control={control}
              render={({ field }) => (
                <VideoUpload
                  id={`lesson-video-${idx}`}
                  video={field.value}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) field.onChange(file);
                  }}
                />
              )}
            />
          </div>
        ))}
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-800">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
        <span>
          Files are staged in your browser and will be uploaded securely when you click <strong>Publish</strong> in the review step.
        </span>
      </div>
    </div>
  );
}
