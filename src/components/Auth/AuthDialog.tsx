import { useSignIn, useSignUp } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import AdvancedCursor from "../Dashboard/Cursor";
import { Code, Mail, Loader2, ArrowRight, Globe, Check } from 'lucide-react';
import { GlowingButton } from "../Dashboard/buttons/GlowingButton";
import { FuturisticInput } from "../Dashboard/buttons/FuturisticInput";
import { toast } from "sonner";
import OTPInput from "../Dashboard/buttons/OTPInput";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = "sign-in" | "sign-up" | "verify-otp";

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [view, setView] = useState<AuthView>("sign-in");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();

  // Reset form when view changes
  useEffect(() => {
    setOtpCode("");
  }, [view]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Memoized form submission handler
  const handleEmailSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignInLoaded || !isSignUpLoaded) return;
    
    setIsLoading(true);
    
    try {
      if (view === "sign-in") {
        const result = await signIn.create({
          strategy: "email_code",
          identifier: email,
        });
        setVerificationToken(result.createdSessionId || "");
        setView("verify-otp");
        toast.success("Verification code sent to your email", {
          icon: <Check className="h-4 w-4 text-green-500" />,
        });
      } else {
        const result = await signUp.create({
          emailAddress: email,
          username,
        });
        setVerificationToken(result.createdSessionId || "");
        setView("verify-otp");
        toast.success("Verification code sent to your email", {
          icon: <Check className="h-4 w-4 text-green-500" />,
        });
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.errors?.[0]?.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [email, username, view, isSignInLoaded, isSignUpLoaded, signIn, signUp]);

  // OTP verification handler
  const handleOTPVerification = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    
    setIsLoading(true);
    
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: otpCode,
      });

      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        toast.success("Successfully signed in!", {
          icon: <Check className="h-4 w-4 text-green-500" />,
        });
        onClose();
        window.location.href = "/";
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [otpCode, signIn, setSignInActive, onClose]);

  // OAuth sign-in handler
  const handleOAuthSignIn = useCallback(async (provider: "oauth_google" | "oauth_linkedin_oidc") => {
    if (!isSignInLoaded || !isSignUpLoaded) {
      toast.error("Authentication not ready. Please try again.");
      return;
    }
  
    try {
      setIsLoading(true);
      const baseUrl = window.location.origin;
  
      const providerConfig: Record<"oauth_google" | "oauth_linkedin_oidc", {
        strategy: "oauth_google" | "oauth_linkedin_oidc";
        redirectUrl: string;
        redirectUrlComplete: string;
        additionalScopes?: string[];
      }> = {
        oauth_google: {
          strategy: "oauth_google",
          redirectUrl: `${baseUrl}/sso-callback`,
          redirectUrlComplete: baseUrl,
        },
        oauth_linkedin_oidc: {
          strategy: "oauth_linkedin_oidc",
          redirectUrl: `${baseUrl}/sso-callback`,
          redirectUrlComplete: baseUrl,
          additionalScopes: [
            "openid",
            "profile",
            "email",
            "w_member_social"
          ]
        }
      };
  
      const config = providerConfig[provider];
  
      if (view === "sign-in") {
        await signIn?.authenticateWithRedirect({
          ...config,
        });
      } else {
        await signUp?.authenticateWithRedirect({
          ...config,
        });
      }
    } catch (error: any) {
      console.error("OAuth error:", error);
      toast.error("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [view, isSignInLoaded, isSignUpLoaded, signIn, signUp]);

  // Get title and subtitle based on current view
  const getViewContent = () => {
    switch (view) {
      case "sign-in":
        return {
          title: "Welcome Back",
          subtitle: "Sign in to continue your coding journey",
          buttonText: "Send Verification Code"
        };
      case "sign-up":
        return {
          title: "Join CodeConnect",
          subtitle: "Create an account to start collaborating",
          buttonText: "Create Account"
        };
      case "verify-otp":
        return {
          title: "Verify Your Email",
          subtitle: "Enter the code we sent to your email",
          buttonText: "Verify Code"
        };
    }
  };

  const { title, subtitle, buttonText } = getViewContent();

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0, y: 20 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        duration: 0.6, 
        bounce: 0.25,
        delayChildren: 0.1,
        staggerChildren: 0.1
      } 
    },
    exit: { 
      scale: 0.95, 
      opacity: 0, 
      y: 20, 
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { y: -20, opacity: 0, transition: { duration: 0.3 } }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop with enhanced blur */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            onClick={onClose}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
            <motion.div
              className="relative w-full max-w-md h-auto max-h-[90vh] bg-gray-900/95 rounded-2xl shadow-2xl overflow-hidden border border-gray-800"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"
                  animate={{
                    background: [
                      "linear-gradient(to right bottom, rgba(59,130,246,0.1), rgba(147,51,234,0.1), rgba(236,72,153,0.1))",
                      "linear-gradient(to right bottom, rgba(236,72,153,0.1), rgba(59,130,246,0.1), rgba(147,51,234,0.1))",
                    ],
                  }}
                  transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                  style={{ filter: "blur(100px)" }}
                />
                
                {/* Animated particles */}
                <div className="absolute inset-0">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-white/30"
                      initial={{ 
                        x: Math.random() * 100 + "%", 
                        y: Math.random() * 100 + "%", 
                        opacity: Math.random() * 0.5 + 0.3 
                      }}
                      animate={{ 
                        x: [
                          Math.random() * 100 + "%", 
                          Math.random() * 100 + "%", 
                          Math.random() * 100 + "%"
                        ],
                        y: [
                          Math.random() * 100 + "%", 
                          Math.random() * 100 + "%", 
                          Math.random() * 100 + "%"
                        ],
                        opacity: [0.3, 0.7, 0.3]
                      }}
                      transition={{ 
                        duration: 10 + Math.random() * 20, 
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="relative flex flex-col items-center justify-between h-full py-8 px-6">
                <div className="w-full max-w-sm flex flex-col items-center">
                  {/* Logo and Title */}
                  <motion.div
                    className="flex flex-col items-center mb-8"
                    variants={itemVariants}
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="relative"
                    >
                      <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-lg transform scale-125" />
                      <div className="relative bg-gray-900/80 rounded-full p-3 border border-gray-700">
                        <Code className="w-8 h-8 text-blue-400" />
                      </div>
                    </motion.div>
                    
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={view}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-center mt-6"
                      >
                        <h1 className={cn(
                          "text-2xl font-bold bg-clip-text text-transparent transition-all duration-500",
                          view === "sign-in" 
                            ? "bg-gradient-to-r from-cyan-400 to-blue-500" 
                            : view === "sign-up"
                              ? "bg-gradient-to-r from-purple-400 to-pink-500"
                              : "bg-gradient-to-r from-emerald-400 to-emerald-500"
                        )}>
                          {title}
                        </h1>
                        <p className="mt-2 text-gray-300 text-sm">
                          {subtitle}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>

                  {/* Form */}
                  <AnimatePresence mode="wait">
                    <motion.form
                      key={view}
                      onSubmit={view === "verify-otp" ? handleOTPVerification : handleEmailSubmit}
                      className="w-full space-y-5"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {view === "verify-otp" ? (
                        <motion.div
                          variants={itemVariants}
                          className="space-y-4"
                        >
                          <OTPInput
                            value={otpCode}
                            onChange={(event) => setOtpCode(event.target.value)}
                          />
                          <p className="text-xs text-center text-gray-400">
                            Didn't receive a code?{" "}
                            <button
                              type="button"
                              onClick={() => setView("sign-in")}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              Try again
                            </button>
                          </p>
                        </motion.div>
                      ) : (
                        <>
                          {view === "sign-up" && (
                            <motion.div variants={itemVariants}>
                              <FuturisticInput
                                label="Username"
                                id="username"
                                icon={Globe}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Choose a username"
                                required
                                autoFocus
                              />
                            </motion.div>
                          )}

                          <motion.div variants={itemVariants}>
                            <FuturisticInput
                              label="Email"
                              id="email"
                              icon={Mail}
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Enter your email"
                              required
                              autoFocus={view === "sign-in"}
                            />
                          </motion.div>
                        </>
                      )}

                      <motion.div 
                        variants={itemVariants}
                        className="space-y-4 pt-2"
                      >
                        <GlowingButton
                          className="w-full"
                          disabled={isLoading || !isSignInLoaded || !isSignUpLoaded}
                          type="submit"
                          color={view === "verify-otp" ? "green" : view === "sign-up" ? "purple" : "blue"}
                        >
                          <AnimatePresence mode="wait">
                            {isLoading ? (
                              <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center"
                              >
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                {view === "verify-otp" ? "Verifying..." :
                                  view === "sign-in" ? "Sending..." : "Creating..."}
                              </motion.div>
                            ) : (
                              <motion.div
                                key="default"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center"
                              >
                                {buttonText}
                                <ArrowRight className="ml-2 w-5 h-5" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </GlowingButton>

                        {view !== "verify-otp" && (
                          <>
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700/50" />
                              </div>
                              <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-gray-900/80 text-gray-400">
                                  Or continue with
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <motion.button
                                type="button"
                                onClick={() => handleOAuthSignIn("oauth_google")}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800/80 hover:bg-gray-700/90 text-white rounded-lg border border-gray-700/50 transition-all duration-200"
                                whileHover={{ scale: 1.02, backgroundColor: "rgba(55, 65, 81, 0.9)" }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Image width={18} height={18} src="/google.svg" alt="Google" className="w-[18px] h-[18px]" />
                                <span className="text-sm">Google</span>
                              </motion.button>

                              <motion.button
                                type="button"
                                onClick={() => handleOAuthSignIn("oauth_linkedin_oidc")}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800/80 hover:bg-gray-700/90 text-white rounded-lg border border-gray-700/50 transition-all duration-200"
                                whileHover={{ scale: 1.02, backgroundColor: "rgba(55, 65, 81, 0.9)" }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Image width={18} height={18} src="/linkedin.svg" alt="LinkedIn" className="w-[18px] h-[18px]" />
                                <span className="text-sm">LinkedIn</span>
                              </motion.button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    </motion.form>
                  </AnimatePresence>
                </div>

                {/* Footer */}
                {view !== "verify-otp" && (
                  <motion.div
                    className="w-full mt-8 pt-4 border-t border-gray-800/50 text-center"
                    variants={itemVariants}
                  >
                    <p className="text-gray-300 text-sm">
                      {view === "sign-in" ? (
                        <>
                          Don't have an account?{" "}
                          <button
                            type="button"
                            onClick={() => setView("sign-up")}
                            className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                          >
                            Sign up
                          </button>
                        </>
                      ) : (
                        <>
                          Already have an account?{" "}
                          <button
                            type="button"
                            onClick={() => setView("sign-in")}
                            className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                          >
                            Sign in
                          </button>
                        </>
                      )}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;


// "use client"

// import { useState, useEffect, useRef, useCallback } from "react"
// import { useSignIn, useSignUp } from "@clerk/nextjs"
// import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion"
// import Image from "next/image"
// import { Code, Mail, Loader2, ArrowRight, Check, X, Github, Eye, EyeOff, Twitter, Linkedin, RefreshCw, User, Lock, Sparkles, Zap, Lightbulb, Layers } from 'lucide-react'
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Button } from "@/components/ui/button"
// import { toast } from "sonner"
// import { cn } from "@/lib/utils"

// // Type definitions
// type AuthView = "sign-in" | "sign-up" | "verify-otp"
// type ThemeColor = "purple" | "blue" | "teal" | "fuchsia" | "cyan"

// // 3D Card component with enhanced effects
// const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
//   const cardRef = useRef<HTMLDivElement>(null)
//   const mouseX = useSpring(0, { stiffness: 150, damping: 20 })
//   const mouseY = useSpring(0, { stiffness: 150, damping: 20 })
//   const [isHovering, setIsHovering] = useState(false)
  
//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!cardRef.current) return
    
//     const rect = cardRef.current.getBoundingClientRect()
//     const x = (e.clientX - rect.left) / rect.width
//     const y = (e.clientY - rect.top) / rect.height
    
//     mouseX.set(x)
//     mouseY.set(y)
//   }

//   const rotateX = useSpring(0, { stiffness: 150, damping: 20 })
//   const rotateY = useSpring(0, { stiffness: 150, damping: 20 })
//   const brightness = useSpring(1, { stiffness: 150, damping: 20 })
//   const scale = useSpring(1, { stiffness: 150, damping: 20 })
  
//   useEffect(() => {
//     if (isHovering) {
//       rotateX.set((mouseY.get() - 0.5) * -20)
//       rotateY.set((mouseX.get() - 0.5) * 20)
//       brightness.set(1.1)
//       scale.set(1.02)
//     } else {
//       rotateX.set(0)
//       rotateY.set(0)
//       brightness.set(1)
//       scale.set(1)
//     }
//   }, [mouseX, mouseY, isHovering, rotateX, rotateY, brightness, scale])
  
//   return (
//     <motion.div
//       ref={cardRef}
//       className={cn("relative overflow-hidden", className)}
//       onMouseMove={handleMouseMove}
//       onMouseEnter={() => setIsHovering(true)}
//       onMouseLeave={() => setIsHovering(false)}
//       style={{
//         rotateX,
//         rotateY,
//         scale,
//         transformStyle: "preserve-3d",
//         filter: `brightness(${brightness})`
//       }}
//     >
//       {children}
      
//       {/* Enhanced reflection overlay with dynamic opacity */}
//       <motion.div
//         className="absolute inset-0 bg-white/10"
//         style={{
//           opacity: useTransform(
//             mouseX, 
//             [0, 0.5, 1], 
//             [0.05, useTransform(mouseY, [0, 0.5, 1], [0.05, 0.15, 0.05]), 0.05]
//           )
//         }}
//       />
//     </motion.div>
//   )
// }

// // Enhanced OTP input with improved animations and feedback
// const EnhancedOTPInput = ({
//   value,
//   onChange,
//   length = 6,
//   color,
// }: {
//   value: string
//   onChange: (value: string) => void
//   length?: number
//   color: ThemeColor
// }) => {
//   const inputRefs = useRef<(HTMLInputElement | null)[]>([])
//   const [focused, setFocused] = useState<number | null>(null)
//   const [shake, setShake] = useState<number | null>(null)

//   // Theme color classes for OTP inputs
//   const themeClasses = {
//     purple: "focus:border-purple-500 focus:ring-purple-500/30",
//     blue: "focus:border-blue-500 focus:ring-blue-500/30",
//     teal: "focus:border-teal-500 focus:ring-teal-500/30",
//     fuchsia: "focus:border-fuchsia-500 focus:ring-fuchsia-500/30",
//     cyan: "focus:border-cyan-500 focus:ring-cyan-500/30",
//   }

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
//     const val = e.target.value.replace(/[^0-9]/g, "").substring(0, 1)
    
//     // Create a new value by replacing the character at the specific index
//     const newValue = value.padEnd(length, "").split("")
//     newValue[index] = val
//     onChange(newValue.join("").trim())
    
//     // Auto-focus next input if current input is filled
//     if (val && index < length - 1) {
//       inputRefs.current[index + 1]?.focus()
//     }
//   }

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
//     // Handle backspace - clear current value and focus previous input if empty
//     if (e.key === "Backspace") {
//       const newValue = value.padEnd(length, "").split("")
      
//       if (newValue[index]) {
//         newValue[index] = ""
//         onChange(newValue.join("").trim())
//       } else if (index > 0) {
//         newValue[index - 1] = ""
//         onChange(newValue.join("").trim())
//         inputRefs.current[index - 1]?.focus()
//       }
//     }
    
//     // Handle arrow keys
//     if (e.key === "ArrowLeft" && index > 0) {
//       inputRefs.current[index - 1]?.focus()
//     }
    
//     if (e.key === "ArrowRight" && index < length - 1) {
//       inputRefs.current[index + 1]?.focus()
//     }

//     // Invalid key - show shake animation
//     if (!/^[0-9]$/.test(e.key) && 
//         !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
//       setShake(index)
//       setTimeout(() => setShake(null), 500)
//     }
//   }

//   const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
//     e.preventDefault()
//     const pastedData = e.clipboardData.getData("text/plain").replace(/[^0-9]/g, "").substring(0, length)
    
//     if (pastedData) {
//       onChange(pastedData)
      
//       // Focus the next empty input or the last input if all are filled
//       const nextEmptyIndex = pastedData.length < length ? pastedData.length : length - 1
//       inputRefs.current[nextEmptyIndex]?.focus()
//     }
//   }

//   return (
//     <div className="flex items-center justify-center gap-2 sm:gap-3">
//       {Array.from({ length }).map((_, index) => (
//         <motion.div
//           key={index}
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ 
//             opacity: 1, 
//             y: 0,
//             x: shake === index ? [0, -5, 5, -5, 5, 0] : 0
//           }}
//           transition={{ 
//             duration: shake === index ? 0.4 : 0.3, 
//             delay: shake === index ? 0 : index * 0.05,
//             type: shake === index ? "spring" : "tween"
//           }}
//           className="relative"
//         >
//           <input
//             ref={(el) => {
//               inputRefs.current[index] = el;
//             }}
//             type="text"
//             inputMode="numeric"
//             pattern="[0-9]*"
//             maxLength={1}
//             value={value[index] || ""}
//             onChange={(e) => handleChange(e, index)}
//             onKeyDown={(e) => handleKeyDown(e, index)}
//             onPaste={handlePaste}
//             onFocus={() => setFocused(index)}
//             onBlur={() => setFocused(null)}
//             className={cn(
//               "w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 text-center text-lg font-mono font-bold",
//               "bg-gray-900/80 backdrop-blur-sm border-2 rounded-xl",
//               "transition-all duration-200 ease-in-out",
//               "text-white",
//               themeClasses[color],
//               focused === index ? "scale-110 shadow-lg border-opacity-100" : "border-gray-700"
//             )}
//             aria-label={`OTP digit ${index + 1}`}
//           />
          
//           {/* Animated underline effect */}
//           <motion.div
//             className={cn(
//               "absolute bottom-0 left-1/2 h-0.5 rounded-full -translate-x-1/2",
//               color === "purple" ? "bg-purple-500" :
//               color === "blue" ? "bg-blue-500" :
//               color === "teal" ? "bg-teal-500" :
//               color === "fuchsia" ? "bg-fuchsia-500" : "bg-cyan-500"
//             )}
//             initial={{ width: 0 }}
//             animate={{ width: focused === index ? '80%' : 0 }}
//             transition={{ duration: 0.3 }}
//           />
//         </motion.div>
//       ))}
//     </div>
//   )
// }

// // Enhanced floating label input with improved animations
// const FloatingLabelInput = ({
//   id,
//   label,
//   icon: Icon,
//   value,
//   onChange,
//   type = "text",
//   placeholder,
//   autoFocus = false,
//   required = false,
//   color,
//   ...props
// }: {
//   id: string
//   label: string
//   icon: React.ElementType
//   value: string
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
//   type?: string
//   placeholder?: string
//   autoFocus?: boolean
//   required?: boolean
//   color: ThemeColor
//   [key: string]: any
// }) => {
//   const [isFocused, setIsFocused] = useState(false)
//   const [isPasswordVisible, setIsPasswordVisible] = useState(false)
//   const inputRef = useRef<HTMLInputElement>(null)
//   const hasValue = value.length > 0

//   const themeClasses = {
//     purple: "group-focus-within:text-purple-500 group-focus-within:border-purple-500",
//     blue: "group-focus-within:text-blue-500 group-focus-within:border-blue-500",
//     teal: "group-focus-within:text-teal-500 group-focus-within:border-teal-500",
//     fuchsia: "group-focus-within:text-fuchsia-500 group-focus-within:border-fuchsia-500",
//     cyan: "group-focus-within:text-cyan-500 group-focus-within:border-cyan-500",
//   }

//   const handleInputFocus = () => setIsFocused(true)
//   const handleInputBlur = () => setIsFocused(false)

//   // Focus the input when clicking on the container
//   const handleContainerClick = () => {
//     inputRef.current?.focus()
//   }

//   const togglePasswordVisibility = (e: React.MouseEvent) => {
//     e.preventDefault()
//     setIsPasswordVisible(!isPasswordVisible)
//   }

//   return (
//     <div 
//       className="group relative"
//       onClick={handleContainerClick}
//     >
//       <div 
//         className={cn(
//           "relative flex items-center p-4 border-2 rounded-xl transition-all duration-200 ease-in-out bg-gray-900/80 backdrop-blur-sm",
//           "group-hover:border-opacity-100 group-focus-within:border-opacity-100",
//           "border-gray-700",
//           themeClasses[color]
//         )}
//       >
//         <span 
//           className={cn(
//             "absolute flex items-center transition-all duration-200 ease-in-out text-gray-400",
//             (isFocused || hasValue) ? "transform -translate-y-9 scale-90" : "",
//             isFocused ? (
//               color === "purple" ? "text-purple-500" :
//               color === "blue" ? "text-blue-500" : 
//               color === "teal" ? "text-teal-500" :
//               color === "fuchsia" ? "text-fuchsia-500" : "text-cyan-500"
//             ) : ""
//           )}
//         >
//           <Icon className="w-5 h-5 mr-2" />
//           <span className={cn(
//             "font-medium",
//             (isFocused || hasValue) ? "text-sm" : "",
//           )}>
//             {label}
//           </span>
//         </span>

//         <input
//           ref={inputRef}
//           id={id}
//           type={type === "password" ? (isPasswordVisible ? "text" : "password") : type}
//           className="w-full bg-transparent focus:outline-none placeholder:text-transparent focus:placeholder:text-gray-400 transition-all text-white"
//           value={value}
//           onChange={onChange}
//           onFocus={handleInputFocus}
//           onBlur={handleInputBlur}
//           placeholder={placeholder || label}
//           autoFocus={autoFocus}
//           required={required}
//           autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : "off"}
//           {...props}
//         />

//         {type === "password" && (
//           <button
//             type="button"
//             className="flex items-center justify-center text-gray-400 hover:text-gray-300 transition-colors"
//             onClick={togglePasswordVisibility}
//             aria-label={isPasswordVisible ? "Hide password" : "Show password"}
//           >
//             {isPasswordVisible ? (
//               <EyeOff className="w-5 h-5" />
//             ) : (
//               <Eye className="w-5 h-5" />
//             )}
//           </button>
//         )}
//       </div>

//       {/* Animated underline effect */}
//       <motion.div
//         className={cn(
//           "absolute bottom-0 left-1/2 h-0.5 rounded-full -translate-x-1/2",
//           color === "purple" ? "bg-purple-500" :
//           color === "blue" ? "bg-blue-500" :
//           color === "teal" ? "bg-teal-500" :
//           color === "fuchsia" ? "bg-fuchsia-500" : "bg-cyan-500"
//         )}
//         initial={{ width: 0 }}
//         animate={{ width: isFocused ? '95%' : 0 }}
//         transition={{ duration: 0.3 }}
//       />
//     </div>
//   )
// }

// // Enhanced LoadingDots component with smoother animations
// function LoadingDots({ 
//   color = "bg-white", 
//   size = "medium",
//   className
// }: { 
//   color?: string
//   size?: "small" | "medium" | "large"
//   className?: string
// }) {
//   const sizeClasses = {
//     small: "h-1 w-1",
//     medium: "h-1.5 w-1.5",
//     large: "h-2 w-2",
//   }

//   return (
//     <div className={cn("flex items-center gap-1.5", className)}>
//       {[0, 1, 2].map((index) => (
//         <motion.span
//           key={index}
//           className={cn("rounded-full", sizeClasses[size], color)}
//           initial={{ y: 0, opacity: 0.4 }}
//           animate={{ 
//             y: [0, -5, 0], 
//             opacity: [0.4, 1, 0.4],
//           }}
//           transition={{
//             duration: 0.8,
//             repeat: Infinity,
//             delay: index * 0.15,
//             ease: "easeInOut"
//           }}
//         />
//       ))}
//     </div>
//   )
// }

// // Enhanced Gradient Button with improved hover effects
// function GradientButton({
//   children,
//   onClick,
//   type = "button",
//   disabled = false,
//   isLoading = false,
//   className,
//   color,
//   size = "default"
// }: {
//   children: React.ReactNode
//   onClick?: () => void
//   type?: "button" | "submit" | "reset"
//   disabled?: boolean
//   isLoading?: boolean
//   className?: string
//   color: ThemeColor
//   size?: "sm" | "default" | "lg"
// }) {
//   const getGradient = (color: ThemeColor) => {
//     switch (color) {
//       case "purple": return "from-purple-500 via-purple-600 to-fuchsia-600"
//       case "blue": return "from-blue-500 via-blue-600 to-cyan-600"
//       case "teal": return "from-teal-400 via-teal-500 to-emerald-600"
//       case "fuchsia": return "from-fuchsia-500 via-fuchsia-600 to-pink-600"
//       case "cyan": return "from-cyan-400 via-cyan-500 to-blue-600"
//     }
//   }

//   const sizeClasses = {
//     sm: "py-2 px-4 text-sm",
//     default: "py-3 px-6",
//     lg: "py-4 px-8 text-lg",
//   }

//   return (
//     <button
//       type={type}
//       onClick={onClick}
//       disabled={disabled || isLoading}
//       className={cn(
//         "relative group overflow-hidden font-semibold rounded-xl text-white transition-all duration-300 ease-out",
//         "shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-opacity-50",
//         `focus:ring-${color}-500/50`,
//         "disabled:opacity-70 disabled:cursor-not-allowed",
//         sizeClasses[size],
//         className
//       )}
//     >
//       {/* Background Layers */}
//       <div className={cn(
//         "absolute inset-0 bg-gradient-to-br transition-all duration-300 group-hover:opacity-90",
//         getGradient(color)
//       )} />
      
//       {/* Enhanced Hover Effect Shine */}
//       <div className="absolute inset-0 w-full h-full transition-all duration-700 opacity-0 group-hover:opacity-30">
//         <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-white via-white to-transparent opacity-70 transform -translate-x-full -translate-y-full group-hover:translate-x-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out" />
//       </div>
      
//       {/* Subtle Border Glow */}
//       <div className={cn(
//         "absolute inset-0 w-full h-full rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
//         `border border-${color}-400/40`
//       )} />
      
//       {/* Content */}
//       <div className="relative flex items-center justify-center">
//         {isLoading ? (
//           <div className="flex items-center">
//             <LoadingDots color="bg-white" />
//             <span className="ml-2">Loading...</span>
//           </div>
//         ) : (
//           children
//         )}
//       </div>
//     </button>
//   )
// }

// // Enhanced Social Sign In Button with improved hover effects
// function SocialButton({
//   provider,
//   onClick,
//   disabled = false,
//   className,
// }: {
//   provider: "google" | "github" | "twitter" | "linkedin"
//   onClick: () => void
//   disabled?: boolean
//   className?: string
// }) {
//   const getProviderDetails = (provider: string) => {
//     switch (provider) {
//       case "google":
//         return {
//           icon: (
//             <div className="flex items-center justify-center bg-white rounded-full p-0.5">
//               <Image src="/google.svg" alt="Google" width={18} height={18} />
//             </div>
//           ),
//           name: "Google",
//           hoverClass: "hover:bg-white/5",
//           hoverBorder: "hover:border-white/30",
//         }
//       case "github":
//         return {
//           icon: <Github className="w-5 h-5" />,
//           name: "GitHub",
//           hoverClass: "hover:bg-white/5",
//           hoverBorder: "hover:border-white/30",
//         }
//       case "twitter":
//         return {
//           icon: <Twitter className="w-5 h-5 text-[#1DA1F2]" />,
//           name: "Twitter",
//           hoverClass: "hover:bg-[#1DA1F2]/10",
//           hoverBorder: "hover:border-[#1DA1F2]/30",
//         }
//       case "linkedin":
//         return {
//           icon: (
//             <div className="flex items-center justify-center p-0.5">
//               <Image src="/linkedin.svg" alt="LinkedIn" width={18} height={18} />
//             </div>
//           ),
//           name: "LinkedIn",
//           hoverClass: "hover:bg-[#0A66C2]/10",
//           hoverBorder: "hover:border-[#0A66C2]/30",
//         }
//     }
//   }

//   const { icon, name, hoverClass, hoverBorder } = getProviderDetails(provider) || {}

//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       disabled={disabled}
//       className={cn(
//         "relative flex items-center justify-center gap-3 py-2.5 px-4",
//         "bg-gray-900/80 backdrop-blur-sm border-2 border-gray-800",
//         "rounded-xl font-medium transition-all duration-200",
//         "hover:shadow-lg",
//         hoverClass,
//         hoverBorder,
//         "disabled:opacity-70 disabled:cursor-not-allowed",
//         className
//       )}
//     >
//       {icon}
//       <span className="text-white">{name}</span>
//     </button>
//   )
// }

// // Main AuthPage component
// export default function AuthPage() {
//   const [view, setView] = useState<AuthView>("sign-in")
//   const [isLoading, setIsLoading] = useState(false)
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [username, setUsername] = useState("")
//   const [otpCode, setOtpCode] = useState("")
//   const [verificationToken, setVerificationToken] = useState("")
//   const [themeColor, setThemeColor] = useState<ThemeColor>("purple")
//   const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn()
//   const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp()
  
//   // Background animation controls
//   const particlesRef = useRef<HTMLDivElement>(null)
//   const cursorRef = useRef({ x: 0, y: 0 })
//   const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
//   const cursorSpring = {
//     x: useSpring(0, { stiffness: 100, damping: 20 }),
//     y: useSpring(0, { stiffness: 100, damping: 20 }),
//   }

//   // Set theme color based on view
//   useEffect(() => {
//     switch (view) {
//       case "sign-in":
//         setThemeColor("purple")
//         break
//       case "sign-up":
//         setThemeColor("blue")
//         break
//       case "verify-otp":
//         setThemeColor("teal")
//         break
//     }
//   }, [view])

//   // Reset OTP when view changes
//   useEffect(() => {
//     setOtpCode("")
//   }, [view])

//   // Mouse follower effect
//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       setCursorPosition({ x: e.clientX, y: e.clientY })
//     }

//     window.addEventListener("mousemove", handleMouseMove)
//     return () => window.removeEventListener("mousemove", handleMouseMove)
//   }, [])

//   useEffect(() => {
//     cursorSpring.x.set(cursorPosition.x)
//     cursorSpring.y.set(cursorPosition.y)
//   }, [cursorPosition])

//   // Enhanced background particles animation
//   useEffect(() => {
//     if (!particlesRef.current) return

//     const particles = Array.from(particlesRef.current.children) as HTMLElement[]
    
//     particles.forEach((particle, i) => {
//       const speed = Math.random() * 0.01 + 0.005
//       let x = parseFloat(particle.getAttribute("data-x") || "0")
//       let y = parseFloat(particle.getAttribute("data-y") || "0")
      
//       const animate = () => {
//         // Attracted to cursor with decay based on distance
//         const dx = cursorRef.current.x - x
//         const dy = cursorRef.current.y - y
//         const dist = Math.sqrt(dx * dx + dy * dy)
//         const maxDist = 300
        
//         if (dist < maxDist) {
//           const force = (1 - dist / maxDist) * 0.03
//           x += dx * force
//           y += dy * force
//         }
        
//         // Random movement with improved fluidity
//         x += (Math.random() - 0.5) * speed * 1.5
//         y += (Math.random() - 0.5) * speed * 1.5
        
//         // Boundary check with smoother wrapping
//         if (x < -50) x = window.innerWidth + 50
//         if (x > window.innerWidth + 50) x = -50
//         if (y < -50) y = window.innerHeight + 50
//         if (y > window.innerHeight + 50) y = -50
        
//         particle.style.transform = `translate(${x}px, ${y}px)`
//         particle.setAttribute("data-x", x.toString())
//         particle.setAttribute("data-y", y.toString())
        
//         requestAnimationFrame(animate)
//       }
      
//       animate()
//     })
    
//     // Update cursor reference
//     const updateCursor = () => {
//       cursorRef.current = { 
//         x: cursorSpring.x.get(), 
//         y: cursorSpring.y.get() 
//       }
//       requestAnimationFrame(updateCursor)
//     }
    
//     updateCursor()
//   }, [])

//   // Memoized form submission handler
//   const handleEmailSubmit = useCallback(
//     async (e: React.FormEvent) => {
//       e.preventDefault()
//       if (!isSignInLoaded || !isSignUpLoaded) return

//       setIsLoading(true)

//       try {
//         if (view === "sign-in") {
//           const result = await signIn.create({
//             strategy: "email_code",
//             identifier: email,
//           })
//           setVerificationToken(result.createdSessionId || "")
//           setView("verify-otp")
//           toast.success("Verification code sent", {
//             icon: <Check className="h-4 w-4 text-teal-500" />,
//             description: "Please check your email for the verification code",
//             position: "top-center",
//           })
//         } else {
//           const result = await signUp.create({
//             emailAddress: email,
//             username,
//           })
//           setVerificationToken(result.createdSessionId || "")
//           setView("verify-otp")
//           toast.success("Verification code sent", {
//             icon: <Check className="h-4 w-4 text-teal-500" />,
//             description: "Please check your email for the verification code",
//             position: "top-center",
//           })
//         }
//       } catch (error: any) {
//         console.error("Auth error:", error)
//         toast.error("Authentication failed", {
//           icon: <X className="h-4 w-4 text-rose-500" />,
//           description: error.errors?.[0]?.message || "Please try again",
//           position: "top-center",
//         })
//       } finally {
//         setIsLoading(false)
//       }
//     },
//     [email, username, view, isSignInLoaded, isSignUpLoaded, signIn, signUp],
//   )

//   // OTP verification handler
//   const handleOTPVerification = useCallback(
//     async (e: React.FormEvent) => {
//       e.preventDefault()
//       if (!signIn) return

//       setIsLoading(true)

//       try {
//         const result = await signIn.attemptFirstFactor({
//           strategy: "email_code",
//           code: otpCode,
//         })

//         if (result.status === "complete") {
//           await setSignInActive({ session: result.createdSessionId })
//           toast.success("Successfully signed in!", {
//             icon: <Check className="h-4 w-4 text-teal-500" />,
//             position: "top-center",
//           })
//           window.location.href = "/"
//         }
//       } catch (error: any) {
//         console.error("OTP verification error:", error)
//         toast.error("Invalid verification code", {
//           icon: <X className="h-4 w-4 text-rose-500" />,
//           description: "Please check and try again",
//           position: "top-center",
//         })
//       } finally {
//         setIsLoading(false)
//       }
//     },
//     [otpCode, signIn, setSignInActive],
//   )

//   // OAuth sign-in handler
//   const handleOAuthSignIn = useCallback(
//     async (provider: "oauth_google" | "oauth_github" | "oauth_twitter" | "oauth_linkedin_oidc") => {
//       if (!isSignInLoaded || !isSignUpLoaded) {
//         toast.error("Authentication not ready", {
//           description: "Please try again in a moment",
//           position: "top-center",
//         })
//         return
//       }

//       try {
//         setIsLoading(true)
//         const baseUrl = window.location.origin

//         const providerConfig: Record<
//           string,
//           {
//             strategy: "oauth_google" | "oauth_github" | "oauth_twitter" | "oauth_linkedin_oidc"
//             redirectUrl: string
//             redirectUrlComplete: string
//             additionalScopes?: string[]
//           }
//         > = {
//           oauth_google: {
//             strategy: "oauth_google",
//             redirectUrl: `${baseUrl}/sso-callback`,
//             redirectUrlComplete: baseUrl,
//           },
//           oauth_github: {
//             strategy: "oauth_github",
//             redirectUrl: `${baseUrl}/sso-callback`,
//             redirectUrlComplete: baseUrl,
//           },
//           oauth_twitter: {
//             strategy: "oauth_twitter",
//             redirectUrl: `${baseUrl}/sso-callback`,
//             redirectUrlComplete: baseUrl,
//           },
//           oauth_linkedin_oidc: {
//             strategy: "oauth_linkedin_oidc",
//             redirectUrl: `${baseUrl}/sso-callback`,
//             redirectUrlComplete: baseUrl,
//             additionalScopes: ["openid", "profile", "email", "w_member_social"],
//           },
//         }

//         const config = providerConfig[provider]

//         if (view === "sign-in") {
//           await signIn?.authenticateWithRedirect({
//             ...config,
//           })
//         } else {
//           await signUp?.authenticateWithRedirect({
//             ...config,
//           })
//         }
//       } catch (error: any) {
//         console.error("OAuth error:", error)
//         toast.error("Authentication failed", {
//           icon: <X className="h-4 w-4 text-rose-500" />,
//           description: "Please try again",
//           position: "top-center",
//         })
//       } finally {
//         setIsLoading(false)
//       }
//     },
//     [view, isSignInLoaded, isSignUpLoaded, signIn, signUp],
//   )

//   // Get title and subtitle based on current view
//   const getViewContent = () => {
//     switch (view) {
//       case "sign-in":
//         return {
//           title: "Welcome Back",
//           subtitle: "Sign in to continue your coding journey",
//           buttonText: "Sign In",
//         }
//       case "sign-up":
//         return {
//           title: "Join CodeConnect",
//           subtitle: "Create an account to start collaborating",
//           buttonText: "Create Account",
//         }
//       case "verify-otp":
//         return {
//           title: "Verify Your Email",
//           subtitle: "Enter the code we sent to your email",
//           buttonText: "Verify Code",
//         }
//     }
//   }

//   const { title, subtitle, buttonText } = getViewContent()

//   // Theme color classes
//   const getThemeColorClasses = (color: ThemeColor) => {
//     return {
//       purple: {
//         gradient: "from-purple-400 to-fuchsia-600",
//         text: "text-purple-500",
//         darkText: "text-purple-400",
//         gradientText: "bg-gradient-to-r from-purple-400 to-fuchsia-500",
//         border: "border-purple-500",
//         ring: "ring-purple-500/20",
//         bg: "bg-purple-500",
//         darkBg: "bg-purple-500/90",
//       },
//       blue: {
//         gradient: "from-blue-400 to-cyan-600",
//         text: "text-blue-500",
//         darkText: "text-blue-400",
//         gradientText: "bg-gradient-to-r from-blue-400 to-cyan-500",
//         border: "border-blue-500",
//         ring: "ring-blue-500/20",
//         bg: "bg-blue-500",
//         darkBg: "bg-blue-500/90",
//       },
//       teal: {
//         gradient: "from-teal-400 to-emerald-600",
//         text: "text-teal-500",
//         darkText: "text-teal-400",
//         gradientText: "bg-gradient-to-r from-teal-400 to-emerald-500",
//         border: "border-teal-500",
//         ring: "ring-teal-500/20",
//         bg: "bg-teal-500",
//         darkBg: "bg-teal-500/90",
//       },
//       fuchsia: {
//         gradient: "from-fuchsia-400 to-pink-600",
//         text: "text-fuchsia-500",
//         darkText: "text-fuchsia-400",
//         gradientText: "bg-gradient-to-r from-fuchsia-400 to-pink-500",
//         border: "border-fuchsia-500",
//         ring: "ring-fuchsia-500/20",
//         bg: "bg-fuchsia-500",
//         darkBg: "bg-fuchsia-500/90",
//       },
//       cyan: {
//         gradient: "from-cyan-400 to-blue-600",
//         text: "text-cyan-500",
//         darkText: "text-cyan-400",
//         gradientText: "bg-gradient-to-r from-cyan-400 to-blue-500",
//         border: "border-cyan-500",
//         ring: "ring-cyan-500/20",
//         bg: "bg-cyan-500",
//         darkBg: "bg-cyan-500/90",
//       },
//     }[color]
//   }

//   const currentThemeColors = getThemeColorClasses(themeColor)

//   // Features list for display on the left side
//   const features = [
//     {
//       icon: <Zap className="w-5 h-5" />,
//       title: "Real-time collaboration",
//       description: "Work together with your team in real-time, just like Google Docs for code.",
//     },
//     {
//       icon: <Layers className="w-5 h-5" />,
//       title: "Code organization",
//       description: "Organize your codebase with an intuitive file structure and smart navigation.",
//     },
//     {
//       icon: <Lightbulb className="w-5 h-5" />,
//       title: "AI-powered assistance",
//       description: "Get intelligent code suggestions and bug fixes as you type.",
//     },
//   ]

//   return (
//     <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-gray-950 to-black">
//       {/* Animated background particles */}
//       <div ref={particlesRef} className="fixed inset-0 pointer-events-none">
//         {Array.from({ length: 50 }).map((_, i) => {
//           const size = Math.random() * 4 + 2
//           const opacity = Math.random() * 0.3 + 0.1
//           const x = Math.random() * window.innerWidth
//           const y = Math.random() * window.innerHeight
          
//           return (
//             <div
//               key={i}
//               data-x={x}
//               data-y={y}
//               className={cn(
//                 "absolute rounded-full blur-[1px]",
//                 themeColor === "purple" ? "bg-purple-500" :
//                 themeColor === "blue" ? "bg-blue-500" :
//                 themeColor === "teal" ? "bg-teal-500" :
//                 themeColor === "fuchsia" ? "bg-fuchsia-500" : "bg-cyan-500"
//               )}
//               style={{
//                 width: `${size}px`,
//                 height: `${size}px`,
//                 opacity,
//                 transform: `translate(${x}px, ${y}px)`,
//               }}
//             />
//           )
//         })}
//       </div>

//       {/* Main content */}
//       <div className="relative z-10 flex min-h-screen">
//         {/* Left side - Branding and info */}
//         <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-gray-900 to-black text-white p-8 items-center justify-center">
//           <div className="w-full max-w-lg px-8">
//             <TiltCard className="mb-12">
//               <div className="relative flex items-center justify-center mb-6">
//                 <div className={cn(
//                   "absolute -inset-6 rounded-full blur-2xl opacity-30",
//                   themeColor === "purple" ? "bg-purple-500" :
//                   themeColor === "blue" ? "bg-blue-500" :
//                   themeColor === "teal" ? "bg-teal-500" :
//                   themeColor === "fuchsia" ? "bg-fuchsia-500" : "bg-cyan-500"
//                 )} />
                
//                 <div className="relative flex items-center justify-center w-20 h-20 bg-gray-800 rounded-2xl border border-gray-700 shadow-lg">
//                   <Code className={cn(
//                     "w-10 h-10",
//                     themeColor === "purple" ? "text-purple-400" :
//                     themeColor === "blue" ? "text-blue-400" :
//                     themeColor === "teal" ? "text-teal-400" :
//                     themeColor === "fuchsia" ? "text-fuchsia-400" : "text-cyan-400"
//                   )} />
//                 </div>
//               </div>
              
//               <h1 className="text-4xl font-bold text-center mb-2">CodeConnect</h1>
//               <p className="text-lg text-gray-300 text-center mb-8">
//                 The ultimate platform for developers to collaborate, share, and innovate together.
//               </p>
//             </TiltCard>

//             {/* Features */}
//             <div className="space-y-6">
//               {features.map((feature, index) => (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
//                   className="flex items-start space-x-4 p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl backdrop-blur-sm"
//                 >
//                   <div className={cn(
//                     "p-2 rounded-lg",
//                     themeColor === "purple" ? "bg-purple-500/20 text-purple-400" :
//                     themeColor === "blue" ? "bg-blue-500/20 text-blue-400" :
//                     themeColor === "teal" ? "bg-teal-500/20 text-teal-400" :
//                     themeColor === "fuchsia" ? "bg-fuchsia-500/20 text-fuchsia-400" : "bg-cyan-500/20 text-cyan-400"
//                   )}>
//                     {feature.icon}
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-semibold">{feature.title}</h3>
//                     <p className="text-gray-400">{feature.description}</p>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>

//             {/* Testimonial */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 1.2 }}
//               className="mt-10 p-6 rounded-2xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm"
//             >
//               <div className="flex items-center mb-4">
//                 <div className="flex -space-x-2">
//                   {[1, 2, 3].map((i) => (
//                     <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-800 overflow-hidden">
//                       <Image
//                         src={`/api/placeholder/${30 + i * 10}/30`}
//                         alt="User avatar"
//                         width={40}
//                         height={40}
//                         className="rounded-full object-cover"
//                       />
//                     </div>
//                   ))}
//                 </div>
//                 <div className="ml-4">
//                   <div className="flex items-center mb-1">
//                     {[1, 2, 3, 4, 5].map((i) => (
//                       <motion.svg
//                         key={i}
//                         initial={{ opacity: 0, scale: 0 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ duration: 0.3, delay: 1.2 + i * 0.1 }}
//                         className={cn(
//                           "w-4 h-4 mr-1",
//                           themeColor === "purple" ? "text-purple-400" :
//                           themeColor === "blue" ? "text-blue-400" :
//                           themeColor === "teal" ? "text-teal-400" :
//                           themeColor === "fuchsia" ? "text-fuchsia-400" : "text-cyan-400"
//                         )}
//                         fill="currentColor"
//                         viewBox="0 0 20 20"
//                       >
//                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                       </motion.svg>
//                     ))}
//                   </div>
//                   <p className="text-white font-medium text-sm">4.9 from 2,800+ reviews</p>
//                 </div>
//               </div>
//               <p className="text-gray-300 italic">
//                 "CodeConnect has completely transformed how our team collaborates. The real-time features and intuitive interface have boosted our productivity by over 40%."
//               </p>
//               <div className="flex items-center mt-4">
//                 <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
//                   <Image
//                     src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7-kbQf6vAzBcEWWNcnmK2z07EnLkDtwxfOKyzTXOf4i9oXdpH6TLplxvf424Ul9IPuJ4&usqp=CAU"
//                     alt="Testimonial author"
//                     width={32}
//                     height={32}
//                     className="rounded-full"
//                     unoptimized={true}
//                   />
//                 </div>
//                 <div>
//                   <p className="font-semibold text-white text-sm">Sarah Johnson</p>
//                   <p className="text-gray-400 text-xs">CTO, TechForward</p>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Stats */}
//             <div className="grid grid-cols-3 gap-4 mt-8">
//               {[
//                 { value: "10k+", label: "Developers" },
//                 { value: "5M+", label: "Projects" },
//                 { value: "99.9%", label: "Uptime" },
//               ].map((stat, i) => (
//                 <motion.div
//                   key={i}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.5, delay: 1.5 + i * 0.1 }}
//                   className="text-center p-3 bg-gray-800/30 rounded-xl border border-gray-700/50"
//                 >
//                   <p className={cn(
//                     "text-2xl font-bold",
//                     themeColor === "purple" ? "text-purple-400" :
//                     themeColor === "blue" ? "text-blue-400" :
//                     themeColor === "teal" ? "text-teal-400" :
//                     themeColor === "fuchsia" ? "text-fuchsia-400" : "text-cyan-400"
//                   )}>
//                     {stat.value}
//                   </p>
//                   <p className="text-gray-400 text-sm">{stat.label}</p>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Right side - Auth form */}
//         <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
//           <div className="w-full max-w-md">
//             <AnimatePresence mode="wait">
//               <motion.div
//                 key={view}
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -20 }}
//                 transition={{ duration: 0.3 }}
//                 className="bg-gray-900/30 backdrop-blur-md border border-gray-800/50 rounded-2xl overflow-hidden shadow-xl p-8"
//               >
//                 {/* Logo for mobile */}
//                 <div className="flex flex-col items-center mb-8 lg:hidden">
//                   <div className="relative">
//                     <div className={cn(
//                       "absolute -inset-6 rounded-full blur-lg opacity-30",
//                       themeColor === "purple" ? "bg-purple-500" :
//                       themeColor === "blue" ? "bg-blue-500" :
//                       themeColor === "teal" ? "bg-teal-500" :
//                       themeColor === "fuchsia" ? "bg-fuchsia-500" : "bg-cyan-500"
//                     )} />
                    
//                     <div className="relative flex items-center justify-center w-16 h-16 bg-gray-800 rounded-2xl border border-gray-700 shadow-lg">
//                       <Code className={cn(
//                         "w-8 h-8",
//                         themeColor === "purple" ? "text-purple-500" :
//                         themeColor === "blue" ? "text-blue-500" :
//                         themeColor === "teal" ? "text-teal-500" :
//                         themeColor === "fuchsia" ? "text-fuchsia-500" : "text-cyan-500"
//                       )} />
//                     </div>
//                   </div>
                  
//                   <h1 className="text-2xl font-bold text-center mt-4 mb-1 text-white">CodeConnect</h1>
//                   <p className="text-sm text-gray-400 text-center">
//                     Your coding collaboration platform
//                   </p>
//                 </div>

//                 {/* Header */}
//                 <div className="text-center mb-8">
//                   <h1 className={cn(
//                     "text-3xl font-bold bg-clip-text text-transparent",
//                     `bg-gradient-to-r ${currentThemeColors.gradientText}`
//                   )}>
//                     {title}
//                   </h1>
//                   <p className="text-gray-400 mt-2">
//                     {subtitle}
//                   </p>
//                 </div>

//                 {/* Form */}
//                 <form 
//                   onSubmit={view === "verify-otp" ? handleOTPVerification : handleEmailSubmit}
//                   className="space-y-6"
//                 >
//                   {view === "verify-otp" ? (
//                     <div className="space-y-5">
//                       <div className="flex flex-col items-center space-y-6">
//                         <EnhancedOTPInput
//                           value={otpCode}
//                           onChange={setOtpCode}
//                           length={6}
//                           color={themeColor}
//                         />
                        
//                         <p className="text-sm text-center text-gray-400 max-w-xs">
//                           Enter the verification code sent to
//                           <span className="font-medium text-gray-300 block mt-1">
//                             {email}
//                           </span>
//                         </p>
//                       </div>
                      
//                       <div className="flex justify-center text-sm">
//                         <button
//                           type="button"
//                           onClick={() => setView(username ? "sign-up" : "sign-in")}
//                           className="inline-flex items-center text-gray-400 hover:text-gray-300"
//                         >
//                           <RefreshCw className="w-4 h-4 mr-1" />
//                           Resend code
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <>
//                       {view === "sign-up" && (
//                         <FloatingLabelInput
//                           id="username"
//                           label="Username"
//                           icon={User}
//                           value={username}
//                           onChange={(e) => setUsername(e.target.value)}
//                           placeholder="Choose a username"
//                           required
//                           autoFocus
//                           color={themeColor}
//                         />
//                       )}

//                       <FloatingLabelInput
//                         id="email"
//                         label="Email"
//                         icon={Mail}
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         placeholder="Enter your email"
//                         required
//                         autoFocus={view === "sign-in"}
//                         color={themeColor}
//                       />

//                       <FloatingLabelInput
//                         id="password"
//                         label="Password"
//                         icon={Lock}
//                         type="password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         placeholder="Enter your password"
//                         required
//                         color={themeColor}
//                       />
//                     </>
//                   )}

//                   <div className="pt-2">
//                     <GradientButton
//                       type="submit"
//                       disabled={isLoading || !isSignInLoaded || !isSignUpLoaded}
//                       isLoading={isLoading}
//                       className="w-full"
//                       color={themeColor}
//                     >
//                       <span className="flex items-center justify-center">
//                         {buttonText}
//                         <ArrowRight className="ml-2 w-5 h-5" />
//                       </span>
//                     </GradientButton>

//                     {view !== "verify-otp" && (
//                       <div className="mt-8 space-y-5">
//                         <div className="relative">
//                           <div className="absolute inset-0 flex items-center">
//                             <div className="w-full border-t border-gray-700" />
//                           </div>
//                           <div className="relative flex justify-center text-xs">
//                             <span className="px-2 bg-gray-900 text-gray-400">
//                               Or continue with
//                             </span>
//                           </div>
//                         </div>

//                         <div className="grid grid-cols-2 gap-3">
//                           <SocialButton
//                             provider="google"
//                             onClick={() => handleOAuthSignIn("oauth_google")}
//                             disabled={isLoading}
//                           />
//                           <SocialButton
//                             provider="github"
//                             onClick={() => handleOAuthSignIn("oauth_github")}
//                             disabled={isLoading}
//                           />
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </form>

//                 {/* Footer */}
//                 {view !== "verify-otp" && (
//                   <div className="mt-8 text-center text-sm">
//                     <p className="text-gray-400">
//                       {view === "sign-in" ? (
//                         <>
//                           Don't have an account?{" "}
//                           <button
//                             type="button"
//                             onClick={() => setView("sign-up")}
//                             className={cn(
//                               "font-medium hover:underline",
//                               currentThemeColors.text
//                             )}
//                           >
//                             Sign up
//                           </button>
//                         </>
//                       ) : (
//                         <>
//                           Already have an account?{" "}
//                           <button
//                             type="button"
//                             onClick={() => setView("sign-in")}
//                             className={cn(
//                               "font-medium hover:underline",
//                               currentThemeColors.text
//                             )}
//                           >
//                             Sign in
//                           </button>
//                         </>
//                       )}
//                     </p>
                    
//                     <p className="mt-6 text-gray-500 text-xs">
//                       By continuing, you agree to our{" "}
//                       <a href="#" className="underline hover:text-gray-300">
//                         Terms of Service
//                       </a>{" "}
//                       and{" "}
//                       <a href="#" className="underline hover:text-gray-300">
//                         Privacy Policy
//                       </a>
//                     </p>
//                   </div>
//                 )}

//                 {/* Back button for OTP view */}
//                 {view === "verify-otp" && (
//                   <div className="mt-6 text-center">
//                     <button
//                       type="button"
//                       onClick={() => setView(username ? "sign-up" : "sign-in")}
//                       className="text-sm text-gray-400 hover:text-gray-300 inline-flex items-center"
//                     >
//                       <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                       </svg>
//                       Back to {username ? "sign up" : "sign in"}
//                     </button>
//                   </div>
//                 )}
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
