'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Room } from '@/lib/types';
import { X, Check, Users, Bed, Maximize2, MapPin, Eye, Clock, ShieldCheck, Phone, Sparkles, AlertCircle } from 'lucide-react';
import { SUPPORT_PHONE, GUEST_HOUSE_ADDRESS } from '@/lib/data';
import { AvailabilityResult } from '@/lib/inventory-engine';

interface RoomDetailModalProps {
  room: Room | null;
  checkIn: string;
  checkOut: string;
  availability: AvailabilityResult;
  onClose: () => void;
  onSelectToBook: (room: Room) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  checkIn,
  checkOut,
  availability,
  onClose,
  onSelectToBook,
}) => {
  const [activePhoto, setActivePhoto] = useState(0);

  if (!room) return null;

  const isAvailable = availability.isAvailable;

  return (
    <div id="room-detail-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div 
        id="room-detail-modal-container"
        className="relative bg-stone-900 border border-amber-800/40 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl text-stone-100 flex flex-col my-8"
      >
        {/* Close Button */}
        <button
          id="close-room-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Section */}
        <div className="relative h-72 sm:h-96 w-full bg-black shrink-0">
          <Image
            src={room.images[activePhoto] || room.images[0]}
            alt={room.name}
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-black/30" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {room.badge && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-stone-950 shadow-lg">
                {room.badge}
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-900/90 text-amber-300 border border-amber-700/50">
              {room.floor}
            </span>
          </div>

          {/* Thumbnail strip */}
          {room.images.length > 1 && (
            <div className="absolute bottom-4 left-4 flex gap-2 bg-stone-950/70 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
              {room.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(idx)}
                  className={`relative w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                    activePhoto === idx ? 'border-amber-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="Thumbnail" fill className="object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 flex-1">
          {/* Header Info */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-100">
                  {room.name}
                </h2>
                <p className="text-amber-400 font-medium mt-1">{room.tagline}</p>
              </div>

              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold text-amber-300 font-display">
                  £{room.pricePerNight}
                  <span className="text-xs text-stone-400 font-sans font-normal ml-1">/ night</span>
                </div>
                <span className="text-xs text-stone-400">Weekend: £{room.weekendPrice}</span>
              </div>
            </div>

            {/* Location & View */}
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-stone-300">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-400" />
                {room.view}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                {GUEST_HOUSE_ADDRESS}
              </span>
            </div>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-stone-800/60 border border-stone-700/60 text-stone-200 text-xs sm:text-sm">
            <div className="space-y-0.5">
              <span className="text-[11px] text-stone-400 block uppercase font-semibold">Max Guests</span>
              <div className="flex items-center gap-1.5 font-bold">
                <Users className="w-4 h-4 text-amber-400" />
                <span>{room.maxGuests} Guests</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-stone-400 block uppercase font-semibold">Bedding Setup</span>
              <div className="flex items-center gap-1.5 font-bold">
                <Bed className="w-4 h-4 text-amber-400" />
                <span className="truncate">{room.bedType}</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-stone-400 block uppercase font-semibold">Room Size</span>
              <div className="flex items-center gap-1.5 font-bold">
                <Maximize2 className="w-4 h-4 text-amber-400" />
                <span>{room.sizeSqM} m² / {Math.round(room.sizeSqM * 10.76)} sq ft</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-stone-400 block uppercase font-semibold">Floor Level</span>
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="truncate">{room.floor}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300 mb-2">
              Suite Overview & Architecture
            </h3>
            <p className="text-stone-300 font-editorial text-sm sm:text-base leading-relaxed">
              {room.description}
            </p>
          </div>

          {/* Key Highlights */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300 mb-2">
              Signature Highlights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {room.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/30 text-amber-200 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Full Amenities Grid */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300 mb-2">
              All Room Amenities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300">
              {room.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-md bg-stone-800/40 border border-stone-700/40">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Check-in & House Policies */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2 text-xs text-stone-400">
            <h4 className="font-semibold text-stone-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              Guest House Policies & Support
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>• <strong>Check-In:</strong> 15:00 - 22:00 (Self keypad access available)</div>
              <div>• <strong>Check-Out:</strong> 11:00 (Late check-out available)</div>
              <div>• <strong>Zero Double-Booking:</strong> Synchronized live with OTAs</div>
              <div>• <strong>Support Hotline:</strong> <a href={`tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`} className="text-amber-300 font-bold underline">{SUPPORT_PHONE}</a></div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-stone-400">
              Selected dates: <span className="font-semibold text-stone-200">{checkIn} to {checkOut}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm font-medium transition-colors"
              >
                Close
              </button>

              <button
                id="modal-select-suite-btn"
                disabled={!isAvailable}
                onClick={() => {
                  onClose();
                  onSelectToBook(room);
                }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg transition-all ${
                  isAvailable
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-amber-950/50 hover:scale-[1.02]'
                    : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isAvailable ? `Book ${room.name}` : 'Dates Unavailable'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
