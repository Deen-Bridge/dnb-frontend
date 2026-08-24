"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Button from "@/components/atoms/form/Button";
import useAuth from "@/hooks/useAuth";
import { useHasBook } from "@/hooks/usePurchase";
import {
  DownloadCloud,
  ArrowLeft,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Loader2,
  Lock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import {
  clampPage,
  nextPageForKey,
  progressPercent,
  readBookProgress,
  saveBookProgress,
} from "./bookProgress";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const INITIAL_SCALE = 1.2;

/* ── chrome building blocks (design-system consistent) ── */

const IconButton = ({ className, children, ...props }) => (
  <button
    type="button"
    className={cn(
      "inline-flex size-9 items-center justify-center rounded-xl border border-accent/10 bg-surface-raised text-ink-muted transition-colors hover:border-secondary/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-accent/10 disabled:hover:text-ink-muted",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

const BookReaderClient = ({ book }) => {
  const { user } = useAuth();
  const hasBook = useHasBook(book?._id);

  const docRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  // pdfjs-dist is a heavy browser-only dependency, so it's fetched lazily
  // the first time a book is actually opened (kept out of the library
  // list-page bundles entirely). The worker URL ships via the ?url import.
  const pdfjsRef = useRef(null);

  const [loadingDocument, setLoadingDocument] = useState(false);
  const [renderingPage, setRenderingPage] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [baseScale, setBaseScale] = useState(INITIAL_SCALE);
  const [effectiveScale, setEffectiveScale] = useState(INITIAL_SCALE);
  const [fitWidth, setFitWidth] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isTransitioning, startTransition] = useTransition();

  // Jump-to-page input (kept as a string so partial typing isn't clobbered)
  // and the "resumed at page N" banner shown after restoring a saved position.
  const [pageInput, setPageInput] = useState("1");
  const [resumeBanner, setResumeBanner] = useState(null);
  // Latest page, read inside the keyboard handler without re-subscribing on
  // every page turn.
  const pageNumberRef = useRef(pageNumber);

  const canAccess = useMemo(() => {
    if (!book) return false;
    if (book.price === 0) return true;
    if (
      user?._id &&
      book.author?._id?.toString?.() === user._id?.toString?.()
    ) {
      return true;
    }
    return hasBook;
  }, [book, hasBook, user?._id, book?.author?._id]);

  const previewUrl = useMemo(() => {
    if (!book?._id) return "";
    return `/api/books/${book._id}/preview`;
  }, [book?._id]);

  useEffect(() => {
    if (!fitWidth) return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(container);
    setContainerWidth(container.clientWidth);

    return () => observer.disconnect();
  }, [fitWidth]);

  useEffect(() => {
    if (!previewUrl || !canAccess) return;

    let cancelled = false;
    const loadDocument = async () => {
      setLoadingDocument(true);
      setPdfError("");
      try {
        const response = await fetch(previewUrl, { cache: "no-store" });
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Unable to load book preview");
        }

        const buffer = await response.arrayBuffer();

        let pdfjs = pdfjsRef.current;
        if (!pdfjs) {
          const [lib, workerModule] = await Promise.all([
            import("pdfjs-dist"),
            import("pdfjs-dist/build/pdf.worker.min.js?url"),
          ]);
          if (cancelled) return;
          lib.GlobalWorkerOptions.workerSrc = workerModule.default;
          pdfjsRef.current = lib;
          pdfjs = lib;
        }

        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
        const pdf = await loadingTask.promise;

        if (cancelled) {
          pdf.destroy();
          return;
        }

        docRef.current?.destroy?.();
        docRef.current = pdf;
        setPageCount(pdf.numPages);

        // Resume the last-read position (clamped) if one is saved for this book.
        const saved = readBookProgress(book?._id);
        const startPage = saved
          ? clampPage(saved.page, pdf.numPages)
          : clamp(pageNumberRef.current, 1, pdf.numPages);
        setPageNumber(startPage);
        setResumeBanner(saved && startPage > 1 ? startPage : null);
      } catch (error) {
        console.error("Error loading PDF document:", error);
        if (!cancelled) {
          setPdfError(
            error?.message ||
              "Unable to render this book right now. Try downloading instead."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingDocument(false);
        }
      }
    };

    loadDocument();

    return () => {
      cancelled = true;
      docRef.current?.destroy?.();
      docRef.current = null;
    };
  }, [previewUrl, canAccess]);

  useEffect(() => {
    const doc = docRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!doc || !canvas || !container) return;

    let cancelled = false;
    const renderPage = async () => {
      setRenderingPage(true);
      try {
        const page = await doc.getPage(pageNumber);
        const unscaledViewport = page.getViewport({ scale: 1 });

        let targetScale = baseScale;
        if (fitWidth && containerWidth > 0) {
          targetScale = clamp(
            containerWidth / unscaledViewport.width,
            MIN_SCALE,
            MAX_SCALE
          );
        }

        const viewport = page.getViewport({ scale: targetScale });
        const context = canvas.getContext("2d", { alpha: false });
        const outputScale = window.devicePixelRatio || 1;

        canvas.width = viewport.width * outputScale;
        canvas.height = viewport.height * outputScale;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        if (!cancelled) {
          setEffectiveScale(targetScale);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error rendering page:", error);
          setPdfError("Failed to render this page.");
        }
      } finally {
        if (!cancelled) {
          setRenderingPage(false);
        }
      }
    };

    renderPage();
    return () => {
      cancelled = true;
    };
  }, [pageNumber, baseScale, fitWidth, containerWidth, pageCount]);

  useEffect(() => {
    return () => {
      docRef.current?.destroy?.();
      docRef.current = null;
    };
  }, []);

  const goToPage = (delta) => {
    if (!pageCount) return;
    startTransition(() =>
      setPageNumber((prev) => clamp(prev + delta, 1, pageCount))
    );
  };

  const jumpToPage = (page) => {
    if (!pageCount) return;
    startTransition(() => setPageNumber(clampPage(page, pageCount)));
  };

  const handleZoom = (direction) => {
    setFitWidth(false);
    setBaseScale((prev) =>
      clamp(prev + direction * 0.15, MIN_SCALE, MAX_SCALE)
    );
  };

  // Keep the jump-to-page input and the ref mirror in sync with the page.
  useEffect(() => {
    setPageInput(String(pageNumber));
    pageNumberRef.current = pageNumber;
  }, [pageNumber]);

  // Persist the last-read position whenever the page changes (guarded to the
  // browser inside saveBookProgress).
  useEffect(() => {
    if (!book?._id || !pageCount) return;
    saveBookProgress(book._id, pageNumber);
  }, [book?._id, pageNumber, pageCount]);

  // Keyboard navigation while the reader is mounted. Ignored when a form field
  // (the page input / slider) has focus so typing never triggers page flips.
  useEffect(() => {
    if (!pageCount) return;

    const handleKeyDown = (event) => {
      const target = event.target;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      const targetPage = nextPageForKey(event.key, pageNumberRef.current, pageCount);
      if (targetPage == null) return;
      event.preventDefault();
      startTransition(() => setPageNumber(targetPage));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pageCount, startTransition]);

  const commitPageInput = () => {
    const parsed = Number.parseInt(pageInput, 10);
    if (Number.isNaN(parsed)) {
      setPageInput(String(pageNumber));
      return;
    }
    jumpToPage(parsed);
  };

  const handlePageInputKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitPageInput();
      event.currentTarget.blur();
    }
  };

  const handleStartOver = () => {
    setResumeBanner(null);
    jumpToPage(1);
  };

  if (!book) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
        <div className="w-full max-w-md rounded-2xl border border-accent/10 bg-surface-raised p-8 shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
            <BookOpen className="h-6 w-6 text-accent" />
          </div>
          <p className={cn(poppins_600, "mt-4 text-lg text-ink")}>
            Book not found.
          </p>
          <Button
            to="/dashboard/library"
            round
            className="mt-6 bg-accent text-white"
          >
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-10 text-center">
        <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-accent/10 bg-surface-raised shadow-sm">
          <div className="relative bg-gradient-to-br from-secondary/10 via-surface-raised to-highlight/10 px-6 py-10 sm:px-10">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-secondary/10 blur-3xl" />
            <div className="relative">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-accent/5 bg-gradient-to-br from-secondary/20 to-highlight/10">
                <Lock className="h-7 w-7 text-accent" />
              </div>
              <h1 className={cn(poppins_600, "mt-5 text-2xl text-ink")}>
                Unlock the full book
              </h1>
              <p
                className={cn(
                  poppins_400,
                  "mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted"
                )}
              >
                {book.title
                  ? `Purchase “${book.title}” to read the full book, or head back to the book page to learn more.`
                  : "Purchase this title to read the full book, or head back to the book page to learn more."}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-3 px-6 py-6 sm:flex-row sm:px-10">
            <Button
              round
              outlined
              to="/dashboard/library"
              className="text-normal"
            >
              Back to Library
            </Button>
            <Button
              round
              className="bg-accent text-white"
              to={`/dashboard/library/${book._id}`}
            >
              Buy to read the full book
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* ── Slim sticky reader toolbar ── */}
      <header className="sticky top-0 z-20 border-b border-accent/10 bg-surface-raised/85 px-4 py-2.5 backdrop-blur md:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* left: back + title */}
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={`/dashboard/library/${book._id}`}
              aria-label="Back to book details"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-accent/10 bg-surface-raised text-ink-muted transition-colors hover:border-secondary/40 hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <h1
                className={cn(
                  poppins_600,
                  "truncate text-sm text-ink sm:text-base"
                )}
              >
                {book.title}
              </h1>
              {book.author?.name && (
                <p
                  className={cn(
                    poppins_400,
                    "truncate text-xs text-ink-muted"
                  )}
                >
                  by {book.author.name}
                </p>
              )}
            </div>
          </div>

          {/* right: page indicator + zoom + fit-width */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <span
              className={cn(
                poppins_500,
                "hidden rounded-lg border border-accent/10 bg-surface px-3 py-1.5 text-xs text-ink-muted sm:inline-flex"
              )}
              aria-live="polite"
            >
              {pageCount
                ? `Page ${pageNumber} of ${pageCount} · ${progressPercent(pageNumber, pageCount)}%`
                : `Page ${pageNumber}`}
            </span>

            <div className="hidden items-center gap-1.5 sm:flex">
              <IconButton
                onClick={() => handleZoom(-1)}
                disabled={fitWidth || baseScale <= MIN_SCALE}
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </IconButton>
              <span
                className={cn(
                  poppins_600,
                  "w-12 text-center text-xs text-ink-muted"
                )}
              >
                {(effectiveScale * 100).toFixed(0)}%
              </span>
              <IconButton
                onClick={() => handleZoom(1)}
                disabled={fitWidth || baseScale >= MAX_SCALE}
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </IconButton>
            </div>

            <IconButton
              onClick={() => setFitWidth((prev) => !prev)}
              aria-label={fitWidth ? "Switch to free zoom" : "Fit width"}
              className={cn(
                fitWidth && "border-secondary/40 text-accent"
              )}
            >
              {fitWidth ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </IconButton>

            {book.fileUrl && (
              <Button
                round
                outlined
                className="hidden items-center gap-2 text-normal sm:inline-flex"
                to={book.fileUrl}
                download
                target="_blank"
              >
                <DownloadCloud className="h-4 w-4" />
                Download
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Reading stage ── */}
      <main className="relative flex flex-1 flex-col">
        {!book.fileUrl ? (
          <div className="flex flex-1 items-center justify-center px-4 py-16">
            <div className="w-full max-w-md rounded-2xl border border-dashed border-accent/20 bg-surface-raised p-10 text-center shadow-sm">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <p className={cn(poppins_600, "mt-4 text-lg text-ink")}>
                This book file is not available yet.
              </p>
              <p
                className={cn(poppins_400, "mt-2 text-sm text-ink-muted")}
              >
                Please contact support if you believe this is a mistake.
              </p>
            </div>
          </div>
        ) : loadingDocument && !docRef.current ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
              <Loader2 className="h-7 w-7 animate-spin text-accent" />
            </div>
            <p className={cn(poppins_500, "text-sm text-ink-muted")}>
              Preparing your reading experience...
            </p>
          </div>
        ) : pdfError ? (
          <div className="flex flex-1 items-center justify-center px-4 py-16">
            <div className="w-full max-w-md rounded-2xl border border-accent/10 bg-surface-raised p-10 text-center shadow-sm">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-red-50">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
              <p className={cn(poppins_600, "mt-4 text-lg text-red-600")}>
                {pdfError}
              </p>
              <p className={cn(poppins_400, "mt-2 text-sm text-ink-muted")}>
                Try reloading the page or download the book to continue
                reading.
              </p>
              {book.fileUrl && (
                <Button
                  round
                  outlined
                  className="mt-5 inline-flex items-center gap-2 text-normal"
                  to={book.fileUrl}
                  download
                  target="_blank"
                >
                  <DownloadCloud className="h-4 w-4" />
                  Download book
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            {resumeBanner && (
              <div
                role="status"
                className="flex items-center justify-center gap-3 border-b border-accent/10 bg-secondary/10 px-4 py-2 md:px-6"
              >
                <span
                  className={cn(
                    poppins_500,
                    "text-xs text-ink-muted sm:text-sm"
                  )}
                >
                  Resumed at page {resumeBanner}
                </span>
                <button
                  type="button"
                  onClick={handleStartOver}
                  className={cn(
                    poppins_600,
                    "inline-flex items-center gap-1.5 rounded-lg border border-accent/20 bg-surface-raised px-2.5 py-1 text-xs text-accent transition-colors hover:border-secondary/40"
                  )}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Start over
                </button>
                <button
                  type="button"
                  onClick={() => setResumeBanner(null)}
                  aria-label="Dismiss resume notice"
                  className="inline-flex size-6 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-accent"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Scrollable stage with centered PDF sheet */}
            <div
              ref={containerRef}
              className="relative flex-1 overflow-auto bg-surface"
            >
              <div className="flex min-h-full w-full items-start justify-center px-4 py-8 md:px-10">
                <canvas
                  ref={canvasRef}
                  className="transition-transform duration-300"
                  style={{
                    backgroundColor: "var(--color-surface-raised)",
                    borderRadius: "0.75rem",
                    boxShadow:
                      "0 10px 40px -12px rgba(0,0,0,0.28), 0 2px 8px -2px rgba(0,0,0,0.12)",
                  }}
                />
                {(renderingPage || isTransitioning) && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-surface/40 backdrop-blur-sm">
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-accent/5 bg-surface-raised/90 shadow-sm">
                      <Loader2 className="h-6 w-6 animate-spin text-accent" />
                    </div>
                  </div>
                )}
              </div>

              {/* Floating prev / next controls */}
              <button
                type="button"
                onClick={() => goToPage(-1)}
                disabled={pageNumber <= 1 || isTransitioning}
                aria-label="Previous page"
                className="fixed left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-accent/10 bg-surface-raised/90 text-ink-muted shadow-md backdrop-blur transition-colors hover:border-secondary/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-0 md:left-6"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => goToPage(1)}
                disabled={
                  isTransitioning ||
                  (pageCount ? pageNumber >= pageCount : true)
                }
                aria-label="Next page"
                className="fixed right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-accent/10 bg-surface-raised/90 text-ink-muted shadow-md backdrop-blur transition-colors hover:border-secondary/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-0 md:right-6"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Bottom bar: page nav + thumbnails */}
            <div className="sticky bottom-0 z-20 border-t border-accent/10 bg-surface-raised/85 px-4 py-2.5 backdrop-blur md:px-6">
              <div className="flex items-center gap-3">
                <div className="flex shrink-0 items-center gap-1.5">
                  <IconButton
                    onClick={() => goToPage(-1)}
                    disabled={pageNumber <= 1 || isTransitioning}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </IconButton>
                  <span
                    className={cn(
                      poppins_500,
                      "min-w-[4.5rem] text-center text-xs text-ink-muted"
                    )}
                  >
                    {pageNumber}
                    {pageCount ? ` / ${pageCount}` : ""}
                  </span>
                  <IconButton
                    onClick={() => goToPage(1)}
                    disabled={
                      isTransitioning ||
                      (pageCount ? pageNumber >= pageCount : true)
                    }
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </IconButton>
                </div>

                {pageCount > 1 && (
                  <div className="flex flex-1 items-center gap-3">
                    {/* Page scrubber — O(1) DOM, no per-page buttons */}
                    <input
                      type="range"
                      min={1}
                      max={pageCount}
                      value={pageNumber}
                      onChange={(event) =>
                        jumpToPage(Number(event.target.value))
                      }
                      aria-label="Scrub through pages"
                      className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-accent/15 accent-accent"
                    />

                    {/* Jump-to-page input, validated 1..pageCount */}
                    <div className="flex shrink-0 items-center gap-1.5">
                      <label
                        htmlFor="reader-go-to-page"
                        className={cn(
                          poppins_500,
                          "text-xs text-ink-muted"
                        )}
                      >
                        Go to
                      </label>
                      <input
                        id="reader-go-to-page"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={pageCount}
                        value={pageInput}
                        onChange={(event) => setPageInput(event.target.value)}
                        onBlur={commitPageInput}
                        onKeyDown={handlePageInputKeyDown}
                        aria-label={`Go to page (1 to ${pageCount})`}
                        className={cn(
                          poppins_600,
                          "w-16 rounded-lg border border-accent/15 bg-surface px-2 py-1 text-center text-xs text-ink outline-none focus:border-secondary/50"
                        )}
                      />
                      <span
                        className={cn(
                          poppins_500,
                          "text-xs text-ink-muted"
                        )}
                      >
                        / {pageCount}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default BookReaderClient;
