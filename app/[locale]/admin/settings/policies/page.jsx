"use client";

import { useState, useCallback, useMemo } from "react";
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
  Settings,
  Save,
  RefreshCw,
  Clock,
  CreditCard,
  Users,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Info,
  History,
  ArrowRight,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import { format } from "date-fns";

// Policy definitions with validation rules
const POLICY_DEFINITIONS = {
  verificationSlaDays: {
    id: "verificationSlaDays",
    label: "Verification SLA (Days)",
    description: "Maximum days to complete educator verification",
    icon: Clock,
    category: "User Management",
    consumedBy: ["Educator Verification Module", "Admin Dashboard"],
    min: 1,
    max: 30,
    unit: "days",
  },
  refundWindowDays: {
    id: "refundWindowDays",
    label: "Refund Window (Days)",
    description: "Days after purchase that refunds are allowed",
    icon: CreditCard,
    category: "Payments",
    consumedBy: ["Payment Service", "Refund Processor"],
    min: 0,
    max: 90,
    unit: "days",
  },
  bulkActionCap: {
    id: "bulkActionCap",
    label: "Bulk Action Cap",
    description: "Maximum items per bulk action request",
    icon: Users,
    category: "Admin Operations",
    consumedBy: ["Admin Bulk Actions", "User Management"],
    min: 10,
    max: 1000,
    unit: "items",
  },
  reportAgingThresholdDays: {
    id: "reportAgingThresholdDays",
    label: "Report Aging Threshold (Days)",
    description: "Days before unresolved reports are escalated",
    icon: AlertTriangle,
    category: "Moderation",
    consumedBy: ["Moderation Queue", "Report Escalation"],
    min: 1,
    max: 14,
    unit: "days",
  },
};

// Mock current values
const initialValues = {
  verificationSlaDays: { value: 7, lastEditedBy: "admin@deenbridge.com", lastEditedAt: "2024-01-10T14:30:00Z" },
  refundWindowDays: { value: 30, lastEditedBy: "admin@deenbridge.com", lastEditedAt: "2024-01-08T10:00:00Z" },
  bulkActionCap: { value: 100, lastEditedBy: "support@deenbridge.com", lastEditedAt: "2024-01-05T16:00:00Z" },
  reportAgingThresholdDays: { value: 3, lastEditedBy: "moderator@deenbridge.com", lastEditedAt: "2024-01-12T09:00:00Z" },
};

