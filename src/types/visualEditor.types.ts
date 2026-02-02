// Visual Editor Types - Canva-style canvas editor system

export type ElementType = 'text' | 'image' | 'shape' | 'logo' | 'qrcode' | 'icon' | 'group';

export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'star' | 'line' | 'arrow';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Transform {
  rotation: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
}

export interface ElementStyle {
  // Fill
  fill?: string;
  fillOpacity?: number;
  
  // Stroke
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  strokeDasharray?: string;
  
  // Effects
  opacity?: number;
  blur?: number;
  shadow?: {
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
  };
  
  // Border radius
  borderRadius?: number;
  
  // Gradient
  gradient?: {
    type: 'linear' | 'radial';
    angle?: number;
    stops: { offset: number; color: string }[];
  };
}

export interface TextStyle extends ElementStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textDecoration: 'none' | 'underline' | 'line-through';
  lineHeight: number;
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  verticalAlign: 'top' | 'middle' | 'bottom';
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  name: string;
  position: Position;
  size: Size;
  transform: Transform;
  style: ElementStyle;
  locked: boolean;
  visible: boolean;
  zIndex: number;
  
  // Type-specific content
  content?: string; // For text
  src?: string; // For images
  shapeType?: ShapeType; // For shapes
  iconName?: string; // For icons
  qrData?: string; // For QR codes
  
  // Text-specific
  textStyle?: TextStyle;
  
  // Grouping
  parentId?: string;
  childIds?: string[];
}

export interface CanvasState {
  width: number;
  height: number;
  background: {
    type: 'solid' | 'gradient' | 'image' | 'transparent';
    value: string;
  };
  elements: CanvasElement[];
  selectedIds: string[];
  hoveredId: string | null;
  zoom: number;
  pan: Position;
}

export interface HistoryState {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
}

export interface EditorTool {
  id: string;
  name: string;
  icon: string;
  shortcut?: string;
  action: 'select' | 'pan' | 'zoom' | 'text' | 'shape' | 'image' | 'draw';
}

export interface SnapGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  elementId?: string;
}

export interface ElementPreset {
  id: string;
  name: string;
  category: string;
  thumbnail?: string;
  element: Partial<CanvasElement>;
}

// Editor actions
export type EditorAction = 
  | { type: 'ADD_ELEMENT'; element: CanvasElement }
  | { type: 'UPDATE_ELEMENT'; id: string; updates: Partial<CanvasElement> }
  | { type: 'DELETE_ELEMENTS'; ids: string[] }
  | { type: 'SELECT_ELEMENTS'; ids: string[] }
  | { type: 'DESELECT_ALL' }
  | { type: 'MOVE_ELEMENT'; id: string; position: Position }
  | { type: 'RESIZE_ELEMENT'; id: string; size: Size; position?: Position }
  | { type: 'ROTATE_ELEMENT'; id: string; rotation: number }
  | { type: 'REORDER_ELEMENT'; id: string; direction: 'up' | 'down' | 'top' | 'bottom' }
  | { type: 'GROUP_ELEMENTS'; ids: string[] }
  | { type: 'UNGROUP_ELEMENTS'; groupId: string }
  | { type: 'DUPLICATE_ELEMENTS'; ids: string[] }
  | { type: 'LOCK_ELEMENTS'; ids: string[]; locked: boolean }
  | { type: 'SET_VISIBILITY'; ids: string[]; visible: boolean }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_PAN'; pan: Position }
  | { type: 'SET_BACKGROUND'; background: CanvasState['background'] }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_CANVAS' }
  | { type: 'LOAD_STATE'; state: CanvasState };

// Selection box for multi-select
export interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// Resize handles
export type ResizeHandle = 
  | 'top-left' | 'top' | 'top-right'
  | 'left' | 'right'
  | 'bottom-left' | 'bottom' | 'bottom-right'
  | 'rotate';

// Clipboard
export interface ClipboardData {
  elements: CanvasElement[];
  timestamp: number;
}
