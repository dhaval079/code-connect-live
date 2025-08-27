import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PremiumOAuthButtonsProps {
  onOAuthSignIn?: (provider: string) => void;
  disabled?: boolean;
}

const PremiumOAuthButtons: React.FC<PremiumOAuthButtonsProps> = ({ onOAuthSignIn, disabled = false }) => {
  const [loadingStates, setLoadingStates] = useState({
    google: false,
    linkedin: false
  });

  const [successStates, setSuccessStates] = useState({
    google: false,
    linkedin: false
  });

  const [errorStates, setErrorStates] = useState({
    google: false,
    linkedin: false
  });

  const handleOAuthSignIn = async (provider: string) => {
    const providerKey = provider === "oauth_google" ? "google" : "linkedin";

    // Reset any previous states
    setSuccessStates(prev => ({ ...prev, [providerKey]: false }));
    setErrorStates(prev => ({ ...prev, [providerKey]: false }));

    // Set loading state
    setLoadingStates(prev => ({ ...prev, [providerKey]: true }));

    try {
      console.log(`Starting OAuth flow for ${provider}`);

      // Simulate OAuth process with variable timing
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      // Simulate random success/failure for demo
      if (Math.random() > 0.3) {
        // Success
        setSuccessStates(prev => ({ ...prev, [providerKey]: true }));
        setTimeout(() => {
          setSuccessStates(prev => ({ ...prev, [providerKey]: false }));
        }, 3000);
      } else {
        // Error
        throw new Error('OAuth failed');
      }

    } catch (error) {
      console.error(`OAuth failed for ${provider}:`, error);
      setErrorStates(prev => ({ ...prev, [providerKey]: true }));
      setTimeout(() => {
        setErrorStates(prev => ({ ...prev, [providerKey]: false }));
      }, 4000);
    } finally {
      setLoadingStates(prev => ({ ...prev, [providerKey]: false }));
    }
  };

  const isAnyLoading = loadingStates.google || loadingStates.linkedin;

  const LoadingSpinner = ({ size = "w-5 h-5" }) => (
    <motion.div
      className={`${size} relative`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
    >
      <motion.div
        className="absolute inset-0 border-2 border-white/20 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 border-2 border-transparent border-t-white rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );

  const SuccessIcon = ({ size = "w-5 h-5" }) => (
    <motion.div
      className={`${size} relative`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
    >
      <motion.svg
        viewBox="0 0 24 24"
        className="w-full h-full text-green-400"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <motion.path
          d="M9 12l2 2 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </motion.svg>
    </motion.div>
  );

  const ErrorIcon = ({ size = "w-5 h-5" }) => (
    <motion.div
      className={`${size} relative`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
    >
      <motion.svg
        viewBox="0 0 24 24"
        className="w-full h-full text-red-400"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
        <motion.path
          d="M15 9l-6 6M9 9l6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeInOut" }}
        />
      </motion.svg>
    </motion.div>
  );

  const GoogleIcon = ({ size = "w-5 h-5" }) => (
    <motion.div
      className={`${size} relative`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    </motion.div>
  );

  const LinkedInIcon = ({ size = "w-5 h-5" }) => (
    <motion.div
      className={`${size} relative`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path
          fill="#0077B5"
          d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
        />
      </svg>
    </motion.div>
  );

  const getButtonState = (provider: string) => {
    const key = provider === "oauth_google" ? "google" : "linkedin";
    if (successStates[key]) return 'success';
    if (errorStates[key]) return 'error';
    if (loadingStates[key]) return 'loading';
    return 'default';
  };

  const getButtonContent = (provider: string, providerName: string) => {
    const state = getButtonState(provider);
    const key = provider === "oauth_google" ? "google" : "linkedin";

    switch (state) {
      case 'loading':
        return {
          icon: <LoadingSpinner />,
          text: "Connecting...",
          textColor: "text-white"
        };
      case 'success':
        return {
          icon: <SuccessIcon />,
          text: "Connected!",
          textColor: "text-green-100"
        };
      case 'error':
        return {
          icon: <ErrorIcon />,
          text: "Try again",
          textColor: "text-red-100"
        };
      default:
        return {
          icon: provider === "oauth_google" ? <GoogleIcon /> : <LinkedInIcon />,
          text: providerName,
          textColor: "text-white"
        };
    }
  };

  const getButtonStyles = (provider: string) => {
    const state = getButtonState(provider);
    const key = provider === "oauth_google" ? "google" : "linkedin";

    const baseStyles = "relative overflow-hidden flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-500 backdrop-blur-lg font-medium tracking-wide";

    switch (state) {
      case 'loading':
        return `${baseStyles} bg-gradient-to-r from-blue-600/90 to-indigo-600/90 border-blue-400/50 shadow-lg shadow-blue-500/25 cursor-wait`;
      case 'success':
        return `${baseStyles} bg-gradient-to-r from-green-600/90 to-emerald-600/90 border-green-400/50 shadow-lg shadow-green-500/25 cursor-default`;
      case 'error':
        return `${baseStyles} bg-gradient-to-r from-red-600/90 to-rose-600/90 border-red-400/50 shadow-lg shadow-red-500/25 cursor-pointer hover:from-red-500/90 hover:to-rose-500/90`;
      default:
        if (isAnyLoading && !loadingStates[key]) {
          return `${baseStyles} bg-slate-800/40 border-slate-600/30 text-slate-400 cursor-not-allowed shadow-inner`;
        }
        return `${baseStyles} bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-slate-600/50 hover:from-slate-700/90 hover:to-slate-600/90 shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30 hover:border-slate-500/70`;
    }
  };

  const getHoverAnimation = (provider: string) => {
    const state = getButtonState(provider);
    const key = provider === "oauth_google" ? "google" : "linkedin";

    if (state === 'loading' || state === 'success' || (isAnyLoading && !loadingStates[key])) {
      return {};
    }

    return {
      scale: 1.03,
      y: -2,
      transition: { type: "spring" as const, stiffness: 400, damping: 25 }
    };
  };

  const getTapAnimation = (provider: string) => {
    const state = getButtonState(provider);
    const key = provider === "oauth_google" ? "google" : "linkedin";

    if (state === 'loading' || state === 'success' || (isAnyLoading && !loadingStates[key])) {
      return {};
    }

    return {
      scale: 0.97,
      y: 0,
      transition: { type: "spring" as const, stiffness: 600, damping: 30 }
    };
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Floating background elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/2 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {/* Google Button */}
        <motion.button
          type="button"
          onClick={() => handleOAuthSignIn("oauth_google")}
          disabled={isAnyLoading && !loadingStates.google}
          className={getButtonStyles("oauth_google")}
          whileHover={getHoverAnimation("oauth_google")}
          whileTap={getTapAnimation("oauth_google")}
          layout
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-2xl"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={getButtonState("oauth_google")}
              className="flex items-center justify-center gap-3 relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {getButtonContent("oauth_google", "Google").icon}
              <span className={`font-semibold text-sm ${getButtonContent("oauth_google", "Google").textColor}`}>
                {getButtonContent("oauth_google", "Google").text}
              </span>
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* LinkedIn Button */}
        <motion.button
          type="button"
          onClick={() => handleOAuthSignIn("oauth_linkedin_oidc")}
          disabled={isAnyLoading && !loadingStates.linkedin}
          className={getButtonStyles("oauth_linkedin_oidc")}
          whileHover={getHoverAnimation("oauth_linkedin_oidc")}
          whileTap={getTapAnimation("oauth_linkedin_oidc")}
          layout
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-2xl"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={getButtonState("oauth_linkedin_oidc")}
              className="flex items-center justify-center gap-3 relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {getButtonContent("oauth_linkedin_oidc", "LinkedIn").icon}
              <span className={`font-semibold text-sm ${getButtonContent("oauth_linkedin_oidc", "LinkedIn").textColor}`}>
                {getButtonContent("oauth_linkedin_oidc", "LinkedIn").text}
              </span>
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Status indicator */}
      <AnimatePresence>
        {(successStates.google || successStates.linkedin) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center"
          >
            <span className="text-green-300 text-sm font-medium">
              ✨ Successfully connected! Redirecting...
            </span>
          </motion.div>
        )}

        {(errorStates.google || errorStates.linkedin) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center"
          >
            <span className="text-red-300 text-sm font-medium">
              ⚠️ Connection failed. Please try again.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PremiumOAuthButtons;