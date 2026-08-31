"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Megaphone,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Eye,
  Send,
  Clock,
  Save,
  Trash2,
  Users,
  User,
  Globe,
  ChevronDown,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import { AnnouncementAnalytics } from "@/components/admin/announcement-analytics";

const DRAFT_KEY = "dnb-announcement-draft";

const ROLES = [
  { id: "student", label: "Student" },
  { id: "educator", label: "Educator" },
  { id: "admin", label: "Admin" },
  { id: "moderator", label: "Moderator" },
];

const INITIAL_FORM = {
  title: "",
  content: "",
  audience: "everyone",
  selectedRoles: [],
  selectedUsers: "",
  sendNow: true,
  scheduledTime: "",
  scheduledDate: "",
};

function loadDraft() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
  } catch {}
}

function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

function RichTextToolbar({ onCommand, onLink }) {
  const buttons = [
    { icon: Bold, command: "bold", label: "Bold" },
    { icon: Italic, command: "italic", label: "Italic" },
    { icon: List, command: "insertUnorderedList", label: "Bullet List" },
    { icon: ListOrdered, command: "insertOrderedList", label: "Numbered List" },
  ];

  return (
    <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
      {buttons.map(({ icon: Icon, command, label }) => (
        <Button
          key={command}
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title={label}
          onClick={() => onCommand(command)}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        title="Insert Link"
        onClick={onLink}
      >
        <Link className="h-4 w-4" />
      </Button>
    </div>
  );
}

function PreviewPane({ title, content, audience, selectedRoles }) {
  const audienceLabel =
    audience === "everyone"
      ? "Everyone"
      : audience === "role"
      ? `Roles: ${selectedRoles.join(", ") || "None selected"}`
      : "Specific Users";

  return (
    <div className="border rounded-lg overflow-hidden h-full">
      <div className="bg-muted/50 px-4 py-2 border-b">
        <p className={cn(poppins_500.className, "text-sm text-muted-foreground")}>Preview</p>
      </div>
      <div className="p-4">
        <Badge variant="secondary" className="mb-3">{audienceLabel}</Badge>
        <h3 className={cn(poppins_600.className, "text-lg mb-2")}>
          {title || "Untitled Announcement"}
        </h3>
        <div
          className={cn(poppins_400.className, "prose prose-sm dark:prose-invert max-w-none text-muted-foreground")}
          dangerouslySetInnerHTML={{ __html: content || "<p>No content yet...</p>" }}
        />
      </div>
    </div>
  );
}

export default function AnnouncementsPage() {
  const editorRef = useRef(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [hasDraft, setHasDraft] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [previewTab, setPreviewTab] = useState("write");
  const autoSaveTimer = useRef(null);

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      const { savedAt: _, ...draftData } = draft;
      setForm((prev) => ({ ...prev, ...draftData }));
      setHasDraft(true);
      setSavedAt(draft.savedAt);
    }
  }, []);

  // Autosave to localStorage
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      saveDraft(form);
      setSavedAt(new Date().toISOString());
    }, 2000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [form]);

  const updateForm = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const execCommand = useCallback((command) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
    syncContent();
  }, []);

  const insertLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) {
      document.execCommand("createLink", false, url);
      editorRef.current?.focus();
      syncContent();
    }
  }, []);

  const syncContent = useCallback(() => {
    if (editorRef.current) {
      updateForm("content", editorRef.current.innerHTML);
    }
  }, [updateForm]);

  const toggleRole = useCallback((roleId) => {
    setForm((prev) => {
      const roles = prev.selectedRoles.includes(roleId)
        ? prev.selectedRoles.filter((r) => r !== roleId)
        : [...prev.selectedRoles, roleId];
      return { ...prev, selectedRoles: roles };
    });
  }, []);

  const handleClearDraft = useCallback(() => {
    clearDraft();
    setForm(INITIAL_FORM);
    setHasDraft(false);
    setSavedAt(null);
    if (editorRef.current) editorRef.current.innerHTML = "";
  }, []);

  const handleSend = useCallback(async () => {
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSending(false);
    setSent(true);
    clearDraft();
    setTimeout(() => setSent(false), 3000);
  }, []);

  const handleSchedule = useCallback(async () => {
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSending(false);
    setSent(true);
    clearDraft();
    setTimeout(() => setSent(false), 3000);
  }, []);

  return (
    <PageShell>
      <PageHeader
        icon={Megaphone}
        title="Announcements"
        subtitle="Compose and send announcements to your audience"
        actions={
          <div className="flex items-center gap-2">
            {hasDraft && (
              <Button variant="outline" size="sm" onClick={handleClearDraft}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Draft
              </Button>
            )}
            <Badge variant={sent ? "default" : "secondary"} className="text-xs">
              {sent ? (
                <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Sent!</span>
              ) : savedAt ? (
                <span className="flex items-center gap-1"><Save className="h-3 w-3" /> Draft saved</span>
              ) : (
                "No draft"
              )}
            </Badge>
          </div>
        }
      />

      <Tabs value={previewTab} onValueChange={setPreviewTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="write">Compose</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="write">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Composer */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Announcement Title</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Enter announcement title..."
                    value={form.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                    className={cn(poppins_500.className)}
                  />
                </CardContent>
              </Card>

              {/* Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Content</CardTitle>
                  <CardDescription>Use the toolbar for formatting</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <RichTextToolbar onCommand={execCommand} onLink={insertLink} />
                  <div
                    ref={editorRef}
                    contentEditable
                    className={cn(
                      poppins_400.className,
                      "min-h-[250px] p-4 outline-none prose prose-sm dark:prose-invert max-w-none"
                    )}
                    onInput={syncContent}
                    onBlur={syncContent}
                    data-placeholder="Write your announcement..."
                    suppressContentEditableWarning
                  />
                </CardContent>
              </Card>

              {/* Audience Targeting */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Audience Targeting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={form.audience}
                    onValueChange={(v) => updateForm("audience", v)}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="everyone" id="everyone" />
                      <Label htmlFor="everyone" className="flex items-center gap-2 cursor-pointer">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        Everyone
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="role" id="by-role" />
                      <Label htmlFor="by-role" className="flex items-center gap-2 cursor-pointer">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        By Role
                      </Label>
                    </div>
                    {form.audience === "role" && (
                      <div className="ml-7 flex flex-wrap gap-2">
                        {ROLES.map((role) => (
                          <div key={role.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`role-${role.id}`}
                              checked={form.selectedRoles.includes(role.id)}
                              onCheckedChange={() => toggleRole(role.id)}
                            />
                            <Label htmlFor={`role-${role.id}`} className="text-sm cursor-pointer">
                              {role.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="specific" id="specific" />
                      <Label htmlFor="specific" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Specific Users
                      </Label>
                    </div>
                    {form.audience === "specific" && (
                      <div className="ml-7">
                        <Input
                          placeholder="Enter user IDs or emails, separated by commas"
                          value={form.selectedUsers}
                          onChange={(e) => updateForm("selectedUsers", e.target.value)}
                        />
                      </div>
                    )}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Scheduling */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className={cn(poppins_500.className)}>Send Immediately</Label>
                      <p className="text-xs text-muted-foreground">
                        {form.sendNow ? "Announcement will be sent right away" : "Schedule for later"}
                      </p>
                    </div>
                    <Switch
                      checked={form.sendNow}
                      onCheckedChange={(checked) => updateForm("sendNow", checked)}
                    />
                  </div>
                  {!form.sendNow && (
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Label className="text-xs">Date</Label>
                        <Input
                          type="date"
                          value={form.scheduledDate}
                          onChange={(e) => updateForm("scheduledDate", e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs">Time</Label>
                        <Input
                          type="time"
                          value={form.scheduledTime}
                          onChange={(e) => updateForm("scheduledTime", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Preview on desktop */}
            <div className="hidden lg:block">
              <div className="sticky top-6">
                <PreviewPane
                  title={form.title}
                  content={form.content}
                  audience={form.audience}
                  selectedRoles={form.selectedRoles}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Mobile preview tab */}
        <TabsContent value="preview">
          <div className="lg:hidden">
            <PreviewPane
              title={form.title}
              content={form.content}
              audience={form.audience}
              selectedRoles={form.selectedRoles}
            />
          </div>
        </TabsContent>

        {/* Analytics tab */}
        <TabsContent value="analytics">
          <AnnouncementAnalytics />
        </TabsContent>
      </Tabs>

      {/* Send Actions */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
        <Button variant="outline" onClick={handleClearDraft}>
          Discard
        </Button>
        {form.sendNow ? (
          <Button onClick={handleSend} disabled={sending || !form.title}>
            {sending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Now
          </Button>
        ) : (
          <Button onClick={handleSchedule} disabled={sending || !form.title || !form.scheduledDate || !form.scheduledTime}>
            {sending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Clock className="h-4 w-4 mr-2" />
            )}
            Schedule
          </Button>
        )}
      </div>
    </PageShell>
  );
}
