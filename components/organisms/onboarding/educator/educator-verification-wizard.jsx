"use client";
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import useDraftAutosave from "@/hooks/useDraftAutosave";
import { useSignedUpload } from "@/hooks/useSignedUpload";
import { submitEducatorApplication } from "@/lib/actions/educators/application";
import { educatorApplicationSchema } from "@/lib/validation/educator-application";
import WizardStepIndicator from "@/components/molecules/dashboard/wizard-step-indicator";
import Button from "@/components/atoms/form/Button";
import { Progress } from "@/components/ui/progress";
import VerificationPending from "./verification-pending";
import LivenessStep from "./steps/liveness";
import GovernmentIdStep from "./steps/government-id";
import LinkedInStep from "./steps/linkedin";
import CertificateStep from "./steps/certificate";

const DRAFT_PREFIX = "dnb_educator_verification_draft_";
const DRAFT_ID = "educator";

const STEPS = [
  { id: "liveness", label: "Liveness" },
  { id: "government-id", label: "Government ID" },
  { id: "linkedin", label: "Your details" },
  { id: "certificate", label: "Certificate" },
];

const STEP_FIELDS = [
  ["livenessToken"],
  ["governmentIdFile", "governmentIdUrl"],
  ["fullName", "linkedinUrl"],
  ["teachingCertificateFile", "teachingCertificateUrl"],
];

export default function EducatorVerificationWizard() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);

  const methods = useForm({
    resolver: zodResolver(educatorApplicationSchema),
    defaultValues: {
      fullName: user?.name || "",
      linkedinUrl: "",
      livenessToken: "",
      governmentIdFile: null,
      governmentIdUrl: "",
      teachingCertificateFile: null,
      teachingCertificateUrl: "",
      currentStep: 0,
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
    DRAFT_ID,
    DRAFT_PREFIX
  );

  // Sensitive documents go through the signed flow only.
  const governmentIdUpload = useSignedUpload("government-id");
  const certificateUpload = useSignedUpload("teaching-certificate");

  // Persist the current step inside the draft so a resume reopens the right step.
  useEffect(() => {
    setValue("currentStep", currentStep);
  }, [currentStep, setValue]);

  useEffect(() => {
    if (hasDraft()) {
      setShowDraftPrompt(true);
    }
  }, [hasDraft]);

  const handleResumeDraft = () => {
    const draft = loadDraft();
    if (draft) {
      reset(draft);
      const step = Number.isInteger(draft.currentStep) ? draft.currentStep : 0;
      setCurrentStep(step);
      setCompletedSteps(
        new Set(Array.from({ length: step }, (_, idx) => idx))
      );
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
      toast.error("Please complete this step before proceeding.");
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmitApplication = async (data) => {
    try {
      setSubmitting(true);

      let governmentIdUrl = data.governmentIdUrl || null;
      let teachingCertificateUrl = data.teachingCertificateUrl || null;

      if (data.governmentIdFile instanceof File) {
        toast.info("Uploading government ID securely…");
        governmentIdUrl = await governmentIdUpload.uploadFile(
          data.governmentIdFile
        );
      }

      if (data.teachingCertificateFile instanceof File) {
        toast.info("Uploading teaching certificate securely…");
        teachingCertificateUrl = await certificateUpload.uploadFile(
          data.teachingCertificateFile
        );
      }

      const res = await submitEducatorApplication({
        fullName: data.fullName,
        linkedinUrl: data.linkedinUrl,
        livenessToken: data.livenessToken,
        governmentIdUrl,
        teachingCertificateUrl,
      });

      if (res && (res.success || res.application)) {
        clearDraft();
        toast.success("Application submitted for review!");
        setSubmitted(true);
      } else {
        throw new Error(res?.message || "Failed to submit application.");
      }
    } catch (err) {
      toast.error(err?.message || "An error occurred while submitting.");
    } finally {
      setSubmitting(false);
      governmentIdUpload.reset();
      certificateUpload.reset();
    }
  };

  if (submitted) {
    return <VerificationPending />;
  }

  return (
    <FormProvider {...methods}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {showDraftPrompt && (
          <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm font-semibold">Unsaved draft found!</p>
                <p className="text-xs text-muted-foreground">
                  Resume your educator verification where you left off?
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
                data-testid="resume-draft"
                className="bg-accent text-white text-xs py-1 px-3"
                onClick={handleResumeDraft}
              >
                Resume Draft
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">Educator verification</h1>
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length} — {STEPS[currentStep].label}
            </p>
          </div>
          <Button
            type="button"
            outlined
            className="text-xs"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </Button>
        </div>

        <WizardStepIndicator
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={(idx) => setCurrentStep(idx)}
        />

        {(governmentIdUpload.uploading || certificateUpload.uploading) && (
          <div className="p-4 border rounded-xl bg-accent/5 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-accent">
              <span>
                {governmentIdUpload.uploading
                  ? "Uploading government ID…"
                  : "Uploading teaching certificate…"}
              </span>
              <span>
                {governmentIdUpload.uploading
                  ? `${governmentIdUpload.progress}%`
                  : `${certificateUpload.progress}%`}
              </span>
            </div>
            <Progress
              value={
                governmentIdUpload.uploading
                  ? governmentIdUpload.progress
                  : certificateUpload.progress
              }
              className="h-2"
            />
          </div>
        )}

        <div className="min-h-[350px] py-2">
          {currentStep === 0 && (
            <LivenessStep setValue={setValue} watch={watch} errors={errors} />
          )}
          {currentStep === 1 && (
            <GovernmentIdStep control={control} errors={errors} />
          )}
          {currentStep === 2 && <LinkedInStep register={register} errors={errors} />}
          {currentStep === 3 && (
            <CertificateStep control={control} errors={errors} />
          )}
        </div>

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
              data-testid="wizard-next"
              onClick={handleNextStep}
              className="bg-accent text-white flex items-center gap-1"
            >
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              round
              data-testid="submit-application"
              loading={
                submitting ||
                governmentIdUpload.uploading ||
                certificateUpload.uploading
              }
              disabled={
                submitting ||
                governmentIdUpload.uploading ||
                certificateUpload.uploading
              }
              onClick={handleSubmit(handleSubmitApplication)}
              className="bg-accent hover:bg-accent/90 text-white font-bold flex items-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              Submit for review
            </Button>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
