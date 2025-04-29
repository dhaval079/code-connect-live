// import { useSignIn, useSignUp } from "@clerk/nextjs";
// import { motion, AnimatePresence } from "framer-motion";
// import { useEffect, useState, useCallback } from "react";
// import AdvancedCursor from "../Dashboard/Cursor";
// import { Code, Mail, Loader2, ArrowRight, Globe, Check } from 'lucide-react';
// import { GlowingButton } from "../Dashboard/buttons/GlowingButton";
// import { FuturisticInput } from "../Dashboard/buttons/FuturisticInput";
// import { toast } from "sonner";
// import OTPInput from "../Dashboard/buttons/OTPInput";
// import Image from "next/image";
// import { cn } from "@/lib/utils";

// interface AuthModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// type AuthView = "sign-in" | "sign-up" | "verify-otp";

// const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
//   const [view, setView] = useState<AuthView>("sign-in");
//   const [isLoading, setIsLoading] = useState(false);
//   const [email, setEmail] = useState("");
//   const [username, setUsername] = useState("");
//   const [otpCode, setOtpCode] = useState("");
//   const [verificationToken, setVerificationToken] = useState("");
//   const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
//   const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();

//   // Reset form when view changes
//   useEffect(() => {
//     setOtpCode("");
//   }, [view]);

//   // Handle body scroll lock
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "unset";
//     }
//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [isOpen]);

//   // Memoized form submission handler
//   const handleEmailSubmit = useCallback(async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!isSignInLoaded || !isSignUpLoaded) return;

//     setIsLoading(true);

//     try {
//       if (view === "sign-in") {
//         const result = await signIn.create({
//           strategy: "email_code",
//           identifier: email,
//         });
//         setVerificationToken(result.createdSessionId || "");
//         setView("verify-otp");
//         toast.success("Verification code sent to your email", {
//           icon: <Check className="h-4 w-4 text-green-500" />,
//         });
//       } else {
//         const result = await signUp.create({
//           emailAddress: email,
//           username,
//         });
//         setVerificationToken(result.createdSessionId || "");
//         setView("verify-otp");
//         toast.success("Verification code sent to your email", {
//           icon: <Check className="h-4 w-4 text-green-500" />,
//         });
//       }
//     } catch (error: any) {
//       console.error("Auth error:", error);
//       toast.error(error.errors?.[0]?.message || "Authentication failed. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [email, username, view, isSignInLoaded, isSignUpLoaded, signIn, signUp]);

//   // OTP verification handler
//   const handleOTPVerification = useCallback(async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!signIn) return;

//     setIsLoading(true);

//     try {
//       const result = await signIn.attemptFirstFactor({
//         strategy: "email_code",
//         code: otpCode,
//       });

//       if (result.status === "complete") {
//         await setSignInActive({ session: result.createdSessionId });
//         toast.success("Successfully signed in!", {
//           icon: <Check className="h-4 w-4 text-green-500" />,
//         });
//         onClose();
//         window.location.href = "/";
//       }
//     } catch (error: any) {
//       console.error("OTP verification error:", error);
//       toast.error("Invalid verification code. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [otpCode, signIn, setSignInActive, onClose]);

//   // OAuth sign-in handler
//   const handleOAuthSignIn = useCallback(async (provider: "oauth_google" | "oauth_linkedin_oidc") => {
//     if (!isSignInLoaded || !isSignUpLoaded) {
//       toast.error("Authentication not ready. Please try again.");
//       return;
//     }

//     try {
//       setIsLoading(true);
//       const baseUrl = window.location.origin;

//       const providerConfig: Record<"oauth_google" | "oauth_linkedin_oidc", {
//         strategy: "oauth_google" | "oauth_linkedin_oidc";
//         redirectUrl: string;
//         redirectUrlComplete: string;
//         additionalScopes?: string[];
//       }> = {
//         oauth_google: {
//           strategy: "oauth_google",
//           redirectUrl: `${baseUrl}/sso-callback`,
//           redirectUrlComplete: baseUrl,
//         },
//         oauth_linkedin_oidc: {
//           strategy: "oauth_linkedin_oidc",
//           redirectUrl: `${baseUrl}/sso-callback`,
//           redirectUrlComplete: baseUrl,
//           additionalScopes: [
//             "openid",
//             "profile",
//             "email",
//             "w_member_social"
//           ]
//         }
//       };

