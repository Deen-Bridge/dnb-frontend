"use client";
import ProtectedRoute from "@/hooks/protected-route";
import BranchSelector from "@/components/organisms/onboarding/educator/branch-selector";

export default function EducatorOnboardingPage() {
  return (
    <ProtectedRoute>
      <BranchSelector />
    </ProtectedRoute>
  );
}
