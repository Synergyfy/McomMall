'use client';
import {
  Phone,
  MapPin,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from 'lucide-react';
import Link from 'next/link';
import Newsletter from '@/app/components/Newsletter';

const McomMallLogo = ({ className = '' }) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M10 10 L 25 25 L 40 10 L 40 40 L 25 25 L 10 40 Z"
      stroke="#f58220"
      strokeWidth="4"
      fill="none"
    />
    <path
      d="M10 10 L 25 25 L 40 10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <Newsletter />
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16 px-4 md:px-8 lg:px-16">
        {/* Column 1: McomMall Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white">
            <McomMallLogo />
            <span className="text-2xl font-bold">McomMall</span>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Phone size={18} className="mt-1 text-[#f58220]" />
              <span>Call Us: +(323) 750-1234</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={18} className="mt-1 text-[#f58220]" />
              <span>Address: +7011 Vermont Ave, Los Angeles, CA 90044</span>
            </li>
            <li className="flex items-start gap-3">
              <Mail size={18} className="mt-1 text-[#f58220]" />
              <span>Mail Us: hello@mcommall.com</span>
            </li>
          </ul>
        </div>

        {/* Column 2: Popular Categories */}
        <div className="z-50">
          <h3 className="text-xl font-bold mb-4 text-white">
            Popular Categories
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/contact-us"
                className="hover:text-[#f58220] transition-colors"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="hover:text-[#f58220] transition-colors"
              >
                Our FAQ
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="hover:text-[#f58220] transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-[#f58220] transition-colors">
                Registration
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Quick Links */}
        <div className="z-50">
          <h3 className="text-xl font-bold mb-4 text-white">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/about-us"
                className="hover:text-[#f58220] transition-colors"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="hover:text-[#f58220] transition-colors"
              >
                Our Blog
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-[#f58220] transition-colors">
                Add Listing
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Follow Us */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-white">Follow Us On</h3>
          <p className="mb-4 text-sm">
            Once you&apos;ve settled on a business, learn more about it.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="bg-slate-700 p-2 rounded-full hover:bg-[#f58220] text-white transition-colors"
            >
              <Facebook size={20} />
            </a>
            <a
              href="#"
              className="bg-slate-700 p-2 rounded-full hover:bg-[#f58220] text-white transition-colors"
            >
              <Twitter size={20} />
            </a>
            <a
              href="#"
              className="bg-slate-700 p-2 rounded-full hover:bg-[#f58220] text-white transition-colors"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              className="bg-slate-700 p-2 rounded-full hover:bg-[#f58220] text-white transition-colors"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
