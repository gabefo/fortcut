export type Point = {
  x: number;
  y: number;
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AlignVertical = 'top' | 'middle' | 'bottom';

export type AlignHorizontal = 'left' | 'middle' | 'right';

export type Align = [AlignVertical, AlignHorizontal];

export type Overlay = {
  name: string;
  align: Align;
  position: Point;
  crop: Rect | null;
  visible: boolean;
};
