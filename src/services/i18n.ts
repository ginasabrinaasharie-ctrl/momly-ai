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
    newEntryButton: string;
    emptyTitle: string;
    emptyDesc: string;
    clearAll: string;
    modalTitle: string;
    modalSubtitle: string;
    modeQuickTitle: string;
    modeQuickBadge: string;
    modeQuickDesc: string;
    modeVoiceTitle: string;
    modeVoiceBadge: string;
    modeVoiceDesc: string;
    modeTextTitle: string;
    modeTextBadge: string;
    modeTextDesc: string;
    gratitudeLabel: string;
    gratitudePlaceholder: string;
    winsLabel: string;
    winsPlaceholder: string;
    quickGratitudeChips: string[];
    quickWinsChips: string[];
    voiceTapToRecord: string;
    voiceRecording: string;
    voiceStop: string;
    voiceProcessing: string;
    voiceSpokenNote: string;
    saveButton: string;
    savingButton: string;
    aiNoteTitle: string;
    gratitudeSection: string;
    winsSection: string;
    toastSaved: string;
  };
  letters: {
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
    letters: string;
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
        id: 'happy',
        emoji: '🥰',
        label: 'Happy',
        subtitle: 'Warm heart & smiling',
        note: 'So wonderful to see you shining, Mama! Tell Momly all about the beautiful moments making your day shine.',
      },
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
      title: 'Heart Journal',
      subtitle: 'Gather your daily gratitude & celebrate your little wins.',
      newEntryButton: 'Log Today’s Moments',
      emptyTitle: 'Your Journal is Fresh & Clean',
      emptyDesc: 'No entries yet. Take a gentle minute to record a sweet moment or a tiny victory today, Mama.',
      clearAll: 'Clear All Journals',
      modalTitle: 'Mama’s Heart Journal',
      modalSubtitle: 'Pick the method that best matches your energy right now',
      modeQuickTitle: 'Quick Tap',
      modeQuickBadge: '10 Seconds',
      modeQuickDesc: 'Exhausted or short on time? Just tap pre-made moments without typing a single word.',
      modeVoiceTitle: 'Voice Log',
      modeVoiceBadge: 'Hands-Free',
      modeVoiceDesc: 'Holding or feeding your baby? Just speak naturally, and Momly will organize your sweet moments.',
      modeTextTitle: 'Reflective Write',
      modeTextBadge: 'Quiet Me-Time',
      modeTextDesc: 'Baby is sleeping and the room is quiet? Write down your gratitude and personal wins at your own pace.',
      gratitudeLabel: '🌻 What I’m Grateful For Today',
      gratitudePlaceholder: 'e.g. Sipped my coffee warm, baby took a peaceful nap...',
      winsLabel: '🏆 My Little Win Today',
      winsPlaceholder: 'e.g. Kept my cool during a tantrum, took a soothing shower...',
      quickGratitudeChips: [
        '☕ Warm Drink',
        '👶 Peaceful Baby Nap',
        '☀️ Bright Sunshine',
        '🤝 Partner / Family Support',
        '🌿 A Deep Calming Breath',
        '🍲 Delicious Meal'
      ],
      quickWinsChips: [
        '🧘 Kept My Patience',
        '🛁 Unhurried Shower',
        '💧 Drank Water Today',
        '🛋️ Rested for 10 Mins',
        '💪 Got Through a Hard Day',
        '🧸 Tidied up a bit'
      ],
      voiceTapToRecord: 'Tap to Start Speaking',
      voiceRecording: 'Momly is listening... Tell me about your sweet moments or little wins',
      voiceStop: 'Done Speaking',
      voiceProcessing: 'Momly is sorting your precious moments...',
      voiceSpokenNote: 'What you spoke:',
      saveButton: 'Save & Receive Momly’s Hug 🌸',
      savingButton: 'Momly is preparing a warm note...',
      aiNoteTitle: 'Warm Hug from Momly',
      gratitudeSection: 'Grateful For',
      winsSection: 'Little Wins',
      toastSaved: 'Journal saved with love 🌸',
    },
    letters: {
      title: 'Love Letters from Momly',
      subtitle: 'Warm reflections and loving reminders from your voice conversations with Momly.',
      emptyTitle: 'No Letters Yet',
      emptyDesc: 'Whenever you finish talking with Momly, your personalized love letter and caring tips will appear here.',
      reminderTitle: 'Loving Reminder:',
      clearAll: 'Clear All Letters',
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
      home: 'Talk',
      breathe: 'Pause',
      journal: 'Journal',
      letters: 'Letters',
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
        id: 'happy',
        emoji: '🥰',
        label: 'Senang',
        subtitle: 'Hati hangat & tersenyum',
        note: 'Senang sekali melihat Mama tersenyum hari ini! Ceritakan hal indah apa yang membuat harimu bersinar.',
      },
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
      title: 'Jurnal Hati',
      subtitle: 'Kumpulkan rasa syukur & rayakan kemenangan kecilmu setiap hari.',
      newEntryButton: 'Catat Momen Hari Ini',
      emptyTitle: 'Buku Jurnalmu Masih Rapi',
      emptyDesc: 'Belum ada catatan hari ini. Luangkan 1 menit untuk mencatat hal manis atau kemenangan kecilmu, Mama.',
      clearAll: 'Hapus Semua Jurnal',
      modalTitle: 'Jurnal Hati Mama',
      modalSubtitle: 'Pilih cara mencatat yang paling nyaman dengan energimu saat ini',
      modeQuickTitle: 'Tinggal Pilih',
      modeQuickBadge: '10 Detik',
      modeQuickDesc: 'Lagi buru-buru atau ngantuk? Cukup sentuh kata-kata yang mewakili harimu tanpa perlu ngetik.',
      modeVoiceTitle: 'Tinggal Cerita',
      modeVoiceBadge: 'Sambil Momong',
      modeVoiceDesc: 'Tangan lagi repot gendong bayi? Tekan tombol dan ngomong santai, biar Momly yang rangkumkan.',
      modeTextTitle: 'Tulis Santai',
      modeTextBadge: 'Waktu Tenang',
      modeTextDesc: 'Si kecil sudah tidur dan suasana hening? Tuliskan rasa syukur dan kebanggaan kecilmu dengan tenang.',
      gratitudeLabel: '🌻 Hal yang Kusyukuri Hari Ini',
      gratitudePlaceholder: 'Contoh: Kopi pagi sempat diminum hangat, anak tidur siang nyenyak...',
      winsLabel: '🏆 Kemenangan Kecilku Hari Ini',
      winsPlaceholder: 'Contoh: Berhasil tahan sabar saat susu tumpah, sempat mandi tanpa buru-buru...',
      quickGratitudeChips: [
        '☕ Kopi/Teh Hangat',
        '👶 Bayi Tidur Pules',
        '☀️ Cuaca Cerah',
        '🤝 Bantuan Suami/Keluarga',
        '🌿 Nafas Lebih Lega',
        '🍲 Makanan Enak'
      ],
      quickWinsChips: [
        '🧘 Berhasil Nahan Sabar',
        '🛁 Mandi Tanpa Terburu',
        '💧 Minum 2L Air',
        '🛋️ Sempat Rebahan 10 Menit',
        '💪 Melewati Hari Berat',
        '🧸 Rapikan Mainan Sedikit'
      ],
      voiceTapToRecord: 'Tekan untuk Mulai Cerita',
      voiceRecording: 'Momly sedang mendengarkan... Ceritakan hal manis atau kemenangan harimu',
      voiceStop: 'Selesai Bercerita',
      voiceProcessing: 'Momly sedang merangkum poin indahmu...',
      voiceSpokenNote: 'Cerita yang kamu ucapkan:',
      saveButton: 'Simpan & Dapatkan Peluk Momly 🌸',
      savingButton: 'Momly sedang menyiapkan pelukan...',
      aiNoteTitle: 'Pelukan Hangat dari Momly',
      gratitudeSection: 'Hal yang Disyukuri',
      winsSection: 'Kemenangan Kecil',
      toastSaved: 'Jurnal berhasil disimpan dengan cinta 🌸',
    },
    letters: {
      title: 'Surat Cinta dari Momly',
      subtitle: 'Rangkuman hangat dan pengingat kasih dari setiap obrolan suara kita.',
      emptyTitle: 'Belum Ada Surat Cinta',
      emptyDesc: 'Setelah selesai curhat dengan Momly, rangkuman refleksi dan surat cintamu akan tersimpan di sini.',
      reminderTitle: 'Pengingat Kasih:',
      clearAll: 'Hapus Semua Surat',
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
      home: 'Curhat',
      breathe: 'Jeda',
      journal: 'Jurnal',
      letters: 'Surat',
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
