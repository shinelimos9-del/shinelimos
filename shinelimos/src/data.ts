// Site-wide content & SEO data

export const MAPBOX_PUBLIC_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

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
    image: "/images/S class.webp",
    blurb: "The defining flagship of executive travel — silent, swift and unmistakably refined."
  },
  {
    slug: "cadillac-escalade",
    name: "Cadillac Escalade ESV",
    category: "Luxury SUV",
    passengers: 6,
    luggage: 6,
    features: ["Captain's Chairs", "Panoramic Roof", "AKG Studio Audio", "Massage Seats"],
    image: "/images/Cadillac Escalade.webp",
    blurb: "Commanding presence with limousine-level comfort for executives, families & VIPs."
  },
  {
    slug: "chevrolet-suburban",
    name: "Chevrolet Suburban",
    category: "Luxury SUV",
    passengers: 6,
    luggage: 7,
    features: ["Leather Seating", "Tri-Zone Climate Control", "Bose® Sound System", "Spacious Cargo"],
    image: "/images/Chevrolet Suburban.webp",
    blurb: "The premium workhorse of luxury group transit, offering unparalleled luggage capacity."
  },
  {
    slug: "lincoln-navigator",
    name: "Lincoln Navigator",
    category: "Luxury SUV",
    passengers: 6,
    luggage: 6,
    features: ["Perfect Position Seats", "Revel® Audio", "ActiveMotion Massage", "Ambient Lighting"],
    image: "/images/Lincoln navigator-SUV.webp",
    blurb: "A sanctuary on wheels, combining bespoke craftsmanship with cutting-edge comfort."
  },
  {
    slug: "sprinter-van",
    name: "Mercedes-Benz Sprinter Limo",
    category: "Sprinter Van",
    passengers: 14,
    luggage: 14,
    features: ["Stand-Up Cabin", "LED Mood Lighting", "USB-C at Every Seat", "Onboard Bar"],
    image: "/images/sprinter (mercedes van).webp",
    blurb: "First-class group travel for corporate roadshows, weddings and VIP events."
  },
  {
    slug: "30-pax-bus",
    name: "30-Passenger Party Bus",
    category: "Party Bus",
    passengers: 30,
    luggage: 10,
    features: ["Dance Floor", "Laser Lighting", "Premium Bar", "Subwoofer Audio"],
    image: "/images/30 PAX bus.webp",
    blurb: "The destination becomes the journey — your private lounge on wheels."
  },
  {
    slug: "50-pax-bus",
    name: "50-Passenger Executive Coach",
    category: "Executive Coach",
    passengers: 50,
    luggage: 50,
    features: ["Under-Coach Luggage", "Reclining Seats", "Overhead Storage", "PA System"],
    image: "/images/50 PAX bus.webp",
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
    short: "Stress-free Washington DC airport limo service. Flight monitoring and luxury airport transfers.",
    hero: "/images/sedan.webp",
    intro:
      "Punctual and prestigious Washington DC airport limo service. We make airport luxury transfers effortless. Our DC airport limo service includes advanced flight tracking and flight monitoring to ensure your chauffeur is ready the moment you land.",
    highlights: [
      "Real-time flight tracking & adjustment",
      "Meet & Greet service in the terminal",
      "Complimentary 60 minutes waiting time",
      "Fixed, all-inclusive rates"
    ],
    benefits: [
      { title: "Punctuality Guarantee", body: "We track your flight live so your airport pickup is always ready, regardless of delays." },
      { title: "Luggage Assistance", body: "Our professional chauffeur takes care of your heavy bags from baggage claim to the trunk." },
      { title: "All DMV Airports", body: "DCA airport transportation, Dulles, and BWI luxury airport shuttle service." }
    ],
    seoTitle: "Washington DC Airport Limo Service & Luxury Airport Transfer",
    seoDesc:
      "Book your luxury airport shuttle service today. We offer airport pickup, flight tracking, and luxury airport transfer for Dulles, DCA, and BWI.",
    vehicles: ["s-class", "cadillac-escalade", "chevrolet-suburban", "lincoln-navigator"]
  },
  {
    slug: "wedding-limo-service",
    title: "Wedding Limo Service",
    short: "Elegant transportation and a stunning wedding limousine for your perfect day.",
    hero: "/images/pexels-photo-14011664.webp",
    intro:
      "Flawless luxury wedding transportation for your perfect day in Washington DC. As one of the leading wedding limo companies, we provide an exquisite wedding limousine and elegant transportation for the entire bridal party. From black limo for wedding rentals to dedicated groom transportation and special event transportation, your wedding chauffeur ensures every detail is picture-perfect.",
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
    seoTitle: "Wedding Limo Washington DC & Luxury Wedding Transportation",
    seoDesc:
      "Trust the top wedding limo companies for your big day. We provide special event transportation, a stunning wedding limousine, and dedicated groom transportation.",
    vehicles: ["s-class", "cadillac-escalade", "lincoln-navigator", "sprinter-van", "30-pax-bus", "50-pax-bus"]
  },
  {
    slug: "party-bus-rental",
    title: "Party Bus Rental",
    short: "The ultimate event transportation experience with luxury amenities for nightlife transportation.",
    hero: "/images/pexels-photo-2034851.webp",
    intro:
      "The ultimate group transport experience. Celebrate in style with our state-of-the-art party bus limo rental DC. Perfect for event transportation, a premium party bus tour Washington DC, or unforgettable nightlife transportation.",
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
    seoTitle: "Party Bus Limo Rental DC & Nightlife Transportation",
    seoDesc:
      "Celebrate in style with event transportation. Our party bus tour washington dc options offer nightlife transportation and celebration transportation.",
    vehicles: ["30-pax-bus", "50-pax-bus", "sprinter-van"]
  },
  {
    slug: "black-car-service",
    title: "Black Car Service",
    short: "Discreet and premium executive black car transportation tailored for business meetings.",
    hero: "/images/Mercedes Benz S Class  luxury sedan.webp",
    intro:
      "Discreet, reliable, and sophisticated luxury black car service for all your travel needs. Whether you need executive black car transportation for business or a black car service to Dulles airport, our professional drivers deliver a premium transportation experience. Enjoy a quiet, comfortable luxury ride with our elite luxury sedan service.",
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
    seoTitle: "Executive Black Car Transportation & Luxury Black Car Service",
    seoDesc:
      "Hire a professional driver for premium transportation. Our luxury black car service and black luxury car to airport transfers provide a superior luxury ride.",
    vehicles: ["s-class", "cadillac-escalade", "chevrolet-suburban", "lincoln-navigator"]
  },
  {
    slug: "suv-limo-service",
    title: "SUV Limo Service",
    short: "Spacious SUV limo service in Washington DC offering superior legroom and passenger comfort.",
    hero: "/images/Lincoln navigator-SUV.webp",
    intro:
      "Commanding road presence with superior comfort. Our SUV limo service in Washington DC provides a premier luxury SUV chauffeur service for executives and families. Enjoy spacious luxury suv transportation, ideal for business travel service or seamless group airport transportation.",
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
    seoTitle: "SUV Limo Service in Washington DC & Luxury SUV Chauffeur Service",
    seoDesc:
      "Book a luxury SUV transportation for business travel service. Ideal for group airport transportation and luxury airport travel.",
    vehicles: ["cadillac-escalade", "chevrolet-suburban", "lincoln-navigator"]
  },
  {
    slug: "sprinter-van-rental",
    title: "Sprinter Van Rental",
    short: "Executive sprinter van rental for corporate teams, roadshows, and events.",
    hero: "/images/pexels-photo-15200595.webp",
    intro:
      "Experience the ultimate in group business travel. Our executive sprinter van rental is designed for top-tier corporate transportation and private van hire. Whether you need an executive shuttle for a roadshow or a corporate shuttle service for events, we ensure seamless executive mobility.",
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
    seoTitle: "Executive Sprinter Van Rental & Corporate Transportation",
    seoDesc:
      "Need an executive shuttle or private van hire? Our corporate shuttle service offers corporate event transportation and executive mobility.",
    vehicles: ["sprinter-van", "30-pax-bus", "50-pax-bus"]
  },
  {
    slug: "luxury-car-rental",
    title: "Luxury Car Rental",
    short: "Chauffeur-driven executive car rental and premium car rental service for VIP clients.",
    hero: "/images/pexels-photo-29580163.webp",
    intro:
      "Access our exclusive collection of the world's finest motorcars. Our executive car rental and premium car rental service provide elite chauffeur-driven luxury car hire. Perfect for embassy transportation, executive travel, and any high end transportation requirement, ensuring a first class transportation experience.",
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
    seoTitle: "Executive Car Rental & Premium Car Rental Service",
    seoDesc:
      "Chauffeur-driven luxury car hire and executive car hire. Perfect for embassy transportation, executive travel, and high end transportation.",
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
    hero: "/location car/washington dc.webp",
    intro:
      "From Capitol Hill to Georgetown, ShineLimos LLC is the District's premier Washington DC limo company. We provide elite corporate transportation Washington DC and reliable hourly limo service Washington DC. Whether it's a downtown transportation need or executive ground transportation, we move the people who move Washington.",
    highlights: [
      "24/7 dispatch across all four quadrants",
      "Approved vendor for multiple embassies",
      "Reliable city transportation and hourly charters",
      "Hotel concierge partnerships citywide"
    ],
    landmarks: ["U.S. Capitol", "The White House", "Kennedy Center", "Smithsonian", "Georgetown", "The Wharf"],
    seoTitle: "Washington DC Limo Service | Corporate Transportation DC",
    seoDesc:
      "Premier washington dc transportation service. 24/7 luxury car service dc to Capitol Hill, Georgetown, and Embassy Row. Book online."
  },
  {
    slug: "alexandria-va",
    city: "Alexandria VA",
    region: "Limo Service",
    hero: "/location car/alexandria va.webp",
    intro:
      "Old Town's cobblestone charm deserves a premium Alexandria transportation company. We provide chauffeured luxury car service in Alexandria VA, from waterfront weddings to executive airport transportation Alexandria VA. Book our airport car service Alexandria VA for a seamless experience.",
    highlights: [
      "Old Town wedding & event specialists",
      "Direct Alexandria airport transportation",
      "Luxury car rental Alexandria VA available",
      "Wine-country tours to Loudoun & Virginia hunt country"
    ],
    landmarks: ["Old Town Alexandria", "Mount Vernon", "Torpedo Factory", "King Street", "USPTO"],
    seoTitle: "Alexandria VA Limo Service | Airport Transportation Alexandria VA",
    seoDesc:
      "Top-rated limo alexandria va. Book our luxury car service in alexandria va for weddings, airport car service alexandria va, and executive transport."
  },
  {
    slug: "arlington-va",
    city: "Arlington VA",
    region: "Limo Service",
    hero: "/location car/arlington va.webp",
    intro:
      "Crystal City, Rosslyn, Ballston — Arlington is the heart of corporate Northern Virginia. We offer a trusted limo Arlington VA service and reliable sedan service Arlington VA. From Arlington airport transportation to an exclusive Hilton Arlington airport shuttle, our fleet serves top executives.",
    highlights: [
      "Direct airport transportation Arlington VA",
      "Trusted by major defense & technology firms",
      "Reliable shuttle from BWI to Arlington VA",
      "Crystal City & Amazon HQ2 corporate accounts"
    ],
    landmarks: ["Pentagon", "Arlington National Cemetery", "Crystal City", "Rosslyn", "Ballston", "Amazon HQ2"],
    seoTitle: "Arlington VA Limo Service | Airport Transportation Arlington VA",
    seoDesc:
      "Executive limo arlington va. Trusted airport limo service in arlington va, IAD airport to Arlington VA transfers, and reliable sedan service."
  },
  {
    slug: "tysons-corner",
    city: "Tysons Corner",
    region: "Luxury Car Rental",
    hero: "/location car/tysons corner.webp",
    intro:
      "Tysons is where the DMV does business. If you're seeking a luxury car rental Tysons Corner or an exotic car rental McLean VA, we offer the finest prestige vehicle rental options. Rely on our premium car hire for your next corporate event or weekend getaway.",
    highlights: [
      "Hourly corporate roadshow charters",
      "Exotic car rental Tysons Corner options",
      "Same-day Tysons-to-IAD service",
      "Premium car rental delivered to your office"
    ],
    landmarks: ["Tysons Galleria", "Tysons Corner Center", "Capital One HQ", "Wolf Trap", "Ritz-Carlton Tysons"],
    seoTitle: "Tysons Corner Luxury Car Rental | Premium Car Hire",
    seoDesc:
      "Top luxury car rental tysons corner and exotic car rental mclean va. Choose our premium car rental for roadshows, airport rides, and weddings."
  },
  {
    slug: "fairfax-va",
    city: "Fairfax VA",
    region: "Limo Service",
    hero: "/location car/falrfax va.webp",
    intro:
      "Fairfax County is the DMV's residential and corporate hub. We provide the majestic limousine service Fairfax VA for all events. Whether you need a wedding limo in Fairfax VA, transportation from BWI to Fairfax VA, or a reliable Fairfax to Dulles airport transfer, we are your trusted partner.",
    highlights: [
      "Door-to-door Fairfax transportation",
      "Reliable Fairfax shuttle and airport runs",
      "George Mason University transportation",
      "Luxury car rental Fairfax VA available"
    ],
    landmarks: ["George Mason University", "Inova Fairfax Hospital", "Vienna", "Reston Town Center", "Fair Oaks Mall"],
    seoTitle: "Fairfax VA Limo Service | Wedding Limo in Fairfax VA",
    seoDesc:
      "Book the majestic limousine service fairfax va. Providing reliable fairfax transportation, wedding limo in fairfax va, and fairfax to dulles airport runs."
  },
  {
    slug: "dulles-airport",
    city: "Dulles Airport",
    region: "Airport Transfers",
    hero: "/location car/dulles airport.webp",
    intro:
      "Washington Dulles International Airport (IAD) is our most active transfer hub. With real-time flight tracking, meet & greet service, and complimentary wait time, we ensure your arrival and departure are seamless, every single time.",
    highlights: [
      "Real-time flight tracking & automatic adjustments",
      "Meet & greet in arrivals terminal",
      "Complimentary 60 minutes waiting time",
      "Fixed all-inclusive rates — no surprises"
    ],
    landmarks: ["IAD Terminal A", "IAD Terminal B", "IAD Terminal C", "Dulles Toll Road", "Route 28 Corridor"],
    seoTitle: "Dulles Airport Limo & Black Car Service | ShineLimos",
    seoDesc:
      "Premium limo and black car transfers to and from Dulles International Airport (IAD). Flight tracking, meet & greet, 24/7 dispatch."
  },
  {
    slug: "reagan-airport",
    city: "Reagan Airport",
    region: "Airport Transfers",
    hero: "/location car/reagan airport.webp",
    intro:
      "Reagan National Airport (DCA) serves the heart of the District and Northern Virginia. Our chauffeurs are stationed minutes away, ensuring rapid pickups and no-stress drop-offs for business and leisure travelers alike.",
    highlights: [
      "Closest airport to Capitol Hill & Pentagon",
      "Express transfers to DC in under 15 minutes",
      "All terminals covered with curbside pickup",
      "Corporate billing and monthly accounts available"
    ],
    landmarks: ["DCA Terminal A", "DCA Terminal B/C", "Crystal City", "Pentagon", "National Mall"],
    seoTitle: "Reagan National Airport Limo Service | ShineLimos DC",
    seoDesc:
      "Reliable limo and black car service at Reagan National Airport (DCA). 24/7 airport transfers, flight tracking, and on-time chauffeurs."
  },
  {
    slug: "bethesda-md",
    city: "Bethesda MD",
    region: "Limo Service",
    hero: "/location car/bethesda md.webp",
    intro:
      "Bethesda's thriving mix of biotech corridors, upscale dining, and diplomatic residences demands transportation of the highest caliber. From NIH shuttle services to Bethesda Row restaurant arrivals, our fleet is Bethesda's preferred chauffeur partner.",
    highlights: [
      "NIH campus & medical center specialist",
      "Bethesda Row fine dining arrivals",
      "Direct DC transfers via Wisconsin Avenue",
      "Corporate accounts for Lockheed Martin & Marriott HQ"
    ],
    landmarks: ["NIH Campus", "Bethesda Row", "Walter Reed", "Chevy Chase", "Marriott HQ", "Lockheed Martin"],
    seoTitle: "Bethesda MD Limo & Black Car Service | ShineLimos",
    seoDesc:
      "Premium chauffeur and limo service in Bethesda, Maryland. NIH transfers, corporate accounts, airport runs, and special events."
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
