// Course and section descriptions, written from the Department of Chemistry
// "Course Contents 2021-2022" handbook (University of Peradeniya).
// tagline = one-line description, about = brief but complete course summary.
// Section keys must match the section names used in files.json.

export const COURSES = {
  CHE1013: {
    type: "Compulsory",
    tagline: "Atoms, bonds, organic reactivity and the laws of energy — the foundation every later course builds on.",
    about: "The first-year core course. It rebuilds atomic structure from the hydrogen spectrum to the quantum-mechanical atom and the periodic table, then explains why atoms bond the way they do. The organic part introduces functional groups, acidity, reaction intermediates and the first substitution, addition and elimination mechanisms. The course closes with the laws of thermodynamics, free energy and chemical equilibrium.",
    texts: ["Ebbing & Gammon, General Chemistry", "Lee, Concise Inorganic Chemistry", "McMurry, Organic Chemistry", "Atkins & de Paula, Physical Chemistry"],
    sections: {
      "General Chemistry I": { hours: "15 L", summary: "How the modern picture of the atom developed, and how electron configurations explain the periodic table and chemical bonding.", topics: ["Hydrogen spectrum and the Bohr model", "Wave–particle duality and de Broglie", "Uncertainty principle and quantum numbers", "Pauli principle, Hund's rule, Aufbau", "Ionic, covalent, dative and metallic bonds", "Lewis theory and Sidgwick–Powell", "Electronegativity, polarity, dipole moments", "Lattice energy and solubility"] },
      "Structure and Reactivity": { hours: "15 L", summary: "Why organic molecules react where they do: electron availability, acidity and basicity, intermediates and the first reaction mechanisms.", topics: ["Intermolecular interactions", "Electron availability in bonds", "Acidity and basicity", "Functional groups and IUPAC names", "Bond cleavage, reagents, intermediates", "Energy diagrams", "Substitution, addition, elimination", "Aromaticity and Hückel's rule"] },
      "Chemical Thermodynamics": { hours: "15 L", summary: "The zeroth, first and second laws applied to chemical systems, ending with free energy and the position of equilibrium.", topics: ["Systems and processes", "Work, heat and internal energy", "Enthalpy and extent of reaction", "Entropy and the second law", "Gibbs and Helmholtz energies", "Reaction quotient and K", "Shifting equilibrium: c, p, V, T"] },
    },
  },
  CHE1023: {
    type: "Compulsory",
    tagline: "Molecular shape and orbitals, gases and reaction rates, and the 3D world of stereochemistry.",
    about: "Continues CHE1013. Molecular structure is treated through VSEPR, hybridisation and molecular orbital theory, alongside electrode potentials and the equilibria behind titrations and buffers. The physical part develops the kinetic molecular theory of gases and the core of chemical kinetics — rate laws, half-lives and the Arrhenius equation. Stereochemistry introduces chirality, E/Z and R/S nomenclature, conformations and the stereochemical course of SN1, SN2, E1 and E2 reactions.",
    texts: ["Ebbing & Gammon, General Chemistry", "Chang, Chemistry", "McMurry, Organic Chemistry", "Atkins & de Paula, Physical Chemistry"],
    sections: {
      "General Chemistry II": { hours: "15 L", summary: "Molecular shape and bonding theories, plus electrochemistry and the equilibria used in chemical analysis.", topics: ["VSEPR and three-centre bonds", "Resonance and hybridisation", "MO theory of diatomics", "Magnetic properties", "Electrode potentials and Nernst equation", "Titrations, buffers, indicators", "Solubility equilibria"] },
      "Kinetic Molecular Theory and Chemical Kinetics": { hours: "15 L", summary: "Gas behaviour from a molecular model, then how fast reactions go and why.", topics: ["Gas laws and the perfect gas", "Kinetic model of gases", "Real gases", "Molecular collisions", "Rate laws and reaction order", "Molecularity and elementary steps", "Integrated rate laws and half-life", "Arrhenius equation"] },
      "Stereochemistry": { hours: "15 L", summary: "Describing molecules in three dimensions and following stereochemistry through reactions.", topics: ["Configurational isomers", "E/Z and R/S nomenclature", "Chirality, meso compounds, diastereomers", "Conformations of chains and rings", "Isomerism in cyclic compounds", "Biphenyls and allenes", "Stereochemistry of SN1, SN2, E1, E2", "Solvent effects on substitution"] },
    },
  },
  CHE1081: {
    type: "Compulsory",
    tagline: "Lab safety, measurement and error, and the classic tests that identify organic functional groups.",
    about: "The first practical course. It covers laboratory safety, glassware and equipment, safety data sheets, waste disposal, significant figures and error analysis, then moves to qualitative organic analysis: elemental tests, solubility classes and tests for unsaturation, acids, esters, amides, amines, nitro compounds and alcohols.",
    texts: ["Vogel, Qualitative Organic Analysis"],
    sections: {
      "Laboratory Orientation": { hours: "3 L + 2 P", summary: "Working safely and recording measurements properly.", topics: ["Laboratory safety", "Glassware and equipment", "Safety data sheets", "Waste disposal", "Significant figures", "Errors and uncertainty"] },
      "Qualitative Organic Analysis": { hours: "10 P", summary: "Identifying organic compounds from simple chemical tests.", topics: ["Heating, filtering, gas tests", "Elemental analysis", "Solubility tests", "Tests for unsaturation", "Acids, esters and amides", "Amines, nitro compounds, alcohols"] },
    },
  },
  CHE1091: {
    type: "Compulsory",
    tagline: "Volumetric titrations and semi-micro qualitative analysis of inorganic salts.",
    about: "The second first-year practical. Students perform acid–base, redox and precipitation titrations, then identify the cations and anions in inorganic salts by semi-micro qualitative analysis.",
    texts: ["Vogel, Qualitative Inorganic Analysis"],
    sections: {
      "Quantitative Analysis": { hours: "5 P", summary: "Accurate volumetric analysis.", topics: ["Acid–base titrations", "Redox titrations", "Precipitation titrations", "Standard solutions and indicators"] },
      "Qualitative Inorganic Analysis": { hours: "10 P", summary: "Systematic identification of ions in inorganic salts.", topics: ["Semi-micro technique", "Cation group separation", "Anion tests", "Analysis of unknown salts"] },
    },
  },

  CHE2112: {
    type: "Compulsory",
    tagline: "Periodic trends, coordination complexes, crystal structures and molecular symmetry.",
    about: "Builds descriptive and structural inorganic chemistry. It explains trends across the periodic table — oxidation states, the inert pair effect, and the hydrides, halides and oxides — then introduces coordination complexes through valence bond and crystal field theory, with their magnetism and spectra. The solid-state part covers unit cells, Bravais lattices, Miller indices, X-ray diffraction and lattice energies, and the course closes with point symmetry and how molecules are classified by it.",
    texts: ["Lee, Concise Inorganic Chemistry", "Hammond, The Basics of Crystallography and Diffraction", "Kettle, Coordination Chemistry", "Greenwood & Earnshaw, Chemistry of the Elements", "Shriver & Atkins, Inorganic Chemistry"],
    sections: {
      "Trends in the Periodic Table": { hours: "8 L", summary: "How electronic structure drives the chemistry of the main-group elements across groups and periods.", topics: ["Oxidation states", "Reduction-potential trends", "Inert pair effect", "Catenation", "Hydrides, halides and oxides", "Multiple bonding", "Hydrolysis and oxidising power", "Group 18 compounds", "Group 1 and 2 salts"] },
      "Coordination Chemistry": { hours: "10 L", summary: "Structure, naming, stability and bonding of metal complexes, with first models of their colour and magnetism.", topics: ["Structures and coordination numbers", "Nomenclature", "Stability constants", "Reaction mechanisms (intro)", "Valence bond theory", "Crystal field theory", "Magnetochemistry", "Electronic spectra"] },
      "Solid State Chemistry": { hours: "12 L", summary: "Describing crystals and solving their structures with X-rays.", topics: ["Unit cells and crystal systems", "Bravais lattices", "Miller indices", "Binary ionic structures", "Bragg's law", "Powder XRD", "Crystallographic databases", "Radius ratio and lattice energy"] },
      "Molecular Symmetry": { hours: "", summary: "Symmetry elements and operations, and sorting molecules and ions by their symmetry.", topics: ["Symmetry elements", "Symmetry operations", "Classifying molecules by symmetry"] },
    },
  },
  CHE2122: {
    type: "Compulsory",
    tagline: "Organometallics and the 18-electron rule, nuclear chemistry, and the d- and f-block elements.",
    about: "Three areas of inorganic chemistry. Organometallic chemistry explains metal–ligand bonding with π-acceptor ligands — synergic donation and back-donation, the 18-electron rule, metal carbonyls, nitrosyls and olefin complexes — with IR and NMR evidence. Basic radiochemistry treats nuclear structure, decay kinetics, transmutation, detection and the uses of radioisotopes. The transition-metal part surveys the d-block, lanthanides and actinides, contraction effects, colour, magnetism and extraction.",
    texts: ["Cotton & Wilkinson, Advanced Inorganic Chemistry", "Huheey, Inorganic Chemistry", "Choppin, Radiochemistry and Nuclear Chemistry", "Atkins et al., Inorganic Chemistry", "Greenwood & Earnshaw, Chemistry of the Elements"],
    sections: {
      "Organometallic Chemistry": { hours: "8 L", summary: "Bonding, stability and spectroscopy of complexes with metal–carbon and π-acceptor ligands.", topics: ["18-electron and EAN rules", "σ-donation and π-back-donation", "Metal carbonyls", "N₂, NO and olefin complexes", "Metal–metal bonding", "IR and NMR evidence", "Isolobal analogy", "Enemark–Feltham notation"] },
      "Basic Radiochemistry": { hours: "7 L", summary: "The nucleus, radioactive decay, and how radiation is detected and used.", topics: ["Nuclear structure", "Decay kinetics", "Nuclear transmutation", "Artificial radioactivity", "Radiation detection", "Reactors and fusion", "Isotopes as tracers", "Effects of radiation"] },
      "Chemistry of Transition Metals": { hours: "15 L", summary: "Systematic chemistry of the d-block, lanthanides and actinides.", topics: ["Transition-element chemistry", "Lanthanides and actinides", "Transuranium compounds", "d-block contraction", "Colour and magnetism", "Lanthanide contraction", "Extraction and separation"] },
    },
  },
  CHE2181: {
    type: "Compulsory",
    tagline: "Gravimetric, redox and EDTA titrations, simple complex syntheses and qualitative inorganic analysis.",
    about: "Practical inorganic analysis: determining anions and cations by gravimetry, redox titrations (bromate, dichromate, permanganate and iodometry) and complexometric EDTA titrations; synthesising simple inorganic complexes; and semi-micro qualitative analysis of inorganic mixtures, including phosphate separation.",
    texts: ["Vogel, Qualitative Inorganic Analysis"],
    sections: {
      "Laboratory Manual": { hours: "", summary: "The practical schedule and procedures.", topics: ["Gravimetric analysis", "Redox titrations", "Iodometry", "EDTA titrations", "Synthesis of complexes", "Semi-micro analysis", "Phosphate separation"] },
    },
  },
  CHE2212: {
    type: "Compulsory",
    tagline: "How organic reactions happen and how to use them: mechanisms, carbonyl chemistry and classic synthesis.",
    about: "The core second-year organic course. Organic Reaction Mechanisms I covers the energetics of organic reactions, additions to C=C and C=O, carboxylic acid derivatives, enols and enolates, and rearrangements. Introduction to Organic Synthesis turns those reactions into tools: oxidations and reductions, enolate alkylation, the aldol, Claisen, Dieckmann and Knoevenagel condensations, Robinson annulation, Wittig olefination, the Diels–Alder reaction and [3,3]-sigmatropic rearrangements.",
    texts: ["Morrison & Boyd, Organic Chemistry", "Fessenden & Fessenden, Organic Chemistry", "Solomons & Fryhle, Organic Chemistry", "Wannigama, Organic Reaction Mechanisms"],
    sections: {
      "Organic Reaction Mechanisms I": { hours: "15 L", summary: "Energetics and mechanisms of the main polar reactions of organic compounds.", topics: ["Thermodynamics vs kinetics", "Concerted and multi-step reactions", "Electrophilic and nucleophilic addition", "Carboxylic acid derivatives", "Carbanions, enols, enolates", "Rearrangements"] },
      "Introduction to Organic Synthesis": { hours: "15 L", summary: "The oxidations, reductions and C–C bond-forming reactions used to build molecules.", topics: ["Oxidation of alcohols and alkenes", "Sharpless epoxidation", "Hydride reductions, hydrogenation", "Enolates: C- vs O-alkylation", "Enamines and organocuprates", "Aldol, Claisen, Dieckmann, Knoevenagel", "Robinson annulation", "Wittig reaction", "Diels–Alder, Cope, Claisen"] },
      "Complete Notes": { hours: "", summary: "Full-course note sets and a tutorial with answers covering both parts of CHE2212.", topics: ["Complete lecture sets", "Tutorial with answers"] },
    },
  },
  CHE2282: {
    type: "Compulsory",
    tagline: "Reading UV, IR, NMR and mass spectra, plus the bench techniques to purify and characterise compounds.",
    about: "Structure determination and practical organic skills. Spectroscopy I covers UV–Vis (Beer–Lambert law, Woodward–Fieser rules), IR group frequencies, ¹H and ¹³C NMR with decoupling and the first 2D methods (COSY, HETCOR), and mass-spectrometric ionisation and fragmentation. The laboratory part trains separation and purification — extraction, distillation, chromatography and recrystallisation — with simple syntheses characterised by melting point and TLC.",
    texts: ["Silverstein, Spectrometric Identification of Organic Compounds", "Fessenden, Organic Laboratory Techniques", "Vogel, Textbook of Practical Organic Chemistry"],
    sections: {
      "Spectroscopy I": { hours: "15 L", summary: "Using UV–Vis, IR, NMR and MS to work out organic structures.", topics: ["Molecular energy levels", "Beer–Lambert law", "Woodward–Fieser rules", "IR group frequencies", "¹H and ¹³C NMR", "Decoupling techniques", "COSY and HETCOR", "MS ionisation and fragmentation"] },
      "Laboratory Techniques": { hours: "45 P", summary: "Separating, purifying, making and characterising organic compounds.", topics: ["Solvent extraction", "Distillation and steam distillation", "Chromatography", "Recrystallisation", "Derivative synthesis", "Melting point and TLC"] },
    },
  },
  CHE2313: {
    type: "Optional",
    tagline: "Quantum mechanics, atomic and molecular spectra, molecular properties and electrochemistry.",
    about: "The main second-year physical chemistry course. It introduces the postulates of quantum mechanics and solves the Schrödinger equation for particles in boxes and the hydrogen atom, then applies it to atomic structure and spectra. Molecular properties — dipole moments, polarisability, magnetic susceptibility — lead into rotational, vibrational and electronic spectroscopy and instrumentation. Electrochemistry covers conductance, Kohlrausch's law, cells, potentiometry and thermodynamics from emf.",
    texts: ["Atkins & de Paula, Physical Chemistry", "McQuarrie, Quantum Chemistry", "Banwell, Fundamentals of Molecular Spectroscopy"],
    sections: {
      "Quantum Mechanics": { hours: "10 L", summary: "The postulates of quantum mechanics and the first solutions of the Schrödinger equation.", topics: ["Evidence for quantisation", "Schrödinger equation", "Operators and observables", "Expectation values", "Uncertainty principle", "Particle in 1D, 2D, 3D boxes", "The hydrogen atom"] },
      "Atomic Structure and Atomic Spectra": { hours: "8 L", summary: "Orbitals, many-electron atoms, and the spectra of hydrogen and the alkali metals.", topics: ["Atomic models", "Orbital shapes", "Radial distribution functions", "Shielding in many-electron atoms", "Building-up principle", "Hydrogen spectrum, selection rules", "Alkali-metal spectra"] },
      "Molecular Properties and Spectroscopy": { hours: "17 L", summary: "Electrical, optical and magnetic properties of molecules and the basics of molecular spectroscopy.", topics: ["Dipole moment and polarisability", "Refractive index", "Magnetic susceptibility", "Intermolecular forces", "Rotational spectra", "Vibrational spectra", "Electronic spectra", "Spectrometer components"] },
      "Electrochemistry": { hours: "10 L", summary: "Ionic conduction, electrochemical cells, and what emf measurements reveal.", topics: ["Molar conductivity", "Strong and weak electrolytes", "Kohlrausch's law", "Conductometric titrations", "Electrodes and cells", "Potentiometry", "Thermodynamics from emf"] },
    },
  },
  CHE2332: {
    type: "Optional",
    tagline: "The maths toolkit for chemistry: logs, graphs, calculus and matrices applied to real problems.",
    about: "A problem-solving course that builds the mathematics used throughout the degree: ionic-equilibrium calculations (pH, pKa, pKb), analytical calculations, complex numbers, linearising data (Arrhenius and Clapeyron plots, isotherms, Maxwell–Boltzmann distributions), calculus in kinetics and thermodynamics, electrode equilibria, and matrices and determinants.",
    texts: ["Monk, Maths for Chemistry"],
    sections: {
      "Chemical Calculations": { hours: "30 L", summary: "Worked approaches to numerical problems in every branch of chemistry.", topics: ["Problem-solving strategy", "pH, pKa and pKb", "Analytical calculations", "Complex numbers", "Linearisation and graphs", "Calculus in kinetics", "Thermodynamics problems", "Matrices and determinants"] },
    },
  },
  CHE2381: {
    type: "Compulsory",
    tagline: "Error analysis and core experiments in equilibria, thermodynamics, colorimetry and conductometry.",
    about: "Quantitative physical chemistry practice: estimating and propagating errors, presenting data in tables and graphs, and experiments on equilibria, thermodynamics, colorimetry and conductometry, finishing with a mini-project.",
    texts: ["Shoemaker, Garland & Nibler, Experiments in Physical Chemistry", "Findlay, Practical Physical Chemistry"],
    sections: {
      "Laboratory Manual": { hours: "", summary: "Experiment procedures and data treatment.", topics: ["Error propagation", "Tables and graphs", "Equilibria", "Thermodynamics", "Colorimetry", "Conductometry", "Mini-project"] },
    },
  },

  CHE3112: {
    type: "Compulsory",
    tagline: "Boranes, silicates and clusters, plus the full machinery of point groups and character tables.",
    about: "Structural inorganic chemistry and the symmetry tools used to describe it. Structural Chemistry treats boranes, carboranes and metalloboranes with Wade's rules, the classification of silicates and layer clays, layered double hydroxides, intercalation compounds, clathrates and metal clusters. Symmetry develops point groups, polarity and chirality from symmetry, group multiplication tables, matrix representations and character tables. The folder also carries diffraction-methods handouts.",
    texts: ["Shriver & Atkins, Inorganic Chemistry", "Huheey, Inorganic Chemistry", "Miessler & Tarr, Inorganic Chemistry", "Cotton, Chemical Applications of Group Theory"],
    sections: {
      "Course Overview": { hours: "", summary: "Course outline and introduction.", topics: ["Course outline"] },
      "Structural Chemistry": { hours: "15 L", summary: "Structures and bonding of electron-deficient clusters, silicates and layered materials.", topics: ["Boranes and carboranes", "Wade's rules", "Borane synthesis and reactions", "Silicate classification", "Layer silicate clays", "Layered double hydroxides", "Intercalates and clathrates", "Metal clusters"] },
      "Symmetry and Group Theory": { hours: "15 L", summary: "From symmetry elements to character tables.", topics: ["Symmetry elements and operations", "Point-group determination", "Polarity and chirality from symmetry", "Stereographic projections", "Group multiplication tables", "Matrix representations", "Irreducible representations", "Character tables"] },
      "Diffraction Methods": { hours: "", summary: "Handouts on diffraction and the reciprocal lattice.", topics: ["Diffraction handouts", "Reciprocal lattices"] },
    },
  },
  CHE3122: {
    type: "Compulsory",
    tagline: "Ligand field theory, term symbols and Tanabe–Sugano diagrams, plus NMR, ESR, NQR and Mössbauer for inorganic systems.",
    about: "A full description of transition-metal complexes. Advanced Coordination Chemistry covers ligand field theory, angular-momentum coupling, Russell–Saunders terms and microstates, correlation, Orgel and Tanabe–Sugano diagrams, the Jahn–Teller effect, the nephelauxetic effect and charge-transfer spectra. Resonance Spectroscopic Methods applies multinuclear NMR (¹⁹F, ¹⁴/¹⁵N, ³¹P), NQR, ESR and Mössbauer spectroscopy to inorganic compounds.",
    texts: ["Cotton & Wilkinson, Advanced Inorganic Chemistry", "Miessler & Tarr, Inorganic Chemistry", "Drago, Physical Methods in Inorganic Chemistry", "Orgel, An Introduction to Ligand Field Theory"],
    sections: {
      "Advanced Coordination Chemistry": { hours: "15 L", summary: "Electronic structure and spectra of transition-metal complexes.", topics: ["Ligand field theory", "Angular-momentum coupling", "Russell–Saunders terms, microstates", "Orgel diagrams", "Tanabe–Sugano diagrams", "Jahn–Teller distortion", "Nephelauxetic effect", "Charge-transfer spectra"] },
      "Resonance Spectroscopic Methods": { hours: "15 L", summary: "Magnetic-resonance and nuclear methods applied to inorganic compounds.", topics: ["¹⁹F, ¹⁵N and ³¹P NMR", "Selection rules", "Nuclear quadrupole resonance", "Electron spin resonance", "Mössbauer spectroscopy", "Inorganic applications"] },
    },
  },
  CHE3192: {
    type: "Compulsory",
    tagline: "Rare earths, ligand field strength, nanoparticles, PXRD and XRF in the inorganic lab.",
    about: "Advanced inorganic practicals: analysis of rare-earth elements and fusion mixtures, synthesis of special inorganic compounds, determining ligand field strength, nanoparticle synthesis and characterisation, phase analysis and unit-cell calculation from powder XRD, XRF analysis of alloys, UV–visible spectra of complexes and separation of inorganic ions.",
    texts: ["Vogel, Qualitative Inorganic Analysis"],
    sections: {
      "Experiments": { hours: "", summary: "Experiment sheets for the course.", topics: ["Rare-earth analysis", "Ligand field strength", "Nanoparticle synthesis", "Powder XRD", "XRF of alloys", "UV–Vis of complexes"] },
    },
  },
  CHE3212: {
    type: "Compulsory",
    tagline: "Reactive intermediates, pericyclic reactions and the logic of retrosynthesis.",
    about: "Extends organic mechanisms and synthesis. Organic Reaction Mechanisms II covers reactive intermediates — radicals, carbenes and nitrenes — and the orbital-symmetry-controlled pericyclic reactions: cycloadditions, electrocyclic reactions and sigmatropic rearrangements. Organic Synthesis II teaches retrosynthetic analysis: disconnections, chemo-, regio- and stereoselectivity, amine synthesis, control in carbonyl condensations and strategies for making rings.",
    texts: ["Corey & Cheng, The Logic of Chemical Synthesis", "Mackie & Smith, Guidebook to Organic Synthesis", "Morrison & Boyd, Organic Chemistry"],
    sections: {
      "Organic Reaction Mechanisms II": { hours: "15 L", summary: "Reactive intermediates and orbital-symmetry-controlled reactions.", topics: ["Radical intermediates", "Carbenes and nitrenes", "Pericyclic reactions", "Woodward–Hoffmann rules", "Cycloadditions", "Electrocyclic reactions", "Sigmatropic rearrangements"] },
      "Organic Synthesis II": { hours: "15 L", summary: "Planning syntheses backwards from the target.", topics: ["Retrosynthetic analysis", "Synthons and disconnections", "Chemo- and regioselectivity", "Stereoselectivity", "Amine synthesis", "Carbonyl condensation control", "Ring synthesis"] },
    },
  },
  CHE3222: {
    type: "Compulsory",
    tagline: "How shape controls reactivity, and solving structures with advanced 1D and 2D NMR.",
    about: "Conformational Analysis treats the conformations of acyclic molecules, alkenes, three- to six-membered and large rings, how conformation affects reactivity, the rules for ring closure and stereoelectronic effects. Spectroscopy II applies DEPT, HSQC, HMBC and NOE experiments — with combined spectroscopic problems — to determine organic structures.",
    texts: ["Eliel & Wilen, Stereochemistry of Organic Compounds", "Silverstein, Spectrometric Identification of Organic Compounds"],
    sections: {
      "Conformational Analysis": { hours: "15 L", summary: "Molecular shape and its effect on reaction outcomes.", topics: ["Acyclic conformations", "Alkene conformations", "Three- to six-membered rings", "Large rings", "Conformation and reactivity", "Rules for ring closure", "Stereoelectronic effects"] },
      "Spectroscopy II": { hours: "15 L", summary: "Advanced NMR experiments for complete structure determination, with worked problem sets.", topics: ["DEPT", "HSQC", "HMBC", "NOE", "Combined structure problems"] },
    },
  },
  CHE3232: {
    type: "Compulsory",
    tagline: "Sugars, lipids and amino acids, and the chemistry of aromatic heterocycles.",
    about: "Biomolecules covers monosaccharide reactions, di- and polysaccharides, carbohydrate conformation, the anomeric effect and mutarotation, lipids, and amino acids and protein structure. Heterocycles covers five- and six-membered and fused heteroaromatics — pyrrole, furan, thiophene and pyridine-type rings — plus pyrylium salts, anthocyanins, α-pyrones and rings with more than one heteroatom: their structure, synthesis and reactions.",
    texts: ["Carey & Sundberg, Advanced Organic Chemistry A", "Lehninger, Principles of Biochemistry", "Joule & Mills, Heterocyclic Chemistry"],
    sections: {
      "Biomolecules": { hours: "20 L", summary: "Structure and reactivity of carbohydrates, lipids and amino acids.", topics: ["Monosaccharide reactions", "Di- and polysaccharides", "Carbohydrate conformations", "Anomeric effect, mutarotation", "Lipid structures", "Amino acids", "Protein structure"] },
      "Heterocycles": { hours: "10 L", summary: "Aromatic rings containing nitrogen, oxygen and sulfur.", topics: ["Pyrrole, furan, thiophene", "Six-membered heteroaromatics", "Pyrylium salts, anthocyanins", "α-Pyrones", "Fused heterocycles", "Several heteroatoms"] },
    },
  },
  CHE3292: {
    type: "Compulsory",
    tagline: "Multi-step synthesis, purification and natural-product isolation.",
    about: "An advanced organic practical: multi-step syntheses involving advanced reaction mechanisms; separation, purification and spectroscopic characterisation; and the extraction and identification of natural products.",
    texts: ["Silverstein, Spectrometric Identification of Organic Compounds", "Vogel, Textbook of Practical Organic Chemistry"],
    sections: {
      "Advanced Organic Laboratory": { hours: "", summary: "Multi-step synthesis and natural-product work. The folder holds past practical papers only, so the references point to outside sources.", topics: ["Multi-step synthesis", "Purification", "Spectroscopic characterisation", "Natural-product isolation"] },
    },
  },
  CHE3303: {
    type: "Compulsory",
    tagline: "Quantum chemistry with approximation methods, high-resolution spectroscopy and statistical thermodynamics.",
    about: "Physical chemistry at depth. Quantum Mechanics revisits the solvable models — box, harmonic oscillator, rigid rotor, hydrogen atom — then introduces variation and perturbation theory, spin and Slater determinants, Hartree–Fock SCF, the Born–Oppenheimer approximation and Hückel MO theory. Advanced Molecular Spectroscopy treats rotational, vibrational, rovibrational, Raman and electronic spectra with Franck–Condon analysis. Statistical Thermodynamics builds partition functions and derives thermodynamic quantities and equilibrium constants from them.",
    texts: ["Atkins & de Paula, Physical Chemistry", "McQuarrie, Quantum Chemistry", "Banwell, Fundamentals of Molecular Spectroscopy"],
    sections: {
      "Quantum Mechanics": { hours: "15 L", summary: "Exact models, approximation methods and the quantum treatment of molecules.", topics: ["Box, oscillator, rigid rotor", "Hydrogen atom in detail", "Variation theory", "Perturbation theory", "Spin and Slater determinants", "Hartree–Fock SCF", "Born–Oppenheimer", "Hückel MO theory"] },
      "Advanced Molecular Spectroscopy": { hours: "15 L", summary: "High-resolution spectra and what they reveal about molecular structure.", topics: ["Line widths and intensities", "Microwave spectroscopy", "Non-rigid and symmetric tops", "Anharmonicity, overtones, hot bands", "Rovibrational spectra", "Raman spectroscopy", "Franck–Condon principle"] },
      "Statistical Thermodynamics": { hours: "15 L", summary: "Linking molecular energy levels to bulk thermodynamics.", topics: ["Boltzmann distribution", "Ensembles", "Molecular partition functions", "Sackur–Tetrode equation", "Equipartition, heat capacity", "Residual entropy", "K from partition functions"] },
    },
  },
  CHE3313: {
    type: "Compulsory",
    tagline: "Thermodynamics in depth, phase diagrams, surfaces and colloids, kinetics and polymers.",
    about: "A broad course in applied physical chemistry. Advanced Thermodynamics covers Maxwell relations, Gibbs–Helmholtz, chemical potential, fugacity and activities. Phase Equilibria applies the phase rule to one-, two- and three-component systems. Surface and Colloid Chemistry treats the Kelvin equation, adsorption isotherms and surfactants. Kinetics covers experimental rate laws, the steady-state approximation and enzyme kinetics. Polymer Chemistry introduces step-growth (Carothers) and chain-growth kinetics and polymer characterisation.",
    texts: ["Atkins & de Paula, Physical Chemistry", "Campbell, Catalysis at Surfaces"],
    sections: {
      "Advanced Thermodynamics": { hours: "10 L", summary: "The formal structure of thermodynamics and its use for real gases and solutions.", topics: ["Carnot cycle", "Spontaneity criteria", "Maxwell relations", "Cp – Cv relations", "Third-law entropies", "Gibbs–Helmholtz equation", "Fugacity", "Activities"] },
      "Phase Equilibria": { hours: "10 L", summary: "Reading and using phase diagrams.", topics: ["The phase rule", "One-component diagrams", "Liquid–liquid systems", "Liquid–solid systems", "Zone refining", "Triangular diagrams", "Industrial applications"] },
      "Surface and Colloid Chemistry": { hours: "10 L", summary: "Interfaces, adsorption and colloidal dispersions.", topics: ["Kelvin equation", "Surface excess", "Physisorption vs chemisorption", "Gibbs and Langmuir isotherms", "Enthalpy of adsorption", "Foams and emulsions", "Surfactants"] },
      "Kinetics": { hours: "7 L", summary: "Determining rate laws and analysing complex mechanisms.", topics: ["Initial-rate method", "Isolation method", "Activation energy", "Steady-state approximation", "Pre-equilibrium", "Enzyme kinetics"] },
      "Polymer Chemistry": { hours: "8 L", summary: "How polymers form and how they are characterised.", topics: ["Polymer basics", "Carothers equation", "Step-growth kinetics", "Chain-growth kinetics", "Characterisation"] },
    },
  },
  CHE3392: {
    type: "Compulsory",
    tagline: "Experiments in electrochemistry, colorimetry, kinetics, spectroscopy and surface chemistry.",
    about: "Advanced physical chemistry practicals in electrochemistry, colorimetry, kinetics, spectroscopy and surface chemistry, with full data treatment.",
    texts: ["Shoemaker, Garland & Nibler, Experiments in Physical Chemistry", "Findlay, Practical Physical Chemistry"],
    sections: {
      "Laboratory Manual": { hours: "", summary: "General guidelines, the lab manual and the materials list.", topics: ["Electrochemistry", "Colorimetry", "Kinetics", "Spectroscopy", "Surface chemistry"] },
    },
  },
  CHE3413: {
    type: "Compulsory",
    tagline: "Statistics, spectrophotometry, chromatography and electroanalysis — the core of modern chemical analysis.",
    about: "The main analytical course. Analytical Calculations covers statistics (t- and F-tests), calibration, uncertainty, method performance and equilibrium calculations for titrations. Spectrophotometry covers atomic absorption and emission and UV–Vis methods. Separation Methods covers solvent extraction and chromatography — GC, ion exchange, TLC and LC, with the van Deemter equation. Electroanalytical Chemistry covers activity, potentiometry, polarography and voltammetry, amperometry, electrolysis and sensors. A short unit treats non-aqueous solvents.",
    texts: ["Skoog, West & Holler, Fundamentals of Analytical Chemistry", "Harris, Quantitative Chemical Analysis", "Bard & Faulkner, Electrochemical Methods"],
    sections: {
      "Analytical Calculations": { hours: "12 L", summary: "The statistics and equilibrium calculations behind reliable analysis.", topics: ["t-test and F-test", "Calibration statistics", "Uncertainty", "Method performance", "Interlaboratory testing", "Titration errors", "Complex and solubility equilibria"] },
      "Analytical Spectrophotometry": { hours: "9 L", summary: "Atomic and molecular absorption and emission methods for quantitative analysis.", topics: ["Atomic absorption", "Atomic emission", "UV–Vis absorption", "Detection limits", "Interferences", "Instrumentation"] },
      "Separation Methods": { hours: "12 L", summary: "Extraction and chromatography, from theory to troubleshooting.", topics: ["Distribution ratio", "Multiple extractions", "Chromatography basics", "Gas chromatography", "Van Deemter equation", "Ion exchange", "TLC and paper", "Liquid chromatography"] },
      "Electroanalytical Chemistry": { hours: "10 L", summary: "Measuring chemistry with potentials and currents.", topics: ["Activity and ionic strength", "Potentiometry", "Polarography, pulse methods", "Cyclic voltammetry", "Amperometry, flow injection", "Bulk electrolysis", "Microelectrodes", "Electrochemical sensors"] },
    },
  },
  CHE3512: {
    type: "Compulsory",
    tagline: "Enzymes and metabolism: how cells catalyse, control and power their chemistry.",
    about: "Enzymology covers enzyme structure, classification, mechanisms of action, kinetics and regulation, with applications in industry and health and an introduction to enzyme engineering. Metabolic Pathways and Control covers glycolysis, the pentose phosphate pathway, gluconeogenesis, glycogen metabolism, β-oxidation and fatty acid synthesis, the citric acid cycle, the respiratory chain and nitrogen metabolism.",
    texts: ["Lehninger, Principles of Biochemistry", "Berg, Tymoczko & Stryer, Biochemistry"],
    sections: {
      "Enzymology": { hours: "15 L", summary: "Enzymes as biological catalysts. The folder holds past papers only, so the references point to open sources.", topics: ["Structure and classification", "Mechanisms of action", "Enzyme kinetics", "Regulatory enzymes", "Industrial enzymes", "Enzymes and health", "Enzyme engineering"] },
      "Metabolic Pathways and Control": { hours: "15 L", summary: "The main energy-yielding and biosynthetic pathways and how they are regulated.", topics: ["Glycolysis", "Pentose phosphate pathway", "Gluconeogenesis", "Glycogen metabolism", "β-Oxidation", "Fatty acid synthesis", "Citric acid cycle", "Respiratory chain", "Nitrogen metabolism"] },
    },
  },
  CHE3712: {
    type: "Optional",
    tagline: "Metallurgy and minerals, petroleum to pharmaceuticals, and the chemical engineering behind industry.",
    about: "Industrial Inorganic Chemistry covers metallurgy, Ellingham diagrams, the iron–carbon phase diagram, steels and cast iron, and mineral-based industries with Sri Lankan examples. Industrial Organic Chemistry covers coal, petroleum, essential oils, polymers, dyes and pharmaceuticals. Industrial Physical Chemistry introduces chemical engineering — mass and heat transfer, reactors, materials preparation, the chlor-alkali and urea processes, and vapour deposition.",
    texts: ["Cooray, Geology of Sri Lanka", "Karunaratne, Industrial Organic Chemistry"],
    sections: {
      "Industrial Inorganic Chemistry": { hours: "10 L", summary: "Extracting and processing metals and minerals.", topics: ["Metallurgy", "Ellingham diagrams", "Iron–carbon diagram", "Steel and cast iron", "Feldspar and mica", "Minerals of Sri Lanka"] },
      "Industrial Organic Chemistry": { hours: "10 L", summary: "Organic raw materials and the products made from them.", topics: ["Coal", "Petroleum", "Essential oils", "Polymers", "Dyes and textiles", "Pharmaceuticals"] },
      "Industrial Physical Chemistry": { hours: "10 L", summary: "Unit operations and process chemistry.", topics: ["Chemical engineering basics", "Mass transfer", "Heat transfer", "Reactors", "Chlor-alkali process", "Urea production", "Vapour deposition"] },
    },
  },
  CHE3812: {
    type: "Optional",
    tagline: "Logic gates to microcontrollers, and the first steps into computational chemistry.",
    about: "Digital Electronics and Interfacing covers number systems, logic gates and Boolean algebra, combinational and sequential circuits, memory, analog-to-digital conversion, data acquisition, instrument control and microcontrollers. Computational Chemistry covers data analysis and visualisation, 2D and 3D structure representation, in-silico experiments, the Hartree–Fock SCF method, molecular mechanics and molecular dynamics.",
    texts: ["Horowitz & Hill, The Art of Electronics", "Cramer, Essentials of Computational Chemistry"],
    sections: {
      "Digital Electronics and Interfacing": { hours: "16 L + 12 P", summary: "The electronics behind modern instruments.", topics: ["Number systems", "Logic gates, Boolean algebra", "De Morgan's theorems", "Combinational circuits", "Flip-flops and counters", "ADC and data acquisition", "Microcontrollers"] },
      "Computational Chemistry": { hours: "14 L + 8 P", summary: "Using computers to model molecules.", topics: ["Data visualisation", "2D and 3D structures", "In-silico experiments", "Hartree–Fock SCF", "Molecular mechanics", "Molecular dynamics"] },
    },
  },

  CHE3491: {
    type: "Compulsory",
    tagline: "Hands-on instrumental analysis: spectrometry, voltammetry, GC, HPLC, NMR and FT-IR.",
    about: "Advanced analytical practicals: error analysis for instrumental methods, elementary electronics, atomic and molecular spectrometry, cyclic voltammetry and amperometry, gas and high-performance liquid chromatography, NMR, FT-IR and particle-size analysis.",
    texts: ["Skoog, Holler & Crouch, Principles of Instrumental Analysis"],
    sections: {
      "Laboratory Notes": { hours: "", summary: "Notes for the instrumental experiments.", topics: ["Error analysis", "Significant figures", "Standard addition", "FT-IR", "Voltammetry", "GC and HPLC"] },
    },
  },
  CHE4112: {
    type: "Compulsory",
    tagline: "Single-crystal structure determination and advanced radiochemistry.",
    about: "Diffraction Methods covers reciprocal lattices, space groups, systematic absences, scattering and structure factors, Fourier and Patterson maps, single-crystal structure solution and refinement, neutron diffraction and an introduction to protein crystallography. Advanced Radiochemistry covers radiation detectors, particle accelerators, nuclear models, the stability of isobars and radioanalytical techniques such as isotope dilution and neutron activation analysis.",
    texts: ["Hammond, The Basics of Crystallography and Diffraction", "Stout & Jensen, X-ray Structure Determination", "International Tables for Crystallography, Vol. A"],
    sections: {
      "Diffraction Methods": { hours: "15 L", summary: "Solving crystal structures from diffraction data.", topics: ["Reciprocal lattice", "Space groups", "Systematic absences", "Scattering factors", "Structure factors", "Fourier and Patterson maps", "Refinement", "Neutron and protein crystallography"] },
      "Advanced Radiochemistry": { hours: "15 L", summary: "Nuclear models, accelerators and radioanalytical methods.", topics: ["Radiation detectors", "Linacs and cyclotrons", "Shell and liquid-drop models", "Isobar stability", "Isotope dilution", "Neutron activation analysis", "Tracer methods"] },
    },
  },
  CHE4122: {
    type: "Compulsory",
    tagline: "Organometallic complexes in catalysis, and how inorganic reactions happen.",
    about: "Advanced Organometallic Chemistry covers IUPAC naming, complexes of olefins, carbonyls, nitrosyls and arenes, spectroscopic characterisation and applications in catalysis — hydroformylation, acetic acid synthesis, Wilkinson's catalyst and olefin polymerisation. Reaction Mechanisms in Inorganic Chemistry covers substitution in octahedral and square-planar complexes, the trans effect, acid and base hydrolysis, inner- and outer-sphere electron transfer, Marcus theory and the Robin–Day classification.",
    texts: ["Spessard & Miessler, Organometallic Chemistry", "Basolo & Pearson, Inorganic Reaction Mechanisms"],
    sections: {
      "Advanced Organometallic Chemistry": { hours: "15 L", summary: "Structure, characterisation and catalytic uses of organometallic complexes.", topics: ["IUPAC naming", "Olefin and carbonyl complexes", "Nitrosyl and arene complexes", "Spectroscopic characterisation", "Hydroformylation", "Acetic acid process", "Wilkinson's catalyst", "Olefin polymerisation"] },
      "Reaction Mechanisms in Inorganic Chemistry": { hours: "15 L", summary: "Kinetics and mechanisms of substitution and electron transfer.", topics: ["Octahedral substitution", "Square-planar substitution", "Trans effect", "Acid and base hydrolysis", "Inner- and outer-sphere ET", "Marcus theory", "Robin–Day classification"] },
    },
  },
  CHE4132: {
    type: "Optional",
    tagline: "Advanced materials: ceramics, conducting polymers, batteries, photocatalysts and solar cells.",
    about: "A materials-focused course covering advanced ceramics, inorganic and conducting polymers, solid-state batteries and electrolytes, semiconductor photocatalysts, photoelectrochemical and photovoltaic solar cells, liquid crystals, ionic solids, crystal defects, solid solutions, Chevrel phases, sol–gel technology, inorganic synthesis and thermal analysis.",
    texts: ["West, Solid State Chemistry and its Applications", "Smart & Moore, Solid State Chemistry"],
    sections: {
      "Advanced Materials": { hours: "30 L", summary: "Structure–property relations in functional solids. The folder holds past papers only, so the references point to outside sources.", topics: ["Advanced ceramics", "Conducting polymers", "Solid-state batteries", "Photocatalysis", "Solar cells", "Liquid crystals", "Crystal defects", "Sol–gel technology"] },
    },
  },
  CHE4213: {
    type: "Compulsory",
    tagline: "Proving mechanisms, controlling stereochemistry and solving organic problems.",
    about: "Physical Organic Chemistry analyses what controls reaction rates and mechanisms: kinetic and thermodynamic data, the Hammond postulate, the Curtin–Hammett principle, kinetic isotope effects, the Hammett, Yukawa–Tsuno and Taft relationships, and labelling, crossover and trapping experiments. Advanced Stereochemistry covers stereocontrol in cyclic and acyclic systems and chiral catalysis. Problem Solving combines stereochemistry, mechanisms, synthesis and spectroscopy in worked tutorials.",
    texts: ["Isaacs, Physical Organic Chemistry", "Anslyn & Dougherty, Modern Physical Organic Chemistry", "Eliel & Wilen, Stereochemistry of Organic Compounds"],
    sections: {
      "Physical Organic Chemistry": { hours: "15 L", summary: "Experimental and quantitative tools for working out mechanisms.", topics: ["Kinetic and thermodynamic data", "Hammond postulate", "Curtin–Hammett principle", "Kinetic isotope effects", "Hammett equation", "Yukawa–Tsuno and Taft", "Labelling and crossover", "Trapping intermediates"] },
      "Advanced Stereochemistry": { hours: "15 L", summary: "Controlling the three-dimensional outcome of reactions.", topics: ["Cyclic stereocontrol", "Acyclic stereocontrol", "Chiral catalysis", "MO theory for selectivity"] },
      "Problem Solving": { hours: "15 L", summary: "Integrated problems with worked tutorials.", topics: ["Stereochemistry problems", "Mechanism problems", "Synthesis problems", "Spectroscopy problems"] },
    },
  },
  CHE4312: {
    type: "Compulsory",
    tagline: "Electrolyte solutions and electrode interfaces, and the dynamics of fast reactions.",
    about: "Advanced Electrochemistry covers ion–solvent and ion–ion interactions, Debye–Hückel theory, polarised electrodes and electrocapillarity, models of the electrode–solution interface, AC methods, electrode kinetics, Tafel plots and mass-transfer control. Advanced Chemical Kinetics and Reaction Dynamics covers fast-reaction and relaxation methods, collision theory, activated-complex theory and the Eyring equation, potential energy surfaces, and applications in surface science and catalysis.",
    texts: ["Atkins & de Paula, Physical Chemistry", "Laidler, Chemical Kinetics", "Bard & Faulkner, Electrochemical Methods"],
    sections: {
      "Advanced Electrochemistry": { hours: "15 L", summary: "Solutions, interfaces and electrode kinetics.", topics: ["Ion–solvent interactions", "Debye–Hückel theory", "Electrocapillary curves", "Double-layer models", "AC methods", "Electrode kinetics", "Tafel plots", "Lithium-ion batteries"] },
      "Advanced Chemical Kinetics and Reaction Dynamics": { hours: "15 L", summary: "Theories of reaction rates and how fast reactions are measured.", topics: ["Fast-reaction methods", "Relaxation methods", "Collision theory", "Activated-complex theory", "Eyring equation", "Potential energy surfaces"] },
    },
  },
  CHE4322: {
    type: "Compulsory",
    tagline: "Catalysis at surfaces, colloid stability and the physical chemistry of polymers.",
    about: "Surface and Colloid Chemistry covers solid-surface structure and defects, the BET, Temkin and Freundlich isotherms, surface mobility, heterogeneous catalysis (Langmuir–Hinshelwood and Eley–Rideal), colloid stability, zeta potential and AFM. Polymer Chemistry covers polymer properties, the gel point, polymerisation equilibria, living and controlled radical polymerisation (ATRP, SFRP, RAFT), ionic and stereoregular polymerisation, and Flory–Huggins solution thermodynamics.",
    texts: ["Thomas & Thomas, Principles and Practice of Heterogeneous Catalysis", "Young & Lovell, Introduction to Polymers"],
    sections: {
      "Surface and Colloid Chemistry": { hours: "15 L", summary: "Surfaces, catalysis and colloids.", topics: ["Surface structure, defects", "BET, Temkin, Freundlich", "Heterogeneous catalysis", "Langmuir–Hinshelwood", "Zeta potential", "AFM", "Adsorption kinetics"] },
      "Polymer Chemistry": { hours: "15 L", summary: "Mechanisms and thermodynamics of polymers.", topics: ["Polymer properties", "Gel point", "Polymerisation equilibria", "ATRP, SFRP, RAFT", "Living ionic polymerisation", "Stereoregular polymers", "Flory–Huggins theory"] },
    },
  },
  CHE4332: {
    type: "Optional",
    tagline: "Hartree–Fock, DFT and force fields: computing structures, energies and spectra.",
    about: "Molecular Quantum Mechanics covers Hartree–Fock SCF-MO theory, basis sets, semiempirical methods and density functional theory. Electronic Structure Calculations covers single-point energies, geometry optimisation and predicting properties and spectra. Classical Modelling covers molecular mechanics, force fields, conformational searching, molecular dynamics and Monte Carlo methods.",
    texts: ["Leach, Molecular Modelling", "Frenkel & Smit, Understanding Molecular Simulation", "Cramer, Essentials of Computational Chemistry"],
    sections: {
      "Molecular Modeling": { hours: "20 L + 9 P", summary: "Quantum and classical modelling of molecules.", topics: ["Hartree–Fock SCF-MO", "Basis sets", "Semiempirical methods", "Density functional theory", "Geometry optimisation", "Force fields", "Molecular dynamics", "Monte Carlo"] },
    },
  },
  CHE4352: {
    type: "Optional",
    tagline: "Scaling laws, nanometrology, nanomaterials and nanotoxicity.",
    about: "Reviews how nanotechnology reaches industry and consumer products, how surface, thermal and electronic properties scale with size (quantum confinement and density of states), the instruments used to study nanomaterials, the synthesis and characterisation of selected nanomaterials through case studies, and nanoparticle toxicity.",
    texts: ["Hornyak et al., Introduction to Nanoscience and Nanotechnology", "Poole & Owens, Introduction to Nanotechnology", "Klabunde & Richards, Nanoscale Materials in Chemistry"],
    sections: {
      "Nanomaterials and Nanosynthesis": { hours: "30 L", summary: "Making, measuring and applying nanomaterials.", topics: ["Nanotechnology today", "Scaling laws", "Quantum confinement", "Nanometrology", "Nanoparticle synthesis", "Nanotoxicity"] },
    },
  },
  CHE4413: {
    type: "Compulsory",
    tagline: "Instrument design, surface analysis, advanced electroanalysis and modern separations.",
    about: "Spectroscopic Instrumentation covers optical components, signal-to-noise, errors and detection limits, plasma, arc and spark emission, atomic fluorescence, and IR and luminescence methods. Surface Analytical Techniques covers XPS, UPS, Auger, LEED, Rutherford backscattering and X-ray microscopy. Advanced Electroanalysis covers pulse techniques, gas and biosensors and spectroelectrochemistry. Advanced Separations covers HPLC, size-exclusion, supercritical-fluid and affinity chromatography and capillary electrophoresis.",
    texts: ["Skoog, Holler & Crouch, Principles of Instrumental Analysis", "Bard & Faulkner, Electrochemical Methods"],
    sections: {
      "Spectroscopic Instrumentation and Spectrochemical Analysis": { hours: "10 L", summary: "How spectrometers are built and how to get reliable numbers from them.", topics: ["Sources and transducers", "Signal-to-noise", "Detection limits", "Plasma, arc, spark emission", "Atomic fluorescence", "IR and luminescence"] },
      "Surface Analytical Techniques": { hours: "7 L", summary: "Probing the top few nanometres of a material.", topics: ["XPS", "UPS", "Auger spectroscopy", "EELS", "LEED", "Rutherford backscattering"] },
      "Advanced Electroanalytical Techniques": { hours: "6 L", summary: "Modern electrochemical measurement and sensing.", topics: ["Pulse techniques", "Gas sensors", "Biosensors", "Spectroelectrochemistry"] },
      "Advanced Separation Techniques": { hours: "7 L", summary: "High-performance separations and how to troubleshoot them.", topics: ["Capacity and selectivity", "HPLC", "Size exclusion", "Supercritical fluid", "Affinity chromatography", "Capillary electrophoresis"] },
    },
  },
  CHE4512: {
    type: "Compulsory",
    tagline: "Bioanalysis, toxicology, free radicals, metals in biology and food chemistry.",
    about: "Bioanalytical Chemistry covers centrifugation and chromatography, the physical chemistry of macromolecules, capillary electrophoresis, MEKC and biosensors. Toxicology and reactive species cover natural toxins, pollutants, drugs, xenobiotic metabolism, reactive oxygen species, lipid peroxidation and free-radical disease. Bioinorganic Chemistry covers metalloproteins — cytochromes, iron–sulfur proteins, molybdoenzymes, Zn and Cu enzymes, oxygen carriers, nitrogen fixation and iron metabolism. The notes also include a food analysis and preservation unit.",
    texts: ["Lippard & Berg, Principles of Bioinorganic Chemistry", "Lehninger, Principles of Biochemistry", "Fenton, Biocoordination Chemistry"],
    sections: {
      "Bioanalytical Chemistry": { hours: "8 L", summary: "Separating and measuring biomolecules.", topics: ["Centrifugation", "Chromatography of biomolecules", "Macromolecule conformation", "Donnan equilibrium", "Capillary electrophoresis", "MEKC", "Biosensors"] },
      "Toxicology": { hours: "5 L", summary: "How chemicals harm living systems.", topics: ["Natural toxins", "Environmental pollutants", "Drug abuse", "Xenobiotic metabolism", "Dose and response"] },
      "Reactive Oxygen Species": { hours: "5 L", summary: "Free radicals in biology and disease.", topics: ["Reactive oxygen species", "Lipid peroxidation", "Free-radical reactions", "Radical-linked disease", "Antioxidants"] },
      "Bioinorganic Chemistry": { hours: "12 L", summary: "The roles of metal ions in proteins and enzymes.", topics: ["Metals in biology", "Cytochromes", "Iron–sulfur proteins", "Molybdoenzymes", "Zn and Cu enzymes", "Oxygen carriers, heme", "Nitrogen fixation", "Iron metabolism"] },
      "Food Chemistry": { hours: "", summary: "Food analysis methods and the chemistry of food preservation.", topics: ["Food analysis", "Food preservation"] },
    },
  },
  CHE4921: {
    type: "Compulsory",
    tagline: "A capstone review of the whole degree, with guest lectures and recent research.",
    about: "Reviews concepts and theories from across the degree through lectures, laboratory sessions, guest lectures, seminars, industrial exposure and research presentations. The past papers are the main resource here; the journals and magazines in Resources help with recent developments.",
    texts: ["Textbooks used during the degree programme"],
    sections: {
      "Review and Recent Developments": { hours: "", summary: "Revision across all streams. The folder holds past papers only, so the references point to outside sources.", topics: ["Revision across streams", "Guest lectures", "Industrial exposure", "Research presentations"] },
    },
  },
};

