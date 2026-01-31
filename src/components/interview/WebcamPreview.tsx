import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Video, 
  VideoOff, 
  Maximize2, 
  Minimize2,
  Camera,
  CameraOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WebcamPreviewProps {
  enabled?: boolean;
  className?: string;
}

export function WebcamPreview({ enabled = true, className }: WebcamPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsActive(true);
      setHasPermission(true);
    } catch (error) {
      console.error('Camera access denied:', error);
      setHasPermission(false);
      setIsActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const toggleCamera = () => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  if (!enabled) return null;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      "bg-card/80 backdrop-blur-sm border-border/30",
      isExpanded ? "fixed bottom-4 right-4 z-50 w-80 h-60" : "w-full",
      className
    )}>
      {/* Video container */}
      <div className={cn(
        "relative bg-muted/30",
        isExpanded ? "h-full" : "aspect-video"
      )}>
        {isActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            {hasPermission === false ? (
              <>
                <CameraOff className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Không có quyền truy cập camera</p>
                <p className="text-xs mt-1">Vui lòng cấp quyền trong cài đặt trình duyệt</p>
              </>
            ) : (
              <>
                <Camera className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Camera đang tắt</p>
                <p className="text-xs mt-1">Bật camera để luyện tập biểu cảm</p>
              </>
            )}
          </div>
        )}

        {/* Controls overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleCamera}
            className={cn(
              "gap-2 bg-background/80 backdrop-blur-sm hover:bg-background/90",
              isActive && "bg-primary/20 text-primary hover:bg-primary/30"
            )}
          >
            {isActive ? (
              <>
                <VideoOff className="h-4 w-4" />
                Tắt
              </>
            ) : (
              <>
                <Video className="h-4 w-4" />
                Bật camera
              </>
            )}
          </Button>

          {isActive && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Recording indicator when active */}
        {isActive && (
          <div className="absolute top-2 left-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-white bg-black/50 px-2 py-0.5 rounded">
              LIVE
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

// Floating webcam for interview room
export function FloatingWebcam() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsVisible(true);
    } catch (error) {
      console.error('Camera error:', error);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsVisible(false);
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 200, dragRef.current.initialX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 150, dragRef.current.initialY + dy))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <>
      {/* Toggle button */}
      <Button
        variant="outline"
        size="sm"
        onClick={isVisible ? stopCamera : startCamera}
        className={cn(
          "gap-2",
          isVisible && "bg-primary/10 border-primary/30 text-primary"
        )}
      >
        {isVisible ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
        {isVisible ? 'Tắt webcam' : 'Bật webcam'}
      </Button>

      {/* Floating preview */}
      {isVisible && (
        <div
          className={cn(
            "fixed z-50 rounded-xl overflow-hidden shadow-2xl border-2 border-primary/30",
            "bg-black cursor-move select-none",
            isDragging && "opacity-80"
          )}
          style={{ left: position.x, bottom: position.y, width: 200, height: 150 }}
          onMouseDown={handleMouseDown}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
          <div className="absolute top-1 left-1 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-white bg-black/60 px-1.5 py-0.5 rounded">
              LIVE
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); stopCamera(); }}
            className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white"
          >
            <VideoOff className="h-3 w-3" />
          </Button>
        </div>
      )}
    </>
  );
}
