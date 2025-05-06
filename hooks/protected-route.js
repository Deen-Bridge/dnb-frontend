"use client";
import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Loader from "@/components/molecules/loaders/rootLoader";
 
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <Loader/>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