// Courses whose folders hold papers only: the handbook sections above replace
// the placeholder "Syllabus topics" section, and these refs move to them.
export const PLACEHOLDER_REFS = {
  CHE3292: ["Advanced Organic Laboratory"],
  CHE3512: ["Enzymology", "Metabolic Pathways and Control"],
  CHE4132: ["Advanced Materials"],
  CHE4921: ["Review and Recent Developments"],
};

export const STREAMS = {
  gen: { name: "General", color: "#dcdfff", blurb: "Foundations shared by every branch: atoms, bonding, energy and rates." },
  inorg: { name: "Inorganic", color: "#cbff2e", blurb: "Elements, coordination complexes, solids, symmetry and nuclear chemistry." },
  org: { name: "Organic", color: "#ff7ad9", blurb: "Carbon compounds: mechanisms, synthesis, stereochemistry and spectroscopy." },
  phys: { name: "Physical", color: "#5ee7ff", blurb: "Quantum mechanics, spectroscopy, thermodynamics, kinetics and surfaces." },
  anal: { name: "Analytical", color: "#ffb547", blurb: "Measuring chemistry: statistics, spectrometry, separations and electroanalysis." },
  bio: { name: "Biological", color: "#7dffb2", blurb: "Enzymes, metabolism, bioanalysis, toxicology and bioinorganic chemistry." },
  ind: { name: "Industrial", color: "#ff8f6b", blurb: "Metallurgy, petroleum, polymers and the engineering of chemical plants." },
  comp: { name: "Computational", color: "#ad7dff", blurb: "Electronics, data, molecular mechanics and quantum-chemical modelling." },
  lab: { name: "Laboratory", color: "#9aa3d9", blurb: "Practical courses: technique, safety, analysis and instrumentation." },
};

export const LEVELS = {
  1000: { name: "1000 Level", sub: "Foundations", blurb: "First-year core: atomic structure, bonding, thermodynamics, kinetics and stereochemistry, with two practical courses. Built from the handbook syllabus and open textbooks." },
  2000: { name: "2000 Level", sub: "Core chemistry", blurb: "The four branches in depth: periodic trends and coordination chemistry, organometallics, reaction mechanisms, spectroscopy, quantum mechanics and electrochemistry." },
  3000: { name: "3000 Level", sub: "Advanced core", blurb: "Group theory, ligand fields, pericyclic reactions, retrosynthesis, statistical thermodynamics, analytical chemistry, biochemistry and industrial chemistry." },
  4000: { name: "4000 Level", sub: "Specialisation", blurb: "Diffraction, organometallic catalysis, physical organic chemistry, electrode kinetics, surfaces and polymers, instrumental analysis and molecular modelling." },
};
