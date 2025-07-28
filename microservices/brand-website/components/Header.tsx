'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-black-primary border-b border-gray-dark sticky top-0 z-50 shadow-professional">
      <div className="container-custom">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold gradient-text">
              Digital Tracking
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-light hover:text-white transition-colors duration-300 font-medium">
              Solutions
            </a>
            <a href="#pricing" className="text-gray-light hover:text-white transition-colors duration-300 font-medium">
              Enterprise
            </a>
            <a href="#about" className="text-gray-light hover:text-white transition-colors duration-300 font-medium">
              About
            </a>
            <a href="#contact" className="text-gray-light hover:text-white transition-colors duration-300 font-medium">
              Contact
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex space-x-4">
            <button className="btn-secondary">
              Sign In
            </button>
            <button className="btn-primary">
              Get Demo
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-light hover:text-white transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-gray-dark bg-black-secondary">
            <nav className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-light hover:text-white transition-colors duration-300 font-medium">
                Solutions
              </a>
              <a href="#pricing" className="text-gray-light hover:text-white transition-colors duration-300 font-medium">
                Enterprise
              </a>
              <a href="#about" className="text-gray-light hover:text-white transition-colors duration-300 font-medium">
                About
              </a>
              <a href="#contact" className="text-gray-light hover:text-white transition-colors duration-300 font-medium">
                Contact
              </a>
              <div className="flex flex-col space-y-3 pt-4">
                <button className="btn-secondary">
                  Sign In
                </button>
                <button className="btn-primary">
                  Get Demo
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 