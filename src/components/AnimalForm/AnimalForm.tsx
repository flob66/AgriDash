import { useState, useEffect } from 'react';
import './AnimalForm.css';

interface AnimalFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const AnimalForm = ({ initialData, onSubmit, onCancel }: AnimalFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    age: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        species: initialData.species || '',
        age: initialData.age?.toString() || '',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    }
    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 0)) {
      newErrors.age = 'L\'âge doit être un nombre valide';
    } else if (formData.age && Number(formData.age) > 50) {
      newErrors.age = 'L\'âge ne peut pas dépasser 50 ans';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        name: formData.name.trim(),
        species: formData.species.trim() || null,
        age: formData.age ? parseInt(formData.age, 10) : null,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form className="animal-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <div className="form-icon">🐄</div>
        <h2>{initialData ? 'Modifier l\'animal' : 'Ajouter un animal'}</h2>
        <p className="form-subtitle">
          {initialData ? 'Modifiez les informations de votre animal' : 'Ajoutez un nouvel animal à votre cheptel'}
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Nom <span className="required">*</span>
        </label>
        <div className="input-wrapper">
          <span className="input-icon">🏷️</span>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nom de l'animal"
            className={errors.name ? 'error' : ''}
          />
        </div>
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="species" className="form-label">
          Espèce
        </label>
        <div className="input-wrapper">
          <span className="input-icon">🐾</span>
          <input
            type="text"
            id="species"
            name="species"
            value={formData.species}
            onChange={handleChange}
            placeholder="Ex: Vache, Mouton, Chèvre..."
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="age" className="form-label">
          Âge (années)
        </label>
        <div className="input-wrapper">
          <span className="input-icon">📅</span>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="Âge en années"
            min="0"
            max="50"
            step="1"
            className={errors.age ? 'error' : ''}
          />
        </div>
        {errors.age && <span className="error-text">{errors.age}</span>}
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          <span className="btn-icon">✖️</span>
          Annuler
        </button>
        <button type="submit" className="btn-primary">
          <span className="btn-icon">
            {initialData ? '✏️' : '➕'}
          </span>
          {initialData ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
};

export default AnimalForm;