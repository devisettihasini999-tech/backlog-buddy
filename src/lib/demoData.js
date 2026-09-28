// Backlog Buddy — demo dataset.
// This powers the app out of the box (demo mode) and can be imported into
// Supabase via the Admin panel once the database schema (supabase/schema.sql)
// has been applied. Records use the same field names as the database tables.
import papersSpec from '../../data/papers.json'

// ---------------------------------------------------------------- branches
const branches = [
  { id: 'cse', code: 'CSE', name: 'Computer Science & Engineering', description: 'Programming, systems, software and core CS subjects.', icon: 'code', sort_order: 1 },
  { id: 'aiml', code: 'AI&ML', name: 'AI & Machine Learning', description: 'Mathematics, data and intelligent systems subjects.', icon: 'brain', sort_order: 2 },
  { id: 'ds', code: 'DS', name: 'Data Science', description: 'Statistics, data analysis and machine learning subjects.', icon: 'chart', sort_order: 3 },
  { id: 'ece', code: 'ECE', name: 'Electronics & Communication Engineering', description: 'Circuits, signals, DSP and communication subjects.', icon: 'chip', sort_order: 4 },
  { id: 'eee', code: 'EEE', name: 'Electrical & Electronics Engineering', description: 'Circuits, machines, power and control subjects.', icon: 'bolt', sort_order: 5 },
  { id: 'me', code: 'ME', name: 'Mechanical Engineering', description: 'Thermo, mechanics, materials and design subjects.', icon: 'gear', sort_order: 6 },
  { id: 'ce', code: 'CE', name: 'Civil Engineering', description: 'Structures, surveying, fluids and design subjects.', icon: 'bridge', sort_order: 7 },
  { id: 'it', code: 'IT', name: 'Information Technology', description: 'Programming, networking, databases and web subjects.', icon: 'globe', sort_order: 8 },
  { id: 'oth', code: 'OTH', name: 'Other Engineering Branches', description: 'Biomedical, chemical, aerospace and other specialisations.', icon: 'box', sort_order: 9 },
]

const SEM_COUNT = { cse: 8, aiml: 4, ds: 4, ece: 4, eee: 4, me: 4, ce: 4, it: 4, oth: 2 }

const semesters = Object.entries(SEM_COUNT).flatMap(([bid, n]) =>
  Array.from({ length: n }, (_, i) => {
    const order = i + 1
    const ord = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'][order - 1]
    return { id: `${bid}-sem${order}`, branch_id: bid, order_no: order, label: `${ord} Semester` }
  })
)

