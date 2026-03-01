/**
 * Extract video frames at evenly-spaced intervals for filmstrip previews
 */
export const extractVideoFrames = async (
  video: HTMLVideoElement,
  frameCount: number = 10
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const frames: string[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const onMetadataLoaded = async () => {
      try {
        const duration = video.duration;
        canvas.width = 120;
        canvas.height = 68;

        const interval = duration / (frameCount - 1);
        const originalTime = video.currentTime;

        for (let i = 0; i < frameCount; i++) {
          const timestamp = i * interval;
          video.currentTime = timestamp;

          await new Promise<void>((seekResolve) => {
            const onSeeked = () => {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
              frames.push(dataUrl);
              video.removeEventListener('seeked', onSeeked);
              seekResolve();
            };
            video.addEventListener('seeked', onSeeked);
          });
        }

        video.currentTime = originalTime;
        resolve(frames);
      } catch (error) {
        reject(error);
      }
    };

    if (video.readyState >= 2) {
      onMetadataLoaded();
    } else {
      video.addEventListener('loadedmetadata', onMetadataLoaded, { once: true });
    }
  });
};
