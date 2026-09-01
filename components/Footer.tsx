'use client';

import React from 'react';
import { Phone, MapPin, Mail, Clock, ShieldCheck, Sparkles, Navigation, Heart } from 'lucide-react';
import { SUPPORT_PHONE, GUEST_HOUSE_ADDRESS, GUEST_HOUSE_EMAIL } from '@/lib/data';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenBookingModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenBookingModal }) => {
  return (
    <footer id="main-footer" className="bg-[#141211] text-stone-300 border-t border-amber-950/60 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Support Hotline Banner Hero */}
        <div className="bg-gradient-to-r from-stone-900 via-amber-950/60 to-stone-900 border border-amber-800/40 rounded-2xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 max-w-xl">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400">24/7 Guest Services & Administrative Hotline</span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-stone-100">
              Need assistance, late arrival advice, or group reservations?
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 font-editorial">
              Our dedicated on-site team is available around the clock to ensure your stay in historic York is effortless.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              id="footer-hotline-call-btn"
              href={`tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-xl shadow-amber-950/60 transition-all hover:scale-105 active:scale-95"
            >
              <Phone className="w-4 h-4 text-stone-950 animate-bounce" />
              <span>Call Hotline: {SUPPORT_PHONE}</span>
            </a>

            <button
              onClick={onOpenBookingModal}
              className="px-5 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-sm border border-stone-700 transition-colors"
            >
              Check Live Availability
            </button>
          </div>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-xs sm:text-sm">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-600 border border-amber-400/40 flex items-center justify-center font-display font-bold text-stone-950">
                Y
              </div>
              <span className="font-display font-bold text-lg text-stone-100">The York Guest House</span>
            </div>
            <p className="text-stone-400 text-xs font-editorial leading-relaxed">
              Boutique Victorian luxury in central Bootham. Direct booking engine with real-time multi-OTA channel synchronization and zero double-booking lock architecture.
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Direct Booking Lowest Rate Guaranteed</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-stone-100 text-sm tracking-wide text-amber-300">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-stone-400 text-xs">
              <li>
                <button
                  onClick={() => { setActiveTab('rooms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-300 transition-colors"
                >
                  • Suites & Accommodations
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('attractions'); document.getElementById('attractions')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="hover:text-amber-300 transition-colors"
                >
                  • York Attractions & AI Concierge
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('inventory'); document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="hover:text-amber-300 transition-colors"
                >
                  • Multi-OTA Channel Manager
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('bookings'); document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="hover:text-amber-300 transition-colors"
                >
                  • Manage Existing Booking
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Check-in Policies & Hours */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-stone-100 text-sm tracking-wide text-amber-300">
              Arrival & Stay Policies
            </h4>
            <div className="space-y-2 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-200 block">Check-In Window</span>
                  <span>15:00 - 22:00 (Self-keypad PIN provided for late arrival)</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-200 block">Check-Out</span>
                  <span>11:00 AM (Late 13:00 check-out bookable)</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Navigation className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-200 block">From York Railway Station</span>
                  <span>10 min scenic walk across Lendal Bridge or 3 min taxi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Contact & Administrative hotline */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-stone-100 text-sm tracking-wide text-amber-300">
              Administrative & Inquiries
            </h4>
            <div className="space-y-2 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{GUEST_HOUSE_ADDRESS}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`} className="font-bold text-amber-300 hover:underline">
                  {SUPPORT_PHONE}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${GUEST_HOUSE_EMAIL}`} className="text-stone-300 hover:underline">
                  {GUEST_HOUSE_EMAIL}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="border-t border-stone-800 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} The York Guest House. All Rights Reserved. Double-booking prevention protocol active.</p>
          <div className="flex items-center gap-4">
            <span>Support: <strong>{SUPPORT_PHONE}</strong></span>
            <span>•</span>
            <span>VAT Registration: GB 984 2190 42</span>
            <span>•</span>
            <span>Bootham, York YO30 6AQ</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
