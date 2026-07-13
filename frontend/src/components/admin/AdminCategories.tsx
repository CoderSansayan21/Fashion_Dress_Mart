'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { fetchAdminCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image: string;
}

const emptyForm: CategoryFormData = { name: '', slug: '', description: '', image: '' };

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormData>(emptyForm);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories-list'],
    queryFn: fetchAdminCategories,
  });

  const createMut = useMutation({
    mutationFn: (data: { name: string; slug: string; description?: string; image?: string }) => createCategory(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories-list'] }); queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); setDialogOpen(false); setForm(emptyForm); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) => updateCategory(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories-list'] }); queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); setDialogOpen(false); setForm(emptyForm); setEditingCat(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories-list'] }); queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); setDeleteOpen(false); setDeletingId(null); },
  });

  const openCreate = () => {
    setEditingCat(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', image: cat.image || '' });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: form.description || undefined,
      image: form.image || undefined,
    };

    if (editingCat) {
      updateMut.mutate({ id: editingCat.id, data: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Categories</h1>
          <p className="mt-1 text-sm text-stone-500">{categories.length} categories total</p>
        </div>
        <Button onClick={openCreate} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50">
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-stone-400">
                  No categories yet
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-xs text-stone-400">N/A</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-stone-900">{cat.name}</TableCell>
                  <TableCell className="text-sm text-stone-500">{cat.slug}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-stone-500">
                    {cat.description || <span className="text-stone-300">No description</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                        onClick={() => { setDeletingId(cat.id); setDeleteOpen(true); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCat ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name *</Label>
              <Input id="cat-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input id="cat-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated-from-name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea id="cat-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Category description" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-image">Image URL</Label>
              <Input id="cat-image" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/images/categories/..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.name}
              className="bg-amber-600 hover:bg-amber-700"
              isLoading={createMut.isPending || updateMut.isPending}
            >
              {editingCat ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Products in this category will have their category removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => deletingId && deleteMut.mutate(deletingId)}
              disabled={deleteMut.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}