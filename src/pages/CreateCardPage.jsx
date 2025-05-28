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
  const [formData, setFormData] = useState(() => {
    // Versuche, gespeicherte Daten aus dem Local Storage zu laden
    const savedData = localStorage.getItem('draftCardData');
    return savedData ? JSON.parse(savedData) : {
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
    };
  });

  // Effekt zum Laden des Bildes und Videos aus IndexedDB beim Laden der Seite
  useEffect(() => {
    const loadMedia = async () => {
      // Lade Medien nur, wenn sowohl Vorname als auch Nachname vorhanden sind
      if (formData.firstName && formData.lastName) {
        console.log('Lade Medien für:', formData.firstName, formData.lastName);
        // Bild laden
        const imageId = `profileImage_${formData.firstName}_${formData.lastName}`;
        try {
          const imageBlob = await getVideo(imageId); // Verwende getVideo für Bilder
          if (imageBlob) {
            const imageUrl = URL.createObjectURL(imageBlob);
            setFormData(prev => ({
               ...prev,
               image: imageUrl, // Speichere URL temporär für Anzeige
               // image name should be loaded from the profile data if needed for display
            }));
          } else {
             // Wenn kein Blob für die aktuelle ID gefunden wurde, ABER bereits eine temporäre URL existiert,
             // bedeutet dies, dass das Bild mit einem unvollständigen Namen hochgeladen wurde.
             // In diesem Fall behalten wir die bestehende temporäre URL bei und löschen sie NICHT.
             // Die Speicherung mit der korrekten ID erfolgt beim Speichern der Visitenkarte (handleSubmit).
             if (!formData.image || !formData.image.startsWith('blob:')){
                setFormData(prev => ({ ...prev, image: '' })); // Nur löschen, wenn keine gültige temporäre URL da ist
             }
          }
        } catch (error) {
          console.error('Fehler beim Laden des Bildes aus IndexedDB:', error);
        }

        // Video laden
        const videoId = `profileVideo_${formData.firstName}_${formData.lastName}`;
        try {
          const videoBlob = await getVideo(videoId); // Verwende getVideo für Videos
          if (videoBlob) {
            const videoUrl = URL.createObjectURL(videoBlob);
            setFormData(prev => ({
                ...prev,
                videoLink: videoUrl, // Speichere URL temporär für Anzeige
                // video name should be loaded from the profile data if needed for display
                // autostart should be loaded from the profile data if needed
            }));
          } else {
             // Gleiche Logik wie beim Bild für das Video
             if (!formData.videoLink || !formData.videoLink.startsWith('blob:')){
                setFormData(prev => ({ ...prev, videoLink: '' })); // Nur löschen, wenn keine gültige temporäre URL da ist
             }
          }
        } catch (error) {
          console.error('Fehler beim Laden des Videos aus IndexedDB:', error);
        }
      } else {
          // Wenn Vorname oder Nachname fehlen, setze temporäre URLs und Namen zurück
          if (formData.image && formData.image.startsWith('blob:')) {
              URL.revokeObjectURL(formData.image);
          }
          if (formData.videoLink && formData.videoLink.startsWith('blob:')) {
             URL.revokeObjectURL(formData.videoLink);
          }
          setFormData(prev => ({ ...prev, image: '', videoLink: '', imageName: '', videoName: '', autostart: false }));
      }
    };
    loadMedia();

    // Cleanup: Revoke Object URLs beim Unmounten oder bei Namensänderung
    // Diese Logik ist immer noch notwendig, um Speicherlecks zu vermeiden
    return () => {
      if (formData.image && formData.image.startsWith('blob:')) {
          URL.revokeObjectURL(formData.image);
      }
      if (formData.videoLink && formData.videoLink.startsWith('blob:')) {
         URL.revokeObjectURL(formData.videoLink);
      }
    };

  }, [formData.firstName, formData.lastName]); // Abhängigkeit auf username, um bei Namensänderung neu zu laden

  // Effekt zum automatischen Speichern bei jeder Änderung von formData (ohne Blobs/URLs)
  useEffect(() => {
    try {
      const dataToSave = { ...formData };
      // Temporäre URLs und Blobs/DataURLs nicht im localStorage speichern
      delete dataToSave.videoLink; // Temporäre URL
      delete dataToSave.image;     // Temporäre URL

      // videoName und imageName können optional gespeichert werden, um den Namen anzuzeigen

      localStorage.setItem('draftCardData', JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Fehler beim Speichern des Entwurfs:", error);
    }
  }, [formData]); // Dieser Effekt läuft, wenn sich formData ändert

  useEffect(() => {
    // Lade gespeicherte Daten aus dem localStorage
    const savedData = localStorage.getItem('cardData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }

    // Prüfe, ob wir eine Visitenkarte zum Bearbeiten haben
    const editData = localStorage.getItem('editCardData');
    if (editData) {
      setFormData(JSON.parse(editData));
      // Lösche die Bearbeitungsdaten nach dem Laden
      localStorage.removeItem('editCardData');
    }
  }, []);

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
      // Stelle sicher, dass Vorname und Nachname vorhanden sind, um eine konsistente ID zu generieren
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
        const imageId = `profileImage_${formData.firstName}_${formData.lastName}`;

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
            imageName: file.name // Speichere nur den Namen
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
      // Stelle sicher, dass Vorname und Nachname vorhanden sind, um eine konsistente ID zu generieren
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
        const videoId = `profileVideo_${formData.firstName}_${formData.lastName}`;

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
      const videoId = `profileVideo_${formData.firstName}_${formData.lastName}`;
      try {
        await deleteVideo(videoId);
        // Temporäre URL freigeben
        if(formData.videoLink && formData.videoLink.startsWith('blob:')){
            URL.revokeObjectURL(formData.videoLink);
        }
        setFormData(prev => ({ ...prev, videoLink: '', videoName: '', autostart: false }));
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
    
    // Generiere eine eindeutige ID für die Visitenkarte
    const cardId = `${formData.firstName}_${formData.lastName}`.toLowerCase().replace(/\s+/g, '_');
    
    // Speichere die Visitenkarte im localStorage
    localStorage.setItem(`card_${cardId}`, JSON.stringify(formData));
    
    // Speichere die Visitenkarte als zuletzt erstellt
    localStorage.setItem('lastCreatedCard', JSON.stringify(formData));
    
    // Speichere die Visitenkarte in der Liste der kürzlich erstellten Karten
    const recentCards = JSON.parse(localStorage.getItem('recentCards') || '[]');
    const newRecent = {
      ...formData,
      type: 'created',
      timestamp: new Date().toISOString()
    };
    
    // Entferne doppelte Einträge und füge den neuen Eintrag hinzu
    const uniqueRecents = [
      newRecent,
      ...recentCards.filter(card => 
        card.firstName !== formData.firstName || 
        card.lastName !== formData.lastName
      )
    ].slice(0, 10); // Behalte nur die 10 neuesten Einträge
    
    localStorage.setItem('recentCards', JSON.stringify(uniqueRecents));
    
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