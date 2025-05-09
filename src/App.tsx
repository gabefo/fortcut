import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { ExportButton } from './components/ExportButton';
import { OverlaysPanel } from './components/OverlaysPanel';
import { Button } from './components/ui/Button';
import { VideoCanvas } from './components/VideoCanvas';
import { VideoPlayButton } from './components/VideoControls';
import { VideoTimeline } from './components/VideoTimeline';
import { VideoTimestamp } from './components/VideoTimestamp';
import { useUploadVideo } from './hooks/useUploadVideo';
import { Overlay } from './types';
import { point, rect } from './utils';

export default function App() {
  const { upload, video, file, isLoading } = useUploadVideo();

  const [aspectRatio, setAspectRatio] = useState('4:5');
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  useEffect(() => {
    if (!video) return;

    const handlePlay = () => {
      if (video.currentTime >= endTime) {
        video.currentTime = startTime;
      }
    };

    const handleTimeUpdate = () => {
      if (video.currentTime < startTime) {
        video.currentTime = startTime;
      } else if (video.currentTime > endTime) {
        if (video.loop) {
          video.currentTime = startTime;
        } else {
          video.pause();
          video.currentTime = endTime;
        }
      }
    };

    handleTimeUpdate();

    video.addEventListener('play', handlePlay);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [endTime, startTime, video]);

  useEffect(() => {
    if (!video) return;

    const { videoWidth, videoHeight } = video;
    const scale = videoWidth / 1920;

    setOverlays([
      {
        name: 'Minimap',
        align: ['top', 'right'],
        position: point(20, 80),
        crop: rect(videoWidth - 320 * scale, 20 * scale, 300 * scale, 300 * scale),
        visible: false,
      },
      {
        name: 'Stats',
        align: ['top', 'middle'],
        position: point(0, 80),
        crop: rect(videoWidth - 320 * scale, 320 * scale, 300 * scale, 45 * scale),
        visible: true,
      },
      {
        name: 'Inventory',
        align: ['bottom', 'middle'],
        position: point(0, 20 + 100 * scale),
        crop: rect(videoWidth - 425 * scale, videoHeight - 171 * scale, 404 * scale, 89 * scale),
        visible: true,
      },
      {
        name: 'Health & Shield',
        align: ['bottom', 'middle'],
        position: point(0, 20),
        crop: rect(55 * scale, videoHeight - 111 * scale, 540 * scale, 80 * scale),
        visible: true,
      },
    ]);
    setStartTime(0);
    setEndTime(video.duration);
  }, [video]);

  const visibleOverlays = useMemo(() => overlays.filter(({ visible }) => visible), [overlays]);

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100 select-none">
      <header className="flex h-16 shrink-0 items-center border-b border-zinc-700 bg-zinc-800 px-4">
        <Button onClick={upload}>
          <ArrowUpTrayIcon />
          Import
        </Button>
      </header>

      {video && file && (
        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex shrink-0 items-center justify-center p-2">
              <AspectRatioSelector value={aspectRatio} onValueChange={setAspectRatio} />
            </div>

            <div className="relative flex-1 overflow-hidden">
              <VideoCanvas video={video} aspectRatio={aspectRatio} overlays={visibleOverlays} />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-sm text-zinc-100">
                  Loading...
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6 p-4">
              <div className="flex items-center justify-center gap-2">
                <div className="flex flex-1 items-center justify-end"></div>
                <VideoPlayButton video={video} />
                <div className="flex flex-1 items-center">
                  <VideoTimestamp video={video} startTime={startTime} endTime={endTime} />
                </div>
              </div>

              <VideoTimeline
                video={video}
                startTime={startTime}
                endTime={endTime}
                onStartTimeChange={setStartTime}
                onEndTimeChange={setEndTime}
              />
            </div>
          </div>

          <aside className="relative flex h-80 shrink-0 flex-col border-t border-zinc-800 bg-zinc-900 lg:h-full lg:w-80 lg:border-t-0 lg:border-l">
            <div className="flex flex-1 flex-col overflow-auto px-6 py-4">
              <OverlaysPanel
                overlays={overlays}
                onDelete={(overlay) => setOverlays((prev) => prev.filter((o) => o !== overlay))}
                onUpdate={(overlay, index) =>
                  setOverlays((prev) => prev.map((o, i) => (i === index ? overlay : o)))
                }
              />
            </div>

            <div className="flex justify-end border-t border-zinc-800 p-4">
              {
                <ExportButton
                  video={video}
                  file={file}
                  overlays={visibleOverlays}
                  aspectRatio={aspectRatio}
                  startTime={startTime}
                  endTime={endTime}
                />
              }
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
