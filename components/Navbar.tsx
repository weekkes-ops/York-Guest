'use client';

import React, { useState } from 'react';
import { Phone, Calendar, MapPin, ShieldCheck, RefreshCw, Menu, X, BedDouble, Compass, Sparkles } from 'lucide-react';
import { SUPPORT_PHONE } from '@/lib/data';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBookingModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenBookingModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'rooms', label: 'Suites & Rooms', icon: BedDouble },
    { id: 'attractions', label: 'York Attractions & AI Guide', icon: Compass },
    { id: 'inventory', label: 'Inventory & Channel Sync', icon: RefreshCw },
    { id: 'bookings', label: 'Manage Bookings', icon: Calendar },
  ];

  return (
    <header id="main-header" className="sticky top-0 z-50 bg-[#1c1917]/95 backdrop-blur-md text-stone-100 border-b border-amber-900/30 transition-all">
      {/* Top Banner with Support Hotline and Guarantee */}
      <div id="top-announcement-bar" className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 text-amber-200/90 text-xs px-4 py-1.5 border-b border-amber-800/30 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Direct Booking Guarantee: Best Rate & Zero Double-Booking Protection
            </span>
            <span className="hidden md:inline-block text-amber-500/50">•</span>
            <span className="hidden md:inline-flex items-center gap-1 text-stone-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Bootham, Central York (6 min walk to York Minster)
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-stone-400 hidden sm:inline">24/7 Inquiries & Support:</span>
            <a
              id="hotline-top-link"
              href={`tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`}
              className="inline-flex items-center gap-1.5 font-bold text-amber-300 hover:text-amber-100 bg-amber-900/40 hover:bg-amber-800/50 px-2.5 py-0.5 rounded-full border border-amber-700/40 transition-colors"
            >
              <Phone className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>{SUPPORT_PHONE}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand & Crest */}
          <div
            id="brand-logo-button"
            onClick={() => { setActiveTab('rooms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-600 via-amber-700 to-stone-900 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-950/40 group-hover:border-amber-300 transition-colors">
              <span className="font-display font-bold text-xl text-amber-200 tracking-wider">Y</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold tracking-wide text-stone-100 group-hover:text-amber-300 transition-colors">
                  The York Guest House
                </span>
                <span className="text-[10px] uppercase tracking-widest bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  Bootham
                </span>
              </div>
              <p className="text-xs text-stone-400 tracking-wider">Boutique Luxury Stays & Booking Engine</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    const el = document.getElementById(item.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-900/40 text-amber-200 border border-amber-700/50 shadow-sm'
                      : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action CTA & Direct Call */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              id="hotline-main-call-button"
              href={`tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-amber-200 bg-stone-900 hover:bg-stone-800 border border-stone-700/80 transition-colors"
              title="Call Guest Services"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{SUPPORT_PHONE}</span>
            </a>

            <button
              id="header-book-now-button"
              onClick={onOpenBookingModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-md shadow-amber-950/40 border border-amber-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Book Suite</span>
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-menu-drawer" className="lg:hidden bg-stone-900 border-t border-stone-800 px-4 pt-3 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                  const el = document.getElementById(item.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                  isActive ? 'bg-amber-900/50 text-amber-200 border border-amber-700/50' : 'text-stone-300 hover:bg-stone-800'
                }`}
              >
                <Icon className="w-4 h-4 text-amber-400" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-stone-800 space-y-2">
            <a
              id="mobile-hotline-button"
              href={`tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-stone-800 text-amber-300 border border-stone-700"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Call Support: {SUPPORT_PHONE}</span>
            </a>

            <button
              id="mobile-book-now-button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenBookingModal) onOpenBookingModal();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-md"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Book Direct Now</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
