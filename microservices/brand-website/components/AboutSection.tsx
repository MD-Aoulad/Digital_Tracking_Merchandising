'use client';

import { motion } from 'framer-motion';
import { Award, Globe, Users, TrendingUp, Shield, Zap, Database } from 'lucide-react';

const stats = [
  {
    icon: Users,
    number: '50,000+',
    label: 'Enterprise Users',
    description: 'Active workforce members'
  },
  {
    icon: Globe,
    number: '45+',
    label: 'Countries',
    description: 'Global enterprise presence'
  },
  {
    icon: Award,
    number: '99.99%',
    label: 'Uptime SLA',
    description: 'Enterprise reliability'
  },
  {
    icon: TrendingUp,
    number: '300%',
    label: 'ROI Average',
    description: 'Measured business impact'
  }
];

const achievements = [
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 Type II certified with end-to-end encryption and advanced threat protection.'
  },
  {
    icon: Zap,
    title: 'Performance Excellence',
    description: 'Sub-second response times with 99.99% uptime guaranteed for enterprise clients.'
  },
  {
    icon: Database,
    title: 'Data Compliance',
    description: 'GDPR, HIPAA, and industry-specific compliance with automated audit trails.'
  }
];

export default function AboutSection() {
  return (
    <section className="py-24 section-dark" id="about">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8 gradient-text">
              Trusted by Fortune 500
            </h2>
            <p className="text-xl text-gray-light mb-12 leading-relaxed">
              Digital Tracking is the leading enterprise workforce management platform, 
              trusted by Fortune 500 companies worldwide. We deliver measurable business 
              outcomes through innovative technology and proven methodologies.
            </p>
            
            <div className="space-y-6">
              {achievements.map((achievement, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 bg-primary-blue rounded-xl flex items-center justify-center mt-1">
                    <achievement.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2 text-lg">
                      {achievement.title}
                    </h3>
                    <p className="text-gray-light leading-relaxed">
                      {achievement.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="card-dark text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="w-16 h-16 bg-primary-blue rounded-xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="font-semibold text-white mb-2">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-light">
                    {stat.description}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Enterprise Badges */}
            <motion.div 
              className="mt-12 p-8 bg-black-secondary border border-gray-dark rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold text-white mb-6 text-center">
                Enterprise Certifications
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="text-gray-light text-sm">
                  <div className="font-semibold mb-1">SOC 2</div>
                  <div className="text-xs">Type II</div>
                </div>
                <div className="text-gray-light text-sm">
                  <div className="font-semibold mb-1">ISO 27001</div>
                  <div className="text-xs">Certified</div>
                </div>
                <div className="text-gray-light text-sm">
                  <div className="font-semibold mb-1">GDPR</div>
                  <div className="text-xs">Compliant</div>
                </div>
                <div className="text-gray-light text-sm">
                  <div className="font-semibold mb-1">HIPAA</div>
                  <div className="text-xs">Certified</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 