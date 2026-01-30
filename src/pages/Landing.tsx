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
  Award,
  Shield,
  Lightbulb,
  GraduationCap,
  Building2,
  Briefcase,
  ChevronRight,
  Quote
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

export default function Landing() {
  const { user } = useAuth();

  const features = [
    {
      icon: Brain,
      title: 'Phỏng Vấn Thông Minh',
      description: 'AI mô phỏng người phỏng vấn thực tế với câu hỏi follow-up thông minh, điều chỉnh theo câu trả lời của bạn.',
    },
    {
      icon: Target,
      title: 'Đánh Giá Chuyên Sâu',
      description: 'Chấm điểm theo rubric chuyên nghiệp với feedback chi tiết cho từng câu trả lời.',
    },
    {
      icon: TrendingUp,
      title: 'Độ Khó Thích Ứng',
      description: 'Tự động điều chỉnh độ khó dựa trên performance, giúp bạn tiến bộ nhanh hơn.',
    },
    {
      icon: Clock,
      title: 'Quản Lý Thời Gian',
      description: 'Luyện tập trả lời trong giới hạn thời gian như phỏng vấn thật.',
    },
    {
      icon: BarChart3,
      title: 'Phân Tích Chi Tiết',
      description: 'Báo cáo toàn diện về điểm mạnh, điểm yếu và lộ trình cải thiện cá nhân hóa.',
    },
    {
      icon: GraduationCap,
      title: 'Lộ Trình Học Tập',
      description: 'AI đề xuất lộ trình học tập dựa trên kết quả phỏng vấn của bạn.',
    },
  ];

  const roles = [
    { name: 'Frontend Developer', icon: '🎨' },
    { name: 'Backend Developer', icon: '⚙️' },
    { name: 'Fullstack Developer', icon: '🔧' },
    { name: 'Data Engineer', icon: '📊' },
    { name: 'QA/Tester', icon: '🔍' },
    { name: 'Business Analyst', icon: '📋' },
    { name: 'DevOps Engineer', icon: '🚀' },
    { name: 'Mobile Developer', icon: '📱' },
    { name: 'Marketing', icon: '📢' },
    { name: 'Sales', icon: '💼' },
    { name: 'HR', icon: '👥' },
    { name: 'Product Manager', icon: '🎯' },
  ];

  const stats = [
    { value: '10,000+', label: 'Phỏng vấn hoàn thành' },
    { value: '95%', label: 'Người dùng hài lòng' },
    { value: '16+', label: 'Vị trí hỗ trợ' },
    { value: '4', label: 'Cấp độ kinh nghiệm' },
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Phỏng Vấn Hiệu Quả, Ứng Viên Xuất Sắc',
      description: 'Sử dụng AI để tối ưu hóa quá trình tuyển dụng, giảm thời gian sàng lọc và xác định ứng viên tiềm năng một cách hiệu quả.',
    },
    {
      icon: Lightbulb,
      title: 'Câu Hỏi Tùy Chỉnh, Kết Quả Chính Xác',
      description: 'Điều chỉnh câu hỏi phỏng vấn theo nhu cầu cụ thể với thư viện câu hỏi đa dạng cho từng vị trí và cấp độ.',
    },
    {
      icon: Shield,
      title: 'Quy Trình Chuẩn Hóa, Đánh Giá Công Bằng',
      description: 'Chuẩn hóa quy trình phỏng vấn, đảm bảo tính công bằng và nhất quán trong đánh giá ứng viên.',
    },
    {
      icon: BarChart3,
      title: 'Dữ Liệu Thông Minh, Quyết Định Chiến Lược',
      description: 'Tận dụng phân tích AI để có cái nhìn sâu sắc về ứng viên, đưa ra quyết định tuyển dụng dựa trên dữ liệu.',
    },
  ];

  const testimonials = [
    {
      name: 'Nguyễn Văn A',
      role: 'Frontend Developer tại FPT',
      content: 'Nhờ luyện tập với AI Interview Coach, tôi đã tự tin hơn rất nhiều trong buổi phỏng vấn thực tế và nhận được offer mơ ước.',
      avatar: '👨‍💻',
    },
    {
      name: 'Trần Thị B',
      role: 'HR Manager tại VNG',
      content: 'Công cụ tuyệt vời để đào tạo nhân viên mới về kỹ năng phỏng vấn. Feedback chi tiết giúp họ cải thiện nhanh chóng.',
      avatar: '👩‍💼',
    },
    {
      name: 'Lê Văn C',
      role: 'Sinh viên CNTT',
      content: 'Là sinh viên mới ra trường, tôi rất lo lắng về phỏng vấn. AI Interview Coach giúp tôi chuẩn bị kỹ lưỡng và tự tin hơn.',
      avatar: '🎓',
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-teal-400/15 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(45,212,191,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text content */}
            <motion.div 
              className="text-center lg:text-left"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Badge */}
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Nền tảng luyện phỏng vấn #1 Việt Nam</span>
              </motion.div>

              {/* Heading */}
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6"
              >
                Nâng Tầm Kỹ Năng
                <br />
                <span className="bg-gradient-to-r from-primary via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                  Phỏng Vấn Với AI
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p 
                variants={fadeInUp}
                className="text-xl text-muted-foreground max-w-xl mb-10"
              >
                Cách mạng hóa trải nghiệm phỏng vấn của bạn. Luyện tập với AI thông minh, 
                nhận phản hồi chi tiết và tự tin chinh phục mọi buổi phỏng vấn.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
              >
                <Link to={user ? '/interview/new' : '/auth'}>
                  <Button size="lg" className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-300">
                    <Play className="mr-2 h-5 w-5" />
                    {user ? 'Bắt đầu phỏng vấn' : 'Bắt đầu miễn phí'}
                  </Button>
                </Link>
                <Link to="#features">
                  <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-2 hover:bg-primary/5 transition-all duration-300">
                    Tìm hiểu thêm
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap justify-center lg:justify-start gap-6"
              >
                {[
                  { icon: CheckCircle2, text: 'Hoàn toàn miễn phí' },
                  { icon: Zap, text: 'Feedback tức thì' },
                  { icon: Shield, text: 'Bảo mật dữ liệu' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-muted-foreground">
                    <item.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right - Hero Image */}
            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-teal-400/30 rounded-3xl blur-3xl scale-105" />
                
                {/* Main image */}
                <img 
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=700&fit=crop&crop=faces"
                  alt="Professional interview"
                  className="relative w-full h-auto rounded-3xl shadow-2xl border border-white/10 object-cover"
                />
                
                {/* Floating card - Score */}
                <motion.div 
                  className="absolute -left-6 top-1/4 bg-white dark:bg-card rounded-xl p-4 shadow-xl border border-border"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Điểm: 4.5/5</p>
                      <p className="text-xs text-muted-foreground">Câu trả lời xuất sắc!</p>
                    </div>
                  </div>
                </motion.div>
                
                {/* Floating card - AI Feedback */}
                <motion.div 
                  className="absolute -right-4 bottom-1/3 bg-white dark:bg-card rounded-xl p-4 shadow-xl border border-border"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">AI Feedback</p>
                      <p className="text-xs text-muted-foreground">Phân tích chi tiết</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating card - Users */}
                <motion.div 
                  className="absolute left-1/4 -bottom-4 bg-white dark:bg-card rounded-xl p-4 shadow-xl border border-border"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, delay: 1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">👨</div>
                      <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-sm">👩</div>
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm">👨‍💻</div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">10,000+</p>
                      <p className="text-xs text-muted-foreground">Người dùng</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={fadeInUp} className="text-center">
                <div className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-muted-foreground mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* For Companies & Schools Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            {/* Left - Image */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInLeft}
              className="relative order-2 lg:order-1"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-primary/20 rounded-3xl blur-3xl" />
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=500&fit=crop"
                  alt="Team meeting"
                  className="relative w-full h-auto rounded-3xl shadow-2xl border border-white/10"
                />
                {/* Overlay card */}
                <motion.div 
                  className="absolute -right-4 -bottom-4 bg-white dark:bg-card rounded-xl p-4 shadow-xl border border-border"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">500+ Doanh nghiệp</p>
                      <p className="text-xs text-muted-foreground">Đang sử dụng</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right - Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInRight}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                <Building2 className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Dành cho Doanh nghiệp & Trường học</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Cách Mạng Hóa Quy Trình
                <br />
                <span className="text-primary">Phỏng Vấn Của Bạn</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Trao quyền cho tổ chức hoặc trường học của bạn với AI Interview Coach 
                và đạt được kết quả tốt hơn cho cả ứng viên và nhà tuyển dụng.
              </p>
              <ul className="space-y-4">
                {benefits.slice(0, 3).map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <benefit.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{benefit.title}</p>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Tính Năng Nổi Bật
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Mọi thứ bạn cần để chuẩn bị cho buổi phỏng vấn tiếp theo
            </p>
          </motion.div>

          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
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

      {/* Roles Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Hỗ Trợ Đa Dạng Vị Trí
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Từ Tech đến Business, chúng tôi có câu hỏi phỏng vấn cho mọi ngành nghề
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {roles.map((role, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-default"
              >
                <span className="text-xl">{role.icon}</span>
                <span className="font-medium">{role.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Cách Thức Hoạt Động
            </h2>
            <p className="text-xl text-muted-foreground">
              3 bước đơn giản để bắt đầu hành trình của bạn
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                step: '01',
                icon: Briefcase,
                title: 'Chọn Vị Trí & Cấp Độ',
                description: 'Thiết lập buổi phỏng vấn phù hợp với mục tiêu nghề nghiệp của bạn. Chọn từ 16+ vị trí và 4 cấp độ kinh nghiệm.',
              },
              {
                step: '02',
                icon: MessageSquare,
                title: 'Phỏng Vấn Với AI',
                description: 'Trả lời câu hỏi từ AI interviewer thông minh. Nhận feedback chi tiết ngay sau mỗi câu trả lời.',
              },
              {
                step: '03',
                icon: TrendingUp,
                title: 'Xem Báo Cáo & Cải Thiện',
                description: 'Phân tích chi tiết điểm mạnh, điểm yếu và lộ trình học tập cá nhân hóa để tiến bộ nhanh hơn.',
              },
            ].map((item, index) => (
              <motion.div key={index} variants={fadeInUp} className="relative">
                <div className="text-center p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {item.step}
                    </span>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center mx-auto mb-6 mt-4">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Người Dùng Nói Gì?
            </h2>
            <p className="text-xl text-muted-foreground">
              Hàng nghìn người đã cải thiện kỹ năng phỏng vấn với chúng tôi
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="p-6 rounded-2xl bg-card border border-border"
              >
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* For Students Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-transparent to-teal-500/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInLeft}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <GraduationCap className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Dành cho Sinh viên</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Trang Bị Cho Sinh Viên
                <br />
                <span className="text-primary">Sẵn Sàng Ra Trường</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Trang bị cho sinh viên sắp tốt nghiệp với các buổi luyện tập phỏng vấn 
                được cá nhân hóa theo nguyện vọng nghề nghiệp. Giúp họ có lợi thế cạnh tranh 
                trong thị trường việc làm đầy thách thức ngày nay.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Câu hỏi phỏng vấn theo từng ngành nghề',
                  'Feedback chi tiết giúp cải thiện nhanh',
                  'Lộ trình học tập cá nhân hóa',
                  'Hoàn toàn miễn phí cho sinh viên',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to={user ? '/interview/new' : '/auth'}>
                <Button size="lg" className="h-12 px-8">
                  Bắt đầu luyện tập
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInRight}
              className="relative"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-primary/20 rounded-3xl blur-3xl" />
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=500&fit=crop"
                  alt="Students studying"
                  className="relative w-full h-auto rounded-3xl shadow-2xl border border-white/10"
                />
                {/* Floating card */}
                <motion.div 
                  className="absolute -left-4 bottom-1/4 bg-white dark:bg-card rounded-xl p-4 shadow-xl border border-border"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Sinh viên IT</p>
                      <p className="text-xs text-muted-foreground">Điểm: 4.5/5 ⭐</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="absolute -right-4 top-1/4 bg-white dark:bg-card rounded-xl p-4 shadow-xl border border-border"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Nhận Offer!</p>
                      <p className="text-xs text-muted-foreground">FPT Software</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto text-center p-12 md:p-16 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-teal-500/10 border border-primary/20"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Award className="h-16 w-16 text-primary mx-auto mb-8" />
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              Sẵn Sàng Chinh Phục
              <br />
              Buổi Phỏng Vấn Tiếp Theo?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Tham gia cùng hàng nghìn người đã cải thiện kỹ năng phỏng vấn 
              và đạt được công việc mơ ước với AI Interview Coach.
            </p>
            <Link to={user ? '/interview/new' : '/auth'}>
              <Button size="lg" className="h-16 px-12 text-lg font-semibold bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 shadow-xl shadow-primary/30">
                {user ? 'Tạo phỏng vấn mới' : 'Bắt đầu miễn phí ngay'}
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-6">
              Không cần thẻ tín dụng • Miễn phí mãi mãi
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-xl" />
              <div>
                <span className="font-display font-bold text-lg">AI Interview Coach</span>
                <p className="text-xs text-muted-foreground">Nền tảng luyện phỏng vấn #1 Việt Nam</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
              <Link to="/interview/new" className="hover:text-primary transition-colors">Phỏng vấn</Link>
              <Link to="/leaderboard" className="hover:text-primary transition-colors">Bảng xếp hạng</Link>
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
