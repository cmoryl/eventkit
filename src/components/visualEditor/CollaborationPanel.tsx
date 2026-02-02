// Collaboration Panel - Comments, version history, sharing
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MessageSquare, History, Share2, Users, Send, 
  Clock, ChevronRight, MoreVertical, Check, Copy, Link,
  Eye, Edit2, Crown, UserPlus, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CollaborationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  designId?: string;
  designName?: string;
}

interface Comment {
  id: string;
  author: { name: string; avatar?: string };
  content: string;
  timestamp: Date;
  resolved?: boolean;
  elementId?: string;
}

interface VersionEntry {
  id: string;
  author: { name: string; avatar?: string };
  timestamp: Date;
  description: string;
  thumbnail?: string;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  online?: boolean;
}

// Mock data
const MOCK_COMMENTS: Comment[] = [
  { id: '1', author: { name: 'Alice Chen' }, content: 'Can we make the headline larger?', timestamp: new Date(Date.now() - 3600000), resolved: true },
  { id: '2', author: { name: 'Bob Smith' }, content: 'Love the color scheme!', timestamp: new Date(Date.now() - 7200000) },
  { id: '3', author: { name: 'Carol Davis' }, content: 'The logo placement looks great.', timestamp: new Date(Date.now() - 86400000) },
];

const MOCK_VERSIONS: VersionEntry[] = [
  { id: 'v3', author: { name: 'You' }, timestamp: new Date(Date.now() - 300000), description: 'Added hero image and adjusted spacing' },
  { id: 'v2', author: { name: 'Alice Chen' }, timestamp: new Date(Date.now() - 3600000), description: 'Updated color palette' },
  { id: 'v1', author: { name: 'You' }, timestamp: new Date(Date.now() - 86400000), description: 'Initial design' },
];

const MOCK_COLLABORATORS: Collaborator[] = [
  { id: '1', name: 'You', email: 'you@example.com', role: 'owner', online: true },
  { id: '2', name: 'Alice Chen', email: 'alice@example.com', role: 'editor', online: true },
  { id: '3', name: 'Bob Smith', email: 'bob@example.com', role: 'viewer', online: false },
];

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  isOpen,
  onClose,
  designId,
  designName = 'Untitled Design'
}) => {
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: { name: 'You' },
      content: newComment,
      timestamp: new Date()
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
    toast.success('Comment added');
  };

  const handleResolveComment = (commentId: string) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, resolved: !c.resolved } : c
    ));
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
  };

  const handleGenerateLink = () => {
    const link = `https://app.example.com/design/${designId || 'demo'}?share=true`;
    setShareLink(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    toast.success('Link copied to clipboard');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getRoleColor = (role: Collaborator['role']) => {
    switch (role) {
      case 'owner': return 'text-yellow-500';
      case 'editor': return 'text-blue-500';
      case 'viewer': return 'text-gray-500';
    }
  };

  const getRoleIcon = (role: Collaborator['role']) => {
    switch (role) {
      case 'owner': return Crown;
      case 'editor': return Edit2;
      case 'viewer': return Eye;
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="w-80 border-l bg-background flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
            <Users className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Collaboration</h3>
            <p className="text-xs text-muted-foreground">{designName}</p>
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="comments" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-3 grid w-auto grid-cols-3">
          <TabsTrigger value="comments" className="text-xs gap-1">
            <MessageSquare className="h-3 w-3" />
            Comments
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs gap-1">
            <History className="h-3 w-3" />
            History
          </TabsTrigger>
          <TabsTrigger value="share" className="text-xs gap-1">
            <Share2 className="h-3 w-3" />
            Share
          </TabsTrigger>
        </TabsList>

        {/* Comments Tab */}
        <TabsContent value="comments" className="flex-1 flex flex-col m-0 mt-3">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-3 pb-4">
              {comments.map(comment => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'p-3 rounded-lg border transition-all',
                    comment.resolved ? 'bg-muted/30 border-muted' : 'bg-card border-border'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={comment.author.avatar} />
                      <AvatarFallback className="text-[10px]">
                        {comment.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium truncate">{comment.author.name}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatTime(comment.timestamp)}
                        </span>
                      </div>
                      <p className={cn(
                        'text-xs mt-1',
                        comment.resolved && 'line-through text-muted-foreground'
                      )}>
                        {comment.content}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px]"
                      onClick={() => handleResolveComment(comment.id)}
                    >
                      {comment.resolved ? 'Reopen' : 'Resolve'}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          {/* New Comment Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px] text-sm resize-none"
              />
            </div>
            <Button
              size="sm"
              className="w-full mt-2 gap-1"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              <Send className="h-3 w-3" />
              Post Comment
            </Button>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="flex-1 m-0 mt-3">
          <ScrollArea className="h-full px-4">
            <div className="space-y-1 pb-4">
              {MOCK_VERSIONS.map((version, index) => (
                <button
                  key={version.id}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all text-left"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={version.author.avatar} />
                      <AvatarFallback className="text-[10px]">
                        {version.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {index < MOCK_VERSIONS.length - 1 && (
                      <div className="absolute left-1/2 top-full -translate-x-1/2 w-px h-4 bg-border" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{version.author.name}</span>
                      {index === 0 && (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">Current</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {version.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(version.timestamp)}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Share Tab */}
        <TabsContent value="share" className="flex-1 m-0 mt-3">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              {/* Invite by Email */}
              <div>
                <Label className="text-xs font-medium mb-2 block">Invite People</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 text-sm h-9"
                  />
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'editor' | 'viewer')}>
                    <SelectTrigger className="w-24 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-2 gap-1"
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim()}
                >
                  <UserPlus className="h-3 w-3" />
                  Send Invite
                </Button>
              </div>

              {/* Share Link */}
              <div>
                <Label className="text-xs font-medium mb-2 block">Share Link</Label>
                {shareLink ? (
                  <div className="flex gap-2">
                    <Input
                      value={shareLink}
                      readOnly
                      className="flex-1 text-xs font-mono h-9"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 shrink-0"
                      onClick={handleCopyLink}
                    >
                      {linkCopied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleGenerateLink}
                  >
                    <Link className="h-4 w-4" />
                    Generate Share Link
                  </Button>
                )}
              </div>

              {/* Current Collaborators */}
              <div>
                <Label className="text-xs font-medium mb-2 block">Collaborators</Label>
                <div className="space-y-2">
                  {MOCK_COLLABORATORS.map(collab => {
                    const RoleIcon = getRoleIcon(collab.role);
                    return (
                      <div
                        key={collab.id}
                        className="flex items-center gap-3 p-2 rounded-lg border border-border"
                      >
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={collab.avatar} />
                            <AvatarFallback className="text-[10px]">
                              {collab.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {collab.online && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{collab.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{collab.email}</p>
                        </div>
                        <div className={cn('flex items-center gap-1', getRoleColor(collab.role))}>
                          <RoleIcon className="h-3 w-3" />
                          <span className="text-[10px] capitalize">{collab.role}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
