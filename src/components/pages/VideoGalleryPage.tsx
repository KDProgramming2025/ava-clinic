import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Grid3x3, List, Filter, Search } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function VideoGalleryPage() {
  const { isRTL } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const videos = [
    {
      id: 1,
      title: 'Hair Implant Procedure Overview',
      category: 'hair',
      thumbnail: 'https://images.unsplash.com/photo-1624595110541-b50f76b524e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      duration: '5:32',
      views: '12.5K',
      description: 'Complete walkthrough of our advanced FUE hair transplant procedure',
    },
    {
      id: 2,
      title: 'Eyebrow Implant Transformation',
      category: 'eyebrow',
      thumbnail: 'https://images.unsplash.com/photo-1737746165411-bdb26bab61cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      duration: '4:15',
      views: '8.2K',
      description: 'Before and after results of eyebrow restoration',
    },
    {
      id: 3,
      title: 'Patient Testimonial: Sarah',
      category: 'testimonial',
      thumbnail: 'https://images.unsplash.com/photo-1673378630655-6a0e8eba07b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      duration: '3:48',
      views: '15.3K',
      description: 'Real patient experience and results',
    },
    {
      id: 4,
      title: 'PRP Treatment Process',
      category: 'treatment',
      thumbnail: 'https://images.unsplash.com/photo-1664549761426-6a1cb1032854?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      duration: '6:20',
      views: '9.7K',
      description: 'Step-by-step guide to PRP therapy for hair growth',
    },
    {
      id: 5,
      title: 'Clinic Tour - Facilities',
      category: 'facility',
      thumbnail: 'https://images.unsplash.com/photo-1758691463333-c79215e8bc3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      duration: '4:55',
      views: '6.1K',
      description: 'Virtual tour of our state-of-the-art clinic',
    },
    {
      id: 6,
      title: 'Eyelash Enhancement Results',
      category: 'eyelash',
      thumbnail: 'https://images.unsplash.com/photo-1673378630655-6a0e8eba07b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      duration: '3:30',
      views: '11.2K',
      description: 'Beautiful eyelash implant transformations',
    },
    {
      id: 7,
      title: 'Expert Q&A Session',
      category: 'educational',
      thumbnail: 'https://images.unsplash.com/photo-1664549761426-6a1cb1032854?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      duration: '12:15',
      views: '7.8K',
      description: 'Common questions answered by our specialists',
    },
    {
      id: 8,
      title: 'Before & After Gallery',
      category: 'results',
      thumbnail: 'https://images.unsplash.com/photo-1624595110541-b50f76b524e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      duration: '8:45',
      views: '18.9K',
      description: 'Compilation of amazing transformation results',
    },
    {
      id: 9,
      title: 'Post-Procedure Care Guide',
      category: 'educational',
      thumbnail: 'https://images.unsplash.com/photo-1664549761426-6a1cb1032854?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      duration: '5:10',
      views: '5.4K',
      description: 'Essential aftercare tips for optimal results',
    },
  ];

  const categories = [
    { value: 'all', label: 'All Videos' },
    { value: 'hair', label: 'Hair Implant' },
    { value: 'eyebrow', label: 'Eyebrow' },
    { value: 'eyelash', label: 'Eyelash' },
    { value: 'treatment', label: 'Treatments' },
    { value: 'testimonial', label: 'Testimonials' },
    { value: 'educational', label: 'Educational' },
    { value: 'results', label: 'Results' },
    { value: 'facility', label: 'Facility' },
  ];

  const filteredVideos = videos.filter((video) => {
    const matchesCategory = filterCategory === 'all' || video.category === filterCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Video Gallery
            </h1>
            <p className="text-gray-700 max-w-3xl mx-auto">
              Watch real procedures, patient testimonials, and expert guidance
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${isRTL ? 'pr-10' : 'pl-10'} rounded-full`}
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48 rounded-full">
                <Filter className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-gray-100 rounded-full p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={`rounded-full ${viewMode === 'grid' ? 'bg-gradient-to-r from-pink-500 to-purple-600' : ''}`}
              >
                <Grid3x3 className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={`rounded-full ${viewMode === 'list' ? 'bg-gradient-to-r from-pink-500 to-purple-600' : ''}`}
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-gray-600 mt-4">
            Showing {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
          </p>
        </div>
      </section>

      {/* Video Gallery */}
      <section className="py-12 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -10 }}
                >
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                    <div
                      className="relative h-56 overflow-hidden group"
                      onClick={() => setSelectedVideo(video.id)}
                    >
                      <ImageWithFallback
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                      
                      {/* Play Button */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                          <Play className="w-8 h-8 text-pink-500 ml-1" fill="currentColor" />
                        </div>
                      </motion.div>

                      {/* Duration */}
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="mb-2 text-gray-900 line-clamp-2">{video.title}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                      <div className="flex items-center justify-between text-gray-500">
                        <span>{video.views} views</span>
                        <span className="text-pink-500 capitalize">{video.category}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => setSelectedVideo(video.id)}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="relative md:w-80 h-48 overflow-hidden group flex-shrink-0">
                        <ImageWithFallback
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                            <Play className="w-8 h-8 text-pink-500 ml-1" fill="currentColor" />
                          </div>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
                          {video.duration}
                        </div>
                      </div>
                      <div className="p-6 flex-1">
                        <h3 className="mb-3 text-gray-900">{video.title}</h3>
                        <p className="text-gray-600 mb-4">{video.description}</p>
                        <div className="flex items-center gap-4 text-gray-500">
                          <span>{video.views} views</span>
                          <span className="text-pink-500 capitalize">{video.category}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {filteredVideos.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500">No videos found matching your criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Video Player Placeholder */}
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-20 h-20 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">Video Player</p>
                  <p className="text-white/50 mt-2">
                    {videos.find(v => v.id === selectedVideo)?.title}
                  </p>
                </div>
              </div>
              
              {/* Video Info */}
              <div className="p-6 bg-gray-900 text-white">
                <h3 className="mb-2">
                  {videos.find(v => v.id === selectedVideo)?.title}
                </h3>
                <p className="text-white/70 mb-4">
                  {videos.find(v => v.id === selectedVideo)?.description}
                </p>
                <div className="flex items-center gap-4 text-white/60">
                  <span>{videos.find(v => v.id === selectedVideo)?.views} views</span>
                  <span>•</span>
                  <span className="capitalize">{videos.find(v => v.id === selectedVideo)?.category}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
