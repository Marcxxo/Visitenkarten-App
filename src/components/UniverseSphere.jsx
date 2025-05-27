import React, { useState, useEffect, useRef } from 'react';
    import { motion, useMotionValue, useTransform } from 'framer-motion';

    const starNames = [
      "Sol", "Sirius", "Canopus", "Arcturus", "Vega", "Rigel", "Procyon", "Betelgeuse", 
      "Altair", "Aldebaran", "Spica", "Antares", "Pollux", "Fomalhaut", "Deneb", 
      "Alpha Centauri", "Barnard's Star", "Wolf 359", "Lalande 21185", "Epsilon Eridani",
      "Tau Ceti", "Kepler-186f", "Gliese 581g", "HD 10180", "TRAPPIST-1"
    ];

    const UniverseSphere = () => {
      const [stars, setStars] = useState([]);
      const containerRef = useRef(null);
      const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
      const [hoveredStar, setHoveredStar] = useState(null);

      const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
      const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);

      useEffect(() => {
        const handleMouseMove = (e) => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            mouseX.set(e.clientX - rect.left);
            mouseY.set(e.clientY - rect.top);
          }
        };
        
        const currentRef = containerRef.current;
        if (currentRef) {
            currentRef.addEventListener('mousemove', handleMouseMove);
        }
        
        return () => {
          if (currentRef) {
            currentRef.removeEventListener('mousemove', handleMouseMove);
          }
        };
      }, [mouseX, mouseY]);


      useEffect(() => {
        const updateSize = () => {
          if (containerRef.current) {
            setContainerSize({
              width: containerRef.current.offsetWidth,
              height: containerRef.current.offsetHeight,
            });
          }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
      }, []);

      useEffect(() => {
        if (containerSize.width === 0 || containerSize.height === 0) return;

        const numStars = 70;
        const newStars = [];
        const sphereRadius = Math.min(containerSize.width, containerSize.height) * 0.4;

        for (let i = 0; i < numStars; i++) {
          const phi = Math.acos(-1 + (2 * i) / numStars);
          const theta = Math.sqrt(numStars * Math.PI) * phi;

          const x = sphereRadius * Math.sin(phi) * Math.cos(theta);
          const y = sphereRadius * Math.sin(phi) * Math.sin(theta);
          const z = sphereRadius * Math.cos(phi); 

          newStars.push({
            id: i,
            x3d: x,
            y3d: y,
            z3d: z,
            name: starNames[i % starNames.length],
            baseSize: 1 + Math.random() * 2.5,
            color: `hsl(${Math.random() * 60 + 180}, 100%, ${70 + Math.random() * 20}%)`, // Blues, Cyans, Purples
          });
        }
        setStars(newStars);
      }, [containerSize]);
      
      const perspective = 500;

      return (
        <div 
          ref={containerRef} 
          className="relative w-full h-[500px] bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-xl shadow-2xl overflow-hidden border border-slate-700 my-12 cursor-grab active:cursor-grabbing flex items-center justify-center"
          style={{ perspective: `${perspective}px` }}
        >
          <motion.div 
            className="relative w-full h-full"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {stars.map((star) => {
              const f = perspective / (perspective + star.z3d);
              const x2d = star.x3d * f + containerSize.width / 2;
              const y2d = star.y3d * f + containerSize.height / 2;
              const size = star.baseSize * f * (hoveredStar === star.id ? 2.5 : 1);
              const opacity = (star.z3d + containerSize.width * 0.4) / (containerSize.width * 0.8) * 0.8 + 0.2;

              return (
                <motion.div
                  key={star.id}
                  className="absolute rounded-full"
                  style={{
                    width: size,
                    height: size,
                    left: x2d - size / 2,
                    top: y2d - size / 2,
                    backgroundColor: star.color,
                    opacity: opacity,
                    boxShadow: `0 0 ${size * 1.5}px ${size * 0.5}px ${star.color}`,
                    zIndex: Math.floor(f * 100),
                    transition: 'width 0.2s, height 0.2s, box-shadow 0.2s',
                  }}
                  onHoverStart={() => setHoveredStar(star.id)}
                  onHoverEnd={() => setHoveredStar(null)}
                >
                  {hoveredStar === star.id && (
                    <motion.span
                      initial={{ opacity: 0, y: -10, scale: 0.8 }}
                      animate={{ opacity: 1, y: -size*1.2 - 10, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute whitespace-nowrap text-xs font-medium"
                      style={{
                        color: star.color,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        textShadow: `0 0 5px rgba(0,0,0,0.7)`,
                      }}
                    >
                      {star.name}
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
          <p className="absolute bottom-5 right-5 text-slate-400 text-sm italic z-10 bg-slate-900/50 px-2 py-1 rounded">
            Explore the cosmos by hovering over stars.
          </p>
        </div>
      );
    };

    export default UniverseSphere;