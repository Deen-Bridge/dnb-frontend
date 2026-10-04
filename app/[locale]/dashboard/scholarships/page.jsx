"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { ArrowUpRight, GraduationCap, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { useStellar } from "@/components/stellar/StellarProvider";
import useStellarScholarship from "@/hooks/useStellarScholarship";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const copy = {
  en: {
    title: "Scholarship escrow",
    intro: "Support a scholarship through its own Stellar smart contract. This is separate from Sadaqah donations.",
    loading: "Loading scholarship details…",
    unavailable: "Scholarship funding is not available right now.",
    connect: "Connect a Stellar wallet to view and fund this scholarship.",
    connectButton: "Connect wallet",
    target: "Funding goal",
    raised: "Raised on Stellar",
    beneficiary: "Scholarship beneficiary",
    milestones: "Release milestones",
    released: "Released",
    pending: "Awaiting approval",
    amount: "Contribution amount (USDC)",
    contribute: "Contribute to scholarship",
    processing: "Preparing wallet transaction…",
    confirm: "Your wallet will show the exact transaction before you sign.",
    refund: "Claim available refund",
    release: "Approve milestone",
    explorer: "View escrow on Stellar Explorer",
    transactionSubmitted: "Transaction submitted. Confirmation may take a few seconds.",
    success: "Scholarship transaction confirmed on Stellar.",
    failed: "The transaction could not be completed.",
    wrongNetwork: "Switch your wallet to the same network as this scholarship.",
    processTitle: "Apply for this scholarship",
    processIntro: "Applications are reviewed privately by multiple reviewers. The selection is separate from Stellar escrow: USDC is only funded after a recipient is selected and the campaign terms are set.",
    closed: "Applications are closed while this round's eligibility and funding terms are finalized.",
    requestedAmount: "Requested support (USDC)",
    studyGoal: "What do you plan to study?",
    needStatement: "Why do you need scholarship support?",
    eligibility: "I confirm that I meet the published eligibility rules for this round.",
    submitApplication: "Submit private application",
    myApplication: "My application",
    applicationStatus: "Status",
    submitted: "Submitted for review",
    selected: "Selected",
    not_selected: "Not selected",
    reviewRules: "Selection requires two independent reviews, a majority recommendation in support, and an average score of at least 3/5. Reviewers score need, study plan, impact, and eligibility fit.",
    eligibilityRules: "Published eligibility rules",
    fundingPolicy: "Published award and funding terms",
    reviewerQueue: "Scholarship review panel",
    applicant: "Applicant reference",
    scoreNeed: "Financial need (1–5)",
    scorePlan: "Study plan (1–5)",
    scoreImpact: "Expected impact (1–5)",
    scoreEligibility: "Eligibility fit (1–5)",
    support: "Recommend support",
    doNotSupport: "Do not recommend",
    reviewNote: "Review rationale (20–1200 characters)",
    submitReview: "Save independent review",
    decisionReason: "Panel decision rationale (20–1200 characters)",
    selectRecipient: "Select recipient",
    declineApplication: "Mark not selected",
    reviewCount: "Independent reviews",
    noApplications: "No applications are waiting for review.",
    applicationError: "Could not load scholarship application information.",
    milestoneEvidence: "Milestone progress evidence",
    evidenceSummary: "Describe what this milestone funded and what you completed (50–2000 characters).",
    evidenceLink: "Optional HTTPS link to supporting work",
    submitEvidence: "Submit progress for arbiter review",
    reportSubmitted: "Progress submitted for arbiter review",
    reportApproved: "Progress approved; ready for Stellar release",
    reportRejected: "Progress needs revision",
    reportReleased: "USDC release confirmed on Stellar",
    noReport: "Progress report not submitted",
    arbiterNote: "Arbiter review rationale (20–1200 characters)",
    approveEvidence: "Approve evidence",
    rejectEvidence: "Request revision",
    releaseApproved: "Release approved milestone on Stellar",
    applicationPrivacy: "Do not include identity documents, seed phrases, or private keys. Keep evidence links access-controlled and visible only to the scholarship reviewers.",
  },
  ar: {
    title: "ضمان المنحة الدراسية",
    intro: "ساهم في منحة دراسية عبر عقد ذكي مستقل على شبكة ستيلر. هذا المسار منفصل عن تبرعات الصدقة.",
    loading: "جارٍ تحميل تفاصيل المنحة…",
    unavailable: "تمويل المنح الدراسية غير متاح حالياً.",
    connect: "اربط محفظة ستيلر لعرض المنحة والمساهمة فيها.",
    connectButton: "اربط المحفظة",
    target: "هدف التمويل",
    raised: "المبلغ المجموع على ستيلر",
    beneficiary: "مستفيد المنحة",
    milestones: "مراحل الصرف",
    released: "تم الصرف",
    pending: "بانتظار الموافقة",
    amount: "مبلغ المساهمة (USDC)",
    contribute: "ساهم في المنحة",
    processing: "جارٍ إعداد معاملة المحفظة…",
    confirm: "ستعرض محفظتك تفاصيل المعاملة قبل توقيعها.",
    refund: "استرداد المبلغ المتاح",
    release: "الموافقة على صرف المرحلة",
    explorer: "عرض الضمان على مستكشف ستيلر",
    transactionSubmitted: "أُرسلت المعاملة. قد يستغرق تأكيدها بضع ثوانٍ.",
    success: "تم تأكيد معاملة المنحة على ستيلر.",
    failed: "تعذّر إكمال المعاملة.",
    wrongNetwork: "حوّل محفظتك إلى شبكة المنحة نفسها.",
    processTitle: "التقديم للمنحة",
    processIntro: "تُراجع الطلبات بسرية من قبل عدة مراجعين. الاختيار منفصل عن ضمان ستيلر: لن يُموّل USDC إلا بعد اختيار المستفيد وتحديد شروط الحملة.",
    closed: "التقديم مغلق حتى اعتماد شروط الأهلية والتمويل لهذه الجولة.",
    requestedAmount: "المبلغ المطلوب (USDC)",
    studyGoal: "ما الذي تخطط لدراسته؟",
    needStatement: "لماذا تحتاج إلى دعم المنحة؟",
    eligibility: "أؤكد أنني أستوفي شروط الأهلية المنشورة لهذه الجولة.",
    submitApplication: "إرسال طلب خاص",
    myApplication: "طلبي",
    applicationStatus: "الحالة",
    submitted: "تم الإرسال للمراجعة",
    selected: "تم الاختيار",
    not_selected: "لم يتم الاختيار",
    reviewRules: "يتطلب الاختيار مراجعتين مستقلتين، وأغلبية مؤيدة، ومتوسط درجات لا يقل عن ٣ من ٥. يقيم المراجعون الحاجة وخطة الدراسة والأثر ومدى استيفاء الأهلية.",
    eligibilityRules: "شروط الأهلية المنشورة",
    fundingPolicy: "شروط المنحة والتمويل المنشورة",
    reviewerQueue: "لجنة مراجعة المنحة",
    applicant: "مرجع مقدم الطلب",
    scoreNeed: "الحاجة المالية (١–٥)",
    scorePlan: "خطة الدراسة (١–٥)",
    scoreImpact: "الأثر المتوقع (١–٥)",
    scoreEligibility: "استيفاء الأهلية (١–٥)",
    support: "أوصي بالدعم",
    doNotSupport: "لا أوصي بالدعم",
    reviewNote: "مبرر المراجعة (٢٠–١٢٠٠ حرف)",
    submitReview: "حفظ المراجعة المستقلة",
    decisionReason: "مبرر قرار اللجنة (٢٠–١٢٠٠ حرف)",
    selectRecipient: "اختيار المستفيد",
    declineApplication: "عدم اختيار الطلب",
    reviewCount: "المراجعات المستقلة",
    noApplications: "لا توجد طلبات بانتظار المراجعة.",
    applicationError: "تعذر تحميل معلومات طلب المنحة.",
    milestoneEvidence: "إثبات التقدم في المرحلة",
    evidenceSummary: "اشرح ما مولته هذه المرحلة وما أنجزته (من ٥٠ إلى ٢٠٠٠ حرف).",
    evidenceLink: "رابط HTTPS اختياري للأعمال الداعمة",
    submitEvidence: "إرسال التقدم لمراجعة المحكم",
    reportSubmitted: "تم إرسال التقدم لمراجعة المحكم",
    reportApproved: "تم اعتماد التقدم؛ جاهز للصرف عبر ستيلر",
    reportRejected: "يحتاج التقدم إلى تعديل",
    reportReleased: "تم تأكيد صرف USDC على ستيلر",
    noReport: "لم يتم إرسال تقرير التقدم",
    arbiterNote: "مبرر مراجعة المحكم (٢٠–١٢٠٠ حرف)",
    approveEvidence: "اعتماد الإثبات",
    rejectEvidence: "طلب تعديل",
    releaseApproved: "صرف المرحلة المعتمدة على ستيلر",
    applicationPrivacy: "لا ترسل وثائق الهوية أو عبارات الاسترداد أو المفاتيح الخاصة. اجعل روابط الإثبات محمية ولا يطلع عليها إلا مراجعو المنحة.",
  },
};

