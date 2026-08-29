// Mobile Master Data for Jharkhand Societal Innovation Platform

export const JHARKHAND_DISTRICTS = [
    { name: "Ranchi", blocks: ["Kanke", "Namkum", "Ratu", "Ormanjhi", "Silli", "Angara", "Bero", "Burmu", "Itki", "Nagri"] },
    { name: "Palamu", blocks: ["Satbarwa", "Daltonganj", "Chainpur", "Lesliganj", "Patan", "Bishrampur", "Chhatarpur", "Hussainabad", "Hariharganj"] },
    { name: "Khunti", blocks: ["Khunti", "Murhu", "Torpa", "Rania", "Karra", "Arki"] },
    { name: "Dhanbad", blocks: ["Dhanbad", "Jharia", "Baghmara", "Govindpur", "Nirsa", "Baliapur", "Tundi", "Topchanchi"] },
    { name: "East Singhbhum", blocks: ["Jamshedpur", "Ghatshila", "Potka", "Baharagora", "Chakulia", "Musabani", "Dumaria"] },
    { name: "West Singhbhum", blocks: ["Chaibasa", "Chakradharpur", "Jhinkpani", "Manoharpur", "Noamundi", "Jagannathpur", "Sonua"] },
    { name: "Hazaribagh", blocks: ["Sadar", "Barhi", "Barkagaon", "Chauparan", "Ichak", "Katkamsandi", "Keredari", "Bishnugarh"] },
    { name: "Bokaro", blocks: ["Chas", "Bermo", "Chandankiyari", "Gumia", "Jaridih", "Kasmar", "Nawadih", "Petarwar"] },
    { name: "Deoghar", blocks: ["Deoghar", "Madhupur", "Sarath", "Karon", "Devipur", "Palojori", "Mohanpur", "Sarwan"] },
    { name: "Dumka", blocks: ["Dumka", "Jama", "Jarmundi", "Kathikund", "Masalia", "Ramgarh", "Ranishwar", "Shikaripara"] },
    { name: "Giridih", blocks: ["Giridih", "Bagodar", "Bengabad", "Birni", "Deori", "Dhanwar", "Dumri", "Gandey", "Gawan", "Jamua", "Pirtand", "Suriya", "Tisri"] },
    { name: "Godda", blocks: ["Godda", "Boarijor", "Mahagama", "Meherma", "Pathargama", "Poreyahat", "Sundarpahari", "Thakurgangti"] },
    { name: "Gumla", blocks: ["Gumla", "Bishunpur", "Chainpur", "Dumri", "Ghaghra", "Kamdara", "Palkot", "Raidih", "Sisai", "Basia", "Bharno"] },
    { name: "Garhwa", blocks: ["Garhwa", "Bhawanathpur", "Chiniya", "Dandai", "Dhurki", "Kandi", "Kharaundhi", "Majhiaon", "Meral", "Nagar Untari", "Ramkanda", "Ranka", "Sagma"] },
    { name: "Jamtara", blocks: ["Jamtara", "Karmatar", "Kundhit", "Mihijam", "Nala", "Narayanpur"] },
    { name: "Koderma", blocks: ["Koderma", "Chandwara", "Domchanch", "Jainagar", "Markacho", "Satgawan"] },
    { name: "Latehar", blocks: ["Latehar", "Balumath", "Barwadih", "Bariyatu", "Chandwa", "Garu", "Herhanj", "Mahuadanr", "Manika"] },
    { name: "Lohardaga", blocks: ["Lohardaga", "Bhandra", "Kisko", "Kuru", "Peshrar", "Seno"] },
    { name: "Pakur", blocks: ["Pakur", "Hiranpur", "Littipara", "Maheshpur", "Pakuria"] },
    { name: "Ramgarh", blocks: ["Ramgarh", "Dulmi", "Gola", "Mandu", "Patratu"] },
    { name: "Sahibganj", blocks: ["Sahibganj", "Barhait", "Barharwa", "Borio", "Mandro", "Pathna", "Rajmahal", "Taljhari", "Udhwa"] },
    { name: "Seraikela Kharsawan", blocks: ["Seraikela", "Chandil", "Gamharia", "Ichagarh", "Kharsawan", "Kharasawan", "Kukru", "Nimdih", "Rajnagar"] },
    { name: "Simdega", blocks: ["Simdega", "Bano", "Bansjor", "Bolba", "Jaldega", "Kersai", "Kolebira", "Kurdeg", "Pakartanr", "Thethaitangar"] },
    { name: "Chatra", blocks: ["Chatra", "Gidhaur", "Hunterganj", "Itkhori", "Kanhachatti", "Kunda", "Lawalong", "Mayurhand", "Pathalgada", "Pratappur", "Simaria", "Tandwa"] }
];