// ------------------------------------------------------------- subjects
// [branchId, semesterOrder, code, name, units(5) | null]
const SUBJ = [
  // CSE
  ['cse', 1, 'MA101', 'Engineering Mathematics I', ['Partial Derivatives', "Taylor & Maclaurin Series", 'Maxima & Minima', 'First Order ODEs', 'Fourier Series']],
  ['cse', 1, 'PH101', 'Engineering Physics', null],
  ['cse', 1, 'CS101', 'Programming in C', ['Basics & Data Types', 'Control Structures', 'Functions & Recursion', 'Pointers & Strings', 'Structures & Files']],
  ['cse', 1, 'BE101', 'Basic Electrical & Electronics', null],
  ['cse', 2, 'MA102', 'Engineering Mathematics II', null],
  ['cse', 2, 'CS201', 'Python Programming', ['Basics & Data Types', 'Functions & Modules', 'Strings & Lists', 'Tuples, Dictionaries & Files', 'OOP in Python']],
  ['cse', 2, 'CS202', 'Object Oriented Programming with C++', null],
  ['cse', 2, 'CS203', 'Digital Logic Design', ['Number Systems & Codes', 'Boolean Algebra & K-Maps', 'Combinational Circuits', 'Sequential Circuits', 'Counters, Registers & Memory']],
  ['cse', 3, 'CS301', 'Data Structures', ['Fundamentals & Complexity', 'Stacks & Queues', 'Linked Lists', 'Recursion & Sorting', 'Trees & Graphs']],
  ['cse', 3, 'CS302', 'Database Management Systems', ['DBMS Fundamentals', 'ER Model', 'SQL', 'Normalisation', 'Concurrency & Security']],
  ['cse', 3, 'MA301', 'Engineering Mathematics III', ['Linear Algebra', 'Vector Calculus', 'Systems & Transformations', 'Complex Variables', 'Applications']],
  ['cse', 3, 'CS303', 'Theory of Computation', ['Finite Automata', 'Regular Languages', 'Context-Free Languages', 'Pumping Lemma & Languages', 'Decidability']],
  ['cse', 4, 'CS401', 'Operating Systems', ['OS Fundamentals', 'Process Management', 'Deadlocks', 'Memory Management', 'File Systems']],
  ['cse', 4, 'CS402', 'Computer Networks', ['OSI & TCP/IP Models', 'Data Link Layer', 'Network Layer', 'Transport Layer', 'Application Layer']],
  ['cse', 4, 'CS403', 'Software Engineering', ['SDLC Models', 'Requirements & UML', 'Testing', 'Maintenance & Metrics', 'Project Planning']],
  ['cse', 4, 'MA401', 'Probability & Statistics', null],
  ['cse', 5, 'CS501', 'Computer Organization & Architecture', ['Von Neumann & CPU', 'Instruction Cycle & I/O', 'Memory Hierarchy', 'Virtual Memory', 'Pipelining & Parallelism']],
  ['cse', 5, 'CS502', 'Design & Analysis of Algorithms', ['Asymptotic Analysis', 'Divide & Conquer', 'Greedy Method', 'Dynamic Programming', 'Backtracking']],
  ['cse', 5, 'CS503', 'Web Technologies', ['Web & HTML', 'CSS', 'JavaScript', 'AJAX & JSON', 'MVC & Frameworks']],
  ['cse', 5, 'CS504', 'Microprocessors & Interfacing', null],
  ['cse', 6, 'CS601', 'Machine Learning', ['ML Fundamentals', 'Regression', 'Trees & Naive Bayes', 'Clustering & SVM', 'Neural Networks']],
  ['cse', 6, 'CS602', 'Internet of Things', null],
  ['cse', 6, 'CS603', 'Cloud Computing', null],
  ['cse', 6, 'CS604', 'Cyber Security', null],
  ['cse', 7, 'CS701', 'Big Data Analytics', null],
  ['cse', 7, 'CS702', 'Artificial Intelligence', null],
  ['cse', 7, 'CS703', 'Natural Language Processing', null],
  ['cse', 7, 'CS704', 'Blockchain Technology', null],
  ['cse', 8, 'CS801', 'Deep Learning', null],
  ['cse', 8, 'CS802', 'DevOps & MLOps', null],
  ['cse', 8, 'CS803', 'IoT & Embedded Systems', null],
  ['cse', 8, 'CS804', 'Major Project', null],
  // AI & ML
  ['aiml', 1, 'MA101', 'Engineering Mathematics I', null],
  ['aiml', 1, 'PH101', 'Engineering Physics', null],
  ['aiml', 1, 'AIML101', 'Python Programming', ['Basics & Data Types', 'Functions & Modules', 'Strings & Collections', 'OOP in Python', 'Mini Applications']],
  ['aiml', 1, 'AIML102', 'Discrete Mathematics', null],
  ['aiml', 2, 'AIML201', 'Linear Algebra & Probability', ['Matrices & Determinants', 'Systems of Equations', 'Eigenvalues', 'Vector Spaces', 'Probability Basics']],
  ['aiml', 2, 'AIML202', 'Data Structures', null],
  ['aiml', 2, 'AIML203', 'Calculus', null],
  ['aiml', 3, 'AIML301', 'Probability & Statistics', null],
  ['aiml', 3, 'AIML302', 'Database Systems', null],
  ['aiml', 3, 'AIML303', 'Numerical Methods', null],
  ['aiml', 4, 'AIML401', 'Machine Learning', ['ML Fundamentals', 'Regression', 'Trees & Naive Bayes', 'Clustering & SVM', 'Neural Networks']],
  ['aiml', 4, 'AIML402', 'Deep Learning', null],
  ['aiml', 4, 'AIML403', 'Natural Language Processing', null],
  // Data Science
  ['ds', 1, 'MA101', 'Engineering Mathematics I', null],
  ['ds', 1, 'PH101', 'Engineering Physics', null],
  ['ds', 1, 'DS101', 'Python Programming', null],
  ['ds', 1, 'DS102', 'Statistics', ['Descriptive Statistics', 'Probability Distributions', 'Sampling', 'Estimation', 'Hypothesis Testing']],
  ['ds', 2, 'DS201', 'Calculus', null],
  ['ds', 2, 'DS202', 'Data Structures', null],
  ['ds', 2, 'DS203', 'Linear Algebra', null],
  ['ds', 3, 'DS301', 'Probability & Statistics', ['Descriptive Statistics', 'Probability Distributions', 'Sampling', 'Estimation', 'Hypothesis Testing']],
  ['ds', 3, 'DS302', 'Database Management Systems', null],
  ['ds', 3, 'DS303', 'R Programming', null],
  ['ds', 4, 'DS401', 'Machine Learning', null],
  ['ds', 4, 'DS402', 'Data Mining', null],
  ['ds', 4, 'DS403', 'Big Data Analytics', null],
  // ECE
  ['ece', 1, 'MA101', 'Engineering Mathematics I', null],
  ['ece', 1, 'PH101', 'Engineering Physics', null],
  ['ece', 1, 'EC101', 'Basic Electronics', null],
  ['ece', 1, 'EC102', 'Engineering Chemistry', null],
  ['ece', 2, 'EC202', 'Network Theory', ['Circuit Laws & Analysis', 'Network Theorems', 'Transient Analysis', 'Two-Port Networks', 'Resonance & Filters']],
  ['ece', 2, 'EC203', 'Electronic Circuits I', null],
  ['ece', 2, 'EC204', 'Digital Circuits', null],
  ['ece', 3, 'EC301', 'Signals & Systems', ['Signals & Classification', 'LTI Systems', 'Fourier Series & Transform', 'Laplace Transform', 'Z-Transform']],
  ['ece', 3, 'EC302', 'Analog & Digital Electronics', ['Diodes & Rectifiers', 'BJT Amplifiers', 'Biasing Techniques', 'Amp Configurations', 'Feedback & Power']],
  ['ece', 3, 'EC303', 'Electromagnetic Fields', null],
  ['ece', 4, 'EC401', 'Digital Signal Processing', ['Digital Signals & Sampling', 'DFT & FFT', 'IIR Filters', 'FIR Filters', 'Multirate & Word Length']],
  ['ece', 4, 'EC402', 'Communication Systems', null],
  ['ece', 4, 'EC403', 'Microprocessors & Microcontrollers', null],
  // EEE
  ['eee', 1, 'MA101', 'Engineering Mathematics I', null],
  ['eee', 1, 'PH101', 'Engineering Physics', null],
  ['eee', 1, 'EE101', 'Basic Electrical Engineering', null],
  ['eee', 1, 'EE102', 'Engineering Chemistry', null],
  ['eee', 2, 'EE201', 'Circuit Theory', ['DC Circuit Laws', 'AC Fundamentals', 'RLC Circuits', 'Transients', 'Theorems & Resonance']],
  ['eee', 2, 'EE202', 'Electrical Machines I', null],
  ['eee', 3, 'EE301', 'Power Systems I', null],
  ['eee', 3, 'EE302', 'Control Systems', ['Basics & Transfer Functions', 'Time Response', 'Stability & Root Locus', 'Frequency Response', 'Controllers']],
  ['eee', 3, 'EE303', 'Electrical Machines II', null],
  ['eee', 4, 'EE401', 'Power Electronics', ['Power Devices', 'Rectifiers', 'Inverters', 'Choppers', 'AC Voltage Controllers']],
  ['eee', 4, 'EE402', 'Switchgear & Protection', null],
  ['eee', 4, 'EE403', 'Digital System Design', null],
  // Mechanical
  ['me', 1, 'MA101', 'Engineering Mathematics I', null],
  ['me', 1, 'PH101', 'Engineering Physics', null],
  ['me', 1, 'ME101', 'Engineering Drawing', null],
  ['me', 1, 'ME102', 'Engineering Chemistry', null],
  ['me', 2, 'ME201', 'Engineering Thermodynamics', ['Basic Concepts', 'First Law of Thermodynamics', 'Second Law & Entropy', 'Steam & Properties', 'Thermodynamic Cycles']],
  ['me', 2, 'ME202', 'Engineering Mechanics', ['Force Systems', 'Moments & Equilibrium', 'Centroids', 'Moment of Inertia', 'Friction & Trusses']],
  ['me', 2, 'ME203', 'Materials & Metallurgy', null],
  ['me', 3, 'ME301', 'Strength of Materials', ['Stress & Strain', 'Shear & Bending Moment', 'Bending Stress', 'Torsion', 'Columns & Failure Theories']],
  ['me', 3, 'ME302', 'Machine Design I', null],
  ['me', 3, 'ME303', 'Fluid Mechanics', ['Fluid Properties', 'Fluid Statics', 'Fluid Kinematics', 'Bernoulli & Flow Measurement', 'Pipe Flow & Boundary Layer']],
  ['me', 4, 'ME401', 'Heat & Mass Transfer', null],
  ['me', 4, 'ME402', 'Mechanical Measurements', null],
  ['me', 4, 'ME403', 'Design of Machine Elements', null],
  // Civil
  ['ce', 1, 'MA101', 'Engineering Mathematics I', null],
  ['ce', 1, 'PH101', 'Engineering Physics', null],
  ['ce', 1, 'CE101', 'Engineering Drawing', null],
  ['ce', 1, 'CE102', 'Engineering Chemistry', null],
  ['ce', 2, 'CE201', 'Engineering Mechanics', null],
  ['ce', 2, 'CE202', 'Building Materials', null],
  ['ce', 2, 'CE203', 'Surveying', ['Chaining & Levelling Basics', 'Compass Surveying', 'Levelling', 'Theodolite & Traversing', 'Contouring']],
  ['ce', 3, 'CE301', 'Strength of Materials', ['Stress & Strain', 'Bending of Beams', 'Shear Stress', 'Columns', 'Composite Sections']],
  ['ce', 3, 'CE302', 'Fluid Mechanics', null],
  ['ce', 3, 'CE303', 'Surveying II', null],
  ['ce', 4, 'CE401', 'Design of RC Structures', ['Working Stress Method', 'Limit State Method', 'Beams', 'Slabs & Footings', 'Detailing & Minimum Steel']],
  ['ce', 4, 'CE402', 'Transportation Engineering', null],
  ['ce', 4, 'CE403', 'Soil Mechanics', null],
  // IT
  ['it', 1, 'MA101', 'Engineering Mathematics I', null],
  ['it', 1, 'PH101', 'Engineering Physics', null],
  ['it', 1, 'IT101', 'Programming in C', null],
  ['it', 1, 'IT102', 'Engineering Chemistry', null],
  ['it', 2, 'IT201', 'Python Programming', null],
  ['it', 2, 'IT202', 'Data Communications', null],
  ['it', 2, 'IT203', 'Object Oriented Programming with Java', null],
  ['it', 3, 'IT301', 'Database Management Systems', ['DBMS Fundamentals', 'ER Model', 'SQL', 'Normalisation', 'Concurrency & Security']],
  ['it', 3, 'IT302', 'Web Technologies', null],
  ['it', 3, 'IT303', 'Operating Systems', null],
  ['it', 4, 'IT401', 'Machine Learning', ['ML Fundamentals', 'Regression', 'Trees & Naive Bayes', 'Clustering', 'Evaluation & Overfitting']],
  ['it', 4, 'IT402', 'Cloud Computing', null],
  ['it', 4, 'IT403', 'Computer Networks', null],
  // Other
  ['oth', 1, 'OT101', 'Biomedical Engineering', null],
  ['oth', 1, 'OT102', 'Chemical Engineering Principles', null],
  ['oth', 2, 'OT201', 'Aerospace Engineering Fundamentals', null],
  ['oth', 2, 'OT202', 'Food Processing Engineering', null],
]

const subjects = SUBJ.map(([bid, sem, code, name, units]) => {
  const id = `${bid}-${code.toLowerCase()}`
  const unitLine = units ? units.map((u, i) => `Unit ${i + 1}: ${u}`).join(' · ') : null
  return {
    id,
    branch_id: bid,
    semester_id: `${bid}-sem${sem}`,
    code,
    name,
    description: units
      ? `${name} — covers ${units.slice(0, 3).join(', ')} and ${units[units.length - 1]}. Find previous papers, repeated questions and unit-wise preparation material below.`
      : `${name} is a core subject of this semester. Previous papers and important questions are being added — check back soon or add them from the admin panel.`,
    unit1: units ? units[0] : null,
    unit2: units ? units[1] : null,
    unit3: units ? units[2] : null,
    unit4: units ? units[3] : null,
    unit5: units ? units[4] : null,
    created_at: '2026-01-05T10:00:00.000Z',
  }
})

