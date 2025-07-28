'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, Shield, Zap, Users } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center gradient-primary overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center text-white">
          {/* Main Heading */}
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Enterprise
            <br />
            <span className="gradient-text">Workforce Management</span>
            <br />
            <span className="text-accent-gold">Platform</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-gray-light leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Transform your retail operations with our comprehensive workforce management solution. 
            Streamline field force coordination, enhance productivity, and drive measurable business growth.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button className="btn-accent flex items-center gap-3">
              <Shield size={20} />
              Start Free Trial
              <ArrowRight size={20} />
            </button>
            <button className="btn-secondary flex items-center gap-3">
              <Play size={20} />
              Watch Demo
            </button>
          </motion.div>

          {/* Enterprise Features */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="card-dark text-center">
              <div className="w-16 h-16 bg-primary-blue rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
              <p className="text-gray-light">Bank-level encryption and compliance standards</p>
            </div>
            <div className="card-dark text-center">
              <div className="w-16 h-16 bg-accent-gold rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap size={32} className="text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-gray-light">Advanced insights and performance metrics</p>
            </div>
            <div className="card-dark text-center">
              <div className="w-16 h-16 bg-primary-blue rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Scalable Solution</h3>
              <p className="text-gray-light">Grows with your business needs</p>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            className="border-t border-gray-dark pt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <p className="text-gray-light mb-4">Trusted by leading enterprises worldwide</p>
            <div className="flex justify-center items-center space-x-8 opacity-50">
              <div className="text-gray-light font-semibold">Fortune 500</div>
              <div className="text-gray-light font-semibold">ISO 27001</div>
              <div className="text-gray-light font-semibold">SOC 2</div>
              <div className="text-gray-light font-semibold">GDPR</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-gray-light rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-light rounded-full mt-2"></div>
        </div>
      </motion.div>
    </section>
  );
} 