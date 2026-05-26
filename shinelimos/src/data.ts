// Site-wide content & SEO data

export const COMPANY = {
  name: "ShineLimos LLC",
  tagline: "Washington DC's Premier Black Car & Chauffeur Service",
  phone: "+1 (202) 951-7172",
  phoneRaw: "+12029517172",
  email: "booking@shinelimos.com",
  address: "13455 Sunrise Valley drive Herndon Virginia 20171",
  hours: "24 / 7 / 365 — On-Demand & Reserved",
};

export type Vehicle = {
  slug: string;
  name: string;
  category: string;
  passengers: number;
  luggage: number;
  features: string[];
  image: string;
  blurb: string;
};

export const FLEET: Vehicle[] = [
  {
    slug: "s-class",
    name: "Mercedes-Benz S-Class",
    category: "Executive Sedan",
    passengers: 3,
    luggage: 3,
    features: ["Heated Nappa Leather", "Climate Zones", "Burmester® Audio", "Privacy Glass"],
    image: "/images/S class.jpg",
    blurb: "The defining flagship of executive travel — silent, swift and unmistakably refined."
  },
  {
    slug: "cadillac-escalade",
    name: "Cadillac Escalade ESV",
    category: "Luxury SUV",
    passengers: 6,
    luggage: 6,
    features: ["Captain's Chairs", "Panoramic Roof", "AKG Studio Audio", "Massage Seats"],
    image: "/images/Cadillac Escalade.jpg",
    blurb: "Commanding presence with limousine-level comfort for executives, families & VIPs."
  },
  {
    slug: "chevrolet-suburban",
    name: "Chevrolet Suburban",
    category: "Luxury SUV",
    passengers: 6,
    luggage: 7,
    features: ["Leather Seating", "Tri-Zone Climate Control", "Bose® Sound System", "Spacious Cargo"],
    image: "/images/Chevrolet Suburban.jpg",
    blurb: "The premium workhorse of luxury group transit, offering unparalleled luggage capacity."
  },
  {
    slug: "lincoln-navigator",
    name: "Lincoln Navigator",
    category: "Luxury SUV",
    passengers: 6,
    luggage: 6,
    features: ["Perfect Position Seats", "Revel® Audio", "ActiveMotion Massage", "Ambient Lighting"],
    image: "/images/Lincoln navigator-SUV.jpg",
    blurb: "A sanctuary on wheels, combining bespoke craftsmanship with cutting-edge comfort."
  },
  {
    slug: "sprinter-van",
    name: "Mercedes-Benz Sprinter Limo",
    category: "Sprinter Van",
    passengers: 14,
    luggage: 14,
    features: ["Stand-Up Cabin", "LED Mood Lighting", "USB-C at Every Seat", "Onboard Bar"],
    image: "/images/sprinter (mercedes van).jpg",
    blurb: "First-class group travel for corporate roadshows, weddings and VIP events."
  },
  {
    slug: "30-pax-bus",
    name: "30-Passenger Party Bus",
    category: "Party Bus",
    passengers: 30,
    luggage: 10,
    features: ["Dance Floor", "Laser Lighting", "Premium Bar", "Subwoofer Audio"],
    image: "/images/30 PAX bus.jpg",
    blurb: "The destination becomes the journey — your private lounge on wheels."
  },
  {
    slug: "50-pax-bus",
    name: "50-Passenger Executive Coach",
    category: "Executive Coach",
    passengers: 50,
    luggage: 50,
    features: ["Under-Coach Luggage", "Reclining Seats", "Overhead Storage", "PA System"],
    image: "/images/50 PAX bus.jpg",
    blurb: "Elite long-distance transit for large-scale corporate events, conventions, and wedding parties."
  }
];

export type Service = {
  slug: string;
  title: string;
  short: string;
  hero: string;
  intro: string;
  highlights: string[];
  benefits: { title: string; body: string }[];
  seoTitle: string;
  seoDesc: string;
  vehicles: string[];
};

export const SERVICES: Service[] = [
  {
    slug: "airport-limo-service",
    title: "Airport Limo Service",
    short: "Stress-free airport black car transfers to Dulles, Reagan, and BWI. Flight tracking and meet & greet service.",
    hero: "/images/sedan.jpg",
    intro:
      "Experience a seamless transition between the runway and the road. With real-time flight tracking, airport meet-and-greet, and a generous 60-minute wait window, our airport limo service is optimized for the modern executive and luxury traveler.",
    highlights: [
      "Real-time flight tracking & adjustment",
      "Meet & Greet service in the terminal",
      "Complimentary 60 minutes waiting time",
      "Fixed, all-inclusive rates"
    ],
    benefits: [
      { title: "Punctuality Guarantee", body: "We track your flight live so your chauffeur is always ready, regardless of delays." },
      { title: "Luggage Assistance", body: "Our professional chauffeur takes care of your heavy bags from baggage claim to the trunk." },
      { title: "All DMV Airports", body: "Coverage across Dulles (IAD), Reagan National (DCA), and BWI." }
    ],
    seoTitle: "Luxury Airport Limo Service Washington DC | Dulles & Reagan",
    seoDesc:
      "Premium airport limousine and black car service in Washington DC. Reliable transfers to Dulles (IAD) and Reagan (DCA).",
    vehicles: ["s-class", "cadillac-escalade", "chevrolet-suburban", "lincoln-navigator"]
  },
  {
    slug: "wedding-limo-service",
    title: "Wedding Limo Service",
    short: "Our friendly and attentive wedding day chauffeur service ensures you can truly relax and enjoy your special day.",
    hero: "https://images.pexels.com/photos/14011664/pexels-photo-14011664.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000",
    intro:
      "Make your wedding day unforgettable with our premium wedding limo services. From white-glove chauffeur assistance to coordinating guest shuttles, we handle every transportation detail so you can focus on celebrating.",
    highlights: [
      "Immaculately detailed luxury fleet",
      "Attentive, suited wedding chauffeurs",
      "Custom wedding party coordinating",
      "Complimentary bottled water and ice"
    ],
    benefits: [
      { title: "Photogenic Fleet", body: "Stunning luxury vehicles that serve as the perfect backdrop for wedding memories." },
      { title: "Timeline Control", body: "Precision planning to ensure bride, groom, and wedding party arrive exactly on time." },
      { title: "Guest Shuttles", body: "Seamless group transport options for family and guests to and from the venue." }
    ],
    seoTitle: "Luxury Wedding Limo & Chauffeur Services Washington DC",
    seoDesc:
      "Elegant wedding limousine services in Washington DC, Maryland, and Virginia. Make your special day perfect with ShineLimos.",
    vehicles: ["s-class", "cadillac-escalade", "lincoln-navigator", "sprinter-van", "30-pax-bus", "50-pax-bus"]
  },
  {
    slug: "party-bus-rental",
    title: "Party Bus Rental",
    short: "The ultimate group transport experience with luxury amenities, sound systems, and premium seating.",
    hero: "https://images.pexels.com/photos/2034851/pexels-photo-2034851.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000",
    intro:
      "Celebrate in style with our state-of-the-art party buses. Equipped with leather perimeter seating, club-grade sound systems, LED color-changing ambient lighting, and refreshment bars, it is the premier choice for group events, wine tours, and nights out.",
    highlights: [
      "Spacious leather perimeter seating",
      "Premium surround sound & Bluetooth",
      "Dynamic LED ambient light settings",
      "Built-in coolers & beverage stations"
    ],
    benefits: [
      { title: "Unrivaled Comfort", body: "Stand, socialize, and dance while traveling to your destination." },
      { title: "Safe Group Travel", body: "Keep your entire group together with a dedicated professional driver." },
      { title: "Event-Ready", body: "Perfect for bachelor/bachelorette parties, corporate celebrations, and sports events." }
    ],
    seoTitle: "Luxury Party Bus Rentals Washington DC | Group Event Transportation",
    seoDesc:
      "Rent a luxury party bus in DC, MD, and VA. Sound systems, lighting, and premium amenities for any group celebration.",
    vehicles: ["30-pax-bus", "50-pax-bus", "sprinter-van"]
  },
  {
    slug: "black-car-service",
    title: "Black Car Service",
    short: "Discreet and premium hourly black car charters tailored for business meetings and corporate DMV travel.",
    hero: "/images/Mercedes Benz S Class  luxury sedan.webp",
    intro:
      "A professional solution for daily business travel, roadshows, and executive transits. Our premium black car service offers point-to-point convenience or flexible hourly charters with absolute discretion and reliability.",
    highlights: [
      "Hourly and point-to-point bookings",
      "Discreet, background-checked chauffeurs",
      "Equipped for mobile office productivity",
      "Strict confidentiality protocols"
    ],
    benefits: [
      { title: "Maximize Productivity", body: "Focus on preparation and calls in a quiet, distraction-free environment." },
      { title: "Polished Impression", body: "Arrive in a pristine, late-model executive sedan." },
      { title: "Standby Flexibility", body: "Your chauffeur remains on standby for dynamic changes to your schedule." }
    ],
    seoTitle: "Executive Black Car & Chauffeur Service Washington DC",
    seoDesc:
      "Premium corporate black car service for business executives in Washington DC. Hourly charters, airport rides, and client transits.",
    vehicles: ["s-class", "cadillac-escalade", "chevrolet-suburban", "lincoln-navigator"]
  },
  {
    slug: "suv-limo-service",
    title: "SUV Limo Service",
    short: "Spacious luxury SUV transport offering superior legroom, road presence, and passenger comfort.",
    hero: "/images/Lincoln navigator-SUV.jpg",
    intro:
      "Combine status, spaciousness, and all-weather capability. Our luxury SUV limo service featuring Cadillac Escalades and Lincoln Navigators is the preferred choice for diplomatic missions, corporate teams, and families traveling through the DMV area.",
    highlights: [
      "Spacious seating for up to 6 passengers",
      "Generous luggage compartment space",
      "Commanding road presence & security",
      "Premium acoustic insulation"
    ],
    benefits: [
      { title: "Diplomatic Standard", body: "Spacious, high-security SUVs favored by diplomats and executives." },
      { title: "DMV Area Comfort", body: "Extra legroom and separate climate control for absolute comfort." },
      { title: "Ample Baggage", body: "Easily accommodates full sets of luggage or golf bags." }
    ],
    seoTitle: "Luxury SUV Limo & Escalade Service Washington DC",
    seoDesc:
      "Book a premium luxury SUV chauffeur service in Washington DC. Perfect for corporate travel, families, and diplomatic transfers.",
    vehicles: ["cadillac-escalade", "chevrolet-suburban", "lincoln-navigator"]
  },
  {
    slug: "sprinter-van-rental",
    title: "Sprinter Van Rental",
    short: "Premium executive Mercedes-Benz Sprinter transit for corporate teams, roadshows, and events.",
    hero: "https://images.pexels.com/photos/15200595/pexels-photo-15200595.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000",
    intro:
      "Experience the ultimate in group business travel. Our Mercedes-Benz Sprinters offer standing headroom, captain's chair seating, dedicated workspace areas, and high-speed connectivity — designed to operate as a high-velocity mobile boardroom.",
    highlights: [
      "Executive leather captain's chairs",
      "Standing headroom and wide aisles",
      "Power stations & high-speed Wi-Fi",
      "Separate rear luggage partition"
    ],
    benefits: [
      { title: "Team Synergy", body: "Travel together in a layout optimized for face-to-face briefing." },
      { title: "Boardroom on Wheels", body: "Review presentations and run team sessions while in transit." },
      { title: "Smooth Transit", body: "Advanced suspension guarantees a smooth, quiet corporate ride." }
    ],
    seoTitle: "Mercedes-Benz Sprinter Limo Rentals Washington DC",
    seoDesc:
      "Executive Mercedes Sprinter rentals in the DC metro area. High-end group transport for corporate roadshows and wedding events.",
    vehicles: ["sprinter-van", "30-pax-bus", "50-pax-bus"]
  },
  {
    slug: "luxury-car-rental",
    title: "Luxury Car Rental",
    short: "Chauffeur-driven exotic and ultra-luxury sedans for premium brand events and VIP clients.",
    hero: "https://images.pexels.com/photos/29580163/pexels-photo-29580163.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400",
    intro:
      "Access our exclusive collection of the world's finest motorcars. From Rolls-Royce Ghosts to Bentley Flying Spurs, enjoy an unmatched standard of automotive luxury, complete with an elite chauffeur trained in high-profile VIP transport.",
    highlights: [
      "Exotic and ultra-luxury motorcars",
      "Elite, specialized VIP chauffeurs",
      "Custom concierge and detail requests",
      "Discretion and privacy guaranteed"
    ],
    benefits: [
      { title: "VIP Treatment", body: "The ultimate statement of luxury, designed for high-profile individuals." },
      { title: "Hand-Selected Fleet", body: "Every vehicle is in absolute showroom condition." },
      { title: "Bespoke Service", body: "Indulge in tailored amenities, specialized security, or dietary requests." }
    ],
    seoTitle: "Chauffeur Luxury & Exotic Car Rental Washington DC",
    seoDesc:
      "Experience the ultimate in luxury travel. Rent a chauffeur-driven Rolls-Royce, Bentley, or Mercedes-Maybach in Washington DC.",
    vehicles: ["s-class", "cadillac-escalade", "lincoln-navigator"]
  }
];

