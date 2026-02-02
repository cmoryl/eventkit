// Visual Editor State Management Hook
import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { 
  CanvasState, 
  CanvasElement, 
  Position, 
  Size, 
  EditorAction,
  HistoryState,
  ClipboardData,
  Transform
} from '@/types/visualEditor.types';

const DEFAULT_TRANSFORM: Transform = {
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0
};

const createInitialState = (width: number, height: number): CanvasState => ({
  width,
  height,
  background: { type: 'solid', value: '#ffffff' },
  elements: [],
  selectedIds: [],
  hoveredId: null,
  zoom: 1,
  pan: { x: 0, y: 0 }
});

export function useVisualEditor(initialWidth = 1080, initialHeight = 1080) {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: createInitialState(initialWidth, initialHeight),
    future: []
  });
  
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [activeTool, setActiveTool] = useState<'select' | 'pan' | 'text' | 'shape'>('select');
  
  const state = history.present;
  
  // Push state to history
  const pushState = useCallback((newState: CanvasState) => {
    setHistory(prev => ({
      past: [...prev.past.slice(-50), prev.present], // Keep last 50 states
      present: newState,
      future: []
    }));
  }, []);
  
  // Update state without history (for intermediate states like dragging)
  const updateStateWithoutHistory = useCallback((newState: CanvasState) => {
    setHistory(prev => ({
      ...prev,
      present: newState
    }));
  }, []);
  
  // Undo
  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;
      const newPast = prev.past.slice(0, -1);
      const previous = prev.past[prev.past.length - 1];
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future]
      };
    });
  }, []);
  
  // Redo
  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;
      const newFuture = prev.future.slice(1);
      const next = prev.future[0];
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture
      };
    });
  }, []);
  
  // Add element
  const addElement = useCallback((element: Partial<CanvasElement>) => {
    const newElement: CanvasElement = {
      id: uuidv4(),
      type: element.type || 'shape',
      name: element.name || `Element ${state.elements.length + 1}`,
      position: element.position || { x: 100, y: 100 },
      size: element.size || { width: 200, height: 200 },
      transform: element.transform || { ...DEFAULT_TRANSFORM },
      style: element.style || { fill: '#3b82f6', opacity: 1 },
      locked: false,
      visible: true,
      zIndex: state.elements.length,
      ...element
    };
    
    pushState({
      ...state,
      elements: [...state.elements, newElement],
      selectedIds: [newElement.id]
    });
    
    return newElement.id;
  }, [state, pushState]);
  
  // Update element
  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>, saveHistory = true) => {
    const newState = {
      ...state,
      elements: state.elements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    };
    
    if (saveHistory) {
      pushState(newState);
    } else {
      updateStateWithoutHistory(newState);
    }
  }, [state, pushState, updateStateWithoutHistory]);
  
  // Delete elements
  const deleteElements = useCallback((ids: string[]) => {
    pushState({
      ...state,
      elements: state.elements.filter(el => !ids.includes(el.id)),
      selectedIds: state.selectedIds.filter(id => !ids.includes(id))
    });
  }, [state, pushState]);
  
  // Select elements
  const selectElements = useCallback((ids: string[], addToSelection = false) => {
    updateStateWithoutHistory({
      ...state,
      selectedIds: addToSelection ? [...new Set([...state.selectedIds, ...ids])] : ids
    });
  }, [state, updateStateWithoutHistory]);
  
  // Deselect all
  const deselectAll = useCallback(() => {
    updateStateWithoutHistory({
      ...state,
      selectedIds: []
    });
  }, [state, updateStateWithoutHistory]);
  
  // Move element
  const moveElement = useCallback((id: string, position: Position, saveHistory = false) => {
    updateElement(id, { position }, saveHistory);
  }, [updateElement]);
  
  // Resize element
  const resizeElement = useCallback((
    id: string, 
    size: Size, 
    position?: Position,
    saveHistory = false
  ) => {
    const updates: Partial<CanvasElement> = { size };
    if (position) updates.position = position;
    updateElement(id, updates, saveHistory);
  }, [updateElement]);
  
  // Rotate element
  const rotateElement = useCallback((id: string, rotation: number, saveHistory = false) => {
    const element = state.elements.find(el => el.id === id);
    if (!element) return;
    
    updateElement(id, {
      transform: { ...element.transform, rotation }
    }, saveHistory);
  }, [state.elements, updateElement]);
  
  // Reorder element (bring forward/backward)
  const reorderElement = useCallback((id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const elements = [...state.elements];
    const index = elements.findIndex(el => el.id === id);
    if (index === -1) return;
    
    let newIndex: number;
    switch (direction) {
      case 'up':
        newIndex = Math.min(index + 1, elements.length - 1);
        break;
      case 'down':
        newIndex = Math.max(index - 1, 0);
        break;
      case 'top':
        newIndex = elements.length - 1;
        break;
      case 'bottom':
        newIndex = 0;
        break;
    }
    
    const [removed] = elements.splice(index, 1);
    elements.splice(newIndex, 0, removed);
    
    // Update zIndex for all elements
    const updatedElements = elements.map((el, i) => ({ ...el, zIndex: i }));
    
    pushState({ ...state, elements: updatedElements });
  }, [state, pushState]);
  
  // Duplicate elements
  const duplicateElements = useCallback((ids: string[]) => {
    const newElements: CanvasElement[] = [];
    
    ids.forEach(id => {
      const element = state.elements.find(el => el.id === id);
      if (element) {
        newElements.push({
          ...element,
          id: uuidv4(),
          name: `${element.name} copy`,
          position: {
            x: element.position.x + 20,
            y: element.position.y + 20
          },
          zIndex: state.elements.length + newElements.length
        });
      }
    });
    
    if (newElements.length > 0) {
      pushState({
        ...state,
        elements: [...state.elements, ...newElements],
        selectedIds: newElements.map(el => el.id)
      });
    }
  }, [state, pushState]);
  
  // Copy to clipboard
  const copy = useCallback(() => {
    const selectedElements = state.elements.filter(el => 
      state.selectedIds.includes(el.id)
    );
    if (selectedElements.length > 0) {
      setClipboard({
        elements: selectedElements,
        timestamp: Date.now()
      });
    }
  }, [state]);
  
  // Paste from clipboard
  const paste = useCallback(() => {
    if (!clipboard) return;
    
    const newElements: CanvasElement[] = clipboard.elements.map(el => ({
      ...el,
      id: uuidv4(),
      name: `${el.name} copy`,
      position: {
        x: el.position.x + 20,
        y: el.position.y + 20
      },
      zIndex: state.elements.length
    }));
    
    pushState({
      ...state,
      elements: [...state.elements, ...newElements],
      selectedIds: newElements.map(el => el.id)
    });
  }, [clipboard, state, pushState]);
  
  // Cut
  const cut = useCallback(() => {
    copy();
    deleteElements(state.selectedIds);
  }, [copy, deleteElements, state.selectedIds]);
  
  // Set zoom
  const setZoom = useCallback((zoom: number) => {
    updateStateWithoutHistory({
      ...state,
      zoom: Math.max(0.1, Math.min(5, zoom))
    });
  }, [state, updateStateWithoutHistory]);
  
  // Set pan
  const setPan = useCallback((pan: Position) => {
    updateStateWithoutHistory({
      ...state,
      pan
    });
  }, [state, updateStateWithoutHistory]);
  
  // Set background
  const setBackground = useCallback((background: CanvasState['background']) => {
    pushState({ ...state, background });
  }, [state, pushState]);
  
  // Clear canvas
  const clearCanvas = useCallback(() => {
    pushState(createInitialState(state.width, state.height));
  }, [state.width, state.height, pushState]);
  
  // Load state
  const loadState = useCallback((newState: CanvasState) => {
    setHistory({
      past: [],
      present: newState,
      future: []
    });
  }, []);
  
  // Resize canvas
  const resizeCanvas = useCallback((width: number, height: number) => {
    pushState({ ...state, width, height });
  }, [state, pushState]);
  
  // Group elements
  const groupElements = useCallback((ids: string[]) => {
    if (ids.length < 2) return;
    
    const elementsToGroup = state.elements.filter(el => ids.includes(el.id));
    
    // Calculate bounding box
    const minX = Math.min(...elementsToGroup.map(el => el.position.x));
    const minY = Math.min(...elementsToGroup.map(el => el.position.y));
    const maxX = Math.max(...elementsToGroup.map(el => el.position.x + el.size.width));
    const maxY = Math.max(...elementsToGroup.map(el => el.position.y + el.size.height));
    
    const groupId = uuidv4();
    
    // Update children to reference parent
    const updatedElements = state.elements.map(el => {
      if (ids.includes(el.id)) {
        return {
          ...el,
          parentId: groupId,
          position: {
            x: el.position.x - minX,
            y: el.position.y - minY
          }
        };
      }
      return el;
    });
    
    // Create group element
    const groupElement: CanvasElement = {
      id: groupId,
      type: 'group',
      name: 'Group',
      position: { x: minX, y: minY },
      size: { width: maxX - minX, height: maxY - minY },
      transform: { ...DEFAULT_TRANSFORM },
      style: { opacity: 1 },
      locked: false,
      visible: true,
      zIndex: Math.max(...elementsToGroup.map(el => el.zIndex)) + 1,
      childIds: ids
    };
    
    pushState({
      ...state,
      elements: [...updatedElements, groupElement],
      selectedIds: [groupId]
    });
  }, [state, pushState]);
  
  // Get selected elements
  const getSelectedElements = useCallback(() => {
    return state.elements.filter(el => state.selectedIds.includes(el.id));
  }, [state]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      const isMod = e.metaKey || e.ctrlKey;
      
      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (isMod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (isMod && e.key === 'y') {
        e.preventDefault();
        redo();
      } else if (isMod && e.key === 'c') {
        e.preventDefault();
        copy();
      } else if (isMod && e.key === 'v') {
        e.preventDefault();
        paste();
      } else if (isMod && e.key === 'x') {
        e.preventDefault();
        cut();
      } else if (isMod && e.key === 'd') {
        e.preventDefault();
        duplicateElements(state.selectedIds);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedIds.length > 0) {
          e.preventDefault();
          deleteElements(state.selectedIds);
        }
      } else if (e.key === 'Escape') {
        deselectAll();
      } else if (e.key === 'a' && isMod) {
        e.preventDefault();
        selectElements(state.elements.map(el => el.id));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, copy, paste, cut, duplicateElements, deleteElements, deselectAll, selectElements, state]);
  
  return {
    state,
    history,
    clipboard,
    isDragging,
    isResizing,
    isRotating,
    activeTool,
    
    // State setters
    setIsDragging,
    setIsResizing,
    setIsRotating,
    setActiveTool,
    
    // Actions
    addElement,
    updateElement,
    deleteElements,
    selectElements,
    deselectAll,
    moveElement,
    resizeElement,
    rotateElement,
    reorderElement,
    duplicateElements,
    groupElements,
    
    // Clipboard
    copy,
    paste,
    cut,
    
    // View
    setZoom,
    setPan,
    
    // Canvas
    setBackground,
    clearCanvas,
    loadState,
    resizeCanvas,
    
    // History
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    
    // Helpers
    getSelectedElements
  };
}
