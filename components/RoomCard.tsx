'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Room } from '@/lib/types';
import { Users, Bed, Maximize2, Eye, ShieldCheck, Check, Sparkles, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { AvailabilityResult } from '@/lib/inventory-engine';

interface RoomCardProps {
  room: Room;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  availability: AvailabilityResult;
  onBookNow: (room: Room) => void;
  onViewDetails: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  checkIn,
  checkOut,
  guestsCount,
  availability,
  onBookNow,
  onViewDetails,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const isGuestCapacityExceeded = guestsCount > room.maxGuests;
  const isAvailable = availability.isAvailable && !isGuestCapacityExceeded;

  return (
    <div
      id={`room-card-${room.id}`}
      className={`group bg-stone-900/90 rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${
        isAvailable
          ? 'border-stone-800 hover:border-amber-700/60 shadow-xl hover:shadow-2xl hover:shadow-amber-950/20'
          : 'border-red-900/30 opacity-90'
      }`}
    >
      {/* Image Gallery Header */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-stone-950">
        <Image
          src={room.images[activeImageIndex] || room.images[0]}
          alt={room.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/30" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {room.badge && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-stone-950 shadow-md">
              {room.badge}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-stone-900/80 backdrop-blur-md text-stone-200 border border-stone-700">
            {room.floor}
          </span>
        </div>

        {/* Live Availability Tag */}
        <div className="absolute top-3 right-3">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Available Direct
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/90 text-rose-300 border border-rose-500/40 backdrop-blur-md shadow-md">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              {isGuestCapacityExceeded ? `Max ${room.maxGuests} Guests` : 'Reserved on Dates'}
            </span>
          )}
        </div>

        {/* Gallery Thumbnails Overlay */}
        {room.images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10">
            {room.images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(idx);
                }}
                className={`w-6 h-6 rounded overflow-hidden border transition-all ${
                  activeImageIndex === idx ? 'border-amber-400 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                aria-label={`View photo ${idx + 1}`}
              >
                <div className="relative w-full h-full">
                  <Image src={img} alt="Thumbnail" fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* View / Outlook */}
        <div className="absolute bottom-3 left-3 text-xs text-stone-300 flex items-center gap-1 bg-stone-900/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-stone-700/60 max-w-[70%] truncate">
          <Eye className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="truncate">{room.view}</span>
        </div>
      </div>

      {/* Room Details Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-xl font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                {room.name}
              </h3>
              <p className="text-xs text-amber-400/90 font-medium mt-0.5">{room.tagline}</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-400 font-editorial mt-2.5 line-clamp-2 leading-relaxed">
            {room.description}
          </p>

          {/* Quick Specs */}
          <div className="grid grid-cols-3 gap-2 py-3 my-3 border-y border-stone-800 text-stone-300 text-xs">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Up to {room.maxGuests} guests</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{room.bedType.split(' ')[0]} bed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{room.sizeSqM} m²</span>
            </div>
          </div>

          {/* Key Amenities */}
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">Highlighted Amenities:</span>
            <div className="flex flex-wrap gap-1.5">
              {room.amenities.slice(0, 4).map((amenity, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-[11px] border border-stone-700/60"
                >
                  <Check className="w-2.5 h-2.5 text-amber-400" />
                  <span>{amenity}</span>
                </span>
              ))}
              {room.amenities.length > 4 && (
                <button
                  onClick={() => onViewDetails(room)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-medium px-1 py-0.5"
                >
                  +{room.amenities.length - 4} more
                </button>
              )}
            </div>
          </div>

          {/* Collision / Unavailable message if blocked */}
          {!availability.isAvailable && (
            <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-rose-200">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Double-Booking Protection Active</span>
              </div>
              <p className="text-[11px] text-rose-300/80 leading-relaxed">
                {availability.reason || 'This suite is currently locked by a confirmed reservation on other channels.'}
              </p>
            </div>
          )}
        </div>

        {/* Pricing & Booking Footer */}
        <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-display text-stone-100">
                £{room.pricePerNight}
              </span>
              <span className="text-xs text-stone-400">/ night</span>
            </div>
            <p className="text-[11px] text-amber-400/80">
              Weekend rate: £{room.weekendPrice}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id={`view-details-${room.id}`}
              onClick={() => onViewDetails(room)}
              className="p-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors"
              title="View full suite details and floor plans"
            >
              <Info className="w-4 h-4" />
            </button>

            <button
              id={`book-suite-${room.id}`}
              disabled={!isAvailable}
              onClick={() => onBookNow(room)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all shadow-md ${
                isAvailable
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-amber-950/40 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
              }`}
            >
              <span>{isAvailable ? 'Reserve Suite' : 'Unavailable'}</span>
              {isAvailable && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
