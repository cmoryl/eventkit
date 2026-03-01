interface FormatSettings {
  aspectRatio: "16:9" | "9:16" | "1:1";
  cropMode: "fit" | "fill";
  resolution: "480p" | "720p" | "1080p" | "1440p" | "4k";
}

interface Dimensions {
  width: number;
  height: number;
}

export function getTargetDimensions(
  aspectRatio: FormatSettings["aspectRatio"],
  resolution: FormatSettings["resolution"]
): Dimensions {
  const resolutionMap: Record<string, number> = {
    "480p": 480,
    "720p": 720,
    "1080p": 1080,
    "1440p": 1440,
    "4k": 2160,
  };

  const height = resolutionMap[resolution];
  let width: number;
  let finalHeight: number;

  switch (aspectRatio) {
    case "16:9":
      width = Math.round((height * 16) / 9);
      width = Math.round(width / 16) * 16;
      finalHeight = height;
      break;
    case "9:16":
      finalHeight = Math.round((height * 16) / 9);
      finalHeight = Math.round(finalHeight / 16) * 16;
      width = height;
      break;
    case "1:1":
      width = height;
      finalHeight = height;
      break;
  }

  return { width, height: finalHeight };
}

export function getFFmpegFilterString(formatSettings: FormatSettings): string {
  const { width, height } = getTargetDimensions(formatSettings.aspectRatio, formatSettings.resolution);

  if (formatSettings.cropMode === "fit") {
    return `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black`;
  } else {
    return `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`;
  }
}

export function formatResolutionString(formatSettings: FormatSettings): string {
  const { width, height } = getTargetDimensions(formatSettings.aspectRatio, formatSettings.resolution);
  return `${width}x${height}`;
}
