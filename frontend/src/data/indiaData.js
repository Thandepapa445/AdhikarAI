// ============================================================================
// ADHIKAR AI (अधिकार AI) - PAN-INDIA MASTER DATASET
// National Citizen Innovation & Grievance Redressal Ecosystem
// Aligned with NEP 2020: Connecting Citizen Grievances & Grassroots Challenges with HEIs, Urban Local Bodies & Industry CSR
// ============================================================================

export const THEMATIC_DOMAINS = [
    {
        id: "INFRASTRUCTURE",
        name: "Roads & Urban/Rural Infrastructure",
        code: "INF",
        icon: "🏗️",
        color: "#4f46e5",
        bgColor: "#e0e7ff",
        description: "Potholes, asphalt degradation, broken pavements, damaged bridges/culverts, and non-functional streetlights.",
        keywords: ["road", "bridge", "culvert", "pothole", "transport", "street light", "streetlight", "crater", "asphalt", "connectivity", "infrastructure", "construction", "village roads", "building", "pathway", "fallen tree"]
    },
    {
        id: "HEALTHCARE",
        name: "Sanitation & Public Health",
        code: "HLT",
        icon: "🏥",
        color: "#e11d48",
        bgColor: "#ffe4e6",
        description: "Solid waste dumps, garbage overflow, pest infestation, sanitation hazards, community health clinics, and telemedicine accessibility.",
        keywords: ["health", "hospital", "clinic", "doctor", "medicine", "garbage", "trash", "waste", "dump", "sanitation", "toilet", "hygiene", "telemedicine", "ambulance", "phc", "chc", "diagnostic", "disease", "vaccination", "pest", "odor"]
    },
    {
        id: "WATER",
        name: "Water Resources & Management",
        code: "WAT",
        icon: "💧",
        color: "#0284c7",
        bgColor: "#e0f2fe",
        description: "Drinking water contamination, pipeline leakage, drainage blockages, groundwater depletion, community filtration, and irrigation.",
        keywords: ["water", "drinking water", "fluoride", "arsenic", "contamination", "pipeline", "groundwater", "filtration", "well", "pond", "irrigation", "check dam", "jal", "handpump", "borewell", "waterlogging", "drainage", "water leakage", "sewage"]
    },
    {
        id: "AGRICULTURE",
        name: "Agriculture & Rural Livelihoods",
        code: "AGR",
        icon: "🌾",
        color: "#16a34a",
        bgColor: "#dcfce7",
        description: "Post-harvest storage, precision farming, crop protection, agro-solar cold rooms, soil health diagnostics, and mandi value chains.",
        keywords: ["crop", "agriculture", "farmer", "silk", "harvest", "cold storage", "soil", "pest", "irrigation", "fertilizer", "kisan", "mandi", "horticulture", "seeds", "forest produce", "dairy", "grain"]
    },
    {
        id: "ENERGY_ENVIRONMENT",
        name: "Clean Energy & Environmental Safety",
        code: "ENG",
        icon: "☀️",
        color: "#d97706",
        bgColor: "#fef3c7",
        description: "Decentralized solar micro-grids, public lighting efficiency, air pollution hotspots, fallen trees, and biomass recycling.",
        keywords: ["solar", "energy", "electricity", "power", "grid", "micro-grid", "biomass", "forest", "fire", "pollution", "air quality", "waste to energy", "battery", "renewables", "carbon", "environment", "tree", "fallen tree", "wire", "lighting"]
    },
    {
        id: "EDUCATION",
        name: "Education & Skill Development",
        code: "EDU",
        icon: "🎓",
        color: "#7c3aed",
        bgColor: "#ede9fe",
        description: "Digital smart classrooms, STEM lab kits, vocational training, vernacular e-learning, and school infrastructure accessibility.",
        keywords: ["school", "education", "student", "teacher", "classroom", "skill", "vocational", "training", "vernacular", "digital learning", "computer", "library"]
    },
    {
        id: "ACCESSIBILITY",
        name: "Accessibility & Assistive Tech",
        code: "ACC",
        icon: "♿",
        color: "#0d9488",
        bgColor: "#ccfbf1",
        description: "Wheelchair ramps, tactile pathways, assistive audio devices for visually impaired, barrier-free civic hubs, and elderly mobility.",
        keywords: ["accessibility", "disability", "assistive", "wheelchair", "blind", "deaf", "mobility", "prosthetic", "divyang", "ramp", "braille", "hearing aid", "special needs"]
    },
    {
        id: "PUBLIC_ADMIN",
        name: "Public Administration & Civic Governance",
        code: "GOV",
        icon: "🏛️",
        color: "#ea580c",
        bgColor: "#ffedd5",
        description: "Direct Municipal routing, Panchayat e-services, PDS ration automation, grievance tracking transparency, and citizen verification.",
        keywords: ["governance", "pds", "ration", "portal", "panchayat", "municipality", "ward", "certificate", "scheme", "subsidy", "service delivery", "grievance", "public administration", "csc"]
    }
];

