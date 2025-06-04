import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Home, Loader2, ArrowLeft, X } from 'lucide-react';
import { UserCircle } from 'lucide-react';
import CardPreview from '@/components/CardPreview';
import { getVideo } from '@/lib/indexedDB';

const CardPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isZoomedVideo, setIsZoomedVideo] = useState(false); // Zustand für gezoomtes Video

  useEffect(() => {
    const fetchProfileData = async () => {
      console.log('fetchProfileData gestartet für Benutzer:', username);
      try {
        setLoading(true);
        setError(null);
        console.log('Lade Profile aus localStorage...');

        let foundProfile = null;
        const localProfiles = JSON.parse(localStorage.getItem('userProfiles')) || [];
        console.log('Gefundene Profile im localStorage:', localProfiles);

        // Extrahiere die eindeutige ID aus dem username
        const parts = username ? username.split('_') : ['', '', ''];
        const uniqueId = parts.slice(-2).join('_'); // Nimm die letzten beiden Teile für die ID
        
        console.log('Gesuchter Name und ID:', { uniqueId });

        foundProfile = localProfiles.find(p => p.uniqueId === uniqueId);
        console.log('Gefundenes Profil (aus localStorage):', foundProfile);

        if (!foundProfile) {
           console.warn('Profil NICHT gefunden für:', username);
           setError(`Profil für "${username}" nicht gefunden.`);
        } else {
           console.log('Profil gefunden, lade Medien aus IndexedDB...');
              // Lade Bild-Blob aus IndexedDB
              let imageBlob = null;
              if (foundProfile.imageId) { // Prüfe auf imageId im Profil
                 console.log('Versuche Bild mit ID', foundProfile.imageId, 'aus IndexedDB zu laden...');
                 try {
                    imageBlob = await getVideo(foundProfile.imageId);
                    console.log('Profilbild als Blob aus IndexedDB geladen.', imageBlob);
                 } catch (imageError) {
                    console.error('Fehler beim Laden des Bildes aus IndexedDB:', imageError);
                 }
              } else if (foundProfile.image && typeof foundProfile.image === 'string' && !foundProfile.image.startsWith('profileImage_')) {
                 // Dies deckt alte Profile oder extern verlinkte Bilder ab
                 console.log('Keine imageId gefunden, verwende stattdessen gespeichertes image Feld:', foundProfile.image);
              }

              // Lade Video-Blob aus IndexedDB
              let videoBlob = null;
              if (foundProfile.videoId) { // Prüfe auf videoId im Profil
                console.log('Versuche Video mit ID', foundProfile.videoId, 'aus IndexedDB zu laden...');
                try {
                  videoBlob = await getVideo(foundProfile.videoId); // Lade anhand von videoId
                  console.log('Video als Blob aus IndexedDB geladen.', videoBlob);
                } catch (videoError) {
                  console.error('Fehler beim Laden des Videos aus IndexedDB:', videoError);
                }
              } else if (foundProfile.videoLink && typeof foundProfile.videoLink === 'string' && !foundProfile.videoLink.startsWith('profileVideo_')) {
                 // Dies deckt alte Profile oder extern verlinkte Videos (YouTube etc.) ab
                 console.log('Keine videoId gefunden, verwende stattdessen gespeichertes videoLink Feld:', foundProfile.videoLink);
              }

              // Bestimme die endgültige Bild-URL/Quelle
              let displayImage = null;
              if (imageBlob) {
                  displayImage = URL.createObjectURL(imageBlob);
                  console.log('Verwende temporäre URL für Profilbild:', displayImage);
              } else if (foundProfile.image && typeof foundProfile.image === 'string' && !foundProfile.image.startsWith('profileImage_')) {
                  displayImage = foundProfile.image;
                  console.log('Verwende gespeicherte Bild-URL/Name aus Profil:', displayImage);
              } else {
                  console.log('Kein Profilbild vorhanden.');
              }

              // Bestimme die endgültige Video-URL/Quelle und Autostart-Flag
              let videoSrcUrl = null;
              let autostart = foundProfile.autostart || false; // Standardmäßig false, wenn nicht definiert

              if (videoBlob) {
                 videoSrcUrl = URL.createObjectURL(videoBlob);
                 console.log('Verwende temporäre URL für Video:', videoSrcUrl);
              } else if (foundProfile.videoLink && typeof foundProfile.videoLink === 'string' && !foundProfile.videoLink.startsWith('profileVideo_')) {
                 videoSrcUrl = foundProfile.videoLink;
                 console.log('Verwende gespeicherte Video-URL aus Profil:', videoSrcUrl);
              } else {
                  console.log('Kein Video vorhanden.');
                  videoSrcUrl = null;
                  autostart = false;
              }

              const profileForCardPreview = {
                  ...foundProfile,
                  image: displayImage,
                  videoLink: videoSrcUrl,
                  autostart: autostart,
              };

              setProfile(profileForCardPreview);
              console.log('Profil für CardPreview vorbereitet und Zustand aktualisiert.', profileForCardPreview);

              // Nach dem Laden des Profils und der Medien, Autostart-Video zoomen, wenn aktiviert
              if (videoBlob && profileForCardPreview.autostart) {
                  // Verwenden Sie einen kleinen Timeout, um sicherzustellen, dass das Video-Element im DOM ist
                  setTimeout(() => {
                      setIsZoomedVideo(true);
                  }, 100);
              }

              const recentCards = JSON.parse(localStorage.getItem('recentCards')) || [];
              const existingIndex = recentCards.findIndex(card => card.firstName === foundProfile.firstName && card.lastName === foundProfile.lastName);
              if (existingIndex > -1) {
                recentCards.splice(existingIndex, 1);
              }
              recentCards.unshift({ firstName: foundProfile.firstName, lastName: foundProfile.lastName, name: `${foundProfile.firstName} ${foundProfile.lastName}`, type: 'viewed' });
              localStorage.setItem('recentCards', JSON.stringify(recentCards.slice(0, 10)));
              console.log('Recent Cards aktualisiert');

        }
      } catch (e) {
        console.error("Ein unerwarteter Fehler ist beim Laden der Profildaten aufgetreten:", e);
        setError("Ein Fehler ist beim Laden der Profildaten aufgetreten.");
      } finally {
        console.log('fetchProfileData abgeschlossen.');
        setLoading(false);
      }
    };

    fetchProfileData();
    setCurrentUrl(window.location.href);

    return () => {
      // Cleanup: Revoke Object URLs beim Unmounten oder bei Namensänderung
      // Diese Logik muss außerhalb von fetchProfileData sein, um beim Unmounten zu laufen
      if (profile?.image && typeof profile.image === 'string' && profile.image.startsWith('blob:')) {
          URL.revokeObjectURL(profile.image);
          console.log('Object URL für Profilbild freigegeben.', profile.image);
      }
      if (profile?.videoLink && typeof profile.videoLink === 'string' && profile.videoLink.startsWith('blob:')) {
          URL.revokeObjectURL(profile.videoLink);
          console.log('Object URL für Video freigegeben.', profile.videoLink);
      }
    };

  }, [username]); // Abhängigkeit auf username, um bei Namensänderung neu zu laden

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-slate-300">
        <Loader2 className="w-16 h-16 animate-spin text-sky-500 mb-4" />
        <p className="text-xl">Lade Profil...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div
        className="max-w-md mx-auto my-10 bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 flex flex-col items-center text-center"
        style={{background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)'}}
      >
        <UserCircle className="w-20 h-20 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-700 mb-4">Fehler</h1>
        <p className="text-slate-600 mb-6">{error || "Das Profil konnte nicht gefunden werden."}</p>
        <Button asChild variant="outline" className="border-sky-500 text-sky-500 hover:bg-sky-100 hover:text-sky-700 rounded-xl">
          <Link to="/"><Home className="mr-2 h-4 w-4" /> Zurück zur Startseite</Link>
        </Button>
      </div>
    );
  }
  
  const profileForPreview = {
    ...profile,
    // image und videoLink enthalten jetzt die Object URL oder die externe URL
    // autostart ist auch im profile Objekt
    // Keine Notwendigkeit mehr, hier etwas zu entfernen, da es oben vorbereitet wird.
  };

  const showCardPreview = profile && (profile.image !== undefined || profile.videoLink !== undefined);

  // Funktion zum Beenden des gezoomten Videos
  const exitZoom = () => {
      setIsZoomedVideo(false);
  };

  return (
    <>
      {/* X Button oben rechts (fixed position) */}
      <div className={`fixed top-4 right-4 z-50 ${isZoomedVideo ? 'hidden' : 'block'}`}> {/* Verstecke X-Button im Zoom */} 
        <Button
          variant="ghost"
          className="text-slate-400 hover:text-slate-600"
          onClick={() => navigate('/')}
          aria-label="Zurück zur Startseite"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Overlay für den Zoom-Effekt */}
      {isZoomedVideo && (
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-75 z-40"
              onClick={exitZoom} // Klick auf Overlay beendet Zoom
          ></motion.div>
      )}

      {showCardPreview ? (
        <div className="w-full flex flex-col items-center min-h-screen bg-transparent py-8 px-4 relative max-w-2xl mx-auto">
          {/* Übergebe isZoomedVideo und exitZoom an CardPreview */} 
          <CardPreview 
             profileData={profileForPreview} 
             themeColors={profile.themeColors} 
             currentUrl={currentUrl}
             isZoomedVideo={isZoomedVideo}
             onExitZoom={exitZoom}
          />
        </div>
      ) : (
         <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-slate-300">
            <Loader2 className="w-16 h-16 animate-spin text-sky-500 mb-4" />
            <p className="text-xl">Lade Medien...</p>
         </div>
      )}
    </>
  );
};

export default CardPage;