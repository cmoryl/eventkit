// User-uploaded media library — PNGs, SVGs, JPGs etc. that the user has
// uploaded for reuse in slides and templates. Lives in the Insert > Media tab
// alongside BrandHub assets.
import React, { useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Upload, Search, Plus, Loader2, Trash2, GripVertical, Sparkles, ImageUp,
} from 'lucide-react';
import { useUserMedia, type UserMediaItem } from '@/hooks/useUserMedia';
import { SLIDE_ASSET_IMAGE_MIME } from './SlideAssetSearchPanel';
import { toast } from 'sonner';

interface Props {
  onUseImage: (url: string, name: string) => void;
  onUseAsAccent?: (url: string, name: string) => void;
}

export const UserUploadsPanel: React.FC<Props> = ({ onUseImage, onUseAsAccent }) => {
  const { items, isLoading, isUploading, upload, remove, isAuthed } = useUserMedia();
  const [query, setQuery] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, query]);

  const handleFiles = async (files: FileList | File[] | null) => {
    if (!files) return;
    try {
      const added = await upload(files);
      if (added.length) toast.success(`Uploaded ${added.length} file${added.length > 1 ? 's' : ''}`);
      else toast.error('No files uploaded — check size (≤8MB) and type (PNG, JPG, SVG, GIF, WebP).');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    }
  };

  if (!isAuthed) {
    return (
      <div className="rounded-lg border bg-muted/30 p-3 text-center text-xs text-muted-foreground">
        Sign in to upload your own PNGs and SVGs.
      </div>
    );
  }

  return (
    <div
      className={`space-y-2 rounded-lg border bg-muted/30 p-2.5 transition ${
        dragOver ? 'ring-2 ring-primary border-primary' : ''
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        void handleFiles(e.dataTransfer.files);
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <ImageUp className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-xs font-medium truncate">My uploads</span>
          {items.length > 0 && (
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">{items.length}</Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="default"
          className="h-7 px-2 text-[11px] gap-1"
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          Upload
        </Button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg,.png,.jpg,.jpeg,.webp,.gif"
          className="hidden"
          onChange={(e) => { void handleFiles(e.target.files); if (fileRef.current) fileRef.current.value = ''; }}
        />
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search uploads…"
          className="h-7 pl-7 text-xs"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-6 text-center text-[11px] text-muted-foreground">
          {items.length === 0
            ? 'Drag PNGs / SVGs here or click Upload.'
            : 'No matches.'}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 max-h-[240px] overflow-y-auto pr-0.5">
          {filtered.map((item) => (
            <MediaTile
              key={item.id}
              item={item}
              onUse={() => onUseImage(item.url, item.name)}
              onAccent={onUseAsAccent ? () => onUseAsAccent(item.url, item.name) : undefined}
              onDelete={() => { void remove(item); }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const MediaTile: React.FC<{
  item: UserMediaItem;
  onUse: () => void;
  onAccent?: () => void;
  onDelete: () => void;
}> = ({ item, onUse, onAccent, onDelete }) => (
  <button
    type="button"
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData(SLIDE_ASSET_IMAGE_MIME, item.url);
      e.dataTransfer.setData('text/uri-list', item.url);
      e.dataTransfer.setData('text/plain', item.url);
      e.dataTransfer.effectAllowed = 'copy';
    }}
    onClick={onUse}
    title={`${item.name}\nClick to add, drag onto canvas`}
    className="group relative aspect-square rounded-md overflow-hidden border bg-background hover:ring-2 hover:ring-primary transition cursor-grab active:cursor-grabbing"
  >
    <img
      src={item.url}
      alt={item.name}
      loading="lazy"
      className="h-full w-full object-contain bg-[repeating-conic-gradient(#e5e5e5_0%_25%,#fafafa_0%_50%)] bg-[length:12px_12px] pointer-events-none"
    />
    <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
      <div className="flex items-center gap-1 text-[10px] text-white">
        <Plus className="h-3 w-3" /> Add
        <GripVertical className="h-3 w-3 text-white/70 ml-1" />
      </div>
      <div className="flex items-center gap-1">
        {onAccent && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onAccent(); }}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/90 hover:bg-primary text-[9px] text-primary-foreground cursor-pointer"
          >
            <Sparkles className="h-2.5 w-2.5" /> Accent
          </span>
        )}
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); if (confirm(`Delete ${item.name}?`)) onDelete(); }}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/90 hover:bg-rose-500 text-[9px] text-white cursor-pointer"
          aria-label="Delete"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </span>
      </div>
    </div>
    {item.kind === 'svg' && (
      <span className="absolute top-0.5 left-0.5 rounded bg-background/80 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide">SVG</span>
    )}
  </button>
);

export default UserUploadsPanel;
