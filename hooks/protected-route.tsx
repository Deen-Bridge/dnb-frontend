"use client";
import React, { useEffect, PropsWithChildren } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Loader from "@/components/molecules/loaders/rootLoader";

export interface ProtectedRouteProps extends PropsWithChildren {}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're done loading AND user is not authenticated
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Show loader while checking authentication
  if (loading) {
    return <Loader />;
  }

  // If not authenticated after loading, don't render children
  // (redirect will happen via useEffect)
  if (!isAuthenticated) {
    return <Loader />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
