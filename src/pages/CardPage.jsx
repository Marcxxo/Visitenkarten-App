import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Home, Loader2, ArrowLeft, X } from 'lucide-react';
import { UserCircle } from 'lucide-react';
import CardPreview from '@/components/CardPreview';

const CardPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Suche nach Profil für:', username);

        let foundProfile = null;
        const localProfiles = JSON.parse(localStorage.getItem('userProfiles')) || [];
        console.log('Gefundene Profile im localStorage:', localProfiles);

        const [firstName, lastName] = username ? username.split('_') : ['', ''];
        console.log('Gesuchter Name:', { firstName, lastName });

        foundProfile = localProfiles.find(p => 
          p.firstName === firstName && p.lastName === lastName
        );
        console.log('Gefundenes Profil:', foundProfile);

        if (foundProfile) {
          setProfile(foundProfile);
          const recentCards = JSON.parse(localStorage.getItem('recentCards')) || [];
          const existingIndex = recentCards.findIndex(card => card.firstName === foundProfile.firstName && card.lastName === foundProfile.lastName);
          if (existingIndex > -1) {
            recentCards.splice(existingIndex, 1);
          }
          recentCards.unshift({ firstName: foundProfile.firstName, lastName: foundProfile.lastName, name: `${foundProfile.firstName} ${foundProfile.lastName}`, type: 'viewed' });
          localStorage.setItem('recentCards', JSON.stringify(recentCards.slice(0, 10)));
          console.log('Recent Cards aktualisiert');
        } else {
          console.log('Kein Profil gefunden');
          setError(`Profil für "${username}" nicht gefunden.`);
        }
      } catch (e) {
        console.error("Fehler beim Laden der Profildaten:", e);
        setError("Fehler beim Laden der Profildaten. Bitte versuchen Sie es später erneut.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
    setCurrentUrl(window.location.href);
  }, [username]);

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
  
  let displayImage = profile.image; 
  const storedImage = localStorage.getItem(`profileImage_${profile.firstName}_${profile.lastName}`);
  if (storedImage && storedImage.startsWith('data:image')) {
    displayImage = storedImage;
  } else if (profile.image && !profile.image.startsWith('data:image')) {
    displayImage = profile.image;
  } else {
    displayImage = null;
  }

  const profileForPreview = {
    ...profile,
    image: displayImage,
  };

  return (
    <>
      {/* X Button oben rechts (fixed position) */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          className="text-slate-400 hover:text-slate-600"
          onClick={() => navigate('/')}
          aria-label="Zurück zur Startseite"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="w-full flex flex-col items-center min-h-screen bg-transparent py-8 px-4 relative max-w-2xl mx-auto">
        <CardPreview profileData={profileForPreview} themeColors={profile.themeColors} currentUrl={currentUrl} />
      </div>
    </>
  );
};

export default CardPage;