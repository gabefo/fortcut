import { useEffect, useRef } from 'react';

const getCoordinates = (e: MouseEvent | TouchEvent) => {
  if (e instanceof MouseEvent) {
    return { clientX: e.clientX, clientY: e.clientY };
  }

  if (e.touches.length > 0) {
    const touch = e.touches[0];
    return { clientX: touch.clientX, clientY: touch.clientY };
  }

  return { clientX: 0, clientY: 0 };
};

type DragInfo = {
  target: EventTarget | null;
  clientX: number;
  clientY: number;
};

type Options = {
  onDrag?: (info: DragInfo) => void;
  onDragStart?: (info: DragInfo) => void;
  onDragEnd?: (info: DragInfo) => void;
};

export const useDrag = (ref: React.RefObject<HTMLElement | null>, options: Options) => {
  const dragHandle = useRef(options.onDrag);
  const dragStartHandle = useRef(options.onDragStart);
  const dragEndHandle = useRef(options.onDragEnd);

  if (dragHandle.current !== options.onDrag) {
    dragHandle.current = options.onDrag;
  }

  if (dragStartHandle.current !== options.onDragStart) {
    dragStartHandle.current = options.onDragStart;
  }

  if (dragEndHandle.current !== options.onDragEnd) {
    dragEndHandle.current = options.onDragEnd;
  }

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    let target: EventTarget | null;

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      const { clientX, clientY } = getCoordinates(e);

      target = e.target;

      dragStartHandle.current?.({ target, clientX, clientY });

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      const { clientX, clientY } = getCoordinates(e);

      dragHandle.current?.({ target, clientX, clientY });
    };

    const handleMouseUp = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      const { clientX, clientY } = getCoordinates(e);

      dragEndHandle.current?.({ target, clientX, clientY });

      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('touchstart', handleMouseDown);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('touchstart', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [ref]);
};
