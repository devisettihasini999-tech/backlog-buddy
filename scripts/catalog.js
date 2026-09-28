/* ==========================================================================
   Backlog Buddy — Curated catalog
   Branches, semesters, subject lists and deep content for featured subjects.
   ========================================================================== */

const BRANCHES = [
  { id: 'cse',   code: 'CSE',   name: 'Computer Science & Engineering', icon: 'cpu',      tone: 'blue',   blurb: 'Core CS, algorithms, systems and software engineering subjects.' },
  { id: 'aiml',  code: 'AIML',  name: 'Artificial Intelligence & Machine Learning', icon: 'brain', tone: 'purple', blurb: 'AI foundations, machine learning, deep learning and data driven subjects.' },
  { id: 'ds',    code: 'DS',    name: 'Data Science', icon: 'chart',   tone: 'cyan',   blurb: 'Statistics, analytics, big data and data engineering subjects.' },
  { id: 'ece',   code: 'ECE',   name: 'Electronics & Communication Engineering', icon: 'wave', tone: 'green', blurb: 'Circuits, signals, communication and VLSI subjects.' },
  { id: 'eee',   code: 'EEE',   name: 'Electrical & Electronics Engineering', icon: 'bolt', tone: 'amber', blurb: 'Machines, power systems, power electronics and control subjects.' },
  { id: 'mech',  code: 'MECH',  name: 'Mechanical Engineering', icon: 'gear', tone: 'red',    blurb: 'Thermal, design, manufacturing and production subjects.' },
  { id: 'civil', code: 'CIVIL', name: 'Civil Engineering', icon: 'building', tone: 'blue', blurb: 'Structures, geotech, transportation and environmental subjects.' },
  { id: 'it',    code: 'IT',    name: 'Information Technology', icon: 'monitor', tone: 'cyan', blurb: 'Programming, web, full stack and information security subjects.' },
  { id: 'other', code: 'OTHER', name: 'Other Engineering Branches', icon: 'grid', tone: 'gray', blurb: 'Common, open elective and interdisciplinary engineering subjects.' }
];

const SEMESTERS = [
  { n: 1, label: '1st Semester', note: 'First year - Physics / Chemistry cycle' },
  { n: 2, label: '2nd Semester', note: 'First year - Chemistry / Physics cycle' },
  { n: 3, label: '3rd Semester', note: 'Second year - core subjects begin' },
  { n: 4, label: '4th Semester', note: 'Second year - core subjects' },
  { n: 5, label: '5th Semester', note: 'Third year - professional electives begin' },
  { n: 6, label: '6th Semester', note: 'Third year - labs and mini project' },
  { n: 7, label: '7th Semester', note: 'Final year - project phase I' },
  { n: 8, label: '8th Semester', note: 'Final year - project phase II' }
];

/* First year is common across branches (scheme 2021, R23 regulation) */
const FIRST_YEAR = {
  1: [
    ['21BS11', 'Mathematics - I', 4],
    ['21BS12', 'Applied Physics', 3],
    ['21ES13', 'Programming for Problem Solving', 3],
    ['21ES14', 'Engineering Graphics & Design', 3],
    ['21HS15', 'Communicative English', 2],
    ['21ES16', 'Problem Solving Laboratory', 1.5]
  ],
  2: [
    ['21BS21', 'Mathematics - II', 4],
    ['21BS22', 'Applied Chemistry', 3],
    ['21ES23', 'Basic Electrical Engineering', 3],
    ['21ES24', 'Elements of Civil Engineering & Mechanics', 3],
    ['21HS25', 'English Communication Laboratory', 1.5],
    ['21ES26', 'Engineering Workshop Practice', 1.5]
  ]
};

