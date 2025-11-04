import { motion } from 'motion/react';
import { Calendar, Clock, User, ArrowRight, TrendingUp, Heart, Sparkles } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function MagazinePage() {
  const { t, isRTL } = useLanguage();

  const featured = {
    title: 'The Complete Guide to Hair Transplantation in 2025',
    excerpt: 'Everything you need to know about modern hair transplant techniques, recovery, and results',
    image: 'https://images.unsplash.com/photo-1624595110541-b50f76b524e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    author: 'Dr. Sarah Anderson',
    date: 'Nov 4, 2025',
    readTime: '12 min read',
    category: 'Hair Care',
  };

  const articles = [
    {
      title: 'Understanding FUE vs FUT Hair Transplant Methods',
      excerpt: 'Compare the two most popular hair transplant techniques and find which one is right for you',
      image: 'https://images.unsplash.com/photo-1624595110541-b50f76b524e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      author: 'Dr. Emily Roberts',
      date: 'Nov 1, 2025',
      readTime: '8 min read',
      category: 'Procedures',
    },
    {
      title: 'Perfect Eyebrow Shape Guide for Every Face',
      excerpt: 'Learn how to choose the ideal eyebrow shape based on your facial features',
      image: 'https://images.unsplash.com/photo-1737746165411-bdb26bab61cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      author: 'Dr. Lisa Chen',
      date: 'Oct 28, 2025',
      readTime: '6 min read',
      category: 'Beauty Tips',
    },
    {
      title: 'PRP Treatment: Natural Hair Growth Solution',
      excerpt: 'Discover how Platelet-Rich Plasma therapy can stimulate natural hair growth',
      image: 'https://images.unsplash.com/photo-1664549761426-6a1cb1032854?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      author: 'Dr. Maria Garcia',
      date: 'Oct 25, 2025',
      readTime: '10 min read',
      category: 'Treatments',
    },
    {
      title: 'Post-Transplant Care: Essential Tips',
      excerpt: 'Maximize your results with proper aftercare following hair transplant surgery',
      image: 'https://images.unsplash.com/photo-1673378630655-6a0e8eba07b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      author: 'Dr. Sarah Anderson',
      date: 'Oct 20, 2025',
      readTime: '7 min read',
      category: 'Recovery',
    },
    {
      title: 'Eyelash Enhancement: What to Expect',
      excerpt: 'A comprehensive overview of eyelash implant procedures and results',
      image: 'https://images.unsplash.com/photo-1673378630655-6a0e8eba07b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      author: 'Dr. Emily Roberts',
      date: 'Oct 15, 2025',
      readTime: '9 min read',
      category: 'Procedures',
    },
    {
      title: 'Hair Loss Prevention: Early Signs & Solutions',
      excerpt: 'Identify the warning signs of hair loss and take action before it progresses',
      image: 'https://images.unsplash.com/photo-1624595110541-b50f76b524e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      author: 'Dr. Lisa Chen',
      date: 'Oct 10, 2025',
      readTime: '11 min read',
      category: 'Hair Care',
    },
  ];

  const trending = [
    'Top 10 Hair Care Myths Debunked',
    'Celebrity Hair Transplants: Before & After',
    'Natural Remedies for Hair Growth',
    'Understanding Hair Loss in Women',
    'Beard Transplant: Complete Guide',
  ];

  const categories = [
    { name: 'Hair Care', count: 24, color: 'from-pink-500 to-rose-500' },
    { name: 'Procedures', count: 18, color: 'from-purple-500 to-pink-500' },
    { name: 'Beauty Tips', count: 32, color: 'from-blue-500 to-purple-500' },
    { name: 'Treatments', count: 15, color: 'from-green-500 to-blue-500' },
    { name: 'Recovery', count: 12, color: 'from-orange-500 to-pink-500' },
  ];

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Beauty Magazine
            </h1>
            <p className="text-gray-700 max-w-3xl mx-auto">
              Expert insights, tips, and the latest trends in hair and beauty care
            </p>
          </motion.div>

          {/* Featured Article */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden border-0 shadow-2xl">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative h-96 lg:h-auto overflow-hidden">
                  <ImageWithFallback
                    src={featured.image}
                    alt={featured.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                      Featured
                    </Badge>
                  </div>
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-white to-pink-50/30">
                  <Badge className="mb-4 w-fit bg-pink-100 text-pink-700 border-0">
                    {featured.category}
                  </Badge>
                  <h2 className="mb-4 text-gray-900">{featured.title}</h2>
                  <p className="text-gray-600 mb-6">{featured.excerpt}</p>
                  <div className="flex items-center gap-6 text-gray-500 mb-6">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{featured.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{featured.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{featured.readTime}</span>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full w-fit px-8">
                    {t('readMore')}
                    <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Articles */}
            <div className="lg:col-span-2">
              <h2 className="mb-8 text-gray-900">Latest Articles</h2>
              <div className="space-y-8">
                {articles.map((article, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
                      <div className="flex flex-col md:flex-row">
                        <div className="relative md:w-80 h-56 overflow-hidden group flex-shrink-0">
                          <ImageWithFallback
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <Badge className="mb-3 w-fit bg-purple-100 text-purple-700 border-0">
                            {article.category}
                          </Badge>
                          <h3 className="mb-3 text-gray-900">{article.title}</h3>
                          <p className="text-gray-600 mb-4 flex-1">{article.excerpt}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-gray-500">
                              <span className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {article.author}
                              </span>
                              <span className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {article.readTime}
                              </span>
                            </div>
                            <Button variant="ghost" className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-full">
                              Read <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-12">
                <Button variant="outline" className="rounded-full px-8 border-2 border-pink-500 text-pink-600 hover:bg-pink-50">
                  Load More Articles
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Categories */}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30">
                  <h3 className="mb-6 text-gray-900">Categories</h3>
                  <div className="space-y-3">
                    {categories.map((category, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: isRTL ? -5 : 5 }}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:shadow-md transition-all group"
                      >
                        <span className="text-gray-700 group-hover:text-gray-900">{category.name}</span>
                        <Badge className={`bg-gradient-to-r ${category.color} text-white border-0`}>
                          {category.count}
                        </Badge>
                      </motion.button>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Trending */}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-white to-pink-50/30">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-pink-500" />
                    <h3 className="text-gray-900">Trending Now</h3>
                  </div>
                  <div className="space-y-4">
                    {trending.map((item, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="w-full text-left p-3 rounded-xl hover:bg-white hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-pink-500 mt-1">{index + 1}.</span>
                          <span className="text-gray-700 group-hover:text-gray-900 flex-1">
                            {item}
                          </span>
                          <ArrowRight className={`w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-colors flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Newsletter */}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
                  
                  <div className="relative z-10">
                    <Sparkles className="w-8 h-8 mb-4" />
                    <h3 className="mb-3 text-white">Subscribe to Newsletter</h3>
                    <p className="text-white/90 mb-6">
                      Get the latest beauty tips and exclusive offers directly to your inbox
                    </p>
                    <Button className="w-full bg-white text-purple-600 hover:bg-gray-100 rounded-full">
                      Subscribe Now
                    </Button>
                  </div>
                </Card>
              </motion.div>

              {/* Popular Tags */}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6 border-0 shadow-lg">
                  <h3 className="mb-6 text-gray-900">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Hair Care', 'Beauty', 'FUE', 'Eyebrows', 'PRP', 'Transplant', 'Recovery', 'Tips', 'Natural', 'Results'].map((tag, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                        whileHover={{ scale: 1.1 }}
                        className="px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 text-pink-600 rounded-full hover:from-pink-100 hover:to-purple-100 transition-all"
                      >
                        {tag}
                      </motion.button>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
