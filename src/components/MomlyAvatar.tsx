import React, { useState } from 'react';

export type MomlyPose =
  | 'bestie'        // Holding warm cup (Your Daily Bestie)
  | 'listening'     // Chin on hand, soundwave (Always here to listen)
  | 'supportive'    // Clasping hands, cheerful smile (Cheering you on)
  | 'calm'          // Meditating, eyes closed (Breathe, reset)
  | 'understanding' // Holding pen & journal (No judgment, just support)
  | 'welcoming'     // Open arms (A safe space just for you)
  | 'winking';      // Hero winking face (A Happier, Calmer You)

interface MomlyAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  pose?: MomlyPose;
  className?: string;
  isSpeaking?: boolean;
  isListening?: boolean;
}

const POSE_IMAGE_MAP: Record<MomlyPose, string> = {
  bestie: '/assets/momly/pose_bestie.png',
  listening: '/assets/momly/pose_listening.png',
  supportive: '/assets/momly/pose_supportive.png',
  calm: '/assets/momly/pose_calm.png',
  understanding: '/assets/momly/pose_understanding.png',
  welcoming: '/assets/momly/pose_welcoming.png',
  winking: '/assets/momly/hero_winking.png',
};

export const MomlyAvatar: React.FC<MomlyAvatarProps> = ({
  size = 'md',
  pose,
  className = '',
  isSpeaking = false,
  isListening = false,
}) => {
  const [imgError, setImgError] = useState(false);

  // Determine active pose based on voice call state if not explicitly passed
  let activePose: MomlyPose = pose || 'bestie';
  if (!pose) {
    if (isSpeaking) activePose = 'supportive';
    else if (isListening) activePose = 'listening';
  }

  const imageSrc = POSE_IMAGE_MAP[activePose] || POSE_IMAGE_MAP.bestie;

  const sizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36',
    '2xl': 'w-48 h-48',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none transition-transform duration-300 ${sizeClasses[size]} ${className}`}
    >
      {/* Outer ambient glow & ripple waves when speaking */}
      {isSpeaking && (
        <>
          <div className="absolute -inset-2 rounded-full bg-[#F07B6B]/30 animate-ping pointer-events-none" />
          <div className="absolute -inset-4 rounded-full bg-[#F5A898]/20 animate-pulse-ring pointer-events-none" />
        </>
      )}

      {/* Listening ambient ring */}
      {isListening && (
        <div className="absolute -inset-2.5 rounded-full bg-emerald-400/30 animate-pulse pointer-events-none" />
      )}

      {/* Character Image */}
      {!imgError ? (
        <div className="relative w-full h-full rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-[#F07B6B] via-[#DDBCE0] to-[#FFF8F2] shadow-md">
          <img
            src={imageSrc}
            alt={`Momly character - ${activePose}`}
            className={`w-full h-full object-cover rounded-full bg-[#FFF8F2] transition-transform duration-300 ${
              isSpeaking ? 'scale-105' : ''
            }`}
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        /* Fallback SVG */
        <div className="w-full h-full rounded-full bg-[#FDDDDB] flex items-center justify-center text-[#F07B6B] font-bold text-xs">
          M
        </div>
      )}
    </div>
  );
};