//       const config = providerConfig[provider];

//       if (view === "sign-in") {
//         await signIn?.authenticateWithRedirect({
//           ...config,
//         });
//       } else {
//         await signUp?.authenticateWithRedirect({
//           ...config,
//         });
//       }
//     } catch (error: any) {
//       console.error("OAuth error:", error);
//       toast.error("Authentication failed. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [view, isSignInLoaded, isSignUpLoaded, signIn, signUp]);

//   // Get title and subtitle based on current view
//   const getViewContent = () => {
//     switch (view) {
//       case "sign-in":
//         return {
//           title: "Welcome Back",
//           subtitle: "Sign in to continue your coding journey",
//           buttonText: "Send Verification Code"
//         };
//       case "sign-up":
//         return {
//           title: "Join CodeConnect",
//           subtitle: "Create an account to start collaborating",
//           buttonText: "Create Account"
//         };
//       case "verify-otp":
//         return {
//           title: "Verify Your Email",
//           subtitle: "Enter the code we sent to your email",
//           buttonText: "Verify Code"
//         };
//     }
//   };

//   const { title, subtitle, buttonText } = getViewContent();

//   // Animation variants
//   const backdropVariants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1, transition: { duration: 0.3 } },
//     exit: { opacity: 0, transition: { duration: 0.3 } }
//   };

//   const modalVariants = {
//     hidden: { scale: 0.95, opacity: 0, y: 20 },
//     visible: { 
//       scale: 1, 
//       opacity: 1, 
//       y: 0, 
//       transition: { 
//         type: "spring", 
//         duration: 0.6, 
//         bounce: 0.25,
//         delayChildren: 0.1,
//         staggerChildren: 0.1
//       } 
//     },
//     exit: { 
//       scale: 0.95, 
//       opacity: 0, 
//       y: 20, 
//       transition: { 
//         duration: 0.3,
//         ease: "easeInOut"
//       } 
//     }
//   };

//   const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
//     exit: { y: -20, opacity: 0, transition: { duration: 0.3 } }
//   };

//   return (
//     <AnimatePresence mode="wait">
//       {isOpen && (
//         <>
//           {/* Backdrop with enhanced blur */}
//           <motion.div
//             className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
//             onClick={onClose}
//             variants={backdropVariants}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//           />

//           {/* Modal */}
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
//             <motion.div
//               className="relative w-full max-w-md h-auto max-h-[90vh] bg-gray-900/95 rounded-2xl shadow-2xl overflow-hidden border border-gray-800"
//               variants={modalVariants}
//               initial="hidden"
//               animate="visible"
//               exit="exit"
//             >
//               {/* Animated gradient background */}
//               <div className="absolute inset-0 overflow-hidden">
//                 <motion.div
//                   className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"
//                   animate={{
//                     background: [
//                       "linear-gradient(to right bottom, rgba(59,130,246,0.1), rgba(147,51,234,0.1), rgba(236,72,153,0.1))",
//                       "linear-gradient(to right bottom, rgba(236,72,153,0.1), rgba(59,130,246,0.1), rgba(147,51,234,0.1))",
//                     ],
//                   }}
//                   transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
//                   style={{ filter: "blur(100px)" }}
//                 />

