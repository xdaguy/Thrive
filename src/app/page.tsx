'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Wallet, CheckSquare, Heart, RotateCw, Shield, Cloud, Smartphone, Github } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeIn, slideUp, staggerContainer, staggerItem, cardHover } from '@/lib/animations'

export default function LandingPage() {
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    // Mark as animated after mount to prevent re-animation
    setHasAnimated(true)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-[#0A0A0A] safe-area-top">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-block mb-4 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium"
            >
              100% Free Forever • Open Source • Privacy First
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
            >
              Take Control of <br className="hidden md:block" />
              <span className="text-blue-600 dark:text-blue-500">Your Entire Life</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto"
            >
              The all-in-one app for managing finances, tasks, health, and daily routines. 
              Beautiful, powerful, and completely private. Works offline. No account needed.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link 
                href="/start" 
                className="btn-primary w-full sm:w-auto text-center inline-block"
              >
                Start Free
              </Link>
              <motion.a
                href="https://github.com/xdaguy/thrive" 
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className="w-5 h-5" />
                View on GitHub
              </motion.a>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={hasAnimated ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-sm text-gray-500 dark:text-gray-600 mt-4"
            >
              100% Free • No Account Needed • Ready in Seconds
            </motion.p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 bg-white dark:bg-[#0A0A0A]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Everything You Need to Thrive
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Four powerful modules working together seamlessly. Track, organize, and improve every aspect of your life.
          </p>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Finance Card */}
            <motion.div 
              variants={staggerItem}
              whileHover={{ scale: 1.05, y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="card group"
            >
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Finance
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Complete money management. Track income, expenses, and debts with smart categorization and insights.
              </p>
            </motion.div>

            {/* Tasks Card */}
            <motion.div 
              variants={staggerItem}
              whileHover={{ scale: 1.05, y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="card group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CheckSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Tasks
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Smart task management with priorities, categories, and filters. Get more done, stress less.
              </p>
            </motion.div>

            {/* Health Card */}
            <motion.div 
              variants={staggerItem}
              whileHover={{ scale: 1.05, y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="card group"
            >
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Health
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Complete wellness tracking. Monitor weight, log workouts, and track meals all in one place.
              </p>
            </motion.div>

            {/* Routines Card */}
            <motion.div 
              variants={staggerItem}
              whileHover={{ scale: 1.05, y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="card group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <RotateCw className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Routines
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Build powerful daily routines. Create habits that stick with streak tracking and progress visualization.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-[#0A0A0A] dark:to-[#1A1A1A]">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Works Anywhere, Anytime
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Mobile-first design that works perfectly on phone, tablet, and desktop. Install as a PWA for native app experience.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Zero Learning Curve
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Intuitive interface that feels natural from day one. Start tracking your life in seconds, not hours.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <RotateCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Your Data, Your Way
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Export your data anytime in JSON format. Switch apps? Take everything with you. No lock-in, ever.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Lightning Fast
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Everything stored locally means instant loading and zero lag. Even works offline. No internet? No problem.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0">
                    <CheckSquare className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Beautifully Simple
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Clean, modern design with dark mode support. Focus on what matters without clutter or distractions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Completely Free
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No premium plans, no paywalls, no ads. Every feature unlocked forever. Because productivity shouldn't have a price tag.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-[#1A1A1A]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-6"
            >
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </motion.div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Privacy by Design
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
              Your personal data stays personal. No servers, no tracking, no data mining. 
              Just pure, private productivity.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Local First
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Everything runs on your device. Instant performance, complete privacy, works offline.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <Cloud className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Your Cloud
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Optional sync to YOUR cloud. Export anytime. You own your data, literally.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                  <Github className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Open Source
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Fully transparent. Auditable by anyone. Free forever, no hidden fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-blue-600 dark:bg-blue-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Living Better Today
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join others who've taken control. No sign-ups, no hassle, no limits. 
            Just open the app and start thriving.
          </p>
          <Link 
            href="/start"
            className="inline-block bg-white text-blue-600 font-semibold rounded-xl px-8 py-4 hover:bg-blue-50 transition-colors duration-200 active:scale-[0.97]"
          >
            Get Started Free
          </Link>
          <p className="text-sm text-blue-100 mt-4">
            Works on all devices • Install as PWA for best experience
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-gray-800 py-8 safe-area-bottom">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © 2025 Thrive. Open source and free forever.
              </p>
            </div>
            <div className="flex gap-6">
              <a href="https://github.com/xdaguy/thrive" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="View on GitHub">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
