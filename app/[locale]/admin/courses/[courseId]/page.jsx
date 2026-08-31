"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Play, BookOpen, FileText, Settings, ShieldAlert, Calendar, BarChart3, Tag } from "lucide-react";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getCourseById } from "@/lib/actions/courses/get-course";
import ReactMarkdown from "react-markdown";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const VidPlayerBox = dynamic(() => import("@/components/atoms/dashboard/vid-player-box"), { ssr: false });

export default function AdminCourseReviewPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourseById(courseId).then(setCourse).finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <PageShell><Skeleton className="h-96" /></PageShell>;
  if (!course) return <PageShell>Course not found.</PageShell>;

  return (
    <PageShell>
      <PageHeader icon={Settings} title="Course Review" subtitle={course.title} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border border-accent/10 bg-surface-raised">
            <h2 className="text-lg font-semibold mb-4">Curriculum</h2>
            <Accordion type="multiple" className="w-full">
              {course.curriculum?.map((section, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger>{section.title}</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    {section.lessons?.map((lesson, lIdx) => (
                      <div key={lIdx} className="p-3 rounded-lg bg-surface border border-accent/5">
                        <div className="flex items-center gap-2 mb-2">
                          {lesson.type === 'video' ? <Play className="w-4 h-4 text-secondary" /> : <FileText className="w-4 h-4 text-accent" />}
                          <span className="font-medium">{lesson.title}</span>
                        </div>
                        {lesson.type === 'video' && (
                          <div className="aspect-video w-full overflow-hidden rounded-lg">
                            <VidPlayerBox src={lesson.videoUrl} />
                          </div>
                        )}
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <div className="p-6 rounded-2xl border border-accent/10 bg-surface-raised">
            <h3 className="text-lg font-semibold mb-4">Description</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{course.description}</ReactMarkdown>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-accent/10 bg-surface-raised">
            <h3 className="text-lg font-semibold mb-4">Metadata</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Price:</span><span className="font-medium">{course.price === 0 ? 'Free' : `$${course.price}`}</span></div>
              <div className="flex justify-between"><span>Published:</span><span className="font-medium">{new Date(course.createdAt).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span>Rating:</span><span className="font-medium">{course.reviews?.length || 0} reviews</span></div>
            </dl>
          </div>
          <div className="p-6 rounded-2xl border border-destructive/20 bg-destructive/5">
            <div className="flex items-center gap-2 text-destructive font-semibold mb-2">
              <ShieldAlert className="w-5 h-5" /> Flag History
            </div>
            <p className="text-sm opacity-80">{course.flags?.length || 0} flags reported for this content.</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}