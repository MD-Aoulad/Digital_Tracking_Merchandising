'use client';

import { motion } from 'framer-motion';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, Shield, Globe, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black-primary text-white border-t border-gray-dark">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-4 gradient-text">Digital Tracking</h3>
            <p className="text-gray-light mb-6 leading-relaxed">
              Leading enterprise workforce management platform trusted by Fortune 500 companies worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-dark rounded-full flex items-center justify-center hover:bg-primary-blue transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-dark rounded-full flex items-center justify-center hover:bg-primary-blue transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-dark rounded-full flex items-center justify-center hover:bg-primary-blue transition-colors">
                <Facebook size={20} />
              </a>
            </div>
          </motion.div>

          {/* Enterprise Solutions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold mb-4">Enterprise Solutions</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-light hover:text-white transition-colors">Workforce Management</a></li>
              <li><a href="#" className="text-gray-light hover:text-white transition-colors">GPS Tracking</a></li>
              <li><a href="#" className="text-gray-light hover:text-white transition-colors">Analytics & Reporting</a></li>
              <li><a href="#" className="text-gray-light hover:text-white transition-colors">API Integration</a></li>
              <li><a href="#" className="text-gray-light hover:text-white transition-colors">Mobile Applications</a></li>
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#about" className="text-gray-light hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-light hover:text-white transition-colors">Leadership</a></li>
              <li><a href="#" className="text-gray-light hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-light hover:text-white transition-colors">News & Press</a></li>
              <li><a href="#" className="text-gray-light hover:text-white transition-colors">Partners</a></li>
            </ul>
          </motion.div>

          {/* Enterprise Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-4">Enterprise Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-light hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-light hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#contact" className="text-gray-light hover:text-white transition-colors">Contact Sales</a></li>
              <li><a href="#" className="text-gray-light hover:text-white transition-colors">System Status</a></li>
              <li><a href="#" className="text-gray-light hover:text-white transition-colors">Security</a></li>
            </ul>
          </motion.div>
        </div>

        {/* Enterprise Certifications */}
        <motion.div 
          className="border-t border-gray-dark mt-12 pt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Enterprise Certifications</h4>
              <div className="flex items-center space-x-6">
                <div className="flex items-center gap-2 text-gray-light">
                  <Shield size={16} />
                  <span className="text-sm">SOC 2 Type II</span>
                </div>
                <div className="flex items-center gap-2 text-gray-light">
                  <Globe size={16} />
                  <span className="text-sm">ISO 27001</span>
                </div>
                <div className="flex items-center gap-2 text-gray-light">
                  <Award size={16} />
                  <span className="text-sm">GDPR Compliant</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-light text-sm">
                © 2025 Digital Tracking Enterprise. All rights reserved.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div 
          className="border-t border-gray-dark mt-8 pt-8 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="text-gray-light text-sm">
            Enterprise-grade workforce management platform
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-light hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-light hover:text-white text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-light hover:text-white text-sm transition-colors">Cookie Policy</a>
            <a href="#" className="text-gray-light hover:text-white text-sm transition-colors">Security</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
} 