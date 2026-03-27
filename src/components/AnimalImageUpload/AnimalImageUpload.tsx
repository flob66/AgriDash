import { useState, useRef, useEffect } from 'react';
import './AnimalImageUpload.css';

interface AnimalImageUploadProps {
  animalId: string;
  onUploadSuccess: () => void;
}

const AnimalImageUpload = ({ animalId, onUploadSuccess }: AnimalImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

  useEffect(() => {

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (showCamera) {
      initCamera();
    } else {
      stopCamera();
    }
  }, [showCamera, selectedDeviceId]);

  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableDevices(videoDevices);

      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error enumerating devices:', err);
    }
  };

  const initCamera = async () => {
    try {
      setCameraError(null);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true,
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }

      await getAvailableCameras();

    } catch (err: any) {
      console.error('Camera error:', err);
      let errorMessage = 'Impossible d\'accéder à la caméra';

      if (err.name === 'NotAllowedError') {
        errorMessage = 'Vous devez autoriser l\'accès à la caméra';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Aucune caméra trouvée sur cet appareil';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'La caméra est déjà utilisée par une autre application';
      }

      setCameraError(errorMessage);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const base64Image = canvas.toDataURL('image/jpeg', 0.9);
        setPreview(base64Image);

        fetch(base64Image)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setSelectedFile(file);
          });

        setShowCamera(false);
        setMessage(null);
      }
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'Fichier trop volumineux (max 10 Mo)';
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Format de fichier incorrect (formats acceptés : png, jpg)';
    }
    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setMessage({ text: error, type: 'error' });
      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setMessage(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ text: 'Veuillez sélectionner ou prendre une photo', type: 'error' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const { uploadAnimalPhoto } = await import('../../services/animalPhotosService');
      await uploadAnimalPhoto(selectedFile, animalId);

      setMessage({ text: 'Photo ajoutée avec succès', type: 'success' });
      setPreview(null);
      setSelectedFile(null);
      setShowCamera(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ text: 'Erreur lors de l\'upload', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
    setShowCamera(false);
    setCameraError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setMessage(null);
  };

  const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeviceId(event.target.value);

  };

  const openCamera = () => {
    setShowCamera(true);
    setPreview(null);
    setSelectedFile(null);
    setCameraError(null);
  };

  return (
    <div className="animal-image-upload">
      <div className="upload-header">
        <h3>Ajouter une photo</h3>
      </div>

      <div className="upload-area">
        {!showCamera && !preview && (
          <div className="upload-options">
            <div className="upload-input">
              <label htmlFor="photo-upload" className="upload-label">
                <span className="upload-icon">📁</span>
                <span>Choisir un fichier</span>
                <span className="upload-hint">PNG ou JPG, max 10 Mo</span>
              </label>
              <input
                ref={fileInputRef}
                id="photo-upload"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileSelect}
                disabled={uploading}
                className="file-input"
              />
            </div>

            <div className="upload-divider">ou</div>

            <button
              type="button"
              className="camera-btn"
              onClick={openCamera}
              disabled={uploading}
            >
              <span className="camera-icon">📷</span>
              <span>Prendre une photo</span>
              <span className="upload-hint">Utilisez votre caméra</span>
            </button>
          </div>
        )}

        {showCamera && (
          <div className="camera-section">
            <div className="camera-container">
              {cameraError ? (
                <div className="camera-error">
                  <span className="error-icon">⚠️</span>
                  <p>{cameraError}</p>
                  <button
                    type="button"
                    className="retry-camera-btn"
                    onClick={initCamera}
                  >
                    Réessayer
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="camera-preview"
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />

                  {availableDevices.length > 1 && (
                    <div className="camera-selector">
                      <label htmlFor="camera-select">Changer de caméra :</label>
                      <select
                        id="camera-select"
                        value={selectedDeviceId}
                        onChange={handleDeviceChange}
                        disabled={!cameraActive}
                      >
                        {availableDevices.map(device => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Caméra ${device.deviceId.slice(0, 5)}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="camera-actions">
              <button
                type="button"
                className="cancel-camera-btn"
                onClick={handleCancel}
                disabled={uploading}
              >
                Annuler
              </button>
              {!cameraError && (
                <button
                  type="button"
                  className="capture-btn"
                  onClick={capturePhoto}
                  disabled={!cameraActive || uploading}
                >
                  📸 Prendre la photo
                </button>
              )}
            </div>
          </div>
        )}

        {preview && !showCamera && (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="image-preview" />
            <div className="preview-actions">
              <button
                type="button"
                className="preview-cancel"
                onClick={handleCancel}
                disabled={uploading}
              >
                Annuler
              </button>
              <button
                type="button"
                className="preview-upload"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'Upload...' : 'Confirmer'}
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className={`upload-message ${message.type}`}>
            {message.type === 'success' ? '✓' : '⚠'} {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimalImageUpload;