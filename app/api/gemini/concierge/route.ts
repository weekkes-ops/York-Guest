import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { prompt, stayDuration, guestType, interests } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `You are the Head Concierge at The York Guest House (located on St. Peter's Grove, Bootham, York, YO30 6AQ). 
Telephone inquiries: (088) 557740.
Your goal is to provide exceptional, warm, charming, and highly localized York attraction recommendations and bespoke daily itineraries.
Provide rich details including walking directions from Bootham, insider timing tips to skip lines, historic secrets, afternoon tea recommendations (Bettys vs hidden gems), York ghost walks, evening dining spots (e.g. Skosh, The Star Inn The City, Roots), and scenic routes along the Roman walls and River Ouse.
Structure your recommendations clearly with time of day (Morning, Afternoon, Twilight/Evening) and practical tips. Keep the tone sophisticated, inviting, and distinctly Yorkshire.`;

      const userContent = `Guest Query: "${prompt || 'Suggest an unforgettable York itinerary'}"
Stay Duration: ${stayDuration || 'Weekend (2-3 days)'}
Party Type: ${guestType || 'Couple'}
Key Interests: ${Array.isArray(interests) ? interests.join(', ') : (interests || 'History, Food & Drink, Scenic walks')}

Please formulate a personalized itinerary and insider concierge advice starting right from The York Guest House.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: userContent,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      if (response && response.text) {
        return NextResponse.json({
          recommendation: response.text,
          source: 'gemini-3.7-flash'
        });
      }
    }

    // Fallback curated itinerary if API key is not yet set
    const fallbackItinerary = `### 🌟 Your Curated York Guest House Itinerary

**Based on:** ${guestType || 'Couples & Culture Lovers'} | **Duration:** ${stayDuration || '2-3 Days'}

#### 🏛️ Day 1: Medieval Grandeur & Roman Walls
- **08:30 AM — Farmhouse Breakfast:** Enjoy our artisan Yorkshire hamper with freshly brewed Yorkshire Gold tea in your suite.
- **09:30 AM — Bootham Bar & The City Walls (2 min walk):** Step directly out onto the elevated medieval ramparts at Bootham Bar. Walk the breathtaking section overlooking the York Minster gardens.
- **10:30 AM — York Minster & Central Tower:** Marvel at the Great East Window and ascend the 275 steps for the grandest panorama in Northern England.
- **01:00 PM — Bettys Café Tea Rooms:** Savor Yorkshire Rarebit and afternoon tea in the Belmont Room.
- **03:00 PM — The Shambles & Snickelways:** Explore the cobbled 14th-century timber-framed lanes and artisan potion and fudge shops.
- **07:30 PM — The Original Ghost Walk of York:** Depart from The King's Arms for spine-tingling tales of Roman ghosts and Dick Turpin.

#### ⚔️ Day 2: Vikings, Railways & Riverside Dining
- **10:00 AM — JORVIK Viking Centre:** Travel back to 975 AD in state-of-the-art time capsules on real archaeological grounds.
- **12:30 PM — River Ouse Scenic Walk & Lunch:** Stroll through Museum Gardens down to St. Mary's Abbey ruins, followed by riverside dining at *The Star Inn The City*.
- **02:30 PM — National Railway Museum:** Admire the Mallard steam engine and Queen Victoria's lavish royal train carriages.
- **08:00 PM — Sunset at Clifford's Tower:** Take in the golden hour light across the rooftops of medieval York.

*Need immediate table bookings or attraction passes? Contact our Concierge Desk on **(088) 557740**.*`;

    return NextResponse.json({
      recommendation: fallbackItinerary,
      source: 'curated-concierge'
    });

  } catch (error: any) {
    console.error('Error in concierge route:', error);
    return NextResponse.json(
      {
        recommendation: `### 🌟 York Concierge Highlights\n\n- **York Minster:** 6 min walk from our doorstep.\n- **The Shambles:** Best photographed early morning.\n- **Bettys Tea Rooms:** Reserve ahead or arrive at 9:00 AM.\n- **Bootham Bar Walls:** Direct access 150m from The York Guest House.\n\nFor assistance, call **(088) 557740**.`,
        source: 'fallback'
      },
      { status: 200 }
    );
  }
}
