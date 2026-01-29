import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { 
  Sparkles, 
  MessageSquare, 
  BarChart3, 
  Target, 
  Zap,
  CheckCircle2,
  ArrowRight,
  Brain,
  Clock,
  TrendingUp,
  Play,
  Star,
  Users,
  Award
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export default function Landing() {
  const { user } = useAuth();

  const features = [
    {
      icon: Brain,
      title: 'AI Phỏng Vấn Thông Minh',
      description: 'Mô phỏng người phỏng vấn thực tế với follow-up questions thông minh',
    },
    {
      icon: Target,
      title: 'Đánh Giá Chuyên Sâu',
      description: 'Chấm điểm theo rubric chuyên nghiệp với feedback cụ thể từng câu',
    },
    {
      icon: TrendingUp,
      title: 'Adaptive Difficulty',
      description: 'Tự động điều chỉnh độ khó dựa trên performance của bạn',
    },
    {
      icon: Clock,
      title: 'Time Management',
      description: 'Luyện tập trả lời trong giới hạn thời gian như thật',
    },
  ];

  const roles = [
    'Frontend', 'Backend', 'Fullstack', 'Data Engineer', 'QA', 'BA', 'DevOps', 'Mobile'
  ];

  const stats = [
    { value: '10K+', label: 'Phỏng vấn hoàn thành' },
    { value: '95%', label: 'Hài lòng' },
    { value: '8+', label: 'Vị trí hỗ trợ' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
          
          {/* Floating shapes */}
          <motion.div 
            className="absolute top-32 right-1/4 w-4 h-4 bg-primary/40 rounded-full"
            animate={{ y: [0, -20, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div 
            className="absolute top-48 left-1/4 w-3 h-3 bg-teal-400/50 rounded-full"
            animate={{ y: [0, 15, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          />
          <motion.div 
            className="absolute bottom-32 left-1/3 w-2 h-2 bg-primary/60 rounded-full"
            animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(45,212,191,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text content */}
            <motion.div 
              className="space-y-8"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
            {/* Heading */}
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight"
            >
                Chinh phục mọi
                <br />
                <span className="bg-gradient-to-r from-primary via-teal-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">buổi phỏng vấn</span>
              </motion.h1>

              {/* Description */}
              <motion.p 
                variants={fadeInUp}
                className="text-lg text-muted-foreground max-w-lg"
              >
                Luyện tập phỏng vấn với AI thông minh. Nhận phản hồi chi tiết và cải thiện kỹ năng của bạn mỗi ngày.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link to={user ? '/interview/new' : '/auth'}>
                  <Button size="lg" className="h-14 px-8 text-base font-semibold bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-300">
                    <Play className="mr-2 h-5 w-5" />
                    {user ? 'Bắt đầu phỏng vấn' : 'Bắt đầu miễn phí'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                {!user && (
                  <Link to="/auth">
                    <Button size="lg" variant="outline" className="h-14 px-8 text-base border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300">
                      Đăng nhập
                    </Button>
                  </Link>
                )}
              </motion.div>

              {/* Trust indicators */}
              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap gap-6"
              >
                {[
                  { icon: CheckCircle2, text: 'Miễn phí' },
                  { icon: Zap, text: 'Feedback tức thì' },
                  { icon: Star, text: 'Song ngữ VI/EN' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-muted-foreground">
                    <item.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right - Image with effects */}
            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                {/* Glow effect behind image */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-teal-400/20 rounded-2xl blur-2xl scale-105" />
                
                <img 
                  src="/logo1.png" 
                  alt="AI Interview Coach" 
                  className="relative w-full h-auto rounded-2xl shadow-2xl border border-white/10"
                />
                
                {/* Floating cards */}
                <motion.div 
                  className="absolute -left-8 top-1/4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-100"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Điểm: 4.5/5</p>
                      <p className="text-[10px] text-gray-500">Câu trả lời xuất sắc!</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="absolute -right-4 bottom-1/4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-100"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">AI Feedback</p>
                      <p className="text-[10px] text-gray-500">Đang phân tích...</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border/50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex flex-wrap justify-center gap-12 md:gap-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={fadeInUp} className="text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.p 
            className="text-center text-muted-foreground mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Hỗ trợ phỏng vấn cho các vị trí
          </motion.p>
          <motion.div 
            className="flex flex-wrap justify-center gap-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {roles.map((role) => (
              <motion.span
                key={role}
                variants={fadeInUp}
                className="px-4 py-2 rounded-full bg-muted/50 border border-border text-sm font-medium hover:bg-muted hover:border-primary/30 transition-colors"
              >
                {role}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Mọi thứ bạn cần để chuẩn bị cho buổi phỏng vấn tiếp theo
            </p>
          </motion.div>

          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Cách thức hoạt động
            </h2>
            <p className="text-muted-foreground">
              3 bước đơn giản để bắt đầu
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                step: '1',
                icon: MessageSquare,
                title: 'Chọn vị trí & cấp độ',
                description: 'Thiết lập buổi phỏng vấn phù hợp với mục tiêu của bạn',
              },
              {
                step: '2',
                icon: Zap,
                title: 'Trả lời câu hỏi',
                description: 'AI interviewer hỏi như thật, bạn trả lời và nhận feedback ngay',
              },
              {
                step: '3',
                icon: BarChart3,
                title: 'Xem báo cáo',
                description: 'Phân tích chi tiết và kế hoạch cải thiện cá nhân hóa',
              },
            ].map((item, index) => (
              <motion.div key={index} variants={fadeInUp} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Award className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Sẵn sàng để ace buổi phỏng vấn?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Bắt đầu luyện tập ngay hôm nay với AI Interview Coach
            </p>
            <Link to={user ? '/interview/new' : '/auth'}>
              <Button size="lg" className="h-14 px-10 text-base font-semibold shadow-lg shadow-primary/25">
                {user ? 'Tạo phỏng vấn mới' : 'Đăng ký miễn phí'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded" />
              <span className="font-display font-semibold">AI Interview Coach</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 AI Interview Coach. Made with ❤️ by DevTam
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
