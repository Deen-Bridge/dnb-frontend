"use client";

import { useCallback, useState } from "react";
import axiosInstance from "@/lib/config/axios.config";
import { useStellar } from "@/components/stellar/StellarProvider";

type EscrowAction = {
  contributionId: string;
  transactionXdr: string;
  networkPassphrase: string;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useStellarScholarship = () => {
  const { signTransaction, refreshBalance } = useStellar();
  const [isProcessing, setIsProcessing] = useState(false);

  const getState = useCallback(async () => {
    const response = await axiosInstance.get("/api/stellar/scholarships/state");
    return response.data.scholarship;
  }, []);

  const getApplicationConfig = useCallback(async () => {
    const response = await axiosInstance.get("/api/stellar/scholarships/applications/config");
    return response.data;
  }, []);

  const getMyApplication = useCallback(async () => {
    const response = await axiosInstance.get("/api/stellar/scholarships/applications/me");
    return response.data;
  }, []);

  const apply = useCallback(async (application: Record<string, unknown>) => {
    const response = await axiosInstance.post("/api/stellar/scholarships/applications", application);
    return response.data.application;
  }, []);

  const getReviewQueue = useCallback(async () => {
    const response = await axiosInstance.get("/api/stellar/scholarships/applications/review");
    return response.data.applications;
  }, []);

  const submitReview = useCallback(async (id: string, review: Record<string, unknown>) => {
    const response = await axiosInstance.post(`/api/stellar/scholarships/applications/${id}/reviews`, review);
    return response.data.application;
  }, []);

  const decideApplication = useCallback(async (id: string, decision: Record<string, unknown>) => {
    const response = await axiosInstance.post(`/api/stellar/scholarships/applications/${id}/decision`, decision);
    return response.data.application;
  }, []);

  const signAndSubmit = useCallback(
    async (action: EscrowAction) => {
      const signedXdr = await signTransaction(action.transactionXdr, action.networkPassphrase);
      const response = await axiosInstance.post("/api/stellar/scholarships/contributions/submit", {
        contributionId: action.contributionId,
        signedXdr,
      });

      for (let attempt = 0; attempt < 20; attempt += 1) {
        const statusResponse = await axiosInstance.get(
          `/api/stellar/scholarships/contributions/${action.contributionId}`
        );
        const contribution = statusResponse.data.contribution;
        if (contribution.status === "confirmed") return contribution;
        if (contribution.status === "failed") {
          throw new Error("The scholarship transaction failed on Stellar");
        }
        await wait(1500);
      }

      return {
        status: "submitted",
        txHash: response.data.txHash,
        explorerUrl: response.data.explorerUrl,
      };
    },
    [signTransaction]
  );

  const runAction = useCallback(
    async (initializePath: string, payload: Record<string, unknown> = {}) => {
      setIsProcessing(true);
      try {
        const initialized = await axiosInstance.post(initializePath, payload);
        const result = await signAndSubmit(initialized.data);
        if (result.status === "confirmed") await refreshBalance();
        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    [refreshBalance, signAndSubmit]
  );

  const contribute = useCallback(
    (amount: string) =>
      runAction("/api/stellar/scholarships/contributions/initialize", { amount }),
    [runAction]
  );

  const claimRefund = useCallback(
    () => runAction("/api/stellar/scholarships/refunds/initialize"),
    [runAction]
  );

  const releaseMilestone = useCallback(
    (index: number, reportId: string) =>
      runAction(`/api/stellar/scholarships/milestones/${index}/release/initialize`, { reportId }),
    [runAction]
  );

  const getMilestoneReports = useCallback(async () => {
    const response = await axiosInstance.get("/api/stellar/scholarships/milestones/reports");
    return response.data.reports;
  }, []);

  const submitMilestoneReport = useCallback(async (index: number, report: Record<string, unknown>) => {
    const response = await axiosInstance.post(`/api/stellar/scholarships/milestones/${index}/reports`, report);
    return response.data.report;
  }, []);

  const reviewMilestoneReport = useCallback(async (index: number, reportId: string, review: Record<string, unknown>) => {
    const response = await axiosInstance.post(
      `/api/stellar/scholarships/milestones/${index}/reports/${reportId}/review`,
      review
    );
    return response.data.report;
  }, []);

  return {
    getState,
    getApplicationConfig,
    getMyApplication,
    apply,
    getReviewQueue,
    submitReview,
    decideApplication,
    contribute,
    claimRefund,
    releaseMilestone,
    getMilestoneReports,
    submitMilestoneReport,
    reviewMilestoneReport,
    isProcessing,
  };
};

export default useStellarScholarship;
