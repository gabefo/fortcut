import { useEffect, useRef } from 'react';
import { useDrag } from '../hooks/useDrag';
import { clamp } from '../utils/clamp';
import { formatDuration } from '../utils/formatDuration';
import { round } from '../utils/round';

const calculateTime = (element: HTMLElement, clientX: number, duration: number) => {
  const rect = element.getBoundingClientRect();
  const width = rect.width - 32;
  const x = clientX - rect.left - 16;
  const clampedX = clamp(x, 0, width);
  const time = (clampedX / width) * duration;
  return round(time, 1000);
};

type Props = {
  video: HTMLVideoElement;
  startTime: number;
  endTime: number;
  onStartTimeChange: (startTime: number) => void;
  onEndTimeChange: (endTime: number) => void;
};

export const VideoTimeline: React.FC<Props> = ({
  video,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const startHandleRef = useRef<HTMLDivElement>(null);
  const endHandleRef = useRef<HTMLDivElement>(null);
  const seekHandleRef = useRef<HTMLDivElement>(null);

  useDrag(ref, {
    onStart: ({ target, clientX }) => {
      video.pause();

      if (target !== startHandleRef.current && target !== endHandleRef.current) {
        const time = calculateTime(ref.current!, clientX, video.duration);
        video.currentTime = clamp(time, startTime, endTime);
      }
    },
    onDrag: ({ target, clientX }) => {
      const { duration } = video;
      const time = calculateTime(ref.current!, clientX, duration);

      if (target === startHandleRef.current) {
        const newStartTime = clamp(time, 0, endTime - 0.1);
        onStartTimeChange(newStartTime);
        if (video.currentTime < newStartTime) {
          video.currentTime = newStartTime;
        }
      } else if (target === endHandleRef.current) {
        const newEndTime = clamp(time, startTime + 0.1, duration);
        onEndTimeChange(newEndTime);
        if (video.currentTime > newEndTime) {
          video.currentTime = newEndTime;
        }
      } else {
        video.currentTime = clamp(time, startTime, endTime);
      }
    },
  });

  useEffect(() => {
    const seek = seekHandleRef.current;

    if (!seek) return;

    let frameId = 0;

    const update = () => {
      const { currentTime, duration } = video;
      seek.style.left = `calc((100% - 32px - 4px) * ${currentTime / duration} + 16px + 2px)`;
      frameId = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [video]);

  return (
    <div ref={ref} className="relative h-16">
      <div
        className="absolute h-full rounded-lg ring-2 ring-violet-600 ring-inset"
        style={{
          left: `calc((100% - 32px) * ${startTime / video.duration})`,
          right: `calc((100% - 32px) * ${1 - endTime / video.duration}`,
        }}
      >
        <div
          ref={startHandleRef}
          className="group absolute left-0 h-full w-4 cursor-ew-resize rounded-l-lg bg-violet-600 before:absolute before:top-1/2 before:left-1/2 before:block before:h-8 before:w-1 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-white"
        >
          <div className="pointer-events-none absolute -top-10 left-1/2 hidden -translate-x-1/2 rounded-full bg-white px-3 py-1 text-sm text-zinc-900 group-active:block">
            {formatDuration(startTime)}
          </div>
        </div>

        <div
          ref={endHandleRef}
          className="group absolute right-0 h-full w-4 cursor-ew-resize rounded-r-lg bg-violet-600 before:absolute before:top-1/2 before:left-1/2 before:block before:h-8 before:w-1 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-white"
        >
          <div className="pointer-events-none absolute -top-10 left-1/2 hidden -translate-x-1/2 rounded-full bg-white px-3 py-1 text-sm text-zinc-900 group-active:block">
            {formatDuration(endTime)}
          </div>
        </div>
      </div>

      <div
        ref={seekHandleRef}
        className="absolute top-1/2 h-18 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
      ></div>
    </div>
  );
};
