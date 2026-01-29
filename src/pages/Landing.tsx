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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-50" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center space-y-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">AI-Powered Interview Practice</span>
            </motion.div>

            {/* Heading */}
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight"
            >
              Chinh phục mọi
              <br />
              <span className="text-primary">buổi phỏng vấn</span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Luyện tập phỏng vấn với AI thông minh. Nhận phản hồi chi tiết và cải thiện kỹ năng của bạn mỗi ngày.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <Link to={user ? '/interview/new' : '/auth'}>
                <Button size="lg" className="h-14 px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                  <Play className="mr-2 h-5 w-5" />
                  {user ? 'Bắt đầu phỏng vấn' : 'Bắt đầu miễn phí'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {!user && (
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base">
                    Đăng nhập
                  </Button>
                </Link>
              )}
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap justify-center gap-6 pt-8"
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
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-display font-semibold">AI Interview Coach</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 AI Interview Coach. Made with ❤️
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
