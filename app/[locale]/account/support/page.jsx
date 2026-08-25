"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import Button from "@/components/atoms/form/Button";
import { Textarea } from "@/components/ui/textarea";
import FileInput from "@/components/atoms/form/FileInput";
import DashTabs from "@/components/atoms/dashboard/DashTabs";
import {
  LifeBuoy,
  Ticket,
  MessageSquareText,
  Paperclip,
  Mail,
  BookOpen,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

/* ── building blocks (design-system consistent) ── */

const Panel = ({ className, children }) => (
  <div
    className={cn(
      "rounded-2xl border border-accent/10 bg-surface-raised shadow-sm",
      className
    )}
  >
    {children}
  </div>
);

const CardHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3">
    {Icon && (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
        <Icon className="h-5 w-5 text-accent" />
      </div>
    )}
    <div>
      <h2 className={cn(poppins_600, "text-lg text-ink")}>{title}</h2>
      {description && (
        <p className={cn(poppins_400, "mt-1 text-sm text-ink-muted")}>
          {description}
        </p>
      )}
    </div>
  </div>
);

const FieldLabel = ({ htmlFor, children, hint }) => (
  <span className="mb-1.5 block">
    <label
      htmlFor={htmlFor}
      className={cn(poppins_500, "text-sm text-ink")}
    >
      {children}
    </label>
    {hint && (
      <span className={cn(poppins_400, "ml-1 text-xs text-ink-muted")}>
        {hint}
      </span>
    )}
  </span>
);

const SUPPORT_CHANNELS = [
  {
    icon: Mail,
    title: "Email us",
    text: "support@deenbridge.com — we reply within one business day.",
  },
  {
    icon: Clock,
    title: "Response time",
    text: "Most tickets are resolved in under 24 hours, insha'Allah.",
  },
  {
    icon: BookOpen,
    title: "Help center",
    text: "Browse guides and FAQs for quick answers before opening a ticket.",
  },
];

const ReportIssue = () => {
  const [modal, setModal] = useState(false);
  const modalHandler = () => setModal(!modal);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleImageChange = (e) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

  };
  return (
    <div className="min-h-full bg-surface p-4 sm:p-6">
      {/* <DashTabs selectedTab={as}/> */}
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Hero header */}
        <Panel className="relative overflow-hidden bg-gradient-to-br from-secondary/10 via-surface-raised to-highlight/10 p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-accent/5 bg-gradient-to-br from-secondary/20 to-highlight/10">
              <LifeBuoy className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1
                className={cn(
                  poppins_600,
                  "bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text text-2xl text-transparent sm:text-3xl"
                )}
              >
                Support
              </h1>
              <p
                className={cn(
                  poppins_400,
                  "mt-1 max-w-xl text-sm leading-relaxed text-ink-muted"
                )}
              >
                Having an issue? Tell us what happened and our team will attend
                to it as soon as possible.
              </p>
            </div>
          </div>
        </Panel>

        {/* Main: form (2/3) + sidebar (1/3) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Report a ticket */}
          <Panel className="p-6 lg:col-span-2">
            <CardHeader
              icon={Ticket}
              title="Report an issue"
              description="Describe your problem in detail so we can resolve it quickly."
            />
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <div>
                <FieldLabel htmlFor="report-subject">Subject</FieldLabel>
                <Input
                  type="text"
                  id="report-subject"
                  name="report-subject"
                  placeholder="Input subject"
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className={cn(
                    poppins_400,
                    "w-full rounded-xl border border-accent/15 bg-surface px-4 py-3 text-base text-ink outline-none placeholder:text-ink-muted/60 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  )}
                />
              </div>

              <div>
                <FieldLabel htmlFor="report-description">
                  Description
                </FieldLabel>
                <Textarea
                  name="report-description"
                  id="report-description"
                  placeholder="Explain what is happening here"
                  className={cn(
                    poppins_400,
                    "h-[140px] w-full rounded-xl border border-accent/15 bg-surface px-4 py-3 text-base text-ink outline-none placeholder:text-ink-muted/60 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  )}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></Textarea>
              </div>

              <div>
                <FieldLabel
                  htmlFor="report-file"
                  hint="(This will help our team to understand the issue more)"
                >
                  Upload file
                </FieldLabel>
                <FileInput
                  id="report-file"
                  file={image}
                  onChange={handleImageChange}
                />
              </div>

              <div className="border-t border-accent/10 pt-5">
                <Button
                  round
                  wide
                  loading={loading}
                  type="submit"
                  className="py-3"
                >
                  Create a ticket
                </Button>
              </div>
            </form>
          </Panel>

          {/* Sidebar: how to reach us */}
          <div className="space-y-6">
            <Panel className="p-6">
              <CardHeader
                icon={MessageSquareText}
                title="Other ways to reach us"
              />
              <ul className="mt-5 space-y-4">
                {SUPPORT_CHANNELS.map((channel) => (
                  <li key={channel.title} className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
                      <channel.icon className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className={cn(poppins_500, "text-sm text-ink")}>
                        {channel.title}
                      </p>
                      <p
                        className={cn(
                          poppins_400,
                          "mt-0.5 text-xs leading-relaxed text-ink-muted"
                        )}
                      >
                        {channel.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel className="p-6">
              <CardHeader icon={Paperclip} title="Tips for a faster fix" />
              <ul
                className={cn(
                  poppins_400,
                  "mt-4 space-y-3 text-sm text-ink-muted"
                )}
              >
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  Include a clear subject that summarizes the problem.
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  Add the steps that led to the issue in the description.
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  Attach a screenshot so our team can see what you see.
                </li>
              </ul>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReportIssue;
