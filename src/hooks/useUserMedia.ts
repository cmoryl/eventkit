// Personal media library: upload and list a user's own PNGs / SVGs / images
// stored in the public `slide-uploads` bucket, with metadata in `user_media`.
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { sanitizeSvg } from '@/utils/svgUtils';

export interface UserMediaItem {
  id: string;
  name: string;
  url: string;
  storage_path: string;
  mime: string | null;
  kind: string;
  size: number | null;
  width: number | null;
  height: number | null;
  tags: string[];
  created_at: string;
}

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

async function probeDimensions(file: File): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith('image/')) return {};
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({});
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export function useUserMedia() {
  const { user } = useAuth();
  const [items, setItems] = useState<UserMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_media')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems((data || []) as UserMediaItem[]);
    } catch (e) {
      console.error('useUserMedia load failed', e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { void refresh(); }, [refresh]);

  const upload = useCallback(async (files: FileList | File[]): Promise<UserMediaItem[]> => {
    if (!user) throw new Error('Please sign in to upload media.');
    const list = Array.from(files);
    if (list.length === 0) return [];
    setIsUploading(true);
    const added: UserMediaItem[] = [];
    try {
      for (const file of list) {
        const mime = file.type || (file.name.endsWith('.svg') ? 'image/svg+xml' : 'application/octet-stream');
        if (!ACCEPTED.includes(mime)) {
          console.warn(`Skipping ${file.name}: unsupported type ${mime}`);
          continue;
        }
        if (file.size > MAX_BYTES) {
          console.warn(`Skipping ${file.name}: exceeds 8MB`);
          continue;
        }
        const ext = (file.name.split('.').pop() || 'png').toLowerCase();
        const path = `library/${user.id}/${crypto.randomUUID()}.${ext}`;

        // Sanitize SVGs before upload: strip <script>, on* handlers, foreignObject,
        // external refs, etc. Reject if it doesn't parse to a valid <svg>.
        let uploadBody: Blob | File = file;
        let uploadSize = file.size;
        if (mime === 'image/svg+xml') {
          try {
            const raw = await file.text();
            const cleaned = sanitizeSvg(raw);
            if (!cleaned || !cleaned.includes('<svg')) {
              console.warn(`Skipping ${file.name}: invalid or unsafe SVG`);
              continue;
            }
            uploadBody = new Blob([cleaned], { type: 'image/svg+xml' });
            uploadSize = uploadBody.size;
          } catch (e) {
            console.warn(`Skipping ${file.name}: SVG sanitization failed`, e);
            continue;
          }
        }

        const { error: upErr } = await supabase.storage
          .from('slide-uploads')
          .upload(path, uploadBody, { cacheControl: '3600', upsert: false, contentType: mime });
        if (upErr) {
          console.error('Upload failed', file.name, upErr);
          continue;
        }
        const { data: pub } = supabase.storage.from('slide-uploads').getPublicUrl(path);
        const dims = await probeDimensions(file);
        const { data: row, error: insErr } = await supabase
          .from('user_media')
          .insert({
            user_id: user.id,
            name: file.name,
            url: pub.publicUrl,
            storage_path: path,
            mime,
            kind: mime === 'image/svg+xml' ? 'svg' : 'image',
            size: file.size,
            width: dims.width ?? null,
            height: dims.height ?? null,
          })
          .select()
          .single();
        if (insErr) {
          console.error('Insert media row failed', insErr);
          continue;
        }
        added.push(row as UserMediaItem);
      }
      if (added.length) setItems((prev) => [...added, ...prev]);
      return added;
    } finally {
      setIsUploading(false);
    }
  }, [user]);

  const remove = useCallback(async (item: UserMediaItem) => {
    if (!user) return;
    await supabase.storage.from('slide-uploads').remove([item.storage_path]);
    const { error } = await supabase.from('user_media').delete().eq('id', item.id);
    if (error) {
      console.error('Delete media failed', error);
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  }, [user]);

  return { items, isLoading, isUploading, upload, remove, refresh, isAuthed: !!user };
}
