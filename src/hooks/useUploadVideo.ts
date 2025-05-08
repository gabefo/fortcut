import { useCallback, useRef, useState } from 'react';

export const useUploadVideo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const prevVideoRef = useRef<HTMLVideoElement | null>(null);

  const upload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = () => {
      const file = input.files?.[0];

      if (!file) return;

      setIsLoading(true);

      const oldVideo = prevVideoRef.current;

      if (oldVideo) {
        oldVideo.pause();
      }

      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.onloadeddata = () => {
        video.currentTime = 0;
        setVideo(video);
        setFile(file);
        setIsLoading(false);
      };
      video.onerror = () => {
        setIsLoading(false);
      };

      prevVideoRef.current = video;
    };

    input.click();
  }, []);

  return { upload, isLoading, video, file };
};
