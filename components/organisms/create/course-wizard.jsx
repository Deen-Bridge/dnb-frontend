"use client";
import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { createCourse } from "@/lib/actions/courses/create-course";
import { editCourse } from "@/lib/actions/courses/edit-course";
import { getCourseById } from "@/lib/actions/courses/get-course";
import useDraftAutosave from "@/hooks/useDraftAutosave";
import WizardStepIndicator from "@/components/molecules/dashboard/wizard-step-indicator";
import WizardStepBasics from "./wizard-steps/basics";
import WizardStepCurriculum from "./wizard-steps/curriculum";
import WizardStepMedia from "./wizard-steps/media";
import WizardStepPricing from "./wizard-steps/pricing";
import WizardStepReview from "./wizard-steps/review";
import Button from "@/components/atoms/form/Button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";

// Full Course Schema
const courseSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: z.string().min(1, "Please select a category"),
    price: z.number().min(0, "Price cannot be negative"),
    lessons: z
      .array(
        z.object({
          id: z.string(),
          title: z.string().min(1, "Lesson title is required"),
          description: z.string().optional(),
          duration: z.string().optional(),
          videoFile: z.any().optional(),
          videoUrl: z.string().optional(),
          thumbnailFile: z.any().optional(),
          thumbnailUrl: z.string().optional(),
        })
      )
      .min(1, "At least one lesson is required in the curriculum"),
    thumbnailFile: z.any().optional(),
    thumbnailUrl: z.string().optional(),
  })
  .refine((data) => !!data.thumbnailFile || !!data.thumbnailUrl, {
    message: "A course cover thumbnail is required",
    path: ["thumbnailFile"],
  });

const STEPS = [
  { id: "basics", label: "Basics" },
  { id: "curriculum", label: "Curriculum" },
  { id: "media", label: "Media" },
  { id: "pricing", label: "Pricing" },
  { id: "review", label: "Review" },
];

const STEP_FIELDS = [
  ["title", "description", "category"],
  ["lessons"],
  ["thumbnailFile"],
  ["price"],
  [],
];

