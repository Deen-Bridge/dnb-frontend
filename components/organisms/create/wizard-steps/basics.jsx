"use client";
import React from "react";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import CategoryCombobox from "@/components/atoms/form/ComboBox";

export default function WizardStepBasics({ control, errors, register }) {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h3 className="text-xl font-bold mb-1">Course Basics</h3>
        <p className="text-sm text-muted-foreground">
          Provide essential information about your course.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" className="font-medium">
          Course Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g. Fundamental Arabic Grammar & Vocabulary"
          {...register("title")}
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="font-medium">
          Course Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe what students will learn in this course..."
          rows={5}
          {...register("description")}
          className={`resize-none ${errors.description ? "border-red-500" : ""}`}
        />
        {errors.description && (
          <p className="text-xs text-red-500 font-medium">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="course-category" className="font-medium">
          Course Category <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <CategoryCombobox
              id="course-category"
              category={field.value}
              setCategory={(val) => field.onChange(val)}
            />
          )}
        />
        {errors.category && (
          <p className="text-xs text-red-500 font-medium">{errors.category.message}</p>
        )}
      </div>
    </div>
  );
}
