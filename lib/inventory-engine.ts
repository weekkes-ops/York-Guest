import { Booking, Room, ChannelSource, InventoryMatrixRow, DateLock } from './types';
import { ROOMS, SEED_BOOKINGS, INITIAL_CHANNEL_SYNCS } from './data';

// Key for client-side persistence so user changes persist smoothly
const STORAGE_BOOKINGS_KEY = 'york_guesthouse_bookings_v2';
const STORAGE_SYNC_KEY = 'york_guesthouse_channel_sync_v2';
const STORAGE_BLOCKS_KEY = 'york_guesthouse_blocked_dates_v2';

export interface DateRange {
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
}

export interface AvailabilityResult {
  isAvailable: boolean;
  conflictingBooking?: {
    referenceNumber: string;
    channelSource: ChannelSource;
    guestName: string;
    checkIn: string;
    checkOut: string;
  };
  reason?: string;
  suggestedAlternativeRooms?: Room[];
}

export interface BlockedDateEntry {
  id: string;
  roomId: string;
  date: string; // YYYY-MM-DD
  reason: string; // e.g. "Deep cleaning & painting", "Owner private hold"
}

export function getStoredBookings(): Booking[] {
  if (typeof window === 'undefined') return SEED_BOOKINGS;
  try {
    const raw = localStorage.getItem(STORAGE_BOOKINGS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(SEED_BOOKINGS));
      return SEED_BOOKINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading bookings from storage', e);
    return SEED_BOOKINGS;
  }
}

export function saveStoredBookings(bookings: Booking[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.error('Error saving bookings to storage', e);
  }
}

export function getStoredBlockedDates(): BlockedDateEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_BLOCKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredBlockedDates(blocks: BlockedDateEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_BLOCKS_KEY, JSON.stringify(blocks));
  } catch (e) {
    console.error('Error saving blocked dates', e);
  }
}

/**
 * Checks if two date ranges [checkIn1, checkOut1) and [checkIn2, checkOut2) overlap.
 * Hotel standard: check-out day is available for another guest to check-in on the same afternoon.
 */
export function doDatesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();

  // Intervals [s1, e1) and [s2, e2) overlap if max(s1, s2) < min(e1, e2)
  return Math.max(s1, s2) < Math.min(e1, e2);
}

/**
 * Direct check whether a specific room is free from bookings and blocks for the given date range.
 * Does not perform alternative room lookups to prevent recursive call stack loops.
 */
export function isRoomDirectlyAvailable(
  roomId: string,
  checkIn: string,
  checkOut: string,
  allBookings: Booking[],
  blockedDates: BlockedDateEntry[],
  excludeBookingId?: string
): { isAvailable: boolean; conflictingBooking?: Booking; reason?: string } {
  // 1. Check date validation
  if (!checkIn || !checkOut || checkIn >= checkOut) {
    return {
      isAvailable: false,
      reason: 'Invalid date selection: Check-out must be after check-in date.'
    };
  }

  // 2. Check for manual maintenance blocks
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const curr = new Date(checkInDate);

  while (curr < checkOutDate) {
    const dateStr = curr.toISOString().split('T')[0];
    const isBlocked = blockedDates.some(b => b.roomId === roomId && b.date === dateStr);
    if (isBlocked) {
      return {
        isAvailable: false,
        reason: `Room is reserved for maintenance on ${dateStr}.`
      };
    }
    curr.setDate(curr.getDate() + 1);
  }

  // 3. Check for overlapping confirmed or checked-in bookings
  const roomBookings = allBookings.filter(
    b => b.roomId === roomId &&
         b.status !== 'CANCELLED' &&
         (!excludeBookingId || b.id !== excludeBookingId)
  );

  for (const booking of roomBookings) {
    if (doDatesOverlap(checkIn, checkOut, booking.checkIn, booking.checkOut)) {
      return {
        isAvailable: false,
        conflictingBooking: booking,
        reason: `Double-booking prevention lock: This room is already reserved from ${booking.checkIn} to ${booking.checkOut} via ${booking.channelSource.replace('_', '.')}.`
      };
    }
  }

  return { isAvailable: true };
}

/**
 * Validates whether a specific room is available for a date range without any double-booking.
 */
export function checkRoomAvailability(
  roomId: string,
  checkIn: string,
  checkOut: string,
  currentBookings?: Booking[],
  excludeBookingId?: string
): AvailabilityResult {
  const allBookings = currentBookings || getStoredBookings();
  const blockedDates = getStoredBlockedDates();

  const directCheck = isRoomDirectlyAvailable(
    roomId,
    checkIn,
    checkOut,
    allBookings,
    blockedDates,
    excludeBookingId
  );

  if (!directCheck.isAvailable) {
    // Safely collect alternative rooms without recursing
    const alternativeRooms = ROOMS.filter(r => {
      if (r.id === roomId) return false;
      const altCheck = isRoomDirectlyAvailable(r.id, checkIn, checkOut, allBookings, blockedDates);
      return altCheck.isAvailable;
    });

    const conflict = directCheck.conflictingBooking;

    return {
      isAvailable: false,
      conflictingBooking: conflict ? {
        referenceNumber: conflict.referenceNumber,
        channelSource: conflict.channelSource,
        guestName: conflict.guestName,
        checkIn: conflict.checkIn,
        checkOut: conflict.checkOut
      } : undefined,
      reason: directCheck.reason,
      suggestedAlternativeRooms: alternativeRooms
    };
  }

  return { isAvailable: true };
}

