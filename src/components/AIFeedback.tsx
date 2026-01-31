// AI Feedback Component
// Allows users to provide feedback on generated assets

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  Star,
  Loader2,
  Brain
} from 'lucide-react';
import { recordFeedback } from '@/services/aiBrain/learningService';

interface AIFeedbackProps {
  generationId: string | null;
  userId: string;
  onFeedbackRecorded?: () => void;
  compact?: boolean;
}

export function AIFeedback({ 
  generationId, 
  userId, 
  onFeedbackRecorded,
  compact = false 
}: AIFeedbackProps) {
  const [loading, setLoading] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const handleQuickFeedback = async (type: 'thumbs_up' | 'thumbs_down') => {
    if (!generationId) {
      // Still show the action but log that we can't record
      toast.success(type === 'thumbs_up' ? 'Thanks for the feedback!' : 'Got it, we\'ll improve!');
      setFeedbackGiven(true);
      return;
    }

    setLoading(true);
    try {
      await recordFeedback(generationId, userId, type);
      toast.success(
        type === 'thumbs_up' 
          ? 'Great! The AI will learn from this.' 
          : 'Thanks! The AI will improve.'
      );
      setFeedbackGiven(true);
      onFeedbackRecorded?.();
    } catch (error) {
      console.error('Feedback error:', error);
    }
    setLoading(false);
  };

  const handleDetailedFeedback = async () => {
    if (!generationId) {
      toast.success('Thanks for the detailed feedback!');
      setShowComment(false);
      setFeedbackGiven(true);
      return;
    }

    setLoading(true);
    try {
      await recordFeedback(
        generationId, 
        userId, 
        'thumbs_up',
        rating || undefined,
        comment || undefined
      );
      toast.success('Detailed feedback recorded. The AI is learning!');
      setShowComment(false);
      setComment('');
      setRating(null);
      setFeedbackGiven(true);
      onFeedbackRecorded?.();
    } catch (error) {
      console.error('Feedback error:', error);
    }
    setLoading(false);
  };

  if (feedbackGiven) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Brain className="h-4 w-4 text-primary" />
        <span>AI is learning from your feedback</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleQuickFeedback('thumbs_up')}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleQuickFeedback('thumbs_down')}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuickFeedback('thumbs_up')}
        disabled={loading}
        className="gap-1"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ThumbsUp className="h-4 w-4" />
        )}
        Good
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuickFeedback('thumbs_down')}
        disabled={loading}
        className="gap-1"
      >
        <ThumbsDown className="h-4 w-4" />
        Improve
      </Button>

      <Popover open={showComment} onOpenChange={setShowComment}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Rate this generation</h4>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star 
                      className={`h-5 w-5 ${
                        rating && star <= rating 
                          ? 'fill-primary text-primary' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">Additional comments</h4>
              <Textarea
                placeholder="What could be improved?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleDetailedFeedback}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Submit Feedback
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
