import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ColorPickerInput } from '@/components/ui/color-picker-input';
import { useToast } from '@/components/ui/use-toast';
import { Home, Save, Plus, Trash2, Palette, User, UserCircle, Briefcase, Info, Phone, Mail, MapPin, Image as ImageIcon, X } from 'lucide-react';
import CardPreview from '@/components/CardPreview';

const CreateCardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState(() => {
    // Versuche, gespeicherte Daten aus dem Local Storage zu laden
    const savedData = localStorage.getItem('draftCardData');
    return savedData ? JSON.parse(savedData) : {
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
      themeColors: {
        primary: '#0ea5e9',
        accentText: '#67e8f9',
        // Weitere Farben hier bei Bedarf hinzufügen, basierend auf dem vorherigen Stand
      },
    };
  });

  // Effekt zum automatischen Speichern bei jeder Änderung von formData
  useEffect(() => {
    try {
      localStorage.setItem('draftCardData', JSON.stringify(formData));
      // Optional: Eine kleine visuelle Bestätigung hinzufügen
      // console.log("Entwurf automatisch gespeichert!");
    } catch (error) {
      console.error("Fehler beim Speichern des Entwurfs:", error);
      // Optional: Toast-Nachricht anzeigen, falls das Speichern fehlschlägt
      // toast({ variant: "destructive", description: "Entwurf konnte nicht gespeichert werden." });
    }
  }, [formData]); // Dieser Effekt läuft, wenn sich formData ändert

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (colorName, value) => {
    setFormData(prev => ({
      ...prev,
      themeColors: {
        ...prev.themeColors,
        [colorName]: value,
      }
    }));
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
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: "Fehler beim Hochladen",
          description: "Die Bilddatei darf maximal 2MB groß sein.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result, imageName: file.name }));
      };
      reader.readAsDataURL(file);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('handleSubmit gestartet.');

    if (!formData.firstName || !formData.lastName) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Vorname und Nachname sind Pflichtfelder.",
      });
      console.log('Validierung fehlgeschlagen: Vorname oder Nachname fehlt.');
      return;
    }

    try {
      console.log('Validierung erfolgreich. Versuche Daten zu speichern...');
      const existingProfiles = JSON.parse(localStorage.getItem('userProfiles')) || [];
      console.log('Vorhandene Profile aus localStorage geladen:', existingProfiles);

      if (existingProfiles.some(p => p.firstName === formData.firstName && p.lastName === formData.lastName)) {
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Eine Visitenkarte mit diesem Namen existiert bereits.",
        });
        console.log('Validierung fehlgeschlagen: Name existiert bereits.');
        return;
      }
      
      const profileToSave = { ...formData };
      console.log('Zu speicherndes Profil vorbereitet (initial):', profileToSave);

      // Spezifische Logs für die Bildbehandlung
      console.log('Bilddaten vor Verarbeitung:', { image: formData.image ? 'vorhanden' : 'fehlt', imageName: formData.imageName });
      if (formData.imageName && formData.image && typeof formData.image === 'string' && formData.image.startsWith('data:image')) {
        console.log('Bild ist Base64-Data-URL. Wird als Dateiname im Profil gespeichert, Base64 separat.');
        profileToSave.image = formData.imageName;
        // Base64 Bild separat speichern
        try {
          console.log('Versuche Base64 Bild separat zu speichern...');
          localStorage.setItem(`profileImage_${formData.firstName}_${formData.lastName}`, formData.image);
          console.log('Base64 Bild separat im localStorage gespeichert.');
        } catch (localStorageErr) {
          console.error('Fehler beim separaten Speichern des Base64 Bildes:', localStorageErr);
          // Fehler beim Speichern des Bildes sollte das Speichern des Profils nicht blockieren, aber wir loggen es.
        }
      } else if (formData.image && typeof formData.image === 'string' && !formData.image.startsWith('data:image')) {
        console.log('Bild ist bereits ein Dateiname. Wird so im Profil gespeichert.');
        profileToSave.image = formData.image;
      } else {
        console.log('Kein Bild zum Speichern vorhanden oder ungültig.');
        delete profileToSave.image; // Stellen Sie sicher, dass kein ungültiger Wert gespeichert wird.
      }
      delete profileToSave.imageName; // imageName wird nicht im finalen Profil gespeichert.
      console.log('Finales Profilobjekt vor dem Speichern in Liste:', profileToSave);

      existingProfiles.push(profileToSave);
      console.log('Neues Profilobjekt zur Liste hinzugefügt.');
      
      const profilesToSaveString = JSON.stringify(existingProfiles);
      console.log('Stringify der gesamten Profilliste vorbereitet.');
      console.log(`Größe des zu speichernden Strings (ungefähr): ${profilesToSaveString.length} Zeichen.`);

      // Versuche, die gesamte Profilliste zu speichern
      try {
        console.log('Versuche gesamte Profilliste im localStorage zu speichern...');
        localStorage.setItem('userProfiles', profilesToSaveString);
        console.log('Gesamte Profilliste im localStorage gespeichert.');
        
        // Überprüfung direkt nach dem Speichern
        const savedProfilesCheck = JSON.parse(localStorage.getItem('userProfiles'));
        console.log('Profilliste direkt nach dem Speichern aus localStorage gelesen:', savedProfilesCheck);

      } catch (localStorageErr) {
        console.error('Fehler beim Speichern der gesamten Profilliste im localStorage:', localStorageErr);
        toast({
          variant: "destructive",
          title: "Speicherfehler",
          description: "Konnte die Visitenkarte nicht speichern. Möglicherweise ist der Speicherplatz im Browser voll.",
        });
        return; // Beende die Funktion, wenn das Speichern fehlschlägt.
      }

      localStorage.removeItem('draftCardData');
      console.log('Entwurf aus localStorage entfernt.');

      toast({
        title: "Erfolg!",
        description: `Visitenkarte für ${formData.firstName} ${formData.lastName} wurde erstellt.`,
        className: "bg-green-500 text-white",
      });
      console.log('Erfolgs-Toast angezeigt.');

      const cardUrl = `/card/${formData.firstName}_${formData.lastName}`;
      console.log('Weiterleitung zu:', cardUrl);
      navigate(cardUrl);
    } catch (error) {
      console.error('Ein unerwarteter Fehler ist in handleSubmit aufgetreten:', error);
      toast({
        variant: "destructive",
        title: "Unerwarteter Fehler",
        description: "Beim Erstellen der Visitenkarte ist ein unerwarteter Fehler aufgetreten.",
      });
    }
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
          <Label htmlFor="videoLink" className="text-slate-600 font-semibold">YouTube Video Link</Label>
          <Input id="videoLink" name="videoLink" type="url" value={formData.videoLink} onChange={handleChange} placeholder="https://youtube.com/..." className="bg-white border-slate-300 text-slate-700 rounded-xl shadow-sm" />
        </div>
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <Label className="text-base font-semibold text-slate-600 flex items-center mb-2"><Palette className="mr-2 h-5 w-5"/>Kartenfarben</Label>
          <div className="flex gap-4 items-center">
            <div className="flex flex-col items-center">
              <span className="text-xs text-slate-500 mb-1">Primär</span>
              <ColorPickerInput label="" id="primaryColor" value={formData.themeColors.primary} onChange={(e) => handleColorChange('primary', e.target.value)} />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-slate-500 mb-1">Akzent</span>
              <ColorPickerInput label="" id="accentTextColor" value={formData.themeColors.accentText} onChange={(e) => handleColorChange('accentText', e.target.value)} />
            </div>
          </div>
        </div>
        <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-full py-3 text-lg font-semibold shadow-lg mt-2">Weiter</Button>
      </form>
    </motion.div>
  );
};

export default CreateCardPage;