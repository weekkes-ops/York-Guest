'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Attraction } from '@/lib/types';
import { ATTRACTIONS, SUPPORT_PHONE } from '@/lib/data';
import {
  Compass,
  MapPin,
  Clock,
  Star,
  Sparkles,
  Lightbulb,
  Gift,
  Bot,
  Loader2,
  ExternalLink,
  ChevronRight,
  Filter,
  Phone,
  BookmarkCheck
} from 'lucide-react';

export const AttractionsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);

  // AI Concierge State
  const [aiPrompt, setAiPrompt] = useState('');
  const [stayDuration, setStayDuration] = useState('2-3 Days Weekend');
  const [guestType, setGuestType] = useState('Couples & Romance');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Medieval History', 'Afternoon Teas & Gastronomy', 'Ghost Walks']);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [showAiPlanner, setShowAiPlanner] = useState(false);

  const categories = [
    'ALL',
    'Heritage & Sights',
    'Food & Tea Rooms',
    'Walks & Scenery',
    'Family & Culture',
    'Ghost & Mystery',
  ];

  const filteredAttractions = activeCategory === 'ALL'
    ? ATTRACTIONS
    : ATTRACTIONS.filter((a) => a.category === activeCategory);

  const toggleInterest = (item: string) => {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleGenerateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/gemini/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt || 'Craft an enchanting York itinerary tailored for our stay',
          stayDuration,
          guestType,
          interests: selectedInterests,
        }),
      });

      const data = await res.json();
      setAiResponse(data.recommendation || 'Enjoy your journey in York! For assistance, call (088) 557740.');
    } catch (err) {
      console.error(err);
      setAiResponse('Our concierge is ready to assist you directly at (088) 557740.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <section id="attractions" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-900/30 border border-amber-600/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Local Area & Concierge Guide</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-display font-bold text-stone-100">
          Discover Historic York from Our Doorstep
        </h2>

        <p className="text-sm sm:text-base text-stone-400 font-editorial leading-relaxed">
          The York Guest House is situated in Bootham, mere minutes from the city walls, cobbled lanes, and gothic cathedrals. Explore curated highlights with exclusive guest privileges.
        </p>

        {/* Action Toggle for AI Concierge */}
        <div className="pt-2">
          <button
            id="toggle-ai-concierge-btn"
            onClick={() => setShowAiPlanner(!showAiPlanner)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-amber-950/40 border border-amber-400/30 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>{showAiPlanner ? 'Hide AI Concierge Planner' : 'Ask AI Concierge: Generate Bespoke York Itinerary'}</span>
          </button>
        </div>
      </div>

      {/* AI York Concierge Planner Drawer / Card */}
      {showAiPlanner && (
        <div id="ai-concierge-panel" className="bg-stone-900/90 border-2 border-amber-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in slide-in-from-top-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-stone-100 flex items-center gap-2">
                  <span>York Guest House AI Concierge</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    Powered by Gemini 3.7
                  </span>
                </h3>
                <p className="text-xs text-stone-400">Personalized day-by-day itineraries & insider hidden gems</p>
              </div>
            </div>

            <a
              href={`tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`}
              className="text-xs text-amber-300 hover:text-amber-100 flex items-center gap-1.5 bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Concierge Desk: {SUPPORT_PHONE}</span>
            </a>
          </div>

          <form onSubmit={handleGenerateItinerary} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-xs font-semibold uppercase text-amber-300/90 mb-1.5">
                  Stay Duration
                </label>
                <select
                  value={stayDuration}
                  onChange={(e) => setStayDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="1 Day Express Highlights">1 Day Express (Highlights)</option>
                  <option value="2-3 Days Weekend">2-3 Days Weekend (Classic)</option>
                  <option value="4-5 Days Leisure">4-5 Days Leisure Stay</option>
                  <option value="1 Week North Yorkshire Explorer">1 Week North Yorkshire Explorer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-amber-300/90 mb-1.5">
                  Party Type
                </label>
                <select
                  value={guestType}
                  onChange={(e) => setGuestType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Couples & Romance">Couples & Romantic Escape</option>
                  <option value="Family with Children">Family with Children</option>
                  <option value="Solo History & Architecture Enthusiast">Solo History & Architecture Enthusiast</option>
                  <option value="Friends Group / Foodie Weekend">Friends / Foodie & Pub Walk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-amber-300/90 mb-1.5">
                  Custom Request / Specific Interests
                </label>
                <input
                  type="text"
                  placeholder="e.g. Best pub roasts, evening ghost walks, camera spots..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

            </div>

            {/* Interest pills */}
            <div>
              <span className="block text-xs font-semibold uppercase text-stone-400 mb-2">
                Select Your Key Interests:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Medieval History',
                  'York Minster Rooftops',
                  'Afternoon Teas & Gastronomy',
                  'Ghost Walks',
                  'Viking Heritage',
                  'Scenic River Cruises',
                  'Artisan Shopping & Shambles',
                  'Craft Ale Pubs'
                ].map((item) => {
                  const isSelected = selectedInterests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-amber-600 text-stone-950 font-bold border border-amber-400'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700 border border-stone-700'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              id="generate-ai-itinerary-btn"
              type="submit"
              disabled={aiLoading}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Formulating Personalized York Itinerary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Bespoke Itinerary</span>
                </>
              )}
            </button>
          </form>

          {/* AI Output Box */}
          {aiResponse && (
            <div className="p-6 rounded-xl bg-stone-950 border border-amber-800/40 space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed font-editorial">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="font-display font-bold text-amber-300 text-base">
                  Your Bespoke York Concierge Plan
                </span>
                <span className="text-[11px] text-stone-400 font-sans">
                  Starting from 14 St. Peter&apos;s Grove (The York Guest House)
                </span>
              </div>
              <div className="whitespace-pre-wrap space-y-2">{aiResponse}</div>
            </div>
          )}
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center justify-center flex-wrap gap-2">
        <Filter className="w-4 h-4 text-amber-400 mr-1 hidden sm:inline" />
        {categories.map((cat) => (
          <button
            key={cat}
            id={`filter-attraction-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-amber-600 text-stone-950 shadow-md shadow-amber-950/40 border border-amber-400'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 border border-stone-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Attractions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredAttractions.map((attraction) => (
          <div
            key={attraction.id}
            id={`attraction-card-${attraction.id}`}
            onClick={() => setSelectedAttraction(attraction)}
            className="group bg-stone-900/90 rounded-2xl border border-stone-800 hover:border-amber-700/60 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-amber-950/20 cursor-pointer"
          >
            <div>
              {/* Photo */}
              <div className="relative h-48 w-full overflow-hidden bg-stone-950">
                <Image
                  src={attraction.imageUrl}
                  alt={attraction.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/30" />

                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-900/90 text-amber-300 border border-stone-700 backdrop-blur-sm">
                    {attraction.category}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[11px] text-stone-200">
                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{attraction.distance}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-1">
                  <h3 className="font-display font-bold text-base text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                    {attraction.name}
                  </h3>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{attraction.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-400 font-editorial line-clamp-2 leading-relaxed">
                  {attraction.description}
                </p>

                {/* Insider Tip Callout */}
                <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/30 text-[11px] text-amber-200 flex items-start gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{attraction.insiderTip}</span>
                </div>

                {/* Guest perk badge if available */}
                {attraction.guestPerk && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                    <Gift className="w-3 h-3 shrink-0" />
                    <span className="truncate">{attraction.guestPerk}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-4 py-3 border-t border-stone-800/80 bg-stone-950/40 flex items-center justify-between text-xs text-stone-400">
              <span>{attraction.priceNote.split('(')[0]}</span>
              <span className="text-amber-400 group-hover:text-amber-300 font-semibold flex items-center gap-1">
                Details <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Attraction Detail Modal */}
      {selectedAttraction && (
        <div id="attraction-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative bg-stone-900 border border-amber-700/50 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 text-stone-100 shadow-2xl">
            <button
              onClick={() => setSelectedAttraction(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white"
            >
              ✕
            </button>

            <div className="relative h-64 w-full rounded-xl overflow-hidden bg-stone-950">
              <Image
                src={selectedAttraction.imageUrl}
                alt={selectedAttraction.name}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-stone-950">
                  {selectedAttraction.category}
                </span>
                <h3 className="text-2xl font-display font-bold text-stone-100 mt-2">
                  {selectedAttraction.name}
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-stone-800/60 border border-stone-700/60 text-xs">
                <div>
                  <span className="text-stone-400 block">Walking Distance:</span>
                  <span className="font-bold text-amber-300">{selectedAttraction.distance}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Recommended Time:</span>
                  <span className="font-bold text-stone-200">{selectedAttraction.duration}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Visitor Rating:</span>
                  <span className="font-bold text-amber-400">★ {selectedAttraction.rating} ({selectedAttraction.reviewCount.toLocaleString()} reviews)</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-amber-300 uppercase tracking-wider text-xs mb-1">Description</h4>
                <p className="text-stone-300 font-editorial leading-relaxed">{selectedAttraction.description}</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/40 space-y-1 text-amber-200">
                <div className="font-bold flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Head Concierge Insider Tip</span>
                </div>
                <p className="text-xs text-stone-300">{selectedAttraction.insiderTip}</p>
              </div>

              {selectedAttraction.guestPerk && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">{selectedAttraction.guestPerk}</span>
                </div>
              )}

              <div className="text-xs text-stone-400 space-y-1">
                <div>• <strong>Location:</strong> {selectedAttraction.address}</div>
                <div>• <strong>Opening Hours:</strong> {selectedAttraction.openingHours}</div>
                <div>• <strong>Admission:</strong> {selectedAttraction.priceNote}</div>
              </div>

              <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                <span className="text-xs text-stone-400">
                  Concierge assistance hotline: <strong className="text-amber-300">{SUPPORT_PHONE}</strong>
                </span>
                <button
                  onClick={() => setSelectedAttraction(null)}
                  className="px-5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs"
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
