import React from 'react';
    import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
    import { Toaster } from '@/components/ui/toaster';
    import HomePage from '@/pages/HomePage';
    import CardPage from '@/pages/CardPage';
    import CreateCardPage from '@/pages/CreateCardPage';
    import { motion, AnimatePresence } from 'framer-motion';
    import { ScanLine, Instagram, Youtube, Twitter, Globe, Euro } from 'lucide-react';

    function App() {
      return (
        <Router>
          <AppContent />
        </Router>
      );
    }

    function AppContent() {
      const location = useLocation();
      return (
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow flex flex-col items-center p-4 overflow-x-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-slate-50">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<AnimatedPage><HomePage /></AnimatedPage>} />
                <Route path="/card/:username" element={<AnimatedPage><CardPage /></AnimatedPage>} />
                <Route path="/create-card" element={<AnimatedPageWide><CreateCardPage /></AnimatedPageWide>} />
              </Routes>
            </AnimatePresence>
            <Toaster />
          </div>
          {/* Footer Section */}
          <footer className="w-full py-8 bg-gradient-to-br from-slate-900 to-slate-800 text-slate-400">
            <div className="w-full">
              <hr className="border-slate-700 mb-8" />
              <div className="flex flex-col md:flex-row items-center justify-between">
                {/* Logo and Copyright */}
                <div className="flex-1">
                  <p className="text-sm text-slate-400 pl-4">Copyright 2025©</p>
                </div>
                <div className="flex items-center mb-4 md:mb-0">
                  <ScanLine className="w-6 h-6 text-sky-400 mr-2" />
                  <p className="text-sm">&copy; VisiQ GmbH</p>
                </div>
                <div className="flex-1 flex justify-end">
                  {/* Social Links and other info */}
                  <div className="flex items-center space-x-6">
                    {/* Social Icons - Placeholders */}
                    <div className="flex space-x-4 items-center">
                      <span className="text-sm">Terms of service</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-sm">Privacy Policy</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-sm">Cookies</span>
                      <span className="text-slate-600">|</span>
                      <Instagram className="w-5 h-5 text-slate-400 hover:text-sky-400 transition-colors" />
                      <Youtube className="w-5 h-5 text-slate-400 hover:text-sky-400 transition-colors" />
                      <Twitter className="w-5 h-5 text-slate-400 hover:text-sky-400 transition-colors" />
                    </div>

                    {/* Language, Currency, Accessibility */}
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <span>Germany</span>
                      </div>
                      <div className="pr-4">
                        <Euro className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      );
    }
    
    const AnimatedPage = ({ children }) => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        {children}
      </motion.div>
    );

    const AnimatedPageWide = ({ children }) => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-6xl" 
      >
        {children}
      </motion.div>
    );

    export default App;