"use client";
import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { GraduationCap } from "lucide-react";

export default function CertificateStep({ control, errors }) {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h3 className="text-xl font-bold mb-1">Teaching certificate</h3>
        <p className="text-sm text-muted-foreground">
          Upload a certificate, diploma, or credential that shows your teaching
          qualification.
        </p>
      </div>

      <Controller
        name="teachingCertificateFile"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="certificate-input" className="font-medium">
              Teaching certificate <span className="text-red-500">*</span>
            </Label>
            <Input
              id="certificate-input"
              data-testid="certificate-input"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => field.onChange(e.target.files?.[0] || null)}
            />
            {field.value?.name && (
              <p className="text-xs text-muted-foreground">
                Selected: <span className="font-medium">{field.value.name}</span>
              </p>
            )}
            {errors.teachingCertificateFile && (
              <p className="text-xs text-red-500 font-medium">
                {errors.teachingCertificateFile.message}
              </p>
            )}
          </div>
        )}
      />

      <div className="flex items-start gap-2 p-3 bg-accent/5 border border-accent/20 rounded-lg text-xs text-muted-foreground">
        <GraduationCap className="w-4 h-4 shrink-0 text-accent" />
        <span>
          Certificates are handled the same private signed flow as your ID — no
          public upload preset.
        </span>
      </div>
    </div>
  );
}
