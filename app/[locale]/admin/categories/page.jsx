"use client";

/**
 * Category & Taxonomy Management UI (#481)
 *
 * Course categories manager for administrators:
 * - Lists all categories with live course counts and taxonomy order
 * - Create, rename with case-insensitive uniqueness validation
 * - Archive / Restore controls backed by the category activation flag
 * - Persistent ordering controls
 */

import { useState, useCallback, useEffect, useMemo } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FolderTree,
  Plus,
  ArrowUp,
  ArrowDown,
  Archive,
  ArchiveRestore,
  Edit2,
  MoreVertical,
  Search,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/config/axios.config";

export default function CategoryTaxonomyManagementPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'archived'

  // Modal States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form States
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState("");
  const [notification, setNotification] = useState(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await axiosInstance.get("/api/categories");
      const rows = Array.isArray(data) ? data : data?.categories;
      if (!Array.isArray(rows)) throw new Error("The categories response was invalid.");
      setCategories(rows.map((item, index) => ({
        ...item,
        id: item.id ?? item._id,
        description: item.description ?? "",
        courseCount: Number(item.courseCount ?? item.count ?? 0),
        order: Number(item.order ?? item.position ?? index + 1),
        status: item.status ?? (item.isActive === false || item.archived ? "archived" : "active"),
      })));
    } catch (error) {
      setCategories([]);
      setLoadError(error?.response?.data?.message || error?.message || "Could not load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const showNotification = (msg, type = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Case-insensitive duplicate check
  const validateCategoryName = (name, excludeId = null) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return "Category name cannot be empty.";
    }
    if (trimmed.length < 2) {
      return "Category name must be at least 2 characters.";
    }
    const duplicate = categories.find(
      (c) =>
        c.id !== excludeId &&
        c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      return `A category named '${duplicate.name}' already exists.`;
    }
    return null;
  };

  // Handle Create
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    const error = validateCategoryName(formData.name);
    if (error) {
      setFormError(error);
      return;
    }

    const newSlug = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setSaving(true);
    try {
      await axiosInstance.post("/api/categories", {
        name: formData.name.trim(),
        description: formData.description.trim(),
        order: categories.length + 1,
        isActive: true,
      });
      await loadCategories();
      setCreateDialogOpen(false);
      setFormData({ name: "", description: "" });
      setFormError("");
      showNotification(`Category '${formData.name.trim()}' created successfully.`);
    } catch (error) {
      setFormError(error?.response?.data?.message || "Could not create category. Please try again.");
    } finally { setSaving(false); }
  };

  // Handle Edit/Rename
  const handleEditCategory = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;

    const error = validateCategoryName(formData.name, selectedCategory.id);
    if (error) {
      setFormError(error);
      return;
    }

    setSaving(true);
    try {
      await axiosInstance.patch(`/api/categories/${selectedCategory.id}`, {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      await loadCategories();
      setEditDialogOpen(false);
      setSelectedCategory(null);
      setFormData({ name: "", description: "" });
      setFormError("");
      showNotification("Category updated successfully.");
    } catch (error) {
      setFormError(error?.response?.data?.message || "Could not update category. Please try again.");
    } finally { setSaving(false); }
  };

  // Handle Archive / Restore
  const handleToggleArchive = async () => {
    if (!selectedCategory) return;
    const isArchiving = selectedCategory.status === "active";
    setSaving(true);
    try {
      await axiosInstance.patch(`/api/categories/${selectedCategory.id}`, {
        isActive: !isArchiving,
      });
      // The public list endpoint filters inactive categories, so preserve the
      // successful archive locally until the next explicit reload.
      setCategories((current) => current.map((category) => category.id === selectedCategory.id
        ? { ...category, status: isArchiving ? "archived" : "active" }
        : category));
      setArchiveDialogOpen(false);
      setSelectedCategory(null);
      showNotification(isArchiving
        ? `Category '${selectedCategory.name}' archived.`
        : `Category '${selectedCategory.name}' restored to active status.`);
    } catch (error) {
      setLoadError(error?.response?.data?.message || "Could not update category status.");
      setArchiveDialogOpen(false);
    } finally { setSaving(false); }
  };

  // Reorder up/down
  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const reordered = [...categories];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Update sequence indices
    const updated = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setCategories(updated);
    try {
      await Promise.all(updated.map((item) => axiosInstance.patch(`/api/categories/${item.id}`, { order: item.order })));
    } catch (error) {
      setLoadError(error?.response?.data?.message || "Could not save category order. Reloading current order.");
      await loadCategories();
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories
      .filter((c) => {
        if (statusFilter !== "all" && c.status !== statusFilter) return false;
        if (
          searchQuery &&
          !c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !c.description.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [categories, statusFilter, searchQuery]);

  return (
    <PageShell>
      <PageHeader
        title="Category & Taxonomy Manager"
        description="Organize course taxonomies, manage display sequence, and archive legacy categories without breaking existing course catalogs."
        icon={FolderTree}
      >
        <Button
          onClick={() => {
            setFormData({ name: "", description: "" });
            setFormError("");
            setCreateDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Category
        </Button>
      </PageHeader>

      {/* Notification Toast */}
      {loadError && (
        <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <span>{loadError}</span>
          <Button variant="outline" size="sm" onClick={loadCategories} disabled={loading}>Retry</Button>
        </div>
      )}

      {notification && (
        <div
          className={cn(
            "mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm font-medium transition-all",
            notification.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          )}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search categories by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                Status:
              </span>
              <div className="flex rounded-md border p-1">
                {["all", "active", "archived"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={cn(
                      "rounded px-3 py-1 text-xs font-medium capitalize transition-colors",
                      statusFilter === st
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Catalog Categories ({filteredCategories.length})
          </CardTitle>
          <CardDescription>
            Categories determine how courses are grouped on the student discovery catalog. Order determines menu sorting.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Order</TableHead>
                <TableHead>Category Name & Slug</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="text-center">Assigned Courses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Loading categories…</TableCell>
                </TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    {categories.length === 0 ? "No categories are available yet." : "No categories found matching your criteria."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category, index) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          {category.order}
                        </span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleMoveOrder(index, "up")}
                            disabled={index === 0}
                            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleMoveOrder(index, "down")}
                            disabled={index === filteredCategories.length - 1}
                            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {category.name}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          /{category.slug}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden max-w-xs truncate text-xs text-muted-foreground md:table-cell">
                      {category.description}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="gap-1 font-mono">
                        <BookOpen className="h-3 w-3" />
                        {category.courseCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {category.status === "active" ? (
                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          Archived
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCategory(category);
                              setFormData({
                                name: category.name,
                                description: category.description,
                              });
                              setFormError("");
                              setEditDialogOpen(true);
                            }}
                            className="gap-2"
                          >
                            <Edit2 className="h-4 w-4" />
                            Rename / Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCategory(category);
                              setArchiveDialogOpen(true);
                            }}
                            className={cn(
                              "gap-2",
                              category.status === "active"
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            )}
                          >
                            {category.status === "active" ? (
                              <>
                                <Archive className="h-4 w-4" />
                                Archive Category
                              </>
                            ) : (
                              <>
                                <ArchiveRestore className="h-4 w-4" />
                                Restore Category
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Course Category</DialogTitle>
            <DialogDescription>
              Add a new course category to the catalog. Names must be unique case-insensitively.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                placeholder="e.g., Islamic Philosophy"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setFormError("");
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="category-desc">Description</Label>
              <Input
                id="category-desc"
                placeholder="Brief summary for students and educators"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1"
              />
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create Category"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category: {selectedCategory?.name}</DialogTitle>
            <DialogDescription>
              Modify the category display title or description.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCategory} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setFormError("");
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-desc">Description</Label>
              <Input
                id="edit-desc"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1"
              />
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Archive / Restore Confirmation Dialog */}
      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory?.status === "active"
                ? `Archive Category: ${selectedCategory?.name}`
                : `Restore Category: ${selectedCategory?.name}`}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory?.status === "active"
                ? `Archiving keeps all ${selectedCategory?.courseCount || 0} existing assigned courses categorized, but hides the category from educators creating new courses. Permanent deletion is disabled to prevent orphan catalog references.`
                : `Restoring will allow educators to assign new courses to '${selectedCategory?.name}' again.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setArchiveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleToggleArchive}
              disabled={saving}
              variant={selectedCategory?.status === "active" ? "destructive" : "default"}
            >
              {selectedCategory?.status === "active"
                ? "Confirm Archive"
                : "Confirm Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
