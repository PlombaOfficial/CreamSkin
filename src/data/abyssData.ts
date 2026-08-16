// ==========================================================================
// ABYSS EXPEDITION SCIENTIFIC DATA & NARRATIVE ARCHIVE
// Authentic Deep-Sea Research Lore, Telemetry, and Artifact Registries
// ==========================================================================

export interface CitySector {
  id: string;
  code: string;
  name: string;
  depth: string;
  status: 'ACTIVE' | 'EXPLORING' | 'ANALYSIS' | 'SEALED' | 'UNEXPLORED';
  coordinates: string;
  lastSignal: string;
  acousticFreq: string;
  description: string;
  geologicalNote: string;
  findings: string[];
  x: number; // Percent on map
  y: number; // Percent on map
}

export interface ArchiveArtifact {
  id: string;
  code: string;
  name: string;
  category: string;
  depth: string;
  discovered: string;
  age: string;
  status: string;
  image: string;
  material: string;
  dimensions: string;
  acousticSignature: string;
  description: string;
  curatorLog: string;
  spectroscopy: {
    density: string;
    radiation: string;
    composition: string;
  };
}

export interface ExpeditionAsset {
  id: string;
  title: string;
  type: string;
  classification: string;
  depthRating: string;
  specs: { label: string; value: string }[];
  description: string;
  image: string;
}

export interface CrewMember {
  name: string;
  role: string;
  organization: string;
  dives: number;
  note: string;
}

export interface DepthZone {
  depth: number;
  label: string;
  zoneName: string;
  pressure: string;
  temp: string;
  lightLevel: string;
  description: string;
  fauna: string;
}

export const CITY_SECTORS: CitySector[] = [
  {
    id: 'sec-01',
    code: '01',
    name: 'CENTRAL DISTRICT',
    depth: '4,820 M',
    status: 'ACTIVE',
    coordinates: '37° 11′ 44″ N, 24° 53′ 12″ W',
    lastSignal: '04:16:10 UTC',
    acousticFreq: '14.2 Hz',
    description: 'The monumental core of the sunken metropolis. Dominated by megalithic square colonnades and a central sunken agora spanning 1.4 kilometers across the benthic plain.',
    geologicalNote: 'Basaltic interlocking blocks showing zero trace of hydraulic mortar. Precision cutting tolerance under 0.05 millimeters despite 12,000+ years of hydrostatic pressure.',
    findings: [
      'Submerged central obelisk radiating rhythmic 14.2 Hz micro-vibrations',
      'Cyclopean stone paving submerged beneath 80cm of abyssal pelagic sediment',
      'Structural integrity rated at 94% across primary avenue'
    ],
    x: 48,
    y: 42
  },
  {
    id: 'sec-02',
    code: '02',
    name: 'OLD HARBOR',
    depth: '4,760 M',
    status: 'EXPLORING',
    coordinates: '37° 11′ 28″ N, 24° 53′ 38″ W',
    lastSignal: '04:09:55 UTC',
    acousticFreq: '8.4 Hz',
    description: 'A sunken marine basin carved directly into the submarine basalt plateau. Contains massive stone mooring pylons designed for vessels of inconceivable dimensions.',
    geologicalNote: 'Wave-cut notches along the outer breakwater suggest this harbor was dry and at sea level prior to catastrophic rapid tectonic subsidence.',
    findings: [
      'Fourteen monumental stone pillars aligned with pre-Holocene celestial solstices',
      'Submerged canal system extending toward western trench ridge',
      'Dense manganese nodules encrusting outer basin threshold'
    ],
    x: 32,
    y: 56
  },
  {
    id: 'sec-03',
    code: '03',
    name: 'TEMPLE COMPLEX',
    depth: '4,845 M',
    status: 'ANALYSIS',
    coordinates: '37° 11′ 58″ N, 24° 52′ 48″ W',
    lastSignal: '03:58:20 UTC',
    acousticFreq: '22.0 Hz',
    description: 'An elevated terraced pyramid structure with non-Euclidean angles. Internal chambers remain unflooded by unknown gas pressure equilibrium mechanisms.',
    geologicalNote: 'Internal core stone exhibits inverted electromagnetic properties, deflecting submersibles navigation gyroscopes by 4.2 degrees upon close approach.',
    findings: [
      'Subsurface chamber sealed with hydro-reactive obsidian slab',
      'Intricate relief friezes depicting stellar constellations unknown to modern astronomy',
      'Bioluminescent fluid seepage detected at base altar'
    ],
    x: 64,
    y: 35
  },
  {
    id: 'sec-04',
    code: '04',
    name: 'RESIDENTIAL ZONE',
    depth: '4,790 M',
    status: 'ACTIVE',
    coordinates: '37° 11′ 32″ N, 24° 52′ 55″ W',
    lastSignal: '04:12:00 UTC',
    acousticFreq: '11.1 Hz',
    description: 'Tiered subterranean cellular habitations flanking the eastern boulevard. Over 400 distinct geometric chambers cut directly into the oceanic bedrock.',
    geologicalNote: 'Acoustic resonance within the chambers amplifies ambient deep sea seismic vibrations into audible harmonic overtones.',
    findings: [
      'Recovered domestic stone artifacts showing no evidence of combustion or fire use',
      'Internal hydraulic conduits lined with crystalline silicate coating',
      'Zero human skeletal remains identified within inspected units'
    ],
    x: 62,
    y: 62
  },
  {
    id: 'sec-05',
    code: '05',
    name: 'SUBMERGED ARCHIVE',
    depth: '4,870 M',
    status: 'ACTIVE',
    coordinates: '37° 12′ 04″ N, 24° 53′ 05″ W',
    lastSignal: '04:14:48 UTC',
    acousticFreq: '19.6 Hz',
    description: 'A subterranean subterranean vault located beneath the northern acropolis. Houses thousands of non-corrosive metallic plates engraved with microscopic glyphs.',
    geologicalNote: 'Surrounded by active hydrothermal vents discharging mineral-rich 45°C water, creating a stabilized thermal micro-environment.',
    findings: [
      'Polyhedral data cores (Object 001 series) cataloged in situ',
      'Acoustic resonance matching deep Atlantic mantle plume harmonics',
      'Robotic crawler NERID-4 active in Chamber VII'
    ],
    x: 52,
    y: 24
  },
  {
    id: 'sec-06',
    code: '06',
    name: 'UNKNOWN SECTOR',
    depth: '4,913 M',
    status: 'UNEXPLORED',
    coordinates: '37° 12′ 22″ N, 24° 52′ 10″ W',
    lastSignal: '03:17:32 UTC (INTERMITTENT)',
    acousticFreq: '4.8 Hz (ANOMALOUS)',
    description: 'A colossal fracture descending into the ultra-deep hadal trench. Sonar returns indicate an artificial megastructure plunging down past 6,500 meters.',
    geologicalNote: 'Acoustic Doppler current profilers report non-thermal convection currents emerging from the trench mouth with periodic 38-minute oscillations.',
    findings: [
      'The Black Door (Object 003) discovered along the western fault wall',
      'Extreme sonar refraction preventing full-aperture 3D mapping',
      'Unidentified localized movement recorded on hydrophone array at 03:17 UTC'
    ],
    x: 80,
    y: 78
  }
];

