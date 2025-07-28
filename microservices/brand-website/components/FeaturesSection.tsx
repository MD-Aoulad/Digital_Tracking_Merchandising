'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  BarChart3, 
  MessageSquare, 
  CheckCircle, 
  MapPin,
  Smartphone,
  Zap,
  Database
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level encryption, SOC 2 compliance, and advanced threat protection for your sensitive data.',
    color: 'from-primary-blue to-primary-dark'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Real-time dashboards with predictive insights and customizable KPI tracking for data-driven decisions.',
    color: 'from-accent-gold to-yellow-600'
  },
  {
    icon: MessageSquare,
    title: 'Enterprise Communication',
    description: 'Secure team collaboration with encrypted messaging, file sharing, and role-based access control.',
    color: 'from-primary-blue to-primary-dark'
  },
  {
    icon: CheckCircle,
    title: 'Workflow Automation',
    description: 'Streamline operations with intelligent task assignment, approval workflows, and process optimization.',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: MapPin,
    title: 'GPS Tracking & Geofencing',
    description: 'Advanced location services with real-time tracking, geofencing, and route optimization.',
    color: 'from-accent-gold to-yellow-600'
  },
  {
    icon: Database,
    title: 'Data Management',
    description: 'Comprehensive data warehousing with backup, recovery, and compliance reporting capabilities.',
    color: 'from-primary-blue to-primary-dark'
  },
  {
    icon: Smartphone,
    title: 'Mobile Enterprise',
    description: 'Cross-platform mobile solutions with offline capabilities and enterprise-grade security.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Zap,
    title: 'Real-time Integration',
    description: 'Seamless API integration with ERP, CRM, and third-party systems for unified operations.',
    color: 'from-accent-gold to-yellow-600'
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-24 section-secondary" id="features">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Enterprise Solutions
          </h2>
          <p className="text-xl text-gray-light max-w-4xl mx-auto leading-relaxed">
            Comprehensive workforce management platform designed for enterprise-scale operations. 
            Built with security, scalability, and performance in mind.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="card-dark hover:border-accent transition-all duration-300 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-accent-gold transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-light leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-black-primary border border-gray-dark rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 gradient-text">
              Ready for Enterprise Deployment?
            </h3>
            <p className="text-gray-light mb-8 text-lg">
              Join Fortune 500 companies that trust our platform for their workforce management needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-accent">
                Schedule Demo
              </button>
              <button className="btn-secondary">
                Download Whitepaper
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 