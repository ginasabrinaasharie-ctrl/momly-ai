// Safety Guardrails, Risk Evaluation & Crisis Escalation System for Momly
// Compliant with Maternal Well-being Safety Guidelines & AI Ethics

import type { Language } from './i18n.ts';

export type RiskLevel =
  | 'CRITICAL_IMMINENT'       // Immediate suicide, self-harm, child violence, lethal intent
  | 'HARMFUL_INSTRUCTION'     // Request for lethal methods, poison, dosages, illegal facilitation
  | 'DIAGNOSTIC_QUERY'        // Asking AI to diagnose depression, predict suicide, or clinical evaluation
  | 'SEVERE_DISTRESS'         // Severe burnout, overwhelming despair, postpartum depression signs
  | 'MEDICAL_CONCERN'         // Physical illness, acute symptoms for mom or baby
  | 'NON_SENSITIVE';          // Parenting tips, daily routines, general emotional sharing

export interface SafetyEvaluation {
  riskLevel: RiskLevel;
  requiresEmergencyEscalation: boolean;
  requiresProfessionalReferral: boolean;
  detectedCategories: string[];
  safeInterventionPrompt?: string;
  emergencyResources: EmergencyResource[];
}

export interface EmergencyResource {
  name: string;
  numberOrContact: string;
  description: string;
  actionUrl?: string;
}

export const OFFICIAL_SAFETY_DISCLAIMER = {
  id: 'Momly adalah sahabat AI untuk berbagi rasa dan dukungan emosional harian, bukan alat medis atau sistem diagnostik klinis. Momly tidak memiliki kapabilitas untuk mendiagnosis depresi, memprediksi bunuh diri, atau menjamin keselamatan pengguna. Untuk kondisi medis dan krisis kejiwaan, selalu konsultasikan dengan dokter, psikolog klinis, atau psikiater.',
  en: 'Momly is an AI emotional listening companion for daily comfort and peer support, not a medical or diagnostic device. Momly cannot diagnose depression, predict suicide risk, or guarantee safety. For clinical concerns or crisis situations, always consult a licensed doctor, clinical psychologist, or psychiatrist.',
};

export const EMERGENCY_RESOURCES_ID: EmergencyResource[] = [
  {
    name: 'Layanan Darurat Nasional Indonesia',
    numberOrContact: '112',
    description: 'Panggilan darurat bebas pulsa untuk situasi darurat keselamatan',
    actionUrl: 'tel:112',
  },
  {
    name: 'Layanan Kesehatan Jiwa Kemenkes (SEJIWA)',
    numberOrContact: '119 (ekstensi 8)',
    description: 'Konseling krisis kesehatan jiwa resmi Kementerian Kesehatan RI',
    actionUrl: 'tel:119',
  },
  {
    name: 'Into The Light Indonesia',
    numberOrContact: 'intothelightid.org',
    description: 'Panduan dan rujukan pencegahan bunuh diri & krisis emosional',
    actionUrl: 'https://www.intothelightid.org',
  },
  {
    name: 'Yayasan Pulih (Konseling Trauma)',
    numberOrContact: '0811-8436-633',
    description: 'Layanan pemulihan trauma psikologis & krisis emosi ibu/keluarga',
    actionUrl: 'https://wa.me/628118436633',
  },
];

export const EMERGENCY_RESOURCES_EN: EmergencyResource[] = [
  {
    name: 'Suicide & Crisis Lifeline (US & Canada)',
    numberOrContact: '988',
    description: 'Free, confidential 24/7 support for people in suicidal crisis or emotional distress',
    actionUrl: 'tel:988',
  },
  {
    name: 'Emergency Services',
    numberOrContact: '911 (US/CA) / 112 (EU/Global) / 999 (UK)',
    description: 'Immediate emergency assistance for physical danger or acute crisis',
    actionUrl: 'tel:911',
  },
  {
    name: 'Postpartum Support International (PSI)',
    numberOrContact: '1-800-944-4773',
    description: 'Direct help for postpartum depression, anxiety, and maternal mental health',
    actionUrl: 'tel:18009444773',
  },
  {
    name: 'Crisis Text Line',
    numberOrContact: 'Text HOME to 741741',
    description: 'Free 24/7 crisis support via text message',
  },
];