export const ARCHIVE_ARTIFACTS: ArchiveArtifact[] = [
  {
    id: 'art-001',
    code: 'OBJECT 001',
    name: 'METAMORPHIC POLYHEDRON',
    category: 'UNKNOWN MATERIAL / DATA MATRIX',
    depth: '4,702 M',
    discovered: '17.04.2049',
    age: 'EST. > 12,000 BP',
    status: 'ANALYSIS IN PROGRESS',
    image: '/images/archive-object-01.jpg',
    material: 'High-Density Metamorphic Basalt Alloy',
    dimensions: '48.2 cm × 44.0 cm × 52.6 cm',
    acousticSignature: '14.2 Hz continuous harmonic pulse',
    description: 'A geometric twelve-faceted polyhedron engraved with micro-relief glyphs. Material density exceeds standard basalt by 310%, containing non-terrestrial isotopic ratios of osmium and iridium.',
    curatorLog: 'When submerged in seawater, the object produces a localized thermal field of exactly 3.4°C and repels organic biological attachment. Laser diffraction reveals internal hollow chambers arranged in a Fibonacci spiral.',
    spectroscopy: {
      density: '19.4 g/cm³',
      radiation: '0.04 µSv/h (Ambient)',
      composition: 'Basaltic Matrix (62%), Osmium Alloy (24%), Unknown Silicate (14%)'
    }
  },
  {
    id: 'art-002',
    code: 'OBJECT 002',
    name: 'CEREMONIAL RELIQUARY',
    category: 'PRE-DELUGE RELIQUARY',
    depth: '4,811 M',
    discovered: '22.04.2049',
    age: 'UNKNOWN (PRE-HOLOCENE)',
    status: 'PARTIALLY RECOVERED',
    image: '/images/archive-object-02.jpg',
    material: 'Titanium-Coral Petrification & Basalt Filigree',
    dimensions: '112 cm × 74 cm × 42 cm',
    acousticSignature: 'Resonates at 14.0 Hz and 28.0 Hz sub-harmonics',
    description: 'An ornate monumental reliquary recovered from the Submerged Temple courtyard. Features deep-water calcified encrustations fused into an intricate metallic lattice supporting dual miniature figures.',
    curatorLog: 'X-ray tomography indicates the central vault remains sealed under vacuum. Acoustic tapping creates an internal ringing that persists for over 48 seconds without perceptible decay.',
    spectroscopy: {
      density: '11.8 g/cm³',
      radiation: 'Zero detectable gamma emission',
      composition: 'Petrified Biomineral (54%), Titanium-Iron Alloy (38%), Carbon Film (8%)'
    }
  },
  {
    id: 'art-003',
    code: 'OBJECT 003',
    name: 'THE BLACK DOOR',
    category: 'MONOLITHIC SUBTERRANEAN PORTAL',
    depth: '4,903 M',
    discovered: '09.05.2049',
    age: 'INCONCEIVABLE',
    status: 'SEALED — DO NOT ATTEMPT TO BREACH',
    image: '/images/archive-object-03.jpg',
    material: 'Monolithic Obsidian-Carbon Composite',
    dimensions: '42.4 m Height × 18.2 m Width',
    acousticSignature: '0.00% Sonar Return (Acoustic Black Body)',
    description: 'A colossal gateway carved directly into the vertical cliff of the oceanic trench. The surface of the door is pitch black, absorbing 99.8% of all incident submersible light and active sonar pings.',
    curatorLog: 'Robotic manipulators from A-07 Triton attempted to place acoustic sensors upon the threshold; all sensors ceased transmitting telemetry within 40 seconds of contact. The portal remains classified Level 4.',
    spectroscopy: {
      density: 'Immeasurable by ultrasonic probe',
      radiation: 'Negative thermal gradient (-0.8°C at seam)',
      composition: 'Zero organic growth, zero sediment adhesion'
    }
  },
  {
    id: 'art-004',
    code: 'OBJECT 004',
    name: 'ACOUSTIC RESONATOR SPHERE',
    category: 'ACTIVE SUB-BENTHIC TRANSMITTER',
    depth: '4,865 M',
    discovered: '02.05.2049',
    age: 'UNDETERMINED',
    status: 'ACTIVE MONITORING IN CLEANROOM',
    image: '/images/archive-object-04.jpg',
    material: 'Metallic Silicate w/ Active Internal Luminescence',
    dimensions: '64.5 cm Diameter',
    acousticSignature: 'Periodic infrasound pulses (7.83 Hz Schumann resonance)',
    description: 'A hollow spherical apparatus featuring concentric concave acoustic focus chambers. The internal geometry continuously generates faint pale-cyan bioluminescence powered by water temperature differentials.',
    curatorLog: 'When exposed to underwater audio hydrophone recordings from Sector 06, the sphere shifts its light pulse frequency to match the incoming signal waveform. Believed to be an ancient navigational beacon.',
    spectroscopy: {
      density: '8.7 g/cm³',
      radiation: '0.12 µSv/h (Safe threshold)',
      composition: 'Beryllium-Copper-Silicate Shell w/ Phosphor Core'
    }
  }
];

