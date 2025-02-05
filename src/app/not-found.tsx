"use client"
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from "framer-motion";
import Link from "next/link";

function NotFoundContent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-gray-900 to-black text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.h1
          className="text-6xl font-bold text-gray-100"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          404
        </motion.h1>
        <p className="mt-4 text-xl text-gray-400">Oops! Page Not Found.</p>

        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-300 shadow-lg"
            >
              Return Home
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}


export default function NotFound() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  )
}