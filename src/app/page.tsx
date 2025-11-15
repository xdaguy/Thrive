import Link from 'next/link'
import { Wallet, CheckSquare, Heart, RotateCw, Shield, Cloud, Smartphone, Github } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-[#0A0A0A] safe-area-top">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-4 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
              100% Free • Open Source • Privacy First
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Your Life, Organized <br className="hidden md:block" />
              <span className="text-blue-600 dark:text-blue-500">in One Place</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Track finances, tasks, health, and routines. Your data stays yours, forever. 
              Beautiful, simple, and works offline.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/dashboard" 
                className="btn-primary w-full sm:w-auto text-center"
              >
                Start Free
              </Link>
              <a 
                href="https://github.com/yourusername/thrive" 
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Github className="w-5 h-5" />
                View on GitHub
              </a>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-600 mt-4">
              No credit card required • Takes 30 seconds
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 bg-white dark:bg-[#0A0A0A]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Everything You Need
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Finance Card */}
            <div className="card group hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Finance
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track income, expenses, and debts. Visual spending insights and budget tracking.
              </p>
            </div>

            {/* Tasks Card */}
            <div className="card group hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CheckSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Tasks
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Daily tasks with smart reminders. Never miss what matters most.
              </p>
            </div>

            {/* Health Card */}
            <div className="card group hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Health
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Weight, exercise, and meal logging. Track your wellness journey.
              </p>
            </div>

            {/* Routines Card */}
            <div className="card group hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <RotateCw className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Routines
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Build lasting habits. Streak tracking and daily motivation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-[#1A1A1A]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Your Data, Your Control
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
              We believe your personal data should stay personal. That's why Thrive is built differently.
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
                  Data stored on your device. Works offline, lightning fast.
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
                  Sync to YOUR Google Drive. No servers, no middleman.
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
                  Transparent code. Auditable. Community-driven.
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
            Ready to Thrive?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands taking control of their life. Start organizing everything in one beautiful app.
          </p>
          <Link 
            href="/dashboard"
            className="inline-block bg-white text-blue-600 font-semibold rounded-xl px-8 py-4 hover:bg-blue-50 transition-colors duration-200 active:scale-[0.97]"
          >
            Get Started Free
          </Link>
          <p className="text-sm text-blue-100 mt-4">
            No sign-up required • Start using immediately
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-gray-800 py-8 safe-area-bottom">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © 2024 Thrive. Open source and free forever.
              </p>
            </div>
            <div className="flex gap-6">
              <a href="https://github.com/yourusername/thrive" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
