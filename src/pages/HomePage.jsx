import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ScanLine, PlusCircle, QrCode, ExternalLink, Eye, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode.react';
import UniverseSphere from '@/components/UniverseSphere';

const HomePage = () => {
  const [recentCards, setRecentCards] = useState([]);

  useEffect(() => {
    const viewedCards = JSON.parse(localStorage.getItem('recentCards')) || [];
    const userProfiles = JSON.parse(localStorage.getItem('userProfiles')) || [];
    
    // Combine based on a unique identifier (username or firstName_lastName)
    const combinedRecentsMap = new Map();

    viewedCards.forEach(card => {
      const key = card.username || `${card.firstName}_${card.lastName}`;
      if (key) combinedRecentsMap.set(key, {...card, type: 'viewed'});
    });

    userProfiles.forEach(profile => {
       const key = profile.username || `${profile.firstName}_${profile.lastName}`;
       if (key && !combinedRecentsMap.has(key)) {
         combinedRecentsMap.set(key, {...profile, type: 'created'});
       } else if (key && combinedRecentsMap.has(key) && combinedRecentsMap.get(key).type === 'viewed'){
         // Wenn ein selbst erstelltes Profil existiert, überschreibe das 'viewed' Element
          combinedRecentsMap.set(key, {...profile, type: 'created'});
       }
    });

    const uniqueRecents = Array.from(combinedRecentsMap.values())
      .slice(0, 5); // Limit to the 5 most recent

    setRecentCards(uniqueRecents);
  }, []);

  // Funktion zum Entfernen einer Karte aus der Liste
  const handleRemoveRecent = (indexToRemove) => {
    setRecentCards(prevCards => {
      const newCards = prevCards.filter((_, index) => index !== indexToRemove);
      // Aktualisiere Local Storage nach dem Entfernen
      // Wir speichern hier die vereinfachten Daten zurück, die wir beim Laden kombinieren
      const cardsToStore = newCards.map(card => ({
        username: card.username || undefined, // Behalte username bei, falls vorhanden
        firstName: card.firstName || undefined,
        lastName: card.lastName || undefined,
        name: card.name || undefined, // Behalte name bei, falls vorhanden
        type: card.type // 'viewed' oder 'created'
      })).filter(card => card.username || (card.firstName && card.lastName)); // Stelle sicher, dass wir gültige Karten speichern

      localStorage.setItem('recentCards', JSON.stringify(cardsToStore));
      return newCards;
    });
  };

  return (
    <div className="w-full">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center justify-center text-center p-8 bg-slate-800/50 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 mb-12"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <ScanLine className="w-24 h-24 text-sky-400 mb-8" />
        </motion.div>
        <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">Willkommen!</h1>
        <p className="text-lg text-slate-300 mb-8 max-w-md">
          Scannen Sie einen QR-Code, geben Sie eine URL wie <code className="bg-slate-700 px-2 py-1 rounded-md text-sky-300">/card/ben</code> ein, oder erstellen Sie Ihre eigene digitale Visitenkarte.
        </p>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button asChild variant="default" className="bg-sky-500 hover:bg-sky-600 text-slate-50 transition-all duration-300">
            <Link to="/create-card"><PlusCircle className="mr-2 h-5 w-5" /> Eigene Karte erstellen</Link>
          </Button>
        </div>
      </motion.div>

      {recentCards.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold text-sky-300 mb-6 text-center">Kürzlich angesehen/erstellt</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {recentCards.map((card, index) => (
              <motion.div
                key={card.username || `${card.firstName}_${card.lastName}`}
                className="bg-slate-800/60 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-slate-700 flex flex-col items-center text-center hover:shadow-sky-500/30 transition-shadow duration-300 relative"
                whileHover={{ y: -5 }}
              >
                {/* Neuer Entfernen-Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Verhindert, dass der Link zur Karte ausgelöst wird
                    handleRemoveRecent(index);
                  }}
                  className="absolute top-2 right-2 text-slate-500 hover:text-red-500 transition"
                  aria-label="Visitenkarte entfernen"
                >
                  <X className="h-4 w-4" />
                </button>
                
                <div className="p-2 bg-white rounded-md mb-3 inline-block border border-slate-600">
                  {/* Annahme: QR-Code generiert URL basierend auf username ODER firstName_lastName */}
                  <QRCode value={`${window.location.origin}/card/${card.username || `${card.firstName}_${card.lastName}`}`} size={80} bgColor="#ffffff" fgColor="#0f172a" level="H" />
                </div>
                {/* Anzeige des Namens, angepasst an neue Struktur */}
                <p className="text-md font-semibold text-sky-400 mb-1 truncate w-full" title={card.name || `${card.firstName} ${card.lastName}`}>{card.name || `${card.firstName} ${card.lastName}`}</p>
                <p className="text-xs text-slate-400 mb-3">
                  {card.type === 'created' ? 'Selbst erstellt' : 'Angesehen'}
                </p>
                {/* Link zur Karte, angepasst an neue Struktur */}
                <Button asChild size="sm" variant="outline" className="w-full border-teal-500 text-teal-300 hover:bg-teal-500/20 hover:text-teal-200">
                  <Link to={`/card/${card.username || `${card.firstName}_${card.lastName}`}`}>
                    <Eye className="mr-2 h-4 w-4" /> Ansehen
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      <UniverseSphere />
    </div>
  );
};

export default HomePage;