const CATALOG = {
  cse: {
    3: [['21CS31', 'Discrete Mathematics', 4], ['21CS32', 'Data Structures', 4], ['21CS33', 'Object Oriented Programming with Java', 3], ['21CS34', 'Digital Logic & Computer Organization', 3], ['21CS35', 'Universal Human Values & Ethics', 2], ['21CS36', 'Data Structures Laboratory', 1.5], ['21CS37', 'Java Programming Laboratory', 1.5]],
    4: [['21CS41', 'Operating Systems', 4], ['21CS42', 'Database Management Systems', 4], ['21CS43', 'Software Engineering', 3], ['21CS44', 'Theory of Computation', 3], ['21CS45', 'DBMS Laboratory', 1.5], ['21CS46', 'Operating Systems Laboratory', 1.5]],
    5: [['21CS51', 'Design & Analysis of Algorithms', 4], ['21CS52', 'Computer Networks', 4], ['21CS53', 'Artificial Intelligence', 3], ['21CS54', 'Microprocessors & Microcontrollers', 3], ['21CS55', 'Professional Elective - I: Cloud Computing', 3], ['21CS56', 'Computer Networks Laboratory', 1.5]],
    6: [['21CS61', 'Machine Learning', 3], ['21CS62', 'Compiler Design', 4], ['21CS63', 'Web Technologies', 3], ['21CS64', 'Professional Elective - II: Cyber Security', 3], ['21CS65', 'Machine Learning Laboratory', 1.5], ['21CS66', 'Mini Project', 2]],
    7: [['21CS71', 'Big Data Analytics', 3], ['21CS72', 'Cryptography & Network Security', 3], ['21CS73', 'Professional Elective - III: DevOps Practices', 3], ['21CS74', 'Open Elective - I', 3], ['21CS75', 'Project Phase - I', 4]],
    8: [['21CS81', 'Professional Elective - IV: Internet of Things', 3], ['21CS82', 'Open Elective - II', 3], ['21CS83', 'Comprehensive Viva', 2], ['21CS84', 'Project Phase - II', 8]]
  },
  aiml: {
    3: [['21AL31', 'Discrete Mathematics', 4], ['21AL32', 'Data Structures', 4], ['21AL33', 'Object Oriented Programming with Python', 3], ['21AL34', 'Digital Logic & Computer Organization', 3], ['21AL35', 'Foundations of Artificial Intelligence', 3], ['21AL36', 'Data Structures Laboratory', 1.5], ['21AL37', 'Python Programming Laboratory', 1.5]],
    4: [['21AL41', 'Operating Systems', 4], ['21AL42', 'Database Management Systems', 4], ['21AL43', 'Linear Algebra for Machine Learning', 3], ['21AL44', 'Probability & Statistics for AI', 3], ['21AL45', 'DBMS Laboratory', 1.5], ['21AL46', 'AI Foundations Laboratory', 1.5]],
    5: [['21AL51', 'Machine Learning', 4], ['21AL52', 'Design & Analysis of Algorithms', 4], ['21AL53', 'Computer Networks', 3], ['21AL54', 'Data Visualization', 3], ['21AL55', 'Professional Elective - I: Deep Learning Basics', 3], ['21AL56', 'Machine Learning Laboratory', 1.5]],
    6: [['21AL61', 'Deep Learning', 4], ['21AL62', 'Computer Vision', 3], ['21AL63', 'Natural Language Processing', 3], ['21AL64', 'Professional Elective - II: Big Data Technologies', 3], ['21AL65', 'Deep Learning Laboratory', 1.5], ['21AL66', 'Mini Project', 2]],
    7: [['21AL71', 'Reinforcement Learning', 3], ['21AL72', 'MLOps', 3], ['21AL73', 'Professional Elective - III: Generative AI', 3], ['21AL74', 'Open Elective - I', 3], ['21AL75', 'Project Phase - I', 4]],
    8: [['21AL81', 'Professional Elective - IV: Edge AI', 3], ['21AL82', 'Open Elective - II', 3], ['21AL83', 'Comprehensive Viva', 2], ['21AL84', 'Project Phase - II', 8]]
  },
  ds: {
    3: [['21DS31', 'Discrete Mathematics', 4], ['21DS32', 'Data Structures', 4], ['21DS33', 'Object Oriented Programming with Java', 3], ['21DS34', 'Statistical Foundations', 4], ['21DS35', 'Data Literacy & Ethics', 2], ['21DS36', 'Data Structures Laboratory', 1.5], ['21DS37', 'Statistics Laboratory', 1.5]],
    4: [['21DS41', 'Database Management Systems', 4], ['21DS42', 'Operating Systems', 4], ['21DS43', 'Data Warehousing & Mining', 3], ['21DS44', 'Linear Algebra', 3], ['21DS45', 'DBMS Laboratory', 1.5], ['21DS46', 'Data Mining Laboratory', 1.5]],
    5: [['21DS51', 'Machine Learning', 4], ['21DS52', 'Big Data Analytics', 4], ['21DS53', 'Design & Analysis of Algorithms', 4], ['21DS54', 'Data Visualization', 3], ['21DS55', 'Professional Elective - I: Cloud Computing', 3], ['21DS56', 'Big Data Laboratory', 1.5]],
    6: [['21DS61', 'Deep Learning', 4], ['21DS62', 'Data Engineering', 3], ['21DS63', 'Time Series Analysis', 3], ['21DS64', 'Professional Elective - II: NoSQL Databases', 3], ['21DS65', 'Deep Learning Laboratory', 1.5], ['21DS66', 'Mini Project', 2]],
    7: [['21DS71', 'Data Science Capstone - I', 4], ['21DS72', 'Recommender Systems', 3], ['21DS73', 'Professional Elective - III: MLOps', 3], ['21DS74', 'Open Elective - I', 3], ['21DS75', 'Project Phase - I', 4]],
    8: [['21DS81', 'Professional Elective - IV: Data Governance', 3], ['21DS82', 'Open Elective - II', 3], ['21DS83', 'Comprehensive Viva', 2], ['21DS84', 'Project Phase - II', 8]]
  },
  it: {
    3: [['21IT31', 'Discrete Mathematics', 4], ['21IT32', 'Data Structures', 4], ['21IT33', 'Object Oriented Programming with Java', 3], ['21IT34', 'Digital Logic & Computer Organization', 3], ['21IT35', 'Technical Communication', 2], ['21IT36', 'Data Structures Laboratory', 1.5], ['21IT37', 'Java Laboratory', 1.5]],
    4: [['21IT41', 'Operating Systems', 4], ['21IT42', 'Database Management Systems', 4], ['21IT43', 'Computer Networks', 4], ['21IT44', 'Software Engineering', 3], ['21IT45', 'DBMS Laboratory', 1.5], ['21IT46', 'Networks Laboratory', 1.5]],
    5: [['21IT51', 'Design & Analysis of Algorithms', 4], ['21IT52', 'Web Technologies', 3], ['21IT53', 'Artificial Intelligence', 3], ['21IT54', 'Information Security', 3], ['21IT55', 'Professional Elective - I: Cloud Computing', 3], ['21IT56', 'Web Technologies Laboratory', 1.5]],
    6: [['21IT61', 'Machine Learning', 3], ['21IT62', 'Full Stack Development', 3], ['21IT63', 'Software Testing', 3], ['21IT64', 'Professional Elective - II: DevOps', 3], ['21IT65', 'Full Stack Laboratory', 1.5], ['21IT66', 'Mini Project', 2]],
    7: [['21IT71', 'Big Data Analytics', 3], ['21IT72', 'Mobile Application Development', 3], ['21IT73', 'Professional Elective - III: Internet of Things', 3], ['21IT74', 'Open Elective - I', 3], ['21IT75', 'Project Phase - I', 4]],
    8: [['21IT81', 'Professional Elective - IV: Blockchain Basics', 3], ['21IT82', 'Open Elective - II', 3], ['21IT83', 'Comprehensive Viva', 2], ['21IT84', 'Project Phase - II', 8]]
  },
  ece: {
    3: [['21EC31', 'Electronic Devices & Circuits', 4], ['21EC32', 'Digital Design', 4], ['21EC33', 'Signals & Systems', 4], ['21EC34', 'Network Analysis', 3], ['21EC35', 'Probability Theory & Stochastic Processes', 3], ['21EC36', 'Electronic Devices Laboratory', 1.5], ['21EC37', 'Digital Design Laboratory', 1.5]],
    4: [['21EC41', 'Analog Circuits', 4], ['21EC42', 'Control Systems', 4], ['21EC43', 'Electromagnetic Fields', 3], ['21EC44', 'Pulse & Digital Circuits', 3], ['21EC45', 'Analog Circuits Laboratory', 1.5], ['21EC46', 'Signals & Systems Laboratory', 1.5]],
    5: [['21EC51', 'Digital Communication', 4], ['21EC52', 'Analog & Digital IC Applications', 3], ['21EC53', 'Antennas & Wave Propagation', 3], ['21EC54', 'Microprocessors & Microcontrollers', 3], ['21EC55', 'Professional Elective - I: VLSI Design', 3], ['21EC56', 'Communication Laboratory', 1.5]],
    6: [['21EC61', 'Digital Signal Processing', 4], ['21EC62', 'VLSI Design', 4], ['21EC63', 'Wireless Communication', 3], ['21EC64', 'Professional Elective - II: Embedded Systems', 3], ['21EC65', 'DSP Laboratory', 1.5], ['21EC66', 'Mini Project', 2]],
    7: [['21EC71', 'Microwave Engineering', 3], ['21EC72', 'Optical Communication', 3], ['21EC73', 'Professional Elective - III: Radar Systems', 3], ['21EC74', 'Open Elective - I', 3], ['21EC75', 'Project Phase - I', 4]],
    8: [['21EC81', 'Professional Elective - IV: Satellite Communication', 3], ['21EC82', 'Open Elective - II', 3], ['21EC83', 'Comprehensive Viva', 2], ['21EC84', 'Project Phase - II', 8]]
  },
  eee: {
    3: [['21EE31', 'Electrical Circuit Analysis', 4], ['21EE32', 'Electromagnetic Fields', 3], ['21EE33', 'Electrical Machines - I', 4], ['21EE34', 'Analog Electronics', 3], ['21EE35', 'Mathematics - III (Transforms)', 3], ['21EE36', 'Electrical Machines Laboratory - I', 1.5]],
    4: [['21EE41', 'Electrical Machines - II', 4], ['21EE42', 'Power Systems - I', 4], ['21EE43', 'Control Systems', 4], ['21EE44', 'Digital Electronics', 3], ['21EE45', 'Electrical Machines Laboratory - II', 1.5], ['21EE46', 'Power Systems Laboratory', 1.5]],
    5: [['21EE51', 'Power Electronics', 4], ['21EE52', 'Electrical Measurements & Instrumentation', 3], ['21EE53', 'Power Systems - II', 4], ['21EE54', 'Microprocessors & Microcontrollers', 3], ['21EE55', 'Professional Elective - I: Renewable Energy Systems', 3], ['21EE56', 'Power Electronics Laboratory', 1.5]],
    6: [['21EE61', 'Power System Analysis', 4], ['21EE62', 'Special Electrical Machines', 3], ['21EE63', 'Switchgear & Protection', 3], ['21EE64', 'Professional Elective - II: Electric Drives', 3], ['21EE65', 'Measurements Laboratory', 1.5], ['21EE66', 'Mini Project', 2]],
    7: [['21EE71', 'Utilization of Electrical Energy', 3], ['21EE72', 'High Voltage Engineering', 3], ['21EE73', 'Professional Elective - III: Smart Grids', 3], ['21EE74', 'Open Elective - I', 3], ['21EE75', 'Project Phase - I', 4]],
    8: [['21EE81', 'Professional Elective - IV: Energy Auditing', 3], ['21EE82', 'Open Elective - II', 3], ['21EE83', 'Comprehensive Viva', 2], ['21EE84', 'Project Phase - II', 8]]
  },
  mech: {
    3: [['21ME31', 'Mechanics of Solids', 4], ['21ME32', 'Engineering Thermodynamics', 4], ['21ME33', 'Fluid Mechanics', 4], ['21ME34', 'Material Science & Metallurgy', 3], ['21ME35', 'Manufacturing Processes - I', 3], ['21ME36', 'Workshop Practice', 1.5]],
    4: [['21ME41', 'Kinematics of Machinery', 4], ['21ME42', 'Applied Thermodynamics', 4], ['21ME43', 'Manufacturing Processes - II', 3], ['21ME44', 'Machine Drawing', 2], ['21ME45', 'Fluid Mechanics Laboratory', 1.5], ['21ME46', 'Machine Shop Laboratory', 1.5]],
    5: [['21ME51', 'Dynamics of Machinery', 4], ['21ME52', 'Design of Machine Elements - I', 4], ['21ME53', 'Heat Transfer', 4], ['21ME54', 'Turbomachinery', 3], ['21ME55', 'Professional Elective - I: Automobile Engineering', 3], ['21ME56', 'Heat Transfer Laboratory', 1.5]],
    6: [['21ME61', 'Design of Machine Elements - II', 4], ['21ME62', 'Metrology & Measurements', 3], ['21ME63', 'Refrigeration & Air Conditioning', 3], ['21ME64', 'Professional Elective - II: Industrial Engineering', 3], ['21ME65', 'Dynamics Laboratory', 1.5], ['21ME66', 'Mini Project', 2]],
    7: [['21ME71', 'Operations Research', 3], ['21ME72', 'CAD / CAM', 3], ['21ME73', 'Professional Elective - III: Robotics', 3], ['21ME74', 'Open Elective - I', 3], ['21ME75', 'Project Phase - I', 4]],
    8: [['21ME81', 'Professional Elective - IV: Mechatronics', 3], ['21ME82', 'Open Elective - II', 3], ['21ME83', 'Comprehensive Viva', 2], ['21ME84', 'Project Phase - II', 8]]
  },
  civil: {
    3: [['21CV31', 'Strength of Materials', 4], ['21CV32', 'Fluid Mechanics', 4], ['21CV33', 'Building Materials & Construction', 3], ['21CV34', 'Surveying - I', 3], ['21CV35', 'Engineering Geology', 3], ['21CV36', 'Surveying Laboratory - I', 1.5]],
    4: [['21CV41', 'Structural Analysis - I', 4], ['21CV42', 'Hydraulics & Hydraulic Machinery', 4], ['21CV43', 'Concrete Technology', 3], ['21CV44', 'Transportation Engineering - I', 3], ['21CV45', 'Surveying Laboratory - II', 1.5], ['21CV46', 'Materials Laboratory', 1.5]],
    5: [['21CV51', 'Design of RC Structures', 4], ['21CV52', 'Structural Analysis - II', 4], ['21CV53', 'Geotechnical Engineering - I', 4], ['21CV54', 'Water Resources Engineering', 3], ['21CV55', 'Professional Elective - I: Environmental Engineering', 3], ['21CV56', 'Geotechnical Laboratory', 1.5]],
    6: [['21CV61', 'Design of Steel Structures', 4], ['21CV62', 'Transportation Engineering - II', 3], ['21CV63', 'Environmental Engineering - II', 3], ['21CV64', 'Professional Elective - II: Construction Management', 3], ['21CV65', 'CAD Laboratory', 1.5], ['21CV66', 'Mini Project', 2]],
    7: [['21CV71', 'Estimation & Costing', 3], ['21CV72', 'Foundation Engineering', 3], ['21CV73', 'Professional Elective - III: Remote Sensing & GIS', 3], ['21CV74', 'Open Elective - I', 3], ['21CV75', 'Project Phase - I', 4]],
    8: [['21CV81', 'Professional Elective - IV: Green Buildings', 3], ['21CV82', 'Open Elective - II', 3], ['21CV83', 'Comprehensive Viva', 2], ['21CV84', 'Project Phase - II', 8]]
  },
  other: {
    3: [['21BS31', 'Mathematics - III', 4], ['21ES32', 'Engineering Mechanics', 3], ['21ES33', 'Basic Electronics', 3], ['21ES34', 'Environmental Studies', 2], ['21ES35', 'Communication Skills for Engineers', 2]],
    5: [['21BS51', 'Operations Research', 3], ['21ES52', 'Total Quality Management', 3], ['21ES53', 'Entrepreneurship Development', 3], ['21ES54', 'Technical Writing & Presentation', 2]],
    7: [['21ES71', 'Project Management', 3], ['21ES72', 'Intellectual Property Rights', 2], ['21ES73', 'Research Methodology', 3]],
    8: [['21ES81', 'Professional Ethics', 2], ['21ES82', 'Engineering Economics & Management', 3]]
  }
};