// ------------------------------------------------------- question banks
// [unit, text, importance, timesAppeared, years]
const BANKS = {
  'cse-cs301': [
    [1, 'Define data structure. Classify linear and non-linear data structures with examples.', 'very_important', 4, '2023, 2024, 2025, 2026'],
    [1, 'Explain arrays vs linked lists. When would you prefer one over the other?', 'frequently_asked', 4, '2023, 2024, 2025, 2026'],
    [1, 'Define complexity. Explain Big-O, Big-Theta and Big-Omega with examples.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [1, 'Write an algorithm to search an element in a linear array and analyse its complexity.', 'practice', 2, '2024, 2025'],
    [2, 'Explain stack operations. Write algorithms for push, pop and peek.', 'repeated', 4, '2023, 2024, 2025, 2026'],
    [2, 'Explain infix to postfix conversion with the algorithm and a worked example.', 'very_important', 4, '2023, 2024, 2025, 2026'],
    [2, 'Write an algorithm/program to evaluate a postfix expression.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [2, 'Explain applications of stacks: expression evaluation, function calls and recursion.', 'important_topic', 3, '2023, 2025, 2026'],
    [2, 'What is a queue? Explain circular queue with insertion and deletion.', 'repeated', 4, '2023, 2024, 2025, 2026'],
    [2, 'Explain deque (double-ended queue) with operations and applications.', 'important_topic', 2, '2024, 2026'],
    [3, 'Explain insertion and deletion in a singly linked list at the beginning, middle and end with diagrams.', 'very_important', 4, '2023, 2024, 2025, 2026'],
    [3, 'Write an algorithm to reverse a singly linked list.', 'repeated', 3, '2023, 2025, 2026'],
    [3, 'Explain doubly linked list with applications. Compare with singly linked list.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [3, 'Explain polynomial multiplication using linked lists with an example.', 'important_topic', 2, '2023, 2024'],
    [4, 'Define recursion. Explain base case, recursive case with a typical example.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [4, 'Write an algorithm for binary search and analyse its time complexity.', 'repeated', 3, '2023, 2025, 2026'],
    [4, 'Explain merge sort with a diagram. Analyse time complexity.', 'very_important', 4, '2023, 2024, 2025, 2026'],
    [4, 'Explain quicksort with worst, best and average case analysis.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [5, 'Explain insertion, deletion and search in a BST. Write the search algorithm.', 'very_important', 4, '2023, 2024, 2025, 2026'],
    [5, 'Explain AVL tree rotations (LL, RR, LR, RL) with examples.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [5, 'Explain graphs: representation, traversal (BFS/DFS) and applications.', 'important_topic', 2, '2025, 2026'],
    [5, 'Explain hashing: open addressing and separate chaining with an example.', 'repeated', 3, '2023, 2025, 2026'],
  ],
  'cse-cs302': [
    [1, 'What is a DBMS? List and explain its major components.', 'very_important', 4, '2023, 2024, 2025, 2026'],
    [1, 'Explain the three-level ANSI-SPARC architecture (internal, conceptual, external).', 'frequently_asked', 4, '2023, 2024, 2025, 2026'],
    [1, 'Compare procedural and non-procedural data models.', 'important_topic', 2, '2024, 2026'],
    [1, 'Explain the roles and responsibilities of a DBA.', 'practice', 1, '2024'],
    [2, 'Define the E-R model. Explain entities, attributes and relationships with cardinality.', 'very_important', 4, '2023, 2024, 2025, 2026'],
    [2, 'Explain the rules for converting an E-R diagram to relational tables.', 'frequently_asked', 4, '2023, 2024, 2025, 2026'],
    [2, 'Explain constraints: domain, key, entity and referential.', 'important_topic', 3, '2024, 2025, 2026'],
    [3, 'What is SQL? Classify SQL with examples (DDL, DML, DCL, TCL).', 'very_important', 4, '2023, 2024, 2025, 2026'],
    [3, 'Write SQL queries for SELECT with WHERE, GROUP BY, HAVING and JOIN.', 'frequently_asked', 4, '2023, 2024, 2025, 2026'],
    [3, 'Explain nested queries and correlated sub-queries with examples.', 'important_topic', 3, '2024, 2025, 2026'],
    [3, 'Explain views: types, creation and applications.', 'practice', 2, '2023, 2025'],
    [4, 'Define normalisation. Explain 1NF, 2NF, 3NF and BCNF with an example.', 'very_important', 4, '2023, 2024, 2025, 2026'],
    [4, 'Explain functional dependencies and dependency-preserving decomposition.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [4, 'Explain transaction properties (ACID) with examples.', 'frequently_asked', 3, '2023, 2025, 2026'],
    [5, 'Explain locking protocols and deadlocks: prevention, detection and resolution.', 'frequently_asked', 4, '2023, 2024, 2025, 2026'],
    [5, 'Explain concurrency control and recovery techniques.', 'important_topic', 2, '2024, 2025'],
    [5, 'What is indexing? Explain B+ tree index.', 'practice', 2, '2025, 2026'],
    [5, 'Explain data security: authentication, authorisation and integrity.', 'practice', 1, '2026'],
  ],
  'cse-cs401': [
    [1, 'What is an operating system? Explain the major functions of an OS.', 'very_important', 4, '2024, 2025, 2026'],
    [1, 'Compare batch, time-sharing and real-time systems.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [1, 'Explain system calls and the process concept.', 'important_topic', 2, '2025, 2026'],
    [2, 'Explain process states and the structure of a PCB with a diagram.', 'very_important', 4, '2024, 2025, 2026'],
    [2, 'Explain CPU scheduling algorithms: FCFS, SJF, Priority and Round Robin.', 'very_important', 4, '2024, 2025, 2026'],
    [2, 'Define throughput, turnaround time and waiting time. Compute them for a given set of processes.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [2, 'Explain threads and multi-threading.', 'important_topic', 3, '2024, 2025, 2026'],
    [3, 'What is a deadlock? Explain the four Coffman conditions.', 'very_important', 4, '2024, 2025, 2026'],
    [3, 'Explain deadlock prevention, avoidance and detection.', 'frequently_asked', 4, '2024, 2025, 2026'],
    [3, 'Solve the Banker\u2019s algorithm for a given allocation matrix.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [4, 'Explain memory management: partitioning, paging and segmentation.', 'very_important', 4, '2024, 2025, 2026'],
    [4, 'Explain page replacement algorithms: FIFO, OPT and LRU with an example.', 'frequently_asked', 4, '2024, 2025, 2026'],
    [4, 'What is thrashing? Explain demand paging.', 'important_topic', 2, '2025, 2026'],
    [5, 'Explain file systems: directory structures, allocation methods and free-space management.', 'frequently_asked', 3, '2024, 2025, 2026'],
  ],
  'cse-cs402': [
    [1, 'Explain the OSI reference model with the function of each layer.', 'very_important', 4, '2024, 2025, 2026'],
    [1, 'Compare the OSI and TCP/IP models.', 'frequently_asked', 4, '2024, 2025, 2026'],
    [1, 'Explain the physical layer: media, signals and encoding.', 'important_topic', 2, '2025, 2026'],
    [2, 'Explain data link layer functions: framing, error control and flow control.', 'frequently_asked', 4, '2024, 2025, 2026'],
    [2, 'Explain sliding window protocol with an example.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [2, 'Explain error detection: parity, checksum and CRC with an example.', 'very_important', 4, '2024, 2025, 2026'],
    [2, 'Explain Hamming code with an example.', 'important_topic', 2, '2024, 2026'],
    [3, 'Explain IP addressing: classful addressing and subnetting with an example.', 'very_important', 4, '2024, 2025, 2026'],
    [3, 'Explain the ARP and ICMP protocols.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [3, 'Explain the role of a router and the IPv4 packet header.', 'important_topic', 3, '2024, 2025, 2026'],
    [4, 'Explain TCP: three-way handshake, flow control and congestion control.', 'very_important', 4, '2024, 2025, 2026'],
    [4, 'Compare UDP and TCP.', 'frequently_asked', 4, '2024, 2025, 2026'],
    [4, 'Explain socket programming concepts.', 'practice', 1, '2026'],
    [5, 'Explain DNS, HTTP and FTP with their working.', 'frequently_asked', 3, '2024, 2025, 2026'],
  ],
  'cse-cs201': [
    [1, 'What is Python? Explain its features and applications.', 'very_important', 3, '2024, 2025, 2026'],
    [1, 'Explain data types, variables and operators in Python.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [1, 'Write a program using conditional and loop statements.', 'practice', 2, '2025, 2026'],
    [2, 'Explain Python functions: arguments, return values, scope and lambda.', 'frequently_asked', 4, '2024, 2025, 2026'],
    [2, 'Explain recursion with a factorial example.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [2, 'Explain modules and packages with an example.', 'important_topic', 2, '2025, 2026'],
    [3, 'Explain strings and string methods with examples.', 'frequently_asked', 4, '2024, 2025, 2026'],
    [3, 'Explain lists and list operations with examples.', 'very_important', 4, '2024, 2025, 2026'],
    [3, 'Explain tuples and sets and the difference between them.', 'important_topic', 2, '2024, 2026'],
    [4, 'Explain dictionaries and their operations with examples.', 'frequently_asked', 4, '2024, 2025, 2026'],
    [4, 'Explain file handling: read, write and append modes with an example.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [4, 'Explain exceptions: try-except-finally-else with examples.', 'frequently_asked', 4, '2024, 2025, 2026'],
    [5, 'Explain OOP in Python: class, object, inheritance, polymorphism and encapsulation.', 'very_important', 4, '2024, 2025, 2026'],
    [5, 'Write a program demonstrating inheritance and method overriding.', 'practice', 2, '2025, 2026'],
  ],
  'cse-cs101': [
    [1, 'Explain the structure of a C program: preprocessor, main() and declaration section.', 'very_important', 3, '2024, 2025, 2026'],
    [1, 'Explain data types, operators and expressions in C.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [2, 'Explain decision making: if, else and switch with examples.', 'frequently_asked', 4, '2024, 2025, 2026'],
    [2, 'Explain for, while and do-while loops with examples.', 'frequently_asked', 4, '2024, 2025, 2026'],
    [2, 'Write a program using arrays: search and sort.', 'practice', 2, '2025, 2026'],
    [3, 'Explain functions: call by value, call by reference and recursion.', 'very_important', 4, '2024, 2025, 2026'],
    [3, 'Write recursive programs: factorial and Fibonacci.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [4, 'Explain pointers: declaration, pointer arithmetic and pointer to array.', 'very_important', 4, '2024, 2025, 2026'],
    [4, 'Explain strings using character arrays and string functions.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [5, 'Explain structures and unions with example programs.', 'frequently_asked', 4, '2024, 2025, 2026'],
    [5, 'Explain file handling in C with a program.', 'important_topic', 3, '2024, 2025, 2026'],
    [5, 'Explain command line arguments in C.', 'practice', 1, '2025'],
  ],
  'cse-cs203': [
    [1, 'Explain number system conversions: binary, octal, decimal and hexadecimal.', 'very_important', 4, '2024, 2025, 2026'],
    [1, 'Explain signed number representations: 1\u2019s and 2\u2019s complement with examples.', 'frequently_asked', 4, '2024, 2025, 2026'],
    [2, 'Explain K-map simplification with 4-variable and 5-variable examples.', 'very_important', 4, '2024, 2025, 2026'],
    [2, 'Explain NAND/NOR universal gates. Design a circuit from a Boolean expression.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [3, 'Explain combinational circuits: adder, subtractor, comparator with logic.', 'very_important', 4, '2024, 2025, 2026'],
    [3, 'Design an 8:1 MUX and a 4:1 DEMUX with explanations.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [4, 'Explain SR, D, T and JK flip-flops: truth tables, excitation tables and waveforms.', 'very_important', 4, '2024, 2025, 2026'],
    [4, 'Explain the difference between latches and flip-flops. What is the race-around condition?', 'frequently_asked', 3, '2024, 2025, 2026'],
    [5, 'Explain synchronous sequential circuits. Design a mod-N counter.', 'very_important', 4, '2024, 2025, 2026'],
    [5, 'Explain registers and shift register types with applications.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [5, 'Explain memory units: ROM, RAM, SRAM and DRAM.', 'important_topic', 2, '2025, 2026'],
    [5, 'Explain the 8085 microprocessor architecture with a block diagram.', 'practice', 1, '2026'],
  ],
  'cse-ma101': [
    [1, 'Explain partial differentiation and prove Euler\u2019s theorem with an example.', 'very_important', 4, '2024, 2025, 2026'],
    [1, 'Explain total derivative and the Jacobian.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [2, 'Explain Taylor\u2019s and Maclaurin\u2019s series with example expansions.', 'frequently_asked', 4, '2024, 2025, 2026'],
    [2, 'Find the maxima and minima of a function of two variables \u2014 solve a given problem.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [3, 'Explain first and second order ODEs: separable, homogeneous and exact equations.', 'very_important', 4, '2024, 2025, 2026'],
    [3, 'Solve a Bernoulli equation with an example.', 'important_topic', 2, '2025, 2026'],
    [4, 'Explain Fourier series. Find the Fourier series of a given function.', 'very_important', 4, '2024, 2025, 2026'],
    [4, 'Explain the Dirichlet conditions for Fourier series.', 'important_topic', 2, '2024, 2026'],
    [5, 'Explain gamma and beta functions and their properties with an example.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [5, 'Explain double integrals: change of order of integration.', 'frequently_asked', 2, '2025, 2026'],
  ],
  'cse-ma301': [
    [1, 'Explain eigenvalues and eigenvectors. Diagonalise a given matrix.', 'very_important', 3, '2024, 2025, 2026'],
    [1, 'Explain the rank of a matrix. Solve a system of linear equations using matrices.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [2, 'Explain vector algebra: divergence, curl and gradient with identities.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [2, 'Explain Green\u2019s, Stokes\u2019 and Divergence theorems with one application of each.', 'very_important', 3, '2024, 2025, 2026'],
    [3, 'Solve a system of linear equations using Cramer\u2019s rule.', 'practice', 1, '2025'],
    [3, 'Explain linear transformations and their properties.', 'important_topic', 2, '2025, 2026'],
    [4, 'Explain analytic functions and the Cauchy-Riemann equations.', 'frequently_asked', 2, '2025, 2026'],
    [4, 'Evaluate a contour integral using Cauchy\u2019s integral theorem/formula.', 'frequently_asked', 2, '2025, 2026'],
  ],
  'cse-cs303': [
    [1, 'Explain finite automata: DFA and NFA with examples.', 'very_important', 3, '2024, 2025, 2026'],
    [1, 'Convert a given NFA to a DFA with the complete construction.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [2, 'Explain regular languages and regular expressions. Prove closure properties.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [2, 'Explain DFA minimisation with an example.', 'practice', 1, '2025'],
    [3, 'Explain context-free grammars: leftmost/rightmost derivations and parse trees.', 'very_important', 3, '2024, 2025, 2026'],
    [3, 'Convert a given CFG to Chomsky normal form.', 'important_topic', 2, '2025, 2026'],
    [4, 'Explain the pumping lemma for regular languages. Show a language is non-regular.', 'frequently_asked', 3, '2024, 2025, 2026'],
    [4, 'Explain the Chomsky hierarchy of languages and grammars.', 'important_topic', 1, '2026'],
  ],
  'cse-cs502': [
    [1, 'Explain asymptotic analysis: Big-O, Omega and Theta with examples.', 'very_important', 3, '2025, 2026'],
    [1, 'Explain the Master theorem with examples.', 'frequently_asked', 3, '2025, 2026'],
    [2, 'Explain divide and conquer with examples (merge sort, binary search).', 'frequently_asked', 4, '2024, 2025, 2026'],
    [2, 'Solve recurrence relations using substitution and the recursion tree.', 'frequently_asked', 3, '2025, 2026'],
    [3, 'Explain the greedy method. Solve the fractional knapsack with an example.', 'very_important', 3, '2025, 2026'],
    [3, 'Explain Prim\u2019s and Kruskal\u2019s algorithms for minimum spanning tree.', 'frequently_asked', 4, '2024, 2025, 2026'],
    [3, 'Explain Dijkstra\u2019s shortest path algorithm with an example.', 'frequently_asked', 3, '2025, 2026'],
    [4, 'Explain dynamic programming. Solve the 0/1 knapsack with an example.', 'very_important', 3, '2025, 2026'],
    [4, 'Solve LCS and the travelling salesman problem using DP.', 'frequently_asked', 3, '2025, 2026'],
    [5, 'Explain backtracking: N-Queens and graph colouring with examples.', 'frequently_asked', 3, '2025, 2026'],
  ],
  'cse-cs503': [
    [1, 'Explain the evolution of the web and client-server architecture.', 'frequently_asked', 2, '2025, 2026'],
    [1, 'Explain HTML5: structure, semantics and new elements.', 'frequently_asked', 3, '2025, 2026'],
    [2, 'Explain CSS: selectors, box model, flexbox and grid with examples.', 'very_important', 3, '2025, 2026'],
    [2, 'Explain responsive web design and media queries.', 'frequently_asked', 3, '2025, 2026'],
    [3, 'Explain JavaScript fundamentals: variables, functions and DOM manipulation.', 'very_important', 4, '2024, 2025, 2026'],
    [3, 'Explain events and event handling with an example.', 'frequently_asked', 2, '2025, 2026'],
    [4, 'Explain AJAX and JSON with an example.', 'frequently_asked', 3, '2025, 2026'],
    [4, 'Explain the MVC architecture with an example.', 'important_topic', 2, '2025, 2026'],
  ],
  'cse-cs601': [
    [1, 'What is machine learning? Classify supervised, unsupervised and reinforcement learning with examples.', 'very_important', 3, '2025, 2026'],
    [1, 'Explain the ML pipeline: data, features, model and evaluation.', 'frequently_asked', 2, '2025, 2026'],
    [2, 'Explain linear and logistic regression with derivation and an example.', 'very_important', 4, '2024, 2025, 2026'],
    [2, 'Explain overfitting/underfitting and the bias-variance trade-off.', 'frequently_asked', 3, '2025, 2026'],
    [3, 'Explain decision trees and ID3/CART with an example.', 'frequently_asked', 4, '2024, 2025, 2026'],
    [3, 'Explain Naive Bayes classification with an example.', 'frequently_asked', 3, '2025, 2026'],
    [4, 'Explain k-NN and K-means clustering with examples.', 'frequently_asked', 3, '2025, 2026'],
    [4, 'Explain SVM and the concept of the kernel.', 'important_topic', 2, '2025, 2026'],
    [5, 'Explain neural networks: perceptron and backpropagation with an example.', 'very_important', 3, '2025, 2026'],
    [5, 'Explain model evaluation: metrics, cross-validation and the confusion matrix.', 'frequently_asked', 4, '2024, 2025, 2026'],
  ],
  'cse-cs501': [
    [1, 'Explain the von Neumann architecture and its limitations.', 'very_important', 3, '2025, 2026'],
    [1, 'Explain the CPU: ALU, registers and control unit.', 'frequently_asked', 3, '2025, 2026'],
    [2, 'Explain the instruction cycle and timing. Explain addressing modes.', 'frequently_asked', 3, '2025, 2026'],
    [2, 'Explain I/O methods: programmed, interrupt-driven and DMA.', 'frequently_asked', 3, '2025, 2026'],
    [3, 'Explain memory hierarchy and cache mapping techniques.', 'very_important', 3, '2025, 2026'],
    [3, 'Explain virtual memory and page tables.', 'frequently_asked', 2, '2025, 2026'],
    [4, 'Explain pipelining: types of hazards and their solutions.', 'frequently_asked', 3, '2025, 2026'],
    [4, 'Explain parallelism: SIMD, MIMD and RISC vs CISC.', 'important_topic', 2, '2025, 2026'],
  ],
  'cse-cs403': [
    [1, 'What is software engineering? Explain SDLC models: waterfall, spiral and agile.', 'very_important', 3, '2025, 2026'],
    [1, 'Explain agile methodologies: Scrum and XP.', 'frequently_asked', 3, '2025, 2026'],
    [2, 'Explain requirements engineering: functional/non-functional. Structure of an SRS.', 'frequently_asked', 4, '2024, 2025, 2026'],
    [2, 'Explain UML diagrams: use case, class and sequence with an example.', 'frequently_asked', 3, '2025, 2026'],
    [3, 'Explain software testing: unit, integration, system and acceptance testing.', 'very_important', 3, '2025, 2026'],
    [3, 'Explain black-box and white-box testing techniques.', 'frequently_asked', 3, '2025, 2026'],
    [4, 'Explain software maintenance types and software metrics.', 'practice', 1, '2025'],
    [4, 'Explain project planning: COCOMO and PERT.', 'important_topic', 2, '2025, 2026'],
  ],
  // ---------- non-CSE banks ----------
  'ece-ec202': [
    [1, 'Explain KCL/KVL and solve a given circuit by nodal and mesh analysis.', 'frequently_asked', 4, '2024, 2025'],
    [2, 'Explain Thevenin\u2019s, Norton\u2019s and superposition theorems with examples.', 'frequently_asked', 3, '2024, 2025'],
    [3, 'Explain transient analysis of first-order RL and RC circuits.', 'frequently_asked', 3, '2024, 2025'],
    [2, 'Explain the maximum power transfer theorem with an example.', 'important_topic', 2, '2025'],
    [4, 'Explain two-port network parameters (Z, Y, ABCD) with interconnections.', 'frequently_asked', 2, '2025'],
    [5, 'Explain series and parallel resonance in AC circuits.', 'frequently_asked', 2, '2025'],
  ],
  'ece-ec301': [
    [1, 'Classify signals: energy/power, deterministic/random, continuous/discrete with examples.', 'very_important', 3, '2024, 2025'],
    [2, 'Explain LTI systems. Derive and explain the convolution integral.', 'frequently_asked', 4, '2023, 2024, 2025'],
    [3, 'Explain Fourier transform properties with examples.', 'very_important', 4, '2023, 2024, 2025'],
    [3, 'Find the Fourier series of a square wave.', 'frequently_asked', 3, '2024, 2025'],
    [4, 'Explain Laplace transform properties. Find the inverse of a given function.', 'frequently_asked', 3, '2024, 2025'],
    [5, 'Explain the Z-transform and its properties for discrete systems.', 'frequently_asked', 3, '2024, 2025'],
  ],
  'ece-ec401': [
    [1, 'Compare continuous and discrete signals. Explain the sampling theorem with an example.', 'very_important', 4, '2023, 2024, 2025'],
    [2, 'Explain the DFT and derive the radix-2 DIT FFT.', 'very_important', 4, '2023, 2024, 2025'],
    [3, 'Explain bilinear transformation for IIR filter design.', 'frequently_asked', 3, '2024, 2025'],
    [4, 'Design a FIR filter using the window method \u2014 explain with an example.', 'frequently_asked', 3, '2024, 2025'],
    [1, 'Explain linear and circular convolution with examples.', 'frequently_asked', 4, '2023, 2024, 2025'],
    [5, 'Explain quantisation and the effects of finite word length.', 'important_topic', 2, '2025'],
  ],
  'ece-ec302': [
    [1, 'Explain the E-M model of the diode. Draw diode and Zener V-I characteristics.', 'frequently_asked', 3, '2024, 2025'],
    [2, 'Explain BJT small-signal analysis using h-parameters.', 'very_important', 3, '2024, 2025'],
    [3, 'Explain biasing techniques: fixed, emitter-stabilised and voltage divider.', 'frequently_asked', 4, '2023, 2024, 2025'],
    [4, 'Explain CE/CB/CC configurations with characteristics.', 'frequently_asked', 3, '2024, 2025'],
    [5, 'Explain a class-A amplifier. Calculate its efficiency.', 'important_topic', 2, '2025'],
    [5, 'Explain feedback topologies and their effects.', 'important_topic', 1, '2025'],
  ],
  'eee-ee201': [
    [1, 'State and apply KCL and KVL with example circuits.', 'very_important', 4, '2024, 2025'],
    [1, 'Explain mesh and nodal analysis with an example.', 'frequently_asked', 4, '2024, 2025'],
    [3, 'Explain series and parallel RLC circuits. Derive impedance.', 'frequently_asked', 3, '2024, 2025'],
    [4, 'Explain transient analysis of RL and RC circuits.', 'frequently_asked', 3, '2024, 2025'],
    [2, 'Explain Thevenin\u2019s and Norton\u2019s theorems with an example.', 'frequently_asked', 4, '2024, 2025'],
    [5, 'Explain resonance and quality factor in AC circuits.', 'important_topic', 2, '2025'],
  ],
  'eee-ee302': [
    [1, 'Find the transfer function of a given mechanical/electrical system.', 'very_important', 3, '2024, 2025'],
    [2, 'Explain time response of a second-order system: rise time, overshoot, settling time.', 'very_important', 4, '2023, 2024, 2025'],
    [3, 'Explain the Routh-Hurwitz stability criterion with an example.', 'frequently_asked', 4, '2023, 2024, 2025'],
    [3, 'Explain root locus construction rules. Plot for a given system.', 'frequently_asked', 3, '2024, 2025'],
    [4, 'Explain Bode plots and gain/phase margin.', 'frequently_asked', 3, '2024, 2025'],
    [5, 'Explain the use of a PID controller.', 'important_topic', 2, '2025'],
  ],
  'eee-ee401': [
    [1, 'Explain the construction and operation of a thyristor (SCR).', 'frequently_asked', 3, '2024, 2025'],
    [2, 'Explain single-phase half/full-wave rectifiers with waveforms and calculations.', 'very_important', 4, '2023, 2024, 2025'],
    [3, 'Explain a single-phase full-bridge inverter.', 'frequently_asked', 3, '2024, 2025'],
    [4, 'Explain step-up/step-down choppers with an example.', 'frequently_asked', 3, '2024, 2025'],
    [5, 'Explain a single-phase AC voltage controller.', 'important_topic', 2, '2025'],
    [1, 'Explain snubber circuits and protection of power devices.', 'important_topic', 1, '2025'],
  ],
  'me-me201': [
    [1, 'State the first law of thermodynamics. Apply it to closed and open systems.', 'very_important', 4, '2024, 2025'],
    [1, 'Explain the zeroth law and the concept of temperature.', 'practice', 1, '2024'],
    [3, 'Calculate the efficiency of a Carnot engine with an example.', 'frequently_asked', 3, '2024, 2025'],
    [3, 'Explain entropy and the second law of thermodynamics.', 'frequently_asked', 3, '2024, 2025'],
    [4, 'Explain steam tables and find properties of steam.', 'important_topic', 2, '2025'],
    [5, 'Compare Otto, Diesel and dual cycles with P-V diagrams.', 'frequently_asked', 4, '2023, 2024, 2025'],
  ],
  'me-me202': [
    [1, 'Resolve a force system. Find the resultant of concurrent forces.', 'frequently_asked', 3, '2024, 2025'],
    [1, 'Explain Lami\u2019s theorem and Varignon\u2019s theorem with examples.', 'frequently_asked', 3, '2024, 2025'],
    [3, 'Find the centroid of a composite section.', 'frequently_asked', 4, '2023, 2024, 2025'],
    [4, 'Explain moment of inertia and the parallel/perpendicular axis theorems.', 'very_important', 3, '2024, 2025'],
    [5, 'Explain friction: angle of repose and the wedge, with examples.', 'frequently_asked', 3, '2024, 2025'],
    [5, 'Solve a truss using the method of joints/sections.', 'frequently_asked', 4, '2023, 2024, 2025'],
  ],
  'me-me301': [
    [1, 'Explain the stress-strain diagram and elastic constants (E, G, K, nu).', 'very_important', 4, '2023, 2024, 2025'],
    [2, 'Draw shear force and bending moment diagrams for a given beam.', 'very_important', 4, '2023, 2024, 2025'],
    [3, 'Derive the bending equation. Find the section modulus.', 'frequently_asked', 3, '2024, 2025'],
    [4, 'Explain torsion of a circular shaft. Derive the torsion equation.', 'frequently_asked', 3, '2024, 2025'],
    [5, 'Explain Euler\u2019s column theory and the slenderness ratio.', 'frequently_asked', 3, '2024, 2025'],
    [5, 'Explain failure theories: maximum principal stress and maximum shear stress.', 'important_topic', 2, '2025'],
  ],
  'me-me303': [
    [1, 'Explain fluid properties: viscosity, surface tension and compressibility.', 'frequently_asked', 3, '2024, 2025'],
    [2, 'Explain Pascal\u2019s law and the hydraulic press.', 'practice', 1, '2024'],
    [4, 'Explain Bernoulli\u2019s equation with assumptions and applications.', 'very_important', 4, '2023, 2024, 2025'],
    [4, 'Explain flow measurement: venturimeter and orifice meter with an example.', 'frequently_asked', 3, '2024, 2025'],
    [1, 'Explain laminar and turbulent flow. Define Reynolds number.', 'frequently_asked', 3, '2024, 2025'],
    [5, 'Explain the Darcy-Weisbach equation and head loss in pipe flow.', 'frequently_asked', 3, '2024, 2025'],
  ],
  'ce-ce203': [
    [1, 'Explain chain surveying: principles, errors and corrections.', 'frequently_asked', 3, '2024, 2025'],
    [2, 'Explain bearings and local attraction in compass surveying.', 'frequently_asked', 4, '2023, 2024, 2025'],
    [3, 'Explain direct and indirect levelling. Compute reduced levels (HI method).', 'very_important', 4, '2023, 2024, 2025'],
    [4, 'Explain the theodolite: definitions and horizontal angle measurement.', 'frequently_asked', 3, '2024, 2025'],
    [4, 'Explain traversing and the computation of departure and latitude.', 'frequently_asked', 3, '2024, 2025'],
    [5, 'Explain contouring: characteristics and applications.', 'important_topic', 2, '2025'],
  ],
  'ce-ce301': [
    [1, 'Explain stress and strain. Derive the relation E = 2G(1+nu).', 'frequently_asked', 3, '2024, 2025'],
    [2, 'Draw SFD and BMD for a cantilever with UDL.', 'very_important', 4, '2023, 2024, 2025'],
    [3, 'Explain the shear stress distribution in a rectangular section.', 'frequently_asked', 3, '2024, 2025'],
    [4, 'Explain columns under eccentric load and slenderness ratio.', 'important_topic', 2, '2025'],
    [3, 'Solve a built-up section problem for moment of inertia.', 'practice', 1, '2024'],
  ],
  'ce-ce401': [
    [1, 'Explain the working stress method of RCC design with an example.', 'frequently_asked', 3, '2024, 2025'],
    [2, 'Design a singly reinforced beam by the limit state method.', 'very_important', 3, '2024, 2025'],
    [3, 'Explain the design of one-way slabs.', 'frequently_asked', 3, '2024, 2025'],
    [4, 'Explain the design of isolated footings.', 'frequently_asked', 2, '2025'],
    [4, 'Explain two-way slab concepts and load distribution.', 'important_topic', 2, '2025'],
    [5, 'Explain minimum steel requirements in RCC.', 'practice', 1, '2025'],
  ],
  'it-it301': [
    [1, 'Explain the E-R model and mapping to the relational model.', 'frequently_asked', 3, '2024, 2025'],
    [3, 'Write SQL queries using JOIN and GROUP BY with examples.', 'very_important', 4, '2023, 2024, 2025'],
    [4, 'Explain normalisation up to 3NF with an example.', 'frequently_asked', 4, '2023, 2024, 2025'],
    [4, 'Explain ACID transaction properties.', 'frequently_asked', 3, '2024, 2025'],
    [5, 'Explain indexing and hashing in a DBMS.', 'important_topic', 2, '2025'],
    [5, 'Explain DBMS security: views and authorisation.', 'practice', 1, '2025'],
  ],
  'it-it401': [
    [1, 'Differentiate supervised and unsupervised learning with examples.', 'frequently_asked', 3, '2025'],
    [2, 'Explain linear regression and the normal equation.', 'frequently_asked', 4, '2024, 2025'],
    [3, 'Explain k-NN with a worked example.', 'frequently_asked', 3, '2025'],
    [3, 'Explain decision tree construction (information gain).', 'frequently_asked', 3, '2025'],
    [5, 'Explain train/test split and cross-validation.', 'important_topic', 2, '2025'],
    [2, 'Explain overfitting and regularisation.', 'important_topic', 2, '2025'],
  ],
  'aiml-aiml201': [
    [1, 'Find the rank of a matrix using row operations.', 'frequently_asked', 3, '2024, 2025'],
    [2, 'Solve a system of linear equations by Gauss elimination.', 'frequently_asked', 4, '2023, 2024, 2025'],
    [3, 'Find eigenvalues and eigenvectors. Check diagonalisability.', 'very_important', 3, '2024, 2025'],
    [1, 'Explain determinants and Cramer\u2019s rule with an example.', 'important_topic', 2, '2025'],
    [4, 'Explain linear independence and basis of a vector space.', 'important_topic', 2, '2025'],
    [5, 'Solve a least squares problem with an example.', 'practice', 1, '2025'],
  ],
  'aiml-aiml401': [
    [1, 'Differentiate supervised and unsupervised learning with examples.', 'frequently_asked', 3, '2025'],
    [2, 'Explain linear and logistic regression with derivation.', 'frequently_asked', 4, '2024, 2025'],
    [3, 'Explain k-NN with a worked example.', 'frequently_asked', 3, '2025'],
    [3, 'Explain decision trees: information gain and construction.', 'frequently_asked', 3, '2025'],
    [5, 'Explain model evaluation: metrics and cross-validation.', 'important_topic', 2, '2025'],
    [2, 'Explain overfitting and regularisation.', 'important_topic', 2, '2025'],
  ],
  'ds-ds301': [
    [1, 'Define mean, median and mode. Find them for a data set.', 'frequently_asked', 4, '2023, 2024, 2025'],
    [1, 'Explain variance, standard deviation and coefficient of variation.', 'very_important', 3, '2024, 2025'],
    [2, 'State and apply Bayes\u2019 theorem with an example.', 'frequently_asked', 4, '2023, 2024, 2025'],
    [2, 'Explain binomial and Poisson distributions with examples.', 'frequently_asked', 3, '2024, 2025'],
    [3, 'Explain sampling techniques and sampling error.', 'important_topic', 2, '2025'],
    [5, 'Test a hypothesis about a population mean (z-test).', 'frequently_asked', 3, '2024, 2025'],
  ],
  'ds-ds102': [
    [1, 'Define mean, median and mode. Find them for a data set.', 'frequently_asked', 3, '2025'],
    [1, 'Explain variance and standard deviation with examples.', 'frequently_asked', 3, '2025'],
    [2, 'State and apply Bayes\u2019 theorem with an example.', 'frequently_asked', 3, '2025'],
    [2, 'Explain discrete distributions: binomial and Poisson.', 'important_topic', 2, '2025'],
    [3, 'Explain sampling techniques.', 'practice', 1, '2025'],
    [5, 'Explain basic hypothesis testing.', 'frequently_asked', 2, '2025'],
  ],
  'oth-ot101': [
    [1, 'Explain biomedical signals: ECG, EEG and EMG.', 'frequently_asked', 2, '2025'],
    [2, 'Explain sensors and transducers used in measurement.', 'frequently_asked', 2, '2025'],
    [1, 'Explain the ECG waveform and heart rate measurement.', 'frequently_asked', 2, '2025'],
    [3, 'Explain the basic working of a pulse oximeter.', 'important_topic', 1, '2025'],
    [4, 'Explain calibration of medical instruments.', 'important_topic', 1, '2025'],
    [5, 'Explain basics of medical imaging: X-ray and CT.', 'practice', 1, '2025'],
  ],
  'oth-ot102': [
    [1, 'Explain mass and energy balances with an example.', 'frequently_asked', 2, '2025'],
    [2, 'Explain unit operations: mixing and distillation basics.', 'frequently_asked', 2, '2025'],
    [3, 'Explain material balance for a steady-flow process.', 'frequently_asked', 2, '2025'],
    [4, 'Explain the concept of degrees of freedom.', 'important_topic', 1, '2025'],
    [5, 'Explain separation processes: absorption and extraction.', 'important_topic', 1, '2025'],
    [5, 'Explain basics of heat exchangers.', 'practice', 1, '2025'],
  ],
}

const questions = Object.entries(BANKS).flatMap(([subjectId, rows]) =>
  rows.map(([unit, text, importance, times, years], i) => ({
    id: `q-${subjectId}-${i}`,
    subject_id: subjectId,
    unit,
    text,
    importance,
    times_appeared: times,
    years,
    notes: null,
  }))
)

// ------------------------------------------------------ study materials
// Used as a tagged template: P`...` → trimmed string (handles interpolation too)
const P = (parts, ...values) =>
  (Array.isArray(parts) ? parts.reduce((acc, p, i) => acc + p + (i < values.length ? values[i] : ''), '') : String(parts)).trim()
const materials = [
  {
    id: 'm-g1', subject_id: null, mtype: 'plan',
    title: '30-Day Backlog Recovery Plan',
    description: 'A day-by-day framework to clear one backlog subject in a month.',
    content: P`
      Days 1-5 (Foundation): Read only the unit-wise important questions list for your subject. Underline keywords, do not read textbooks cover to cover. Make one A4 "one-pager" per unit (definitions, formulas, small diagrams).
      Days 6-15 (Solve): Solve one previous year paper every day in 3 hours, strictly timed. After each paper, mark your score and list every question you could not answer \u2014 those are your gaps. Solve two more papers with gaps on Days 8, 12 and 15.
      Days 16-24 (Drill): Re-solve only the questions you missed. Rewrite each one-pager from memory (blank page test). Focus extra time on the "Very Important" and "Repeated" labelled questions \u2014 they are the highest-yield preparation targets.
      Days 25-28 (Mock): Two full timed mocks with no notes. Practise writing complete answers: start with a one-line definition, then the main body, then a small example. Aim to finish 15 minutes early.
      Days 29-30 (Calm + revise): Revise only your one-pagers and the question list. Sleep 7+ hours. No new topics. You are ready.
      Note: This is a preparation plan, not a guarantee. Repeat the cycle for the next backlog subject.`,
    url: null, uploaded_at: '2026-02-01T09:00:00.000Z',
  },
  {
    id: 'm-g2', subject_id: null, mtype: 'guide',
    title: 'How to Solve a Previous Paper in Exam Time',
    description: 'A method to use previous papers without wasting time.',
    content: P`
      Step 1: Read the full paper in 5 minutes first. Identify which questions you can answer completely, partially, or not at all.
      Step 2: Answer the "sure" questions first \u2014 usually 5-6 in a 3-hour paper. Momentum builds confidence and secures base marks.
      Step 3: Attempt partial questions in the second round. Even a partially correct answer (definition + formula + one line of explanation) usually earns 30-50% of marks in engineering exams.
      Step 4: Use the remaining 15-20 minutes for review \u2014 check units, figures, question numbers and spelling.
      Do NOT spend more than 15 minutes on a single question you are stuck on. Move on and return later. The biggest mistake backlog students make is getting stuck on one hard question and losing time for five easy ones.`,
    url: null, uploaded_at: '2026-02-02T09:00:00.000Z',
  },
  {
    id: 'm-g3', subject_id: null, mtype: 'sheet',
    title: 'One-Pager Hall Notes Template',
    description: 'A4 single-side template to write one page of revision notes per unit.',
    content: P`
      Top of page: Subject code + Unit number + 3 keywords that describe the unit.
      Left column (60%): Definitions and formulas only \u2014 no sentences, just the statement and the formula. Include 2-3 standard small diagrams (e.g. process state diagram, OSI stack, SFD/BMD shapes).
      Right column (40%): "Must-write points" \u2014 the 5 bullet points examiners usually expect for the long questions of this unit (from the repeated-questions list).
      Bottom strip: 3 one-mark quick facts that appear again and again (constants, standard values, acronyms).
      Rules: one page per unit, single side, pen only, no full sentences. If it does not fit on one page, cut \u2014 the point is recall, not completeness.`,
    url: null, uploaded_at: '2026-02-03T09:00:00.000Z',
  },
  {
    id: 'm-g4', subject_id: null, mtype: 'guide',
    title: 'Exam Hall Time Management (3-Hour Paper)',
    description: 'A simple timing table for a 90-mark, 3-hour engineering paper.',
    content: P`
      0-10 min: Read the whole paper, mark questions as Easy / Medium / Hard.
      10-90 min: Round 1 \u2014 all Easy questions (aim to complete 5-6 long questions).
      90-160 min: Round 2 \u2014 Medium questions (3-4 long questions).
      160-195 min: Round 3 \u2014 attempt what remains from Hard questions (partial credit is fine).
      195-205 min: Review: missing question numbers, units, diagrams, spelling.
      205-180 min (buffer): If you finish early, re-check calculations.
      Keep 15 minutes as a strict buffer \u2014 most students run out of time in the last 10 minutes because they gave the buffer away question by question.`,
    url: null, uploaded_at: '2026-02-04T09:00:00.000Z',
  },
  {
    id: 'm-g5', subject_id: null, mtype: 'guide',
    title: 'How to Pick High-Yield Units From the Syllabus',
    description: 'Spend limited preparation time where it matters most.',
    content: P`
      1. Download 3-4 previous papers for the subject from this site.
      2. For each question in the papers, note which unit it belongs to.
      3. Count: units that appear in 3+ papers are high-yield. Units that never appear may still carry 1-2 marks in 1-mark sections \u2014 keep them "light" (definitions only), not zero.
      4. Match the count with the marks weightage in the syllabus. A unit with 40% weightage AND frequent appearance is your top priority.
      5. Build your study plan: 60% time on top two units, 30% on the next two, 10% on the rest.
      The "appeared in N previous papers" labels on this site are computed from the papers currently uploaded \u2014 they are preparation recommendations, not predictions of what will be asked next time.`,
    url: null, uploaded_at: '2026-02-05T09:00:00.000Z',
  },
  {
    id: 'm-g6', subject_id: null, mtype: 'guide',
    title: 'Common Mistakes Backlog Students Make',
    description: 'Avoid these five traps that keep backlogs alive.',
    content: P`
      1. Starting from the first page of the textbook. Backlog preparation is not a semester \u2014 start from questions, not chapters.
      2. Collecting 20 resources and solving none. One subject: one question list + 3-4 papers + one set of hall notes is enough.
      3. Only reading, never writing. If you cannot write the answer in 8-10 minutes without notes, you do not know it.
      4. Skipping 1-mark sections. In a 90-mark paper, Part A can be 100% secured with a day of revision.
      5. Fear of the exam date. Book the supplementary exam slot early and treat the date as non-negotiable \u2014 a fixed date makes the plan stick.`,
    url: null, uploaded_at: '2026-02-06T09:00:00.000Z',
  },
  // subject-specific
  {
    id: 'm-ds-1', subject_id: 'cse-cs301', mtype: 'sheet',
    title: 'Data Structures \u2014 Unit-wise Hall Notes Summary',
    description: 'The points that almost always feature in DS Part-B answers.',
    content: P`
      Unit 1: Array vs linked list table (insertion at front: O(1) vs O(n) etc.), Big-O/Theta/Omega definitions with one example each.
      Unit 2: Stack push/pop/peek algorithms (5-6 lines each), infix to postfix algorithm (the 5-step stack algorithm), circular queue insert/delete formulas (rear = (rear+1) % size), deque types.
      Unit 3: SLL insertion/deletion cases (4 cases with pointer diagrams), reverse list algorithm (3-pointer), DLL vs SLL comparison table, polynomial multiplication steps.
      Unit 4: Recursion definition + base/recursive case, binary search pseudocode, merge sort diagram (one level split + one level merge), quicksort partition steps + complexity table.
      Unit 5: BST insert/search/delete (3 deletion cases!), AVL four rotation diagrams with before/after trees, hashing: h(key) = key % m, open addressing formula, chaining.
      One-mark goldmine: LIFO/FIFO, Big-O of binary search (log n), AVL balance factor (|hf-lf| <= 1), FIFO queue front/rear pointers.`,
    url: null, uploaded_at: '2026-02-10T09:00:00.000Z',
  },
  {
    id: 'm-ds-2', subject_id: 'cse-cs301', mtype: 'plan',
    title: 'Data Structures \u2014 7-Day Sprint Plan',
    description: 'A one-week plan for a DS supplementary exam.',
    content: P`
      Day 1: Unit 1 + Unit 2 (complexity, stacks, queues). Write: stack algorithms + infix to postfix from memory.
      Day 2: Unit 3 (linked lists). Write: 4 SLL cases + reverse + DLL table.
      Day 3: Unit 4 (recursion + sorting). Write: merge sort diagram + quicksort partition + binary search code.
      Day 4: Unit 5 (trees + hashing). Write: BST 3 deletion cases + 4 AVL rotations.
      Day 5: Solve 2024 previous paper (timed). Note gaps.
      Day 6: Re-solve Day 5 gaps + solve 2025 paper Part A fully.
      Day 7: One-pagers revision + 10 fastest long answers from your notes. Sleep early.`,
    url: null, uploaded_at: '2026-02-11T09:00:00.000Z',
  },
  {
    id: 'm-db-1', subject_id: 'cse-cs302', mtype: 'sheet',
    title: 'DBMS \u2014 SQL Practice Sheet (30-Query Plan)',
    description: 'The 30 SQL queries that cover 90% of DBMS Part-A and Part-B.',
    content: P`
      Basics (1-5): CREATE TABLE (with constraints), INSERT (5 rows), SELECT *, SELECT with WHERE (>, <, BETWEEN, LIKE, IN), UPDATE + DELETE.
      Aggregation (6-12): COUNT/SUM/AVG/MAX/MIN, GROUP BY with HAVING, multi-column sort, DISTINCT, nested sub-query (single-row), correlated sub-query (highest salary per department).
      Joins (13-18): INNER JOIN, LEFT JOIN, self join, natural join, join of 3 tables, join + where + order.
      Views & integrity (19-23): CREATE VIEW, view update rules, PRIMARY/FOREIGN KEY definitions, NOT NULL + UNIQUE, ALTER TABLE add constraint.
      Advanced (24-30): UNION/INTERSECT, EXISTS vs IN, simple transactions (BEGIN/COMMIT/ROLLBACK), sample DCL (GRANT/REVOKE), TCL (SAVEPOINT), normalisation problem (identify 1NF violation, convert to 2NF/3NF \u2014 write 3 tables with PK/FK).
      Rule: write each query twice \u2014 once by reading, once from memory. If you cannot write it from memory, it does not count.`,
    url: null, uploaded_at: '2026-02-12T09:00:00.000Z',
  },
  {
    id: 'm-db-2', subject_id: 'cse-cs302', mtype: 'plan',
    title: 'DBMS \u2014 5-Day Sprint Plan',
    description: 'Compress a semester of DBMS into five focused days.',
    content: P`
      Day 1: Fundamentals + E-R. Write: ANSI-SPARC 3 levels, E-R symbols + one diagram, mapping rules (3 rules for 1:1, 1:N, M:N).
      Day 2: SQL. Complete 20 queries from the practice sheet.
      Day 3: Normalisation. Solve 3 normalisation problems end-to-end (state each NF, show violation, show decomposition).
      Day 4: Transactions + Concurrency. Write: ACID with one example each, 2-phase locking, deadlock cycle example, Banker\u2019s algorithm steps.
      Day 5: Previous paper (timed) + gap revision. Solve 2025 paper.`,
    url: null, uploaded_at: '2026-02-13T09:00:00.000Z',
  },
  {
    id: 'm-os-1', subject_id: 'cse-cs401', mtype: 'sheet',
    title: 'OS \u2014 Scheduling Numericals Cheat Sheet',
    description: 'Tables and formulas for every scheduling numerical.',
    content: P`
      Given: arrival time (AT) and burst time (BT) for n processes.
      FCFS: execution in AT order. WT(i) = completion(i-1) - AT(i). TAT = WT + BT.
      SJF (non-preemptive): sort by BT among available. SRTF (preemptive): re-sort at every arrival.
      Priority: like SJF but on priority number (state your convention!).
      Round Robin: keep a queue, quantum q. Show the time slice diagram (most examiners award marks for the diagram alone).
      Always compute: average WT, average TAT, and throughput. Show the Gantt chart \u2014 it is 30-40% of the marks in these questions.
      Deadlock gold set: 4 Coffman conditions, Banker\u2019s algorithm (Available/Max/Allocation/Need table + safe sequence check).`,
    url: null, uploaded_at: '2026-02-14T09:00:00.000Z',
  },
  {
    id: 'm-cn-1', subject_id: 'cse-cs402', mtype: 'sheet',
    title: 'Computer Networks \u2014 OSI & Protocol One-Pager',
    description: 'One page covering every 1-mark and half-mark in CN.',
    content: P`
      OSI layers (top-down): Application / Presentation / Session / Transport / Network / Data Link / Physical. PDU: Message / Message / Message / Segment / Packet / Frame / Bit.
      TCP vs UDP table: connection, reliability, order, speed, ports (well-known: 20/21 FTP, 23 Telnet, 25 SMTP, 53 DNS, 80 HTTP, 110 POP3, 143 IMAP).
      Subnetting formula: 2^(32-netmask) hosts; usable = 2^(32-netmask) - 2.
      CRC: generator polynomial x^4 + x + 1 \u2192 10011; remainder is FCS.
      Checksum: sum of 16-bit words, 1\u2019s complement, 1\u2019s complement of the sum.
      Three-way handshake: SYN \u2192 SYN-ACK \u2192 ACK (draw it).
      IP header: 20 bytes, key fields (version, IHL, TTL, protocol, header checksum).
      Address classes: A 0xxxxxxx (126 nets), B 10xxxxxx, C 110xxxxx; private ranges 10.x, 172.16-31.x, 192.168.x.`,
    url: null, uploaded_at: '2026-02-15T09:00:00.000Z',
  },
  {
    id: 'm-py-1', subject_id: 'cse-cs201', mtype: 'sheet',
    title: 'Python \u2014 25 Must-Write Programs',
    description: 'Programs to practise by hand before a Python exam.',
    content: P`
      1-5: swap without temp variable, max of three, factorial, Fibonacci (loop + recursion), prime check.
      6-10: palindrome, Armstrong number, pattern printing (5 rows), reverse a string, count vowels.
      11-15: list sum/average, list of squares (comprehension), remove duplicates, bubble/selection sort, linear + binary search.
      16-20: tuple operations, dictionary: word frequency of a text, nested dict access, file read & count lines, file write from list.
      21-25: exception demo (divide by zero), class with __init__ + methods, inheritance example, lambda + map/filter, simple menu-driven program with functions.
      Exam tip: every program answer must include (a) purpose line, (b) code with comments, (c) one sample input/output. That structure alone secures most marks.`,
    url: null, uploaded_at: '2026-02-16T09:00:00.000Z',
  },
  {
    id: 'm-c-1', subject_id: 'cse-cs101', mtype: 'sheet',
    title: 'C Programming \u2014 20 Must-Write Programs',
    description: 'The standard program list for C programming papers.',
    content: P`
      1-4: sum of n numbers, factorial, Fibonacci, pattern (star triangle).
      5-8: array sum/avg, reverse array, largest element, linear search.
      9-12: bubble sort, selection sort, 2D matrix add/multiply, transpose.
      13-16: string length without strlen(), string reverse, palindrome check, count words in a string.
      17-20: recursion (factorial/Fibonacci), pointer to array, structure (student record with functions), file handling (write then read).
      Must-remember: sizeof, pass by value vs reference difference, pointer arithmetic example, #include vs #define, declaration vs definition.`,
    url: null, uploaded_at: '2026-02-17T09:00:00.000Z',
  },
  {
    id: 'm-ml-1', subject_id: 'cse-cs601', mtype: 'sheet',
    title: 'Machine Learning \u2014 Formulas One-Pager',
    description: 'Every formula you must be able to write on the exam day.',
    content: P`
      Linear regression: cost J(w,b) = (1/2m) * sum(h(x)-y)^2; gradient update w = w - alpha * dJ/dw.
      Logistic: h(x) = 1 / (1 + e^(-z)); cross-entropy loss.
      Decision tree: entropy H(S) = -p*log2(p) - (1-p)*log2(1-p); information gain = H(parent) - weighted sum of H(children).
      Naive Bayes: P(class|data) \u221d P(class) * P(data|class); Laplace smoothing (add-one).
      k-NN: distance (Euclidean), k vote; K-means: J = sum of squared distances to centroid.
      SVM: max margin, w*x + b = 1 boundary; kernel trick: K(x,y) = x^T y (linear), polynomial, RBF.
      Perceptron: update w = w + lr * (y - yhat) * x. Backprop: chain rule through layers.
      Metrics: accuracy, precision, recall, F1; ROC-AUC in words; confusion matrix cells (TP/FP/TN/FN).`,
    url: null, uploaded_at: '2026-02-18T09:00:00.000Z',
  },
]

export const GLOBAL_TIPS = [
  'Start from previous papers, not textbooks \u2014 questions are the syllabus for a supplementary exam.',
  'One A4 one-pager per unit beats 50 pages of highlights.',
  'Solve every timed paper you attempt \u2014 an unsolved paper teaches nothing.',
  'Part A (1-mark sections) are almost always full-marks secured with one focused day.',
  'The "appeared in N papers" label means preparation priority, not a guarantee of appearing again.',
  'Attempt every question. A 40% answer still earns marks; a blank earns zero.',
  'Fix one backlog subject at a time \u2014 a finished plan beats three half-plans.',
  'Sleep and consistency beat last-night cramming, every single time.',
]

// ------------------------------------------------------------ assembly
const byBranchCode = new Map()
subjects.forEach((s) => {
  const key = `${s.branch_id}|${s.code}|${s.semester_id.split('sem')[1]}`
  byBranchCode.set(key, s.id)
})

const question_papers = papersSpec.papers.map((p) => {
  const meta = papersSpec.subjects[p.subject]
  const sid = byBranchCode.get(`${meta.branch}|${meta.code}|${meta.sem}`)
  return {
    id: `p-${p.file}`,
    subject_id: sid || null,
    title: `${meta.name} \u2014 ${p.year} ${p.examType} Paper`,
    academic_year: p.year,
    exam_type: p.examType,
    regulation: 'R20',
    university: 'JNTUH (sample)',
    file_url: `/papers/${p.file}.pdf`,
    file_name: `${p.file}.pdf`,
    uploaded_at: '2026-01-20T10:00:00.000Z',
  }
})

export const DEMO = {
  branches,
  semesters,
  subjects,
  question_papers,
  questions,
  study_materials: materials,
  feedback: [],
}