export const EXPEDITION_VESSELS: ExpeditionAsset[] = [
  {
    id: 'vessel-01',
    title: 'DEEP SEA VEHICLE A-07 "TRITON-IX"',
    type: 'Manned Scientific Research Submersible',
    classification: 'Class-IV Ultra-Deep Exploration Sub',
    depthRating: '6,000 M',
    specs: [
      { label: 'Pressure Hull', value: '120mm Titanium-Spherical Matrix' },
      { label: 'Crew Capacity', value: '3 Researchers / Pilots' },
      { label: 'Life Support', value: '96 Hours Continuous' },
      { label: 'Illumination', value: '180,000 Lumens Deep-LED Array' },
      { label: 'Propulsion', value: 'Magnetic Vectored Thrusters (6-Axis)' },
      { label: 'Manipulators', value: 'Dual 7-DOF Hydro-Electric Arms' }
    ],
    description: 'The flagship exploration craft of the ABYSS initiative. Engineered to withstand 580 atmospheres of crushing hydrostatic pressure while maintaining millimeter precision sampling.',
    image: '/images/expedition-craft.jpg'
  },
  {
    id: 'vessel-02',
    title: 'MISSION CONTROL & TELEMETRY LAB',
    type: 'Sub-Benthic Research Command Center',
    classification: 'R/V Oceanus Explorer (Surface Support)',
    depthRating: 'Surface Operations',
    specs: [
      { label: 'Scientific Crew', value: '14 Core Researchers' },
      { label: 'Hydrophone Array', value: '32-Channel Towed Bathymetric Line' },
      { label: 'Mission Duration', value: '183 Days on Station' },
      { label: 'Data Throughput', value: '2.4 Gbps Optical Tether' },
      { label: 'Clearance Level', value: 'Level 4 International Scientific' },
      { label: 'Coordinates', value: '37° 11′ 42″ N, 24° 53′ 18″ W' }
    ],
    description: 'The 24/7 scientific heart of the expedition, processing real-time bathymetric sonar scans, acoustic hydrophone streams, and specimen spectroscopy from 4.8 kilometers below.',
    image: '/images/expedition-control.jpg'
  }
];