/* ---------- Unit pools (used to build unit-wise content for every subject) ---------- */
const UNIT_POOLS = {
  math: ['Matrices & Linear Algebra', 'Differential Calculus', 'Integral Calculus', 'Ordinary Differential Equations', 'Vector Calculus', 'Fourier & Z-Transforms', 'Partial Differential Equations', 'Probability & Random Variables', 'Numerical Methods'],
  physics: ['Crystal Structures & Bonding', 'Quantum Mechanics Basics', 'Lasers & Fibre Optics', 'Semiconductor Physics', 'Magnetism & Dielectrics', 'Ultrasonics & Acoustics'],
  chemistry: ['Electrochemistry', 'Water Technology', 'Polymers & Composites', 'Fuels & Combustion', 'Corrosion & Surface Chemistry', 'Lubricants & Cement'],
  programming: ['Introduction & Programming Basics', 'Control Structures & Functions', 'Arrays & Strings', 'Pointers & Structures', 'File Handling', 'Case Studies in Structured Programming'],
  oop: ['Classes & Objects', 'Inheritance & Polymorphism', 'Exception Handling', 'Templates & Collections', 'Multithreading & File I/O'],
  ds: ['Introduction & Linear Structures', 'Stacks, Queues & Recursion', 'Trees & Balanced Search Trees', 'Graphs & Graph Algorithms', 'Searching, Sorting & Hashing'],
  dbms: ['Introduction & Relational Model', 'SQL & Procedural SQL', 'Normalization & Functional Dependencies', 'Transactions, Concurrency & Recovery', 'Storage, Indexing & Advanced Databases'],
  os: ['Operating System Overview & Structures', 'Process Management & Scheduling', 'Concurrency, Synchronization & Deadlocks', 'Memory Management & Virtual Memory', 'File Systems, I/O & Protection'],
  networks: ['Introduction, Switching & Physical Layer', 'Data Link Layer & MAC Protocols', 'Network Layer, Addressing & Routing', 'Transport Layer & Congestion Control', 'Application Layer Protocols & Security'],
  se: ['Software Process Models', 'Requirements Engineering & Analysis', 'Software Design & UML Modelling', 'Software Testing Strategies', 'Project Management & Quality Metrics'],
  toc: ['Finite Automata & Regular Languages', 'Regular Expressions & Grammars', 'Context Free Grammars & Pushdown Automata', 'Turing Machines & Computability', 'Undecidability & Complexity'],
  digital: ['Number Systems & Boolean Algebra', 'Combinational Logic Design', 'Sequential Logic Design', 'Counters, Registers & State Machines', 'Logic Families, PLDs & FPGA'],
  co: ['Basic Structure of Computers', 'Microprogrammed Control Unit', 'Computer Arithmetic', 'Input / Output Organization', 'Memory Organization & Pipelining'],
  algorithms: ['Introduction & Asymptotic Analysis', 'Divide & Conquer and Greedy Methods', 'Dynamic Programming', 'Backtracking & Branch and Bound', 'NP-Hard and NP-Complete Problems'],
  ai: ['Introduction & Intelligent Agents', 'Adversarial Search & Constraint Satisfaction', 'Knowledge Representation & Planning', 'Reasoning Under Uncertainty', 'Machine Learning & NLP Basics'],
  ml: ['Introduction & Regression', 'Classification & Model Evaluation', 'Unsupervised Learning & Dimensionality Reduction', 'Neural Networks & Deep Learning', 'Ensemble Methods & Model Selection'],
  web: ['HTML, CSS & Client Side Scripting', 'Server Side Programming', 'Web Services & XML', 'Frameworks, Sessions & Security', 'Responsive Design & Deployment'],
  cloud: ['Cloud Computing Fundamentals', 'Virtualization & Containers', 'Cloud Storage & Databases', 'Cloud Security & Governance', 'DevOps, Monitoring & Case Studies'],
  security: ['Security Principles & Cryptography Basics', 'Symmetric & Asymmetric Ciphers', 'Network & System Security', 'Web & Application Security', 'Security Standards & Practices'],
  bigdata: ['Big Data Fundamentals', 'Hadoop Ecosystem & MapReduce', 'NoSQL Databases', 'Spark & Stream Processing', 'Data Pipelines & Analytics'],
  signals: ['Signal Analysis & Classification', 'LTI Systems & Convolution', 'Fourier Series & Fourier Transform', 'Sampling, Laplace & Z-Transform', 'Filter Design Basics'],
  control: ['Modelling & Transfer Functions', 'Time Response Analysis', 'Stability & Routh Hurwitz Criterion', 'Root Locus Technique', 'Frequency Response & Compensators'],
  analog: ['Diode Circuits & Applications', 'BJT Amplifiers & Biasing', 'FET Amplifiers', 'Feedback, Oscillators & Tuned Amplifiers', 'Operational Amplifiers & Wave Shaping'],
  edc: ['Semiconductor Diodes', 'Bipolar Junction Transistors', 'Field Effect Transistors', 'Optoelectronic & Special Devices', 'Device Fabrication Basics'],
  pdc: ['Wave Shaping & Clipping Circuits', 'Multivibrators & Time Base Generators', 'Synchronization & Sweep Circuits', 'Sampling Gates', 'Digital to Analog & Analog to Digital Converters'],
  vlsi: ['Fabrication Technology & MOS Physics', 'CMOS Inverter & Logic Gates', 'Combinational & Sequential CMOS Design', 'Subsystem Design & Layout', 'Testing, FPGA & ASIC Basics'],
  dsp: ['Discrete Time Signals & Systems', 'DFT & Fast Fourier Transform', 'IIR Filter Design', 'FIR Filter Design', 'Multirate DSP & Applications'],
  emt: ['Electrostatics & Capacitance', 'Magnetostatics & Magnetic Circuits', 'Maxwell Equations & Plane Waves', 'Transmission Lines', 'Waveguides & Antenna Fundamentals'],
  comm: ['Analog & Digital Modulation', 'Random Processes & Noise', 'Baseband & Bandpass Transmission', 'Error Control Coding', 'Synchronization & Equalization'],
  microwave: ['Microwave Transmission Lines', 'Waveguides & Cavity Resonators', 'Microwave Tubes', 'Solid State Microwave Devices', 'Microwave Measurements'],
  machines: ['Magnetic Circuits & Transformers', 'DC Machines & Testing', 'Induction Machines', 'Synchronous Machines', 'Special Machines & Recent Trends'],
  power: ['Power System Structure & Representation', 'Load Flow & Economic Operation', 'Symmetrical & Unsymmetrical Faults', 'Power System Stability', 'Protection & Switchgear'],
  pe: ['Power Semiconductor Devices', 'Rectifiers, Choppers & Inverters', 'AC Voltage Controllers & Cycloconverters', 'Motor Drives & Control', 'Protection & Applications'],
  measurements: ['Instruments, Errors & Standards', 'Bridges & Potentiometers', 'Electronic & Digital Instruments', 'Oscilloscopes & Signal Analyzers', 'Transducers & Data Acquisition'],
  mech_solids: ['Simple Stresses & Strains', 'Shear Force & Bending Moment', 'Bending & Shear Stresses in Beams', 'Torsion of Shafts & Springs', 'Principal Stresses, Theories of Failure & Columns'],
  thermo: ['Basic Concepts & Zeroth Law', 'First Law of Thermodynamics', 'Second Law, Entropy & Availability', 'Properties of Pure Substances & Gas Mixtures', 'Vapour & Gas Power Cycles'],
  fluids: ['Fluid Properties & Fluid Statics', 'Fluid Kinematics & Dynamics', 'Flow Through Pipes & Losses', 'Boundary Layer & Dimensional Analysis', 'Hydraulic Machines & Turbomachinery'],
  materials: ['Crystal Structure & Imperfections', 'Phase Diagrams & Heat Treatment', 'Mechanical Behaviour & Testing', 'Ferrous & Non-Ferrous Alloys', 'Composite & Advanced Materials'],
  mfg: ['Casting & Welding Processes', 'Metal Forming & Forging', 'Metal Cutting & Machine Tools', 'Jigs, Fixtures & Press Tools', 'NC, CNC & Non-Traditional Machining'],
  dom: ['Static & Dynamic Force Analysis', 'Balancing of Rotating & Reciprocating Masses', 'Friction Devices - Clutches & Brakes', 'Governors, Gyroscopes & Cams', 'Mechanisms & Synthesis Basics'],
  dme: ['Design of Shafts, Keys & Couplings', 'Bolted & Welded Joints', 'Springs, Levers & Links', 'Gears & Gear Trains', 'Bearings, Fatigue & Design for Reliability'],
  heat: ['Conduction & Fins', 'Free & Forced Convection', 'Radiation Heat Transfer', 'Heat Exchangers & Effectiveness', 'Boiling, Condensation & Mass Transfer'],
  hvac: ['Refrigeration Cycles & Systems', 'Vapour Compression & Vapour Absorption', 'Refrigerants & Equipment', 'Psychrometry & Air Conditioning Processes', 'Duct Design, Controls & Applications'],
  civil_solids: ['Simple Stresses, Strains & Elastic Constants', 'Shear Force & Bending Moment Diagrams', 'Bending & Shear Stresses', 'Torsion of Shafts & Springs', 'Principal Stresses, Mohr Circle & Columns'],
  structures: ['Determinacy, Influence Lines & Deflection', 'Energy Methods & Theorem of Three Moments', 'Arches, Cables & Suspension Bridges', 'Moment Distribution & Kani Method', 'Matrix Methods of Structural Analysis'],
  geo: ['Soil Formation, Structure & Properties', 'Classification, Compaction & Permeability', 'Stress Distribution, Seepage & Consolidation', 'Shear Strength & Soil Testing', 'Earth Pressure & Slope Stability'],
  rcc: ['Working Stress & Limit State Design', 'Design of Beams & One Way Slabs', 'Design of Two Way Slabs & Staircases', 'Design of Columns & Footings', 'Retaining Walls & Prestressed Concrete'],
  steel: ['Design Philosophy & Connections', 'Design of Tension & Compression Members', 'Design of Beams & Plate Girders', 'Roof Trusses & Industrial Structures', 'Plastic Analysis & Codal Provisions'],
  surveying: ['Chain, Compass & Plane Table Surveying', 'Levelling & Contouring', 'Theodolite, Traversing & Triangulation', 'Tacheometry, Curves & Setting Out', 'Modern Surveying Instruments & GPS'],
  hydrology: ['Hydrologic Cycle & Precipitation', 'Infiltration, Runoff & Hydrographs', 'Flood Estimation & Routing', 'Groundwater & Well Hydraulics', 'Reservoirs, Dams & Water Harvesting'],
  env: ['Water Demand & Quality Standards', 'Water Treatment Processes', 'Sewage Characteristics & Treatment', 'Air & Noise Pollution Control', 'Solid Waste Management & EIA'],
  transport: ['Highway Development, Alignment & Surveys', 'Geometric Design of Highways', 'Traffic Engineering & Control', 'Pavement Design & Maintenance', 'Railways, Tunnels & Airport Engineering'],
  construction: ['Construction Materials & Masonry', 'Building Planning & Bye Laws', 'Floors, Roofs, Stairs & Doors', 'Damp Proofing, Finishes & Fire Safety', 'Construction Equipment & Scheduling'],
  misc: ['Introduction & Fundamental Concepts', 'Core Theory & Principles', 'Analysis, Design & Applications', 'Case Studies & Practical Aspects', 'Recent Trends & Practice'],
  human: ['Fundamentals of Communication', 'Grammar, Vocabulary & Reading', 'Writing Skills & Technical Writing', 'Presentation & Group Discussion', 'Soft Skills, Ethics & Teamwork'],
  ethics: ['Values, Ethics & Human Conduct', 'Professional & Engineering Ethics', 'Safety, Responsibility & Rights', 'Sustainability & Environmental Ethics', 'Ethical Dilemmas & Case Studies'],
  management: ['Planning, Organizing & Staffing', 'Managerial Economics & Finance', 'Operations, Quality & Inventory Management', 'Entrepreneurship & Innovation', 'Strategy, Control & Leadership']
};

