'use client';

import React from 'react';
import { Calendar, Users, ShieldCheck, RefreshCw, Sparkles, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SUPPORT_PHONE } from '@/lib/data';

interface HeroBookingBarProps {
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  selectedCategory: string;
  onCheckInChange: (val: string) => void;
  onCheckOutChange: (val: string) => void;
  onGuestsChange: (val: number) => void;
  onCategoryChange: (val: string) => void;
  onSearchClick: () => void;
  totalAvailableRooms: number;
}

export const HeroBookingBar: React.FC<HeroBookingBarProps> = ({
  checkIn,
  checkOut,
  guestsCount,
  selectedCategory,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onCategoryChange,
  onSearchClick,
  totalAvailableRooms,
}) => {
  return (
    <section id="hero-section" className="relative bg-gradient-to-b from-[#1c1917] via-[#292524] to-[#1c1917] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-amber-900/20 overflow-hidden">
      {/* Subtle historic architectural watermark overlay */}
      <div 
        className="absolute inset-0 opacity-15 bg-cover bg-center mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?auto=format&fit=crop&w=2000&q=80')`
        }}
      />
      <div className="absolute inset-0 bg-radial from-transparent via-[#1c1917]/70 to-[#1c1917] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Headline & Badges */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-wide uppercase shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Luxury Boutique Accommodation in Bootham, York</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-stone-100 leading-tight">
            Timeless Heritage. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Effortless Direct Stays.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-stone-300 font-editorial leading-relaxed max-w-2xl mx-auto">
            Located just 6 minutes stroll from York Minster. Featuring real-time multi-platform inventory synchronization, guaranteed zero double-bookings, and bespoke York concierge itineraries.
          </p>

          {/* Quick contact and guarantee pill */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs text-stone-300">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Double-Booking Prevention Protocol Active
            </span>
            <span className="text-stone-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-amber-300 font-medium">
              <RefreshCw className="w-4 h-4 text-amber-400" />
              Real-time Airbnb, Booking.com & iCal Sync
            </span>
            <span className="text-stone-600 hidden sm:inline">•</span>
            <a 
              href={`tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-1.5 text-stone-200 hover:text-amber-300 transition-colors font-medium underline underline-offset-2"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              Support: {SUPPORT_PHONE}
            </a>
          </div>
        </div>

        {/* Real-time Interactive Booking Search Bar */}
        <div id="booking-search-card" className="max-w-5xl mx-auto bg-stone-900/90 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-amber-700/40 shadow-2xl shadow-black/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            
            {/* Check-In */}
            <div className="lg:col-span-3 space-y-1.5">
              <label htmlFor="checkin-date-input" className="block text-xs font-semibold uppercase tracking-wider text-amber-300/90 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Check-In Date
              </label>
              <input
                id="checkin-date-input"
                type="date"
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => onCheckInChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
              />
            </div>

            {/* Check-Out */}
            <div className="lg:col-span-3 space-y-1.5">
              <label htmlFor="checkout-date-input" className="block text-xs font-semibold uppercase tracking-wider text-amber-300/90 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Check-Out Date
              </label>
              <input
                id="checkout-date-input"
                type="date"
                value={checkOut}
                min={checkIn || new Date().toISOString().split('T')[0]}
                onChange={(e) => onCheckOutChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
              />
            </div>

            {/* Guests Count */}
            <div className="lg:col-span-2 space-y-1.5">
              <label htmlFor="guests-count-select" className="block text-xs font-semibold uppercase tracking-wider text-amber-300/90 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Guests
              </label>
              <select
                id="guests-count-select"
                value={guestsCount}
                onChange={(e) => onGuestsChange(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests (Standard)</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4 Guests (Family Cottage)</option>
              </select>
            </div>

            {/* Room Style Filter */}
            <div className="lg:col-span-2 space-y-1.5">
              <label htmlFor="room-category-select" className="block text-xs font-semibold uppercase tracking-wider text-amber-300/90 flex items-center gap-1.5">
                Room Style
              </label>
              <select
                id="room-category-select"
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
              >
                <option value="ALL">All Suites (6)</option>
                <option value="PENTHOUSE">Penthouse & Views</option>
                <option value="HISTORIC">Georgian & Heritage</option>
                <option value="FAMILY">Family & Cottage</option>
              </select>
            </div>

            {/* Search CTA */}
            <div className="lg:col-span-2">
              <button
                id="check-availability-btn"
                onClick={onSearchClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-lg shadow-amber-950/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Check Dates</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </button>
            </div>

          </div>

          {/* Real-time Availability & Parity Status row */}
          <div className="mt-4 pt-3 border-t border-stone-800 flex flex-wrap items-center justify-between text-xs text-stone-400 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-300 font-medium">
                Live Inventory Status: {totalAvailableRooms} of 6 suites available for {checkIn || 'selected dates'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                No Booking Fees
              </span>
              <span className="flex items-center gap-1 text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                Free 48h Cancellation
              </span>
              <span className="flex items-center gap-1 text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                Complimentary Yorkshire Hamper on 3+ nights
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
