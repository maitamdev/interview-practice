import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, ArrowLeft, Eye, EyeOff, Mail, Lock, User, CheckCircle2, Brain, Target, Zap } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);
    if (error) {
      toast({
        title: 'Đăng nhập thất bại',
        description: error.message === 'Invalid login credentials' ? 'Email hoặc mật khẩu không đúng' : error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Đăng nhập thành công!' });
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      toast({ title: 'Lỗi', description: 'Mật khẩu xác nhận không khớp', variant: 'destructive' });
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Lỗi', description: 'Mật khẩu phải có ít nhất 6 ký tự', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, name);
    if (error) {
      toast({ title: 'Đăng ký thất bại', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Đăng ký thành công!', description: 'Chào mừng bạn đến với AI Interview Coach' });
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('reset-email') as string;

    const { error } = await resetPassword(email);
    if (error) {
      toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
    } else {
      setResetEmailSent(true);
      toast({ title: 'Email đã được gửi!', description: 'Vui lòng kiểm tra hộp thư của bạn' });
    }
    setLoading(false);
  };

  const features = [
    { icon: Brain, text: 'AI phỏng vấn thông minh' },
    { icon: Target, text: 'Đánh giá chi tiết từng câu' },
    { icon: Zap, text: 'Feedback tức thì' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <motion.div 
        className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12 bg-white"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-md mx-auto w-full">
          {/* Back link */}
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Về trang chủ
          </Link>

          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center shadow-lg shadow-primary/30">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold">AI Interview Coach</span>
          </motion.div>

          <AnimatePresence mode="wait">
            {forgotPasswordMode ? (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-display font-bold mb-2">Quên mật khẩu?</h1>
                <p className="text-muted-foreground mb-8">Nhập email để nhận link đặt lại mật khẩu</p>

                {resetEmailSent ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Email đã được gửi!</h3>
                    <p className="text-muted-foreground mb-8">Kiểm tra hộp thư và làm theo hướng dẫn</p>
                    <Button variant="outline" className="h-12 px-8 rounded-xl" onClick={() => { setForgotPasswordMode(false); setResetEmailSent(false); }}>
                      Quay lại đăng nhập
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input name="reset-email" type="email" placeholder="your@email.com" required className="h-14 pl-12 text-base rounded-xl border-2 focus:border-primary" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-teal-500 hover:scale-[1.02] transition-all" disabled={loading}>
                      {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Đang gửi...</> : 'Gửi email khôi phục'}
                    </Button>
                    <Button type="button" variant="ghost" className="w-full h-12 rounded-xl" onClick={() => setForgotPasswordMode(false)}>
                      Quay lại đăng nhập
                    </Button>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-display font-bold mb-2">
                  {activeTab === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
                </h1>
                <p className="text-muted-foreground mb-8">
                  {activeTab === 'login' ? 'Đăng nhập để tiếp tục luyện phỏng vấn' : 'Bắt đầu hành trình chinh phục phỏng vấn'}
                </p>

                {/* Tab buttons */}
                <div className="flex gap-2 p-1.5 bg-muted/50 rounded-xl mb-8">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 h-12 rounded-lg text-base font-medium transition-all ${activeTab === 'login' ? 'bg-white shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`flex-1 h-12 rounded-lg text-base font-medium transition-all ${activeTab === 'register' ? 'bg-white shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Đăng ký
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'login' ? (
                    <motion.form
                      key="login-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleSignIn}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input name="email" type="email" placeholder="your@email.com" required autoComplete="email" className="h-14 pl-12 text-base rounded-xl border-2 focus:border-primary" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-sm font-medium">Mật khẩu</Label>
                          <button type="button" onClick={() => setForgotPasswordMode(true)} className="text-sm text-primary hover:underline font-medium">Quên mật khẩu?</button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" required autoComplete="current-password" className="h-14 pl-12 pr-12 text-base rounded-xl border-2 focus:border-primary" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-teal-500 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all" disabled={loading}>
                        {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Đang đăng nhập...</> : 'Đăng nhập'}
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="register-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleSignUp}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Họ tên</Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input name="name" type="text" placeholder="Nguyễn Văn A" required autoComplete="name" className="h-14 pl-12 text-base rounded-xl border-2 focus:border-primary" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input name="email" type="email" placeholder="your@email.com" required autoComplete="email" className="h-14 pl-12 text-base rounded-xl border-2 focus:border-primary" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Mật khẩu</Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" required autoComplete="new-password" className="h-14 pl-12 pr-12 text-base rounded-xl border-2 focus:border-primary" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Xác nhận mật khẩu</Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" required autoComplete="new-password" className="h-14 pl-12 pr-12 text-base rounded-xl border-2 focus:border-primary" />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-teal-500 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all" disabled={loading}>
                        {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Đang đăng ký...</> : 'Đăng ký'}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Right side - Image & Info */}
      <motion.div 
        className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary/10 via-teal-500/10 to-primary/5 relative overflow-hidden"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Background effects */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-teal-400/20 rounded-full blur-[120px]" />
        
        {/* Floating dots */}
        <motion.div className="absolute top-1/4 right-1/4 w-4 h-4 bg-primary/40 rounded-full" animate={{ y: [0, -20, 0] }} transition={{ duration: 3, repeat: Infinity }} />
        <motion.div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-teal-400/50 rounded-full" animate={{ y: [0, 15, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />
        <motion.div className="absolute top-1/2 right-1/3 w-2 h-2 bg-primary/60 rounded-full" animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />

        <div className="flex flex-col items-center justify-center w-full p-12 relative z-10">
          {/* Main image */}
          <motion.div
            className="relative mb-12"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-teal-400/30 rounded-3xl blur-2xl scale-105" />
            <img src="/logo.png" alt="Interview" className="relative w-80 h-auto rounded-3xl shadow-2xl" />
            
            {/* Floating card */}
            <motion.div 
              className="absolute -right-8 top-1/4 bg-white rounded-xl p-4 shadow-xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Điểm: 4.8/5</p>
                  <p className="text-xs text-muted-foreground">Xuất sắc!</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Features */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
