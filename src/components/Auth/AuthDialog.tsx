"use client"

import type React from "react"
import { useSignIn, useSignUp } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useCallback, useEffect } from "react"
import { Code, Mail, Check, ChevronLeft, AlertCircle, Eye, EyeOff, Zap, User, Shield, Globe2 } from "lucide-react"
import { GlowingButton } from "@/components/Dashboard/buttons/GlowingButton"
import { FuturisticInput } from "@/components/Dashboard/buttons/FuturisticInput"
import { toast } from "sonner"
import OTPInput from "@/components/Dashboard/buttons/OTPInput"
import IOSLoader from "@/components/Dashboard/buttons/IOSLoader"
import Image from "next/image"
import { useRouter } from "next/navigation"
import WaterGradient from "../Dashboard/animations/AnimatedGradient"

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
  const [loadingStates, setLoadingStates] = useState({
    google: false,
    linkedin: false
  });

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
      const providerKey = provider === "oauth_google" ? "google" : "linkedin"
      setLoadingStates(prev => ({ ...prev, [providerKey]: true }))

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
        setIsLoading(false);
        const providerKey = provider === "oauth_google" ? "google" : "linkedin"
        setLoadingStates(prev => ({ ...prev, [providerKey]: false }));
      }
    },
    [view, isSignInLoaded, isSignUpLoaded, signIn, signUp],
  )

  // Get title and subtitle based on current view
  const getViewContent = () => {
    switch (view) {
      case "sign-in":
        return {
          title: "Codeconnect",
          subtitle: "Sign in to continue your coding journey",
          buttonText: "Sign In",
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
      {/* Left side - Auth form */}
      <div className="w-full min-h-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 relative overflow-hidden">
        {/* Animated background */}
        <motion.div
          className="fixed pointer-events-none w-96 h-96 rounded-full opacity-30 z-0 blur-3xl bg-black"
        />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
        </div>

        {/* Back to home link */}
        <motion.div
          className="absolute top-6 left-6 z-20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <a href="/" className="group flex items-center text-gray-300 hover:text-white transition-all duration-300">
            <motion.div
              className="p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mr-3"
              whileHover={{ x: -3, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
            </motion.div>
          </a>
        </motion.div>

        {/* Main content card */}
        <motion.div
          className="relative w-full max-w-lg px-4 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Glass card container */}
          <div className="relative">
            {/* Main card */}
            <div className="relative rounded-2xl px-6 md:px-8 shadow-2xl">
              {/* Logo and Title Section */}
              <motion.div
                className="flex flex-col items-center mb-2"
                initial="hidden"
                animate="visible"
                custom={0}
                variants={itemVariants}
              >
                {/* Enhanced Logo */}
                <motion.div
                  className="flex flex-col items-center mb-4"
                  initial="hidden"
                  animate="visible"
                  custom={0}
                  variants={itemVariants}
                >
                  <motion.div
                    className="relative"
                  >
                    <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md transform scale-125" />
                    <motion.div
                      className="relative bg-gray-900/80 rounded-full p-3 border border-gray-700"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
                      }}
                    >
                      <Code className="w-6 h-6 text-blue-400" />
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Title with enhanced animations */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={view}
                    initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -20, opacity: 0, filter: "blur(10px)" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-center"
                  >
                    <h1 className={`text-2xl md:text-3xl font-semibold bg-clip-text text-transparent mb-2 transition-all duration-500 ${view === "sign-in"
                      ? "bg-gradient-to-r from-cyan-500  to-purple-600"
                      : view === "sign-up"
                        ? "bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-400"
                        : "bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500"
                      }`}>
                      {title}
                    </h1>
                    <p className="text-gray-400 text-sm font-normal mb-10">{subtitle}</p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
              {view !== "verify-otp" && (
                <>
                  <div className="grid grid-rows-2 gap-2.5 mb-3">
                    <motion.button
                      type="button"
                      onClick={() => handleOAuthSignIn("oauth_google")}
                      disabled={loadingStates.google || loadingStates.linkedin}
                      className={`flex items-center justify-center gap-2 px-3 py-3 rounded-full border transition-all duration-300 backdrop-blur-sm ${loadingStates.google
                        ? 'border-blue-500/50 text-white cursor-not-allowed'
                        : loadingStates.linkedin
                          ? 'bg-gray-800/30 border-gray-600/30 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-800/50 hover:bg-gray-700/60 text-white border-gray-600/50'
                        }`}
                      whileHover={!loadingStates.google && !loadingStates.linkedin ? {
                        boxShadow: "0 8px 25px rgba(59, 130, 246, 0.15)"
                      } : {}}
                      whileTap={!loadingStates.google && !loadingStates.linkedin ? { scale: 0.98 } : {}}
                    >
                      <div className="w-4 h-4 rounded-full flex items-center justify-center">
                        {loadingStates.google ? (
                          <IOSLoader size="small" color="white" />
                        ) : (
                          <Image width={16} height={16} src="/google.svg" alt="Google" className="w-4 h-4" />
                        )}
                      </div>
                      <span className="font-medium text-sm">
                        {loadingStates.google ? '' : 'Log in with Google'}
                      </span>
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={() => handleOAuthSignIn("oauth_linkedin_oidc")}
                      disabled={loadingStates.google || loadingStates.linkedin}
                     className={`flex items-center justify-center gap-2 px-3 py-3 rounded-full border transition-all duration-300 backdrop-blur-sm ${loadingStates.google
                        ? 'border-blue-500/50 text-white cursor-not-allowed'
                        : loadingStates.linkedin
                          ? 'bg-gray-800/30 border-gray-600/30 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-800/50 hover:bg-gray-700/60 text-white border-gray-600/50'
                        }`}
                      whileHover={!loadingStates.google && !loadingStates.linkedin ? {
                        boxShadow: "0 8px 25px rgba(59, 130, 246, 0.15)"
                      } : {}}
                      whileTap={!loadingStates.google && !loadingStates.linkedin ? { scale: 0.98 } : {}}
                    >
                      <div className="w-4 h-4 rounded-sm flex items-center justify-center">
                        {loadingStates.linkedin ? (
                          <IOSLoader size="small" color="white" />
                        ) : (
                          <Image width={16} height={16} src="/linkedin.svg" alt="LinkedIn" className="w-4 h-4" />
                        )}
                      </div>
                      <span className="font-medium text-sm">
                        {loadingStates.linkedin ? '' : 'Log in with LinkedIn'}
                      </span>
                    </motion.button>
                  </div>
                  <div className="relative my-3">
                    <div className="relative flex justify-center">
                      <span className="px-3 text-xs text-gray-500 font-normal">
                        Or
                      </span>
                    </div>
                  </div>
                </>
              )}
              {/* Form Section */}
              <AnimatePresence mode="wait">
                <motion.form
                  key={view}
                  onSubmit={view === "verify-otp" ? handleOTPVerification : handleEmailSubmit}
                  className="space-y-2.5 mt-3"
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                >
                  {view === "verify-otp" ? (
                    <motion.div custom={2} variants={itemVariants} className="space-y-4">
                      {/* OTP Info */}
                      <div className="text-center mb-4">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 mb-3"
                        >
                          <Shield className="w-6 h-6 text-emerald-400" />
                        </motion.div>
                        <p className="text-gray-400 text-sm mb-1">We've sent a verification code to</p>
                        <p className="font-medium text-white text-base">{email}</p>
                      </div>

                      <OTPInput value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />

                      {/* OTP Actions */}
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
                        <motion.button
                          type="button"
                          onClick={() => setView("sign-in")}
                          className="text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Mail className="w-3 h-3" />
                          Try different email
                        </motion.button>

                        <motion.button
                          type="button"
                          onClick={() => setOtpCode("")}
                          className="text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Zap className="w-3 h-3" />
                          Resend code
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-2.5">
                      {view === "sign-up" && (
                        <motion.div custom={2} variants={itemVariants}>
                          <FuturisticInput
                            label="Username"
                            id="username"
                            icon={User}
                            value={username}
                            onChange={(e) => {
                              setUsername(e.target.value);
                              if (formErrors.username) {
                                setFormErrors({ ...formErrors, username: undefined });
                              }
                            }}
                            placeholder="Choose a unique username"
                            required
                            autoFocus
                            error={formErrors.username}
                          />
                        </motion.div>
                      )}

                      <motion.div custom={3} variants={itemVariants}>
                        <FuturisticInput
                          className="rounded-full"
                          label="Email"
                          id="email"
                          icon={Mail}
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (formErrors.email) {
                              setFormErrors({ ...formErrors, email: undefined });
                            }
                          }}
                          placeholder="Enter your email address"
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
                            icon={Globe2}
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (formErrors.password) {
                                setFormErrors({ ...formErrors, password: undefined });
                              }
                            }}
                            placeholder="Create a strong password"
                            required
                            error={formErrors.password}
                          />

                          <motion.button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-700/50"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </motion.button>

                          {/* Enhanced Password Strength Indicator */}
                          {password && (
                            <motion.div
                              className="mt-3"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <div className="flex gap-1 mb-2">
                                {[...Array(4)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    className={`h-1.5 flex-1 rounded-full ${i < Math.min(Math.floor(password.length / 2), 4)
                                      ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                                      : 'bg-gray-700'
                                      }`}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 0.3, delay: i * 0.1 }}
                                  />
                                ))}
                              </div>
                              <p className={`text-xs flex items-center gap-1 ${password.length < 8 ? 'text-amber-400' : 'text-emerald-400'
                                }`}>
                                {password.length < 8 ? (
                                  <>
                                    <AlertCircle className="w-3 h-3" />
                                    Password must be at least 8 characters
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-3 h-3" />
                                    Strong password
                                  </>
                                )}
                              </p>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Submit Button and OAuth Section */}
                  <motion.div custom={5} variants={itemVariants} className="pt-3">
                    <GlowingButton
                      className="w-full py-2.5 text-base"
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
                            className="flex items-center justify-center gap-3"
                          >
                            <IOSLoader size="small" color="white" />
                            <span>
                              {view === "verify-otp" ? "Verifying..." : view === "sign-in" ? "" : "Creating account..."}
                            </span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="default"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center gap-3"
                          >
                            <span>{buttonText}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </GlowingButton>

                    {/* OAuth Section */}

                  </motion.div>
                </motion.form>
              </AnimatePresence>

              {/* Footer */}
              {view !== "verify-otp" && (
                <motion.div
                  className="mt-6 pt-4 border-t border-gray-700/50 text-center"
                  initial="hidden"
                  animate="visible"
                  custom={6}
                  variants={itemVariants}
                >
                  <p className="text-gray-400 text-sm">
                    {view === "sign-in" ? (
                      <>
                        Don't have an account?{" "}
                        <motion.button
                          type="button"
                          onClick={() => setView("sign-up")}
                          className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
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
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
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
        </motion.div>
      </div>

      {/* Right side - Content */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-gray-900 to-gray-950 relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/astronaut5.jpeg" // Add your image to the public folder 
            alt="Code background"
            fill
            className="object-cover opacity-100"
            priority
          />
        </div>
      </div>
    </div>
  )
}