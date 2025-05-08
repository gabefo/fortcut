import { PauseIcon, PlayIcon } from '@heroicons/react/24/solid';
import { useCallback, useEffect, useRef, useState } from 'react';
import { formatDuration } from '../utils/formatDuration';

type Props = {
  video: HTMLVideoElement;
};

export const VideoPlayButton: React.FC<Props> = ({ video }) => {
  const [playing, setPlaying] = useState(false);
  const timeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setPlaying(!video.paused);

    const onPlay = () => {
      setPlaying(true);
    };

    const onPause = () => {
      setPlaying(false);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [video]);

  useEffect(() => {
    const element = timeRef.current;
    if (!element) return;

    const update = () => {
      const { currentTime } = video;
      element.textContent = formatDuration(currentTime);
    };

    update();

    video.addEventListener('timeupdate', update);

    return () => {
      video.removeEventListener('timeupdate', update);
    };
  }, [video]);

  const onToggle = useCallback(() => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, [video]);

  return (
    <button
      type="button"
      aria-label="Play"
      className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-white text-zinc-900 transition outline-none hover:bg-zinc-100"
      onClick={onToggle}
    >
      {playing ? <PauseIcon className="size-6" /> : <PlayIcon className="size-6" />}
    </button>
  );
};
