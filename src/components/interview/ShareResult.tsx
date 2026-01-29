import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Check, Facebook, Linkedin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareResultProps {
  score: number;
  role: string;
  level: string;
}

export function ShareResult({ score, role, level }: ShareResultProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareText = `🎯 Tôi vừa hoàn thành phỏng vấn ${role} (${level}) với điểm ${score.toFixed(1)}/5 trên AI Interview Coach! #InterviewPractice #CareerGrowth`;
  
  const shareUrl = window.location.href;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      toast({ title: 'Đã copy!' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Không thể copy', variant: 'destructive' });
    }
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Kết quả phỏng vấn',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Chia sẻ
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chia sẻ kết quả</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">{shareText}</p>
          </div>

          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="flex-1" />
            <Button variant="outline" size="icon" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={shareToFacebook}
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={shareToLinkedIn}
            >
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
          </div>

          {navigator.share && (
            <Button className="w-full" onClick={shareNative}>
              <Share2 className="h-4 w-4 mr-2" />
              Chia sẻ khác
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
