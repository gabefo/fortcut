import React, { useEffect, useRef } from 'react';
import { Overlay } from '../types';

type Props = {
  video: HTMLVideoElement;
  aspectRatio: string;
  overlays: Overlay[];
};

export const VideoCanvas: React.FC<Props> = ({ video, aspectRatio, overlays }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!ctx || !canvas) return;

    const { videoWidth, videoHeight } = video;
    const videoRatio = videoWidth / videoHeight;
    const [wRatio, hRatio] = aspectRatio.split(':').map(Number);
    const ratio = wRatio / hRatio;

    let x = 0,
      y = 0,
      canvasWidth = videoWidth,
      canvasHeight = videoHeight;

    if (videoRatio > ratio) {
      canvasWidth = videoHeight * ratio;
      x = (videoWidth - canvasWidth) / 2;
    } else {
      canvasHeight = videoWidth / ratio;
      y = (videoHeight - canvasHeight) / 2;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let frameId = 0;

    const drawFrame = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ctx.drawImage(video, x, y, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);

      overlays.forEach(({ position, align, crop }) => {
        const sx = crop?.x ?? 0;
        const sy = crop?.y ?? 0;
        const sw = crop?.width ?? videoWidth;
        const sh = crop?.height ?? videoHeight;

        let dx = 0,
          dy = 0;

        switch (align[0]) {
          case 'top':
            dy = position.y;
            break;
          case 'bottom':
            dy = canvasHeight - sh - position.y;
            break;
          case 'middle':
            dy = (canvasHeight - sh) / 2 + position.y;
            break;
        }

        switch (align[1]) {
          case 'left':
            dx = position.x;
            break;
          case 'right':
            dx = canvasWidth - sw - position.x;
            break;
          case 'middle':
            dx = (canvasWidth - sw) / 2 + position.x;
            break;
        }

        ctx.drawImage(video, sx, sy, sw, sh, dx, dy, sw, sh);
      });
    };

    const update = () => {
      drawFrame();
      if (!video.paused) {
        frameId = requestAnimationFrame(update);
      }
    };

    const onPlay = () => {
      update();
    };

    const onPause = () => {
      cancelAnimationFrame(frameId);
    };

    const onSeeked = () => {
      drawFrame();
    };

    update();

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('seeked', onSeeked);

    return () => {
      cancelAnimationFrame(frameId);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('seeked', onSeeked);
    };
  }, [aspectRatio, overlays, video]);

  return <canvas className="absolute h-full w-full object-contain" ref={canvasRef} />;
};
