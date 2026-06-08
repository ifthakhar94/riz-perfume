"use client";

import { useState, type FormEvent } from "react";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api-error";
import { ConfirmDialog } from "./confirm-dialog";
import { PageHeader } from "./page-header";

export interface LookupRecord {
  id: number;
  name: string;
  isActive?: boolean;
}

export interface LookupValues {
  name: string;
  isActive?: boolean;
}

interface LookupManagerProps {
  title: string;
  description: string;
  singular: string;
  items?: LookupRecord[];
  isLoading: boolean;
  busy?: boolean;
  withActiveToggle?: boolean;
  onCreate: (values: LookupValues) => Promise<unknown>;
  onUpdate: (id: number, values: LookupValues) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
}

export function LookupManager({
  title,
  description,
  singular,
  items,
  isLoading,
  busy = false,
  withActiveToggle = false,
  onCreate,
  onUpdate,
  onDelete,
}: LookupManagerProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LookupRecord | null>(null);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<LookupRecord | null>(null);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setIsActive(true);
    setFormOpen(true);
  };

  const openEdit = (item: LookupRecord) => {
    setEditing(item);
    setName(item.name);
    setIsActive(item.isActive ?? true);
    setFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const values: LookupValues = withActiveToggle ? { name: trimmed, isActive } : { name: trimmed };
    try {
      if (editing) {
        await onUpdate(editing.id, values);
        toast.success(`${singular} updated`);
      } else {
        await onCreate(values);
        toast.success(`${singular} created`);
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, `Could not save ${singular.toLowerCase()}`));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await onDelete(deleteTarget.id);
      toast.success(`${singular} deleted`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, `Could not delete ${singular.toLowerCase()}`));
    } finally {
      setDeleteTarget(null);
    }
  };

  const colSpan = withActiveToggle ? 3 : 2;

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New {singular}
          </Button>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {withActiveToggle ? <TableHead>Status</TableHead> : null}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={colSpan}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : !items || items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={colSpan}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No {title.toLowerCase()} yet.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  {withActiveToggle ? (
                    <TableCell>
                      {item.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="muted">Inactive</Badge>
                      )}
                    </TableCell>
                  ) : null}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${singular}` : `New ${singular}`}</DialogTitle>
            <DialogDescription>
              {editing
                ? `Update this ${singular.toLowerCase()}.`
                : `Add a new ${singular.toLowerCase()}.`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lookup-name">Name</Label>
              <Input
                id="lookup-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={`${singular} name`}
                autoFocus
              />
            </div>
            {withActiveToggle ? (
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor="lookup-active">Active</Label>
                <Switch id="lookup-active" checked={isActive} onCheckedChange={setIsActive} />
              </div>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy || name.trim().length === 0}>
                {editing ? "Save changes" : `Create ${singular}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`Delete ${singular.toLowerCase()}?`}
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed. This cannot be undone.`
            : undefined
        }
        loading={busy}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
