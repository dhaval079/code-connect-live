import { useSignIn, useSignUp } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import AdvancedCursor from "../Dashboard/Cursor";
import { Code, Mail, Loader2, ArrowRight, Globe, Check, Atom, Codepen, CodeXml } from 'lucide-react';
import { GlowingButton } from "../Dashboard/buttons/GlowingButton";
import { FuturisticInput } from "../Dashboard/buttons/FuturisticInput";
import { toast } from "sonner";
import { reduce } from "lodash";
import { redirect } from "next/dist/server/api-utils";
import OTPInput from "../Dashboard/buttons/OTPInput";
import { withTV } from "tailwind-variants/dist/transformer.js";
import { withRouter } from "next/router";
import Image from "next/image";

const EnhancedGradientBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0">
        <div className="floating-orbs" />
      </div>

      {/* Additional moving elements with bottom origination */}
      <div className="absolute inset-0">
        <div className="gradient-shape shape1" />
        <div className="gradient-shape shape2" />
        <div className="gradient-shape shape3" />
        <div className="gradient-shape shape4" />
        <div className="gradient-shape shape5" />
      </div>

      <style jsx>{`
        .floating-orbs::before,
        .floating-orbs::after {
          content: '';
          position: absolute;
          z-index: -1;
          opacity: 0.6;
          filter: blur(90px);
          border-radius: 50%;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          animation-iteration-count: infinite;
        }

        .floating-orbs::before {
          background: conic-gradient(
            from 90deg at 50% 50%,
            #ff8b7e 0deg,
            #e24e6b 160deg,
            #7ed2da 120deg,
            #8bdce0 55deg,
            transparent 360deg
          );
          width: 20vw;
          height: 20vw;
          left: 25vw;
          animation: riseAndFall 8s infinite;
        }

        .floating-orbs::after {
          background: conic-gradient(
            from 10deg at 50% 50%,
            #eb7494 0deg,
            #ae77b2 55deg,
            #97b5da 120deg,
            #0099ca 160deg,
            transparent 360deg
          );
          width: 200px;
          height: 400px;
          right: 10vw;
          animation: riseAndFloat 7s infinite;
        }

        .gradient-shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.5;
        }

        .shape1 {
          background: conic-gradient(
            from 180deg at 50% 50%,
            #16abff33 0deg,
            #0885ff33 55deg,
            #54d6ff33 120deg,
            #0071ff33 160deg,
            transparent 360deg
          );
          width: 10vw;
          height: 10vw;
          left: 10vw;
          animation: ascendAndRotate 9s ease-in-out infinite;
        }

        .shape2 {
          background: conic-gradient(
            from 90deg at 50% 50%,
            #ff8b7e 0deg,
            #e24e6b 160deg,
            #7ed2da 120deg,
            #8bdce0 55deg,
            transparent 360deg
          );
          width: 15vw;
          height: 15vw;
          right: 5vw;
          animation: floatUpAndAround 8s ease-in-out infinite;
        }

        .shape3 {
          background: conic-gradient(
            from 10deg at 50% 50%,
            #eb7494 0deg,
            #ae77b2 55deg,
            #97b5da 120deg,
            #0099ca 160deg,
            transparent 360deg
          );
          width: 10vw;
          height: 10vw;
          left: 50%;
          transform: translateX(-50%);
          animation: riseAndPulse 10s ease-in-out infinite;
        }

        .shape4 {
          background: conic-gradient(
            from 45deg at 50% 50%,
            #4f46e533 0deg,
            #7c3aed33 55deg,
            #a855f733 120deg,
            #6366f133 160deg,
            transparent 360deg
          );
          width: 15vw;
          height: 15vw;
          left: 20vw;
          animation: slowRiseAndSpin 12s ease-in-out infinite;
        }

        .shape5 {
          background: conic-gradient(
            from 120deg at 50% 50%,
            #f472b633 0deg,
            #ec489933 55deg,
            #db277733 120deg,
            #bf125d33 160deg,
            transparent 360deg
          );
          width: 18vw;
          height: 18vw;
          bottom: -25vh;
          right: 15vw;
          animation: floatUpAndDrift 11s ease-in-out infinite;
        }

        @keyframes riseAndFall {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-40vh) scale(1.2);
            opacity: 0.8;
          }
        }

        @keyframes riseAndFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-20vw, -35vh) scale(1.1);
          }
        }

        @keyframes ascendAndRotate {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-45vh) rotate(180deg);
          }
        }

        @keyframes floatUpAndAround {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(-10vw, -30vh) rotate(120deg);
          }
          66% {
            transform: translate(10vw, -40vh) rotate(240deg);
          }
        }

        @keyframes riseAndPulse {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-35vh) scale(1.3);
            opacity: 0.7;
          }
        }

        @keyframes slowRiseAndSpin {
          0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          50% {
            transform: translateY(-25vh) rotate(240deg) scale(1.2);
          }
        }

        @keyframes floatUpAndDrift {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          50% {
            transform: translate(-15vw, -30vh) rotate(-180deg);
          }
        }
      `}</style>
    </div>
  );
};

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
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
        toast.success("OTP code sent to your email!");
      } else {
        const result = await signUp.create({
          emailAddress: email,
          username,
        });
        setVerificationToken(result.createdSessionId || "");
        setView("verify-otp");
        toast.success("OTP code sent to your email!");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.errors?.[0]?.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


const handleOTPVerification = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    if (view === "verify-otp" && signIn) {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: otpCode,
      });

      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        toast.success("Successfully signed in!");
        onClose();
        window.location.href = "/";
      }
    }
  } catch (error: any) {
    console.error("OTP verification error:", error);
    toast.error("Invalid OTP code. Please try again.");
  } finally {
    setIsLoading(false);
  }
};



  // const handleOAuthSignIn = async (provider: "oauth_google" | "oauth_linkedin_oidc") => {
  //   try {
  //     setIsLoading(true);
  //     const baseUrl = window.location.origin;

  //     if (view === "sign-in") {
  //       await signIn?.authenticateWithRedirect({
  //         strategy: provider,
  //         redirectUrl: `${baseUrl}/sso-callback`,
  //         redirectUrlComplete: `${baseUrl}`,
  //         skipAccountCreation: true // Skip additional info collection
  //       });
  //     } else {
  //       await signUp?.authenticateWithRedirect({
  //         strategy: provider,
  //         redirectUrl: `${baseUrl}/sso-callback`,
  //         redirectUrlComplete: `${baseUrl}`,
  //         skipAccountCreation: true, // Skip additional info collection
  //         skipPasswordCreation: true, // Skip password creation
  //         skipSignUpVerification: true // Skip email verification
  //       });
  //     }
  //   } catch (error) {
  //     console.error("OAuth error:", error);
  //     toast.error("Failed to authenticate. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  const handleOAuthSignIn = async (provider: "oauth_google" | "oauth_linkedin_oidc") => {
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
  };

  return (
    <AnimatePresence mode="wait">
      <AdvancedCursor />
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop with enhanced blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-lg"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.7, bounce: 0.3 }}
            className="relative w-full max-w-3xl  h-[80vh] bg-gray-900/90 rounded-2xl shadow-2xl overflow-hidden border border-gray-800"
          >
              {/* <EnhancedGradientBackground /> */}

            {/* Animated gradient background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"
              animate={{
                background: [
                  "linear-gradient(to right bottom, rgba(59,130,246,0.1), rgba(147,51,234,0.1), rgba(236,72,153,0.1))",
                  "linear-gradient(to right bottom, rgba(236,72,153,0.1), rgba(59,130,246,0.1), rgba(147,51,234,0.1))",
                ],
              }}
              transition={{ duration: 10, repeat: Infinity }}
              style={{ filter: "blur(100px)" }}
            />

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center p-8">
              {/* Logo and Title */}
              <motion.div
                className="flex flex-col items-center mb-8"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
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
                >
                  <Code className="w-12 h-12 text-blue-500" />
                </motion.div>
                <h1 className={`mt-4 text-3xl font-bold bg-clip-text text-transparent ${
    view === "sign-in" 
      ? "bg-gradient-to-r from-cyan-500 to-purple-500" : "bg-white"
  }`}>
    {view === "verify-otp" ? "Enter OTP Code" :
    view === "sign-in" ? "Welcome Back" : "Join CodeConnect"}
  </h1>
                <p className="mt-2 text-white">
                  {view === "verify-otp" ? "Check your email for the verification code" :
                    view === "sign-in" ? "Sign in to continue your coding journey" :
                      "Create an account to start collaborating"}
                </p>
              </motion.div>

              {/* Form */}
              <motion.form
                onSubmit={view === "verify-otp" ? handleOTPVerification : handleEmailSubmit}
                className="w-full max-w-md space-y-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {view === "verify-otp" ? (
                  <OTPInput
                    value={otpCode}
                    onChange={(e:any) => setOtpCode(e.target.value)}
                  />
                ) : (
                  <>
                    {view === "sign-up" && (
                      <FuturisticInput
                        label="Username"
                        id="username"
                        icon={Globe}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username"
                        required
                      />
                    )}

                    <FuturisticInput
                      label="Email"
                      id="email"
                      icon={Mail}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </>
                )}

                <div className="space-y-4">
                  <GlowingButton
                    className="w-full"
                    disabled={isLoading || !isSignInLoaded || !isSignUpLoaded}
                    type="submit"
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
                            view === "sign-in" ? "Sending OTP..." : "Creating account..."}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="default"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center"
                        >
                          {view === "verify-otp" ? "Verify OTP" :
                            view === "sign-in" ? "Send OTP" : "Create Account"}
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlowingButton>

                  {view !== "verify-otp" && (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2  text-gray-300">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <motion.button
                          type="button"
                          onClick={() => handleOAuthSignIn("oauth_google")}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-all duration-200"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Image width={5} height={5} src="/google.svg" alt="Google" className="w-5 h-5" />
                          Google
                        </motion.button>

                        <motion.button
                          type="button"
                          onClick={() => handleOAuthSignIn("oauth_linkedin_oidc")}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-all duration-200"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Image width={5} height={5} src="/linkedin.svg" alt="LinkedIn" className="w-5 h-5" />
                          LinkedIn
                        </motion.button>
                      </div>
                    </>
                  )}
                </div>
              </motion.form>

              {/* Footer */}
              {view !== "verify-otp" && (
                <motion.div
                  className="absolute mt-4 bottom-0 left-0 right-0 p-6 border-t border-gray-800 text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <p className="text-gray-300 mt-4">
                    {view === "sign-in" ? (
                      <>
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setView("sign-up")}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
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
                          className="text-blue-400 hover:text-blue-300 transition-colors"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;