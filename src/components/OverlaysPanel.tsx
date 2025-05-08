import {
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  WindowIcon,
} from '@heroicons/react/24/outline';
import { Overlay } from '../types';
import { cn } from '../utils/cn';
import { Button } from './ui/Button';

type Props = {
  overlays: Overlay[];
  onDelete: (overlay: Overlay) => void;
  onUpdate: (overlay: Overlay, index: number) => void;
};

export const OverlaysPanel: React.FC<Props> = ({ overlays, onDelete, onUpdate }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-base font-semibold">Overlays</div>

      <div className="flex flex-col-reverse">
        {overlays.map((overlay, index) => (
          <div
            key={overlay.name}
            className={cn('group flex cursor-pointer py-1 text-sm font-medium transition-colors', {
              ['text-zinc-400 hover:text-zinc-300']: overlay.visible,
              ['text-zinc-600']: !overlay.visible,
            })}
          >
            <div className="flex flex-1 items-center gap-2">
              <WindowIcon className="size-4" />
              {overlay.name}
            </div>
            <div className="flex items-center opacity-0 group-hover:opacity-100">
              <Button variant="ghost" size="icon">
                <Cog6ToothIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  onUpdate({ ...overlay, visible: !overlay.visible }, index);
                }}
              >
                {overlay.visible ? <EyeIcon /> : <EyeSlashIcon />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(overlay)}>
                <TrashIcon />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
