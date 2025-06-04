import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Home, Save, Plus, Trash2, User, UserCircle, Briefcase, Info, Phone, Mail, MapPin, Image as ImageIcon, X, Youtube } from 'lucide-react';
import CardPreview from '@/components/CardPreview';
import { saveVideo, deleteVideo, getVideo } from '@/lib/indexedDB'; // IndexedDB Funktionen importieren

const CreateCardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    autostart: false,
    image: '',
    imageName: '',
    firstName: '',
    lastName: '',
    role: '',
    description: '',
    phone: '',
    email: '',
    location: '',
    links: [{ label: '', url: '' }],
    videoLink: '',
    videoName: '',
    uniqueId: '',
    imageId: '',
    videoId: '',
  });

  // Effekt 1: Initialdaten laden (Bearbeitungsdaten oder Entwurfsdaten) beim Mounten
  useEffect(() => {
    const loadInitialData = async () => {
      console.log("Effekt 1: Starte Initialdaten-Ladevorgang...");

      // Schritt 1: Prüfe auf Bearbeitungsdaten
      const editData = localStorage.getItem('editCardData');
      if (editData) {
        console.log("Effekt 1: Bearbeitungsdaten im localStorage gefunden, lade...", editData);
        try {
          const parsedEditData = JSON.parse(editData);
          console.log("Effekt 1: Geparste Bearbeitungsdaten:", parsedEditData);
          
          // Setze alle geladenen Felder in den formData State
          // Beachte: image und videoLink sind hier temporär leer, die eigentlichen Blob URLs werden in Effekt 2 geladen
          setFormData(prev => ({
             ...prev,
             ...parsedEditData,
             // Sicherstellen, dass Links immer ein Array ist und korrekt initialisiert wird
             links: Array.isArray(parsedEditData.links) && parsedEditData.links.length > 0 ? parsedEditData.links : [{ label: '', url: '' }],
             // Temporäre URLs für Bild und Video werden später von Effekt 2 geladen
             image: '', // Setze hier auf leer, wird in Effekt 2 korrekt gesetzt
             videoLink: '', // Setze hier auf leer, wird in Effekt 2 korrekt gesetzt
             // Stelle sicher, dass uniqueId, imageId, videoId korrekt übernommen werden
             uniqueId: parsedEditData.uniqueId || '',
             imageId: parsedEditData.imageId || '',
             videoId: parsedEditData.videoId || '',
          }));

          localStorage.removeItem('editCardData'); // Lösche Bearbeitungsdaten nach dem Laden
          console.log("Effekt 1: Bearbeitungsdaten geladen und aus localStorage entfernt.");

        } catch (error) {
           console.error("Effekt 1: Fehler beim Parsen oder Laden der Bearbeitungsdaten aus localStorage:", error);
           console.log("Effekt 1: Lade stattdessen Entwurfsdaten nach Fehler beim Laden der Bearbeitungsdaten.");
           // Im Fehlerfall Entwurfsdaten laden
           loadDraftData();
        }
        return; // Beende Initialisierung, wenn Bearbeitungsdaten gefunden und verarbeitet wurden
      }

      console.log("Effekt 1: Keine Bearbeitungsdaten gefunden.");

      // Schritt 2: Prüfe auf Entwurfsdaten, wenn keine Bearbeitungsdaten vorhanden sind
      loadDraftData();
    };

    const loadDraftData = async () => {
      console.log("Effekt 1: Versuche Entwurfsdaten zu laden...");
      const savedData = localStorage.getItem('draftCardData');
      if (savedData) {
        console.log("Effekt 1: Entwurfsdaten im localStorage gefunden, lade...", savedData);
        try {
           const parsedSavedData = JSON.parse(savedData);
           console.log("Effekt 1: Geparste Entwurfsdaten:", parsedSavedData);
           setFormData(prev => ({
               ...prev,
               ...parsedSavedData,
               // Sicherstellen, dass Links immer ein Array ist und korrekt initialisiert wird
               links: Array.isArray(parsedSavedData.links) && parsedSavedData.links.length > 0 ? parsedSavedData.links : [{ label: '', url: '' }],
                // Temporäre URLs für Bild und Video werden später von Effekt 2 geladen
               image: '', // Setze hier auf leer, wird in Effekt 2 korrekt gesetzt
               videoLink: '', // Setze hier auf leer, wird in Effekt 2 korrekt gesetzt
                // Stelle sicher, dass uniqueId, imageId, videoId korrekt übernommen werden (könnten leer sein)
               uniqueId: parsedSavedData.uniqueId || '',
               imageId: parsedSavedData.imageId || '',
               videoId: parsedSavedData.videoId || '',
           }));
           console.log("Effekt 1: Entwurfsdaten geladen.");

        } catch (error) {
           console.error("Effekt 1: Fehler beim Parsen oder Laden der Entwurfsdaten aus localStorage:", error);
           console.log("Effekt 1: Starte mit leerem Formular nach Entwurfs-Fehler.");
           // SetFormData mit leerem Zustand wird hier nicht explizit aufgerufen, da es der initiale useState ist.
        }
         return; // Beende Initialisierung, wenn Entwurfsdaten gefunden und verarbeitet wurden
      }

      console.log("Effekt 1: Keine gespeicherten Initialdaten (Bearbeitungs- oder Entwurfsdaten) gefunden, starte mit leerem Formular.");
       // Leerer Zustand ist bereits der initiale State.
    };

    loadInitialData();

  }, []); // Leeres Abhängigkeitsarray: läuft nur einmal beim Mounten

  // Effekt 2: Medien (Bild/Video) aus IndexedDB laden, wenn ID-Informationen verfügbar sind
  useEffect(() => {
    const loadMedia = async () => {
      // Lade Medien nur, wenn uniqueId vorhanden ist und Medien-IDs gesetzt sind
      if (formData.uniqueId && (formData.imageId || formData.videoId)) {
        console.log('Effekt 2: Versuche Medien aus IndexedDB zu laden für UniqueId:', formData.uniqueId, 'imageId:', formData.imageId, 'videoId:', formData.videoId);
        
        // Bild laden, wenn imageId vorhanden ist und die aktuelle image URL keine Blob URL ist (vermeidet Neuladen)
        if (formData.imageId && (!formData.image || !formData.image.startsWith('blob:'))) {
            console.log('Effekt 2: Lade Bild mit ID:', formData.imageId);
            try {
              const imageBlob = await getVideo(formData.imageId);
              if (imageBlob) {
                const imageUrl = URL.createObjectURL(imageBlob);
                 setFormData(prev => ({
                    ...prev,
                    image: imageUrl, // Speichere URL temporär für Anzeige
                 }));
                 console.log('Effekt 2: Bild aus IndexedDB geladen.', formData.imageId);
              } else {
                 console.log('Effekt 2: Kein Bild-Blob in IndexedDB gefunden für ID:', formData.imageId);
                  // Wenn kein Blob gefunden, aber imageId existiert, setze image zurück
                 if (formData.image !== '') {
                     setFormData(prev => ({ ...prev, image: '' }));
                 }
              }
            } catch (error) {
              console.error('Effekt 2: Fehler beim Laden des Bildes aus IndexedDB:', error);
              // Bei Fehler auch zurücksetzen
               if (formData.image !== '') {
                  setFormData(prev => ({ ...prev, image: '' }));
               }
            }
        }

        // Video laden, wenn videoId vorhanden ist und die aktuelle videoLink URL keine Blob URL ist (vermeidet Neuladen)
         if (formData.videoId && (!formData.videoLink || !formData.videoLink.startsWith('blob:'))) {
            console.log('Effekt 2: Lade Video mit ID:', formData.videoId);
            try {
              const videoBlob = await getVideo(formData.videoId);
              if (videoBlob) {
                const videoUrl = URL.createObjectURL(videoBlob);
                 setFormData(prev => ({
                     ...prev,
                     videoLink: videoUrl, // Speichere URL temporär für Anzeige
                 }));
                 console.log('Effekt 2: Video aus IndexedDB geladen.', formData.videoId);
              } else {
                 console.log('Effekt 2: Kein Video-Blob in IndexedDB gefunden für ID:', formData.videoId);
                  // Wenn kein Blob gefunden, aber videoId existiert, setze videoLink zurück
                 if (formData.videoLink !== '') {
                     setFormData(prev => ({ ...prev, videoLink: '' }));
                 }
              }
            } catch (error) {
              console.error('Effekt 2: Fehler beim Laden des Videos aus IndexedDB:', error);
              // Bei Fehler auch zurücksetzen
               if (formData.videoLink !== '') {
                  setFormData(prev => ({ ...prev, videoLink: '' }));
               }
            }
        }

      } else if (!formData.uniqueId) { // Wenn keine uniqueId vorhanden, stelle sicher, dass keine Medien-URLs im State sind
          console.log("Effekt 2: uniqueId im State fehlt oder ist leer. Stelle sicher, dass keine Medien-URLs geladen sind.");
          // Stelle sicher, dass temporäre URLs freigegeben werden, wenn keine IDs mehr vorhanden sind
           if (formData.image && formData.image.startsWith('blob:')) {
               URL.revokeObjectURL(formData.image);
                console.log("Effekt 2: Freigegebene alte Bild-URL.", formData.image);
           }
           if (formData.videoLink && formData.videoLink.startsWith('blob:')) {
              URL.revokeObjectURL(formData.videoLink);
               console.log("Effekt 2: Freigegebene alte Video-URL.", formData.videoLink);
           }
           // Setze image und videoLink zurück, wenn keine IDs vorhanden sind (vermeidet das Halten alter Blobs)
           if (formData.image !== '' || formData.videoLink !== '') {
                setFormData(prev => ({ ...prev, image: '', videoLink: '' }));
           }
      }
      // Füge keine else if Bedingung für fehlende imageId/videoId hinzu, da Effekt 2 nur triggern soll, wenn uniqueId UND mindestens eine Medien-ID vorhanden ist
    };

    loadMedia();

    // Cleanup: Revoke Object URLs beim Unmounten oder wenn sich die Medien-URLs ändern
    return () => {
      if (formData.image && formData.image.startsWith('blob:')) {
          URL.revokeObjectURL(formData.image);
           console.log("Effekt 2 Cleanup: Freigegebene Bild-URL:", formData.image);
      }
      if (formData.videoLink && formData.videoLink.startsWith('blob:')) {
         URL.revokeObjectURL(formData.videoLink);
          console.log("Effekt 2 Cleanup: Freigegebene Video-URL:", formData.videoLink);
      }
    };

  }, [formData.uniqueId, formData.imageId, formData.videoId]); // Abhängigkeit von relevanten IDs

  // Effekt 3: Automatischen Entwurf im localStorage speichern
  useEffect(() => {
    // Speichere Entwurf nur, wenn eine uniqueId vorhanden ist oder wenn wichtige Felder ausgefüllt sind (um leere Entwürfe zu vermeiden)
    if (formData.uniqueId || formData.firstName || formData.lastName || formData.role || formData.description || formData.phone || formData.email || formData.location || (formData.links && formData.links.length > 0 && (formData.links[0].label || formData.links[0].url))) {
        console.log("Effekt 3: Speichere Entwurf...");
        const dataToSave = { ...formData };
        // Temporäre URLs und Blobs/DataURLs nicht im localStorage speichern
        delete dataToSave.videoLink; // Temporäre URL
        delete dataToSave.image;     // Temporäre URL
        
        // videoName und imageName können optional gespeichert werden, um den Namen anzuzeigen
        
        try {
            localStorage.setItem('draftCardData', JSON.stringify(dataToSave));
             console.log("Effekt 3: Entwurf automatisch gespeichert.", dataToSave);
        } catch (error) {
          console.error("Effekt 3: Fehler beim Speichern des Entwurfs:", error);
        }
    } else {
         console.log("Effekt 3: Keine relevanten Daten für Entwurfsspeicherung gefunden, überspringe Speicherung.");
    }

  }, [formData.uniqueId, formData.firstName, formData.lastName, formData.links, formData.role, formData.description, formData.phone, formData.email, formData.location, formData.autostart, formData.imageName, formData.videoName]); // Abhängigkeit auf relevante Felder (ohne Blobs/URLs)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLinkChange = (index, e) => {
    const { name, value } = e.target;
    const newLinks = [...formData.links];
    newLinks[index][name] = value;
    setFormData(prev => ({ ...prev, links: newLinks }));
  };

  const addLinkField = () => {
    setFormData(prev => ({ ...prev, links: [...prev.links, { label: '', url: '' }] }));
  };

  const removeLinkField = (index) => {
    const newLinks = formData.links.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, links: newLinks }));
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Stelle sicher, dass Vorname, Nachname und UniqueId vorhanden sind, um eine konsistente ID zu generieren
      // Wenn keine UniqueId vorhanden ist (neue Karte), wird sie in handleSubmit generiert und dann im State gesetzt
      if (!formData.firstName || !formData.lastName) {
         toast({
            variant: "destructive",
            title: "Name fehlt",
            description: "Bitte geben Sie sowohl Vorname als auch Nachname ein, bevor Sie ein Bild hochladen.",
         });
         // Setze den Wert des Datei-Inputs zurück, damit derselbe Fehler bei erneuter Auswahl auftritt
         e.target.value = null;
         return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB limit für Bilder
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "Fehler beim Hochladen",
          description: `Die Bilddatei darf maximal ${maxSize / (1024 * 1024)}MB groß sein.`, // Angepasste Fehlermeldung
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageBlob = new Blob([reader.result], { type: file.type });
        const imageId = `profileImage_${formData.firstName}_${formData.lastName}_${formData.uniqueId}`;

        try {
          await deleteVideo(imageId); // Altes Bild in IndexedDB löschen
          await saveVideo(imageId, imageBlob); // Neues Bild in IndexedDB speichern

          const imageUrl = URL.createObjectURL(imageBlob); // Temporäre URL für Vorschau
          // Wenn bereits eine alte URL in formData.image ist, freigeben
          if(formData.image && formData.image.startsWith('blob:')){
              URL.revokeObjectURL(formData.image);
          }
          setFormData(prev => ({
            ...prev,
            image: imageUrl, // Speichere TEMPORÄRE URL für Anzeige
            imageName: file.name, // Speichere nur den Namen
            imageId: imageId, // Speichere die geladene imageId
          }));
          toast({
            title: "Bild erfolgreich hochgeladen!",
            className: "bg-green-500 text-white",
          });
        } catch (error) {
          console.error("Fehler beim Speichern des Bildes in IndexedDB:", error);
          toast({
            variant: "destructive",
            title: "Fehler beim Speichern des Bildes",
            description: "Konnte das Bild nicht speichern.",
          });
        }
      };
      reader.readAsArrayBuffer(file); // Lese als ArrayBuffer für Blob
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Stelle sicher, dass Vorname, Nachname und UniqueId vorhanden sind, um eine konsistente ID zu generieren
       // Wenn keine UniqueId vorhanden ist (neue Karte), wird sie in handleSubmit generiert und dann im State gesetzt
      if (!formData.firstName || !formData.lastName) {
         toast({
            variant: "destructive",
            title: "Name fehlt",
            description: "Bitte geben Sie sowohl Vorname als auch Nachname ein, bevor Sie ein Video hochladen.",
         });
         // Setze den Wert des Datei-Inputs zurück
         e.target.value = null;
         return;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB limit für Videos
      if (file.size > maxSize) {
         toast({
            variant: "destructive",
            title: "Fehler beim Hochladen",
            description: `Die Videodatei darf maximal ${maxSize / (1024 * 1024)}MB groß sein.`, // Angepasste Fehlermeldung
         });
         e.target.value = null; // Setze den Wert des Datei-Inputs zurück
         return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const videoBlob = new Blob([reader.result], { type: file.type });
        const videoId = `profileVideo_${formData.firstName}_${formData.lastName}_${formData.uniqueId}`;

        try {
          await deleteVideo(videoId); // Altes Video in IndexedDB löschen
          await saveVideo(videoId, videoBlob); // Neues Video in IndexedDB speichern

          const videoUrl = URL.createObjectURL(videoBlob); // Temporäre URL für Vorschau
           // Wenn bereits eine alte URL in formData.videoLink ist, freigeben
          if(formData.videoLink && formData.videoLink.startsWith('blob:')){
              URL.revokeObjectURL(formData.videoLink);
          }
          setFormData(prev => ({
            ...prev,
            videoLink: videoUrl, // Speichere TEMPORÄRE URL für Anzeige
            videoName: file.name, // Speichere nur den Namen
            videoId: videoId, // Speichere die geladene videoId
            // autostart bleibt unverändert beim Hochladen
          }));
          toast({
            title: "Video erfolgreich hochgeladen!",
            className: "bg-green-500 text-white",
          });
        } catch (error) {
          console.error("Fehler beim Speichern des Videos in IndexedDB:", error);
          toast({
            variant: "destructive",
            title: "Fehler beim Speichern des Videos",
            description: "Konnte das Video nicht speichern.",
          });
        }
      };
      reader.readAsArrayBuffer(file); // Lese als ArrayBuffer für Blob
    }
  };

  const removeVideo = async () => {
    if (formData.videoLink && formData.firstName && formData.lastName) {
      const videoId = `profileVideo_${formData.firstName}_${formData.lastName}_${formData.uniqueId}`;
      try {
        await deleteVideo(videoId);
        // Temporäre URL freigeben
        if(formData.videoLink && formData.videoLink.startsWith('blob:')){
            URL.revokeObjectURL(formData.videoLink);
        }
        setFormData(prev => ({ ...prev, videoLink: '', videoName: '', autostart: false, videoId: undefined }));
        toast({
          title: "Video erfolgreich entfernt!",
          className: "bg-green-500 text-white",
        });
      } catch (error) {
        console.error("Fehler beim Löschen des Videos aus IndexedDB:", error);
        toast({
          variant: "destructive",
          title: "Fehler beim Entfernen des Videos",
          description: "Konnte das Video nicht entfernen.",
        });
      }
    }
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(formData, null, 2); // Daten formatieren
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      // Erstelle einen Standard-Dateinamen
      const filename = `visitenkarte_${formData.firstName || 'unbekannt'}_${formData.lastName || 'unbekannt'}.json`;
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url); // temporäre URL freigeben
      toast({
        title: "Export erfolgreich!",
        description: `Daten als ${filename} gespeichert.`,
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error("Fehler beim Exportieren:", error);
      toast({
        variant: "destructive",
        title: "Export fehlgeschlagen",
        description: "Konnte die Visitenkartendaten nicht exportieren.",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Normalisiere die Namen (erster Buchstabe groß, Rest klein)
    const normalizedFirstName = formData.firstName ? formData.firstName.charAt(0).toUpperCase() + formData.firstName.slice(1).toLowerCase() : '';
    const normalizedLastName = formData.lastName ? formData.lastName.charAt(0).toUpperCase() + formData.lastName.slice(1).toLowerCase() : '';
    
    // Generiere eine neue uniqueId, wenn keine vorhanden ist
    const uniqueId = formData.uniqueId || `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Generiere die Media IDs basierend auf der ermittelten UniqueId
    const imageId = `profileImage_${normalizedFirstName}_${normalizedLastName}_${uniqueId}`;
    const videoId = `profileVideo_${normalizedFirstName}_${normalizedLastName}_${uniqueId}`;

    // Aktualisiere formData mit den normalisierten Namen und der ermittelten eindeutigen ID sowie den Media IDs
    const finalFormData = {
      ...formData,
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      uniqueId: uniqueId,
      imageId: imageId,
      videoId: videoId,
    };
    
    // Generiere eine URL-freundliche ID für die Visitenkarte
    const cardId = `${normalizedFirstName}_${normalizedLastName}_${uniqueId}`.toLowerCase().replace(/\s+/g, '_');
    
    // Speichere das Bild im IndexedDB mit der vollständigen ID
    if (formData.image && formData.image.startsWith('blob:') && formData.imageId === imageId) { // Prüfe, ob es das aktuell hochgeladene/geladene Bild ist
        const imageBlob = await fetch(formData.image).then(r => r.blob());
        await saveVideo(finalFormData.imageId, imageBlob); // Speichere mit der vollständigen ID
        // URL.revokeObjectURL(formData.image); // Nicht hier freigeben, da es noch in der Vorschau verwendet wird. Freigabe im useEffect cleanup.
    } else if (formData.image && !formData.image.startsWith('blob:') && formData.imageId === imageId) {
        // Bild ist bereits eine externe URL, nichts zu speichern
    } else if (formData.image && formData.image.startsWith('blob:') && formData.imageId !== imageId) {
        // Dies sollte nicht passieren, aber falls doch, alte temporäre URL freigeben
         URL.revokeObjectURL(formData.image);
    }

    // Speichere das Video im IndexedDB mit der vollständigen ID
    if (formData.videoLink && formData.videoLink.startsWith('blob:') && formData.videoId === videoId) { // Prüfe, ob es das aktuell hochgeladene/geladene Video ist
        const videoBlob = await fetch(formData.videoLink).then(r => r.blob());
        await saveVideo(finalFormData.videoId, videoBlob); // Speichere mit der vollständigen ID
        // URL.revokeObjectURL(formData.videoLink); // Nicht hier freigeben, da es noch in der Vorschau verwendet wird. Freigabe im useEffect cleanup.
    } else if (formData.videoLink && !formData.videoLink.startsWith('blob:') && formData.videoId === videoId) {
        // Video ist bereits eine externe URL, nichts zu speichern
    } else if (formData.videoLink && formData.videoLink.startsWith('blob:') && formData.videoId !== videoId) {
        // Dies sollte nicht passieren, aber falls doch, alte temporäre URL freigeben
         URL.revokeObjectURL(formData.videoLink);
    }

    // Speichere die Visitenkarte im localStorage unter dem richtigen Schlüssel
    const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '[]');
    
    const existingIndex = userProfiles.findIndex(p => p.uniqueId === uniqueId);
    
    if (existingIndex > -1) {
      // Karte existiert bereits, aktualisiere sie
      userProfiles[existingIndex] = finalFormData;
    } else {
      // Neue Karte erstellen
      userProfiles.push(finalFormData);
    }
    
    localStorage.setItem('userProfiles', JSON.stringify(userProfiles));
    
    // Speichere die Visitenkarte als zuletzt erstellt (für Startseite)
    localStorage.setItem('lastCreatedCard', JSON.stringify(finalFormData));
    
    // Speichere die Visitenkarte in der Liste der kürzlich erstellten Karten
    const recentCards = JSON.parse(localStorage.getItem('recentCards') || '[]');
    const newRecent = {
      ...finalFormData,
      type: 'created',
      timestamp: new Date().toISOString()
    };
    
    // Entferne alte Einträge mit derselben uniqueId und füge den neuen Eintrag hinzu
    const uniqueRecents = [
      newRecent,
      ...recentCards.filter(card => card.uniqueId !== uniqueId)
    ].slice(0, 10); // Behalte nur die 10 neuesten Einträge
    
    localStorage.setItem('recentCards', JSON.stringify(uniqueRecents));
    
    // Lösche den Entwurf aus dem localStorage
    localStorage.removeItem('draftCardData');
    localStorage.removeItem('editCardData'); // Lösche auch die Bearbeitungsdaten nach erfolgreichem Speichern
    
    // Navigiere zur Visitenkarte
    navigate(`/card/${cardId}`);
  };
  
  const qrCodeUrl = formData.firstName && formData.lastName ? `${window.location.origin}/card/${formData.firstName}_${formData.lastName}` : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto my-10 bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 flex flex-col items-center"
      style={{background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)'}}
    >
      {/* Zurück-Button oben rechts */}
      <div className="absolute top-4 right-4">
        <Button asChild variant="ghost" className="text-slate-400 hover:text-slate-600">
          <Link to="/">
            <X className="h-6 w-6" />
          </Link>
        </Button>
      </div>

      <h1 className="text-2xl font-extrabold text-center mb-2 text-sky-500 tracking-tight uppercase">Visitenkarte erstellen</h1>
      <p className="text-center text-slate-500 mb-6 text-sm">Kostenlose digitale Visitenkarte – einfach & schnell!</p>
      <div className="flex flex-col items-center mb-4">
        <label htmlFor="imageFile" className="cursor-pointer group">
          {formData.image ? (
            <img src={formData.image} alt="Profilbild" className="w-24 h-24 rounded-full object-cover border-4 border-sky-200 shadow-md group-hover:opacity-80 transition" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center border-4 border-sky-100 shadow-md group-hover:opacity-80 transition">
              <ImageIcon className="w-10 h-10 text-slate-400" />
            </div>
          )}
          <input id="imageFile" name="imageFile" type="file" accept="image/png, image/jpeg, image/gif" onChange={handleImageUpload} className="hidden" />
        </label>
        <span className="text-xs text-slate-400 mt-2">Profilbild ändern</span>
      </div>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 mb-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="firstName" className="text-slate-600 font-semibold flex items-center gap-2"><User className="w-4 h-4 text-sky-400" />Vorname</Label>
          <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Max" className="bg-white border-slate-300 text-slate-700 rounded-xl shadow-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="lastName" className="text-slate-600 font-semibold flex items-center gap-2"><UserCircle className="w-4 h-4 text-sky-400" />Nachname</Label>
          <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Mustermann" className="bg-white border-slate-300 text-slate-700 rounded-xl shadow-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="role" className="text-slate-600 font-semibold flex items-center gap-2"><Briefcase className="w-4 h-4 text-sky-400" />Titel</Label>
          <Input id="role" name="role" value={formData.role} onChange={handleChange} placeholder="z.B. Entwickler" className="bg-white border-slate-300 text-slate-700 rounded-xl shadow-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="description" className="text-slate-600 font-semibold flex items-center gap-2"><Info className="w-4 h-4 text-sky-400" />Beschreibung</Label>
          <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Kurze Beschreibung über dich..." className="bg-white border-slate-300 text-slate-700 rounded-xl shadow-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="phone" className="text-slate-600 font-semibold flex items-center gap-2"><Phone className="w-4 h-4 text-sky-400" />Telefonnummer</Label>
          <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="z.B. 0123 456789" className="bg-white border-slate-300 text-slate-700 rounded-xl shadow-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="email" className="text-slate-600 font-semibold flex items-center gap-2"><Mail className="w-4 h-4 text-sky-400" />E-Mail</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="max@beispiel.de" className="bg-white border-slate-300 text-slate-700 rounded-xl shadow-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="location" className="text-slate-600 font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-sky-400" />Wohnort</Label>
          <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="z.B. Berlin" className="bg-white border-slate-300 text-slate-700 rounded-xl shadow-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-slate-600 font-semibold mb-1">Links</Label>
          {formData.links.map((link, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Input name="label" placeholder="Label" value={link.label} onChange={(e) => handleLinkChange(index, e)} className="bg-white border-slate-300 text-slate-700 rounded-xl flex-1 shadow-sm" />
              <Input name="url" type="url" placeholder="URL" value={link.url} onChange={(e) => handleLinkChange(index, e)} className="bg-white border-slate-300 text-slate-700 rounded-xl flex-1 shadow-sm" />
              {formData.links.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeLinkField(index)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full">
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addLinkField} className="text-teal-500 border-teal-300 hover:bg-teal-100 hover:text-teal-700 rounded-xl mt-1">
            <Plus className="mr-2 h-4 w-4" /> Link hinzufügen
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-slate-600 font-semibold flex items-center gap-2">
            <Youtube className="w-4 h-4 text-red-500" />Autostart Video
          </Label>
          {!formData.videoLink ? (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <input
                type="file"
                id="videoFile"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
              <label
                htmlFor="videoFile"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Youtube className="w-8 h-8 text-red-500 mb-2" />
                <span className="text-sm text-slate-600 font-medium">Video hochladen</span>
                <span className="text-xs text-slate-500 mt-1">MP4, WebM oder MOV (max. 10MB)</span>
              </label>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-slate-600 font-medium truncate">
                    {formData.videoName}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeVideo}
                  className="text-slate-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-0 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autostart"
                    checked={formData.autostart}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autostart: checked }))}
                  />
                  <Label htmlFor="autostart" className="text-sm text-slate-600 font-medium">
                    Video automatisch starten
                  </Label>
                </div>
                <span className="text-xs text-slate-500">
                  {formData.autostart ? 'Aktiviert' : 'Deaktiviert'}
                </span>
              </div>
            </div>
          )}
        </div>
        <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-full py-3 text-lg font-semibold shadow-lg mt-2">Weiter</Button>
      </form>
    </motion.div>
  );
};

export default CreateCardPage;