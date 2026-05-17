import type { ReactNode } from 'react';
import { CameraModal } from '@components/CameraModal';
import { useAppStore } from '@store/appStore';

interface PhoneFrameProps {
  children: ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  const alertMode = useAppStore((s) => s.alertMode);
  const uiMode = useAppStore((s) => s.uiMode);
  const isEmergency = uiMode === 'emergency';

  const ringClass = isEmergency
    ? 'animate-emergency-ring'
    : alertMode
    ? 'animate-pulse-ring'
    : '';

  const haloClass = isEmergency ? 'emergency-halo' : 'sos-halo';
  const haloVisible = isEmergency || alertMode;

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-4">
      <div
        className={`relative w-107.5 h-185 rounded-[40px] overflow-hidden flex flex-col transition-colors duration-500 bg-white ${ringClass}`}
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}
      >
        <div
          className={`pointer-events-none absolute inset-0 ${haloClass} transition-opacity duration-500 ${haloVisible ? 'opacity-100' : 'opacity-0'}`}
        />

        <div className="relative z-10 flex flex-col flex-1 min-h-0">
          {children}
        </div>

        <CameraModal />
      </div>
    </div>
  );
}
