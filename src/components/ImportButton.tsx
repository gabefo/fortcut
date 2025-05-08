import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import React, { useRef } from 'react';
import { Button } from './ui/Button';

type Props = {
  onLoaded: (video: HTMLVideoElement, file: File) => void;
};

export const ImportButton: React.FC<Props> = ({ onLoaded }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.onloadeddata = () => {
      video.currentTime = 0;
      onLoaded(video, file);
    };
  };

  return (
    <>
      <Button onClick={handleClick}>
        <ArrowUpTrayIcon />
        Import
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
};