export type Location = {
  slug: string;
  city: string;
  region: string;
  hero: string;
  intro: string;
  highlights: string[];
  landmarks: string[];
  seoTitle: string;
  seoDesc: string;
};

export const LOCATIONS: Location[] = [
  {
    slug: "washington-dc",
    city: "Washington DC",
    region: "Limo Service",
    hero: "https://images.pexels.com/photos/5288741/pexels-photo-5288741.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000",
    intro:
      "From Capitol Hill to Georgetown, from Embassy Row to the Wharf — ShineLimos LLC is the District's most trusted name in executive transportation. State dinners, embassy functions, K-Street boardrooms and Smithsonian galas — we move the people who move Washington.",
    highlights: [
      "24/7 dispatch across all four quadrants",
      "Approved vendor for multiple embassies & federal agencies",
      "Familiar with every restricted-zone protocol",
      "Hotel concierge partnerships citywide"
    ],
    landmarks: ["U.S. Capitol", "The White House", "Kennedy Center", "Smithsonian", "Georgetown", "The Wharf"],
    seoTitle: "Washington DC Limo Service | ShineLimos LLC",
    seoDesc:
      "Premier limousine & black car service in Washington DC. 24/7 chauffeur service to Capitol Hill, Georgetown, Embassy Row. Book online."
  },
  {
    slug: "alexandria-va",
    city: "Alexandria VA",
    region: "Limo Service",
    hero: "https://images.pexels.com/photos/8425047/pexels-photo-8425047.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000",
    intro:
      "Old Town's cobblestone charm deserves transportation as timeless as the city itself. We provide chauffeured service throughout Alexandria, from waterfront weddings at the Torpedo Factory to executive transfers from the Patent & Trademark Office.",
    highlights: [
      "Old Town wedding & event specialists",
      "Direct service to DCA in under 10 minutes",
      "Hotel partnerships on King Street & the waterfront",
      "Wine-country tours to Loudoun & Virginia hunt country"
    ],
    landmarks: ["Old Town Alexandria", "Mount Vernon", "Torpedo Factory", "King Street", "USPTO"],
    seoTitle: "Alexandria VA Limo Service | Chauffeur & Black Car",
    seoDesc:
      "Luxury limo and chauffeur service in Alexandria, VA. Weddings, airport, executive transport in Old Town & beyond. Book 24/7."
  },
  {
    slug: "arlington-va",
    city: "Arlington VA",
    region: "Limo Service",
    hero: "/images/suv.webp",
    intro:
      "Crystal City, Rosslyn, Ballston, Pentagon City — Arlington is the heart of corporate Northern Virginia, and our fleet is the heart of corporate transportation here. Trusted by Fortune 500 firms, defense contractors and Amazon HQ2 executives.",
    highlights: [
      "Direct Pentagon & DCA access (under 5 min)",
      "Trusted by major defense & technology firms",
      "Arlington Cemetery dignitary transport",
      "Crystal City & Amazon HQ2 corporate accounts"
    ],
    landmarks: ["Pentagon", "Arlington National Cemetery", "Crystal City", "Rosslyn", "Ballston", "Amazon HQ2"],
    seoTitle: "Arlington VA Limo Service | Pentagon & Crystal City Chauffeur",
    seoDesc:
      "Executive chauffeur and limo service in Arlington, Virginia. Trusted by Pentagon, Amazon HQ2 & defense industry. 24/7 dispatch."
  },
  {
    slug: "tysons-corner",
    city: "Tysons Corner",
    region: "Luxury Car Rental",
    hero: "https://images.pexels.com/photos/8605325/pexels-photo-8605325.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000",
    intro:
      "Tysons is where the DMV does business — and where our executive sedans, SUVs and Sprinter vans keep that business moving. From Capital One headquarters to the Ritz-Carlton, from Tysons Galleria to Wolf Trap, we know every loading zone, valet entrance and shortcut.",
    highlights: [
      "Hourly corporate roadshow charters",
      "Capital One, Hilton, MITRE & Booz Allen accounts",
      "Same-day Tysons-to-IAD service in 25 minutes",
      "Luxury self-drive rentals delivered to your office"
    ],
    landmarks: ["Tysons Galleria", "Tysons Corner Center", "Capital One HQ", "Wolf Trap", "Ritz-Carlton Tysons"],
    seoTitle: "Tysons Corner Luxury Car Rental & Limo Service",
    seoDesc:
      "Luxury car rental, black car & limo service in Tysons Corner, VA. Corporate roadshows, airport, weddings. Capital One HQ vendor."
  },
  {
    slug: "fairfax-va",
    city: "Fairfax VA",
    region: "Limo Service",
    hero: "https://images.pexels.com/photos/9411658/pexels-photo-9411658.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000",
    intro:
      "Fairfax County is the DMV's largest residential and corporate hub — and our chauffeurs know every cul-de-sac of Vienna, Oakton, Reston, Herndon and Fairfax City. School proms, wedding weekends, GMU events, IAD transfers and corporate accounts.",
    highlights: [
      "Door-to-door pickups across Fairfax County",
      "Prom & graduation packages for area high schools",
      "George Mason University & Inova Health partnerships",
      "Discounted multi-vehicle wedding bundles"
    ],
    landmarks: ["George Mason University", "Inova Fairfax Hospital", "Vienna", "Reston Town Center", "Fair Oaks Mall"],
    seoTitle: "Fairfax VA Limo Service | Chauffeur & Prom Limos",
    seoDesc:
      "Fairfax County's trusted limo and black car service. Weddings, proms, airport, corporate. Vienna, Reston, Herndon, Oakton."
  }
];

export const TESTIMONIALS = [
  {
    name: "Senator's Chief of Staff",
    role: "Capitol Hill",
    quote:
      "ShineLimos has become our default for every Senate delegation we host. Faultless punctuality, total discretion.",
  },
  {
    name: "Priya & Aman Sharma",
    role: "Wedding • The Hay-Adams",
    quote:
      "From rehearsal dinner to send-off, the team coordinated 11 vehicles across three venues. Not one hiccup.",
  },
  {
    name: "Marcus Webb",
    role: "Managing Partner, McGuire Capital",
    quote:
      "Our IPO roadshow had 23 city transfers in 6 days. The Sprinter became our second conference room.",
  },
  {
    name: "Lena Park",
    role: "Travel Manager, Fortune 100",
    quote:
      "Direct billing, consolidated invoicing and a single phone number. They saved our travel team hundreds of hours.",
  },
];