//                 {/* Animated particles */}
//                 <div className="absolute inset-0">
//                   {[...Array(6)].map((_, i) => (
//                     <motion.div
//                       key={i}
//                       className="absolute w-1 h-1 rounded-full bg-white/30"
//                       initial={{ 
//                         x: Math.random() * 100 + "%", 
//                         y: Math.random() * 100 + "%", 
//                         opacity: Math.random() * 0.5 + 0.3 
//                       }}
//                       animate={{ 
//                         x: [
//                           Math.random() * 100 + "%", 
//                           Math.random() * 100 + "%", 
//                           Math.random() * 100 + "%"
//                         ],
//                         y: [
//                           Math.random() * 100 + "%", 
//                           Math.random() * 100 + "%", 
//                           Math.random() * 100 + "%"
//                         ],
//                         opacity: [0.3, 0.7, 0.3]
//                       }}
//                       transition={{ 
//                         duration: 10 + Math.random() * 20, 
//                         repeat: Infinity,
//                         repeatType: "reverse"
//                       }}
//                     />
//                   ))}
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="relative flex flex-col items-center justify-between h-full py-8 px-6">
//                 <div className="w-full max-w-sm flex flex-col items-center">
//                   {/* Logo and Title */}
//                   <motion.div
//                     className="flex flex-col items-center mb-8"
//                     variants={itemVariants}
//                   >
//                     <motion.div
//                       animate={{
//                         rotate: [0, 360],
//                       }}
//                       transition={{
//                         duration: 30,
//                         repeat: Infinity,
//                         ease: "linear",
//                       }}
//                       className="relative"
//                     >
//                       <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-lg transform scale-125" />
//                       <div className="relative bg-gray-900/80 rounded-full p-3 border border-gray-700">
//                         <Code className="w-8 h-8 text-blue-400" />
//                       </div>
//                     </motion.div>

//                     <AnimatePresence mode="wait">
//                       <motion.div
//                         key={view}
//                         initial={{ y: 10, opacity: 0 }}
//                         animate={{ y: 0, opacity: 1 }}
//                         exit={{ y: -10, opacity: 0 }}
//                         transition={{ duration: 0.3 }}
//                         className="text-center mt-6"
//                       >
//                         <h1 className={cn(
//                           "text-2xl font-bold bg-clip-text text-transparent transition-all duration-500",
//                           view === "sign-in" 
//                             ? "bg-gradient-to-r from-cyan-400 to-blue-500" 
//                             : view === "sign-up"
//                               ? "bg-gradient-to-r from-purple-400 to-pink-500"
//                               : "bg-gradient-to-r from-emerald-400 to-emerald-500"
//                         )}>
//                           {title}
//                         </h1>
//                         <p className="mt-2 text-gray-300 text-sm">
//                           {subtitle}
//                         </p>
//                       </motion.div>
//                     </AnimatePresence>
//                   </motion.div>

//                   {/* Form */}
//                   <AnimatePresence mode="wait">
//                     <motion.form
//                       key={view}
//                       onSubmit={view === "verify-otp" ? handleOTPVerification : handleEmailSubmit}
//                       className="w-full space-y-5"
//                       variants={itemVariants}
//                       initial="hidden"
//                       animate="visible"
//                       exit="exit"
//                     >
//                       {view === "verify-otp" ? (
//                         <motion.div
//                           variants={itemVariants}
//                           className="space-y-4"
//                         >
//                           <OTPInput
//                             value={otpCode}
//                             onChange={(event) => setOtpCode(event.target.value)}
//                           />
//                           <p className="text-xs text-center text-gray-400">
//                             Didn't receive a code?{" "}
//                             <button
//                               type="button"
//                               onClick={() => setView("sign-in")}
//                               className="text-blue-400 hover:text-blue-300 transition-colors"
//                             >
//                               Try again
//                             </button>
//                           </p>
//                         </motion.div>
//                       ) : (
//                         <>
//                           {view === "sign-up" && (
//                             <motion.div variants={itemVariants}>
//                               <FuturisticInput
//                                 label="Username"
//                                 id="username"
//                                 icon={Globe}
//                                 value={username}
//                                 onChange={(e) => setUsername(e.target.value)}
//                                 placeholder="Choose a username"
//                                 required
//                                 autoFocus
//                               />
//                             </motion.div>
//                           )}

//                           <motion.div variants={itemVariants}>
//                             <FuturisticInput
//                               label="Email"
//                               id="email"
//                               icon={Mail}
//                               type="email"
//                               value={email}
//                               onChange={(e) => setEmail(e.target.value)}
//                               placeholder="Enter your email"
//                               required
//                               autoFocus={view === "sign-in"}
//                             />
//                           </motion.div>
//                         </>
//                       )}

