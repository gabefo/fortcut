import { useEffect, useRef } from 'react';

const getCoordinates = (e: MouseEvent | TouchEvent) => {
  if (e instanceof MouseEvent) {
    return { clientX: e.clientX, clientY: e.clientY };
  }

  const touch = e.touches[0] || e.changedTouches[0];
  return { clientX: touch.pageX || touch.clientX, clientY: touch.pageY || touch.clientY };
};

type DragCallback = (info: {
  target: EventTarget | null;
  clientX: number;
  clientY: number;
}) => void;

type Options = {
  onDrag?: DragCallback;
  onStart?: DragCallback;
  onStop?: DragCallback;
};

export const useDrag = (ref: React.RefObject<HTMLElement | null>, options: Options) => {
  const dragHandle = useRef(options.onDrag);
  const startHandle = useRef(options.onStart);
  const stopHandle = useRef(options.onStop);

  if (dragHandle.current !== options.onDrag) {
    dragHandle.current = options.onDrag;
  }

  if (startHandle.current !== options.onStart) {
    startHandle.current = options.onStart;
  }

  if (stopHandle.current !== options.onStop) {
    stopHandle.current = options.onStop;
  }

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    let target: EventTarget | null;

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      const { clientX, clientY } = getCoordinates(e);

      target = e.target;

      startHandle.current?.({ target, clientX, clientY });

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const { clientX, clientY } = getCoordinates(e);

      dragHandle.current?.({ target, clientX, clientY });
    };

    const handleMouseUp = (e: MouseEvent | TouchEvent) => {
      const { clientX, clientY } = getCoordinates(e);

      stopHandle.current?.({ target, clientX, clientY });

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
