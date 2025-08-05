class MedicalTerminologyService {
  constructor() {
    this.terminologyCache = new Map();
    this.suggestionCache = new Map();
    this.validationRules = new Map();
    this.customTerms = new Map();
    this.synonymDatabase = new Map();
    this.abbreviationDatabase = new Map();
    
    this.initializeMedicalTerminology();
    this.initializeValidationRules();
    this.initializeSynonyms();
    this.initializeAbbreviations();
  }

  initializeMedicalTerminology() {
    // Common medical conditions
    const conditions = [
      'Hypertension', 'Diabetes Mellitus', 'Myocardial Infarction', 'Stroke', 'COPD',
      'Pneumonia', 'Congestive Heart Failure', 'Atrial Fibrillation', 'Depression',
      'Anxiety Disorder', 'Dementia', 'Alzheimer Disease', 'Parkinson Disease',
      'Rheumatoid Arthritis', 'Osteoarthritis', 'Chronic Kidney Disease',
      'End Stage Renal Disease', 'Coronary Artery Disease', 'Peripheral Artery Disease',
      'Deep Vein Thrombosis', 'Pulmonary Embolism', 'Sepsis', 'Urinary Tract Infection',
      'Cellulitis', 'Pressure Ulcer', 'Falls Risk', 'Malnutrition', 'Dehydration'
    ];

    // Common medications
    const medications = [
      'Lisinopril', 'Metformin', 'Atorvastatin', 'Metoprolol', 'Amlodipine',
      'Omeprazole', 'Simvastatin', 'Losartan', 'Furosemide', 'Warfarin',
      'Aspirin', 'Clopidogrel', 'Insulin', 'Gabapentin', 'Tramadol',
      'Hydrocodone', 'Morphine', 'Oxycodone', 'Sertraline', 'Escitalopram',
      'Donepezil', 'Memantine', 'Levodopa', 'Prednisone', 'Albuterol',
      'Levothyroxine', 'Digoxin', 'Diltiazem', 'Carvedilol', 'Spironolactone'
    ];

    // Medical procedures
    const procedures = [
      'Blood Pressure Check', 'Blood Glucose Monitoring', 'Wound Care',
      'Medication Administration', 'Vital Signs Assessment', 'Physical Assessment',
      'Fall Risk Assessment', 'Pain Assessment', 'Skin Assessment',
      'Catheter Care', 'Ostomy Care', 'Tube Feeding', 'Oxygen Therapy',
      'Physical Therapy', 'Occupational Therapy', 'Speech Therapy',
      'Range of Motion Exercises', 'Ambulation Assistance', 'Transfer Assistance',
      'Bathing Assistance', 'Dressing Assistance', 'Toileting Assistance'
    ];

    // Medical specialties
    const specialties = [
      'Cardiology', 'Endocrinology', 'Neurology', 'Psychiatry', 'Orthopedics',
      'Pulmonology', 'Nephrology', 'Gastroenterology', 'Dermatology', 'Urology',
      'Oncology', 'Hematology', 'Rheumatology', 'Infectious Disease',
      'General Surgery', 'Internal Medicine', 'Family Medicine', 'Geriatrics',
      'Palliative Care', 'Emergency Medicine', 'Radiology', 'Pathology'
    ];

    // Body systems
    const bodySystems = [
      'Cardiovascular', 'Respiratory', 'Neurological', 'Musculoskeletal',
      'Gastrointestinal', 'Genitourinary', 'Integumentary', 'Endocrine',
      'Hematologic', 'Immune', 'Reproductive', 'Sensory'
    ];

    // Store in terminology cache with categories
    this.terminologyCache.set('conditions', conditions);
    this.terminologyCache.set('medications', medications);
    this.terminologyCache.set('procedures', procedures);
    this.terminologyCache.set('specialties', specialties);
    this.terminologyCache.set('body_systems', bodySystems);

    // Create searchable index
    this.createSearchIndex();
  }

  createSearchIndex() {
    this.searchIndex = new Map();
    
    for (const [category, terms] of this.terminologyCache.entries()) {
      terms.forEach(term => {
        const normalizedTerm = term.toLowerCase();
        
        // Index full term
        if (!this.searchIndex.has(normalizedTerm)) {
          this.searchIndex.set(normalizedTerm, []);
        }
        this.searchIndex.get(normalizedTerm).push({ term, category });

        // Index words within term for partial matching
        const words = normalizedTerm.split(/\s+/);
        words.forEach(word => {
          if (word.length > 2) { // Only index words longer than 2 characters
            if (!this.searchIndex.has(word)) {
              this.searchIndex.set(word, []);
            }
            this.searchIndex.get(word).push({ term, category, partial: true });
          }
        });
      });
    }
  }

  initializeValidationRules() {
    this.validationRules.set('medication_dosage', {
      pattern: /^\d+(\.\d+)?\s*(mg|mcg|g|ml|units?|iu)\s*(daily|bid|tid|qid|q\d+h|prn)?$/i,
      description: 'Medication dosage format: amount + unit + frequency',
      examples: ['10 mg daily', '5 ml bid', '100 units q8h']
    });

    this.validationRules.set('vital_signs', {
      bloodPressure: /^\d{2,3}\/\d{2,3}$/,
      heartRate: /^\d{2,3}\s*bpm?$/i,
      temperature: /^\d{2,3}(\.\d)?\s*°?[Ff]?$/,
      respiratoryRate: /^\d{1,2}\s*rr?$/i,
      oxygenSaturation: /^\d{2,3}%?\s*(on\s+\d+L\s+O2|RA)?$/i
    });

    this.validationRules.set('icd10_code', {
      pattern: /^[A-Z]\d{2}(\.\d{1,4})?$/,
      description: 'ICD-10 diagnosis code format',
      examples: ['I10', 'E11.9', 'N18.3']
    });

    this.validationRules.set('cpt_code', {
      pattern: /^\d{5}$/,
      description: 'CPT procedure code format',
      examples: ['99213', '99214', '99232']
    });
  }

  initializeSynonyms() {
    const synonymGroups = [
      ['Hypertension', 'High Blood Pressure', 'HTN'],
      ['Diabetes Mellitus', 'Diabetes', 'DM', 'Type 2 Diabetes'],
      ['Myocardial Infarction', 'Heart Attack', 'MI'],
      ['Cerebrovascular Accident', 'Stroke', 'CVA'],
      ['Chronic Obstructive Pulmonary Disease', 'COPD'],
      ['Congestive Heart Failure', 'CHF', 'Heart Failure'],
      ['Urinary Tract Infection', 'UTI', 'Bladder Infection'],
      ['Blood Pressure', 'BP'],
      ['Heart Rate', 'HR', 'Pulse'],
      ['Respiratory Rate', 'RR'],
      ['Temperature', 'Temp'],
      ['Oxygen Saturation', 'O2 Sat', 'SpO2'],
      ['Activities of Daily Living', 'ADL', 'Daily Activities'],
      ['Range of Motion', 'ROM'],
      ['Physical Therapy', 'PT'],
      ['Occupational Therapy', 'OT'],
      ['Speech Therapy', 'ST'],
      ['As Needed', 'PRN', 'Pro Re Nata'],
      ['Twice Daily', 'BID', 'Bis In Die'],
      ['Three Times Daily', 'TID', 'Ter In Die'],
      ['Four Times Daily', 'QID', 'Quater In Die']
    ];

    synonymGroups.forEach(group => {
      const primary = group[0];
      group.forEach(synonym => {
        this.synonymDatabase.set(synonym.toLowerCase(), {
          primary: primary,
          alternates: group.filter(alt => alt !== synonym)
        });
      });
    });
  }

  initializeAbbreviations() {
    const abbreviations = [
      ['HTN', 'Hypertension'],
      ['DM', 'Diabetes Mellitus'],
      ['MI', 'Myocardial Infarction'],
      ['CVA', 'Cerebrovascular Accident'],
      ['COPD', 'Chronic Obstructive Pulmonary Disease'],
      ['CHF', 'Congestive Heart Failure'],
      ['UTI', 'Urinary Tract Infection'],
      ['DVT', 'Deep Vein Thrombosis'],
      ['PE', 'Pulmonary Embolism'],
      ['CKD', 'Chronic Kidney Disease'],
      ['ESRD', 'End Stage Renal Disease'],
      ['CAD', 'Coronary Artery Disease'],
      ['PAD', 'Peripheral Artery Disease'],
      ['A-fib', 'Atrial Fibrillation'],
      ['GERD', 'Gastroesophageal Reflux Disease'],
      ['OSA', 'Obstructive Sleep Apnea'],
      ['RA', 'Rheumatoid Arthritis'],
      ['OA', 'Osteoarthritis'],
      ['BP', 'Blood Pressure'],
      ['HR', 'Heart Rate'],
      ['RR', 'Respiratory Rate'],
      ['O2', 'Oxygen'],
      ['SpO2', 'Oxygen Saturation'],
      ['PRN', 'As Needed'],
      ['BID', 'Twice Daily'],
      ['TID', 'Three Times Daily'],
      ['QID', 'Four Times Daily'],
      ['ADL', 'Activities of Daily Living'],
      ['ROM', 'Range of Motion'],
      ['PT', 'Physical Therapy'],
      ['OT', 'Occupational Therapy'],
      ['ST', 'Speech Therapy'],
      ['DNR', 'Do Not Resuscitate'],
      ['DNI', 'Do Not Intubate'],
      ['POC', 'Plan of Care'],
      ['SOC', 'Start of Care'],
      ['DC', 'Discharge'],
      ['D/C', 'Discontinue'],
      ['NPO', 'Nothing by Mouth'],
      ['PO', 'By Mouth'],
      ['IM', 'Intramuscular'],
      ['IV', 'Intravenous'],
      ['SQ', 'Subcutaneous'],
      ['MDI', 'Metered Dose Inhaler'],
      ['NEB', 'Nebulizer'],
      ['NGT', 'Nasogastric Tube'],
      ['PEG', 'Percutaneous Endoscopic Gastrostomy'],
      ['PICC', 'Peripherally Inserted Central Catheter'],
      ['CVC', 'Central Venous Catheter']
    ];

    abbreviations.forEach(([abbrev, fullForm]) => {
      this.abbreviationDatabase.set(abbrev.toLowerCase(), fullForm);
      this.abbreviationDatabase.set(fullForm.toLowerCase(), abbrev);
    });
  }

  // Main validation method
  async validateTerminology(text, context = {}) {
    try {
      const validation = {
        isValid: true,
        score: 100,
        issues: [],
        suggestions: [],
        corrections: [],
        medicalTerms: [],
        abbreviations: [],
        potentialErrors: []
      };

      // Extract and validate medical terms
      const extractedTerms = this.extractMedicalTerms(text);
      validation.medicalTerms = extractedTerms;

      // Check for misspellings and suggest corrections
      const spellCheckResults = await this.performSpellCheck(text);
      validation.corrections = spellCheckResults.corrections;
      validation.suggestions.push(...spellCheckResults.suggestions);

      // Validate abbreviations
      const abbreviationResults = this.validateAbbreviations(text);
      validation.abbreviations = abbreviationResults.found;
      validation.suggestions.push(...abbreviationResults.suggestions);

      // Check for inconsistent terminology
      const consistencyResults = this.checkTerminologyConsistency(text);
      validation.potentialErrors = consistencyResults.inconsistencies;
      validation.suggestions.push(...consistencyResults.suggestions);

      // Validate specific medical formats
      const formatResults = this.validateMedicalFormats(text);
      validation.issues.push(...formatResults.issues);
      validation.suggestions.push(...formatResults.suggestions);

      // Calculate overall score
      validation.score = this.calculateValidationScore(validation);
      validation.isValid = validation.score >= 80;

      return validation;

    } catch (error) {
      console.error('Medical terminology validation error:', error);
      throw new Error(`Validation failed: ${error.message}`);
    }
  }

  extractMedicalTerms(text) {
    const found = [];
    const words = text.toLowerCase().split(/\s+/);
    
    // Check for exact matches and partial matches
    for (const [term, entries] of this.searchIndex.entries()) {
      if (text.toLowerCase().includes(term)) {
        entries.forEach(entry => {
          if (!entry.partial || words.includes(term)) {
            found.push({
              term: entry.term,
              category: entry.category,
              position: text.toLowerCase().indexOf(term),
              confidence: entry.partial ? 0.7 : 1.0
            });
          }
        });
      }
    }

    // Remove duplicates and sort by position
    const uniqueTerms = found.reduce((acc, current) => {
      const existing = acc.find(item => 
        item.term === current.term && 
        Math.abs(item.position - current.position) < 10
      );
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, []);

    return uniqueTerms.sort((a, b) => a.position - b.position);
  }

  async performSpellCheck(text) {
    const corrections = [];
    const suggestions = [];
    
    // Simple spell checking against known medical terms
    const words = text.split(/\s+/);
    
    words.forEach((word, index) => {
      const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
      if (cleanWord.length < 3) return;

      // Check if word exists in our terminology
      const exists = this.searchIndex.has(cleanWord);
      
      if (!exists && this.isLikelyMedicalTerm(cleanWord)) {
        // Find similar terms
        const similar = this.findSimilarTerms(cleanWord);
        if (similar.length > 0) {
          corrections.push({
            original: word,
            position: index,
            suggestions: similar.slice(0, 3),
            confidence: this.calculateSimilarityScore(cleanWord, similar[0])
          });

          suggestions.push({
            type: 'spelling',
            message: `Did you mean "${similar[0]}" instead of "${word}"?`,
            severity: 'medium',
            position: index
          });
        }
      }
    });

    return { corrections, suggestions };
  }

  isLikelyMedicalTerm(word) {
    // Heuristics to identify potential medical terms
    if (word.length < 4) return false;
    
    // Common medical prefixes/suffixes
    const medicalPrefixes = ['hyper', 'hypo', 'anti', 'pre', 'post', 'sub', 'inter', 'intra'];
    const medicalSuffixes = ['itis', 'osis', 'emia', 'pathy', 'therapy', 'gram', 'scopy', 'tomy'];
    
    const hasPrefix = medicalPrefixes.some(prefix => word.startsWith(prefix));
    const hasSuffix = medicalSuffixes.some(suffix => word.endsWith(suffix));
    
    return hasPrefix || hasSuffix;
  }

  findSimilarTerms(word, maxResults = 5) {
    const similar = [];
    
    for (const [term] of this.searchIndex.entries()) {
      const similarity = this.calculateSimilarity(word, term);
      if (similarity > 0.6) {
        similar.push({ term, similarity });
      }
    }

    return similar
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults)
      .map(item => item.term);
  }

  calculateSimilarity(str1, str2) {
    // Simple Levenshtein distance-based similarity
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  calculateSimilarityScore(word1, word2) {
    return Math.round(this.calculateSimilarity(word1, word2) * 100) / 100;
  }

  validateAbbreviations(text) {
    const found = [];
    const suggestions = [];
    
    // Find abbreviations in text
    const abbreviationPattern = /\b[A-Z]{2,6}\b/g;
    let match;
    
    while ((match = abbreviationPattern.exec(text)) !== null) {
      const abbrev = match[0];
      const fullForm = this.abbreviationDatabase.get(abbrev.toLowerCase());
      
      found.push({
        abbreviation: abbrev,
        fullForm: fullForm || 'Unknown',
        position: match.index,
        isKnown: !!fullForm
      });

      if (!fullForm) {
        suggestions.push({
          type: 'abbreviation',
          message: `Unknown abbreviation "${abbrev}". Consider spelling out or adding to custom terms.`,
          severity: 'low',
          position: match.index
        });
      }
    }

    return { found, suggestions };
  }

  checkTerminologyConsistency(text) {
    const inconsistencies = [];
    const suggestions = [];

    // Check for mixed use of synonyms
    for (const [term, synonymData] of this.synonymDatabase.entries()) {
      const termRegex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const termMatches = (text.match(termRegex) || []).length;

      if (termMatches > 0) {
        // Check if other synonyms are also used
        synonymData.alternates.forEach(alternate => {
          const altRegex = new RegExp(`\\b${alternate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
          const altMatches = (text.match(altRegex) || []).length;

          if (altMatches > 0) {
            inconsistencies.push({
              primary: synonymData.primary,
              terms: [term, alternate],
              counts: { [term]: termMatches, [alternate]: altMatches }
            });

            suggestions.push({
              type: 'consistency',
              message: `Consider using consistent terminology. Found both "${term}" and "${alternate}".`,
              severity: 'low',
              recommendation: `Use "${synonymData.primary}" throughout the document.`
            });
          }
        });
      }
    }

    return { inconsistencies, suggestions };
  }

  validateMedicalFormats(text) {
    const issues = [];
    const suggestions = [];

    // Validate medication dosages
    const dosagePattern = /\d+(\.\d+)?\s*(mg|mcg|g|ml|units?|iu)/gi;
    let match;

    while ((match = dosagePattern.exec(text)) !== null) {
      const dosage = match[0];
      const rule = this.validationRules.get('medication_dosage');
      
      if (!rule.pattern.test(dosage)) {
        issues.push({
          type: 'format',
          text: dosage,
          position: match.index,
          rule: 'medication_dosage',
          message: 'Incomplete medication dosage format'
        });

        suggestions.push({
          type: 'format',
          message: `Medication dosage "${dosage}" may be incomplete. Include frequency if applicable.`,
          severity: 'medium',
          examples: rule.examples
        });
      }
    }

    // Validate vital signs formats
    const vitalPatterns = {
      bp: /\d{2,3}\/\d{2,3}/g,
      hr: /\d{2,3}\s*bpm?/gi,
      temp: /\d{2,3}(\.\d)?\s*°?[Ff]?/g
    };

    Object.entries(vitalPatterns).forEach(([vital, pattern]) => {
      const matches = text.match(pattern) || [];
      matches.forEach(vitalValue => {
        // Basic validation for reasonable ranges
        if (vital === 'bp') {
          const [systolic, diastolic] = vitalValue.split('/').map(Number);
          if (systolic < 60 || systolic > 300 || diastolic < 30 || diastolic > 200) {
            suggestions.push({
              type: 'range',
              message: `Blood pressure ${vitalValue} appears unusual. Please verify.`,
              severity: 'high'
            });
          }
        }
      });
    });

    return { issues, suggestions };
  }

  calculateValidationScore(validation) {
    let score = 100;

    // Deduct points for issues
    validation.issues.forEach(issue => {
      switch (issue.type) {
        case 'format':
          score -= 5;
          break;
        case 'spelling':
          score -= 3;
          break;
        default:
          score -= 2;
      }
    });

    // Deduct points for suggestions by severity
    validation.suggestions.forEach(suggestion => {
      switch (suggestion.severity) {
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  // Suggestion and auto-completion methods
  async getSuggestions(partialText, context = {}) {
    const cacheKey = `${partialText}_${JSON.stringify(context)}`;
    
    if (this.suggestionCache.has(cacheKey)) {
      return this.suggestionCache.get(cacheKey);
    }

    const suggestions = {
      terms: [],
      abbreviations: [],
      completions: [],
      contextual: []
    };

    const lowerPartial = partialText.toLowerCase();

    // Find matching terms
    for (const [term, entries] of this.searchIndex.entries()) {
      if (term.startsWith(lowerPartial) && term !== lowerPartial) {
        entries.forEach(entry => {
          suggestions.terms.push({
            text: entry.term,
            category: entry.category,
            confidence: 1.0 - (term.length - lowerPartial.length) / term.length
          });
        });
      }
    }

    // Find matching abbreviations
    for (const [abbrev, fullForm] of this.abbreviationDatabase.entries()) {
      if (abbrev.startsWith(lowerPartial)) {
        suggestions.abbreviations.push({
          abbreviation: abbrev.toUpperCase(),
          fullForm: fullForm,
          confidence: 1.0 - (abbrev.length - lowerPartial.length) / abbrev.length
        });
      }
    }

    // Context-based suggestions
    if (context.category) {
      const categoryTerms = this.terminologyCache.get(context.category) || [];
      categoryTerms.forEach(term => {
        if (term.toLowerCase().includes(lowerPartial)) {
          suggestions.contextual.push({
            text: term,
            category: context.category,
            reason: `Related to ${context.category}`,
            confidence: 0.8
          });
        }
      });
    }

    // Sort suggestions by confidence
    suggestions.terms.sort((a, b) => b.confidence - a.confidence);
    suggestions.abbreviations.sort((a, b) => b.confidence - a.confidence);
    suggestions.contextual.sort((a, b) => b.confidence - a.confidence);

    // Limit results
    suggestions.terms = suggestions.terms.slice(0, 10);
    suggestions.abbreviations = suggestions.abbreviations.slice(0, 5);
    suggestions.contextual = suggestions.contextual.slice(0, 8);

    // Cache results
    this.suggestionCache.set(cacheKey, suggestions);

    return suggestions;
  }

  async getAutoCompletions(text, cursorPosition) {
    const beforeCursor = text.substring(0, cursorPosition);
    const afterCursor = text.substring(cursorPosition);
    
    // Find the current word being typed
    const wordMatch = beforeCursor.match(/\b\w+$/);
    if (!wordMatch) return [];

    const currentWord = wordMatch[0];
    const suggestions = await this.getSuggestions(currentWord);
    
    return suggestions.terms.map(suggestion => ({
      text: suggestion.text,
      insertText: suggestion.text.substring(currentWord.length),
      category: suggestion.category,
      confidence: suggestion.confidence,
      description: `Medical term - ${suggestion.category}`
    }));
  }

  // Custom terms management
  addCustomTerm(term, category = 'custom', metadata = {}) {
    const customTerm = {
      term: term,
      category: category,
      addedAt: new Date(),
      addedBy: metadata.addedBy || 'system',
      validated: metadata.validated || false,
      ...metadata
    };

    this.customTerms.set(term.toLowerCase(), customTerm);
    
    // Add to search index
    const normalizedTerm = term.toLowerCase();
    if (!this.searchIndex.has(normalizedTerm)) {
      this.searchIndex.set(normalizedTerm, []);
    }
    this.searchIndex.get(normalizedTerm).push({ term, category });

    console.log(`Added custom medical term: ${term}`);
  }

  removeCustomTerm(term) {
    const normalizedTerm = term.toLowerCase();
    const removed = this.customTerms.delete(normalizedTerm);
    
    if (removed) {
      // Remove from search index
      if (this.searchIndex.has(normalizedTerm)) {
        const entries = this.searchIndex.get(normalizedTerm);
        const filteredEntries = entries.filter(entry => entry.term !== term);
        if (filteredEntries.length > 0) {
          this.searchIndex.set(normalizedTerm, filteredEntries);
        } else {
          this.searchIndex.delete(normalizedTerm);
        }
      }
      console.log(`Removed custom medical term: ${term}`);
    }
    
    return removed;
  }

  getCustomTerms() {
    return Array.from(this.customTerms.values());
  }

  // Batch processing methods
  async validateDocument(document) {
    const results = {
      documentId: document.id,
      validatedAt: new Date(),
      overallScore: 0,
      sectionsValidated: [],
      summary: {
        totalIssues: 0,
        criticalIssues: 0,
        suggestions: 0,
        medicalTermsFound: 0
      }
    };

    // Validate different sections if document is structured
    if (document.sections) {
      for (const section of document.sections) {
        const sectionResult = await this.validateTerminology(section.content, {
          section: section.name,
          documentType: document.type
        });
        
        results.sectionsValidated.push({
          sectionName: section.name,
          ...sectionResult
        });
      }
    } else {
      // Validate entire document content
      const validation = await this.validateTerminology(document.content, {
        documentType: document.type
      });
      results.sectionsValidated.push({
        sectionName: 'document',
        ...validation
      });
    }

    // Calculate overall metrics
    results.overallScore = results.sectionsValidated.reduce((sum, section) => 
      sum + section.score, 0) / results.sectionsValidated.length;

    results.summary.totalIssues = results.sectionsValidated.reduce((sum, section) => 
      sum + section.issues.length, 0);

    results.summary.criticalIssues = results.sectionsValidated.reduce((sum, section) => 
      sum + section.suggestions.filter(s => s.severity === 'high').length, 0);

    results.summary.suggestions = results.sectionsValidated.reduce((sum, section) => 
      sum + section.suggestions.length, 0);

    results.summary.medicalTermsFound = results.sectionsValidated.reduce((sum, section) => 
      sum + section.medicalTerms.length, 0);

    return results;
  }

  // Utility methods
  expandAbbreviation(abbreviation) {
    return this.abbreviationDatabase.get(abbreviation.toLowerCase()) || null;
  }

  findSynonyms(term) {
    const synonymData = this.synonymDatabase.get(term.toLowerCase());
    return synonymData ? synonymData.alternates : [];
  }

  getTermsByCategory(category) {
    return this.terminologyCache.get(category) || [];
  }

  getAvailableCategories() {
    return Array.from(this.terminologyCache.keys());
  }

  clearCache() {
    this.suggestionCache.clear();
    console.log('Medical terminology cache cleared');
  }

  getCacheStats() {
    return {
      terminologyTerms: Array.from(this.terminologyCache.values()).reduce((sum, terms) => sum + terms.length, 0),
      searchIndexSize: this.searchIndex.size,
      customTerms: this.customTerms.size,
      cachedSuggestions: this.suggestionCache.size,
      synonymGroups: this.synonymDatabase.size,
      abbreviations: this.abbreviationDatabase.size
    };
  }

  // Export/Import functionality
  exportCustomTerms() {
    return {
      exportedAt: new Date(),
      version: '1.0',
      terms: Array.from(this.customTerms.entries()).map(([key, value]) => ({
        term: key,
        ...value
      }))
    };
  }

  importCustomTerms(exportData) {
    if (!exportData.terms || !Array.isArray(exportData.terms)) {
      throw new Error('Invalid export data format');
    }

    let imported = 0;
    exportData.terms.forEach(termData => {
      try {
        this.addCustomTerm(termData.term, termData.category, {
          ...termData,
          importedAt: new Date()
        });
        imported++;
      } catch (error) {
        console.error(`Failed to import term: ${termData.term}`, error);
      }
    });

    console.log(`Imported ${imported} custom medical terms`);
    return imported;
  }
}

module.exports = new MedicalTerminologyService();