//                       <motion.div 
//                         variants={itemVariants}
//                         className="space-y-4 pt-2"
//                       >
//                         <GlowingButton
//                           className="w-full"
//                           disabled={isLoading || !isSignInLoaded || !isSignUpLoaded}
//                           type="submit"
//                           color={view === "verify-otp" ? "green" : view === "sign-up" ? "purple" : "blue"}
//                         >
//                           <AnimatePresence mode="wait">
//                             {isLoading ? (
//                               <motion.div
//                                 key="loading"
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 exit={{ opacity: 0 }}
//                                 className="flex items-center justify-center"
//                               >
//                                 <Loader2 className="w-5 h-5 animate-spin mr-2" />
//                                 {view === "verify-otp" ? "Verifying..." :
//                                   view === "sign-in" ? "Sending..." : "Creating..."}
//                               </motion.div>
//                             ) : (
//                               <motion.div
//                                 key="default"
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 exit={{ opacity: 0 }}
//                                 className="flex items-center justify-center"
//                               >
//                                 {buttonText}
//                                 <ArrowRight className="ml-2 w-5 h-5" />
//                               </motion.div>
//                             )}
//                           </AnimatePresence>
//                         </GlowingButton>

//                         {view !== "verify-otp" && (
//                           <>
//                             <div className="relative">
//                               <div className="absolute inset-0 flex items-center">
//                                 <div className="w-full border-t border-gray-700/50" />
//                               </div>
//                               <div className="relative flex justify-center text-xs">
//                                 <span className="px-2 bg-gray-900/80 text-gray-400">
//                                   Or continue with
//                                 </span>
//                               </div>
//                             </div>

//                             <div className="grid grid-cols-2 gap-3">
//                               <motion.button
//                                 type="button"
//                                 onClick={() => handleOAuthSignIn("oauth_google")}
//                                 className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800/80 hover:bg-gray-700/90 text-white rounded-lg border border-gray-700/50 transition-all duration-200"
//                                 whileHover={{ scale: 1.02, backgroundColor: "rgba(55, 65, 81, 0.9)" }}
//                                 whileTap={{ scale: 0.98 }}
//                               >
//                                 <Image width={18} height={18} src="/google.svg" alt="Google" className="w-[18px] h-[18px]" />
//                                 <span className="text-sm">Google</span>
//                               </motion.button>

//                               <motion.button
//                                 type="button"
//                                 onClick={() => handleOAuthSignIn("oauth_linkedin_oidc")}
//                                 className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800/80 hover:bg-gray-700/90 text-white rounded-lg border border-gray-700/50 transition-all duration-200"
//                                 whileHover={{ scale: 1.02, backgroundColor: "rgba(55, 65, 81, 0.9)" }}
//                                 whileTap={{ scale: 0.98 }}
//                               >
//                                 <Image width={18} height={18} src="/linkedin.svg" alt="LinkedIn" className="w-[18px] h-[18px]" />
//                                 <span className="text-sm">LinkedIn</span>
//                               </motion.button>
//                             </div>
//                           </>
//                         )}
//                       </motion.div>
//                     </motion.form>
//                   </AnimatePresence>
//                 </div>

//                 {/* Footer */}
//                 {view !== "verify-otp" && (
//                   <motion.div
//                     className="w-full mt-8 pt-4 border-t border-gray-800/50 text-center"
//                     variants={itemVariants}
//                   >
//                     <p className="text-gray-300 text-sm">
//                       {view === "sign-in" ? (
//                         <>
//                           Don't have an account?{" "}
//                           <button
//                             type="button"
//                             onClick={() => setView("sign-up")}
//                             className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
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
//                             className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
//                           >
//                             Sign in
//                           </button>
//                         </>
//                       )}
//                     </p>
//                   </motion.div>
//                 )}
//               </div>
//             </motion.div>
//           </div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// };

// export default AuthModal;


// components/Auth/AuthPage.tsx
"use client"

import type React from "react"

