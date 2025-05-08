import { AlertDialog, Progress } from '@base-ui-components/react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { Overlay } from '../types';
import { Button } from './ui/Button';

type Props = {
  file: File;
  video: HTMLVideoElement;
  overlays: Overlay[];
  aspectRatio: string;
  startTime: number;
  endTime: number;
};

export const ExportButton: React.FC<Props> = ({
  file,
  overlays,
  aspectRatio,
  startTime,
  endTime,
}) => {
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    const ffmpeg = new FFmpeg();

    ffmpeg.on('progress', ({ progress }) => {
      setProgress(progress * 100);
    });

    setPending(true);
    setProgress(0);

    try {
      await ffmpeg.load();
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));

      const [wRatio, hRatio] = aspectRatio.split(':').map(Number);
      const ratioExpr = `${wRatio}/${hRatio}`;

      let filterGraph = `[0:v]crop='if(gte(in_w/in_h,${ratioExpr}),in_h*${ratioExpr},in_w)':'if(gte(in_w/in_h,${ratioExpr}),in_h,in_w*${hRatio}/${wRatio})'[base];`;

      const overlayChains: string[] = [];

      overlays.forEach(({ crop, position, align }, i) => {
        const label = `ov${i}`;

        if (crop) {
          filterGraph += `[0:v]crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}[${label}];`;
        } else {
          filterGraph += `[0:v][${label}];`;
        }

        const input = i === 0 ? '[base]' : `[out${i - 1}]`;

        let x: string | number = position.x;
        let y: string | number = position.y;

        switch (align[0]) {
          case 'top':
            y = position.y;
            break;
          case 'bottom':
            y = `(main_h-overlay_h-${position.y})`;
            break;
          case 'middle':
            y = `((main_h-overlay_h)/2+${position.y})`;
            break;
        }

        switch (align[1]) {
          case 'left':
            x = position.x;
            break;
          case 'right':
            x = `(main_w-overlay_w-${position.x})`;
            break;
          case 'middle':
            x = `((main_w-overlay_w)/2+${position.x})`;
            break;
        }

        overlayChains.push(`${input}[${label}]overlay=${x}:${y}[out${i}]`);
      });

      filterGraph += overlayChains.join(';');
      filterGraph = filterGraph.replace(/;$/, '');

      const outputLabel = overlays.length > 0 ? `[out${overlays.length - 1}]` : '[base]';

      await ffmpeg.exec([
        '-ss',
        `${startTime}`,
        '-to',
        `${endTime}`,
        '-i',
        'input.mp4',
        '-filter_complex',
        filterGraph,
        '-map',
        outputLabel,
        '-map',
        '0:a?',
        '-c:v',
        'libx264',
        '-preset',
        'ultrafast',
        '-crf',
        '18',
        '-c:a',
        'copy',
        'output.mp4',
      ]);

      const data = await ffmpeg.readFile('output.mp4');
      const url = URL.createObjectURL(new Blob([data], { type: 'video/mp4' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
    } catch (error) {
      console.error(error);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button onClick={handleExport} disabled={pending}>
        <ArrowDownTrayIcon />
        {pending ? 'Exporting...' : 'Export'}
      </Button>
      <AlertDialog.Root open={pending}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70" />
          <AlertDialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-zinc-800 p-6 text-zinc-100 transition-all duration-150 outline-none data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
            <Progress.Root className="grid grid-cols-2 gap-y-4" value={progress}>
              <Progress.Label className="text-sm font-medium text-zinc-100">
                Exporting video
              </Progress.Label>
              <Progress.Value className="col-start-2 text-right text-sm text-zinc-200" />
              <Progress.Track className="col-span-full h-1 overflow-hidden rounded bg-zinc-700">
                <Progress.Indicator className="block bg-violet-600 transition-all duration-500" />
              </Progress.Track>
            </Progress.Root>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
};