const formatUsdc = (value, locale) =>
  new Intl.NumberFormat(locale === "ar" ? "ar" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export default function ScholarshipsPage() {
  const locale = useLocale();
  const t = copy[locale === "ar" ? "ar" : "en"];
  const { connectedWallet, connectWallet, network, networkMismatch, isConnecting } = useStellar();
  const { user } = useAuth();
  const {
    getState,
    getMilestoneReports,
    submitMilestoneReport,
    reviewMilestoneReport,
    getApplicationConfig,
    getMyApplication,
    apply,
    getReviewQueue,
    submitReview,
    decideApplication,
    contribute,
    claimRefund,
    releaseMilestone,
    isProcessing,
  } = useStellarScholarship();
  const [state, setState] = useState(null);
  const [amount, setAmount] = useState("10");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationConfig, setApplicationConfig] = useState(null);
  const [myApplication, setMyApplication] = useState(null);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [milestoneReports, setMilestoneReports] = useState({});
  const [progressSummary, setProgressSummary] = useState("");
  const [progressEvidenceUrl, setProgressEvidenceUrl] = useState("");
  const [arbiterNote, setArbiterNote] = useState("");
  const [applicationForm, setApplicationForm] = useState({ requestedAmountUsdc: "100", studyGoal: "", needStatement: "", eligibilityConfirmed: false });
  const [reviewDraft, setReviewDraft] = useState({ scores: { need: 3, studyPlan: 3, impact: 3, eligibility: 3 }, recommendation: "support", note: "" });
  const [decisionReason, setDecisionReason] = useState("");
  const [isApplicationBusy, setIsApplicationBusy] = useState(false);

  const refreshApplications = useCallback(async () => {
    try {
      const [config, mine] = await Promise.all([getApplicationConfig(), getMyApplication()]);
      setApplicationConfig(config);
      setMyApplication(mine.application);
      if (user?.role === "admin") setReviewQueue(await getReviewQueue());
    } catch {
      setError(t.applicationError);
    }
  }, [getApplicationConfig, getMyApplication, getReviewQueue, user?.role, t.applicationError]);

  const refresh = useCallback(async () => {
    if (!connectedWallet) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const scholarshipState = await getState();
      setState(scholarshipState);
      const canReadReports = connectedWallet === scholarshipState.beneficiary ||
        (user?.role === "admin" && connectedWallet === scholarshipState.arbiter);
      if (canReadReports) {
        const reports = await getMilestoneReports();
        setMilestoneReports(Object.fromEntries(reports.map((report) => [report.milestoneIndex, report])));
      } else {
        setMilestoneReports({});
      }
      setError(null);
    } catch {
      setError(t.unavailable);
    } finally {
      setLoading(false);
    }
  }, [connectedWallet, getMilestoneReports, getState, t.unavailable, user?.role]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    refreshApplications();
  }, [refreshApplications]);

  const handleAction = async (action) => {
    setError(null);
    try {
      const result = await action();
      toast.success(result.status === "submitted" ? t.transactionSubmitted : t.success);
      await refresh();
    } catch (actionError) {
      setError(actionError.response?.data?.message || actionError.message || t.failed);
    }
  };

  const raised = Number(state?.fundedUsdc || 0);
  const target = Number(state?.targetUsdc || 0);
  const progress = target > 0 ? Math.min(100, (raised / target) * 100) : 0;
  const canRefund = state && state.rpcLedger >= state.expiryLedger;
  const isArbiter = user?.role === "admin" && connectedWallet === state?.arbiter;
  const submitApplication = async (event) => {
    event.preventDefault();
    setIsApplicationBusy(true);
    try {
      const application = await apply(applicationForm);
      setMyApplication(application);
      toast.success(t.submitApplication);
    } catch (applicationError) {
      setError(applicationError.response?.data?.message || applicationError.message || t.applicationError);
    } finally {
      setIsApplicationBusy(false);
    }
  };

  const handleReview = async (id) => {
    setIsApplicationBusy(true);
    try {
      await submitReview(id, reviewDraft);
      setReviewDraft({ scores: { need: 3, studyPlan: 3, impact: 3, eligibility: 3 }, recommendation: "support", note: "" });
      await refreshApplications();
      toast.success(t.submitReview);
    } catch (reviewError) {
      setError(reviewError.response?.data?.message || reviewError.message || t.applicationError);
    } finally {
      setIsApplicationBusy(false);
    }
  };

  const handleDecision = async (id, decision) => {
    setIsApplicationBusy(true);
    try {
      await decideApplication(id, { decision, reason: decisionReason });
      setDecisionReason("");
      await refreshApplications();
    } catch (decisionError) {
      setError(decisionError.response?.data?.message || decisionError.message || t.applicationError);
    } finally {
      setIsApplicationBusy(false);
    }
  };

  const handleProgressSubmit = async (index) => {
    setIsApplicationBusy(true);
    try {
      const report = await submitMilestoneReport(index, { summary: progressSummary, evidenceUrl: progressEvidenceUrl });
      setMilestoneReports({ ...milestoneReports, [index]: report });
      setProgressSummary("");
      setProgressEvidenceUrl("");
      toast.success(t.reportSubmitted);
    } catch (reportError) {
      setError(reportError.response?.data?.message || reportError.message || t.applicationError);
    } finally {
      setIsApplicationBusy(false);
    }
  };

  const handleProgressReview = async (index, reportId, decision) => {
    setIsApplicationBusy(true);
    try {
      const report = await reviewMilestoneReport(index, reportId, { decision, note: arbiterNote });
      setMilestoneReports({ ...milestoneReports, [index]: report });
      setArbiterNote("");
    } catch (reportError) {
      setError(reportError.response?.data?.message || reportError.message || t.applicationError);
    } finally {
      setIsApplicationBusy(false);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl space-y-6" dir={locale === "ar" ? "rtl" : "ltr"}>
        <header className="rounded-3xl bg-gradient-to-br from-secondary/15 via-surface-raised to-highlight/15 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary/15 text-accent">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">{t.title}</p>
              <h1 className="mt-1 text-2xl font-semibold text-ink sm:text-3xl">{t.title}</h1>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-muted sm:text-base">{t.intro}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/15 bg-surface/70 px-3 py-1.5 text-xs text-ink-muted">
            <ShieldCheck className="size-4 text-accent" />
            {t.confirm}
          </div>
        </header>

        {error && <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-700">{error}</div>}

        {!connectedWallet ? (
          <section className="rounded-2xl border border-accent/10 bg-surface-raised p-6 text-center">
            <p className="text-sm text-ink-muted">{t.connect}</p>
            <Button className="mt-4" onClick={connectWallet} disabled={isConnecting}>{t.connectButton}</Button>
          </section>
        ) : networkMismatch || (state && state.network !== network) ? (
          <section role="alert" className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-sm text-amber-800">{t.wrongNetwork}</section>
        ) : loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-muted"><Loader2 className="size-4 animate-spin" />{t.loading}</div>
        ) : state ? (
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <section className="rounded-2xl border border-accent/10 bg-surface-raised p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-ink-muted">{t.raised}</p>
                  <p className="mt-1 text-3xl font-semibold text-ink">${formatUsdc(raised, locale)} <span className="text-base font-medium text-ink-muted">USDC</span></p>
                  <p className="mt-2 text-sm text-ink-muted">{t.target}: ${formatUsdc(target, locale)} USDC</p>
                </div>
                <button type="button" onClick={refresh} aria-label="Refresh" className="rounded-lg border border-accent/10 p-2 text-ink-muted hover:text-accent"><RefreshCw className="size-4" /></button>
              </div>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-accent/10">
                <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-end text-xs text-ink-muted">{progress.toFixed(1)}%</p>
              <div className="mt-6 rounded-xl border border-accent/10 bg-surface p-4">
                <p className="text-xs text-ink-muted">{t.beneficiary}</p>
                <p className="mt-1 break-all font-mono text-xs text-ink">{state.beneficiary}</p>
              </div>
              <div className="mt-6">
                <h2 className="text-base font-semibold text-ink">{t.milestones}</h2>
                <ol className="mt-3 space-y-2">
                  {state.milestones.map((milestone) => (
                    <li key={milestone.index} className="space-y-3 rounded-xl border border-accent/10 px-4 py-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-ink">{formatUsdc(milestone.amountUsdc, locale)} USDC</span>
                        <span className={milestone.released ? "text-emerald-700" : "text-ink-muted"}>{milestone.released ? t.released : t.pending}</span>
                      </div>
                      {isArbiter && (
                        <div className="space-y-3 rounded-lg bg-surface p-3">
                          <p className="text-xs font-semibold text-ink">{t.milestoneEvidence}</p>
                          {milestoneReports[milestone.index] ? (
                            <>
                              <p className="whitespace-pre-wrap text-xs leading-5 text-ink-muted">{milestoneReports[milestone.index].summary}</p>
                              {milestoneReports[milestone.index].evidenceUrl && <a href={milestoneReports[milestone.index].evidenceUrl} target="_blank" rel="noreferrer" className="text-xs text-accent underline">{t.evidenceLink}</a>}
                              <p className="text-xs text-ink-muted">{t[{
                                submitted: "reportSubmitted",
                                approved: "reportApproved",
                                rejected: "reportRejected",
                                released: "reportReleased",
                              }[milestoneReports[milestone.index].status] || "noReport"]}</p>
                              {milestoneReports[milestone.index].reviewNote && <p className="text-xs text-ink-muted">{milestoneReports[milestone.index].reviewNote}</p>}
                              {milestoneReports[milestone.index].status === "submitted" && (
                                <>
                                  <textarea minLength={20} maxLength={1200} rows={2} value={arbiterNote} onChange={(event) => setArbiterNote(event.target.value)} placeholder={t.arbiterNote} className="w-full rounded-lg border border-accent/15 bg-surface-raised px-3 py-2 text-xs" />
                                  <div className="flex flex-wrap gap-2">
                                    <Button size="sm" disabled={isApplicationBusy || arbiterNote.trim().length < 20} onClick={() => handleProgressReview(milestone.index, milestoneReports[milestone.index].id, "approved")}>{t.approveEvidence}</Button>
                                    <Button size="sm" variant="outline" disabled={isApplicationBusy || arbiterNote.trim().length < 20} onClick={() => handleProgressReview(milestone.index, milestoneReports[milestone.index].id, "rejected")}>{t.rejectEvidence}</Button>
                                  </div>
                                </>
                              )}
                              {milestoneReports[milestone.index].status === "approved" && (
                                <Button size="sm" disabled={isProcessing} onClick={() => handleAction(() => releaseMilestone(milestone.index, milestoneReports[milestone.index].id))}>{t.releaseApproved}</Button>
                              )}
                            </>
                          ) : <p className="text-xs text-ink-muted">{t.noReport}</p>}
                        </div>
                      )}
                      {connectedWallet === state.beneficiary && !milestone.released &&
                        (!milestoneReports[milestone.index] || milestoneReports[milestone.index].status === "rejected") && (
                          <div className="space-y-3 rounded-lg bg-surface p-3">
                            <p className="text-xs font-semibold text-ink">{t.milestoneEvidence}</p>
                            <p className="text-xs text-ink-muted">{t.applicationPrivacy}</p>
                            <textarea minLength={50} maxLength={2000} rows={3} value={progressSummary} onChange={(event) => setProgressSummary(event.target.value)} placeholder={t.evidenceSummary} className="w-full rounded-lg border border-accent/15 bg-surface-raised px-3 py-2 text-xs" />
                            <input type="url" value={progressEvidenceUrl} onChange={(event) => setProgressEvidenceUrl(event.target.value)} placeholder={t.evidenceLink} className="w-full rounded-lg border border-accent/15 bg-surface-raised px-3 py-2 text-xs" />
                            <Button size="sm" disabled={progressSummary.trim().length < 50 || isApplicationBusy} onClick={() => handleProgressSubmit(milestone.index)}>{t.submitEvidence}</Button>
                          </div>
                        )}
                      {connectedWallet === state.beneficiary && milestoneReports[milestone.index]?.status && (
                        <p className="text-xs text-ink-muted">{t[{
                          submitted: "reportSubmitted",
                          approved: "reportApproved",
                          rejected: "reportRejected",
                          released: "reportReleased",
                        }[milestoneReports[milestone.index].status] || "noReport"]}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
              {canRefund && (
                <Button variant="outline" className="mt-5" disabled={isProcessing} onClick={() => handleAction(claimRefund)}>{t.refund}</Button>
              )}
              <a href={state.explorerUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
                {t.explorer}<ArrowUpRight className="size-4" />
              </a>
            </section>

            <section className="rounded-2xl border border-accent/10 bg-surface-raised p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-ink">{t.contribute}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{t.confirm}</p>
              <label htmlFor="scholarship-amount" className="mt-6 block text-sm font-medium text-ink">{t.amount}</label>
              <div className="mt-2 flex items-center rounded-xl border border-accent/15 bg-surface px-3 focus-within:ring-2 focus-within:ring-accent/20">
                <span className="text-ink-muted">$</span>
                <input id="scholarship-amount" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full bg-transparent px-2 py-3 text-ink outline-none" placeholder="10.00" />
                <span className="text-sm text-ink-muted">USDC</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[5, 10, 25, 100].map((preset) => <button key={preset} type="button" onClick={() => setAmount(String(preset))} className="rounded-full border border-accent/10 px-3 py-1 text-xs text-ink-muted hover:border-accent/30">${preset}</button>)}
              </div>
              <Button className="mt-6 w-full" disabled={isProcessing || !amount || Number(amount) <= 0 || raised >= target} onClick={() => handleAction(() => contribute(amount))}>
                {isProcessing ? <><Loader2 className="me-2 size-4 animate-spin" />{t.processing}</> : t.contribute}
              </Button>
              <p className="mt-4 text-xs leading-5 text-ink-muted">{state.network} · {state.contractId.slice(0, 8)}…{state.contractId.slice(-6)}</p>
            </section>
          </div>
        ) : (
          <div role="status" className="rounded-2xl border border-accent/10 bg-surface-raised p-6 text-center text-sm text-ink-muted">{t.unavailable}</div>
        )}

        <section className="space-y-5 rounded-2xl border border-accent/10 bg-surface-raised p-6 sm:p-8">
          <div>
            <h2 className="text-xl font-semibold text-ink">{t.processTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">{t.processIntro}</p>
            {applicationConfig && <p className="mt-3 rounded-xl bg-surface p-3 text-sm leading-6 text-ink-muted">{t.reviewRules}</p>}
            {applicationConfig?.eligibilityRules && <div className="mt-3 rounded-xl border border-accent/10 p-4"><h3 className="text-sm font-semibold text-ink">{t.eligibilityRules}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-muted">{applicationConfig.eligibilityRules}</p></div>}
            {applicationConfig?.fundingPolicy && <div className="mt-3 rounded-xl border border-accent/10 p-4"><h3 className="text-sm font-semibold text-ink">{t.fundingPolicy}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-muted">{applicationConfig.fundingPolicy}</p></div>}
          </div>

          {myApplication ? (
            <div className="rounded-xl border border-accent/10 p-4">
              <h3 className="font-semibold text-ink">{t.myApplication}</h3>
              <p className="mt-2 text-sm text-ink-muted">{t.applicationStatus}: <span className="font-medium text-ink">{t[myApplication.status] || myApplication.status}</span></p>
              <p className="mt-1 text-sm text-ink-muted">{t.reviewCount}: {myApplication.reviews?.length || 0} / {applicationConfig?.minimumIndependentReviews || 2}</p>
              {myApplication.decision?.reason && <p className="mt-3 text-sm text-ink-muted">{myApplication.decision.reason}</p>}
            </div>
          ) : applicationConfig?.applicationsOpen ? (
            <form onSubmit={submitApplication} className="grid gap-4 md:grid-cols-2">
              <p className="text-xs leading-5 text-ink-muted md:col-span-2">{t.applicationPrivacy}</p>
              <label className="text-sm font-medium text-ink">{t.requestedAmount}
                <input required type="number" min="1" max="999999.99" step="0.01" value={applicationForm.requestedAmountUsdc} onChange={(event) => setApplicationForm({ ...applicationForm, requestedAmountUsdc: event.target.value })} className="mt-2 w-full rounded-xl border border-accent/15 bg-surface px-3 py-3" />
              </label>
              <div className="hidden md:block" />
              <label className="text-sm font-medium text-ink">{t.studyGoal}
                <textarea required minLength={50} maxLength={1600} rows={5} value={applicationForm.studyGoal} onChange={(event) => setApplicationForm({ ...applicationForm, studyGoal: event.target.value })} className="mt-2 w-full rounded-xl border border-accent/15 bg-surface px-3 py-3" />
              </label>
              <label className="text-sm font-medium text-ink">{t.needStatement}
                <textarea required minLength={50} maxLength={1600} rows={5} value={applicationForm.needStatement} onChange={(event) => setApplicationForm({ ...applicationForm, needStatement: event.target.value })} className="mt-2 w-full rounded-xl border border-accent/15 bg-surface px-3 py-3" />
              </label>
              <label className="flex items-start gap-3 text-sm text-ink-muted md:col-span-2">
                <input required type="checkbox" checked={applicationForm.eligibilityConfirmed} onChange={(event) => setApplicationForm({ ...applicationForm, eligibilityConfirmed: event.target.checked })} className="mt-1" />
                {t.eligibility}
              </label>
              <Button type="submit" disabled={isApplicationBusy} className="md:col-span-2">{t.submitApplication}</Button>
            </form>
          ) : (
            <p role="status" className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-800">{t.closed}</p>
          )}

          {user?.role === "admin" && (
            <div className="space-y-4 border-t border-accent/10 pt-5">
              <h3 className="text-lg font-semibold text-ink">{t.reviewerQueue}</h3>
              {reviewQueue.length === 0 ? <p className="text-sm text-ink-muted">{t.noApplications}</p> : reviewQueue.map((application) => {
                const ownReview = application.reviews?.some((review) => review.reviewer === user?._id);
                return (
                  <article key={application.id} className="space-y-4 rounded-xl border border-accent/10 p-4">
                    <div className="flex flex-wrap justify-between gap-2 text-sm text-ink-muted">
                      <span>{t.applicant}: <code>{application.applicantId}</code></span>
                      <span>{t.requestedAmount}: {application.requestedAmountUsdc} USDC</span>
                      <span>{t.reviewCount}: {application.reviews?.length || 0} / 2</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <p className="whitespace-pre-wrap text-sm text-ink"><strong>{t.studyGoal}</strong><br />{application.studyGoal}</p>
                      <p className="whitespace-pre-wrap text-sm text-ink"><strong>{t.needStatement}</strong><br />{application.needStatement}</p>
                    </div>
                    <div className="grid gap-3 rounded-lg bg-surface p-3 md:grid-cols-2">
                      <p className="whitespace-pre-wrap text-xs leading-5 text-ink-muted"><strong>{t.eligibilityRules}</strong><br />{application.eligibilityRules}</p>
                      <p className="whitespace-pre-wrap text-xs leading-5 text-ink-muted"><strong>{t.fundingPolicy}</strong><br />{application.fundingPolicy}</p>
                    </div>
                    {ownReview ? <p className="text-sm text-emerald-700">{t.submitReview} ✓</p> : (
                      <div className="space-y-3 rounded-lg bg-surface p-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {[["need", t.scoreNeed], ["studyPlan", t.scorePlan], ["impact", t.scoreImpact], ["eligibility", t.scoreEligibility]].map(([key, label]) => (
                            <label key={key} className="text-xs text-ink-muted">{label}
                              <select value={reviewDraft.scores[key]} onChange={(event) => setReviewDraft({ ...reviewDraft, scores: { ...reviewDraft.scores, [key]: Number(event.target.value) } })} className="mt-1 block w-full rounded-lg border border-accent/15 bg-surface-raised px-2 py-2 text-ink">{[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score}</option>)}</select>
                            </label>
                          ))}
                        </div>
                        <select value={reviewDraft.recommendation} onChange={(event) => setReviewDraft({ ...reviewDraft, recommendation: event.target.value })} className="w-full rounded-lg border border-accent/15 bg-surface-raised px-3 py-2 text-sm text-ink"><option value="support">{t.support}</option><option value="do_not_support">{t.doNotSupport}</option></select>
                        <textarea minLength={20} maxLength={1200} rows={3} value={reviewDraft.note} onChange={(event) => setReviewDraft({ ...reviewDraft, note: event.target.value })} placeholder={t.reviewNote} className="w-full rounded-lg border border-accent/15 bg-surface-raised px-3 py-2 text-sm" />
                        <Button size="sm" disabled={isApplicationBusy || reviewDraft.note.trim().length < 20} onClick={() => handleReview(application.id)}>{t.submitReview}</Button>
                      </div>
                    )}
                    {(application.reviews?.length || 0) >= 2 && (
                      <div className="space-y-3 border-t border-accent/10 pt-3">
                        <textarea minLength={20} maxLength={1200} rows={2} value={decisionReason} onChange={(event) => setDecisionReason(event.target.value)} placeholder={t.decisionReason} className="w-full rounded-lg border border-accent/15 bg-surface px-3 py-2 text-sm" />
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" disabled={isApplicationBusy || decisionReason.trim().length < 20} onClick={() => handleDecision(application.id, "selected")}>{t.selectRecipient}</Button>
                          <Button size="sm" variant="outline" disabled={isApplicationBusy || decisionReason.trim().length < 20} onClick={() => handleDecision(application.id, "not_selected")}>{t.declineApplication}</Button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