/**
 * Calculates total nights and exact pricing breakdown
 */
export function calculateStayPricing(
  room: Room,
  checkIn: string,
  checkOut: string,
  guestsCount: number,
  selectedAddOnIds: { id: string; quantity: number }[]
) {
  if (!checkIn || !checkOut || checkIn >= checkOut) {
    return {
      nights: 0,
      nightlyRateAverage: room.pricePerNight,
      baseAmount: 0,
      addOnsAmount: 0,
      vatAmount: 0,
      cityLevy: 0,
      totalAmount: 0,
      breakdown: []
    };
  }

  const sDate = new Date(checkIn);
  const eDate = new Date(checkOut);
  const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let baseAmount = 0;
  const breakdown: { date: string; isWeekend: boolean; price: number }[] = [];
  const curr = new Date(sDate);

  for (let i = 0; i < nights; i++) {
    const dayOfWeek = curr.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const nightPrice = isWeekend ? room.weekendPrice : room.pricePerNight;
    baseAmount += nightPrice;
    breakdown.push({
      date: curr.toISOString().split('T')[0],
      isWeekend,
      price: nightPrice
    });
    curr.setDate(curr.getDate() + 1);
  }

  // Calculate Add-ons
  let addOnsAmount = 0;
  for (const item of selectedAddOnIds) {
    addOnsAmount += item.quantity;
  }

  const vatAmount = Number(((baseAmount + addOnsAmount) * 0.20).toFixed(2)); // UK 20% standard VAT
  const cityLevy = Number((nights * 4.00).toFixed(2)); // York Tourism Sustainable City Levy (£4/night)
  const totalAmount = Number((baseAmount + addOnsAmount + vatAmount + cityLevy).toFixed(2));

  return {
    nights,
    nightlyRateAverage: Math.round(baseAmount / Math.max(1, nights)),
    baseAmount,
    addOnsAmount,
    vatAmount,
    cityLevy,
    totalAmount,
    breakdown
  };
}

/**
 * Generates a unique secure booking reference number (e.g. YRK-7821-44)
 */
export function generateBookingReference(): string {
  const random4 = Math.floor(1000 + Math.random() * 9000);
  const random2 = Math.floor(10 + Math.random() * 90);
  return `YRK-${random4}-${random2}`;
}

/**
 * Atomically commits a new booking with double-booking lock protection
 */
export function commitNewBooking(newBookingData: Omit<Booking, 'id' | 'referenceNumber' | 'createdAt' | 'status' | 'isDoubleBookingProtected'>): {
  success: boolean;
  booking?: Booking;
  error?: string;
  conflictingBooking?: AvailabilityResult['conflictingBooking'];
} {
  const currentBookings = getStoredBookings();

  // Strict double-booking atomic check
  const check = checkRoomAvailability(
    newBookingData.roomId,
    newBookingData.checkIn,
    newBookingData.checkOut,
    currentBookings
  );

  if (!check.isAvailable) {
    return {
      success: false,
      error: check.reason || 'Requested dates are no longer available.',
      conflictingBooking: check.conflictingBooking
    };
  }

  const booking: Booking = {
    ...newBookingData,
    id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    referenceNumber: generateBookingReference(),
    createdAt: new Date().toISOString(),
    status: 'CONFIRMED',
    isDoubleBookingProtected: true
  };

  const updated = [booking, ...currentBookings];
  saveStoredBookings(updated);

  return {
    success: true,
    booking
  };
}

/**
 * Cancels a booking and releases the locked dates
 */
export function cancelBooking(bookingId: string): boolean {
  const currentBookings = getStoredBookings();
  const index = currentBookings.findIndex(b => b.id === bookingId);
  if (index === -1) return false;

  currentBookings[index].status = 'CANCELLED';
  saveStoredBookings(currentBookings);
  return true;
}

/**
 * Generates an inventory matrix grid starting from a base date for N days
 */
export function generateInventoryMatrix(
  startDateStr: string,
  daysCount: number = 14,
  bookingsList?: Booking[],
  blockedList?: BlockedDateEntry[]
): { dates: string[]; rows: InventoryMatrixRow[] } {
  const bookings = bookingsList || getStoredBookings();
  const blocks = blockedList || getStoredBlockedDates();

  const dates: string[] = [];
  const base = new Date(startDateStr);

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const rows: InventoryMatrixRow[] = ROOMS.map(room => {
    const dateCells: Record<string, any> = {};

    dates.forEach(date => {
      const dObj = new Date(date);
      const isWeekend = dObj.getDay() === 5 || dObj.getDay() === 6;
      const price = isWeekend ? room.weekendPrice : room.pricePerNight;

      // Check maintenance block
      const isBlocked = blocks.some(b => b.roomId === room.id && b.date === date);

      // Check active booking covering this date
      const activeBooking = bookings.find(b => {
        if (b.roomId !== room.id || b.status === 'CANCELLED') return false;
        return date >= b.checkIn && date < b.checkOut;
      });

      dateCells[date] = {
        date,
        isAvailable: !isBlocked && !activeBooking,
        price,
        isBlocked,
        booking: activeBooking ? {
          id: activeBooking.id,
          guestName: activeBooking.guestName,
          channelSource: activeBooking.channelSource,
          reference: activeBooking.referenceNumber
        } : undefined
      };
    });

    return {
      room,
      dates: dateCells
    };
  });

  return { dates, rows };
}
