import React from 'react';
    import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
    import { Toaster } from '@/components/ui/toaster';
    import HomePage from '@/pages/HomePage';
    import CardPage from '@/pages/CardPage';
    import CreateCardPage from '@/pages/CreateCardPage';
    import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-50 flex flex-col items-center p-4 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<AnimatedPage><HomePage /></AnimatedPage>} />
              <Route path="/card/:username" element={<AnimatedPage><CardPage /></AnimatedPage>} />
              <Route path="/create-card" element={<AnimatedPageWide><CreateCardPage /></AnimatedPageWide>} />
            </Routes>
          </AnimatePresence>
          <Toaster />
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