export const THEMATIC_DOMAINS = [
    { id: "WATER", name: "Water Resources & Management", icon: "💧", color: "#0284c7" },
    { id: "AGRICULTURE", name: "Agriculture & Rural Livelihoods", icon: "🌾", color: "#16a34a" },
    { id: "HEALTHCARE", name: "Healthcare & Sanitation", icon: "🏥", color: "#dc2626" },
    { id: "ENERGY_ENVIRONMENT", name: "Clean Energy & Environment", icon: "☀️", color: "#d97706" },
    { id: "INFRASTRUCTURE", name: "Rural & Urban Infrastructure", icon: "🏗️", color: "#ea580c" },
    { id: "EDUCATION", name: "Education & Skill Development", icon: "📚", color: "#2563eb" },
    { id: "ACCESSIBILITY", name: "Accessibility & Assistive Tech", icon: "♿", color: "#4f46e5" },
    { id: "PUBLIC_ADMIN", name: "Public Admin & e-Governance", icon: "🏛️", color: "#0d9488" },
    { id: "MINING_REHAB", name: "Mining & Eco Rehabilitation", icon: "⛏️", color: "#7c3aed" }
];

export const STAGES_OF_INNOVATION = [
    { step: 1, key: "SUBMITTED", label: "Submitted", desc: "Logged by Citizen / PRI" },
    { step: 2, key: "VALIDATED", label: "Validated", desc: "Reviewed by Nodal Officer" },
    { step: 3, key: "ASSIGNED", label: "Assigned to HEI", desc: "Routed to University FabLab" },
    { step: 4, key: "RESEARCH", label: "R&D & Design", desc: "Multidisciplinary formulation" },
    { step: 5, key: "PROTOTYPE", label: "Prototyping", desc: "Fabrication with CSR seed grant" },
    { step: 6, key: "TESTING", label: "Lab Testing", desc: "Quality & safety compliance" },
    { step: 7, key: "PILOT", label: "Community Pilot", desc: "Live field trial in Panchayat" },
    { step: 8, key: "RESOLVED", label: "Deployed & Verified", desc: "Signed off by Citizen / PRI" }
];

export const INITIAL_SEED_CHALLENGES = [
    {
        id: "JH-2026-0101",
        title: "High Fluoride & Arsenic in Village Drinking Water Handpumps",
        description: "Over 8 deep borewells in Satbarwa Khurd discharge drinking water with fluoride exceeding 4.8 mg/L, causing severe dental and skeletal fluorosis across 420 households.",
        domain: "WATER",
        domainName: "Water Resources & Management",
        urgency: "CRITICAL",
        submitterType: "GRAM_PANCHAYAT",
        submitterName: "Rajesh Oraon (Panchayat Mukhya)",
        citizenEmail: "satbarwa.panchayat@jharkhand.gov.in",
        district: "Palamu",
        block: "Satbarwa",
        panchayat: "Satbarwa Khurd",
        affectedPopulation: 1450,
        status: "PILOT",
        assignedHei: "BIT Mesra, Ranchi",
        facultyMentor: "Dr. Arvind Sharma (Water & Environmental Engg)",
        industryPartner: "Tata Steel Foundation (Water Initiative)",
        prototypeDetails: "Gravity-Fed Nano-Activated Alumina Adsorption Filter Column.",
        pilotResults: "Lab tests showed fluoride reduction to 0.62 mg/L. Passed BIS 10500.",
        citizenVerificationRequested: true,
        upvotes: 48
    },
    {
        id: "JH-2026-0102",
        title: "Post-Harvest Lac Processing & Storage Deterioration",
        description: "Tribal farmers in Khunti face 35% crop spoilage during post-harvest storage and manual scraping of Rangeeni and Kusmi lac.",
        domain: "AGRICULTURE",
        domainName: "Agriculture & Rural Livelihoods",
        urgency: "HIGH",
        submitterType: "COMMUNITY_SHG",
        submitterName: "Birsa Munda Farmer Producer Group",
        citizenEmail: "khunti.fpo@jharkhand.gov.in",
        district: "Khunti",
        block: "Torpa",
        panchayat: "Dormo Panchayat",
        affectedPopulation: 820,
        status: "PROTOTYPE",
        assignedHei: "Birsa Agricultural University (BAU) & NIT Jamshedpur",
        facultyMentor: "Dr. Birsa Hansda & Dr. Manoj Gupta",
        industryPartner: "Jharkhand AgTech Incubator",
        prototypeDetails: "Solar-Assisted Sticklac Scraping and Grade-Separation Machine.",
        upvotes: 34
    }
];
