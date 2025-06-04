import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ScanLine, PlusCircle, QrCode, ExternalLink, Eye, X, Settings, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode.react';

const HomePage = () => {
  const [recentCards, setRecentCards] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const viewedCards = JSON.parse(localStorage.getItem('recentCards')) || [];
    const userProfiles = JSON.parse(localStorage.getItem('userProfiles')) || [];
    const removedCards = JSON.parse(localStorage.getItem('removedCards')) || [];
    
    // Combine based on a unique identifier (username or firstName_lastName)
    const combinedRecentsMap = new Map();

    viewedCards.forEach(card => {
      const key = card.username || `${card.firstName}_${card.lastName}_${card.uniqueId}`;
      if (key && !removedCards.includes(key)) {
        combinedRecentsMap.set(key, {...card, type: 'viewed'});
      }
    });

    userProfiles.forEach(profile => {
       const key = profile.username || `${profile.firstName}_${profile.lastName}_${profile.uniqueId}`;
       if (key && !removedCards.includes(key)) {
         if (!combinedRecentsMap.has(key)) {
           combinedRecentsMap.set(key, {...profile, type: 'created'});
         } else if (combinedRecentsMap.has(key) && combinedRecentsMap.get(key).type === 'viewed'){
           combinedRecentsMap.set(key, {...profile, type: 'created'});
         }
       }
    });

    const uniqueRecents = Array.from(combinedRecentsMap.values())
      .slice(0, 5); // Limit to the 5 most recent

    setRecentCards(uniqueRecents);
  }, []);

  // Funktion zum Entfernen einer Karte aus der Liste
  const handleRemoveRecent = (indexToRemove) => {
    setRecentCards(prevCards => {
      const cardToRemove = prevCards[indexToRemove];
      const cardKey = cardToRemove.username || `${cardToRemove.firstName}_${cardToRemove.lastName}_${cardToRemove.uniqueId}`;
      
      // Füge die entfernte Karte zur Liste der entfernten Karten hinzu
      const removedCards = JSON.parse(localStorage.getItem('removedCards')) || [];
      if (!removedCards.includes(cardKey)) {
        removedCards.push(cardKey);
        localStorage.setItem('removedCards', JSON.stringify(removedCards));
      }

      // Entferne die Karte aus der aktuellen Ansicht
      const newCards = prevCards.filter((_, index) => index !== indexToRemove);
      return newCards;
    });
  };

  // Funktion zum Bearbeiten einer Karte
  const handleEditCard = (cardToEdit) => {
    localStorage.setItem('editCardData', JSON.stringify(cardToEdit));
    navigate('/create-card'); // Navigiere zur Erstellungsseite
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
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-6 text-slate-200">Kürzlich erstellte Karten</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {card.image ? (
                      <img src={card.image} alt={`${card.firstName} ${card.lastName}`} className="w-12 h-12 rounded-full object-cover border-2 border-sky-400" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center border-2 border-sky-400">
                        <User className="w-6 h-6 text-sky-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200">{card.firstName} {card.lastName}</h3>
                      {card.role && <p className="text-sm text-slate-400">{card.role}</p>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRecent(index)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex flex-col w-full gap-3">
                  {/* Link zur Karte mit eindeutiger ID */}
                  <Button asChild variant="default" className="w-full bg-sky-500 hover:bg-sky-600 text-slate-50 transition-all duration-300 flex items-center justify-center">
                    <Link to={`/card/${(card.firstName + '_' + card.lastName + '_' + card.uniqueId).toLowerCase().replace(/\s+/g, '_')}`} className="w-full flex items-center justify-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>Ansehen</span>
                    </Link>
                  </Button>

                  {/* Bearbeiten Button (nur für selbst erstellte Karten) */}
                  {card.type === 'created' && (
                     <Button 
                        variant="outline"
                        className="w-full border-sky-500 text-sky-500 hover:bg-sky-100 hover:text-sky-700 rounded-md flex items-center justify-center gap-2"
                        onClick={() => handleEditCard(card)}
                     >
                        <Settings className="h-4 w-4" />
                        <span>Bearbeiten</span>
                     </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HomePage;