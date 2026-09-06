"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Send,
  Users,
  User,
  Globe,
  Loader2,
  Check,
  AlertTriangle,
  FileText,
  Braces,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import {
  listEmailTemplates,
  applyEmailTemplate,
  estimateEmailRecipients,
  sendEmailBroadcast,
} from "@/lib/actions/admin-emails";

const ROLES = [
  { id: "student", label: "Student" },
  { id: "mentor", label: "Educator" },
  { id: "admin", label: "Admin" },
  { id: "moderator", label: "Moderator" },
];

function RecipientEstimate({ estimate, loading }) {
  if (loading) return <Skeleton className="h-6 w-28 rounded-md" />;
  if (!estimate.known) {
    return (
      <span className="inline-flex items-baseline gap-1 text-foreground">
        <span className="text-2xl">—</span>
        <span className="text-xs text-muted-foreground">unknown</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-baseline gap-1 text-foreground">
      <span className="text-2xl">{estimate.estimate.toLocaleString()}</span>
      <span className="text-xs text-muted-foreground">recipients</span>
    </span>
  );
}

export default function EmailBroadcastPage() {
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templateId, setTemplateId] = useState("announcement");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("everyone");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState("");
  const [estimate, setEstimate] = useState({ estimate: null, known: false });
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentJob, setSentJob] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    listEmailTemplates()
      .then(({ templates }) => {
        if (active) {
          setTemplates(templates);
          setTemplatesLoading(false);
        }
      })
      .catch(() => {
        if (active) setTemplatesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Recipient estimate is re-fetched whenever the audience segment changes,
  // so the count (or an honest "—") is always shown before send.
  useEffect(() => {
    let active = true;
    setEstimateLoading(true);
    estimateEmailRecipients({
      audience,
      roles: selectedRoles,
      userIds: selectedUsers,
    })
      .then((result) => {
        if (active) {
          setEstimate(result);
          setEstimateLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setEstimate({ estimate: null, known: false });
          setEstimateLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [audience, selectedRoles, selectedUsers]);

  const selectedTemplate = useMemo(
    () =>
      templates.find((template) => template.id === templateId) ||
      templates[0] ||
      null,
    [templates, templateId]
  );

  // Subject/body mapping straight from composer content via the template.
  const mapped = useMemo(
    () =>
      selectedTemplate
        ? applyEmailTemplate(selectedTemplate, { title, content })
        : { subject: "", body: "" },
    [selectedTemplate, title, content]
  );

  const toggleRole = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((role) => role !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSend = async () => {
    if (!selectedTemplate) return;
    setSending(true);
    setError(null);
    try {
      const result = await sendEmailBroadcast({
        templateId: selectedTemplate.id,
        subject: mapped.subject,
        body: mapped.body,
        audience,
        roles: selectedRoles,
        userIds: selectedUsers,
        estimatedRecipients: estimate.known ? estimate.estimate : null,
      });
      setSentJob(result.job);
    } catch (err) {
      setError(err?.message || "Failed to send email broadcast");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        icon={Mail}
        title="Email Broadcast"
        subtitle="Send templated emails to your audience — delivery is handled by the backend"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — compose + template */}
        <div className="space-y-6 lg:col-span-2">
          {/* Composer content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Compose Content
              </CardTitle>
              <CardDescription>
                Title and content map onto the selected template&apos;s subject
                and body.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-title">Title</Label>
                <Input
                  id="email-title"
                  placeholder="Enter announcement title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-content">Content</Label>
                <Textarea
                  id="email-content"
                  placeholder="Write the email body content..."
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Template picker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Braces className="h-4 w-4" />
                Email Template
              </CardTitle>
              <CardDescription>
                Choose a template — its placeholders fill from your content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {templatesLoading ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : (
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger id="email-template" className="w-full">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedTemplate && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className={cn(poppins_500.className, "text-sm")}>
                    {selectedTemplate.label}
                  </p>
                  <p className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
                    {selectedTemplate.description}
                  </p>
                </div>
              )}
              <p className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
                Placeholders: {"{title}"} → subject · {"{content}"} → body
              </p>
            </CardContent>
          </Card>

          {/* Audience + recipient estimate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Audience
              </CardTitle>
              <CardDescription>
                Who should receive this email?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={audience}
                onValueChange={setAudience}
                className="space-y-3"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="everyone" id="email-everyone" />
                  <Label htmlFor="email-everyone" className="flex items-center gap-2 cursor-pointer">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    Everyone
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="role" id="email-by-role" />
                  <Label htmlFor="email-by-role" className="flex items-center gap-2 cursor-pointer">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    By Role
                  </Label>
                </div>
                {audience === "role" && (
                  <div className="ml-7 flex flex-wrap gap-2">
                    {ROLES.map((role) => (
                      <div key={role.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`email-role-${role.id}`}
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                        />
                        <Label htmlFor={`email-role-${role.id}`} className="text-sm cursor-pointer">
                          {role.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="specific" id="email-specific" />
                  <Label htmlFor="email-specific" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Specific Users
                  </Label>
                </div>
                {audience === "specific" && (
                  <div className="ml-7">
                    <Input
                      placeholder="Enter user IDs or emails, separated by commas"
                      value={selectedUsers}
                      onChange={(e) => setSelectedUsers(e.target.value)}
                    />
                  </div>
                )}
              </RadioGroup>

              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div className="space-y-0.5">
                  <p className={cn(poppins_500.className, "text-sm")}>
                    Estimated Recipients
                  </p>
                  <p className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
                    Unknown counts show "—", never a fabricated zero
                  </p>
                </div>
                <RecipientEstimate estimate={estimate} loading={estimateLoading} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — preview + send */}
        <div className="space-y-6">
          {/* Email preview (subject/body mapping) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4" />
                Email Preview
              </CardTitle>
              <CardDescription>
                How the email will look to recipients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className={cn(poppins_500.className, "text-xs uppercase tracking-wider text-muted-foreground")}>
                  Subject
                </p>
                <p className={cn(poppins_600.className, "mt-1 text-sm")}>
                  {mapped.subject || "—"}
                </p>
              </div>
              <div>
                <p className={cn(poppins_500.className, "text-xs uppercase tracking-wider text-muted-foreground")}>
                  Body
                </p>
                <div className="mt-1 whitespace-pre-line rounded-lg border bg-muted/30 p-3">
                  <p className={cn(poppins_400.className, "text-sm text-muted-foreground")}>
                    {mapped.body || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Send */}
          <Card>
            <CardContent className="space-y-3 p-5">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              {sentJob && (
                <div className="flex items-center gap-2 rounded-lg border border-green-600/30 bg-green-500/10 px-3 py-2 text-sm text-green-700">
                  <Check className="h-4 w-4 shrink-0" />
                  Queued — job {sentJob.id} · backend will deliver
                </div>
              )}
              <Button
                className="w-full"
                onClick={handleSend}
                disabled={
                  sending || !selectedTemplate || !title.trim() || !content.trim()
                }
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Email
              </Button>
              <p className={cn(poppins_400.className, "text-center text-xs text-muted-foreground")}>
                Sending is delegated to a backend job — the UI only enqueues it.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