// Comprehensive Pan-India States & Major Hubs
export const INDIA_STATES_AND_REGIONS = [
    { state: "Delhi NCR", lat: 28.6139, lng: 77.2090, districts: ["Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "North West Delhi", "South West Delhi", "New Delhi"] },
    { state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, districts: ["Ghaziabad", "Gautam Buddha Nagar (Noida)", "Lucknow", "Kanpur", "Varanasi", "Prayagraj", "Agra", "Meerut", "Aligarh", "Bareilly", "Gorakhpur", "Jhansi"] },
    { state: "Maharashtra", lat: 19.0760, lng: 72.8777, districts: ["Mumbai", "Mumbai Suburban", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Nanded"] },
    { state: "Karnataka", lat: 12.9716, lng: 77.5946, districts: ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangaluru (Dakshina Kannada)", "Hubballi-Dharwad", "Belagavi", "Kalaburagi", "Ballari", "Shivamogga"] },
    { state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, districts: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Kanchipuram", "Thanjavur"] },
    { state: "Jharkhand", lat: 23.6102, lng: 85.2799, districts: ["Ranchi", "Dhanbad", "East Singhbhum (Jamshedpur)", "Bokaro", "Hazaribagh", "Palamu", "Deoghar", "Giridih", "Ramgarh", "Dumka", "Garhwa", "Latehar"] },
    { state: "West Bengal", lat: 22.5726, lng: 88.3639, districts: ["Kolkata", "North 24 Parganas", "South 24 Parganas", "Howrah", "Hooghly", "Paschim Medinipur", "Purba Bardhaman", "Darjeeling", "Siliguri"] },
    { state: "Gujarat", lat: 23.0225, lng: 72.5714, districts: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Kutch"] },
    { state: "Telangana", lat: 17.3850, lng: 78.4867, districts: ["Hyderabad", "Medchal-Malkajgiri", "Rangareddy", "Warangal", "Nizamabad", "Karimnagar", "Khammam"] },
    { state: "Rajasthan", lat: 26.9124, lng: 75.7873, districts: ["Jaipur", "Jodhpur", "Kota", "Udaipur", "Bikaner", "Ajmer", "Bhilwara", "Alwar", "Sikar"] },
    { state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126, districts: ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa", "Satna"] },
    { state: "Bihar", lat: 25.5941, lng: 85.1376, districts: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah"] },
    { state: "Kerala", lat: 10.8505, lng: 76.2711, districts: ["Thiruvananthapuram", "Kochi (Ernakulam)", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Alappuzha", "Kottayam"] },
    { state: "Punjab", lat: 30.7333, lng: 76.7794, districts: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali (SAS Nagar)"] },
    { state: "Haryana", lat: 28.4595, lng: 77.0266, districts: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar", "Rohtak", "Sonipat"] },
    { state: "Odisha", lat: 20.2961, lng: 85.8245, districts: ["Bhubaneswar (Khurda)", "Cuttack", "Rourkela (Sundargarh)", "Berhampur (Ganjam)", "Sambalpur", "Puri", "Balasore"] },
    { state: "Andhra Pradesh", lat: 16.5062, lng: 80.6480, districts: ["Visakhapatnam", "Vijayawada (NTR)", "Guntur", "Tirupati", "Kurnool", "Nellore", "Kakinada"] },
    { state: "Assam", lat: 26.1445, lng: 91.7362, districts: ["Guwahati (Kamrup Metro)", "Dibrugarh", "Silchar (Cachar)", "Jorhat", "Nagaon", "Tezpur (Sonitpur)"] }
];

// Legacy alias for backward compatibility
export const JHARKHAND_DISTRICTS = INDIA_STATES_AND_REGIONS.find(s => s.state === "Jharkhand")?.districts.map(d => ({ name: d, lat: 23.6, lng: 85.3, blocks: ["Main Block", "North Block", "South Block"] })) || [];

// ============================================================================
// PREMIER PAN-INDIA UNIVERSITIES (HEIs) & RESEARCH HUBS
// ============================================================================
export const PARTICIPATING_HEIS = [
    // --- NORTH REGION ---
    {
        id: "HEI-IN-01",
        name: "Indian Institute of Technology (IIT) Delhi",
        shortName: "IIT Delhi",
        state: "Delhi NCR",
        district: "South Delhi",
        lat: 28.5450,
        lng: 77.1926,
        domains: ["INFRASTRUCTURE", "ENERGY_ENVIRONMENT", "WATER", "ACCESSIBILITY", "PUBLIC_ADMIN"],
        specializedLabs: ["Smart Mobility & Sustainable Infrastructure Lab", "Clean Energy & Urban Air Quality Center", "Assistive Technologies Group"],
        facultyMentors: ["Prof. B. K. Panigrahi (Electrical & Smart Grids)", "Prof. Geetam Tiwari (Transport & Urban Infrastructure)", "Prof. P. V. Madhusudhan Rao (Assistive Design)"],
        rating: 4.95
    },
    {
        id: "HEI-IN-02",
        name: "Delhi Technological University (DTU), Delhi",
        shortName: "DTU Delhi",
        state: "Delhi NCR",
        district: "North West Delhi",
        lat: 28.7499,
        lng: 77.1170,
        domains: ["ENERGY_ENVIRONMENT", "INFRASTRUCTURE", "WATER", "HEALTHCARE"],
        specializedLabs: ["Urban Mobility & Clean Energy Innovation Hub", "Environmental Engineering & Waste Management Lab"],
        facultyMentors: ["Prof. S. K. Garg (Urban Tech & Energy)", "Dr. Amit Pal (Sustainable Energy Systems)"],
        rating: 4.88
    },
    {
        id: "HEI-IN-03",
        name: "ABESIT Group of Institutions, Ghaziabad",
        shortName: "ABESIT Ghaziabad",
        state: "Uttar Pradesh",
        district: "Ghaziabad",
        lat: 28.6360,
        lng: 77.4470,
        domains: ["INFRASTRUCTURE", "WATER", "PUBLIC_ADMIN", "EDUCATION"],
        specializedLabs: ["Smart Infrastructure & Road Materials Lab", "AI & e-Governance Prototyping Center"],
        facultyMentors: ["Dr. Hemant Ahuja (Civil & Smart Infrastructure)", "Dr. Rizwan Khan (Computer Science & AI)"],
        rating: 4.80
    },
    {
        id: "HEI-IN-04",
        name: "Indian Institute of Technology (IIT) Kanpur",
        shortName: "IIT Kanpur",
        state: "Uttar Pradesh",
        district: "Kanpur",
        lat: 26.5123,
        lng: 80.2329,
        domains: ["WATER", "ENERGY_ENVIRONMENT", "INFRASTRUCTURE", "AGRICULTURE"],
        specializedLabs: ["Ganga River Basin Management & Clean Water Center", "Sustainable Energy & Drone Tech Lab"],
        facultyMentors: ["Prof. Vinod Tare (Clean Water & Basin Tech)", "Prof. Sachchida Nand Tripathi (Air Quality & Environment)"],
        rating: 4.96
    },

    // --- SOUTH REGION ---
    {
        id: "HEI-IN-05",
        name: "Indian Institute of Science (IISc), Bengaluru",
        shortName: "IISc Bengaluru",
        state: "Karnataka",
        district: "Bengaluru Urban",
        lat: 13.0219,
        lng: 77.5671,
        domains: ["WATER", "ENERGY_ENVIRONMENT", "HEALTHCARE", "AGRICULTURE"],
        specializedLabs: ["Center for Sustainable Technologies (CST)", "Interdisciplinary Center for Water Research (ICWaR)"],
        facultyMentors: ["Prof. Pradeep Mujumdar (Water Resources Modeling)", "Prof. Monto Mani (Sustainable Habitat)"],
        rating: 4.98
    },
    {
        id: "HEI-IN-06",
        name: "Indian Institute of Technology (IIT) Madras",
        shortName: "IIT Madras",
        state: "Tamil Nadu",
        district: "Chennai",
        lat: 12.9915,
        lng: 80.2337,
        domains: ["WATER", "INFRASTRUCTURE", "HEALTHCARE", "ACCESSIBILITY"],
        specializedLabs: ["International Centre for Clean Water (ICCW)", "Center for Urbanization, Buildings & Environment (CUBE)"],
        facultyMentors: ["Prof. T. Pradeep (Nano-Materials for Clean Water)", "Prof. Ravindra Gettu (Structural & Pavement Materials)"],
        rating: 4.97
    },
    {
        id: "HEI-IN-07",
        name: "National Institute of Technology (NIT) Tiruchirappalli",
        shortName: "NIT Trichy",
        state: "Tamil Nadu",
        district: "Tiruchirappalli",
        lat: 10.7589,
        lng: 78.8132,
        domains: ["INFRASTRUCTURE", "ENERGY_ENVIRONMENT", "WATER"],
        specializedLabs: ["Center for Energy & Environmental Science", "Transportation Infrastructure Lab"],
        facultyMentors: ["Dr. G. Swaminathan (Civil Infrastructure)", "Dr. M. Premalatha (Clean Energy)"],
        rating: 4.86
    },

    // --- EAST REGION ---
    {
        id: "HEI-IN-08",
        name: "Indian Institute of Technology (IIT) Kharagpur",
        shortName: "IIT Kharagpur",
        state: "West Bengal",
        district: "Paschim Medinipur",
        lat: 22.3149,
        lng: 87.3105,
        domains: ["AGRICULTURE", "WATER", "INFRASTRUCTURE", "ENERGY_ENVIRONMENT"],
        specializedLabs: ["Precision Agriculture & Rural Development Lab", "Water Resources & Geo-Informatics Center"],
        facultyMentors: ["Prof. V. M. Chowdary (Agri-Water Systems)", "Prof. Sudheer Ch (Water Resources)"],
        rating: 4.95
    },
    {
        id: "HEI-IN-09",
        name: "Birla Institute of Technology (BIT) Mesra, Ranchi",
        shortName: "BIT Mesra",
        state: "Jharkhand",
        district: "Ranchi",
        lat: 23.4123,
        lng: 85.4399,
        domains: ["WATER", "INFRASTRUCTURE", "ENERGY_ENVIRONMENT"],
        specializedLabs: ["Clean Water & Rural Innovation FabLab", "Environmental Engineering Lab"],
        facultyMentors: ["Dr. Arvind Sharma (Water & Environmental Engg)", "Dr. R. Naresh Kumar (Civil Engg)"],
        rating: 4.88
    },
    {
        id: "HEI-IN-10",
        name: "IIT (ISM) Dhanbad",
        shortName: "IIT ISM Dhanbad",
        state: "Jharkhand",
        district: "Dhanbad",
        lat: 23.8144,
        lng: 86.4412,
        domains: ["ENERGY_ENVIRONMENT", "INFRASTRUCTURE", "WATER"],
        specializedLabs: ["Geo-Environmental Rehabilitation Lab", "Sustainable Mining & Soil Reclamation Center"],
        facultyMentors: ["Prof. D. C. Panigrahi (Geo-Tech & Environment)", "Dr. Alok Sinha (Environmental Science)"],
        rating: 4.90
    },

    // --- WEST REGION ---
    {
        id: "HEI-IN-11",
        name: "Indian Institute of Technology (IIT) Bombay",
        shortName: "IIT Bombay",
        state: "Maharashtra",
        district: "Mumbai Suburban",
        lat: 19.1334,
        lng: 72.9133,
        domains: ["INFRASTRUCTURE", "HEALTHCARE", "ENERGY_ENVIRONMENT", "WATER"],
        specializedLabs: ["Centre for Technology Alternatives for Rural Areas (CTARA)", "Urban Systems & Infrastructure Hub"],
        facultyMentors: ["Prof. Satish Agnihotri (CTARA & Rural Tech)", "Prof. K. V. Krishna Rao (Civil & Transport)"],
        rating: 4.97
    },
    {
        id: "HEI-IN-12",
        name: "College of Engineering Pune (COEP)",
        shortName: "COEP Tech Pune",
        state: "Maharashtra",
        district: "Pune",
        lat: 18.5293,
        lng: 73.8565,
        domains: ["INFRASTRUCTURE", "ENERGY_ENVIRONMENT", "PUBLIC_ADMIN"],
        specializedLabs: ["Smart City & Intelligent Transportation Lab", "Solid Waste & Energy Research Lab"],
        facultyMentors: ["Dr. M. S. Ranadive (Civil & Transportation)", "Dr. R. R. Joshi (Electrical Power)"],
        rating: 4.85
    },
    {
        id: "HEI-IN-13",
        name: "BITS Pilani (Pilani Campus)",
        shortName: "BITS Pilani",
        state: "Rajasthan",
        district: "Jhunjhunu",
        lat: 28.3639,
        lng: 75.5870,
        domains: ["WATER", "ENERGY_ENVIRONMENT", "PUBLIC_ADMIN", "EDUCATION"],
        specializedLabs: ["Desert Water Purification Center", "Renewable Energy & IoT Prototyping Lab"],
        facultyMentors: ["Prof. Rajiv Gupta (Civil & Environmental)", "Prof. S. B. Singh (Structural & Roads)"],
        rating: 4.92
    },

    // --- CENTRAL REGION ---
    {
        id: "HEI-IN-14",
        name: "Maulana Azad National Institute of Technology (MANIT) Bhopal",
        shortName: "MANIT Bhopal",
        state: "Madhya Pradesh",
        district: "Bhopal",
        lat: 23.2167,
        lng: 77.4083,
        domains: ["INFRASTRUCTURE", "WATER", "ENERGY_ENVIRONMENT"],
        specializedLabs: ["Rural Road Development & Geosynthetics Lab", "Water Resource & Hydraulic Modeling Lab"],
        facultyMentors: ["Dr. M. D. Goel (Structural & Pavements)", "Dr. H. L. Tiwari (Civil Engineering)"],
        rating: 4.84
    },
    {
        id: "HEI-IN-15",
        name: "All India Institute of Medical Sciences (AIIMS) New Delhi",
        shortName: "AIIMS New Delhi",
        state: "Delhi NCR",
        district: "South Delhi",
        lat: 28.5672,
        lng: 77.2100,
        domains: ["HEALTHCARE", "ACCESSIBILITY"],
        specializedLabs: ["Centre for Community Medicine & Telehealth", "Assistive Rehabilitation & Diagnostics Hub"],
        facultyMentors: ["Dr. Sanjay K. Rai (Community Medicine)", "Dr. Anand Krishnan (Epidemiology & Sanitation)"],
        rating: 4.99
    }
];

// Calculate Haversine Distance between two GPS Coordinates (in km)
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 25.0;
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
}

// Intelligent Multi-Factor University Matcher (Proximity + Domain Affinity)
export function findNearestMatchedHei(lat, lng, domainId) {
    if (!PARTICIPATING_HEIS || PARTICIPATING_HEIS.length === 0) return null;

    let bestHei = PARTICIPATING_HEIS[0];
    let bestScore = -1;

    for (const hei of PARTICIPATING_HEIS) {
        const dist = calculateDistanceKm(lat, lng, hei.lat, hei.lng);
        const hasDomain = hei.domains.includes(domainId);
        
        // Scoring formula: Domain Affinity (60%) + Spatial Proximity (40%)
        const domainScore = hasDomain ? 1.0 : 0.4;
        const distScore = dist <= 50 ? 1.0 : dist <= 250 ? 0.8 : dist <= 600 ? 0.6 : 0.4;
        const totalScore = (domainScore * 0.6) + (distScore * 0.4);

        if (totalScore > bestScore) {
            bestScore = totalScore;
            bestHei = {
                ...hei,
                distanceKm: dist,
                matchScorePercent: `${Math.min(98, Math.round(totalScore * 100))}%`
            };
        }
    }

    return bestHei;
}

// ============================================================================
// PAN-INDIA SEED CHALLENGES (DUAL TRACK: DIRECT MUNICIPAL + UNIVERSITY R&D)
// ============================================================================
export const INITIAL_SEED_CHALLENGES = [
    {
        id: "ADH-2026-1041",
        title: "Deep Hazardous Pothole Cluster and Asphalt Breakdown on Arterial Road",
        description: "Severe road crater and pavement collapse on main commuter thoroughfare. Heavy monsoon runoff has eroded the sub-base, causing severe bike skidding risks and severe traffic bottlenecks during morning rush hour.",
        domain: "INFRASTRUCTURE",
        domainName: "Roads & Urban/Rural Infrastructure",
        urgency: "HIGH",
        submitterType: "INDIVIDUAL_CITIZEN",
        submitterName: "Aditya Sharma",
        citizenEmail: "aditya.sharma@adhikar.in",
        state: "Delhi NCR",
        district: "North West Delhi",
        block: "Rohini Sector 16",
        panchayat: "Main Commercial Avenue",
        locationText: "Outer Ring Road Junction, Rohini Sector 16, Delhi",
        latitude: 28.7499,
        longitude: 77.1170,
        affectedPopulation: 4500,
        evidenceImageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800",
        assignedHei: "Delhi Technological University (DTU), Delhi",
        assignedHeiDepartment: "Urban Mobility & Clean Energy Innovation Hub",
        facultyMentor: "Prof. S. K. Garg",
        status: "ASSIGNED",
        upvotes: 42,
        triageType: "CIVIC_DIRECT",
        recommendedDepartment: "Public Works Department (PWD)",
        createdAt: "2026-09-05T09:30:00Z",
        updatedAt: "2026-09-07T12:00:00Z"
    },
    {
        id: "ADH-2026-1042",
        title: "Unattended Solid Waste Garbage Accumulation Near Residential Market",
        description: "Overflowing municipal garbage dump creating severe hygiene risks, foul odor, and street dog menace outside primary school. Requires immediate mechanical clearance and permanent smart segregation bins.",
        domain: "HEALTHCARE",
        domainName: "Sanitation & Public Health",
        urgency: "HIGH",
        submitterType: "COMMUNITY_SHG",
        submitterName: "Pooja Verma (Clean City SHG)",
        citizenEmail: "pooja.verma@adhikar.in",
        state: "Uttar Pradesh",
        district: "Ghaziabad",
        block: "Vijay Nagar",
        panchayat: "Sector 11 Market",
        locationText: "Near ABESIT Campus, NH-09, Vijay Nagar, Ghaziabad",
        latitude: 28.6360,
        longitude: 77.4470,
        affectedPopulation: 2800,
        evidenceImageUrl: "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800",
        assignedHei: "ABESIT Group of Institutions, Ghaziabad",
        assignedHeiDepartment: "Smart Infrastructure & Road Materials Lab",
        facultyMentor: "Dr. Hemant Ahuja",
        status: "PROTOTYPING",
        upvotes: 67,
        triageType: "CIVIC_DIRECT",
        recommendedDepartment: "Municipal Solid Waste Management",
        createdAt: "2026-09-04T11:20:00Z",
        updatedAt: "2026-09-07T14:15:00Z"
    },
    {
        id: "ADH-2026-1043",
        title: "Non-Functional Public Streetlight Fixtures Creating Dark Nocturnal Corridor",
        description: "Four consecutive street lighting poles with broken luminaires and damaged electrical wiring along the canal road. Pedestrian safety and women commuter security severely compromised after sunset.",
        domain: "INFRASTRUCTURE",
        domainName: "Roads & Urban/Rural Infrastructure",
        urgency: "MEDIUM",
        submitterType: "INDIVIDUAL_CITIZEN",
        submitterName: "Rohan Nair",
        citizenEmail: "rohan.nair@adhikar.in",
        state: "Karnataka",
        district: "Bengaluru Urban",
        block: "Yelahanka",
        panchayat: "Canal Ring Road",
        locationText: "Near IISc Outer Perimeter, Yelahanka, Bengaluru",
        latitude: 13.0219,
        longitude: 77.5671,
        affectedPopulation: 1600,
        evidenceImageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800",
        assignedHei: "Indian Institute of Science (IISc), Bengaluru",
        assignedHeiDepartment: "Center for Sustainable Technologies (CST)",
        facultyMentor: "Prof. Monto Mani",
        status: "FIELD_TESTING",
        upvotes: 38,
        triageType: "CIVIC_DIRECT",
        recommendedDepartment: "State Electricity Board / Lighting Division",
        createdAt: "2026-09-03T16:45:00Z",
        updatedAt: "2026-09-07T10:30:00Z"
    },
    {
        id: "ADH-2026-1044",
        title: "Fallen Tree and Heavy Timber Obstructing Public Roadway",
        description: "Large banyan branch collapsed during heavy rainstorm, completely blocking vehicular transit and snapping overhead telecom cables. Emergency clearance crew needed to saw timber and reopen roadway.",
        domain: "ENERGY_ENVIRONMENT",
        domainName: "Clean Energy & Environmental Safety",
        urgency: "CRITICAL",
        submitterType: "GRAM_PANCHAYAT",
        submitterName: "Manoj Kumar (Panchayat Head)",
        citizenEmail: "manoj.mukhya@adhikar.in",
        state: "Jharkhand",
        district: "Palamu",
        block: "Satbarwa",
        panchayat: "Satbarwa Khurd",
        locationText: "National Highway Link, Satbarwa Khurd, Palamu",
        latitude: 23.9525,
        longitude: 84.1825,
        affectedPopulation: 3200,
        evidenceImageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
        assignedHei: "BIT Mesra, Ranchi",
        assignedHeiDepartment: "Clean Water & Rural Innovation FabLab",
        facultyMentor: "Dr. Arvind Sharma",
        status: "RESOLVED",
        upvotes: 91,
        triageType: "CIVIC_DIRECT",
        recommendedDepartment: "Urban Forestry & Disaster Relief Unit",
        createdAt: "2026-09-01T08:00:00Z",
        updatedAt: "2026-09-07T16:00:00Z"
    },
    {
        id: "ADH-2026-1045",
        title: "Fluoride and Arsenic Contamination in Village Borewells - Low Cost Filtration Need",
        description: "Over 8 drinking water handpumps exhibit fluoride levels exceeding 3.5 mg/L causing skeletal fluorosis among children. Need low-cost, bio-char or graphene-based solar filtration unit deployable at village level under NEP 2020 student capstone.",
        domain: "WATER",
        domainName: "Water Resources & Management",
        urgency: "HIGH",
        submitterType: "COMMUNITY_SHG",
        submitterName: "Sunita Devi (Mahila Mandal)",
        citizenEmail: "sunita.devi@adhikar.in",
        state: "Jharkhand",
        district: "Palamu",
        block: "Satbarwa",
        panchayat: "Dali Village",
        locationText: "Dali Gram Panchayat, Satbarwa, Palamu",
        latitude: 23.9200,
        longitude: 84.2300,
        affectedPopulation: 2200,
        evidenceImageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800",
        assignedHei: "BIT Mesra, Ranchi",
        assignedHeiDepartment: "Clean Water & Rural Innovation FabLab",
        facultyMentor: "Dr. Arvind Sharma",
        status: "PROTOTYPING",
        upvotes: 114,
        triageType: "UNIVERSITY_RND",
        recommendedDepartment: "Public Health Engineering Department (PHED)",
        createdAt: "2026-08-28T10:15:00Z",
        updatedAt: "2026-09-07T11:45:00Z"
    }
];

// ============================================================================
// 8-STAGE SOCIAL INNOVATION & GRIEVANCE LIFECYCLE (NEP 2020)
// ============================================================================
export const STAGES_OF_INNOVATION = [
    { key: "SUBMITTED", name: "Problem Ingested", desc: "Citizen challenge verified via 1-Tap GPS & AI Vision.", icon: "📥" },
    { key: "SCREENING", name: "Domain Triage", desc: "AI NLP classification & duplicate deduplication.", icon: "🤖" },
    { key: "ASSIGNED", name: "University HEI Matched", desc: "Assigned to specialized multidisciplinary student lab.", icon: "🎓" },
    { key: "RESEARCH", name: "Field Research & Capstone", desc: "Student team scoping challenge under faculty mentor.", icon: "🔬" },
    { key: "PROTOTYPE", name: "Lab Prototyping", desc: "Low-cost engineering prototype built in university fablab.", icon: "⚙️" },
    { key: "TESTING", name: "Lab & Safety Testing", desc: "Standards and durability validation under faculty guidance.", icon: "🧪" },
    { key: "PILOT", name: "Field Deployment & Verification", desc: "Live on-ground deployment in local area/ward.", icon: "🚀" },
    { key: "RESOLVED", name: "Citizen Sign-Off", desc: "Citizen & local authority verified successful resolution.", icon: "✅" }
];

export const INDUSTRY_CSR_PARTNERS = [
    {
        id: "IND-01",
        name: "National Innovation Seed Fund",
        shortName: "NIF India",
        fundingContribution: "₹3.5 Lakhs Seed Grant",
        domains: ["INFRASTRUCTURE", "WATER", "HEALTHCARE", "ENERGY_ENVIRONMENT"]
    },
    {
        id: "IND-02",
        name: "Smart Cities & Urban Tech Mission",
        shortName: "Smart Cities CSR",
        fundingContribution: "₹5.0 Lakhs Pilot Grant",
        domains: ["INFRASTRUCTURE", "PUBLIC_ADMIN", "ENERGY_ENVIRONMENT"]
    },
    {
        id: "IND-03",
        name: "Clean Water & Sanitation CSR Hub",
        shortName: "Jal Jeevan Tech Grant",
        fundingContribution: "₹4.0 Lakhs Scale Grant",
        domains: ["WATER", "HEALTHCARE", "AGRICULTURE"]
    }
];

