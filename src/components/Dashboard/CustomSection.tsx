import type { CustomField } from '../../services/dashboardCustomSectionsService';
import './CustomSection.css';

interface CustomSectionProps {
  title: string;
  fields: CustomField[];
  isEditMode: boolean;
  onDelete?: () => void;
}

export function CustomSection({ title, fields, isEditMode, onDelete }: CustomSectionProps) {
  return (
    <div className="custom-section">
      <div className="custom-section-header">
        <h4>{title}</h4>
        {isEditMode && onDelete && (
          <button className="delete-section-btn" onClick={onDelete} title="Supprimer cette section">
            🗑️
          </button>
        )}
      </div>
      <div className="custom-section-body">
        {fields.map((field, index) => (
          <div key={index} className="custom-field">
            <span className="field-key">{field.key}</span>
            <span className="field-value">{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}