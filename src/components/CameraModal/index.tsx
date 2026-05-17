import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useAppStore } from '@store/appStore';
import { analyzeImage } from '@lib/vision';
import { useIntentSearch } from '@hooks/useIntentSearch';

export function CameraModal() {
  const {
    cameraModalOpen,
    setCameraModalOpen,
    setQuery,
    alertMode,
    setAlertMode,
    addCapturedPhotos,
  } = useAppStore((s) => ({
    cameraModalOpen: s.cameraModalOpen,
    setCameraModalOpen: s.setCameraModalOpen,
    setQuery: s.setQuery,
    alertMode: s.alertMode,
    setAlertMode: s.setAlertMode,
    addCapturedPhotos: s.addCapturedPhotos,
  }));

  const { processInput } = useIntentSearch();

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasStream, setHasStream] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [localPhotos, setLocalPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (!cameraModalOpen) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setHasStream(false);
      setFlashActive(false);
      setLocalPhotos([]);
      return;
    }

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setHasStream(true);
      })
      .catch(() => setHasStream(false));
  }, [cameraModalOpen]);

  function handleCapture() {
    if (flashActive) return;
    setFlashActive(true);
  }

  function handleFlashComplete() {
    setFlashActive(false);
    const video = videoRef.current;
    if (video && video.videoWidth > 0) {
      const c = document.createElement('canvas');
      c.width = video.videoWidth;
      c.height = video.videoHeight;
      c.getContext('2d')?.drawImage(video, 0, 0);
      const dataUrl = c.toDataURL('image/jpeg', 0.85);
      setLocalPhotos((prev) => [...prev, dataUrl]);
    }
  }

  function handleConfirm() {
    addCapturedPhotos(localPhotos);

    localPhotos.forEach((dataUrl) => {
      void (async () => {
        try {
          const fetchRes = await fetch(dataUrl);
          const blob = await fetchRes.blob();
          const result = await analyzeImage(blob);
          if (result.injected_text) setQuery(result.injected_text);
          if (result.severity === 'emergency') {
            setAlertMode(true);
            if (result.injected_text) void processInput(result.injected_text, 'camera');
          }
        } catch { /* silent */ }
      })();
    });

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setHasStream(false);
    setLocalPhotos([]);
    setCameraModalOpen(false);
  }

  function handleCancel() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setHasStream(false);
    setLocalPhotos([]);
    setCameraModalOpen(false);
  }

  const cornerConfigs = [
    { top: 8, left: 8, rotate: 0 },
    { top: 8, right: 8, rotate: 90 },
    { bottom: 8, right: 8, rotate: 180 },
    { bottom: 8, left: 8, rotate: 270 },
  ] as const;

  const accentColor = alertMode ? '#ef4444' : '#3b82f6';

  return (
    <AnimatePresence>
      {cameraModalOpen && (
        <>
          <motion.div
            className="absolute inset-0 z-30"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleCancel}
          />

          <motion.div
            className="absolute bottom-0 left-0 right-0 z-40 flex flex-col"
            style={{ height: '82%', background: '#080c18', borderRadius: '24px 24px 0 0' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: 40, height: 4, borderRadius: 2, background: '#1e2a40' }} />
            </div>

            {/* Header */}
            <div className="flex items-center px-5 py-2.5">
              <button
                onClick={handleCancel}
                className="text-[14px] text-zinc-500 hover:text-zinc-300 transition-colors bg-transparent border-0 cursor-pointer p-0"
              >
                Cancelar
              </button>
              <p className="flex-1 text-center font-medium text-[16px] text-zinc-100 m-0">
                Tomar foto
              </p>
              {localPhotos.length > 0 ? (
                <button
                  onClick={handleConfirm}
                  className="text-[14px] text-blue-400 hover:text-blue-300 font-medium transition-colors bg-transparent border-0 cursor-pointer p-0"
                >
                  Usar {localPhotos.length}
                </button>
              ) : (
                <div className="w-14" />
              )}
            </div>

            {/* Viewfinder */}
            <div className="flex justify-center px-4 pt-1 flex-1 min-h-0 items-start">
              <div
                className="relative overflow-hidden w-full"
                style={{
                  aspectRatio: '4/3',
                  maxHeight: '55%',
                  borderRadius: 16,
                  border: `1px solid ${alertMode ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  background: '#0a0f1e',
                }}
              >
                {/* Video siempre montado para que videoRef sea válido al asignar el stream */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ display: hasStream ? 'block' : 'none' }}
                />

                {!hasStream && (
                  <>
                    <svg className="absolute inset-0 w-full h-full">
                      <line x1="33.33%" y1="0" x2="33.33%" y2="100%" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                      <line x1="66.66%" y1="0" x2="66.66%" y2="100%" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                      <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                      <line x1="0" y1="66.66%" x2="100%" y2="66.66%" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-[13px] text-zinc-500 text-center px-6">
                        Apunta hacia la situación
                      </p>
                    </div>
                  </>
                )}

                {cornerConfigs.map((pos, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      width: 20,
                      height: 20,
                      top: 'top' in pos ? pos.top : undefined,
                      bottom: 'bottom' in pos ? pos.bottom : undefined,
                      left: 'left' in pos ? pos.left : undefined,
                      right: 'right' in pos ? pos.right : undefined,
                      transform: `rotate(${pos.rotate}deg)`,
                    }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 20, height: 2, background: accentColor, borderRadius: 1 }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 2, height: 20, background: accentColor, borderRadius: 1 }} />
                  </div>
                ))}

                {flashActive && (
                  <motion.div
                    className="absolute inset-0 z-10"
                    style={{ background: 'white' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.9, 0] }}
                    transition={{ duration: 0.35 }}
                    onAnimationComplete={handleFlashComplete}
                  />
                )}
              </div>
            </div>

            {/* Thumbnails strip */}
            {localPhotos.length > 0 && (
              <div className="flex gap-2 px-4 py-2 overflow-x-auto shrink-0">
                {localPhotos.map((url, i) => (
                  <div key={i} className="relative shrink-0">
                    <img
                      src={url}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover"
                      style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                    />
                    <button
                      onClick={() => setLocalPhotos((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center"
                    >
                      <X size={10} className="text-zinc-300" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Capture button */}
            <div className="flex justify-center py-5 shrink-0">
              <motion.button
                onClick={handleCapture}
                whileTap={{ scale: 0.92 }}
                disabled={flashActive}
                aria-label="Capturar foto"
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  border: `3px solid ${alertMode ? '#ef4444' : 'white'}`,
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: flashActive ? 'default' : 'pointer',
                  opacity: flashActive ? 0.5 : 1,
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    background: alertMode ? '#ef4444' : 'white',
                  }}
                />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
