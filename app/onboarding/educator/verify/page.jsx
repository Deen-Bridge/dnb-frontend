"use client";
import ProtectedRoute from "@/hooks/protected-route";
import EducatorVerificationWizard from "@/components/organisms/onboarding/educator/educator-verification-wizard";

export default function EducatorVerifyPage() {
  return (
    <ProtectedRoute>
      <EducatorVerificationWizard />
    </ProtectedRoute>
  );
}
