import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Play, X, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface QueueRestorePromptProps {
  pendingCount: number;
  savedAt: Date;
  eventName?: string;
  onRestore: () => void;
  onDiscard: () => void;
}

export const QueueRestorePrompt: React.FC<QueueRestorePromptProps> = ({
  pendingCount,
  savedAt,
  eventName,
  onRestore,
  onDiscard,
}) => {
  const timeAgo = formatDistanceToNow(savedAt, { addSuffix: true });

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md border-warning/50 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-warning/10">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <CardTitle className="text-lg">Resume Generation?</CardTitle>
              <CardDescription>
                You have an incomplete generation session
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg bg-secondary/50 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pending assets</span>
              <span className="font-medium text-foreground">{pendingCount}</span>
            </div>
            
            {eventName && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Event</span>
                <span className="font-medium text-foreground truncate max-w-40">
                  {eventName}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Saved</span>
              <span className="font-medium text-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Would you like to resume generating these assets? You may need to re-upload 
            reference images if you had any.
          </p>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onDiscard}
            >
              <X className="w-4 h-4 mr-2" />
              Discard
            </Button>
            <Button 
              className="flex-1"
              onClick={onRestore}
            >
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
