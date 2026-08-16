"use client";
import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShieldAlert } from "lucide-react";

export default function GovernmentIdStep({ control, errors }) {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h3 className="text-xl font-bold mb-1">Government ID</h3>
        <p className="text-sm text-muted-foreground">
          Upload a passport, national ID, or driver&apos;s licence.
        </p>
      </div>

      <Controller
        name="governmentIdFile"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="government-id-input" className="font-medium">
              Government ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="government-id-input"
              data-testid="government-id-input"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => field.onChange(e.target.files?.[0] || null)}
            />
            {field.value?.name && (
              <p className="text-xs text-muted-foreground">
                Selected: <span className="font-medium">{field.value.name}</span>
              </p>
            )}
            {errors.governmentIdFile && (
              <p className="text-xs text-red-500 font-medium">
                {errors.governmentIdFile.message}
              </p>
            )}
          </div>
        )}
      />

      <div className="flex items-start gap-2 p-3 bg-accent/5 border border-accent/20 rounded-lg text-xs text-muted-foreground">
        <ShieldAlert className="w-4 h-4 shrink-0 text-accent" />
        <span>
          Your ID is uploaded through a private, signed flow — it is never sent
          through the public upload used for course thumbnails.
        </span>
      </div>
    </div>
  );
}
