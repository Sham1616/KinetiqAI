import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ width, height, borderRadius = '10px', style }) => {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut', repeatType: 'reverse' }}
      style={{
        width,
        height,
        borderRadius,
        background: 'var(--border)',
        ...style
      }}
    />
  );
};

export default Skeleton;
