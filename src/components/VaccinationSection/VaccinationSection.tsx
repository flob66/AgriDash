import React, { useState, useEffect } from 'react';
import { type Vaccination, vaccinationService } from '../../services/vaccinationService';
import { VaccinationForm } from '../VaccinationForm/VaccinationForm';
import { VaccinationList } from '../VaccinationList/VaccinationList';
import './VaccinationSection.css';

interface VaccinationSectionProps {
  animalId: string;
}

export const VaccinationSection: React.FC<VaccinationSectionProps> = ({ animalId }) => {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVaccination, setEditingVaccination] = useState<Vaccination | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadVaccinations();
  }, [animalId]);

  const loadVaccinations = async () => {
    try {
      setLoading(true);
      const data = await vaccinationService.getVaccinationsByAnimal(animalId);
      setVaccinations(data);
    } catch (error) {
      showMessage('error', 'Erreur lors du chargement des vaccinations');
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddClick = () => {
    setEditingVaccination(null);
    setShowForm(true);
  };

  const handleEditClick = (vaccination: Vaccination) => {
    setEditingVaccination(vaccination);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingVaccination(null);
  };

  const handleFormSubmit = async (data: {
    vaccine_name: string;
    last_vaccine_date: string | null;
    next_vaccine_date: string | null;
    document_url: string | null;
  }, file?: File) => {
    try {
      if (editingVaccination) {
        if (file) {

          await vaccinationService.updateVaccinationDocument(editingVaccination.id, file);
        }

        await vaccinationService.updateVaccination(editingVaccination.id, {
          vaccine_name: data.vaccine_name,
          last_vaccine_date: data.last_vaccine_date,
          next_vaccine_date: data.next_vaccine_date,
          document_url: data.document_url
        });

        showMessage('success', 'Vaccination modifiée avec succès');
      } else {
        if (file) {

          await vaccinationService.createVaccinationWithDocument(file, {
            animal_id: animalId,
            vaccine_name: data.vaccine_name,
            last_vaccine_date: data.last_vaccine_date,
            next_vaccine_date: data.next_vaccine_date
          });
        } else {

          await vaccinationService.createVaccination({
            animal_id: animalId,
            vaccine_name: data.vaccine_name,
            last_vaccine_date: data.last_vaccine_date,
            next_vaccine_date: data.next_vaccine_date,
            document_url: null
          });
        }
        showMessage('success', 'Vaccination ajoutée avec succès');
      }

      await loadVaccinations();
      handleFormClose();
    } catch (error) {
      console.error('Submit error:', error);
      showMessage('error', 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDeleteClick = async (vaccination: Vaccination) => {
    const confirmed = window.confirm('Confirmer la suppression de cette vaccination ?');

    if (!confirmed) return;

    try {
      await vaccinationService.deleteVaccination(vaccination.id);
      await loadVaccinations();
      showMessage('success', 'Vaccination supprimée avec succès');
    } catch (error) {
      console.error('Delete error:', error);
      showMessage('error', 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="vaccination-section">
      <div className="vaccination-section-header">
        <h3>Vaccinations</h3>
        <button className="btn-add" onClick={handleAddClick}>
          + Ajouter une vaccination
        </button>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <VaccinationForm
          vaccination={editingVaccination}
          animalId={animalId}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <VaccinationList
          vaccinations={vaccinations}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}
    </div>
  );
};