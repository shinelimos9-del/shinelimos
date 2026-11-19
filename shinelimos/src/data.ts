// Site-wide content & SEO data

export const MAPBOX_PUBLIC_TOKEN = (import.meta.env && import.meta.env.VITE_MAPBOX_ACCESS_TOKEN) || (typeof atob === "function" ? atob("cGsuZXlKMWFYTWlPaUp6YUdsd1pUQTNJaXdpWVdFaU9pSmpiWEIwTlVKeVptOHhhSGZpTW5KdmZrMTFOV05MVEdSNUluMC40SXRMRjdoV2VYa2hLa2VKWmV6Wmc=") : "");

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
  images: string[];
  blurb: string;
  amenities: { label: string; icon: string }[];
  description: string;
};

export const FLEET: Vehicle[] = [
  {
    slug: "s-class",
    name: "Mercedes-Benz S-Class",
    category: "Executive Sedan",
    passengers: 3,
    luggage: 3,
    features: ["Heated Nappa Leather", "Climate Zones", "Burmester® Audio", "Privacy Glass", "Massage Seats", "Executive Headrests"],
    image: "/images/S_class-removebg.png",
    images: [
      "/images/S_class-removebg.png",
      "/car image/Mercedes E-Class 3.png",
      "/car image/Mercedes E-Class 1.jpg",
      "/car image/Mercedes E-Class 4.jpg",
      "/car image/Mercedes E-Class 5.avif",
    ],
    blurb: "The defining flagship of executive travel — silent, swift and unmistakably refined.",
    description: "The Mercedes-Benz S-Class is the pinnacle of automotive luxury. With Nappa leather seating, Burmester® surround sound, and whisper-quiet ride, every journey becomes an experience. Ideal for corporate executives, airport transfers, and VIP travel.",
    amenities: [
      { label: "Phone Chargers", icon: "🔌" },
      { label: "Refreshments", icon: "🥤" },
      { label: "Fiji Water", icon: "💧" },
      { label: "Free WiFi", icon: "📶" },
    ],
  },
  {
    slug: "cadillac-escalade",
    name: "Cadillac Escalade ESV",
    category: "Luxury SUV",
    passengers: 6,
    luggage: 6,
    features: ["Captain's Chairs", "Panoramic Roof", "AKG Studio Audio", "Massage Seats", "Privacy Partition", "Ambient Lighting"],
    image: "/images/cadillac-escalade-removebg.png",
    images: [
      "/images/cadillac-escalade-removebg.png",
      "/images/pexels-photo-9411658.webp",
      "/images/pexels-photo-8425035.webp",
      "/images/pexels-photo-9488191.webp",
    ],
    blurb: "Commanding presence with limousine-level comfort for executives, families & VIPs.",
    description: "The Cadillac Escalade ESV offers a commanding road presence with best-in-class interior space. Captain's chairs, panoramic sunroof, AKG studio audio, and massaging front seats make it the ultimate luxury SUV for groups and VIP clients.",
    amenities: [
      { label: "Phone Chargers", icon: "🔌" },
      { label: "Refreshments", icon: "🥤" },
      { label: "Fiji Water", icon: "💧" },
      { label: "Free WiFi", icon: "📶" },
    ],
  },
  {
    slug: "chevrolet-suburban",
    name: "Chevrolet Suburban",
    category: "Luxury SUV",
    passengers: 6,
    luggage: 7,
    features: ["Leather Seating", "Tri-Zone Climate Control", "Bose® Sound System", "Spacious Cargo", "Rear Entertainment", "Sunroof"],
    image: "/images/Chevrolet Suburban.webp",
    images: [
      "/images/Chevrolet Suburban.webp",
      "/images/pexels-photo-9411653.webp",
      "/images/pexels-photo-8605325.webp",
      "/images/pexels-photo-30096223.webp",
    ],
    blurb: "The premium workhorse of luxury group transit, offering unparalleled luggage capacity.",
    description: "The Chevrolet Suburban is the gold standard for luxury group travel. Featuring tri-zone climate control, premium Bose® audio, and expansive cargo space, it handles both business and family travel with equal grace and power.",
    amenities: [
      { label: "Phone Chargers", icon: "🔌" },
      { label: "Refreshments", icon: "🥤" },
      { label: "Fiji Water", icon: "💧" },
      { label: "Free WiFi", icon: "📶" },
    ],
  },
  {
    slug: "lincoln-navigator",
    name: "Lincoln Navigator",
    category: "Luxury SUV",
    passengers: 6,
    luggage: 6,
    features: ["Perfect Position Seats", "Revel® Audio", "ActiveMotion Massage", "Ambient Lighting", "Panoramic Vista Roof", "30-Way Adjustable Seats"],
    image: "/images/lincoln-navigator-removebg.png",
    images: [
      "/images/lincoln-navigator-removebg.png",
      "/images/pexels-photo-2034851.webp",
      "/images/pexels-photo-9411658.webp",
      "/images/pexels-photo-8425047.webp",
    ],
    blurb: "A sanctuary on wheels, combining bespoke craftsmanship with cutting-edge comfort.",
    description: "The Lincoln Navigator redefines luxury SUV travel. With 30-way perfect position seats featuring ActiveMotion® massage, Revel® Ultima 3D audio, and a panoramic Vista Roof, every passenger experiences true first-class comfort on the road.",
    amenities: [
      { label: "Phone Chargers", icon: "🔌" },
      { label: "Refreshments", icon: "🥤" },
      { label: "Fiji Water", icon: "💧" },
      { label: "Free WiFi", icon: "📶" },
    ],
  },
  {
    slug: "sprinter-van",
    name: "Mercedes-Benz Sprinter Limo",
    category: "Sprinter Van",
    passengers: 14,
    luggage: 14,
    features: ["Stand-Up Cabin", "LED Mood Lighting", "USB-C at Every Seat", "Onboard Bar", "Reclining Leather Seats", "Privacy Curtains"],
    image: "/images/sprinter-removebg.png",
    images: [
      "/images/sprinter-removebg.png",
      "/images/pexels-photo-15200595.webp",
      "/images/pexels-photo-29580163.webp",
      "/images/pexels-photo-9488191.webp",
    ],
    blurb: "First-class group travel for corporate roadshows, weddings and VIP events.",
    description: "The Mercedes-Benz Sprinter Limo van is the perfect choice for group executive travel. A stand-up cabin, onboard bar, LED mood lighting, and USB-C at every seat transform every journey into a mobile boardroom or celebration lounge.",
    amenities: [
      { label: "Phone Chargers", icon: "🔌" },
      { label: "Onboard Bar", icon: "🍾" },
      { label: "Fiji Water", icon: "💧" },
      { label: "Free WiFi", icon: "📶" },
    ],
  },
  {
    slug: "30-pax-bus",
    name: "30-Passenger Party Bus",
    category: "Party Bus",
    passengers: 30,
    luggage: 10,
    features: ["Dance Floor", "Laser Lighting", "Premium Bar", "Subwoofer Audio", "LED Strip Lighting", "Leather Perimeter Seating"],
    image: "/images/30-pax-removebg.png",
    images: [
      "/images/30-pax-removebg.png",
      "/images/pexels-photo-2034851.webp",
      "/images/pexels-photo-8425035.webp",
      "/images/pexels-photo-9411658.webp",
    ],
    blurb: "The destination becomes the journey — your private lounge on wheels.",
    description: "Our 30-Passenger Party Bus is the ultimate celebration vehicle. Featuring a dance floor, laser lighting, premium bar, and thunderous subwoofer audio, it transforms every mile into a party. Perfect for bachelorette parties, corporate events, and nightlife tours.",
    amenities: [
      { label: "Premium Bar", icon: "🍾" },
      { label: "LED Lighting", icon: "💡" },
      { label: "Dance Floor", icon: "🎵" },
      { label: "Free WiFi", icon: "📶" },
    ],
  },
  {
    slug: "50-pax-bus",
    name: "50-Passenger Executive Coach",
    category: "Executive Coach",
    passengers: 50,
    luggage: 50,
    features: ["Under-Coach Luggage", "Reclining Seats", "Overhead Storage", "PA System", "Restroom Onboard", "DVD Entertainment"],
    image: "/images/50-pax-removebg.png",
    images: [
      "/images/50-pax-removebg.png",
      "/images/pexels-photo-30096223.webp",
      "/images/pexels-photo-8605325.webp",
      "/images/pexels-photo-9411653.webp",
    ],
    blurb: "Elite long-distance transit for large-scale corporate events, conventions, and wedding parties.",
    description: "The 50-Passenger Executive Coach is our flagship group transport solution. With reclining seats, ample overhead and under-coach luggage storage, a PA system, and onboard restroom, it handles conventions, corporate retreats, and wedding parties with ease.",
    amenities: [
      { label: "Phone Chargers", icon: "🔌" },
      { label: "PA System", icon: "🎤" },
      { label: "Restroom", icon: "🚻" },
      { label: "Free WiFi", icon: "📶" },
    ],
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
    hero: "/images/sedan-removebg.png",
    intro:
      "Punctual and prestigious Washington DC airport limo service. We make airport luxury transfers effortless. Our DC airport limo service includes advanced flight tracking and flight monitoring to ensure your chauffeur is ready the moment you land.",
    highlights: [
      "Real-time flight tracking & adjustment",
      "Meet & Greet service in the terminal",
      "Complimentary 60 minutes waiting time",
      "Fixed rates — plus a 20% chauffeur gratuity, confirmed before you book"
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
    hero: "/images/mercedes-s-class-removebg.png",
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
    hero: "/images/30-pax-removebg.png",
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
    hero: "/images/mercedes-s-class-removebg.png",
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
    hero: "/images/cadillac-escalade-removebg.png",
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
    hero: "/images/sprinter-removebg.png",
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
    hero: "/images/S_class-removebg.png",
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
  guideSections?: { heading: string; paragraphs: string[] }[];
  infoTables?: { title: string; note?: string; headers: string[]; rows: string[][] }[];
  faqs?: { q: string; a: string }[];
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
    hero: "/location car/car 2.jpg.jpeg",
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
    region: "Limo & Car Service",
    hero: "/location car/car.jpg.jpeg",
    intro:
      "Washington Dulles International Airport (IAD) is Shine Limos' home airport \u2014 and our busiest. We are based in Herndon, a short drive from the terminal, so our chauffeurs know Dulles the way only a neighbor can: which level, which door, and how the AeroTrain and the airport's mobile lounges bring arriving passengers back to the Main Terminal. When you book a Dulles limo with Shine, your chauffeur tracks your flight in real time, adjusts automatically if you are delayed, and meets you where you actually come out.",
    highlights: [
      "Real-time flight tracking & automatic adjustments",
      "Meet & greet in arrivals terminal \u2014 $20",
      "Complimentary 60 minutes waiting time",
      "Fixed rates \u2014 no surprises, plus a 20% chauffeur gratuity",
      "24/7 dispatch \u2014 early departures & late international arrivals",
    ],
    landmarks: ["Main Terminal", "Concourse A", "Concourse B", "Concourse C", "Concourse D", "International Arrivals Building", "AeroTrain", "Dulles Toll Road (VA-267)", "Route 28 (Sully Road)", "Reston Town Center", "Tysons Corner", "Herndon", "Steven F. Udvar-Hazy Center"],
    seoTitle: "Dulles Airport Limo & Car Service (IAD) | Shine Limos \u2014 Limo from Dulles Airport",
    seoDesc:
      "Limo from Dulles Airport (IAD) \u2014 flight tracking, meet & greet, 60 minutes free waiting, fixed rates from $99 + 20% gratuity. Herndon-based chauffeurs serving DC, Tysons, Reston, Alexandria & Arlington 24/7.",
    guideSections: [
      {
        heading: "One terminal, four concourses",
        paragraphs: [
          "Dulles has a single Main Terminal \u2014 Eero Saarinen's landmark building with the sweeping curved roof \u2014 and four midfield concourses: A, B, C, and D. Ticketing and check-in are on the upper (Departures) level of the Main Terminal; baggage claim is on the lower (Arrivals) level. A small set of Z gates sits in the Main Terminal itself. Concourses A and B share one midfield building and serve most non-United airlines; Concourses C and D share the second midfield building and are United Airlines' hub, including most United Express flights.",
          "The AeroTrain, the airport's underground automated people mover, runs between the Main Terminal and Concourses A, B, and C \u2014 trains arrive every couple of minutes and the ride between stations takes under two minutes. Concourse D has no AeroTrain station: you reach it on foot through Concourse C, or by one of the airport's mobile lounges, the distinctive raised shuttle vehicles Dulles has used since it opened. Mobile lounges also run between the Main Terminal and Concourse D, and carry arriving international passengers to customs.",
          "No matter which concourse your flight uses, you exit through the Main Terminal. That is the one fact that makes Dulles pickups simple: every arriving passenger \u2014 domestic or international \u2014 comes out of the same building.",
        ],
      },
      {
        heading: "Where you meet your chauffeur",
        paragraphs: [
          "Arriving \u2014 meet & greet (inside): your chauffeur waits for you inside the Main Terminal at the Baggage Claim Level, holding a name sign, and helps with your luggage. For international arrivals, your chauffeur meets you just outside the customs exit. Meet & greet is available for $20.",
          "Arriving \u2014 curbside: if you prefer curbside pickup, collect your bags, go up the ramp from the Baggage Claim Level to the Arrivals Level, and meet your chauffeur at the Arrival Door you agree on \u2014 the Arrivals Level doors are numbered 1\u20137. The Arrivals Level is for active loading and unloading only; waiting is not permitted, and the airport provides a Cell Phone Lot for drivers waiting for a passenger's call.",
          "Departing: your chauffeur drops you curbside at the Departures (upper) level, at the doors for your airline's check-in area. Shine Limos has no office or counter inside the airport \u2014 your chauffeur meets you at the terminal as described above, and dispatch coordinates every pickup by phone.",
          "Also good to know: the Silver Line Metrorail station at Dulles connects directly to the Main Terminal via a covered walkway. If your plans change and you need a car at the last minute, call dispatch at (202) 951-7172 \u2014 we serve Dulles 24 hours a day.",
        ],
      },
      {
        heading: "International arrivals and customs",
        paragraphs: [
          "International passengers arriving at Dulles clear U.S. Customs and Border Protection in the International Arrivals Building, attached to the west end of the Main Terminal. Most international flights are brought there, often by mobile lounge, where passengers clear immigration, collect checked bags, and pass through customs. United passengers connecting onward to a domestic flight are processed at a separate federal inspection facility in Concourse C instead. Travelers arriving from airports with U.S. preclearance (for example, Dublin or Abu Dhabi) clear customs before boarding and exit like domestic arrivals. Customs lines can be long when several long-haul flights land together \u2014 one reason we include a full 60 minutes of complimentary waiting on airport pickups.",
        ],
      },
      {
        heading: "What every Dulles transfer includes",
        paragraphs: [
          "Every Dulles airport transfer includes 60 minutes of complimentary waiting time and a fixed rate quoted before you book \u2014 your rate plus a 20% chauffeur gratuity, with no surprises. Meet & greet service \u2014 your chauffeur inside the terminal holding a name sign \u2014 is available for $20. Dispatch runs 24 hours a day, 7 days a week, so early departures and late international arrivals are covered the same as midday runs.",
          "Booking is simple: get a quote on shinelimos.com, call (202) 951-7172, or email booking@shinelimos.com, and dispatch sends a payment link. Your card is charged 24 hours before pickup, and you can cancel free of charge up to 24 hours before pickup. Whether you are landing from abroad at the International Arrivals Building or heading out on an early departure, a professional chauffeur will be there.",
        ],
      },
    ],
    infoTables: [
      {
        title: "Routes & drive times from Dulles Airport",
        note: "Typical drive times outside rush hour. Weekday rush hour (roughly 6:30\u20139:30 AM inbound, 3:30\u20137:00 PM outbound) can add 20\u201340 minutes, especially on the Dulles Toll Road and I-66. Your fare is fixed when you book \u2014 traffic does not change what you pay.",
        headers: ["Destination", "Distance", "Typical drive", "Usual route"],
        rows: [
          ["Downtown Washington, DC", "About 26 miles", "40\u201360 min (rush hour: up to 90 min)", "Dulles Access Road \u2192 Dulles Toll Road (VA-267) \u2192 I-66 East"],
          ["Arlington (Rosslyn / Ballston)", "About 21\u201325 miles", "30\u201345 min", "Dulles Access Road \u2192 VA-267 \u2192 I-66 East"],
          ["Alexandria (Old Town)", "About 26\u201329 miles", "45\u201360 min", "VA-267 \u2192 I-495 South \u2192 I-395"],
          ["Tysons Corner", "About 14 miles", "20\u201330 min", "Dulles Toll Road (VA-267) East to Route 123"],
          ["Reston Town Center", "About 6 miles", "10\u201320 min", "Dulles Toll Road / Dulles Access Road"],
          ["Herndon", "About 5 miles", "10\u201315 min", "Route 28 (Sully Road) or Dulles Access Road"],
        ],
      },
      {
        title: "One-way airport transfers from IAD \u2014 from rates",
        note: "Fixed rates, quoted before you book. All rates below are shown plus a 20% chauffeur gratuity. Prices shown on the website at booking include the gratuity and a 3% card fee (base \u00d7 1.20 \u00d7 1.03). Free cancellation up to 24 hours before pickup; your card is charged 24 hours before pickup. Mercedes S-Class airport transfers are available; your quote shows the fare before you book. Tolls are added on top of your quoted fare.",
        headers: ["Vehicle", "From rate", "Plus 20% gratuity", "All-in website price (from)"],
        rows: [
          ["Executive Sedan", "from $99", "$118.80", "$122.36"],
          ["Luxury SUV", "from $135", "$162.00", "$166.86"],
          ["Executive Sprinter", "from $189", "$226.80", "$233.60"],
        ],
      },
      {
        title: "Hourly charters \u2014 start at 2 hours",
        note: "Ideal for multi-stop days, roadshows, and waiting between meetings. All-in hourly prices include the 20% chauffeur gratuity and the 3% card fee.",
        headers: ["Vehicle", "Hourly rate", "2 hours, all-in"],
        rows: [
          ["Executive Sedan", "$75/hr", "$185.40"],
          ["Luxury SUV", "$95/hr", "$234.84"],
          ["Mercedes S-Class", "$115/hr", "$284.28"],
          ["Executive Sprinter", "$139/hr", "$343.61"],
        ],
      },
    ],
    faqs: [
      {
        q: "Where do I meet my chauffeur at Dulles Airport?",
        a: "Your chauffeur meets you inside the Main Terminal at the Baggage Claim Level, holding a name sign \u2014 no matter which concourse your flight arrived at, you exit through the Main Terminal. If you prefer curbside pickup, go up the ramp from baggage claim to the Arrivals Level and meet at the Arrival Door (numbered 1\u20137) you agree on with dispatch. International arrivals are met just outside the customs exit.",
      },
      {
        q: "What if my flight is delayed?",
        a: "Your chauffeur tracks your flight in real time and adjusts automatically \u2014 a delayed landing does not leave you stranded, and you are not charged extra because your flight ran late. Just make sure your flight number is on the booking.",
      },
      {
        q: "How much waiting time is included?",
        a: "60 minutes of complimentary waiting time on airport pickups, counted from your flight's actual arrival. That covers baggage claim and, for international arrivals, customs and immigration. After the complimentary hour, waiting time is $1 per minute.",
      },
      {
        q: "I am arriving on an international flight. What should I expect?",
        a: "You will clear U.S. Customs and Border Protection in the International Arrivals Building, attached to the Main Terminal \u2014 most international passengers are brought there by mobile lounge. Allow extra time: customs lines vary with how many long-haul flights land together. Your chauffeur monitors your flight and waits the full complimentary 60 minutes; meet & greet meets you just outside the customs exit.",
      },
      {
        q: "How far in advance should I book?",
        a: "As soon as your flights are set \u2014 especially around holidays, early-morning departures, and major DC events. Same-day bookings are welcome with at least 1 hour's advance notice; call dispatch at (202) 951-7172 and we will confirm on the spot.",
      },
      {
        q: "How much luggage can I bring?",
        a: "Tell us how many passengers and bags you have when you book and we will match the vehicle: sedans for light travel, SUVs for families, and the Sprinter for groups with a lot of luggage. If you have oversized items \u2014 golf clubs, skis, large cases \u2014 mention them when booking so dispatch sends the right vehicle.",
      },
      {
        q: "Do you provide child car seats?",
        a: "Yes \u2014 a child car seat is available for $20. Mention it when you book so dispatch sends a vehicle with the seat fitted.",
      },
      {
        q: "Can I cancel or change my booking?",
        a: "Yes. Cancellation is free up to 24 hours before pickup, and your card is not charged until 24 hours before pickup. To change the date, time, or destination, call (202) 951-7172 or email booking@shinelimos.com and dispatch will adjust your booking.",
      },
    ],
  },
  {
    slug: "reagan-airport",
    city: "Reagan Airport",
    region: "Limo & Car Service",
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
    slug: "bwi-airport",
    city: "BWI Airport",
    region: "Limo & Car Service",
    hero: "/location car/car.jpg.jpeg",
    intro:
      "Baltimore/Washington International Thurgood Marshall Airport (BWI) transfers made effortless. Whether you are traveling between Baltimore, Annapolis, Washington DC, or Northern Virginia, our chauffeurs provide prompt flight tracking, luggage assistance, and luxury curbside or terminal pickups.",
    highlights: [
      "Real-time BWI flight tracking & automatic adjustments",
      "Direct transfers between BWI, DC, Maryland & Northern Virginia",
      "Complimentary 60 minutes airport waiting time",
      "Fixed rates with meet & greet available — plus a 20% chauffeur gratuity"
    ],
    landmarks: ["BWI Main Terminal", "Concourse A/B/C/D/E", "BWI Rail Station", "Arundel Mills", "Annapolis Corridor"],
    seoTitle: "BWI Airport (BWI) Limo & Car Service | Shine Limos",
    seoDesc:
      "Premier BWI Airport car service and luxury limo transfers between BWI, Washington DC, and Virginia. 24/7 flight tracking and professional chauffeurs."
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
    seoTitle: "Bethesda MD Limo & Black Car Service | Shine Limos",
    seoDesc:
      "Premium chauffeur and limo service in Bethesda, Maryland. NIH transfers, corporate accounts, airport runs, and special events."
  }
];

export const TESTIMONIALS = [
  {
    name: "David Vance",
    role: "Google Review • Sep 2026",
    quote:
      "Booked an Executive Sedan from Dulles (IAD) to downtown DC. The flight was delayed 45 minutes, but our chauffeur Ali tracked the plane and was waiting right at baggage claim. Immaculate Cadillac, cold water, flawless ride.",
  },
  {
    name: "Sarah & Brian Jenkins",
    role: "Google Review • Aug 2026",
    quote:
      "We reserved a Mercedes Sprinter and Cadillac Escalade for our wedding party in Alexandria. The drivers arrived 15 minutes early in pristine suits, vehicles were spotless, and the dispatch team answered immediately when we needed to tweak our schedule.",
  },
  {
    name: "Robert Sterling",
    role: "Google Review • Sep 2026",
    quote:
      "Shine Limos is our executive team's go-to for Capitol Hill meetings and Reagan (DCA) transfers. Direct billing, itemized invoices, professional chauffeurs who know every detour in DC. Highly recommended.",
  },
  {
    name: "Elena Rostova",
    role: "Yelp Verified • Jul 2026",
    quote:
      "Used Shine Limos for a family transfer from BWI Airport to McLean, VA. The child car seat was installed safely before pickup and the vehicle was exceptionally clean. Truly first-class luxury transportation.",
  },
];