export default function CourseWizard({ courseId }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!courseId);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);

  const isEditMode = !!courseId;

  const methods = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: 0,
      lessons: [
        {
          id: "lesson-1",
          title: "",
          description: "",
          duration: "",
          videoFile: null,
          videoUrl: "",
        },
      ],
      thumbnailFile: null,
      thumbnailUrl: "",
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    trigger,
    watch,
    reset,
    setValue,
    control,
    register,
    formState: { errors },
  } = methods;

  const { hasDraft, loadDraft, clearDraft } = useDraftAutosave(
    watch,
    courseId
  );

  // Cloudinary upload hooks
  const thumbnailUpload = useCloudinaryUpload("dnb_courses_thumbnails", {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ["image/*"],
  });

  const videoUpload = useCloudinaryUpload("dnb_courses_videoss", {
    maxSize: 100 * 1024 * 1024,
    allowedTypes: ["video/*"],
  });

  // Check for saved draft on mount (only in create mode)
  useEffect(() => {
    if (!isEditMode && hasDraft()) {
      setShowDraftPrompt(true);
    }
  }, [isEditMode, hasDraft]);

  // Hydrate in edit mode
  useEffect(() => {
    if (!isEditMode || !courseId) return;

    const loadCourse = async () => {
      setInitialLoading(true);
      try {
        const course = await getCourseById(courseId);
        if (course) {
          reset({
            title: course.title || "",
            description: course.description || "",
            category: course.category || "",
            price: course.price || 0,
            lessons: course.lessons?.length
              ? course.lessons
              : [
                  {
                    id: "lesson-1",
                    title: course.title || "Lesson 1",
                    description: course.description || "",
                    videoUrl: course.video || "",
                  },
                ],
            thumbnailUrl: course.thumbnail || "",
            videoUrl: course.video || "",
          });
        } else {
          toast.error("Course not found or failed to load.");
          router.push("/dashboard/courses");
          return;
        }
      } catch (err) {
        toast.error("Failed to load course details.");
        router.push("/dashboard/courses");
      } finally {
        setInitialLoading(false);
      }
    };

    loadCourse();
  }, [courseId, isEditMode, reset, router]);

  const handleResumeDraft = () => {
    const draft = loadDraft();
    if (draft) {
      reset(draft);
      toast.success("Draft restored successfully!");
    }
    setShowDraftPrompt(false);
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftPrompt(false);
  };

  const handleNextStep = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep];
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    } else {
      toast.error("Please fill in all required fields before proceeding.");
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handlePublish = async (data) => {
    try {
      setSubmitting(true);
      let thumbnailUrl = data.thumbnailUrl || null;
      let primaryVideoUrl = data.videoUrl || null;

      // 1. Upload course thumbnail if a new file is selected
      if (data.thumbnailFile instanceof File) {
        toast.info("Uploading course thumbnail...");
        thumbnailUrl = await thumbnailUpload.uploadFile(data.thumbnailFile);
      }

      // 2. Upload per-lesson video files sequentially
      const processedLessons = [];
      for (let i = 0; i < (data.lessons || []).length; i++) {
        const lesson = { ...data.lessons[i] };
        if (lesson.videoFile instanceof File) {
          toast.info(
            `Uploading video for Lesson ${i + 1} (${i + 1}/${
              data.lessons.length
            })...`
          );
          const uploadedUrl = await videoUpload.uploadFile(lesson.videoFile);
          lesson.videoUrl = uploadedUrl;
          if (i === 0) {
            primaryVideoUrl = uploadedUrl;
          }
        }
        delete lesson.videoFile;
        delete lesson.thumbnailFile;
        processedLessons.push(lesson);
      }

      const payload = {
        ...data,
        lessons: processedLessons,
      };

      let res;
      if (isEditMode) {
        res = await editCourse(courseId, {
          form: payload,
          thumbnailUrl,
          videoUrl: primaryVideoUrl,
          category: data.category,
        });
      } else {
        res = await createCourse({
          form: payload,
          thumbnailUrl,
          videoUrl: primaryVideoUrl,
          category: data.category,
        });
      }

      if (res && (res.success || res._id || res.course)) {
        clearDraft();
        toast.success(
          isEditMode
            ? "Course updated successfully!"
            : "Course published successfully!"
        );
        const newId = res.course?._id || res._id || courseId;
        router.push(`/dashboard/courses/${newId}`);
      } else {
        toast.error(res?.message || "Failed to save course.");
      }
    } catch (err) {
      toast.error(
        err?.message || "An error occurred while saving the course."
      );
    } finally {
      setSubmitting(false);
      thumbnailUpload.reset();
      videoUpload.reset();
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
        <p className="text-sm text-muted-foreground">Loading course data...</p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Draft Prompt Banner */}
        {showDraftPrompt && (
          <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm font-semibold">Unsaved draft found!</p>
                <p className="text-xs text-muted-foreground">
                  Would you like to resume your previous course creation session?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                outlined
                className="text-xs py-1 px-3"
                onClick={handleDiscardDraft}
              >
                Discard
              </Button>
              <Button
                type="button"
                round
                className="bg-accent text-white text-xs py-1 px-3"
                onClick={handleResumeDraft}
              >
                Resume Draft
              </Button>
            </div>
          </div>
        )}

        {/* Wizard Header */}
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">
              {isEditMode ? "Edit Course" : "Create New Course"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length} — {STEPS[currentStep].label}
            </p>
          </div>
          <Button
            type="button"
            outlined
            className="text-xs"
            onClick={() => router.push("/dashboard/courses")}
          >
            Cancel
          </Button>
        </div>

        {/* Step Indicator */}
        <WizardStepIndicator
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={(idx) => setCurrentStep(idx)}
        />

        {/* Upload Progress Bar */}
        {(thumbnailUpload.uploading || videoUpload.uploading) && (
          <div className="p-4 border rounded-xl bg-accent/5 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-accent">
              <span>
                {thumbnailUpload.uploading
                  ? "Uploading Thumbnail..."
                  : `Uploading Video (${videoUpload.progress}%)`}
              </span>
              <span>
                {thumbnailUpload.uploading
                  ? `${thumbnailUpload.progress}%`
                  : `${videoUpload.progress}%`}
              </span>
            </div>
            <Progress
              value={
                thumbnailUpload.uploading
                  ? thumbnailUpload.progress
                  : videoUpload.progress
              }
              className="h-2"
            />
          </div>
        )}

        {/* Active Step Content */}
        <div className="min-h-[350px] py-2">
          {currentStep === 0 && (
            <WizardStepBasics
              control={control}
              errors={errors}
              register={register}
            />
          )}

          {currentStep === 1 && (
            <WizardStepCurriculum
              control={control}
              errors={errors}
              register={register}
            />
          )}

          {currentStep === 2 && (
            <WizardStepMedia
              control={control}
              errors={errors}
              watch={watch}
            />
          )}

          {currentStep === 3 && (
            <WizardStepPricing
              errors={errors}
              register={register}
              setValue={setValue}
              watch={watch}
            />
          )}

          {currentStep === 4 && <WizardStepReview watch={watch} />}
        </div>

        {/* Wizard Controls Footer */}
        <div className="flex justify-between items-center border-t pt-4">
          <Button
            type="button"
            outlined
            disabled={currentStep === 0 || submitting}
            onClick={handlePrevStep}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              type="button"
              round
              onClick={handleNextStep}
              className="bg-accent text-white flex items-center gap-1"
            >
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              round
              loading={
                submitting || thumbnailUpload.uploading || videoUpload.uploading
              }
              disabled={
                submitting || thumbnailUpload.uploading || videoUpload.uploading
              }
              onClick={handleSubmit(handlePublish)}
              className="bg-accent hover:bg-accent/90 text-white font-bold flex items-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isEditMode ? "Save Changes" : "Publish Course"}
            </Button>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
