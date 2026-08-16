"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function LinkedInStep({ register, errors }) {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h3 className="text-xl font-bold mb-1">Your details</h3>
        <p className="text-sm text-muted-foreground">
          Help reviewers verify your teaching background.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName" className="font-medium">
          Full name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="fullName"
          data-testid="full-name-input"
          placeholder="e.g. Salem Alharthi"
          {...register("fullName")}
          className={errors.fullName ? "border-red-500" : ""}
        />
        {errors.fullName && (
          <p className="text-xs text-red-500 font-medium">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedinUrl" className="font-medium">
          LinkedIn profile URL <span className="text-red-500">*</span>
        </Label>
        <Input
          id="linkedinUrl"
          data-testid="linkedin-input"
          type="url"
          placeholder="https://linkedin.com/in/you"
          {...register("linkedinUrl")}
          className={errors.linkedinUrl ? "border-red-500" : ""}
        />
        {errors.linkedinUrl && (
          <p className="text-xs text-red-500 font-medium">{errors.linkedinUrl.message}</p>
        )}
      </div>
    </div>
  );
}
