import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Volume2, Play, Settings, Sparkles, Loader2, Bell } from 'lucide-react';
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
  useEdgeTTS: boolean;
  edgeVoice: string;
  soundEffectsEnabled: boolean;
}

const DEFAULT_SETTINGS: VoiceSettingsData = {
  voiceUri: '',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  autoPlay: true,
  useEdgeTTS: true,
  edgeVoice: 'Hoài My (Nữ)',
  soundEffectsEnabled: true,
};

// Migrate old settings
function migrateSettings(saved: any): VoiceSettingsData {
  const settings = { ...DEFAULT_SETTINGS, ...saved };
  
  // Migrate from old VieNeu settings
  if (saved?.useVieNeu !== undefined && saved?.useEdgeTTS === undefined) {
    settings.useEdgeTTS = saved.useVieNeu;
  }
  if (saved?.vieneuVoice && !saved?.edgeVoice) {
    // Map old VieNeu voices to Edge TTS
    settings.edgeVoice = 'Hoài My (Nữ)'; // Default to female
  }
  
  return settings;
}

// Edge TTS voices from HF Spaces
const EDGE_VOICES = [
  { id: 'Hoài My (Nữ)', name: 'Hoài My', gender: 'Nữ' },
  { id: 'Nam Minh (Nam)', name: 'Nam Minh', gender: 'Nam' },
];

const TTS_SERVER_URL = import.meta.env.VITE_TTS_SERVER_URL || 'https://devtam05-vieneu-tts.hf.space';

// Call Gradio API on HF Spaces
async function callGradioTTS(text: string, voice: string): Promise<string> {
  console.log('[TTS] Calling with voice:', voice);
  const apiUrl = `${TTS_SERVER_URL}/gradio_api/call/synthesize`;
  
  const submitResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [text, voice] }),
  });
  
  console.log('[TTS] Request body:', { data: [text, voice] });
  
  if (!submitResponse.ok) throw new Error('Failed to submit TTS request');
  
  const { event_id } = await submitResponse.json();
  const resultResponse = await fetch(`${TTS_SERVER_URL}/gradio_api/call/synthesize/${event_id}`);
  
  if (!resultResponse.ok) throw new Error('Failed to get TTS result');
  
  const resultText = await resultResponse.text();
  const lines = resultText.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data && data[0] && data[0].url) {
        return data[0].url;
      }
    }
  }
  
  throw new Error('No audio URL in response');
}

export function VoiceSettings({ onSettingsChange }: VoiceSettingsProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<VoiceSettingsData>(() => {
    const saved = localStorage.getItem('voice-settings');
    if (saved) {
      return migrateSettings(JSON.parse(saved));
    }
    return DEFAULT_SETTINGS;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [edgeTTSAvailable, setEdgeTTSAvailable] = useState<boolean | null>(null);

  // Check Edge TTS server availability
  useEffect(() => {
    const checkEdgeTTS = async () => {
      try {
        const response = await fetch(`${TTS_SERVER_URL}/`, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        setEdgeTTSAvailable(response.ok);
      } catch {
        setEdgeTTSAvailable(false);
      }
    };
    checkEdgeTTS();
  }, []);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis?.getVoices() || [];
      const filteredVoices = availableVoices.filter(
        v => v.lang.startsWith('vi') || v.lang.startsWith('en')
      );
      setVoices(filteredVoices);
      
      if (!settings.voiceUri && filteredVoices.length > 0) {
        const defaultVoice = filteredVoices.find(v => v.lang.startsWith('vi')) || filteredVoices[0];
        updateSetting('voiceUri', defaultVoice.voiceURI);
      }
    };

    loadVoices();
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

    // Try Edge TTS first if enabled
    if (settings.useEdgeTTS && edgeTTSAvailable) {
      try {
        const audioUrl = await callGradioTTS(testText, settings.edgeVoice);
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);
        await audio.play();
        return;
      } catch (err) {
        console.log('Edge TTS test failed, using Web Speech');
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
        {/* Edge TTS Toggle */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <Label htmlFor="use-edge-tts" className="cursor-pointer font-medium">
                Edge TTS
              </Label>
              {edgeTTSAvailable === null ? (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              ) : edgeTTSAvailable ? (
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
              id="use-edge-tts"
              checked={settings.useEdgeTTS}
              onCheckedChange={(checked) => updateSetting('useEdgeTTS', checked)}
              disabled={!edgeTTSAvailable}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Giọng nói tiếng Việt tự nhiên từ Microsoft Edge TTS
          </p>
        </div>

        {/* Edge TTS Voice Selection */}
        {settings.useEdgeTTS && edgeTTSAvailable && (
          <div className="space-y-2">
            <Label>Giọng Edge TTS</Label>
            <Select
              value={settings.edgeVoice}
              onValueChange={(value) => updateSetting('edgeVoice', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn giọng nói" />
              </SelectTrigger>
              <SelectContent>
                {EDGE_VOICES.map(voice => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name} ({voice.gender})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Fallback: Browser Voice Selection */}
        {(!settings.useEdgeTTS || !edgeTTSAvailable) && (
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

        {/* Sound effects toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="sound-effects" className="cursor-pointer">
              Hiệu ứng âm thanh
            </Label>
          </div>
          <Switch
            id="sound-effects"
            checked={settings.soundEffectsEnabled}
            onCheckedChange={(checked) => updateSetting('soundEffectsEnabled', checked)}
          />
        </div>

        {/* Test button */}
        <Button
          variant="outline"
          onClick={testVoice}
          disabled={isPlaying || (voices.length === 0 && !edgeTTSAvailable)}
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

        {voices.length === 0 && !edgeTTSAvailable && (
          <p className="text-xs text-muted-foreground text-center">
            Không có giọng nói khả dụng.
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
