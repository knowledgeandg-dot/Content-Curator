import React, { useState } from 'react';
import { useGetRmCodes, useCreateRmCode, useUpdateRmCode, useDeleteRmCode, getGetRmCodesQueryKey, RmCode, RmCodeInputStatus, RmCodeUpdateStatus } from '@workspace/api-client-react';
import { CrmLayout } from '@/layouts/crm-layout';
import { Loader2, Plus, Edit2, Trash2, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const rmSchema = z.object({
  rmCode: z.string().min(1, 'RM Code is required'),
  salesPersonName: z.string().min(1, 'Name is required'),
  status: z.nativeEnum(RmCodeInputStatus)
});

export default function CrmRmCodes() {
  const { data: codes, isLoading } = useGetRmCodes();
  const deleteCode = useDeleteRmCode();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editCode, setEditCode] = useState<RmCode | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleDelete = () => {
    if (deleteId) {
      deleteCode.mutate({ id: deleteId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetRmCodesQueryKey() });
          toast({ title: 'RM Code Deleted' });
          setDeleteId(null);
        },
        onError: (err) => {
          toast({ title: 'Error', description: err.error, variant: 'destructive' });
          setDeleteId(null);
        }
      });
    }
  };

  return (
    <CrmLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">RM Codes</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage sales personnel access codes.</p>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2 font-semibold">
            <Plus className="h-4 w-4" />
            Add RM Code
          </Button>
        </div>

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/40 uppercase text-xs font-semibold text-muted-foreground tracking-wider border-b">
                <tr>
                  <th className="px-6 py-4">RM Code</th>
                  <th className="px-6 py-4">Sales Person</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : codes?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      <Hash className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      No RM codes found. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  codes?.map(code => (
                    <tr key={code.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-3 font-mono font-medium text-foreground">{code.rmCode}</td>
                      <td className="px-6 py-3 font-medium">{code.salesPersonName}</td>
                      <td className="px-6 py-3">
                        <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', 
                          code.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'
                        )}>
                          {code.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setEditCode(code)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(code.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <RmCodeDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
      {editCode && <RmCodeDialog open={!!editCode} onOpenChange={(v) => !v && setEditCode(null)} editCode={editCode} />}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete RM Code</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? Sales personnel will no longer be able to log in with this code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCode.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteCode.isPending} className="bg-destructive hover:bg-destructive/90">
              {deleteCode.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CrmLayout>
  );
}

function RmCodeDialog({ open, onOpenChange, editCode }: { open: boolean, onOpenChange: (o: boolean) => void, editCode?: RmCode }) {
  const createCode = useCreateRmCode();
  const updateCode = useUpdateRmCode();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const isEdit = !!editCode;

  const form = useForm<z.infer<typeof rmSchema>>({
    resolver: zodResolver(rmSchema),
    defaultValues: {
      rmCode: editCode?.rmCode || '',
      salesPersonName: editCode?.salesPersonName || '',
      status: (editCode?.status as RmCodeInputStatus) || RmCodeInputStatus.Active
    }
  });

  // Reset form when editCode changes
  React.useEffect(() => {
    if (open) {
      form.reset({
        rmCode: editCode?.rmCode || '',
        salesPersonName: editCode?.salesPersonName || '',
        status: (editCode?.status as RmCodeInputStatus) || RmCodeInputStatus.Active
      });
    }
  }, [open, editCode, form]);

  const onSubmit = (data: z.infer<typeof rmSchema>) => {
    if (isEdit) {
      updateCode.mutate({ id: editCode.id, data: data as any }, {
        onSuccess: () => {
          toast({ title: 'Updated successfully' });
          queryClient.invalidateQueries({ queryKey: getGetRmCodesQueryKey() });
          onOpenChange(false);
        },
        onError: (err) => toast({ title: 'Error', description: err.error, variant: 'destructive' })
      });
    } else {
      createCode.mutate({ data }, {
        onSuccess: () => {
          toast({ title: 'Created successfully' });
          queryClient.invalidateQueries({ queryKey: getGetRmCodesQueryKey() });
          onOpenChange(false);
        },
        onError: (err) => toast({ title: 'Error', description: err.error, variant: 'destructive' })
      });
    }
  };

  const isPending = createCode.isPending || updateCode.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit RM Code' : 'Add New RM Code'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField
              control={form.control}
              name="rmCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">RM Code</FormLabel>
                  <FormControl>
                    <Input className="uppercase font-mono font-medium" placeholder="e.g. RM005" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salesPersonName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Sales Person Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={RmCodeInputStatus.Active}>Active</SelectItem>
                      <SelectItem value={RmCodeInputStatus.Inactive}>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isEdit ? 'Save Changes' : 'Create Code'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
