"use client";
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuth from "@/hooks/useAuth";
import { PlayCircle, CheckCircle2 } from "lucide-react";

export default function WizardStepReview({ watch }) {
  const { user } = useAuth();
  const formValues = watch();

  const title = formValues.title || "Untitled Course";
  const description = formValues.description || "No description provided.";
  const category = formValues.category || "Uncategorized";
  const price = parseFloat(formValues.price) || 0;
  const lessons = formValues.lessons || [];

  const thumbnailFile = formValues.thumbnailFile;
  const [objectUrl, setObjectUrl] = useState(null);

  // Manage object URL lifecycle to prevent memory leaks
  useEffect(() => {
    if (typeof window !== "undefined" && thumbnailFile instanceof File) {
      const url = URL.createObjectURL(thumbnailFile);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setObjectUrl(null);
  }, [thumbnailFile]);

  const thumbnailUrl =
    objectUrl || formValues.thumbnailUrl || "/images/dnb.png";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h3 className="text-xl font-bold mb-1">Review & Learner Preview</h3>
        <p className="text-sm text-muted-foreground">
          Preview how your course will look to prospective learners before publishing.
        </p>
      </div>

      {/* Simulated Course Banner / Thumbnail */}
      <div className="w-full aspect-video rounded-xl overflow-hidden relative bg-slate-900 shadow-md">
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
          <Badge className="w-fit bg-accent text-white mb-2 capitalize">
            {category}
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold line-clamp-2">{title}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h4 className="font-bold text-lg mb-2">Course Description</h4>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">
              {description}
            </p>
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-3 p-4 bg-card border rounded-xl">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar || "/images/img1.jpeg"} alt="" />
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-muted-foreground">Instructor</p>
              <p className="font-semibold text-sm">{user?.name || "Educator"}</p>
            </div>
          </div>

          {/* Curriculum Preview */}
          <div className="space-y-3">
            <h4 className="font-bold text-lg flex items-center justify-between">
              <span>Curriculum Syllabus</span>
              <span className="text-xs font-normal text-muted-foreground">
                {lessons.length} Lesson{lessons.length !== 1 ? "s" : ""}
              </span>
            </h4>

            <div className="space-y-2">
              {lessons.map((lesson, idx) => (
                <div
                  key={lesson.id || idx}
                  className="p-3 border rounded-lg bg-card flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {lesson.title || `Lesson ${idx + 1}`}
                      </p>
                      {lesson.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {lesson.videoFile || lesson.videoUrl ? (
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Video Ready
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <PlayCircle className="w-3.5 h-3.5" /> Pending Video
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Summary Card */}
        <div>
          <div className="border rounded-xl p-5 shadow-sm bg-card space-y-4 sticky top-4">
            <div className="text-center space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Listed Price
              </span>
              <div className="text-3xl font-extrabold text-accent">
                {price === 0 ? "Free" : `$${price.toFixed(2)}`}
              </div>
            </div>

            <div className="border-t pt-3 space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Access:</span>
                <span className="font-medium text-foreground">Lifetime</span>
              </div>
              <div className="flex justify-between">
                <span>Total Lessons:</span>
                <span className="font-medium text-foreground">{lessons.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium text-foreground capitalize">{category}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
