import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Youtube, Briefcase, Info, Phone, Mail, MapPin, Settings, Zap, Calendar, Map, User, X } from 'lucide-react';

const CardPreview = ({ profileData, themeColors, currentUrl }) => {
  const {
    name,
    username,
    role,
    description,
    links,
    videoLink,
    phone,
    email,
    location,
    firstName,
    lastName,
    image
  } = profileData;

  const [showLargeQrCode, setShowLargeQrCode] = useState(false);

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : null;
  };
  const embedUrl = getYouTubeEmbedUrl(videoLink);

  const primaryColor = themeColors?.primary || '#0ea5e9'; // sky-500
  const secondaryColor = themeColors?.secondary || '#2dd4bf'; // teal-400
  const textColor = themeColors?.text || '#334155'; // slate-700
  const accentTextColor = themeColors?.accentText || '#67e8f9'; // cyan-300

  const cardStyle = {
    color: textColor,
  };

  const nameStyle = {
    backgroundImage: `linear-gradient(to right, ${primaryColor}, ${accentTextColor})`,
  };
  
  const roleStyle = {
    color: secondaryColor,
  };

  const linkButtonStyle = {
    borderColor: secondaryColor,
    color: secondaryColor,
  };
  
  const linkButtonHoverStyle = `hover:bg-[${secondaryColor}] hover:bg-opacity-20 hover:text-[${secondaryColor}-200]`;

  const headerStyle = {
    color: primaryColor,
  };

  const iconStyle = {
    color: secondaryColor,
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-0 rounded-t-[40px] rounded-b-2xl w-full max-w-md mx-auto mb-0 overflow-hidden -mt-12"
        style={cardStyle}
      >

        {/* Bildbereich volle Breite oben */}
        <div className="w-full aspect-4/3 bg-slate-200 flex items-center justify-center overflow-hidden rounded-t-[40px]">
           {image && typeof image === 'string' && image.startsWith('data:image') ? (
              <img
                 src={image}
                 alt={`${name || 'Profil'}'s Profilbild`}
                 className="w-full h-full object-cover" />
           ) : image ? (
              <img
               src={`/profile_pics/${image}`}
               alt={`${name || 'Profil'}'s Profilbild`}
               className="w-full h-full object-cover" />
           ) : (
              <div className="w-full h-full bg-slate-300 flex items-center justify-center">
                <UserCircle className="w-24 h-24 text-slate-500" />
             </div>
           )}
        </div>

        {/* Inhalt mit Padding */}
        <div className="p-6 flex flex-col items-center w-full bg-white shadow-xl rounded-b-2xl">

          {/* Name (vergrößert, ohne Icon) */}
          <div className="flex items-center justify-center text-center mb-2 w-full">
             <p className="text-2xl font-bold text-slate-700">
               {firstName && lastName ? `${firstName} ${lastName}` : "Dein Name"}
             </p>
          </div>

          {/* Rolle (direkt unter dem Namen, ohne Icon) */}
          <div className="flex items-center justify-center text-center mb-6 w-full">
             <p className="text-sm font-semibold text-slate-700">{role || "Deine Rolle"}</p>
          </div>

          {/* Neue Container */}
          <div className="w-full space-y-4 mb-6">
               {/* Beschreibung Container */}
               <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                  <Info className="text-green-500 mr-4" size={24} />
                  <div>
                      <p className="font-semibold text-slate-700">Beschreibung</p>
                      <p className="text-sm text-slate-500">{description || "Hier könnte Ihre Beschreibung stehen."}</p>
                  </div>
              </div>

              {/* Telefonnummer Container */}
              {phone && (
                <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                     <Phone className="mr-3 h-5 w-5" style={iconStyle} />
                     <div>
                        <p className="font-semibold text-slate-700">Telefonnummer</p>
                        <p className="text-sm text-slate-500">{phone || "Keine Telefonnummer angegeben."}</p>
                     </div>
                </div>
              )}
              
              {/* E-Mail Container */}
              {email && (
                <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                    <Mail className="text-blue-500 mr-4" size={24} />
                    <div>
                        <p className="font-semibold text-slate-700">E-Mail</p>
                        <p className="text-sm text-slate-500">{email}</p>
                    </div>
                </div>
              )}

               {/* Standort Container */}
              {location && (
                <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                    <MapPin className="text-red-500 mr-4" size={24} />
                    <div>
                        <p className="font-semibold text-slate-700">Standort</p>
                        <p className="text-sm text-slate-500">{location}</p>
                    </div>
                </div>
              )}
          </div>

          {links && links.filter(link => link.label && link.url).length > 0 && (
            <div className="mb-6 w-full">
              <h2 className="text-xl font-semibold mb-3 text-center flex items-center justify-center" style={headerStyle}>
                <LinkIcon className="mr-2 h-5 w-5" />Links
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {links.filter(link => link.label && link.url).map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                    whileHover={{ y: -3 }}
                  >
                    <Button variant="outline" className={`w-full transition-all duration-200 ${linkButtonHoverStyle}`} style={linkButtonStyle}>
                      {link.label}
                    </Button>
                  </motion.a>
                ))}
              </div>
            </div>
          )}

          {embedUrl && (
            <div className="mb-8 w-full">
              <h2 className="text-xl font-semibold mb-3 text-center flex items-center justify-center" style={headerStyle}>
                <Youtube className="mr-2 h-5 w-5 text-red-500" />Video
              </h2>
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg border" style={{borderColor: primaryColor}}>
                <iframe
                  src={embedUrl}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          )}

          {currentUrl && (
            <div className="flex flex-col items-center mb-6 w-full">
              <h2 className="text-xl font-semibold mb-3 text-slate-700">QR-Code</h2>
              <motion.div 
                className="p-3 bg-white rounded-lg shadow-md inline-block border border-slate-700 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowLargeQrCode(true)}
              >
                <QRCode value={currentUrl} size={128} bgColor="#ffffff" fgColor="#0f172a" level="H" />
              </motion.div>
              <p className="text-xs mt-2 text-slate-500">Scannen, um dieses Profil zu teilen</p>
            </div>
          )}

        </div> {/* Ende des Inhalts-Div mit Padding */}

      </motion.div>

      {showLargeQrCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer"
              onClick={() => setShowLargeQrCode(false)}
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center text-slate-700">QR-Code</h2>
            <QRCode value={currentUrl} size={256} bgColor="#ffffff" fgColor="#0f172a" level="H" />
          </div>
        </div>
      )}
    </>
  );
};

export default CardPreview;