export default function PoliciesEditorPage() {
  const [values, setValues] = useState(initialValues);
  const [editedValues, setEditedValues] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDiffPreview, setShowDiffPreview] = useState(false);

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    return Object.keys(editedValues).length > 0;
  }, [editedValues]);

  // Get diff between current and edited values
  const getDiff = useMemo(() => {
    const changes = [];
    Object.entries(editedValues).forEach(([key, newValue]) => {
      const oldValue = values[key].value;
      if (oldValue !== newValue) {
        changes.push({
          policyId: key,
          label: POLICY_DEFINITIONS[key].label,
          oldValue,
          newValue,
          unit: POLICY_DEFINITIONS[key].unit,
        });
      }
    });
    return changes;
  }, [editedValues, values]);

  // Validate a policy value
  const validateValue = useCallback((policyId, value) => {
    const def = POLICY_DEFINITIONS[policyId];
    const numValue = parseInt(value, 10);

    if (isNaN(numValue)) {
      return "Value must be a number";
    }
    if (numValue < def.min) {
      return `Minimum value is ${def.min}`;
    }
    if (numValue > def.max) {
      return `Maximum value is ${def.max}`;
    }
    return null;
  }, []);

  // Handle value change
  const handleValueChange = useCallback((policyId, value) => {
    const error = validateValue(policyId, value);

    setErrors((prev) => ({
      ...prev,
      [policyId]: error,
    }));

    if (!error) {
      const numValue = parseInt(value, 10);
      if (numValue === values[policyId].value) {
        // Remove from edited if same as original
        setEditedValues((prev) => {
          const next = { ...prev };
          delete next[policyId];
          return next;
        });
      } else {
        setEditedValues((prev) => ({
          ...prev,
          [policyId]: numValue,
        }));
      }
    }
  }, [values, validateValue]);

  // Save changes
  const handleSave = useCallback(async () => {
    setSaving(true);
    setShowDiffPreview(false);

    // Simulate API call and audit logging
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update values
    setValues((prev) => {
      const updated = { ...prev };
      Object.entries(editedValues).forEach(([key, value]) => {
        updated[key] = {
          value,
          lastEditedBy: "admin@deenbridge.com", // Would come from session
          lastEditedAt: new Date().toISOString(),
        };
      });
      return updated;
    });

    setEditedValues({});
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, [editedValues]);

  // Reset to original values
  const handleReset = useCallback(() => {
    setEditedValues({});
    setErrors({});
  }, []);

  // Get current display value
  const getDisplayValue = useCallback((policyId) => {
    return editedValues[policyId] ?? values[policyId].value;
  }, [editedValues, values]);

  // Check if value is modified
  const isModified = useCallback((policyId) => {
    return policyId in editedValues;
  }, [editedValues]);

  return (
    <PageShell>
      <PageHeader
        icon={Settings}
        title="Platform Policy Values"
        subtitle="Centralized editor for numeric policy configurations"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={() => setShowDiffPreview(true)}
              disabled={!hasChanges || Object.keys(errors).some((k) => errors[k])}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : saved ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {saved ? "Saved!" : "Review Changes"}
            </Button>
          </div>
        }
      />

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex items-center gap-3 py-4">
          <Info className="h-5 w-5 text-blue-600" />
          <div>
            <p className={cn(poppins_500.className, "text-sm text-blue-800")}>
              Policy Value Editor
            </p>
            <p className={cn(poppins_400.className, "text-xs text-blue-700")}>
              Changes to these values will be audited and may affect multiple platform modules.
              A diff preview will be shown before saving.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Policy Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {Object.values(POLICY_DEFINITIONS).map((policy) => {
          const Icon = policy.icon;
          const currentValue = values[policy.id];
          const displayValue = getDisplayValue(policy.id);
          const modified = isModified(policy.id);
          const error = errors[policy.id];

          return (
            <Card
              key={policy.id}
              className={cn(
                "transition-all",
                modified && "border-amber-300 bg-amber-50/50",
                error && "border-red-300 bg-red-50/50"
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      modified ? "bg-amber-100" : "bg-muted"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        modified ? "text-amber-600" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {policy.label}
                        {modified && (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            Modified
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{policy.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Value Input */}
                <div className="space-y-2">
                  <Label htmlFor={policy.id}>Value ({policy.unit})</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={policy.id}
                      type="number"
                      min={policy.min}
                      max={policy.max}
                      value={displayValue}
                      onChange={(e) => handleValueChange(policy.id, e.target.value)}
                      className={cn(
                        "w-32",
                        error && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    <span className="text-sm text-muted-foreground">
                      Range: {policy.min} - {policy.max} {policy.unit}
                    </span>
                  </div>
                  {error && (
                    <p className="text-xs text-red-600">{error}</p>
                  )}
                </div>

                {/* Metadata */}
                <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <Badge variant="outline">{policy.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Consumed by:</span>
                    <span className="text-xs">{policy.consumedBy.join(", ")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <History className="h-3 w-3" />
                      Last edited:
                    </span>
                    <span className="text-xs">
                      {currentValue.lastEditedBy} on{" "}
                      {format(new Date(currentValue.lastEditedAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Diff Preview Dialog */}
      <Dialog open={showDiffPreview} onOpenChange={setShowDiffPreview}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Changes</DialogTitle>
            <DialogDescription>
              The following policy values will be updated. This action will be logged.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {getDiff.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No changes to save
              </p>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy</TableHead>
                      <TableHead className="text-right">Current</TableHead>
                      <TableHead className="w-8"></TableHead>
                      <TableHead className="text-right">New</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getDiff.map((change) => (
                      <TableRow key={change.policyId}>
                        <TableCell className={cn(poppins_500.className, "text-sm")}>
                          {change.label}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-red-600 line-through">
                            {change.oldValue} {change.unit}
                          </span>
                        </TableCell>
                        <TableCell>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-green-600 font-medium">
                            {change.newValue} {change.unit}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-xs text-amber-700">
                These changes will take effect immediately and be recorded in the audit log.
                Affected modules may require a refresh to reflect the new values.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiffPreview(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || getDiff.length === 0}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
