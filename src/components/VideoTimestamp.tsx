import { useEffect, useRef } from 'react';
import { formatDuration } from '../utils/formatDuration';

type Props = {
  video: HTMLVideoElement;
  startTime: number;
  endTime: number;
};

export const VideoTimestamp: React.FC<Props> = ({ video, startTime, endTime }) => {
  const timeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = timeRef.current;
    if (!element) return;

    const update = () => {
      const { currentTime } = video;
      element.textContent = formatDuration(currentTime - startTime);
    };

    update();

    video.addEventListener('timeupdate', update);

    return () => {
      video.removeEventListener('timeupdate', update);
    };
  }, [startTime, video]);

  return (
    <span className="text-sm font-medium text-zinc-400">
      <span ref={timeRef} className="text-zinc-100"></span> / {formatDuration(endTime - startTime)}
    </span>
  );
};
