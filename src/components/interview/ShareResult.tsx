import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Share2, 
  Copy, 
  Check, 
  Linkedin, 
  Facebook, 
  Twitter,
  Link2,
  Loader2
} from 'lucide-react';

interface ShareResultProps {
  sessionId: string;
  score: number;
  role: string;
  level: string;
}

export function ShareResult({ sessionId, score, role, level }: ShareResultProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareLink = async () => {
    setIsLoading(true);
    try {
      // Check if share already exists (using any to bypass type checking)
      const { data: existing } = await (supabase
        .from('shared_results' as any)
        .select('share_code')
        .eq('session_id', sessionId)
        .single() as any);

      if (existing) {
        const url = `${window.location.origin}/share/${existing.share_code}`;
        setShareUrl(url);
        return;
      }

      // Generate new share code
      const shareCode = btoa(sessionId).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await (supabase
        .from('shared_results' as any)
        .insert({
          user_id: user.user.id,
          session_id: sessionId,
          share_code: shareCode,
          is_public: true,
        }) as any);

      if (error) throw error;

      const url = `${window.location.origin}/share/${shareCode}`;
      setShareUrl(url);
    } catch (error) {
      console.error('Error generating share link:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo link chia sẻ',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Đã copy!', description: 'Link đã được copy vào clipboard' });
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể copy link', variant: 'destructive' });
    }
  };

  const shareToSocial = (platform: 'linkedin' | 'facebook' | 'twitter') => {
    if (!shareUrl) return;
    
    const text = `Tôi vừa hoàn thành phỏng vấn ${role} (${level}) với điểm ${score.toFixed(1)}/5 trên AI Interview Coach! 🎯`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let socialUrl = '';
    switch (platform) {
      case 'linkedin':
        socialUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'facebook':
        socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'twitter':
        socialUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
    }
    
    window.open(socialUrl, '_blank', 'width=600,height=400');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" onClick={() => {
          setIsOpen(true);
          if (!shareUrl) generateShareLink();
        }}>
          <Share2 className="h-4 w-4" />
          Chia sẻ
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Chia sẻ kết quả
          </DialogTitle>
          <DialogDescription>
            Chia sẻ thành tích phỏng vấn của bạn lên mạng xã hội
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Score preview */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border text-center">
            <div className="text-4xl font-bold text-primary mb-1">{score.toFixed(1)}/5</div>
            <div className="text-sm text-muted-foreground">
              {role} • {level}
            </div>
          </div>

          {/* Share link */}
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : shareUrl ? (
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="text-sm" />
              <Button size="icon" variant="outline" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          ) : null}

          {/* Social buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="gap-2 bg-[#0077B5]/10 hover:bg-[#0077B5]/20 border-[#0077B5]/30"
              onClick={() => shareToSocial('linkedin')}
              disabled={!shareUrl}
            >
              <Linkedin className="h-4 w-4 text-[#0077B5]" />
              LinkedIn
            </Button>
            <Button
              variant="outline"
              className="gap-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border-[#1877F2]/30"
              onClick={() => shareToSocial('facebook')}
              disabled={!shareUrl}
            >
              <Facebook className="h-4 w-4 text-[#1877F2]" />
              Facebook
            </Button>
            <Button
              variant="outline"
              className="gap-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border-[#1DA1F2]/30"
              onClick={() => shareToSocial('twitter')}
              disabled={!shareUrl}
            >
              <Twitter className="h-4 w-4 text-[#1DA1F2]" />
              Twitter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
