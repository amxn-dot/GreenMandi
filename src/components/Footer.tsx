
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white pt-12 pb-6 shadow-2xl">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-white">GreenMandi</h3>
            <p className="mb-4 text-gray-100 font-semibold leading-relaxed">
              Connecting farmers directly with customers across India. Fresh produce straight from farm to table.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-green-400 transition-colors transform hover:scale-110">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-white hover:text-green-400 transition-colors transform hover:scale-110">
                <Twitter size={24} />
              </a>
              <a href="#" className="text-white hover:text-green-400 transition-colors transform hover:scale-110">
                <Instagram size={24} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-xl font-bold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-100 hover:text-green-400 transition-colors font-semibold hover:underline">Home</Link></li>
              <li><Link to="/products" className="text-gray-100 hover:text-green-400 transition-colors font-semibold hover:underline">Products</Link></li>
              <li><Link to="/farmers" className="text-gray-100 hover:text-green-400 transition-colors font-semibold hover:underline">Our Farmers</Link></li>
              <li><Link to="/about" className="text-gray-100 hover:text-green-400 transition-colors font-semibold hover:underline">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-100 hover:text-green-400 transition-colors font-semibold hover:underline">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xl font-bold mb-4 text-white">Customer Service</h4>
            <ul className="space-y-3">
              <li><Link to="/faq" className="text-gray-100 hover:text-green-400 transition-colors font-semibold hover:underline">FAQ</Link></li>
              <li><Link to="/shipping" className="text-gray-100 hover:text-green-400 transition-colors font-semibold hover:underline">Shipping Policy</Link></li>
              <li><Link to="/returns" className="text-gray-100 hover:text-green-400 transition-colors font-semibold hover:underline">Returns & Refunds</Link></li>
              <li><Link to="/privacy" className="text-gray-100 hover:text-green-400 transition-colors font-semibold hover:underline">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-100 hover:text-green-400 transition-colors font-semibold hover:underline">Terms & Conditions</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xl font-bold mb-4 text-white">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={22} className="flex-shrink-0 text-green-400 mt-1" />
                <span className="text-gray-100 font-semibold leading-relaxed">123 Green Street, Bangalore, Karnataka, India - 560001</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={22} className="flex-shrink-0 text-green-400" />
                <span className="text-gray-100 font-semibold">+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={22} className="flex-shrink-0 text-green-400" />
                <span className="text-gray-100 font-semibold">support@greenmandi.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-6">
          <p className="text-center text-gray-100 font-semibold">
            © {new Date().getFullYear()} GreenMandi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
