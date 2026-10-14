export type Language = 'en' | 'id';

export interface Translations {
  appName: string;
  tagline: string;
  heroHeadline: string;
  heroHeadlineHighlight: string;
  heroSubheadline: string;
  callButtonLabel: string;
  callButtonSubtext: string;
  callBannerTitle: string;
  callBannerSubtitle: string;
  callBannerAction: string;
  moodCheckInTitle: string;
  moodCheckInSubtitle: string;
  moodBadge: string;
  momlyWhisper: string;
  moods: {
    id: string;
    emoji: string;
    label: string;
    subtitle: string;
    note: string;
  }[];
  callScreen: {
    connecting: string;
    listening: string;
    thinking: string;
    speaking: string;
    tapToTalk: string;
    hideCaptions: string;
    showCaptions: string;
    mute: string;
    unmute: string;
    endCall: string;
    speakerOn: string;
    speakerOff: string;
    substatus: string;
  };
  loveLetter: {
    badge: string;
    headlineDefault: string;
    messageDefault: string;
    tagDefault: string;
    tipsTitle: string;
    buttonClose: string;
    reflectionTagLabel: string;
    generatingMessage: string;
  };
  journal: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyDesc: string;
    reminderTitle: string;
    clearAll: string;
    close: string;
  };
  breathing: {
    title: string;
    subtitle: string;
    inhaleText: string;
    inhaleSub: string;
    holdText: string;
    holdSub: string;
    exhaleText: string;
    exhaleSub: string;
    finishedText: string;
    finishedSub: string;
    congratsTitle: string;
    repeat: string;
    done: string;
    quote: string;
  };
  bottomNav: {
    home: string;
    breathe: string;
    journal: string;
  };
  languageModal: {
    title: string;
    subtitle: string;
    chooseEn: string;
    chooseId: string;
    confirm: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'Momly',
    tagline: 'Your AI bestie, always here',
    heroHeadline: 'Your AI bestie,',
    heroHeadlineHighlight: 'always here.',
    heroSubheadline:
      'Feeling exhausted or overwhelmed? Need a friend who listens without judgment? Tap to call Momly anytime.',
    callButtonLabel: 'Tap to Call Momly',
    callButtonSubtext: '100% Spoken Voice • Zero Judgment • Free Sanctuary',
    callBannerTitle: 'Feeling chest tightness or panic?',
    callBannerSubtitle: 'Take a gentle pause with our 30-second guided breathing.',
    callBannerAction: 'Start Breathing',
    moodCheckInTitle: 'How are you feeling right now, Mama?',
    moodCheckInSubtitle:
      'Tap an emotion below so Momly understands your heart before you even start talking.',
    moodBadge: 'Daily Check-in',
    momlyWhisper: "Momly's Whisper:",
    moods: [
      {
        id: 'exhausted',
        emoji: '🥱',
        label: 'Exhausted',
        subtitle: 'Sleep-deprived & worn out',
        note: 'Breathe softly, Mama. You carried so much today. Momly is right here to keep you company.',
      },
      {
        id: 'anxious',
        emoji: '🥺',
        label: 'Anxious',
        subtitle: 'Racing thoughts & restless heart',
        note: "Your feelings are valid, but you don't have to carry the whole world on your shoulders alone.",
      },
      {
        id: 'crying',
        emoji: '😭',
        label: 'Crying',
        subtitle: 'Heavy chest, need to let go',
        note: "Cry as much as you need, Mama. You don't need to explain. Momly is holding space for you.",
      },
      {
        id: 'numb',
        emoji: '🫥',
        label: 'Numb',
        subtitle: 'Drained of all energy',
        note: "You are not failing. Your soul is just out of battery. Big warm hug from across the screen.",
      },
      {
        id: 'need_friend',
        emoji: '🌿',
        label: 'Need Friend',
        subtitle: 'Want to talk casually',
        note: "So happy you came by! Tell Momly anything—I'm here like your trusted bestie.",
      },
    ],
    callScreen: {
      connecting: 'Connecting with Momly...',
      listening: 'Momly is listening to your voice...',
      thinking: 'Momly is taking in your feelings...',
      speaking: 'Momly is speaking softly...',
      tapToTalk: 'Speak freely Mama, no judgment here...',
      hideCaptions: 'Hide Subtitles',
      showCaptions: 'Show Subtitles',
      mute: 'Mute Mic',
      unmute: 'Unmute Mic',
      endCall: 'End Call',
      speakerOn: 'Speaker Muted',
      speakerOff: 'Speaker On',
      substatus: 'Encrypted Voice Sanctuary',
    },
    loveLetter: {
      badge: "Love Letter from Momly",
      headlineDefault: 'Mama, You Are Doing Wonderfully 🌸',
      messageDefault:
        'Thank you for taking a moment to breathe and share your heart. Your exhaustion is valid, and you are not alone.',
      tagDefault: 'Heard & Relieved',
      tipsTitle: 'Gentle Reminders for Your Heart Today:',
      buttonClose: 'Thank You Momly, I Feel Lighter 🌸',
      reflectionTagLabel: 'Emotional Reflection:',
      generatingMessage: 'Momly is writing a personalized Love Letter for you...',
    },
    journal: {
      title: 'Heart Journal & Memory',
      subtitle: 'Momly remembers your journey so conversations stay warm and continuous.',
      emptyTitle: 'No Entries Yet',
      emptyDesc: 'After each call with Momly, your gentle reflections and love letters will be saved here.',
      reminderTitle: 'Gentle Reminders:',
      clearAll: 'Clear All Entries',
      close: 'Close',
    },
    breathing: {
      title: 'Breathing Together',
      subtitle: '30-Second Guided Calming Breath with Momly',
      inhaleText: 'Inhale gently through your nose...',
      inhaleSub: 'Feel the cool air filling your chest',
      holdText: 'Hold softly and rest...',
      holdSub: 'Allow your body to feel this stillness',
      exhaleText: 'Exhale slowly through your lips...',
      exhaleSub: 'Release the heavy tension from your day',
      finishedText: 'Breathe naturally now.',
      finishedSub: 'Your mind and body are grounded',
      congratsTitle:
        '🌸 Wonderful, Mama. Your heart rate is slowing down and your nervous system is calming.',
      repeat: 'Repeat Again',
      done: "I'm Ready",
      quote: '"Sometimes all we need is to pause, breathe, and remember we are okay."',
    },
    bottomNav: {
      home: 'Companion',
      breathe: 'Breathe',
      journal: 'Journal',
    },
    languageModal: {
      title: 'Choose Your Language',
      subtitle: 'How would you like Momly to speak with you?',
      chooseEn: 'English (Default)',
      chooseId: 'Bahasa Indonesia',
      confirm: 'Continue with Momly',
    },
  },
  id: {
    appName: 'Momly',
    tagline: 'Your AI bestie, always here',
    heroHeadline: 'Sahabat setiamu,',
    heroHeadlineHighlight: 'selalu ada di sini.',
    heroSubheadline:
      'Sedang lelah atau kewalahan? Butuh teman cerita yang tulus tanpa takut dihakimi? Telepon Momly kapan saja.',
    callButtonLabel: 'Ketuk untuk Telepon Momly',
    callButtonSubtext: '100% Suara Nyata • Tanpa Dihakimi • Gratis Kapan Saja',
    callBannerTitle: 'Dada terasa sesak atau panik?',
    callBannerSubtitle: 'Ambil jeda sejenak dengan latihan nafas terpandu 30 detik.',
    callBannerAction: 'Mulai Bernafas',
    moodCheckInTitle: 'Bagaimana perasaan Mama hari ini?',
    moodCheckInSubtitle:
      'Pilih satu rasa di bawah agar Momly mengerti suasana hatimu sebelum mulai bicara.',
    moodBadge: 'Check-in Harian',
    momlyWhisper: 'Bisikan Momly:',
    moods: [
      {
        id: 'exhausted',
        emoji: '🥱',
        label: 'Lelah',
        subtitle: 'Kurang tidur & badan pegal',
        note: 'Nafas dulu pelan-pelan ya Mama. Mama sudah berjuang hebat hari ini. Momly di sini temani Mama istirahat.',
      },
      {
        id: 'anxious',
        emoji: '🥺',
        label: 'Cemas',
        subtitle: 'Pikiran berputar tak tenang',
        note: 'Kecemasan Mama wajar, tapi Mama tidak harus memikul semuanya sendirian.',
      },
      {
        id: 'crying',
        emoji: '😭',
        label: 'Sedih',
        subtitle: 'Dada sesak butuh tumpahan',
        note: 'Menangislah sepuasnya Mama, tidak perlu ditahan. Momly ada di sini mendengarkan tanpa menghakimi.',
      },
      {
        id: 'numb',
        emoji: '🫥',
        label: 'Hampa',
        subtitle: 'Burnout & kehilangan energi',
        note: 'Mama tidak gagal. Mama cuma sedang kehabisan baterai jiwa. Peluk hangat dari jauh untuk Mama.',
      },
      {
        id: 'need_friend',
        emoji: '🌿',
        label: 'Butuh Teman',
        subtitle: 'Pengen ngobrol santai',
        note: 'Senang banget Mama datang! Cerita apa saja yuk, Momly siap dengarkan seperti sahabat karib.',
      },
    ],
    callScreen: {
      connecting: 'Menghubungkan dengan Momly...',
      listening: 'Momly sedang mendengarkan suaramu...',
      thinking: 'Momly sedang memahami perasaanmu...',
      speaking: 'Momly sedang berbicara lembut...',
      tapToTalk: 'Ceritakan apa saja ya Mama, jangan ragu...',
      hideCaptions: 'Sembunyikan Teks',
      showCaptions: 'Tampilkan Teks Obrolan',
      mute: 'Matikan Mic',
      unmute: 'Nyalakan Mic',
      endCall: 'Akhiri Telepon',
      speakerOn: 'Suara Mati',
      speakerOff: 'Suara Nyala',
      substatus: 'Ruang Aman Terenkripsi',
    },
    loveLetter: {
      badge: 'Surat Cinta Penguat Hati dari Momly',
      headlineDefault: 'Mama, Kamu Sungguh Hebat Hari Ini 🌸',
      messageDefault:
        'Terima kasih sudah meluangkan waktu untuk bernafas dan berbagi cerita. Bebanmu valid, dan kamu tidak sendirian.',
      tagDefault: 'Lega & Didengar',
      tipsTitle: 'Langkah Kecil untuk Nafas Mama Hari Ini:',
      buttonClose: 'Terima Kasih Momly, Aku Merasa Lebih Baik 🌸',
      reflectionTagLabel: 'Refleksi Suasana Hati:',
      generatingMessage: 'Momly sedang menuliskan Surat Cinta untukmu...',
    },
    journal: {
      title: 'Jurnal Hati & Memory',
      subtitle: 'Momly mengingat riwayat perasaanmu agar obrolan selalu tersambung hangat.',
      emptyTitle: 'Belum Ada Riwayat',
      emptyDesc: 'Setelah selesai menelepon Momly, rangkuman refleksi dan surat cintamu akan tersimpan di sini.',
      reminderTitle: 'Pengingat Kasih:',
      clearAll: 'Hapus Semua Riwayat',
      close: 'Tutup',
    },
    breathing: {
      title: 'Breathing Together',
      subtitle: 'Latihan Nafas 30 Detik Bersama Momly',
      inhaleText: 'Tarik nafas perlahan lewat hidung...',
      inhaleSub: 'Rasakan udara sejuk mengisi rongga dada',
      holdText: 'Tahan sejenak dengan tenang...',
      holdSub: 'Biarkan tubuhmu merasakan kedamaian ini',
      exhaleText: 'Hembuskan perlahan lewat bibir...',
      exhaleSub: 'Lepaskan semua beban dan ketegangan hari ini',
      finishedText: 'Nafas alamiah sekarang.',
      finishedSub: 'Tubuh dan pikiranmu sudah lebih tenang',
      congratsTitle:
        '🌸 Bagus sekali, Mama. Detak jantungmu mulai rileks dan sistem sarafmu kembali tenang.',
      repeat: 'Ulangi Lagi',
      done: 'Selesai, Aku Siap',
      quote: '"Kadang yang kita butuhkan hanyalah berhenti sejenak, bernafas, dan merasa didengar."',
    },
    bottomNav: {
      home: 'Sahabat',
      breathe: 'Nafas',
      journal: 'Jurnal',
    },
    languageModal: {
      title: 'Pilih Bahasa Obrolan',
      subtitle: 'Bagaimana kamu ingin Momly berbicara denganmu?',
      chooseEn: 'English (Bahasa Inggris)',
      chooseId: 'Bahasa Indonesia',
      confirm: 'Lanjutkan Bersama Momly',
    },
  },
};
