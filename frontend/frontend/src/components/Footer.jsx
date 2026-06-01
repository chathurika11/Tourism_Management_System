import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

const Footer = () => {
  // Placeholder actions for social media buttons
  const handleSocialClick = (platform) => {
    console.log(`Open ${platform} page (link to be added later)`);
    // In the future, you can replace this with actual navigation logic
  };

  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <div className="flex flex-col items-start mb-2">
              <img src="/img/logo.png" alt="SerendiGo Logo" className="h-20 w-auto object-contain mb-2 bg-white px-2 py-1 rounded-lg" />
            </div>
            <p className="text-secondary text-sm mb-4">DISCOVER · EXPERIENCE · BELONG</p>
            <p className="text-sm opacity-80">Experience Sri Lanka beautifully with authentic travel experiences.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/" className="hover:text-secondary transition">Home</Link></li>
              <li><Link to="/tours" className="hover:text-secondary transition">Tour Packages</Link></li>
              <li><Link to="/about" className="hover:text-secondary transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-secondary transition">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li className="flex items-center gap-2"><Phone size={16} /> +94 11 234 5678</li>
              <li className="flex items-center gap-2"><Mail size={16} /> hello@serendigo.com</li>
              <li className="flex items-center gap-2"><MapPin size={16} /> Colombo, Sri Lanka</li>
            </ul>
          </div>

          {/* Social Media Buttons - Now using <button> instead of invalid <a> tags */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleSocialClick('Facebook')}
                className="hover:text-secondary transition cursor-pointer bg-transparent border-none p-0"
                aria-label="Facebook (coming soon)"
              >
                <Globe size={20} />
              </button>
              {/* Add more buttons here as needed */}
            </div>
            <p className="text-xs opacity-60 mt-4">Sri Lanka. Endless Stories.</p>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-xs opacity-60">
          <p>&copy; 2025 SerendiGo. All rights reserved. Discover · Experience · Belong</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;