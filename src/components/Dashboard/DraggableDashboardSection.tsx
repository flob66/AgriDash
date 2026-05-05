import type { ReactNode, DragEvent } from 'react';
import './DraggableDashboardSection.css';

interface DraggableDashboardSectionProps {
  id: number;
  index: number;
  children: ReactNode;
  isEditMode: boolean;
  onDragStart: (id: number, index: number) => void;
  onDragOver: (e: DragEvent, targetIndex: number) => void;
  onDrop: (sourceId: number, targetIndex: number) => void;
}

export function DraggableDashboardSection({
  id,
  index,
  children,
  isEditMode,
  onDragStart,
  onDragOver,
  onDrop,
}: DraggableDashboardSectionProps) {
  const handleDragStart = (e: DragEvent) => {
    if (!isEditMode) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, index }));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(id, index);
  };

  const handleDragOver = (e: DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver(e, index);
  };

  const handleDrop = (e: DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    onDrop(data.id, index);
  };

  return (
    <div
      className={`draggable-section ${isEditMode ? 'edit-mode' : ''}`}
      draggable={isEditMode}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isEditMode && (
        <div className="drag-handle">
          ⋮⋮
        </div>
      )}
      <div className="draggable-content">
        {children}
      </div>
    </div>
  );
}