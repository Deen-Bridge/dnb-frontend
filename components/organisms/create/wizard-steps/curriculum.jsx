"use client";
import React from "react";
import { useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Plus, Trash2, ArrowUp, ArrowDown, Video, GripVertical } from "lucide-react";

export default function WizardStepCurriculum({ control, errors, register }) {
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "lessons",
  });

  const handleAddLesson = () => {
    append({
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      title: "",
      description: "",
      duration: "",
      videoFile: null,
      videoUrl: "",
      thumbnailFile: null,
      thumbnailUrl: "",
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-xl font-bold mb-1">Curriculum & Lessons</h3>
          <p className="text-sm text-muted-foreground">
            Add modules or lessons to structure your course curriculum.
          </p>
        </div>
        <ShadcnButton
          type="button"
          onClick={handleAddLesson}
          className="bg-accent hover:bg-accent/90 text-white font-medium flex items-center gap-1 text-sm rounded-lg"
        >
          <Plus className="w-4 h-4" /> Add Lesson
        </ShadcnButton>
      </div>

      {errors.lessons?.root && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium">
          {errors.lessons.root.message}
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => {
          const lessonError = errors.lessons?.[index];

          return (
            <div
              key={field.id}
              className="border border-border rounded-xl p-5 bg-card space-y-4 shadow-xs relative hover:border-accent/40 transition-colors"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-accent/10 text-accent font-bold px-3 py-1 rounded-md text-xs flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" />
                    Lesson {index + 1}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    Order #{index + 1}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <ShadcnButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={index === 0}
                    onClick={() => swap(index, index - 1)}
                    title="Move Up"
                    className="h-8 w-8"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </ShadcnButton>

                  <ShadcnButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={index === fields.length - 1}
                    onClick={() => swap(index, index + 1)}
                    title="Move Down"
                    className="h-8 w-8"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </ShadcnButton>

                  <ShadcnButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={fields.length <= 1}
                    onClick={() => remove(index)}
                    title="Remove Lesson"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </ShadcnButton>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-medium">
                    Lesson Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. Lesson 1: Introduction & Alphabet"
                    {...register(`lessons.${index}.title`)}
                    className={lessonError?.title ? "border-red-500" : ""}
                  />
                  {lessonError?.title && (
                    <p className="text-xs text-red-500 font-medium">
                      {lessonError.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Est. Duration (Optional)
                  </Label>
                  <Input
                    placeholder="e.g. 15 mins"
                    {...register(`lessons.${index}.duration`)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Lesson Summary (Optional)
                </Label>
                <Textarea
                  placeholder="Briefly describe what is covered in this lesson..."
                  rows={2}
                  {...register(`lessons.${index}.description`)}
                  className="resize-none text-sm"
                />
              </div>
            </div>
          );
        })}
      </div>

      {fields.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl space-y-3">
          <p className="text-sm text-muted-foreground">
            No lessons added yet. Click "Add Lesson" to start building your curriculum.
          </p>
          <ShadcnButton
            type="button"
            onClick={handleAddLesson}
            className="bg-accent text-white"
          >
            <Plus className="w-4 h-4 mr-1" /> Add First Lesson
          </ShadcnButton>
        </div>
      )}
    </div>
  );
}