import { useSignIn, useSignUp } from "@clerk/nextjs"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { useState, useCallback, useEffect } from "react"
import { Code, Mail, Loader2, ArrowRight, Globe, Check, ChevronLeft, AlertCircle, Eye, EyeOff } from "lucide-react"
import { GlowingButton } from "@/components/Dashboard/buttons/GlowingButton"
import { FuturisticInput } from "@/components/Dashboard/buttons/FuturisticInput"
import { toast } from "sonner"
import OTPInput from "@/components/Dashboard/buttons/OTPInput"
import Image from "next/image"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

type AuthView = "sign-in" | "sign-up" | "verify-otp"

interface AuthPageProps {
  onSuccessfulAuth?: () => void
}

export default function AuthPage({ onSuccessfulAuth }: AuthPageProps) {
  const router = useRouter()
  const [view, setView] = useState<AuthView>("sign-in")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [verificationToken, setVerificationToken] = useState("")
  const [formErrors, setFormErrors] = useState<{
    email?: string
    username?: string
    password?: string
  }>({})
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn()
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp()

  // Mouse follower effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [mouseX, mouseY])

  // Form validation
  const validateForm = () => {
    const errors: {
      email?: string
      username?: string
      password?: string
    } = {}
    let isValid = true

    // Email validation
    if (!email) {
      errors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address"
      isValid = false
    }

    // Username validation (only for sign-up)
    if (view === "sign-up") {
      if (!username) {
        errors.username = "Username is required"
        isValid = false
      } else if (username.length < 3) {
        errors.username = "Username must be at least 3 characters"
        isValid = false
      }

      // Password validation
      if (!password) {
        errors.password = "Password is required"
        isValid = false
      } else if (password.length < 8) {
        errors.password = "Password must be at least 8 characters"
        isValid = false
      }
    }

    setFormErrors(errors)
    return isValid
  }

  // Memoized form submission handler
  const handleEmailSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) return
      if (!isSignInLoaded || !isSignUpLoaded) return

      setIsLoading(true)

      try {
        if (view === "sign-in") {
          const result = await signIn.create({
            strategy: "email_code",
            identifier: email,
          })
          setVerificationToken(result.createdSessionId || "")
          setView("verify-otp")
          toast.success("Verification code sent to your email", {
            icon: <Check className="h-4 w-4 text-green-500" />,
            position: "top-center",
          })
        } else {
          const result = await signUp.create({
            emailAddress: email,
            username,
            password,
          })
          setVerificationToken(result.createdSessionId || "")
          setView("verify-otp")
          toast.success("Verification code sent to your email", {
            icon: <Check className="h-4 w-4 text-green-500" />,
            position: "top-center",
          })
        }
      } catch (error: any) {
        console.error("Auth error:", error)
        toast.error(error.errors?.[0]?.message || "Authentication failed. Please try again.", {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          position: "top-center",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [email, username, password, view, isSignInLoaded, isSignUpLoaded, signIn, signUp],
  )

  // OTP verification handler
  const handleOTPVerification = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!signIn) return

      setIsLoading(true)

      try {
        const result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code: otpCode,
        })

        if (result.status === "complete") {
          await setSignInActive({ session: result.createdSessionId })
          toast.success("Successfully signed in!", {
            icon: <Check className="h-4 w-4 text-green-500" />,
            position: "top-center",
          })

          // Use onSuccessfulAuth callback or redirect
          if (onSuccessfulAuth) {
            setTimeout(() => {
              onSuccessfulAuth()
            }, 1000)
          } else {
            // Show success animation before redirecting
            setTimeout(() => {
              router.push("/")
            }, 1000)
          }
        }
      } catch (error: any) {
        console.error("OTP verification error:", error)
        toast.error("Invalid verification code. Please try again.", {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          position: "top-center",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [otpCode, signIn, setSignInActive, router, onSuccessfulAuth],
  )

  // OAuth sign-in handler
  const handleOAuthSignIn = useCallback(
    async (provider: "oauth_google" | "oauth_linkedin_oidc") => {
      if (!isSignInLoaded || !isSignUpLoaded) {
        toast.error("Authentication not ready. Please try again.", {
          position: "top-center",
        })
        return
      }

      try {
        setIsLoading(true)
        const baseUrl = window.location.origin

        const providerConfig: Record<
          "oauth_google" | "oauth_linkedin_oidc",
          {
            strategy: "oauth_google" | "oauth_linkedin_oidc"
            redirectUrl: string
            redirectUrlComplete: string
            additionalScopes?: string[]
          }
        > = {
          oauth_google: {
            strategy: "oauth_google",
            redirectUrl: `${baseUrl}/sso-callback`,
            redirectUrlComplete: baseUrl,
          },
          oauth_linkedin_oidc: {
            strategy: "oauth_linkedin_oidc",
            redirectUrl: `${baseUrl}/sso-callback`,
            redirectUrlComplete: baseUrl,
            additionalScopes: ["openid", "profile", "email", "w_member_social"],
          },
        }

        const config = providerConfig[provider]

        if (view === "sign-in") {
          await signIn?.authenticateWithRedirect({
            ...config,
          })
        } else {
          await signUp?.authenticateWithRedirect({
            ...config,
          })
        }
      } catch (error: any) {
        console.error("OAuth error:", error)
        toast.error("Authentication failed. Please try again.", {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          position: "top-center",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [view, isSignInLoaded, isSignUpLoaded, signIn, signUp],
  )

  // Get title and subtitle based on current view
  const getViewContent = () => {
    switch (view) {
      case "sign-in":
        return {
          title: "Welcome Back",
          subtitle: "Sign in to continue your coding journey",
          buttonText: "Send Verification Code",
        }
      case "sign-up":
        return {
          title: "Join CodeConnect",
          subtitle: "Create an account to start collaborating",
          buttonText: "Create Account",
        }
      case "verify-otp":
        return {
          title: "Verify Your Email",
          subtitle: "Enter the code we sent to your email",
          buttonText: "Verify Code",
        }
    }
  }

  const { title, subtitle, buttonText } = getViewContent()

  // Animation variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: i * 0.1,
      },
    }),
    exit: { y: -20, opacity: 0, transition: { duration: 0.3 } },
  }

  // Progress indicator for multi-step form
  const getProgress = () => {
    switch (view) {
      case "sign-in":
        return 33
      case "sign-up":
        return 33
      case "verify-otp":
        return 66
      default:
        return 33
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-950">
      {/* Mouse follower gradient */}
      <motion.div
        className="fixed hidden md:block pointer-events-none w-96 h-96 rounded-full opacity-20 z-0"
        style={{
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.6) 0%, rgba(0, 0, 0, 0) 70%)",
          left: useTransform(mouseX, (value) => value - 192),
          top: useTransform(mouseY, (value) => value - 192),
        }}
      />

      {/* Left side - Auth form */}
      <div className="w-full min-h-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"
            animate={{
              background: [
                "linear-gradient(to right bottom, rgba(59,130,246,0.1), rgba(147,51,234,0.1), rgba(236,72,153,0.1))",
                "linear-gradient(to right bottom, rgba(236,72,153,0.1), rgba(59,130,246,0.1), rgba(147,51,234,0.1))",
              ],
            }}
            transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            style={{ filter: "blur(100px)" }}
          />

          {/* Animated particles */}
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-white/30"
                initial={{
                  x: Math.random() * 100 + "%",
                  y: Math.random() * 100 + "%",
                  opacity: Math.random() * 0.5 + 0.3,
                  scale: Math.random() * 1.5 + 0.5,
                }}
                animate={{
                  x: [Math.random() * 100 + "%", Math.random() * 100 + "%", Math.random() * 100 + "%"],
                  y: [Math.random() * 100 + "%", Math.random() * 100 + "%", Math.random() * 100 + "%"],
                  opacity: [0.3, 0.7, 0.3],
                  scale: [Math.random() * 1.5 + 0.5, Math.random() * 2 + 1, Math.random() * 1.5 + 0.5],
                }}
                transition={{
                  duration: 10 + Math.random() * 20,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
            ))}
          </div>
        </div>

        {/* Back to home link - Only show in fullscreen mode */}
        <motion.div
          className="absolute top-6 left-6 z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link href="/" className="group flex items-center text-gray-300 hover:text-white transition-colors">
            <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
              <ChevronLeft className="w-4 h-4 mr-1 group-hover:text-blue-400 transition-colors" />
            </motion.div>
            <span className="group-hover:text-blue-400 transition-colors">Back to home</span>
          </Link>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${getProgress()}%` }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>

        {/* Content */}
        <div className="relative w-full max-w-md mt-10 flex flex-col items-center z-10">
          {/* Logo and Title */}
          <motion.div
            className="flex flex-col items-center mb-10"
            initial="hidden"
            animate="visible"
            custom={0}
            variants={itemVariants}
          >
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 30,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-lg transform scale-125" />
              <motion.div
                className="relative bg-gray-900/80 rounded-full p-4 border border-gray-700"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
                }}
              >
                <Code className="w-10 h-10 text-blue-400" />
              </motion.div>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center mt-8"
              >
                <h1
                  className={cn(
                    "text-3xl md:text-4xl font-bold bg-clip-text text-transparent transition-all duration-500",
                    view === "sign-in"
                      ? "bg-gradient-to-r from-cyan-400 to-blue-500"
                      : view === "sign-up"
                        ? "bg-gradient-to-r from-purple-400 to-pink-500"
                        : "bg-gradient-to-r from-cyan-400 to-blue-500",
                  )}
                >
                  {title}
                </h1>
                <p className="mt-3 text-gray-300 text-lg">{subtitle}</p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={view}
              onSubmit={view === "verify-otp" ? handleOTPVerification : handleEmailSubmit}
              className="w-full space-y-6"
              initial="hidden"
              animate="visible"
              custom={1}
              variants={itemVariants}
            >
              {view === "verify-otp" ? (
                <motion.div custom={2} variants={itemVariants} className="space-y-5">
                  <div className="text-center mb-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.2,
                      }}
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4"
                    >
                      <Mail className="w-8 h-8 text-emerald-400" />
                    </motion.div>
                    <p className="text-gray-300 mb-1">We've sent a verification code to</p>
                    <p className="font-medium text-white">{email}</p>
                  </div>

                  <OTPInput value={otpCode} onChange={(event) => setOtpCode(event.target.value)} />

                  <div className="flex items-center justify-between text-sm text-gray-400 mt-4">
                    <motion.button
                      type="button"
                      onClick={() => setView("sign-in")}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Try different email
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={() => {
                        setOtpCode("")
                        toast.info("Resending verification code...", {
                          position: "top-center",
                        })
                        // Here you would typically call the resend code API
                      }}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Resend code
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <>
                  {view === "sign-up" && (
                    <motion.div custom={2} variants={itemVariants}>
                      <FuturisticInput
                        label="Username"
                        id="username"
                        icon={Globe}
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value)
                          if (formErrors.username) {
                            setFormErrors({ ...formErrors, username: undefined })
                          }
                        }}
                        placeholder="Choose a username"
                        required
                        autoFocus
                        error={formErrors.username}
                      />
                    </motion.div>
                  )}

                  <motion.div custom={3} variants={itemVariants}>
                    <FuturisticInput
                      label="Email"
                      id="email"
                      icon={Mail}
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (formErrors.email) {
                          setFormErrors({ ...formErrors, email: undefined })
                        }
                      }}
                      placeholder="Enter your email"
                      required
                      autoFocus={view === "sign-in"}
                      error={formErrors.email}
                    />
                  </motion.div>

                  {view === "sign-up" && (
                    <motion.div custom={4} variants={itemVariants} className="relative">
                      <FuturisticInput
                        label="Password"
                        id="password"
                        icon={showPassword ? Eye : EyeOff}
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (formErrors.password) {
                            setFormErrors({ ...formErrors, password: undefined })
                          }
                        }}
                        placeholder="Create a password"
                        required
                        error={formErrors.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-300 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>

                      {password && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-1">
                            {[...Array(4)].map((_, i) => (
                              <motion.div
                                key={i}
                                className={`h-1 flex-1 rounded-full ${i < Math.min(Math.floor(password.length / 2), 4) ? "bg-emerald-500" : "bg-gray-700"
                                  }`}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.2, delay: i * 0.1 }}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-400">
                            {password.length < 8 ? "Password must be at least 8 characters" : "Strong password"}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </>
              )}

              <motion.div custom={5} variants={itemVariants} className="space-y-6 pt-2">
                <GlowingButton
                  className="w-full py-3 text-base"
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
                        {view === "verify-otp" ? "Verifying..." : view === "sign-in" ? "Sending..." : "Creating..."}
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
                        <span className="px-2 bg-gray-900/80 text-gray-400">Or continue with</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <motion.button
                        type="button"
                        onClick={() => handleOAuthSignIn("oauth_google")}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800/80 hover:bg-gray-700/90 text-white rounded-lg border border-gray-700/50 transition-all duration-200"
                        whileHover={{
                          scale: 1.02,
                          backgroundColor: "rgba(55, 65, 81, 0.9)",
                          boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Image width={20} height={20} src="/google.svg" alt="Google" className="w-5 h-5" />
                        <span className="text-base">Google</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        onClick={() => handleOAuthSignIn("oauth_linkedin_oidc")}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800/80 hover:bg-gray-700/90 text-white rounded-lg border border-gray-700/50 transition-all duration-200"
                        whileHover={{
                          scale: 1.02,
                          backgroundColor: "rgba(55, 65, 81, 0.9)",
                          boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Image width={20} height={20} src="/linkedin.svg" alt="LinkedIn" className="w-5 h-5" />
                        <span className="text-base">LinkedIn</span>
                      </motion.button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.form>
          </AnimatePresence>

          {/* Footer */}
          {view !== "verify-otp" && (
            <motion.div
              className="w-full mt-10 pt-6 border-t border-gray-800/50 text-center"
              initial="hidden"
              animate="visible"
              custom={6}
              variants={itemVariants}
            >
              <p className="text-gray-300 text-base">
                {view === "sign-in" ? (
                  <>
                    Don't have an account?{" "}
                    <motion.button
                      type="button"
                      onClick={() => setView("sign-up")}
                      className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign up
                    </motion.button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <motion.button
                      type="button"
                      onClick={() => setView("sign-in")}
                      className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign in
                    </motion.button>
                  </>
                )}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Right side - Feature showcase with background image */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-gray-900 to-gray-950 relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/gradient.png" // Add your image to the public folder
            alt="Code background"
            fill
            className="object-cover opacity-70"
            priority
          />
          {/* Dark overlay gradient for better text readability */}
          {/* <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/70 to-gray-950/90 z-10"></div> */}
        </div>

        {/* Radial gradient effects on top of the image */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.2),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(147,51,234,0.2),transparent_40%)] z-20"></div>

        {/* Animated grid lines */}
        <div className="absolute inset-0 opacity-20 z-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(75, 85, 99, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(75, 85, 99, 0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative flex flex-col justify-center items-center w-full h-full p-12 z-40">
          <div className="max-w-md space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative group"
              whileHover={{ y: -5 }}
            >
              <div className="absolute -inset-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-30 blur group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border-2 border-gray-800 hover:border-blue-500/50 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-white mb-4">Code Together</h2>
                <p className="text-gray-300">
                  Join our community of developers to collaborate on projects, share knowledge, and build amazing
                  applications together.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="relative group"
              whileHover={{ y: -5 }}
            >
              <div className="absolute -inset-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 opacity-30 blur group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border-2 border-gray-800 hover:border-purple-500/50 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-white mb-4">Learn & Grow</h2>
                <p className="text-gray-300">
                  Access tutorials, workshops, and resources to enhance your coding skills and stay updated with the
                  latest technologies.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="relative group"
              whileHover={{ y: -5 }}
            >
              <div className="absolute -inset-2 rounded-xl bg-gradient-to-r from-pink-500 to-blue-500 opacity-30 blur group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border-2 border-gray-800 hover:border-pink-500/50 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-white mb-4">Build Your Portfolio</h2>
                <p className="text-gray-300">
                  Showcase your projects, contributions, and skills to potential employers and the developer community.
                </p>
              </div>
            </motion.div>

            {/* Floating code elements */}

          </div>
        </div>
      </div>
    </div>
  )
}