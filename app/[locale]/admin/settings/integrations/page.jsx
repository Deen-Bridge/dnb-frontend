"use client";

import { useState, useCallback } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Key,
  Webhook,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Send,
  Clock,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import { format } from "date-fns";

// Webhook event types
const WEBHOOK_EVENTS = [
  { id: "user.created", label: "User Created", category: "Users" },
  { id: "user.updated", label: "User Updated", category: "Users" },
  { id: "user.deleted", label: "User Deleted", category: "Users" },
  { id: "course.published", label: "Course Published", category: "Content" },
  { id: "course.purchased", label: "Course Purchased", category: "Payments" },
  { id: "book.purchased", label: "Book Purchased", category: "Payments" },
  { id: "payment.completed", label: "Payment Completed", category: "Payments" },
  { id: "payment.refunded", label: "Payment Refunded", category: "Payments" },
  { id: "review.created", label: "Review Created", category: "Content" },
  { id: "payout.processed", label: "Payout Processed", category: "Payments" },
];

// Mock API keys
const mockApiKeys = [
  {
    id: "key_1",
    name: "Production API Key",
    keyPrefix: "pk_live_",
    keySuffix: "...x4Ks",
    createdAt: "2024-01-10T10:00:00Z",
    lastUsed: "2024-01-15T14:30:00Z",
    isRevealed: false,
    fullKey: null,
  },
  {
    id: "key_2",
    name: "Development API Key",
    keyPrefix: "pk_test_",
    keySuffix: "...7Lm2",
    createdAt: "2024-01-05T09:00:00Z",
    lastUsed: "2024-01-14T11:00:00Z",
    isRevealed: false,
    fullKey: null,
  },
];

// Mock webhooks
const mockWebhooks = [
  {
    id: "wh_1",
    url: "https://example.com/webhooks/deenbridge",
    events: ["user.created", "course.purchased", "payment.completed"],
    isActive: true,
    lastDelivery: {
      status: "success",
      timestamp: "2024-01-15T14:00:00Z",
      responseCode: 200,
    },
    createdAt: "2024-01-08T10:00:00Z",
  },
  {
    id: "wh_2",
    url: "https://api.myapp.com/hooks",
    events: ["payment.completed", "payment.refunded"],
    isActive: true,
    lastDelivery: {
      status: "failed",
      timestamp: "2024-01-15T12:00:00Z",
      responseCode: 500,
    },
    createdAt: "2024-01-12T15:00:00Z",
  },
];

