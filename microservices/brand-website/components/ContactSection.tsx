'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Shield, Clock, Globe } from 'lucide-react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section className="py-24 section-dark" id="contact">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8 gradient-text">
              Enterprise Support
            </h2>
            <p className="text-xl text-gray-light mb-12 leading-relaxed">
              Ready to transform your workforce management? Our enterprise team is here to help 
              you implement the right solution for your organization's unique needs.
            </p>

            {/* Contact Methods */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary-blue rounded-xl flex items-center justify-center">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">Enterprise Email</h3>
                  <p className="text-gray-light">enterprise@digitaltracking.com</p>
                  <p className="text-sm text-gray-light">Response within 2 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary-blue rounded-xl flex items-center justify-center">
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">Enterprise Hotline</h3>
                  <p className="text-gray-light">+1 (800) 123-4567</p>
                  <p className="text-sm text-gray-light">24/7 Enterprise Support</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary-blue rounded-xl flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">Global Headquarters</h3>
                  <p className="text-gray-light">123 Enterprise Plaza</p>
                  <p className="text-gray-light">New York, NY 10001</p>
                </div>
              </div>
            </div>

            {/* Enterprise Features */}
            <div className="mt-12 p-8 bg-black-secondary border border-gray-dark rounded-2xl">
              <h3 className="text-xl font-semibold text-white mb-6">Enterprise Benefits</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-accent-gold" />
                  <span className="text-gray-light">Dedicated Account Manager</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-accent-gold" />
                  <span className="text-gray-light">24/7 Priority Support</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-accent-gold" />
                  <span className="text-gray-light">Global Implementation</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="card-dark p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Request Enterprise Demo</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent text-white placeholder-gray-light"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent text-white placeholder-gray-light"
                    placeholder="Enter your business email"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-white mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent text-white placeholder-gray-light"
                    placeholder="Enter your company name"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                    Project Requirements *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-black-primary border border-gray-dark rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent text-white placeholder-gray-light resize-none"
                    placeholder="Describe your workforce management needs..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-accent flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Request Enterprise Demo
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 