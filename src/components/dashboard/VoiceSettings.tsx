import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Volume2, Play, Settings, Sparkles, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VoiceSettingsProps {
  onSettingsChange?: (settings: VoiceSettingsData) => void;
}

export interface VoiceSettingsData {
  voiceUri: string;
  rate: number;
  pitch: number;
  volume: number;
  autoPlay: boolean;
  useVieNeu: boolean;
  vieneuVoice: string;
}

const DEFAULT_SETTINGS: VoiceSettingsData = {
  voiceUri: '',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  autoPlay: true,
  useVieNeu: true,
  vieneuVoice: 'Hương',
};

const VIENEU_VOICES = [
  { id: 'Hương', name: 'Hương', gender: 'Nữ', accent: 'Bắc' },
  { id: 'Ngọc', name: 'Ngọc', gender: 'Nữ', accent: 'Bắc' },
  { id: 'Đoan', name: 'Đoan', gender: 'Nữ', accent: 'Nam' },
  { id: 'Bình', name: 'Bình', gender: 'Nam', accent: 'Bắc' },
  { id: 'Tuyên', name: 'Tuyên', gender: 'Nam', accent: 'Bắc' },
  { id: 'Nguyên', name: 'Nguyên', gender: 'Nam', accent: 'Nam' },
];

export function VoiceSettings({ onSettingsChange }: VoiceSettingsProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<VoiceSettingsData>(() => {
    const saved = localStorage.getItem('voice-settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [vieneuAvailable, setVieneuAvailable] = useState<boolean | null>(null);

  const TTS_SERVER_URL = import.meta.env.VITE_TTS_SERVER_URL || 'http://localhost:8000';

  // Check VieNeu TTS server availability
  useEffect(() => {
    const checkVieNeu = async () => {
      try {
        const response = await fetch(`${TTS_SERVER_URL}/voices`, { 
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        });
        setVieneuAvailable(response.ok);
      } catch {
        setVieneuAvailable(false);
      }
    };
    checkVieNeu();
  }, [TTS_SERVER_URL]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis?.getVoices() || [];
      // Filter for Vietnamese and English voices
      const filteredVoices = availableVoices.filter(
        v => v.lang.startsWith('vi') || v.lang.startsWith('en')
      );
      setVoices(filteredVoices);
      
      // Set default voice if not set
      if (!settings.voiceUri && filteredVoices.length > 0) {
        const defaultVoice = filteredVoices.find(v => v.lang.startsWith('vi')) || filteredVoices[0];
        updateSetting('voiceUri', defaultVoice.voiceURI);
      }
    };

    loadVoices();
    
    // Chrome requires this event
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('voice-settings', JSON.stringify(settings));
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  const updateSetting = <K extends keyof VoiceSettingsData>(key: K, value: VoiceSettingsData[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const testVoice = async () => {
    setIsPlaying(true);
    const testText = 'Xin chào! Đây là giọng nói AI sẽ được sử dụng trong phỏng vấn.';

    // Try VieNeu TTS first if enabled
    if (settings.useVieNeu && vieneuAvailable) {
      try {
        const response = await fetch(`${TTS_SERVER_URL}/synthesize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: testText,
            voice: settings.vieneuVoice,
          }),
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.onended = () => {
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
          };
          audio.onerror = () => setIsPlaying(false);
          await audio.play();
          return;
        }
      } catch (err) {
        console.log('VieNeu test failed, using Web Speech');
      }
    }

    // Fallback to Web Speech API
    if (!window.speechSynthesis) {
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(testText);
    
    const voice = voices.find(v => v.voiceURI === settings.voiceUri);
    if (voice) utterance.voice = voice;
    
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  // Group voices by language
  const vietnameseVoices = voices.filter(v => v.lang.startsWith('vi'));
  const englishVoices = voices.filter(v => v.lang.startsWith('en'));

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Cài đặt giọng nói AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* VieNeu TTS Toggle */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <Label htmlFor="use-vieneu" className="cursor-pointer font-medium">
                VieNeu TTS
              </Label>
              {vieneuAvailable === null ? (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              ) : vieneuAvailable ? (
                <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                  Online
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-400">
                  Offline
                </Badge>
              )}
            </div>
            <Switch
              id="use-vieneu"
              checked={settings.useVieNeu}
              onCheckedChange={(checked) => updateSetting('useVieNeu', checked)}
              disabled={!vieneuAvailable}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Giọng nói tiếng Việt tự nhiên, chạy realtime trên CPU
          </p>
        </div>

        {/* VieNeu Voice Selection */}
        {settings.useVieNeu && vieneuAvailable && (
          <div className="space-y-2">
            <Label>Giọng VieNeu</Label>
            <Select
              value={settings.vieneuVoice}
              onValueChange={(value) => updateSetting('vieneuVoice', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn giọng nói" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Giọng nữ
                </div>
                {VIENEU_VOICES.filter(v => v.gender === 'Nữ').map(voice => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name} ({voice.accent})
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Giọng nam
                </div>
                {VIENEU_VOICES.filter(v => v.gender === 'Nam').map(voice => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name} ({voice.accent})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Fallback: Browser Voice Selection */}
        {(!settings.useVieNeu || !vieneuAvailable) && (
          <>
            <div className="space-y-2">
              <Label>Giọng nói (Browser)</Label>
              <Select
                value={settings.voiceUri}
                onValueChange={(value) => updateSetting('voiceUri', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giọng nói" />
                </SelectTrigger>
                <SelectContent>
                  {vietnameseVoices.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Tiếng Việt
                      </div>
                      {vietnameseVoices.map(voice => (
                        <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {englishVoices.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        English
                      </div>
                      {englishVoices.map(voice => (
                        <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Speed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Tốc độ</Label>
                <span className="text-xs text-muted-foreground">{settings.rate.toFixed(1)}x</span>
              </div>
              <Slider
                value={[settings.rate]}
                onValueChange={([value]) => updateSetting('rate', value)}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Pitch */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Cao độ</Label>
                <span className="text-xs text-muted-foreground">{settings.pitch.toFixed(1)}</span>
              </div>
              <Slider
                value={[settings.pitch]}
                onValueChange={([value]) => updateSetting('pitch', value)}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Âm lượng</Label>
                <span className="text-xs text-muted-foreground">{Math.round(settings.volume * 100)}%</span>
              </div>
              <Slider
                value={[settings.volume]}
                onValueChange={([value]) => updateSetting('volume', value)}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          </>
        )}

        {/* Auto-play toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-play" className="cursor-pointer">
            Tự động đọc câu hỏi
          </Label>
          <Switch
            id="auto-play"
            checked={settings.autoPlay}
            onCheckedChange={(checked) => updateSetting('autoPlay', checked)}
          />
        </div>

        {/* Test button */}
        <Button
          variant="outline"
          onClick={testVoice}
          disabled={isPlaying || (voices.length === 0 && !vieneuAvailable)}
          className="w-full"
        >
          {isPlaying ? (
            <>
              <Volume2 className="h-4 w-4 mr-2 animate-pulse" />
              Đang phát...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Thử giọng nói
            </>
          )}
        </Button>

        {voices.length === 0 && !vieneuAvailable && (
          <p className="text-xs text-muted-foreground text-center">
            Không có giọng nói khả dụng. Hãy chạy VieNeu TTS server.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Hook to use voice settings
export function useVoiceSettings(): VoiceSettingsData {
  const [settings, setSettings] = useState<VoiceSettingsData>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const saved = localStorage.getItem('voice-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('voice-settings');
      if (saved) setSettings(JSON.parse(saved));
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return settings;
}
