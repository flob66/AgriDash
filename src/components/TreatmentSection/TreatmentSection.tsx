// src/components/TreatmentSection/TreatmentSection.tsx
import React, { useState, useEffect } from 'react';
import { type Treatment, treatmentService } from '../../services/treatmentService';
import { TreatmentForm } from '../TreatmentForm/TreatmentForm';
import { TreatmentList } from '../TreatmentList/TreatmentList';
import { TreatmentPhotoGallery } from '../TreatmentPhotoGallery/TreatmentPhotoGallery';
import './TreatmentSection.css';

interface TreatmentSectionProps {
  animalId: string;
}

export const TreatmentSection: React.FC<TreatmentSectionProps> = ({ animalId }) => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadTreatments();
  }, [animalId]);

  const loadTreatments = async () => {
    try {
      setLoading(true);
      const data = await treatmentService.getTreatmentsByAnimal(animalId);
      setTreatments(data);
    } catch (error) {
      showMessage('error', 'Erreur lors du chargement des traitements');
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
    setEditingTreatment(null);
    setShowForm(true);
  };

  const handleEditClick = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTreatment(null);
  };

  const handleFormSubmit = async (data: {
    treatment_name: string;
    frequency: string | null;
    end_date: string | null;
    document_url: string | null;
    photo_url: string | null;
  }, file?: File, photoFile?: File) => {
    try {
      if (editingTreatment) {
        if (file) {
          await treatmentService.updateTreatmentDocument(editingTreatment.id, file);
        }
        
        if (photoFile) {
          await treatmentService.updateTreatmentPhoto(editingTreatment.id, photoFile);
        }
        
        await treatmentService.updateTreatment(editingTreatment.id, {
          treatment_name: data.treatment_name,
          frequency: data.frequency,
          end_date: data.end_date,
          document_url: data.document_url,
          photo_url: data.photo_url
        });
        
        showMessage('success', 'Traitement modifié avec succès');
      } else {
        if (file && photoFile) {
          const treatmentData = {
            animal_id: animalId,
            treatment_name: data.treatment_name,
            frequency: data.frequency,
            end_date: data.end_date
          };
          
          const treatmentWithDoc = await treatmentService.createTreatmentWithDocument(file, treatmentData);
          await treatmentService.updateTreatmentPhoto(treatmentWithDoc.id, photoFile);
        } else if (file) {
          await treatmentService.createTreatmentWithDocument(file, {
            animal_id: animalId,
            treatment_name: data.treatment_name,
            frequency: data.frequency,
            end_date: data.end_date
          });
        } else if (photoFile) {
          await treatmentService.createTreatmentWithPhoto(photoFile, {
            animal_id: animalId,
            treatment_name: data.treatment_name,
            frequency: data.frequency,
            end_date: data.end_date
          });
        } else {
          await treatmentService.createTreatment({
            animal_id: animalId,
            treatment_name: data.treatment_name,
            frequency: data.frequency,
            end_date: data.end_date,
            document_url: null,
            photo_url: null
          });
        }
        showMessage('success', 'Traitement ajouté avec succès');
      }

      await loadTreatments();
      handleFormClose();
    } catch (error) {
      console.error('Submit error:', error);
      showMessage('error', 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDeleteClick = async (treatment: Treatment) => {
    const confirmed = window.confirm('Confirmer la suppression du traitement ?');

    if (!confirmed) return;

    try {
      await treatmentService.deleteTreatment(treatment.id);
      await loadTreatments();
      showMessage('success', 'Traitement supprimé avec succès');
    } catch (error) {
      console.error('Delete error:', error);
      showMessage('error', 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="treatment-section">
      <TreatmentPhotoGallery animalId={animalId} onPhotoChange={loadTreatments} />
      
      <div className="treatment-section-header">
        <h3>Traitements</h3>
        <button className="btn-add" onClick={handleAddClick}>
          + Ajouter un traitement
        </button>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <TreatmentForm
          treatment={editingTreatment}
          animalId={animalId}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <TreatmentList
          treatments={treatments}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}
    </div>
  );
};