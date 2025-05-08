// components/AspectRatioSelector.tsx
import { Select } from '@base-ui-components/react';
import { ArrowsPointingOutIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import React from 'react';

type Props = {
  value: string;
  onValueChange: (ratio: string) => void;
};

const options = ['9:16', '4:5', '2:3', '1:1'];

export const AspectRatioSelector: React.FC<Props> = ({ value, onValueChange }) => {
  return (
    <Select.Root value={value} onValueChange={onValueChange} alignItemToTrigger={false}>
      <Select.Trigger className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 p-2 text-sm text-zinc-200 shadow transition outline-none hover:border-zinc-600 hover:bg-zinc-700 hover:text-zinc-100">
        <ArrowsPointingOutIcon className="size-4" />
        <Select.Value />
        <Select.Icon>
          <ChevronDownIcon className="size-4 opacity-60" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="z-10 outline-none" sideOffset={8}>
          <Select.Popup className="max-h-[var(--available-height)] min-w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-y-auto rounded-md bg-zinc-800 p-1 text-zinc-100 shadow-lg transition-[transform,scale,opacity] outline-none">
            {options.map((ratio) => (
              <Select.Item
                key={ratio}
                value={ratio}
                className="relative flex cursor-pointer items-center gap-2 rounded-sm py-2 pr-3 pl-8 text-sm leading-4 transition outline-none select-none data-[highlighted]:bg-zinc-700"
              >
                <Select.ItemIndicator className="absolute left-2">
                  <CheckIcon className="size-4" />
                </Select.ItemIndicator>
                <Select.ItemText>{ratio}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
};
