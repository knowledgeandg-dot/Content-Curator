import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plot, useUpdatePlot, PlotUpdatePlotFacing, PlotUpdatePlcType, PlotUpdateStatus, getGetPlotsQueryKey, getGetPlotStatsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const plotUpdateSchema = z.object({
  plotNumber: z.string().min(1, 'Plot number is required'),
  widthMtr: z.coerce.number().min(0.01, 'Must be positive'),
  lengthMtr: z.coerce.number().min(0.01, 'Must be positive'),
  areaSqMtr: z.coerce.number().min(0.01, 'Must be positive'),
  areaSqYrd: z.coerce.number().min(0.01, 'Must be positive'),
  plotFacing: z.nativeEnum(PlotUpdatePlotFacing),
  plcType: z.nativeEnum(PlotUpdatePlcType),
  status: z.nativeEnum(PlotUpdateStatus)
});

interface EditPlotDialogProps {
  plot: Plot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPlotDialog({ plot, open, onOpenChange }: EditPlotDialogProps) {
  const updatePlot = useUpdatePlot();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof plotUpdateSchema>>({
    resolver: zodResolver(plotUpdateSchema),
    defaultValues: {
      plotNumber: plot.plotNumber,
      widthMtr: plot.widthMtr,
      lengthMtr: plot.lengthMtr,
      areaSqMtr: plot.areaSqMtr,
      areaSqYrd: plot.areaSqYrd,
      plotFacing: plot.plotFacing as PlotUpdatePlotFacing,
      plcType: plot.plcType as PlotUpdatePlcType,
      status: plot.status as PlotUpdateStatus
    }
  });

  const calculateAreas = () => {
    const width = form.getValues('widthMtr');
    const length = form.getValues('lengthMtr');
    if (width > 0 && length > 0) {
      const sqMtr = width * length;
      const sqYrd = sqMtr * 1.19599;
      form.setValue('areaSqMtr', Number(sqMtr.toFixed(2)));
      form.setValue('areaSqYrd', Number(sqYrd.toFixed(2)));
    }
  };

  const onSubmit = (data: z.infer<typeof plotUpdateSchema>) => {
    updatePlot.mutate({ id: plot.id, data }, {
      onSuccess: () => {
        toast({ title: 'Plot Updated', description: `Plot ${data.plotNumber} has been updated.` });
        queryClient.invalidateQueries({ queryKey: getGetPlotsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPlotStatsQueryKey() });
        onOpenChange(false);
      },
      onError: (err) => {
        toast({ title: 'Failed to update plot', description: err.error, variant: 'destructive' });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border">
        <DialogHeader>
          <DialogTitle>Edit Plot {plot.plotNumber}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plotNumber"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Plot Number</FormLabel>
                    <FormControl>
                      <Input className="uppercase font-mono font-medium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(PlotUpdateStatus).map(val => (
                          <SelectItem key={val} value={val}>{val}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="widthMtr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Width (MTR)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} onChange={e => { field.onChange(e); calculateAreas(); }} className="font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lengthMtr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Length (MTR)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} onChange={e => { field.onChange(e); calculateAreas(); }} className="font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="areaSqMtr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Area (SQ MTR)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} className="font-mono bg-muted/30" readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="areaSqYrd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Area (SQ YRD)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} className="font-mono bg-muted/30" readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plotFacing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Facing</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select direction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(PlotUpdatePlotFacing).map(val => (
                          <SelectItem key={val} value={val}>{val}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plcType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">PLC Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(PlotUpdatePlcType).map(val => (
                          <SelectItem key={val} value={val}>{val}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={updatePlot.isPending}>
                {updatePlot.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
