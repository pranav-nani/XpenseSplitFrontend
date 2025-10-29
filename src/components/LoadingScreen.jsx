// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const LoadingScreen = () => {
  return (
    <div className="loading-overlay">
      <motion.div
        className="loading-spinner-login"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.p
        className="loading-text"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror" }}>
        Warming up the server... please wait ⏳
      </motion.p>
    </div>
  );
};

export default LoadingScreen;