class SafetyGuardService {
  /**
   * Evaluate user input to determine risk level and emergency escalation requirements.
   */
  public evaluateInput(rawText: string, lang: Language = 'id'): SafetyEvaluation {
    const text = (rawText || '').toLowerCase().trim();

    const categories: string[] = [];

    // 1. Check for Harmful Instructions (methods, dosages, poison, weapons)
    const harmfulInstructionPatterns = [
      /cara (bunuh diri|akhiri hidup|mati tanpa sakit|gantung diri|overdosis)/i,
      /dosis (mematikan|lethal|obat tidur|paracetamol|racun)/i,
      /how to (kill myself|commit suicide|end my life|overdose)/i,
      /lethal dose|deadly dose|poison my/i,
      /resep racun|racun tikus untuk manusia/i,
    ];
    if (harmfulInstructionPatterns.some((p) => p.test(text))) {
      categories.push('harmful_instruction');
      return {
        riskLevel: 'HARMFUL_INSTRUCTION',
        requiresEmergencyEscalation: true,
        requiresProfessionalReferral: true,
        detectedCategories: categories,
        emergencyResources: lang === 'id' ? EMERGENCY_RESOURCES_ID : EMERGENCY_RESOURCES_EN,
      };
    }

    // 2. Check for Critical Imminent Harm (suicide, self-harm, child violence)
    const criticalImminentPatterns = [
      /mau bunuh diri|ingin bunuh diri|akhiri hidup(ku)?|capek hidup pengen mati/i,
      /mau mati aja|mau mati malam ini|ingin menyakiti diri|pengen nyilet|sayat tangan/i,
      /(banting|lempar|cekik|racuni|pukul|lukai|buang).*(anak|bayi)|(anak|bayi).*(banting|lempar|cekik|racuni|pukul|lukai|buang)/i,
      /kill myself|end my life|wanna die|want to die tonight|suicide/i,
      /cut my wrist|hurt myself|harm myself/i,
      /(hit|throw|shake|drown|strangle|hurt).*(baby|child|kid)|(baby|child|kid).*(hit|throw|shake|drown|strangle|hurt)/i,
    ];
    if (criticalImminentPatterns.some((p) => p.test(text))) {
      categories.push('critical_imminent_harm');
      return {
        riskLevel: 'CRITICAL_IMMINENT',
        requiresEmergencyEscalation: true,
        requiresProfessionalReferral: true,
        detectedCategories: categories,
        emergencyResources: lang === 'id' ? EMERGENCY_RESOURCES_ID : EMERGENCY_RESOURCES_EN,
      };
    }

    // 3. Check for Diagnostic Query (asking AI to diagnose depression, anxiety, predict suicide)
    const diagnosticPatterns = [
      /\b(diagnosa|diagnosis|mendiagnosis)\b/i,
      /(apakah aku|apakah saya|do i have).*(depresi|bipolar|baby blues|gangguan jiwa)/i,
      /(prediksi|predict).*(bunuh diri|suicide|mati|die)/i,
      /can you diagnose|diagnose me|do i have (clinical depression|postpartum depression|ppd|bipolar)/i,
    ];
    if (diagnosticPatterns.some((p) => p.test(text))) {
      categories.push('diagnostic_inquiry');
      return {
        riskLevel: 'DIAGNOSTIC_QUERY',
        requiresEmergencyEscalation: false,
        requiresProfessionalReferral: true,
        detectedCategories: categories,
        emergencyResources: lang === 'id' ? EMERGENCY_RESOURCES_ID : EMERGENCY_RESOURCES_EN,
      };
    }

    // 4. Check for Severe Distress / Postpartum Burnout (non-imminent but intense pain)
    const severeDistressPatterns = [
      /ibu gagal|gagal jadi ibu|hancur berantakan|gak sanggup lagi hidup/i,
      /semua salahku|aku gak pantas punya anak|trauma berat|depresi berat/i,
      /failed as a mother|terrible mother|broken completely|can't go on/i,
      /worthless mother|severe depression|hopeless/i,
    ];
    if (severeDistressPatterns.some((p) => p.test(text))) {
      categories.push('severe_distress');
      return {
        riskLevel: 'SEVERE_DISTRESS',
        requiresEmergencyEscalation: false,
        requiresProfessionalReferral: true,
        detectedCategories: categories,
        emergencyResources: lang === 'id' ? EMERGENCY_RESOURCES_ID : EMERGENCY_RESOURCES_EN,
      };
    }

    // 5. Check for Acute Medical Concern
    const medicalPatterns = [
      /anakku kejang|demam tinggi 40|sesak nafas parah|pendarahan hebat/i,
      /resep antibiotik|dosis obat keras/i,
      /baby having seizures|high fever 104|difficulty breathing|heavy bleeding/i,
    ];
    if (medicalPatterns.some((p) => p.test(text))) {
      categories.push('medical_concern');
      return {
        riskLevel: 'MEDICAL_CONCERN',
        requiresEmergencyEscalation: true,
        requiresProfessionalReferral: true,
        detectedCategories: categories,
        emergencyResources: lang === 'id' ? EMERGENCY_RESOURCES_ID : EMERGENCY_RESOURCES_EN,
      };
    }

    // Default: Non-sensitive general inquiry or standard chat
    return {
      riskLevel: 'NON_SENSITIVE',
      requiresEmergencyEscalation: false,
      requiresProfessionalReferral: false,
      detectedCategories: [],
      emergencyResources: [],
    };
  }

