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
  Sparkles,
} from "lucide-react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js?url";

GlobalWorkerOptions.workerSrc = workerSrc;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const INITIAL_SCALE = 1.2;

const BookReaderClient = ({ book }) => {
  const { user } = useAuth();
  const hasBook = useHasBook(book?._id);

  const docRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

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
        const loadingTask = getDocument({ data: new Uint8Array(buffer) });
        const pdf = await loadingTask.promise;

        if (cancelled) {
          pdf.destroy();
          return;
        }

        docRef.current?.destroy?.();
        docRef.current = pdf;
        setPageCount(pdf.numPages);
        setPageNumber((prev) => clamp(prev, 1, pdf.numPages));
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

  const handleZoom = (direction) => {
    setFitWidth(false);
    setBaseScale((prev) =>
      clamp(prev + direction * 0.15, MIN_SCALE, MAX_SCALE)
    );
  };

  if (!book) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 text-center">
        <p className="text-lg font-semibold text-muted-foreground">
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
    );
  }

  if (!canAccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          You don&apos;t have access to this book yet.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Please purchase this title first or return to the book page to learn
          more.
        </p>
        <div className="mt-6 flex gap-3">
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
            View Book Details
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-muted via-white to-muted">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-white/80 px-4 py-3 backdrop-blur md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/library/${book._id}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-text transition hover:text-highlight"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to details
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {book.title}
              </h1>
              {book.author?.name && (
                <p className="text-xs text-muted-foreground">
                  by {book.author.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              round
              outlined
              className="text-normal"
              to={`/dashboard/library/${book._id}`}
            >
              Book Details
            </Button>
            {book.fileUrl && (
              <Button
                round
                outlined
                className="flex items-center gap-2 text-normal"
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

      <main className="flex flex-1 flex-col gap-4 px-4 py-4 md:px-8">
        {!book.fileUrl ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-muted-foreground/30 bg-white text-center shadow-sm">
            <div>
              <p className="text-lg font-semibold text-muted-foreground">
                This book file is not available yet.
              </p>
              <p className="mt-2 text-sm text-muted-foreground/80">
                Please contact support if you believe this is a mistake.
              </p>
            </div>
          </div>
        ) : loadingDocument && !docRef.current ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-muted-foreground/30 bg-white text-center shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-brand-text" />
            <p className="text-sm text-muted-foreground">
              Preparing your reading experience...
            </p>
          </div>
        ) : pdfError ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-rose-300/60 bg-rose-50 text-center shadow-sm">
            <div>
              <p className="text-lg font-semibold text-rose-700">{pdfError}</p>
              <p className="mt-2 text-sm text-rose-600">
                Try reloading the page or download the book to continue reading.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/40 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2 font-medium text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-brand-text" />
                  Page {pageNumber}
                  {pageCount ? ` / ${pageCount}` : ""}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded-full border border-border/70 p-2 text-muted-foreground transition hover:border-accent hover:text-brand-text disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => goToPage(-1)}
                    disabled={pageNumber <= 1 || isTransitioning}
                    aria-label="Previous page"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-border/70 p-2 text-muted-foreground transition hover:border-accent hover:text-brand-text disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => goToPage(1)}
                    disabled={
                      isTransitioning ||
                      (pageCount ? pageNumber >= pageCount : true)
                    }
                    aria-label="Next page"
                  >
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-full border border-border/70 p-2 text-muted-foreground transition hover:border-accent hover:text-brand-text disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => handleZoom(-1)}
                  disabled={fitWidth || baseScale <= MIN_SCALE}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="w-16 text-center text-sm font-semibold text-muted-foreground">
                  {(effectiveScale * 100).toFixed(0)}%
                </span>
                <button
                  type="button"
                  className="rounded-full border border-border/70 p-2 text-muted-foreground transition hover:border-accent hover:text-brand-text disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => handleZoom(1)}
                  disabled={fitWidth || baseScale >= MAX_SCALE}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="ml-2 inline-flex items-center gap-1 rounded-full border border-border/70 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-accent hover:text-brand-text"
                  onClick={() => setFitWidth((prev) => !prev)}
                >
                  {fitWidth ? (
                    <>
                      <Minimize2 className="h-3.5 w-3.5" />
                      Fit Width
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-3.5 w-3.5" />
                      Free Zoom
                    </>
                  )}
                </button>
              </div>
            </div>

            <div
              ref={containerRef}
              className="relative flex-1 overflow-auto rounded-3xl border border-border/40 bg-white shadow-lg"
            >
              <div className="relative flex h-full w-full items-start justify-center px-6 py-8">
                <canvas
                  ref={canvasRef}
                  className="shadow-2xl transition-transform duration-300"
                  style={{
                    backgroundColor: "#fafafa",
                    borderRadius: "1.25rem",
                  }}
                />
                {(renderingPage || isTransitioning) && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl bg-white/40 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-text" />
                  </div>
                )}
              </div>
            </div>

            {pageCount > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-border/40 bg-white px-4 py-3 shadow-sm">
                {Array.from({ length: pageCount }).map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={`page-thumb-${page}`}
                      type="button"
                      onClick={() => setPageNumber(page)}
                      className={`rounded-xl border px-3 py-1 text-xs font-semibold transition ${
                        pageNumber === page
                          ? "border-accent bg-accent text-white shadow"
                          : "border-transparent bg-muted/70 text-muted-foreground hover:border-accent/30 hover:text-brand-text"
                      }`}
                    >
                      Page {page}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default BookReaderClient;
