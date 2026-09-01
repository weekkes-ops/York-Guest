'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ROOMS, SUPPORT_PHONE } from '@/lib/data';
import { Room, Booking } from '@/lib/types';
import {
  checkRoomAvailability,
  getStoredBookings,
  AvailabilityResult,
} from '@/lib/inventory-engine';

// Components
import { Navbar } from '@/components/Navbar';
import { HeroBookingBar } from '@/components/HeroBookingBar';
import { RoomCard } from '@/components/RoomCard';
import { RoomDetailModal } from '@/components/RoomDetailModal';
import { PaymentCheckoutModal } from '@/components/PaymentCheckoutModal';
import { AttractionsSection } from '@/components/AttractionsSection';
import { InventoryManager } from '@/components/InventoryManager';
import { Footer } from '@/components/Footer';

// Icons
import {
  BedDouble,
  ShieldCheck,
  Sparkles,
  Phone,
  ArrowRight,
  Info,
  CalendarCheck,
  CheckCircle2,
  Lock,
  RefreshCw,
  Compass,
} from 'lucide-react';

export default function HomePage() {
  // Active Navigation Tab: 'rooms' | 'attractions' | 'inventory' | 'bookings'
  const [activeTab, setActiveTab] = useState<string>('rooms');

  // Booking search parameters
  const today = useMemo(() => new Date(), []);
  const defaultCheckIn = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }, [today]);

  const defaultCheckOut = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  }, [today]);

  const [checkIn, setCheckIn] = useState<string>(defaultCheckIn);
  const [checkOut, setCheckOut] = useState<string>(defaultCheckOut);
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Bookings list in memory for instant reactivity
  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (typeof window !== 'undefined') {
      return getStoredBookings();
    }
    return [];
  });

  // Modals state
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState<Room | null>(null);
  const [selectedRoomForCheckout, setSelectedRoomForCheckout] = useState<Room | null>(null);
  const [recentBooking, setRecentBooking] = useState<Booking | null>(null);

  // Sync state on load
  const loadBookings = () => {
    const b = getStoredBookings();
    setBookings(b);
  };

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    if (selectedCategory === 'ALL') return ROOMS;
    if (selectedCategory === 'PENTHOUSE') return ROOMS.filter(r => r.id.includes('penthouse') || r.floor.includes('Penthouse') || r.floor.includes('3rd'));
    if (selectedCategory === 'HISTORIC') return ROOMS.filter(r => r.id.includes('georgian') || r.id.includes('royal') || r.id.includes('roman'));
    if (selectedCategory === 'FAMILY') return ROOMS.filter(r => r.id.includes('cottage') || r.maxGuests > 2);
    return ROOMS;
  }, [selectedCategory]);

  // Compute availability map for all rooms
  const availabilityMap = useMemo(() => {
    const map: Record<string, AvailabilityResult> = {};
    ROOMS.forEach(room => {
      map[room.id] = checkRoomAvailability(room.id, checkIn, checkOut, bookings);
    });
    return map;
  }, [checkIn, checkOut, bookings]);

  // Count available rooms
  const totalAvailableRooms = useMemo(() => {
    return Object.values(availabilityMap).filter(res => res.isAvailable).length;
  }, [availabilityMap]);

  const handleBookingComplete = (newBooking: Booking) => {
    setRecentBooking(newBooking);
    loadBookings();
  };

  const handleOpenGeneralBooking = () => {
    // Pick first available room
    const firstAvailable = ROOMS.find(r => availabilityMap[r.id]?.isAvailable) || ROOMS[0];
    setSelectedRoomForCheckout(firstAvailable);
  };

  return (
    <div className="min-h-screen bg-[#171513] text-stone-100 flex flex-col selection:bg-amber-500 selection:text-stone-950 font-sans">
      
      {/* Sticky Header with Hotline & Guarantee */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBookingModal={handleOpenGeneralBooking}
      />

      <main className="flex-1 space-y-16 sm:space-y-24">
        
        {/* Hero Section with Live Availability Search */}
        <HeroBookingBar
          checkIn={checkIn}
          checkOut={checkOut}
          guestsCount={guestsCount}
          selectedCategory={selectedCategory}
          onCheckInChange={setCheckIn}
          onCheckOutChange={setCheckOut}
          onGuestsChange={setGuestsCount}
          onCategoryChange={setSelectedCategory}
          onSearchClick={() => {
            const el = document.getElementById('rooms');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          totalAvailableRooms={totalAvailableRooms}
        />

        {/* Accommodation Suites Grid Section */}
        <section id="rooms" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-28">
          
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-800 pb-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                <BedDouble className="w-3.5 h-3.5 text-amber-400" />
                <span>Distinctive Accommodations</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-stone-100">
                Our Curated Rooms & Luxury Suites
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 font-editorial leading-relaxed">
                Each room is individually designed to celebrate York&apos;s rich tapestry of Roman, Viking, and Georgian heritage.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  Real-time Double-Booking Guard
                </span>
                <span className="text-stone-600">|</span>
                <span className="text-amber-300 font-medium">
                  {totalAvailableRooms} of {ROOMS.length} Available
                </span>
              </div>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredRooms.map((room) => {
              const availability = availabilityMap[room.id] || { isAvailable: true };
              return (
                <RoomCard
                  key={room.id}
                  room={room}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  guestsCount={guestsCount}
                  availability={availability}
                  onBookNow={(r) => setSelectedRoomForCheckout(r)}
                  onViewDetails={(r) => setSelectedRoomForDetails(r)}
                />
              );
            })}
          </div>

        </section>

        {/* Why Direct Booking & Double-Booking Guarantee Featurette */}
        <section className="bg-stone-900/60 border-y border-stone-800/80 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-stone-300 text-xs sm:text-sm">
            
            <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-stone-100">
                Zero Double-Booking Protocol
              </h3>
              <p className="text-stone-400 font-editorial leading-relaxed">
                Direct integration with our atomic reservation engine ensures that when you book, all OTA channels (Airbnb, Booking.com, VRBO) lock your exact dates instantaneously.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-stone-100">
                Direct Resident Privileges
              </h3>
              <p className="text-stone-400 font-editorial leading-relaxed">
                Direct guests receive complimentary artisan Yorkshire welcome hampers, priority check-in windows, and discounted York Ghost Walk & Minster passes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-stone-100">
                24/7 Administrative Hotline
              </h3>
              <p className="text-stone-400 font-editorial leading-relaxed">
                Immediate on-site host assistance, parking coordination, or booking modifications via <a href={`tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`} className="text-amber-300 font-bold underline">{SUPPORT_PHONE}</a>.
              </p>
            </div>

          </div>
        </section>

        {/* Local York Attractions & AI Concierge Section */}
        <AttractionsSection />

        {/* Real-time Inventory & Multi-OTA Synchronization Manager */}
        <InventoryManager onRefreshBookings={loadBookings} />

      </main>

      {/* Room Details Modal */}
      {selectedRoomForDetails && (
        <RoomDetailModal
          room={selectedRoomForDetails}
          checkIn={checkIn}
          checkOut={checkOut}
          availability={availabilityMap[selectedRoomForDetails.id] || { isAvailable: true }}
          onClose={() => setSelectedRoomForDetails(null)}
          onSelectToBook={(r) => {
            setSelectedRoomForDetails(null);
            setSelectedRoomForCheckout(r);
          }}
        />
      )}

      {/* Integrated Payment Processing Checkout Modal */}
      {selectedRoomForCheckout && (
        <PaymentCheckoutModal
          room={selectedRoomForCheckout}
          checkIn={checkIn}
          checkOut={checkOut}
          guestsCount={guestsCount}
          onClose={() => setSelectedRoomForCheckout(null)}
          onBookingComplete={handleBookingComplete}
        />
      )}

      {/* Footer with Hotline & Location */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenBookingModal={handleOpenGeneralBooking}
      />

    </div>
  );
}
