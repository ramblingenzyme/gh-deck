import { useEffect, useRef, useState } from 'react';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

export function useColumnDragDrop(columnId: string) {
  const [isDragging, setIsDragging] = useState(false);
  const [dropEdge, setDropEdge] = useState<'left' | 'right' | null>(null);
  const ref = useRef<HTMLElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cleanupDraggable = draggable({
      element: el,
      dragHandle: handleRef.current ?? undefined,
      getInitialData: () => ({ columnId }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
    const cleanupDropTarget = dropTargetForElements({
      element: el,
      getData: () => ({ columnId }),
      canDrop: ({ source }) => source.data.columnId !== columnId,
      onDragEnter: ({ location }) => {
        const rect = el.getBoundingClientRect();
        const mid = rect.left + rect.width / 2;
        setDropEdge(location.current.input.clientX < mid ? 'left' : 'right');
      },
      onDrag: ({ location }) => {
        const rect = el.getBoundingClientRect();
        const mid = rect.left + rect.width / 2;
        setDropEdge(location.current.input.clientX < mid ? 'left' : 'right');
      },
      onDragLeave: () => setDropEdge(null),
      onDrop: () => setDropEdge(null),
    });
    return () => {
      cleanupDraggable();
      cleanupDropTarget();
    };
  }, [columnId]);

  return { ref, handleRef, isDragging, dropEdge };
}
