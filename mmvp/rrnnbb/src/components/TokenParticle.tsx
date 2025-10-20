import { motion } from "framer-motion";

interface TokenParticleProps {
  path: string;     // SVG path string
  delay?: number;
  color?: string;
  duration?: number;
  size?: number;
}

export const TokenParticle: React.FC<TokenParticleProps> = ({
  path,
  delay = 0,
  color = "#ffb703",
  duration = 6,
  size = 6,
}) => {
  const pathLength = 1;
  return (
    <motion.circle
      r={size}
      fill={color}
      initial={{ pathLength: 0 }}
      animate={{ pathLength }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    >
      <animateMotion dur={`${duration}s`} repeatCount="indefinite" path={path} rotate="auto" begin={`${delay}s`} />
    </motion.circle>
  );
};
