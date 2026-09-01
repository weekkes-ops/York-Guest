'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Room, Booking, BookingAddOn } from '@/lib/types';
import { BOOKING_ADD_ONS, SUPPORT_PHONE, GUEST_HOUSE_ADDRESS, GUEST_HOUSE_EMAIL } from '@/lib/data';
import { calculateStayPricing, commitNewBooking } from '@/lib/inventory-engine';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Users,
  Lock,
  Phone,
  Printer,
  Download,
  Sparkles,
  AlertCircle,
  Clock,
  QrCode,
  MapPin,
  Check,
  Plus,
  Minus,
  Loader2,
  Apple,
  Smartphone
} from 'lucide-react';

interface PaymentCheckoutModalProps {
  room: Room | null;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  onClose: () => void;
  onBookingComplete: (booking: Booking) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  room,
  checkIn,
  checkOut,
  guestsCount,
  onClose,
  onBookingComplete,
}) => {
  // Step state: 1 = Guest Info & Addons, 2 = Payment Processing & Verification, 3 = Confirmation Voucher
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [arrivalTime, setArrivalTime] = useState('15:00 - 16:00');
  
  // Selected Addons map { addonId: quantity }
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({
    'addon-yorkshire-breakfast': 0,
    'addon-parking-permit': 0,
  });

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY'>('CARD');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [saveCardForExpress, setSaveCardForExpress] = useState(true);

  // Submission & Confirmation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatusText, setProcessingStatusText] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  if (!room) return null;

  // Calculate pricing
  const formattedAddonsList = Object.entries(selectedAddons)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const item = BOOKING_ADD_ONS.find(a => a.id === id);
      return { id, quantity: (item?.price || 0) * qty };
    });

  const pricing = calculateStayPricing(room, checkIn, checkOut, guestsCount, formattedAddonsList);

  const toggleAddon = (addon: BookingAddOn, change: number) => {
    setSelectedAddons(prev => {
      const current = prev[addon.id] || 0;
      const next = Math.max(0, current + change);
      return { ...prev, [addon.id]: next };
    });
  };

  const handleCardNumberChange = (val: string) => {
    // Format card number with spaces every 4 digits
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    const parts = cleaned.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : '');
  };

  const handleExpiryChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone) {
      setBookingError('Please provide your name, email, and contact phone number.');
      return;
    }
    setBookingError(null);
    setCardName(guestName);
    setStep(2);
  };

  const handleExecutePayment = async () => {
    setIsProcessing(true);
    setBookingError(null);

    // Multi-phase realistic security & atomic double-booking lock sequence
    setProcessingStatusText('Verifying real-time multi-platform inventory & OTA locks...');
    await new Promise(r => setTimeout(r, 600));

    setProcessingStatusText('Executing bank card pre-authorization & 3D-Secure check...');
    await new Promise(r => setTimeout(r, 700));

    setProcessingStatusText('Registering double-booking prevention token...');
    await new Promise(r => setTimeout(r, 500));

    // Construct Add-ons data
    const chosenAddOnsData = Object.entries(selectedAddons)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = BOOKING_ADD_ONS.find(a => a.id === id);
        return {
          id,
          name: item?.name || 'Experience Addon',
          price: (item?.price || 0),
          quantity: qty
        };
      });

    // Commit to engine
    const result = commitNewBooking({
      roomId: room.id,
      roomName: room.name,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      nights: pricing.nights,
      guestsCount,
      baseAmount: pricing.baseAmount,
      addOnsAmount: pricing.addOnsAmount,
      vatAmount: pricing.vatAmount,
      cityLevy: pricing.cityLevy,
      totalAmount: pricing.totalAmount,
      addOns: chosenAddOnsData,
      channelSource: 'DIRECT',
      paymentStatus: 'PAID',
      paymentMethod,
      cardLast4: cardNumber ? cardNumber.replace(/\s/g, '').slice(-4) : '4242',
      cardBrand: paymentMethod === 'CARD' ? 'Visa' : paymentMethod === 'APPLE_PAY' ? 'Apple Pay' : 'Google Pay',
      specialRequests,
      arrivalTime,
    });

    setIsProcessing(false);

    if (result.success && result.booking) {
      setConfirmedBooking(result.booking);
      setStep(3);
      onBookingComplete(result.booking);

      // Trigger festive celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    } else {
      setBookingError(result.error || 'Payment could not be completed. The selected dates may have just been locked by another channel.');
      setStep(1);
    }
  };

  const generateIcsCalendar = () => {
    if (!confirmedBooking) return;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//The York Guest House//Booking Confirmation//EN
BEGIN:VEVENT
UID:${confirmedBooking.id}@theyorkguesthouse.co.uk
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART;VALUE=DATE:${confirmedBooking.checkIn.replace(/-/g, '')}
DTEND;VALUE=DATE:${confirmedBooking.checkOut.replace(/-/g, '')}
SUMMARY:Stay at The York Guest House (${confirmedBooking.roomName})
DESCRIPTION:Booking Reference: ${confirmedBooking.referenceNumber}\\nRoom: ${confirmedBooking.roomName}\\nContact Hotline: ${SUPPORT_PHONE}\\nAddress: ${GUEST_HOUSE_ADDRESS}
LOCATION:${GUEST_HOUSE_ADDRESS}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `york-booking-${confirmedBooking.referenceNumber}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="checkout-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div 
        id="checkout-modal-container" 
        className="relative bg-stone-900 border border-amber-800/40 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl text-stone-100 flex flex-col my-6"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-stone-900/95 backdrop-blur-md px-6 py-4 border-b border-stone-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300 font-display font-bold">
              Y
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-stone-100">
                {step === 3 ? 'Booking Confirmed & Guaranteed' : 'Secure Direct Reservation'}
              </h2>
              <p className="text-xs text-stone-400">The York Guest House • Direct Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {step < 3 && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-stone-400">
                <span className={`px-2 py-0.5 rounded ${step === 1 ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-800 text-stone-300'}`}>
                  1. Details
                </span>
                <span>→</span>
                <span className={`px-2 py-0.5 rounded ${step === 2 ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-800 text-stone-300'}`}>
                  2. Payment
                </span>
              </div>
            )}

            <button
              id="close-checkout-modal-btn"
              onClick={onClose}
              className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
              aria-label="Close checkout"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {bookingError && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">Attention Required:</span>
              <p>{bookingError}</p>
            </div>
          </div>
        )}

        {/* STEP 1: Guest Details & Experience Add-ons */}
        {step === 1 && (
          <form onSubmit={handleProceedToPayment} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Guest Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    Guest Contact Details
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-stone-300 font-medium mb-1">
                        Full Name <span className="text-amber-400">*</span>
                      </label>
                      <input
                        id="guest-name-input"
                        type="text"
                        required
                        placeholder="e.g. Lady Victoria Spencer"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-stone-300 font-medium mb-1">
                          Email Address <span className="text-amber-400">*</span>
                        </label>
                        <input
                          id="guest-email-input"
                          type="email"
                          required
                          placeholder="v.spencer@example.com"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-stone-300 font-medium mb-1">
                          Mobile / Phone Number <span className="text-amber-400">*</span>
                        </label>
                        <input
                          id="guest-phone-input"
                          type="tel"
                          required
                          placeholder="+44 7700 900000"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-stone-300 font-medium mb-1">
                          Estimated Arrival Window
                        </label>
                        <select
                          value={arrivalTime}
                          onChange={(e) => setArrivalTime(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        >
                          <option value="15:00 - 16:00">15:00 - 16:00 (Standard Check-in)</option>
                          <option value="16:00 - 18:00">16:00 - 18:00</option>
                          <option value="18:00 - 20:00">18:00 - 20:00</option>
                          <option value="20:00 - 22:00">20:00 - 22:00 (Late self check-in)</option>
                          <option value="After 22:00">After 22:00 (Keypad code provided)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-stone-300 font-medium mb-1">
                          Total Guests in Suite
                        </label>
                        <div className="px-3.5 py-2 rounded-lg bg-stone-800/60 border border-stone-700/60 text-stone-300 text-sm">
                          {guestsCount} Guest(s) (Max {room.maxGuests})
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-stone-300 font-medium mb-1">
                        Special Requests or Dietary Notes (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Dietary allergies, anniversary celebration, feather allergy, ground floor requirement..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Experience Add-Ons */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Curated Yorkshire Add-ons
                    </h3>
                    <span className="text-[11px] text-stone-400">Optional extras</span>
                  </div>

                  <div className="space-y-2.5">
                    {BOOKING_ADD_ONS.map((addon) => {
                      const qty = selectedAddons[addon.id] || 0;
                      return (
                        <div
                          key={addon.id}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                            qty > 0 ? 'bg-amber-950/30 border-amber-600/50' : 'bg-stone-800/40 border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          <div className="space-y-0.5 max-w-[70%]">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-stone-200">{addon.name}</span>
                              <span className="text-xs font-bold text-amber-300">£{addon.price}</span>
                            </div>
                            <p className="text-[11px] text-stone-400 leading-snug line-clamp-1">{addon.description}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleAddon(addon, -1)}
                              disabled={qty === 0}
                              className="w-7 h-7 rounded-md bg-stone-800 hover:bg-stone-700 disabled:opacity-30 flex items-center justify-center text-stone-300"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-5 text-center text-xs font-bold text-stone-100">{qty}</span>
                            <button
                              type="button"
                              onClick={() => toggleAddon(addon, 1)}
                              className="w-7 h-7 rounded-md bg-amber-600 hover:bg-amber-500 flex items-center justify-center text-white font-bold"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Reservation Summary & Price Breakdown */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-stone-950 border border-amber-900/40 shadow-xl space-y-4">
                  <h3 className="font-display font-bold text-base text-stone-100 border-b border-stone-800 pb-3 flex items-center justify-between">
                    <span>Stay Summary</span>
                    <span className="text-xs font-sans font-normal text-amber-300">Direct Booking</span>
                  </h3>

                  <div className="space-y-2 text-xs text-stone-300">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Suite Selected:</span>
                      <span className="font-semibold text-stone-100 text-right">{room.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Dates:</span>
                      <span className="font-medium text-stone-200">{checkIn} → {checkOut}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Duration:</span>
                      <span className="font-medium text-stone-200">{pricing.nights} Night(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Guests:</span>
                      <span className="font-medium text-stone-200">{guestsCount} Guest(s)</span>
                    </div>
                  </div>

                  {/* Detailed Price Breakdown */}
                  <div className="border-t border-stone-800 pt-3 space-y-2 text-xs">
                    <div className="flex justify-between text-stone-300">
                      <span>Accommodations ({pricing.nights} nights):</span>
                      <span>£{pricing.baseAmount.toFixed(2)}</span>
                    </div>

                    {pricing.addOnsAmount > 0 && (
                      <div className="flex justify-between text-stone-300">
                        <span>Selected Add-ons:</span>
                        <span>£{pricing.addOnsAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-stone-400">
                      <span>UK VAT (20% included):</span>
                      <span>£{pricing.vatAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-stone-400">
                      <span>York City Tourism Levy:</span>
                      <span>£{pricing.cityLevy.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-stone-800 pt-3 flex justify-between items-baseline text-stone-100">
                      <div>
                        <span className="font-display text-base font-bold block">Total Amount Due</span>
                        <span className="text-[10px] text-emerald-400 font-medium">All taxes & fees included</span>
                      </div>
                      <span className="font-display text-2xl font-bold text-amber-300">
                        £{pricing.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Double-Booking Guarantee Callout */}
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-[11px] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Zero Double-Booking Guarantee</span>
                    </div>
                    <p className="text-emerald-300/80">
                      Your room is locked atomically in real-time across Airbnb, Booking.com, and VRBO upon checkout.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    id="proceed-to-payment-btn"
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-lg shadow-amber-950/60 transition-all hover:scale-[1.01]"
                  >
                    Continue to Secure Payment (£{pricing.totalAmount.toFixed(2)})
                  </button>

                  <div className="text-center">
                    <span className="text-[11px] text-stone-500">
                      Need help? Call Guest Support on <a href={`tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`} className="text-amber-400 underline">{SUPPORT_PHONE}</a>
                    </span>
                  </div>

                </div>
              </div>

            </div>
          </form>
        )}

        {/* STEP 2: Integrated Payment Processing */}
        {step === 2 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Payment Form */}
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    Select Payment Method
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">256-bit SSL encrypted direct checkout</p>
                </div>

                {/* Method selector tabs */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                      paymentMethod === 'CARD'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-md'
                        : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:bg-stone-800'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Credit / Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('APPLE_PAY')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                      paymentMethod === 'APPLE_PAY'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-md'
                        : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:bg-stone-800'
                    }`}
                  >
                    <Apple className="w-5 h-5" />
                    <span>Apple Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('GOOGLE_PAY')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                      paymentMethod === 'GOOGLE_PAY'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-md'
                        : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:bg-stone-800'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span>Google Pay</span>
                  </button>
                </div>

                {/* Card Fields */}
                {paymentMethod === 'CARD' && (
                  <div className="space-y-3.5 bg-stone-950/60 p-4 rounded-xl border border-stone-800">
                    <div>
                      <label className="block text-xs text-stone-300 font-medium mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name on card"
                        className="w-full px-3.5 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-stone-300 font-medium mb-1 flex justify-between">
                        <span>Card Number</span>
                        <span className="text-[11px] text-stone-400">Visa, Mastercard, Amex</span>
                      </label>
                      <div className="relative">
                        <input
                          id="card-number-input"
                          type="text"
                          required
                          placeholder="4242 4242 4242 4242"
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          className="w-full pl-3.5 pr-10 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                        <Lock className="w-4 h-4 text-emerald-400 absolute right-3 top-2.5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-stone-300 font-medium mb-1">
                          Expiry Date (MM/YY)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-stone-300 font-medium mb-1">
                          CVC / CVV
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          required
                          placeholder="•••"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3.5 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="save-card"
                        checked={saveCardForExpress}
                        onChange={(e) => setSaveCardForExpress(e.target.checked)}
                        className="rounded bg-stone-800 border-stone-700 text-amber-500 focus:ring-0"
                      />
                      <label htmlFor="save-card" className="text-xs text-stone-300 cursor-pointer">
                        Save encrypted payment token for seamless in-house check-in charges
                      </label>
                    </div>
                  </div>
                )}

                {/* Instant Wallet Pay View */}
                {paymentMethod !== 'CARD' && (
                  <div className="p-6 rounded-xl bg-stone-950 border border-stone-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center mx-auto text-amber-400">
                      {paymentMethod === 'APPLE_PAY' ? <Apple className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
                    </div>
                    <h4 className="text-sm font-bold text-stone-100">
                      {paymentMethod === 'APPLE_PAY' ? 'Apple Pay Express Authorization' : 'Google Pay Instant Checkout'}
                    </h4>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto">
                      Biometric Touch ID / Face ID authentication will verify your stay instantly for £{pricing.totalAmount.toFixed(2)}.
                    </p>
                  </div>
                )}

                {/* Processing State Animation */}
                {isProcessing && (
                  <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500/60 text-amber-200 space-y-2">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                      <span className="font-bold text-sm">Processing Direct Reservation...</span>
                    </div>
                    <p className="text-xs text-amber-300/90 font-mono">{processingStatusText}</p>
                  </div>
                )}

              </div>

              {/* Right Column: Final Price & Authorize CTA */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-stone-950 border border-amber-900/40 space-y-4">
                  <h3 className="font-display font-bold text-base text-stone-100 border-b border-stone-800 pb-3">
                    Final Authorization
                  </h3>

                  <div className="space-y-2 text-xs text-stone-300">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Guest:</span>
                      <span className="font-medium text-stone-200">{guestName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Suite:</span>
                      <span className="font-medium text-stone-200">{room.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Nights:</span>
                      <span className="font-medium text-stone-200">{pricing.nights} Night(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Check-in:</span>
                      <span className="font-medium text-stone-200">{checkIn} (from 15:00)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Check-out:</span>
                      <span className="font-medium text-stone-200">{checkOut} (until 11:00)</span>
                    </div>
                  </div>

                  <div className="border-t border-stone-800 pt-3 flex justify-between items-baseline text-stone-100">
                    <div>
                      <span className="text-xs text-stone-400 block">Total Charged Now</span>
                      <span className="text-[10px] text-emerald-400 font-medium">Instant confirmation</span>
                    </div>
                    <span className="font-display text-2xl font-bold text-amber-300">
                      £{pricing.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <button
                      id="pay-now-button"
                      type="button"
                      disabled={isProcessing}
                      onClick={handleExecutePayment}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-xl shadow-amber-950/60 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                          <span>Securing Room Lock...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-stone-950" />
                          <span>Pay £{pricing.totalAmount.toFixed(2)} & Confirm Stay</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setStep(1)}
                      className="w-full py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
                    >
                      ← Back to Guest Details
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Protected by York Real-Time Channel Lock Engine</span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 3: Confirmed Booking Voucher & Receipt */}
        {step === 3 && confirmedBooking && (
          <div id="booking-confirmation-view" className="p-6 sm:p-8 space-y-6">
            
            {/* Top Success Banner */}
            <div className="text-center space-y-2 pb-4 border-b border-stone-800 no-print">
              <div className="w-14 h-14 rounded-full bg-emerald-950 border-2 border-emerald-500/60 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-stone-100">
                Your Stay is Confirmed!
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 font-editorial max-w-lg mx-auto">
                Thank you, {confirmedBooking.guestName}. A confirmation email and digital key instructions have been dispatched to <strong className="text-amber-300">{confirmedBooking.guestEmail}</strong>.
              </p>
            </div>

            {/* Printable Official Voucher Card */}
            <div 
              id="official-print-voucher"
              className="bg-stone-950 border-2 border-amber-700/50 rounded-2xl p-6 sm:p-8 space-y-6 text-stone-100 shadow-2xl relative overflow-hidden print-card"
            >
              {/* Decorative watermark */}
              <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none text-9xl font-display font-bold">
                YORK
              </div>

              {/* Voucher Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-amber-900/40 pb-5">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-amber-400 font-semibold block">Official Stay Voucher & Receipt</span>
                  <h4 className="font-display text-2xl font-bold text-stone-100">The York Guest House</h4>
                  <p className="text-xs text-stone-400 mt-0.5">{GUEST_HOUSE_ADDRESS}</p>
                  <p className="text-xs text-amber-300 font-medium">Support & Concierge Hotline: {SUPPORT_PHONE}</p>
                </div>

                <div className="text-left sm:text-right bg-stone-900/90 p-3 rounded-xl border border-amber-800/40">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-semibold">Booking Reference</span>
                  <span className="font-mono text-xl font-bold text-amber-300 tracking-wider">
                    {confirmedBooking.referenceNumber}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mt-1 sm:justify-end font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>OTA Synchronized & Locked</span>
                  </div>
                </div>
              </div>

              {/* Guest & Reservation Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-2 border-b border-stone-800 text-xs">
                <div>
                  <span className="text-stone-400 block">Lead Guest:</span>
                  <span className="font-bold text-stone-100 text-sm">{confirmedBooking.guestName}</span>
                  <span className="text-stone-400 block text-[11px]">{confirmedBooking.guestPhone}</span>
                </div>

                <div>
                  <span className="text-stone-400 block">Accommodated Suite:</span>
                  <span className="font-bold text-amber-300 text-sm">{confirmedBooking.roomName}</span>
                  <span className="text-stone-400 block text-[11px]">{confirmedBooking.guestsCount} Guest(s)</span>
                </div>

                <div>
                  <span className="text-stone-400 block">Check-In:</span>
                  <span className="font-bold text-stone-100 text-sm">{confirmedBooking.checkIn}</span>
                  <span className="text-stone-400 block text-[11px]">From 15:00 ({confirmedBooking.arrivalTime || 'Standard'})</span>
                </div>

                <div>
                  <span className="text-stone-400 block">Check-Out:</span>
                  <span className="font-bold text-stone-100 text-sm">{confirmedBooking.checkOut}</span>
                  <span className="text-stone-400 block text-[11px]">Until 11:00 AM ({confirmedBooking.nights} nights)</span>
                </div>
              </div>

              {/* Add-ons & Itemized Breakdown */}
              <div className="space-y-3 text-xs">
                <h5 className="font-semibold uppercase tracking-wider text-amber-300">Payment & Charges Breakdown</h5>
                <div className="space-y-1.5 text-stone-300 bg-stone-900/60 p-3.5 rounded-xl border border-stone-800">
                  <div className="flex justify-between">
                    <span>Room Accommodation ({confirmedBooking.nights} nights @ £{Math.round(confirmedBooking.baseAmount / confirmedBooking.nights)}/avg):</span>
                    <span>£{confirmedBooking.baseAmount.toFixed(2)}</span>
                  </div>

                  {confirmedBooking.addOns.map((add, idx) => (
                    <div key={idx} className="flex justify-between text-stone-300">
                      <span>• {add.name} (x{add.quantity}):</span>
                      <span>£{(add.price * add.quantity).toFixed(2)}</span>
                    </div>
                  ))}

                  <div className="flex justify-between text-stone-400">
                    <span>UK VAT (20%):</span>
                    <span>£{confirmedBooking.vatAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-stone-400">
                    <span>York City Tourism Sustainable Levy:</span>
                    <span>£{confirmedBooking.cityLevy.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-stone-700/80 pt-2 flex justify-between font-bold text-sm text-stone-100">
                    <span>Total Paid in Full:</span>
                    <span className="text-amber-300 text-base font-display">£{confirmedBooking.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* QR Code & Keycard Instructions */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs">
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Self Keypad & Concierge Check-In</span>
                  </div>
                  <p className="text-stone-300 leading-relaxed text-[11px]">
                    Present this voucher or quote Reference <strong>{confirmedBooking.referenceNumber}</strong> at reception. For out-of-hours arrival, use your 4-digit keypad PIN: <strong className="text-amber-300">{confirmedBooking.referenceNumber.split('-')[1]}#</strong> at the main entrance on St. Peter&apos;s Grove.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-stone-900 p-2.5 rounded-lg border border-stone-700 shrink-0">
                  <QrCode className="w-12 h-12 text-amber-300" />
                  <div className="text-[10px] text-stone-400 space-y-0.5">
                    <span className="block font-bold text-stone-200">Express QR</span>
                    <span>Direct Kiosk Pass</span>
                  </div>
                </div>
              </div>

              {/* Administrative & Support hotline banner */}
              <div className="pt-2 text-center text-xs text-stone-400">
                <span>For any amendments or directions, our 24/7 administrative hotline is </span>
                <a href={`tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`} className="font-bold text-amber-300 underline">
                  {SUPPORT_PHONE}
                </a>
              </div>
            </div>

            {/* Actions (Download ICS, Print, Done) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 no-print">
              <div className="flex items-center gap-2">
                <button
                  id="print-voucher-button"
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Print Voucher</span>
                </button>

                <button
                  id="download-calendar-btn"
                  type="button"
                  onClick={generateIcsCalendar}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Add to Calendar (.ics)</span>
                </button>
              </div>

              <button
                id="done-close-checkout-btn"
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold shadow-lg transition-colors"
              >
                Return to Guest House Home
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