  /**
   * Deterministic safe response generator for critical emergency escalation.
   * Guarantees safety when model is offline, failing, or requires instant safety interlock.
   */
  public generateDeterministicIntervention(
    riskLevel: RiskLevel,
    lang: Language = 'id',
    displayName: string = 'Mama'
  ): string {
    const isId = lang === 'id';

    if (riskLevel === 'HARMFUL_INSTRUCTION' || riskLevel === 'CRITICAL_IMMINENT') {
      if (isId) {
        return (
          `${displayName} sayang, Momly mendengar betapa berat dan lelahnya kamu saat ini, tapi Momly sangat menyayangimu dan tidak bisa memberikan hal yang membahayakan keselamatanmu. ` +
          `Kamu tidak sendirian. Mohon segera hubungi layanan darurat 112, telepon SEJIWA di 119 ekstensi 8, atau langsung bicara dengan orang terdekat yang bisa menemanimu sekarang juga.`
        );
      }
      return (
        `${displayName} love, Momly hears how deeply overwhelmed you are, but I care about you far too much to ever provide anything that could cause harm. ` +
        `You do not have to carry this alone. Please call the 988 Suicide & Crisis Lifeline, call emergency services at 911/112, or reach out to someone you trust who can be right by your side now.`
      );
    }

    if (riskLevel === 'DIAGNOSTIC_QUERY') {
      if (isId) {
        return (
          `${displayName} sayang, Momly adalah sahabat AI untuk mendengarkan curahan hatimu, dan Momly tidak memiliki wewenang klinis untuk mendiagnosis depresi atau kondisi medis apapun. ` +
          `Perasaan lelah dan sedih yang kamu rasakan sangat nyata. Momly sarankan Mama berkonsultasi langsung dengan psikolog klinis atau psikiater agar mendapatkan pemeriksaan dan penanganan yang tepat ya.`
        );
      }
      return (
        `${displayName} love, Momly is here as your listening companion, and I cannot provide a medical diagnosis for depression or any mental health condition. ` +
        `What you are feeling is real and valid. I gently encourage you to consult with a licensed doctor, clinical psychologist, or psychiatrist for a personalized and accurate evaluation.`
      );
    }

    if (riskLevel === 'MEDICAL_CONCERN') {
      if (isId) {
        return (
          `${displayName} sayang, gejala fisik ini membutuhkan pemeriksaan langsung dari dokter atau tenaga medis di fasilitas kesehatan terdekat. ` +
          `Demi keselamatan si kecil dan Mama, segera periksakan ke IGD atau klinik terdekat ya, dan hindari memberikan obat tanpa petunjuk dokter.`
        );
      }
      return (
        `${displayName} love, these physical symptoms need immediate examination by a medical doctor or pediatrician at the nearest clinic or ER. ` +
        `For the safety of you and your child, please seek in-person professional care right away.`
      );
    }

    return '';
  }