export default function IntegrationsPage() {
  const [apiKeys, setApiKeys] = useState(mockApiKeys);
  const [webhooks, setWebhooks] = useState(mockWebhooks);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);
  const [showRotateConfirm, setShowRotateConfirm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [newWebhook, setNewWebhook] = useState({ url: "", events: [] });
  const [revealedKey, setRevealedKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [loading, setLoading] = useState({});
  const [testingWebhook, setTestingWebhook] = useState(null);

  // Create new API key
  const handleCreateKey = useCallback(async () => {
    setLoading((prev) => ({ ...prev, createKey: true }));

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      keyPrefix: "pk_live_",
      keySuffix: "...new",
      createdAt: new Date().toISOString(),
      lastUsed: null,
      isRevealed: true,
      fullKey: `pk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    };

    setApiKeys((prev) => [newKey, ...prev]);
    setRevealedKey(newKey.id);
    setNewKeyName("");
    setShowCreateKey(false);
    setLoading((prev) => ({ ...prev, createKey: false }));
  }, [newKeyName]);

  // Reveal key (one-time only)
  const handleRevealKey = useCallback((keyId) => {
    // Security warning
    if (!window.confirm(
      "WARNING: This key will only be shown once. Make sure to copy it now. Are you sure you want to reveal it?"
    )) {
      return;
    }

    setApiKeys((prev) =>
      prev.map((key) =>
        key.id === keyId
          ? {
              ...key,
              isRevealed: true,
              fullKey: `${key.keyPrefix}${Math.random().toString(36).substring(2, 30)}`,
            }
          : key
      )
    );
    setRevealedKey(keyId);
  }, []);

  // Copy key to clipboard
  const handleCopyKey = useCallback(async (keyId, fullKey) => {
    await navigator.clipboard.writeText(fullKey);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  // Rotate API key
  const handleRotateKey = useCallback(async (keyId) => {
    setLoading((prev) => ({ ...prev, [keyId]: true }));
    setShowRotateConfirm(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setApiKeys((prev) =>
      prev.map((key) =>
        key.id === keyId
          ? {
              ...key,
              keySuffix: "...rot",
              isRevealed: true,
              fullKey: `${key.keyPrefix}${Math.random().toString(36).substring(2, 30)}`,
              createdAt: new Date().toISOString(),
            }
          : key
      )
    );
    setRevealedKey(keyId);
    setLoading((prev) => ({ ...prev, [keyId]: false }));
  }, []);

  // Delete API key
  const handleDeleteKey = useCallback(async (keyId) => {
    setLoading((prev) => ({ ...prev, [keyId]: true }));
    setShowDeleteConfirm(null);

    await new Promise((resolve) => setTimeout(resolve, 500));

    setApiKeys((prev) => prev.filter((key) => key.id !== keyId));
    setLoading((prev) => ({ ...prev, [keyId]: false }));
  }, []);

  // Create webhook
  const handleCreateWebhook = useCallback(async () => {
    if (!newWebhook.url || newWebhook.events.length === 0) return;

    setLoading((prev) => ({ ...prev, createWebhook: true }));

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const webhook = {
      id: `wh_${Date.now()}`,
      url: newWebhook.url,
      events: newWebhook.events,
      isActive: true,
      lastDelivery: null,
      createdAt: new Date().toISOString(),
    };

    setWebhooks((prev) => [webhook, ...prev]);
    setNewWebhook({ url: "", events: [] });
    setShowCreateWebhook(false);
    setLoading((prev) => ({ ...prev, createWebhook: false }));
  }, [newWebhook]);

  // Toggle webhook event
  const handleToggleEvent = useCallback((eventId) => {
    setNewWebhook((prev) => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter((e) => e !== eventId)
        : [...prev.events, eventId],
    }));
  }, []);

  // Test webhook ping
  const handleTestWebhook = useCallback(async (webhookId) => {
    setTestingWebhook(webhookId);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setWebhooks((prev) =>
      prev.map((wh) =>
        wh.id === webhookId
          ? {
              ...wh,
              lastDelivery: {
                status: Math.random() > 0.3 ? "success" : "failed",
                timestamp: new Date().toISOString(),
                responseCode: Math.random() > 0.3 ? 200 : 500,
              },
            }
          : wh
      )
    );

    setTestingWebhook(null);
  }, []);

  // Delete webhook
  const handleDeleteWebhook = useCallback(async (webhookId) => {
    setLoading((prev) => ({ ...prev, [webhookId]: true }));

    await new Promise((resolve) => setTimeout(resolve, 500));

    setWebhooks((prev) => prev.filter((wh) => wh.id !== webhookId));
    setLoading((prev) => ({ ...prev, [webhookId]: false }));
  }, []);

  return (
    <PageShell>
      <PageHeader
        icon={Key}
        title="API Keys & Webhooks"
        subtitle="Manage integrations with reveal-once key behavior and webhook endpoints"
      />

      {/* Security Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-center gap-3 py-4">
          <Shield className="h-5 w-5 text-amber-600" />
          <div>
            <p className={cn(poppins_500.className, "text-sm text-amber-800")}>
              Security Notice
            </p>
            <p className={cn(poppins_400.className, "text-xs text-amber-700")}>
              API keys are shown only once when created. Store them securely.
              Rotate keys immediately if you suspect they've been compromised.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="api-keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api-keys" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="api-keys">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">API Keys</CardTitle>
                <CardDescription>
                  Server-generated keys for API authentication
                </CardDescription>
              </div>
              <Button onClick={() => setShowCreateKey(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Key
              </Button>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No API keys created yet</p>
                  <p className="text-sm">Create your first API key to get started</p>
                </div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Key</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Used</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiKeys.map((key) => (
                        <TableRow key={key.id}>
                          <TableCell className={cn(poppins_500.className)}>
                            {key.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="rounded bg-muted px-2 py-1 text-sm">
                                {key.isRevealed && key.fullKey && revealedKey === key.id
                                  ? key.fullKey
                                  : `${key.keyPrefix}••••••••${key.keySuffix}`}
                              </code>
                              {key.isRevealed && key.fullKey && revealedKey === key.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyKey(key.id, key.fullKey)}
                                >
                                  {copiedKey === key.id ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(key.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {key.lastUsed
                              ? format(new Date(key.lastUsed), "MMM d, HH:mm")
                              : "Never"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowRotateConfirm(key.id)}
                                disabled={loading[key.id]}
                              >
                                {loading[key.id] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={() => setShowDeleteConfirm(key.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Webhook Endpoints</CardTitle>
                <CardDescription>
                  Configure endpoints to receive event notifications
                </CardDescription>
              </div>
              <Button onClick={() => setShowCreateWebhook(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Endpoint
              </Button>
            </CardHeader>
            <CardContent>
              {webhooks.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No webhook endpoints configured</p>
                  <p className="text-sm">Add an endpoint to receive event notifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <div
                      key={webhook.id}
                      className="rounded-lg border p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <code className="text-sm font-medium">{webhook.url}</code>
                          <div className="flex flex-wrap gap-1">
                            {webhook.events.map((event) => (
                              <Badge key={event} variant="secondary" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={webhook.isActive}
                            onCheckedChange={(checked) =>
                              setWebhooks((prev) =>
                                prev.map((wh) =>
                                  wh.id === webhook.id
                                    ? { ...wh, isActive: checked }
                                    : wh
                                )
                              )
                            }
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestWebhook(webhook.id)}
                            disabled={testingWebhook === webhook.id}
                          >
                            {testingWebhook === webhook.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDeleteWebhook(webhook.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {webhook.lastDelivery && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Last delivery:</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              webhook.lastDelivery.status === "success"
                                ? "text-green-600"
                                : "text-red-600"
                            )}
                          >
                            {webhook.lastDelivery.status === "success" ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {webhook.lastDelivery.responseCode}
                          </Badge>
                          <span className="text-muted-foreground">
                            {format(new Date(webhook.lastDelivery.timestamp), "MMM d, HH:mm")}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create API Key Dialog */}
      <Dialog open={showCreateKey} onOpenChange={setShowCreateKey}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Generate a new API key for authentication
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Key Name</Label>
              <Input
                placeholder="e.g., Production API Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-700">
                  The API key will only be shown once after creation. Make sure to
                  copy and store it securely.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateKey(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateKey}
              disabled={!newKeyName || loading.createKey}
            >
              {loading.createKey ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Key className="h-4 w-4 mr-2" />
              )}
              Create Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Webhook Dialog */}
      <Dialog open={showCreateWebhook} onOpenChange={setShowCreateWebhook}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Webhook Endpoint</DialogTitle>
            <DialogDescription>
              Configure a URL to receive event notifications
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Endpoint URL</Label>
              <Input
                placeholder="https://example.com/webhooks"
                value={newWebhook.url}
                onChange={(e) =>
                  setNewWebhook((prev) => ({ ...prev, url: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Events to Subscribe</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                {WEBHOOK_EVENTS.map((event) => (
                  <div key={event.id} className="flex items-center gap-2">
                    <Checkbox
                      id={event.id}
                      checked={newWebhook.events.includes(event.id)}
                      onCheckedChange={() => handleToggleEvent(event.id)}
                    />
                    <Label htmlFor={event.id} className="text-sm cursor-pointer">
                      {event.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateWebhook(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateWebhook}
              disabled={!newWebhook.url || newWebhook.events.length === 0 || loading.createWebhook}
            >
              {loading.createWebhook ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Webhook className="h-4 w-4 mr-2" />
              )}
              Add Endpoint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rotate Confirmation */}
      <Dialog open={!!showRotateConfirm} onOpenChange={() => setShowRotateConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Rotate API Key
            </DialogTitle>
            <DialogDescription>
              This will invalidate the current key and generate a new one.
              All applications using this key will need to be updated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRotateConfirm(null)}>
              Cancel
            </Button>
            <Button onClick={() => handleRotateKey(showRotateConfirm)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Rotate Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete API Key
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All applications using this key will
              lose access immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteKey(showDeleteConfirm)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
