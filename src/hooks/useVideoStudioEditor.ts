import { useState, useRef, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

interface FormatSettings {
  aspectRatio: "16:9" | "9:16" | "1:1";
  cropMode: "fit" | "fill";
  resolution: "480p" | "720p" | "1080p" | "1440p" | "4k";
}

type ExportSpeed = "quality" | "fast";

const CDN_URLS = [
  {
    core: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
    wasm: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
  },
  {
    core: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
    wasm: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
  },
];

export const useVideoEditor = () => {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current && ffmpegRef.current.loaded) return true;

    const ffmpeg = new FFmpeg();
    ffmpeg.on('log', ({ message }) => console.log('[FFmpeg]:', message));
    ffmpeg.on('progress', ({ progress: p }) => setProgress(Math.round(p * 100)));

    for (const cdn of CDN_URLS) {
      try {
        const loadWithTimeout = Promise.race([
          (async () => {
            const coreURL = await toBlobURL(cdn.core, 'text/javascript');
            const wasmURL = await toBlobURL(cdn.wasm, 'application/wasm');
            await ffmpeg.load({ coreURL, wasmURL });
            return ffmpeg.loaded;
          })(),
          new Promise<boolean>((_, reject) =>
            setTimeout(() => reject(new Error('FFmpeg load timeout')), 30000)
          ),
        ]);

        const isLoaded = await loadWithTimeout;
        if (!isLoaded) continue;

        ffmpegRef.current = ffmpeg;
        setIsFFmpegLoaded(true);
        return true;
      } catch {
        continue;
      }
    }

    setError('Failed to load FFmpeg');
    throw new Error('Failed to load FFmpeg from all CDN sources');
  }, []);

  const trimVideo = useCallback(async (
    videoFile: File,
    startTime: number,
    endTime: number,
    formatSettings?: FormatSettings,
    exportSpeed: ExportSpeed = "quality"
  ): Promise<Blob> => {
    setIsLoading(true);
    setProgress(0);
    setError(null);

    try {
      if (!ffmpegRef.current || !ffmpegRef.current.loaded) {
        throw new Error('FFmpeg not loaded');
      }

      const ffmpeg = ffmpegRef.current;
      const inputName = 'input.mp4';
      const outputName = 'output.mp4';

      await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

      const duration = endTime - startTime;
      const ffmpegArgs: string[] = ['-i', inputName, '-ss', startTime.toString(), '-t', duration.toString()];

      if (formatSettings) {
        const { getFFmpegFilterString } = await import('@/lib/videoFormatUtils');
        const filterString = getFFmpegFilterString(formatSettings);
        const preset = exportSpeed === "fast" ? "fast" : "medium";
        const crf = exportSpeed === "fast" ? "23" : "20";

        ffmpegArgs.push(
          '-vf', filterString,
          '-c:v', 'libx264', '-preset', preset, '-crf', crf,
          '-pix_fmt', 'yuv420p', '-profile:v', 'baseline', '-level', '3.0',
          '-movflags', '+faststart',
          '-c:a', 'aac', '-b:a', '128k', '-ac', '2', '-ar', '44100',
          '-max_muxing_queue_size', '1024', '-vsync', 'cfr'
        );
      } else {
        ffmpegArgs.push('-c', 'copy');
      }

      ffmpegArgs.push(outputName);
      await ffmpeg.exec(ffmpegArgs);

      const data = await ffmpeg.readFile(outputName);
      const uint8Array = new Uint8Array(data instanceof Uint8Array ? data : []);
      const blob = new Blob([uint8Array], { type: 'video/mp4' });

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      setIsLoading(false);
      return blob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to trim video: ${errorMessage}`);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const concatenateVideos = useCallback(async (videoBlobs: Blob[]): Promise<Blob> => {
    setIsLoading(true);
    setProgress(0);
    setError(null);

    try {
      if (!ffmpegRef.current || !ffmpegRef.current.loaded) {
        throw new Error('FFmpeg not loaded');
      }

      const ffmpeg = ffmpegRef.current;
      const inputFiles: string[] = [];

      for (let i = 0; i < videoBlobs.length; i++) {
        const inputName = `input${i}.mp4`;
        await ffmpeg.writeFile(inputName, await fetchFile(videoBlobs[i]));
        inputFiles.push(inputName);
      }

      const concatContent = inputFiles.map(f => `file '${f}'`).join('\n');
      await ffmpeg.writeFile('concat.txt', new TextEncoder().encode(concatContent));

      const outputName = 'output.mp4';
      await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'concat.txt', '-c', 'copy', outputName]);

      const data = await ffmpeg.readFile(outputName);
      const uint8Array = new Uint8Array(data instanceof Uint8Array ? data : []);
      const blob = new Blob([uint8Array], { type: 'video/mp4' });

      for (const inputFile of inputFiles) await ffmpeg.deleteFile(inputFile);
      await ffmpeg.deleteFile('concat.txt');
      await ffmpeg.deleteFile(outputName);

      setIsLoading(false);
      return blob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to concatenate: ${errorMessage}`);
      setIsLoading(false);
      throw err;
    }
  }, []);

  return {
    trimVideo,
    concatenateVideos,
    loadFFmpeg,
    isLoading,
    progress,
    isFFmpegLoaded,
    error,
  };
};