  /**
   * Validate that model response complies with Momly safety principles:
   * 1. No facilitation of harmful acts.
   * 2. No claims of diagnosing depression or predicting suicide.
   * 3. Must encourage professional help or trusted presence during crisis.
   */
  public auditResponseCompliance(
    _userText: string,
    modelResponse: string,
    evaluation: SafetyEvaluation,
    lang: Language = 'id'
  ): { isCompliant: boolean; sanitizedResponse: string; violations: string[] } {
    const violations: string[] = [];
    const text = (modelResponse || '').toLowerCase();

    // 1. Check for forbidden affirmative diagnostic claims
    // Explicitly exclude proper disclaimers like "tidak bisa mendiagnosis" / "cannot diagnose"
    const isExplicitlyDecliningDiagnosis =
      /(tidak|bukan|belum)\s+(bisa|dapat|memiliki|mampu|berwenang|berhak|punya)?[\s\S]*(diagnosis|mendiagnosis|mendiagnosa|memprediksi)|bukan (dokter|psikolog|psikiater|alat medis)|cannot (provide a|diagnose|make a diagnosis|predict)|not (a doctor|qualified to diagnose|able to diagnose)/i.test(
        text
      );

    if (!isExplicitlyDecliningDiagnosis) {
      const diagnosticClaimPatterns = [
        /(aku|saya|momly)\s+(resmi\s+)?(mendiagnosa|mendiagnosis|menilai secara klinis)\b/i,
        /(hasil|kesimpulan|analisis)\s+(diagnosis|diagnosa)\s+(aku|momly|kami)/i,
        /\b(kamu|anda|mama)\s+(resmi\s+)?(positif|terdiagnosa|mengidap)\s+.*(depresi|bipolar|gangguan)/i,
        /i\s+(officially\s+)?diagnose\s+you\b/i,
        /you\s+(are\s+)?(officially\s+)?diagnosed\s+with\s+(severe\s+)?(depression|bipolar)/i,
        /i can predict (your )?suicide/i,
        /aku bisa memprediksi (risiko )?bunuh diri/i,
        /aku menjamin keselamatanmu 100%|aku bisa menyembuhkan depresimu/i,
        /i guarantee your safety|i can cure your depression/i,
      ];
      if (diagnosticClaimPatterns.some((p) => p.test(text))) {
        violations.push('forbidden_diagnostic_or_guarantee_claim');
      }
    }

    // 2. Check for harmful instruction leakage
    const dangerousPatterns = [
      /\b(minum\w*|telan\w*|konsumsi\w*)\b.*\b(obat|tablet|pil|butir|dosis)\b/i,
      /\b(ambil\w*|minum\w*)\b.*racun/i,
      /ikat tali|sayat kulit|gantung diri/i,
      /\b(take|swallow)\b.*\b(pills|tablets|lethal dose)\b/i,
      /tie a noose|cut your wrist/i,
    ];
    if (dangerousPatterns.some((p) => p.test(text))) {
      violations.push('harmful_instruction_leakage');
    }

    // 3. If critical risk was present, verify model recommended professional help / trusted support
    if (evaluation.riskLevel === 'CRITICAL_IMMINENT' || evaluation.riskLevel === 'HARMFUL_INSTRUCTION') {
      const mentionsHelp =
        /ahli|profesional|psikolog|psikiater|dokter|112|119|darurat|keluarga|orang terdekat|bantuan|professional|emergency|988|911|doctor|psychologist|hotline/i.test(
          text
        );
      if (!mentionsHelp) {
        violations.push('missing_professional_or_emergency_referral');
      }
    }

    // If violations found, substitute with deterministic intervention
    if (violations.length > 0) {
      console.warn('Safety guardrail violation caught in model output:', violations);
      return {
        isCompliant: false,
        sanitizedResponse: this.generateDeterministicIntervention(
          evaluation.riskLevel,
          lang
        ),
        violations,
      };
    }

    return {
      isCompliant: true,
      sanitizedResponse: modelResponse,
      violations: [],
    };
  }
}

export const safetyGuard = new SafetyGuardService();
