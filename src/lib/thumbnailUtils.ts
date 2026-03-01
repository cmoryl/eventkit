/**
 * Generate a thumbnail from a video file at a given timestamp
 */
export const generateVideoThumbnail = async (
  videoFile: File,
  seekTime: number = 1
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const videoURL = URL.createObjectURL(videoFile);
    video.src = videoURL;

    const cleanup = () => {
      URL.revokeObjectURL(videoURL);
      video.remove();
    };

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const targetTime = Math.min(seekTime, Math.max(0, video.duration - 0.1));
      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            cleanup();
            if (blob) resolve(blob);
            else reject(new Error('Failed to create thumbnail blob'));
          },
          'image/jpeg',
          0.85
        );
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Failed to load video for thumbnail generation'));
    };

    setTimeout(() => {
      cleanup();
      reject(new Error('Thumbnail generation timeout'));
    }, 10000);
  });
};