export const EXPEDITION_CREW: CrewMember[] = [
  {
    name: 'Dr. Elena Vance',
    role: 'Chief Expedition Oceanographer & Lead Archaeologist',
    organization: 'International Marine Archaeology Consortium',
    dives: 48,
    note: 'First human to visually confirm the monumental stone colonnade of Sector 01 from A-07 Triton.'
  },
  {
    name: 'Dr. Kenjiro Sato',
    role: 'Lead Hydrophone & Acoustic Bathymetrist',
    organization: 'Sub-Benthic Geological Institute',
    dives: 36,
    note: 'Discovered the anomalous 14.2 Hz harmonic carrier wave originating beneath the Temple Complex.'
  },
  {
    name: 'Capt. Aris Thorne',
    role: 'Chief Submersible Commander & Deep Pilot',
    organization: 'Deep Trench Operations Command',
    dives: 112,
    note: 'Logged over 4,200 hours in hadal environments. Piloted all six descent operations into Sector 06.'
  },
  {
    name: 'Dr. Mara Lindqvist',
    role: 'Forensic Paleo-Metallurgist & Materials Lead',
    organization: 'Nordic Deep Research Laboratory',
    dives: 29,
    note: 'Leading spectral analysis of Object 001 and the petrified reliquary matrices in cleanroom 03.'
  }
];

export const DESCENT_ZONES: DepthZone[] = [
  {
    depth: 0,
    label: 'SURFACE',
    zoneName: 'EPIPELAGIC / SUNLIGHT ZONE',
    pressure: '1.0 ATM',
    temp: '22.4°C',
    lightLevel: '100% Penetration',
    description: 'The warm, sunlit Atlantic ocean surface. R/V Oceanus Explorer anchors directly over the abyssal coordinates.',
    fauna: 'Pelagic migratory species, surface plankton, flying fish'
  },
  {
    depth: 500,
    label: '500 M',
    zoneName: 'MESOPELAGIC / TWILIGHT ZONE',
    pressure: '51.2 ATM',
    temp: '8.1°C',
    lightLevel: '0.8% Penetration (Faint Blue)',
    description: 'The last photons of sunlight fade away into perpetual cold twilight. The thermocline drops rapidly.',
    fauna: 'Lanternfish, giant squid, siphonophores, bioluminescent hatchetfish'
  },
  {
    depth: 1200,
    label: '1,200 M',
    zoneName: 'BATHYPELAGIC / MIDNIGHT ZONE',
    pressure: '121.5 ATM',
    temp: '4.0°C',
    lightLevel: '0.00% (Complete Darkness)',
    description: 'Perpetual absolute darkness. Only artificial submersible beams and biological luminescence exist here.',
    fauna: 'Gulper eels, anglerfish, deep pelagic comb jellies, vampire squid'
  },
  {
    depth: 2800,
    label: '2,800 M',
    zoneName: 'ABYSSOPELAGIC / TRENCH RIDGE',
    pressure: '281.0 ATM',
    temp: '2.8°C',
    lightLevel: '0.00% (Absolute Void)',
    description: 'The continental slope drops into the immense benthic plain. Sonar begins receiving non-natural hard reflections.',
    fauna: 'Abyssal grenadiers, giant isopods, benthic sea cucumbers'
  },
  {
    depth: 4820,
    label: '4,820 M',
    zoneName: 'THE SUNKEN CITY / BENTHIC PLAIN',
    pressure: '483.4 ATM',
    temp: '2.1°C',
    lightLevel: 'Artificial Submersible Floodlights',
    description: 'The sea floor opens up to reveal miles of cyclopean stone architecture, monumental columns, and paved avenues.',
    fauna: 'Unclassified bioluminescent abyssal flora, blind amphipods, deep vent tube worms'
  }
];
