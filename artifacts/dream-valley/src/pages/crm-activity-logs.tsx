import React from 'react';
import { useGetActivityLogs } from '@workspace/api-client-react';
import { CrmLayout } from '@/layouts/crm-layout';
import { Loader2, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function CrmActivityLogs() {
  const { data: logs, isLoading } = useGetActivityLogs({ limit: 100 });

  return (
    <CrmLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Audit trail of all system changes.</p>
        </div>

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            </div>
          ) : logs?.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
              No activity recorded yet.
            </div>
          ) : (
            <div className="divide-y">
              {logs?.map(log => (
                <div key={log.id} className="p-4 hover:bg-muted/10 transition-colors flex gap-4">
                  <div className="mt-1">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs">
                      {log.userName.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{log.userName}</span>
                      {' '}<span className="text-muted-foreground">{log.action.toLowerCase()}</span>{' '}
                      plot <span className="font-mono font-medium">{log.plotNumber}</span>
                    </p>
                    
                    {(log.oldData || log.newData) && (
                      <div className="mt-2 text-xs font-mono bg-muted/30 border rounded p-2 overflow-x-auto">
                        {log.oldData && <div className="text-muted-foreground line-through opacity-70 mb-1">{log.oldData}</div>}
                        {log.newData && <div className="text-primary">{log.newData}</div>}
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(log.createdAt), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CrmLayout>
  );
}