const FEATURED = {
  '21CS32': {
    desc: 'Linear and non-linear data structures, their operations, complexity and applications - the most common backlog subject in CSE.',
    units: [
      { title: 'Introduction & Linear Structures', topics: ['Arrays versus linked lists', 'Singly linked list operations', 'Doubly and circular linked lists', 'Polynomial representation', 'Sparse matrix representation'] },
      { title: 'Stacks, Queues & Recursion', topics: ['Stack ADT and operations', 'Infix to postfix conversion', 'Queue ADT and circular queue', 'Recursion and stack frames', 'Priority queue and deque'] },
      { title: 'Trees & Balanced Search Trees', topics: ['Binary trees and traversals', 'Binary search tree operations', 'AVL tree rotations', 'B-tree insertion and deletion', 'Heap and heap sort', 'Huffman coding'] },
      { title: 'Graphs & Graph Algorithms', topics: ['Graph representation methods', 'BFS and DFS traversals', 'Minimum spanning tree - Kruskal and Prim', 'Shortest paths - Dijkstra and Bellman Ford', 'Topological sorting', 'Connected components'] },
      { title: 'Searching, Sorting & Hashing', topics: ['Linear and binary search', 'Bubble, selection and insertion sort', 'Merge sort and quick sort analysis', 'Radix and counting sort', 'Hash tables and collision resolution', 'File organization methods'] }
    ],
    questions: [
      ['Explain the operations performed on a singly linked list with algorithms.', 1, ['vi', 'fa'], 'Linked list operations', [2022, 2023, 2025]],
      ['Write an algorithm to convert an infix expression into postfix form using a stack.', 2, ['vi', 'rq'], 'Stack operations', [2021, 2022, 2023, 2024, 2025]],
      ['Describe the implementation of a circular queue and its advantages over a linear queue.', 2, ['fa'], 'Queue operations', [2023, 2024]],
      ['Compare array and linked list representations of a list with suitable examples.', 1, ['pq'], 'Linear lists', [2022, 2024]],
      ['Construct a binary search tree for the given data and perform insertion and deletion.', 3, ['vi'], 'Binary search tree operations', [2022, 2023, 2024]],
      ['Explain AVL tree rotations with examples.', 3, ['fa', 'rq'], 'AVL tree rotations', [2021, 2023, 2024, 2025]],
      ['Explain B-tree insertion and deletion with an example.', 3, ['it'], 'B-tree operations', [2023, 2025]],
      ['Write a note on Huffman coding with an example.', 3, ['fa'], 'Huffman coding', [2022, 2024, 2025]],
      ['Explain DFS and BFS traversals of a graph with examples.', 4, ['vi', 'rq'], 'Graph traversal', [2021, 2022, 2023, 2024]],
      ['Find the minimum spanning tree of the given graph using Kruskal algorithm.', 4, ['fa'], 'Minimum spanning tree', [2022, 2023, 2025]],
      ['Explain Dijkstra algorithm for single source shortest path with an example.', 4, ['vi'], 'Shortest path algorithms', [2023, 2024, 2025]],
      ['Write the quick sort algorithm and analyse its time complexity.', 5, ['vi', 'rq'], 'Quick sort', [2021, 2022, 2024, 2025]],
      ['Explain merge sort with a recursion tree and derive its complexity.', 5, ['fa'], 'Merge sort', [2022, 2023, 2024]],
      ['Compare linear probing and quadratic probing used in hashing.', 5, ['it'], 'Hashing and collision resolution', [2023, 2025]],
      ['Explain different file organizations with their merits and demerits.', 5, ['pq'], 'File organization', [2024]]
    ]
  },
  '21CS42': {
    desc: 'Relational model, SQL, normalization, transactions and indexing - core subject for database roles and backend interviews.',
    units: [
      { title: 'Introduction & Relational Model', topics: ['DBMS architecture and data abstraction', 'Relational model and integrity constraints', 'Keys and relational algebra', 'ER modelling and mapping'] },
      { title: 'SQL & Procedural SQL', topics: ['DDL and DML commands', 'Joins, subqueries and views', 'Triggers and stored procedures', 'Cursors and PL/SQL blocks'] },
      { title: 'Normalization & Functional Dependencies', topics: ['Functional dependencies and closure', '1NF, 2NF and 3NF', 'BCNF and lossless join decomposition', 'Multivalued and join dependencies'] },
      { title: 'Transactions, Concurrency & Recovery', topics: ['ACID properties and schedules', 'Serializability and conflict equivalence', 'Locking and two phase locking', 'Deadlock handling and recovery techniques'] },
      { title: 'Storage, Indexing & Advanced Databases', topics: ['File organization and RAID', 'B+ tree and hash indexing', 'Query processing and optimization', 'NoSQL and data warehousing basics'] }
    ],
    questions: [
      ['Explain the three schema architecture of a DBMS with a diagram.', 1, ['fa'], 'DBMS architecture', [2022, 2023, 2024]],
      ['Define the different types of keys in the relational model with examples.', 1, ['vi'], 'Relational keys', [2022, 2024, 2025]],
      ['Write relational algebra expressions for the given queries.', 1, ['rq'], 'Relational algebra', [2021, 2023, 2024]],
      ['Explain the different types of joins in SQL with examples.', 2, ['vi', 'fa'], 'SQL joins', [2022, 2023, 2025]],
      ['Write a trigger and a stored procedure for the given schema.', 2, ['fa'], 'Triggers and procedures', [2023, 2024, 2025]],
      ['Differentiate between DELETE, TRUNCATE and DROP commands.', 2, ['pq'], 'SQL commands', [2023, 2025]],
      ['Compute the closure of the given functional dependencies and find all candidate keys.', 3, ['vi', 'rq'], 'Functional dependencies', [2021, 2022, 2023, 2024]],
      ['Normalize the given relation up to BCNF with justification.', 3, ['vi', 'fa'], 'Normalization', [2022, 2023, 2024, 2025]],
      ['Explain 3NF and BCNF with suitable examples.', 3, ['fa'], 'Normal forms', [2022, 2024]],
      ['Explain the ACID properties of a transaction.', 4, ['vi', 'rq'], 'ACID properties', [2021, 2022, 2023, 2025]],
      ['What is deadlock? Explain deadlock prevention and detection techniques.', 4, ['fa'], 'Deadlock handling', [2023, 2024]],
      ['Explain the two phase locking protocol with an example.', 4, ['it'], 'Locking protocols', [2023, 2025]],
      ['Explain B+ tree indexing with an example.', 5, ['fa'], 'B+ tree indexing', [2022, 2024, 2025]],
      ['Write short notes on data warehousing and OLAP.', 5, ['pq'], 'Data warehousing', [2024, 2025]]
    ]
  },
  '21CS41': {
    desc: 'Processes, scheduling, memory management, file systems and deadlocks - high weightage unit-wise questions in supplementary exams.',
    units: [
      { title: 'Operating System Overview & Structures', topics: ['Functions and types of operating systems', 'System calls and OS structure', 'Process concept and states', 'Process control block and context switch', 'Types of schedulers'] },
      { title: 'Process Management & Scheduling', topics: ['CPU scheduling criteria', 'FCFS, SJF, priority and round robin scheduling', 'Multilevel queue and feedback scheduling', 'Threads and multithreading models', 'Inter process communication'] },
      { title: 'Concurrency, Synchronization & Deadlocks', topics: ['Race conditions and critical section', 'Semaphores and monitors', 'Classic synchronization problems', 'Deadlock characterization and prevention', 'Banker algorithm for avoidance'] },
      { title: 'Memory Management & Virtual Memory', topics: ['Contiguous allocation and fragmentation', 'Paging and segmentation', 'Virtual memory and demand paging', 'Page replacement algorithms', 'Thrashing and working set'] },
      { title: 'File Systems, I/O & Protection', topics: ['File concepts and access methods', 'Directory structure and allocation methods', 'Free space management', 'Disk scheduling algorithms', 'Protection and access control'] }
    ],
    questions: [
      ['Explain the functions of an operating system and draw the layered structure.', 1, ['fa'], 'Operating system functions', [2022, 2023, 2024]],
      ['Compare long term, medium term and short term schedulers.', 1, ['pq'], 'Scheduler types', [2022, 2024]],
      ['Solve the given set of processes using FCFS, SJF and Round Robin and compare average waiting time.', 2, ['vi', 'rq'], 'CPU scheduling', [2021, 2022, 2023, 2024, 2025]],
      ['Explain the inter process communication mechanisms.', 2, ['fa'], 'Inter process communication', [2023, 2024]],
      ['Explain the producer consumer problem using semaphores.', 3, ['vi', 'rq'], 'Semaphores', [2021, 2022, 2023, 2024]],
      ['What is a race condition? Explain with an example.', 3, ['it'], 'Race condition', [2023, 2025]],
      ['Explain the banker algorithm for deadlock avoidance with an example.', 3, ['vi', 'fa'], 'Deadlock avoidance', [2022, 2023, 2024, 2025]],
      ['Compare paging and segmentation.', 4, ['fa'], 'Paging and segmentation', [2022, 2024]],
      ['Explain LRU and FIFO page replacement algorithms with an example.', 4, ['vi', 'rq'], 'Page replacement', [2021, 2023, 2024, 2025]],
      ['Explain demand paging and the steps involved in handling a page fault.', 4, ['it'], 'Demand paging', [2023, 2025]],
      ['Compare contiguous, linked and indexed file allocation methods.', 5, ['fa'], 'File allocation', [2023, 2024]],
      ['Explain disk scheduling algorithms FCFS, SCAN and C-SCAN with an example.', 5, ['vi'], 'Disk scheduling', [2022, 2023, 2025]]
    ]
  },
  '21CS34': {
    desc: 'Computer structure, microprogrammed control, computer arithmetic, I/O organization and memory hierarchy.',
    units: [
      { title: 'Basic Structure of Computers', topics: ['Register transfer and micro operations', 'Bus structures and timing', 'Memory and memory hierarchy', 'Addressing modes and instruction formats'] },
      { title: 'Microprogrammed Control Unit', topics: ['Hardwired versus microprogrammed control', 'Control memory and addressing sequencing', 'Microinstruction formats', 'Microprogram sequencing and design'] },
      { title: 'Computer Arithmetic', topics: ['Addition and subtraction algorithms', 'Booth multiplication algorithm', 'Restoring and non restoring division', 'Floating point representation and arithmetic'] },
      { title: 'Input / Output Organization', topics: ['Peripheral devices and interfaces', 'Programmed and interrupt driven I/O', 'DMA and I/O processors', 'Standard interfaces - USB, PCI'] },
      { title: 'Memory Organization & Pipelining', topics: ['Semiconductor memory types', 'Cache mapping techniques', 'Cache replacement and write policies', 'Instruction pipelining and hazards', 'Superscalar basics'] }
    ],
    questions: [
      ['Explain register transfer language and micro operations with examples.', 1, ['fa'], 'Register transfer', [2022, 2023]],
      ['Explain the basic structure of a computer with a neat diagram.', 1, ['pq'], 'Computer structure', [2023, 2024]],
      ['Compare hardwired and microprogrammed control units.', 2, ['vi', 'rq'], 'Control unit design', [2021, 2022, 2024, 2025]],
      ['Explain microinstruction formats and control memory addressing.', 2, ['fa'], 'Microinstruction formats', [2023, 2024]],
      ['Explain Booth multiplication algorithm with an example.', 3, ['vi', 'fa'], 'Booth multiplication', [2022, 2023, 2024, 2025]],
      ['Explain floating point addition and subtraction with an example.', 3, ['rq'], 'Floating point arithmetic', [2021, 2023, 2024]],
      ['Explain interrupt driven I/O and DMA data transfer.', 4, ['fa'], 'I/O organization', [2023, 2024]],
      ['Explain the different modes of DMA transfer.', 4, ['pq'], 'DMA transfer', [2023, 2025]],
      ['Explain direct mapped, associative and set associative cache mapping.', 5, ['vi', 'rq'], 'Cache mapping', [2022, 2023, 2024, 2025]],
      ['Explain instruction pipelining and the various pipeline hazards.', 5, ['fa'], 'Instruction pipelining', [2022, 2024]]
    ]
  },
  '21CS51': {
    desc: 'Algorithm design paradigms - greedy, divide and conquer, dynamic programming, backtracking and complexity classes.',
    units: [
      { title: 'Introduction & Asymptotic Analysis', topics: ['Growth of functions', 'Asymptotic notations', 'Solving recurrences', 'Master theorem', 'Amortized analysis'] },
      { title: 'Divide & Conquer and Greedy Methods', topics: ['Binary search variants', 'Merge sort and quick sort', 'Maximum and minimum problem', 'Fractional knapsack', 'Huffman coding', 'Job sequencing with deadlines'] },
      { title: 'Dynamic Programming', topics: ['Matrix chain multiplication', 'Longest common subsequence', 'Zero one knapsack', 'All pairs shortest path', 'Travelling salesman problem', 'Optimal binary search trees'] },
      { title: 'Backtracking & Branch and Bound', topics: ['N queens problem', 'Sum of subsets', 'Graph colouring', 'Zero one knapsack by branch and bound', 'TSP by branch and bound'] },
      { title: 'NP-Hard and NP-Complete Problems', topics: ['Tractable and intractable problems', 'P, NP, NP hard and NP complete', 'Cook theorem', 'Reductions', 'Approximation algorithms'] }
    ],
    questions: [
      ['Solve the given recurrence relation using the master theorem.', 1, ['fa'], 'Recurrence relations', [2022, 2023, 2024]],
      ['Explain asymptotic notations with examples.', 1, ['pq'], 'Asymptotic notations', [2022, 2024]],
      ['Solve the fractional knapsack problem using the greedy method.', 2, ['fa'], 'Fractional knapsack', [2023, 2024]],
      ['Solve the zero one knapsack problem using dynamic programming.', 3, ['vi', 'rq'], 'Zero one knapsack', [2021, 2022, 2023, 2024, 2025]],
      ['Find the optimal binary search tree for the given keys and probabilities.', 3, ['fa'], 'Optimal BST', [2023, 2024, 2025]],
      ['Explain matrix chain multiplication with complexity analysis.', 3, ['vi'], 'Matrix chain multiplication', [2022, 2023, 2025]],
      ['Explain the N queens problem using backtracking.', 4, ['vi', 'rq'], 'N queens backtracking', [2021, 2022, 2024, 2025]],
      ['Differentiate between backtracking and branch and bound.', 4, ['pq'], 'Backtracking versus branch and bound', [2023, 2024]],
      ['Explain NP hard and NP complete classes with examples.', 5, ['vi', 'fa'], 'Complexity classes', [2022, 2023, 2024, 2025]],
      ['Compare dynamic programming with divide and conquer.', 1, ['it'], 'Design paradigms', [2024, 2025]]
    ]
  },
  '21CS52': {
    desc: 'Layered network architecture, protocols, addressing, routing, transport layer and application layer services.',
    units: [
      { title: 'Introduction, Switching & Physical Layer', topics: ['Layered architectures - OSI and TCP/IP', 'Circuit, packet and message switching', 'Transmission media and impairments', 'Multiplexing and switching fabrics'] },
      { title: 'Data Link Layer & MAC Protocols', topics: ['Framing and error control', 'CRC and Hamming code', 'Flow control protocols', 'Media access control', 'Ethernet, VLANs and wireless LAN'] },
      { title: 'Network Layer, Addressing & Routing', topics: ['IPv4 and IPv6 addressing', 'Subnetting and CIDR', 'Distance vector routing', 'Link state routing', 'Congestion control and NAT'] },
      { title: 'Transport Layer & Congestion Control', topics: ['UDP and TCP services', 'TCP header and connection management', 'Congestion control mechanisms', 'Quality of service and sockets'] },
      { title: 'Application Layer Protocols & Security', topics: ['DNS and name resolution', 'HTTP, FTP and email protocols', 'SNMP and network management', 'Network security basics'] }
    ],
    questions: [
      ['Compare the OSI and TCP/IP reference models.', 1, ['fa'], 'Reference models', [2022, 2023, 2024]],
      ['Explain the different switching techniques with diagrams.', 1, ['pq'], 'Switching techniques', [2023, 2024]],
      ['Explain the working of CSMA/CD protocol.', 2, ['vi', 'fa'], 'CSMA/CD', [2022, 2023, 2024, 2025]],
      ['Explain error detection and correction using CRC and Hamming code.', 2, ['vi', 'rq'], 'Error control codes', [2021, 2023, 2024, 2025]],
      ['Explain Go-Back-N and Selective Repeat ARQ protocols.', 2, ['fa'], 'ARQ protocols', [2022, 2023, 2024]],
      ['Perform subnetting for the given IP address requirements.', 3, ['vi', 'fa'], 'Subnetting', [2022, 2023, 2024, 2025]],
      ['Explain distance vector and link state routing algorithms.', 3, ['vi'], 'Routing algorithms', [2023, 2024, 2025]],
      ['Compare TCP and UDP with their header formats.', 4, ['fa'], 'TCP versus UDP', [2022, 2023, 2024]],
      ['Explain TCP congestion control mechanisms.', 4, ['vi', 'rq'], 'TCP congestion control', [2023, 2024, 2025]],
      ['Explain the DNS hierarchy and name resolution process.', 5, ['fa'], 'DNS resolution', [2023, 2024]]
    ]
  },
  '21CS53': {
    desc: 'Search techniques, knowledge representation, reasoning under uncertainty and machine learning basics.',
    units: [
      { title: 'Introduction & Intelligent Agents', topics: ['AI problems and foundations', 'Agent types and environments', 'Uninformed search - BFS, DFS', 'Informed search - greedy and A*', 'Heuristic functions'] },
      { title: 'Adversarial Search & Constraint Satisfaction', topics: ['Minimax algorithm', 'Alpha beta pruning', 'Constraint satisfaction problems', 'Backtracking search for CSP', 'Local search methods'] },
      { title: 'Knowledge Representation & Planning', topics: ['Propositional and first order logic', 'Inference rules and unification', 'Resolution refutation', 'Forward and backward chaining', 'Planning and STRIPS'] },
      { title: 'Reasoning Under Uncertainty', topics: ['Probability and Bayes theorem', 'Bayesian networks', 'Certainty factors', 'Decision trees and ID3', 'Reinforcement learning basics'] },
      { title: 'Machine Learning & NLP Basics', topics: ['Supervised and unsupervised learning', 'Neural network fundamentals', 'Natural language processing stages', 'Expert systems and applications'] }
    ],
    questions: [
      ['Explain the various types of agents with examples.', 1, ['fa'], 'Intelligent agents', [2022, 2023]],
      ['Solve the given problem using A* search and explain admissibility.', 1, ['vi', 'rq'], 'A* search', [2021, 2023, 2024, 2025]],
      ['Explain the minimax algorithm with alpha beta pruning.', 2, ['vi', 'rq'], 'Minimax and alpha beta', [2022, 2023, 2024, 2025]],
      ['Formulate the given problem as a CSP and solve it.', 2, ['fa'], 'Constraint satisfaction', [2023, 2024]],
      ['Convert the given statements into first order logic.', 3, ['fa'], 'First order logic', [2022, 2023, 2024]],
      ['Explain resolution refutation with an example.', 3, ['vi'], 'Resolution refutation', [2023, 2024, 2025]],
      ['Explain the working of a Bayesian network with an example.', 4, ['fa'], 'Bayesian networks', [2023, 2024]],
      ['Explain the ID3 decision tree algorithm.', 4, ['vi'], 'Decision tree induction', [2022, 2023, 2025]],
      ['Write short notes on expert systems.', 5, ['pq'], 'Expert systems', [2023, 2024]]
    ]
  },
  '21CS61': {
    desc: 'Supervised, unsupervised and ensemble learning methods with model evaluation - a favourite of supplementary exams.',
    units: [
      { title: 'Introduction & Regression', topics: ['Types of machine learning', 'Hypothesis space and cost function', 'Gradient descent variants', 'Linear and polynomial regression', 'Regularization - ridge and lasso'] },
      { title: 'Classification & Model Evaluation', topics: ['Logistic regression', 'Support vector machines and kernels', 'K nearest neighbours', 'Decision trees and random forests', 'Confusion matrix and metrics'] },
      { title: 'Unsupervised Learning & Dimensionality Reduction', topics: ['K means clustering', 'Hierarchical clustering', 'DBSCAN and density methods', 'Principal component analysis', 'Association rule mining'] },
      { title: 'Neural Networks & Deep Learning', topics: ['Perceptron and MLP', 'Backpropagation algorithm', 'Activation functions', 'CNN architecture basics', 'RNN and sequence models'] },
      { title: 'Ensemble Methods & Model Selection', topics: ['Bias variance tradeoff', 'Bagging and boosting', 'Cross validation strategies', 'Hyperparameter tuning', 'Model deployment basics'] }
    ],
    questions: [
      ['Explain gradient descent and its variants.', 1, ['vi', 'fa'], 'Gradient descent', [2022, 2023, 2024, 2025]],
      ['Derive the normal equation for linear regression.', 1, ['fa'], 'Linear regression', [2022, 2023]],
      ['Explain logistic regression with the sigmoid function.', 2, ['vi', 'rq'], 'Logistic regression', [2021, 2023, 2024, 2025]],
      ['Explain the SVM algorithm with the kernel trick.', 2, ['vi', 'fa'], 'Support vector machines', [2022, 2023, 2024, 2025]],
      ['Explain k means clustering with an example.', 3, ['fa'], 'K means clustering', [2023, 2024]],
      ['Explain PCA and its role in dimensionality reduction.', 3, ['vi'], 'Principal component analysis', [2023, 2024, 2025]],
      ['Explain backpropagation with a neat diagram.', 4, ['vi', 'rq'], 'Backpropagation', [2022, 2023, 2024, 2025]],
      ['Compare bagging and boosting techniques.', 5, ['fa'], 'Ensemble methods', [2023, 2024]],
      ['Explain the confusion matrix, precision, recall and F1 score.', 2, ['vi'], 'Evaluation metrics', [2022, 2023, 2024, 2025]]
    ]
  },
  '21EC32': {
    desc: 'Number systems, combinational and sequential design, counters and logic families.',
    units: [
      { title: 'Number Systems & Boolean Algebra', topics: ['Number systems and codes', 'Boolean algebra theorems', 'Sum of products and product of sums', 'Karnaugh map simplification', 'Quine McCluskey method'] },
      { title: 'Combinational Logic Design', topics: ['Adders and subtractors', 'Multiplexers and demultiplexers', 'Encoders and decoders', 'Comparators and code converters', 'Hazards in combinational circuits'] },
      { title: 'Sequential Logic Design', topics: ['Latches and flip flops', 'SR, JK, D and T flip flops', 'Triggering methods', 'State tables and state diagrams', 'Mealy and Moore models'] },
      { title: 'Counters, Registers & State Machines', topics: ['Ripple and synchronous counters', 'Modulo N counter design', 'Ring and Johnson counters', 'Shift registers', 'Sequence generators and detectors'] },
      { title: 'Logic Families, PLDs & FPGA', topics: ['TTL and CMOS characteristics', 'ECL and other logic families', 'RAM and ROM types', 'PLA and PAL architectures', 'FPGA and CPLD basics'] }
    ],
    questions: [
      ['Simplify the given Boolean function using a Karnaugh map.', 1, ['vi', 'rq'], 'K-map simplification', [2021, 2022, 2023, 2024, 2025]],
      ['Explain the theorems of Boolean algebra with examples.', 1, ['fa'], 'Boolean theorems', [2022, 2023, 2024]],
      ['Design a 4-bit binary adder using full adders.', 2, ['vi'], 'Adder design', [2022, 2023, 2024]],
      ['Implement the given Boolean function using an 8:1 multiplexer.', 2, ['fa', 'rq'], 'Multiplexer implementation', [2021, 2023, 2024, 2025]],
      ['Explain the working of SR, JK, D and T flip flops.', 3, ['vi', 'fa'], 'Flip flops', [2022, 2023, 2024, 2025]],
      ['Explain the difference between asynchronous and synchronous counters.', 4, ['fa'], 'Counter types', [2023, 2024]],
      ['Design a mod-10 counter using flip flops.', 4, ['vi'], 'Modulo counter design', [2022, 2023, 2024]],
      ['Compare TTL and CMOS logic families.', 5, ['pq'], 'Logic families', [2023, 2024]],
      ['Explain PLA, PAL and FPGA architectures.', 5, ['fa'], 'Programmable logic devices', [2022, 2024]]
    ]
  },
  '21ME32': {
    desc: 'Laws of thermodynamics, entropy, properties of steam and gas mixtures, and standard power cycles.',
    units: [
      { title: 'Basic Concepts & Zeroth Law', topics: ['Systems, surroundings and boundaries', 'Properties and equilibrium', 'Work and heat transfer', 'Temperature scales and zeroth law'] },
      { title: 'First Law of Thermodynamics', topics: ['First law for closed systems', 'Internal energy and enthalpy', 'Steady flow energy equation', 'Nozzles, diffusers and turbines', 'PMM-I impossibility'] },
      { title: 'Second Law, Entropy & Availability', topics: ['Kelvin Planck and Clausius statements', 'Carnot cycle and theorem', 'Clausius inequality', 'Entropy change of ideal gases', 'Availability and irreversibility'] },
      { title: 'Properties of Pure Substances & Gas Mixtures', topics: ['Phase change processes', 'Steam tables and Mollier chart', 'Dryness fraction measurement', 'Dalton law of partial pressures', 'Amagat law and gas mixtures'] },
      { title: 'Vapour & Gas Power Cycles', topics: ['Otto cycle analysis', 'Diesel cycle analysis', 'Dual cycle', 'Brayton cycle', 'Rankine cycle'] }
    ],
    questions: [
      ['Distinguish between closed, open and isolated systems with examples.', 1, ['fa'], 'Thermodynamic systems', [2022, 2023]],
      ['Explain the zeroth law of thermodynamics and its applications.', 1, ['pq'], 'Zeroth law', [2023, 2024]],
      ['Derive the steady flow energy equation and apply it to a nozzle.', 2, ['vi', 'rq'], 'Steady flow energy equation', [2021, 2022, 2023, 2024, 2025]],
      ['Explain the equivalence of Kelvin Planck and Clausius statements.', 3, ['fa'], 'Second law statements', [2022, 2023, 2024]],
      ['Prove that the entropy of the universe always increases.', 3, ['vi'], 'Entropy principle', [2023, 2024, 2025]],
      ['Explain the Mollier chart and its engineering uses.', 4, ['fa'], 'Mollier chart', [2022, 2024]],
      ['Compare Otto and Diesel cycles with p-v and T-s diagrams.', 5, ['vi', 'rq'], 'Air standard cycles', [2022, 2023, 2024, 2025]],
      ['Explain the Rankine cycle with a T-s diagram.', 5, ['fa'], 'Rankine cycle', [2023, 2024]]
    ]
  },
  '21CV31': {
    desc: 'Stress, strain, SFD and BMD, bending and shear stresses, torsion and columns - essential for civil core exams.',
    units: [
      { title: 'Simple Stresses, Strains & Elastic Constants', topics: ['Stress, strain and Hooke law', 'Elastic constants and relations', 'Composite bars and temperature stresses', 'Poisson ratio and volumetric strain'] },
      { title: 'Shear Force & Bending Moment Diagrams', topics: ['Types of beams and loads', 'Cantilever with various loads', 'Simply supported beam diagrams', 'Overhanging beams', 'Relation between load, SF and BM'] },
      { title: 'Bending & Shear Stresses', topics: ['Theory of simple bending', 'Bending equation derivation', 'Section modulus', 'Shear stress distribution in sections', 'Combined direct and bending stresses'] },
      { title: 'Torsion of Shafts & Springs', topics: ['Torsion equation derivation', 'Power transmitted by shafts', 'Hollow versus solid shafts', 'Helical springs', 'Leaf springs and spring combinations'] },
      { title: 'Principal Stresses, Mohr Circle & Columns', topics: ['Principal planes and stresses', 'Mohr circle construction', 'Theories of failure', 'Euler formula for columns', 'Slenderness ratio and end conditions'] }
    ],
    questions: [
      ['Explain Hooke law and derive the relation between the elastic constants.', 1, ['vi', 'fa'], 'Elastic constants', [2022, 2023, 2024, 2025]],
      ['A composite bar is subjected to axial load - determine the stress in each section.', 1, ['fa'], 'Composite bars', [2022, 2023, 2024]],
      ['Draw the shear force and bending moment diagrams for the given beam.', 2, ['vi', 'rq'], 'SFD and BMD', [2021, 2022, 2023, 2024, 2025]],
      ['Derive the bending equation M/I = sigma/y = E/R.', 3, ['vi', 'rq'], 'Bending equation', [2022, 2023, 2024, 2025]],
      ['Explain the distribution of shear stress in a rectangular section.', 3, ['fa'], 'Shear stress distribution', [2022, 2023, 2024]],
      ['Derive the torsion equation and the power transmitted by a shaft.', 4, ['vi', 'fa'], 'Torsion equation', [2022, 2023, 2024, 2025]],
      ['Explain Mohr circle for the determination of principal stresses.', 5, ['vi', 'fa'], 'Mohr circle', [2022, 2023, 2024, 2025]],
      ['State and explain Euler theory of columns.', 5, ['fa'], 'Euler column theory', [2023, 2024, 2025]]
    ]
  }
};

module.exports = { BRANCHES, SEMESTERS, FIRST_YEAR, CATALOG, UNIT_POOLS, FEATURED };
