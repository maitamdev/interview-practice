import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Building2, 
  Coffee, 
  Laptop, 
  TreePine,
  Palette,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type BackgroundType = 'office' | 'modern' | 'startup' | 'nature' | 'minimal' | 'none';

interface VirtualBackgroundProps {
  selected: BackgroundType;
  onSelect: (bg: BackgroundType) => void;
}

const backgrounds: { id: BackgroundType; name: string; icon: React.ElementType; preview: string }[] = [
  { 
    id: 'office', 
    name: 'Văn phòng', 
    icon: Building2,
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  { 
    id: 'modern', 
    name: 'Hiện đại', 
    icon: Laptop,
    preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  { 
    id: 'startup', 
    name: 'Startup', 
    icon: Coffee,
    preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  { 
    id: 'nature', 
    name: 'Thiên nhiên', 
    icon: TreePine,
    preview: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  { 
    id: 'minimal', 
    name: 'Tối giản', 
    icon: Palette,
    preview: 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)'
  },
];

export function VirtualBackgroundSelector({ selected, onSelect }: VirtualBackgroundProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          Background
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <p className="text-sm font-medium mb-3">Chọn background ảo</p>
        <div className="grid grid-cols-3 gap-2">
          {backgrounds.map((bg) => {
            const Icon = bg.icon;
            return (
              <button
                key={bg.id}
                onClick={() => onSelect(bg.id)}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                  selected === bg.id ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/30"
                )}
              >
                <div 
                  className="absolute inset-0"
                  style={{ background: bg.preview }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                  <Icon className="h-5 w-5 text-white mb-1" />
                  <span className="text-[10px] text-white font-medium">{bg.name}</span>
                </div>
                {selected === bg.id && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
          <button
            onClick={() => onSelect('none')}
            className={cn(
              "relative aspect-square rounded-lg overflow-hidden border-2 transition-all bg-muted",
              selected === 'none' ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/30"
            )}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg">✕</span>
              <span className="text-[10px] font-medium">Không</span>
            </div>
            {selected === 'none' && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Virtual background overlay component
export function VirtualBackgroundOverlay({ type, className }: { type: BackgroundType; className?: string }) {
  if (type === 'none') return null;

  const getBackgroundStyle = () => {
    switch (type) {
      case 'office':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Office background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
            {/* Window */}
            <div className="absolute top-[10%] right-[10%] w-[30%] h-[40%] bg-gradient-to-b from-sky-200 to-sky-100 rounded-lg border-4 border-slate-300 shadow-inner">
              <div className="absolute inset-2 bg-gradient-to-b from-sky-300/50 to-transparent" />
            </div>
            {/* Bookshelf */}
            <div className="absolute left-[5%] top-[15%] w-[20%] h-[50%] bg-amber-800/80 rounded">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="h-[25%] border-b border-amber-900/50 flex items-end px-1 gap-0.5">
                  {[0, 1, 2].map(j => (
                    <div 
                      key={j} 
                      className="w-2 bg-gradient-to-t from-slate-600 to-slate-500 rounded-t"
                      style={{ height: `${50 + Math.random() * 40}%` }}
                    />
                  ))}
                </div>
              ))}
            </div>
            {/* Plant */}
            <div className="absolute bottom-[10%] left-[30%]">
              <div className="w-8 h-10 bg-emerald-600 rounded-full" />
              <div className="w-4 h-6 bg-amber-700 mx-auto -mt-1 rounded-b" />
            </div>
            {/* Desk hint */}
            <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-gradient-to-t from-amber-100 to-transparent" />
          </div>
        );
      
      case 'modern':
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
            {/* Neon accents */}
            <div className="absolute top-[20%] left-[10%] w-[2px] h-[40%] bg-gradient-to-b from-pink-500 to-purple-500 shadow-lg shadow-pink-500/50" />
            <div className="absolute top-[30%] right-[15%] w-[25%] h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50" />
            {/* Geometric shapes */}
            <div className="absolute top-[15%] right-[20%] w-16 h-16 border border-pink-500/30 rotate-45" />
            <div className="absolute bottom-[25%] left-[20%] w-12 h-12 border border-cyan-500/30 rounded-full" />
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
          </div>
        );
      
      case 'startup':
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50" />
            {/* Whiteboard */}
            <div className="absolute top-[10%] left-[10%] w-[35%] h-[45%] bg-white rounded-lg shadow-lg border border-slate-200">
              <div className="p-2 space-y-1">
                <div className="h-1 bg-blue-400 rounded w-[60%]" />
                <div className="h-1 bg-green-400 rounded w-[80%]" />
                <div className="h-1 bg-yellow-400 rounded w-[40%]" />
              </div>
            </div>
            {/* Sticky notes */}
            <div className="absolute top-[20%] right-[15%] w-8 h-8 bg-yellow-300 rotate-6 shadow" />
            <div className="absolute top-[35%] right-[20%] w-8 h-8 bg-pink-300 -rotate-3 shadow" />
            <div className="absolute top-[28%] right-[10%] w-8 h-8 bg-green-300 rotate-12 shadow" />
            {/* Coffee cup */}
            <div className="absolute bottom-[15%] right-[25%]">
              <div className="w-6 h-8 bg-white rounded-b-lg border-2 border-slate-300" />
              <div className="absolute -right-2 top-2 w-3 h-4 border-2 border-slate-300 rounded-r-full" />
            </div>
          </div>
        );
      
      case 'nature':
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-200" />
            {/* Sun */}
            <div className="absolute top-[10%] right-[20%] w-16 h-16 bg-yellow-300 rounded-full shadow-lg shadow-yellow-300/50" />
            {/* Mountains */}
            <div className="absolute bottom-[30%] left-0 right-0">
              <svg viewBox="0 0 100 30" className="w-full h-auto">
                <polygon points="0,30 20,10 40,30" fill="#4ade80" />
                <polygon points="30,30 50,5 70,30" fill="#22c55e" />
                <polygon points="60,30 80,12 100,30" fill="#4ade80" />
              </svg>
            </div>
            {/* Trees */}
            <div className="absolute bottom-[20%] left-[15%]">
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-transparent border-b-emerald-600" />
              <div className="w-2 h-4 bg-amber-700 mx-auto" />
            </div>
            <div className="absolute bottom-[18%] right-[25%]">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[16px] border-transparent border-b-emerald-700" />
              <div className="w-1.5 h-3 bg-amber-800 mx-auto" />
            </div>
            {/* Ground */}
            <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-gradient-to-t from-emerald-500 to-emerald-400" />
          </div>
        );
      
      case 'minimal':
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white" />
            {/* Subtle geometric */}
            <div className="absolute top-[20%] right-[20%] w-32 h-32 border border-slate-200 rounded-full" />
            <div className="absolute bottom-[30%] left-[15%] w-24 h-24 border border-slate-200" />
            {/* Soft shadow */}
            <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-slate-100 to-transparent" />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={cn("absolute inset-0 -z-10", className)}>
      {getBackgroundStyle()}
      {/* Blur overlay for depth */}
      <div className="absolute inset-0 backdrop-blur-[1px]" />
    </div>
  );
}
