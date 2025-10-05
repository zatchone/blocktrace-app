// components/Footer.tsx
import { motion } from 'motion/react';
import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white py-4 mt-auto border-t border-gray-800">
      <div className="flex justify-center gap-10 items-center text-sm">
        {['ABOUT', 'HELP', 'PRIVACY'].map((text, index) => (
          <motion.span
            key={index}
            whileHover={{ color: "#34d399", scale: 1.05 }}
            className="cursor-pointer transition-all duration-200 hover:text-emerald-400"
          >
            {text}
          </motion.span>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
