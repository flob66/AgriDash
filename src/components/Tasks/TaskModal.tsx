import type { ReactNode } from 'react';
import './TaskModal.css';

interface TaskModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function TaskModal({ isOpen, title, onClose, children }: TaskModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="task-modal-overlay" onClick={handleOverlayClick}>
      <div className="task-modal">
        <div className="task-modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="task-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}