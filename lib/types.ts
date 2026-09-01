export interface Room {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  pricePerNight: number;
  weekendPrice: number;
  maxGuests: number;
  bedType: string;
  sizeSqM: number;
  floor: string;
  view: string;
  images: string[];
  amenities: string[];
  highlights: string[];
  badge?: string;
  totalUnits: number;
}

export interface BookingAddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  perPerson?: boolean;
  perNight?: boolean;
  iconName: string;
}

export type ChannelSource = 'DIRECT' | 'AIRBNB' | 'BOOKING_COM' | 'EXPEDIA' | 'VRBO' | 'ICAL_FEED';

export interface Booking {
  id: string;
  referenceNumber: string;
  roomId: string;
  roomName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  guestsCount: number;
  baseAmount: number;
  addOnsAmount: number;
  vatAmount: number;
  cityLevy: number;
  totalAmount: number;
  addOns: { id: string; name: string; price: number; quantity: number }[];
  channelSource: ChannelSource;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  paymentMethod: 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY';
  cardLast4?: string;
  cardBrand?: string;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  createdAt: string;
  specialRequests?: string;
  arrivalTime?: string;
  isDoubleBookingProtected: boolean;
}

export interface ChannelSyncStatus {
  id: string;
  name: string;
  platform: 'Airbnb' | 'Booking.com' | 'Expedia' | 'VRBO' | 'Direct iCal';
  status: 'ACTIVE' | 'SYNCING' | 'SYNCED' | 'ERROR';
  lastSync: string;
  syncedListingsCount: number;
  activeReservationsCount: number;
  rateParity: number; // e.g. 100%
  autoSyncIntervalMins: number;
  icalUrl: string;
}

export interface Attraction {
  id: string;
  name: string;
  category: 'Heritage & Sights' | 'Food & Tea Rooms' | 'Walks & Scenery' | 'Family & Culture' | 'Ghost & Mystery';
  distance: string; // e.g., "5 min walk (0.3 mi)"
  duration: string; // e.g., "1.5 - 2 hours"
  rating: number;
  reviewCount: number;
  address: string;
  description: string;
  insiderTip: string;
  imageUrl: string;
  openingHours: string;
  priceNote: string;
  guestPerk?: string;
  mapCoords: { lat: number; lng: number };
}

export interface DateLock {
  id: string;
  roomId: string;
  date: string; // YYYY-MM-DD
  bookingId: string;
  channelSource: ChannelSource;
  guestName: string;
  lockedAt: string;
}

export interface InventoryDateCell {
  date: string;
  isAvailable: boolean;
  price: number;
  isBlocked: boolean;
  booking?: {
    id: string;
    guestName: string;
    channelSource: ChannelSource;
    reference: string;
  };
}

export interface InventoryMatrixRow {
  room: Room;
  dates: Record<string, InventoryDateCell>;
}
