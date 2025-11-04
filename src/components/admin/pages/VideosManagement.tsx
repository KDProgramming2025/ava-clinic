import { useState } from 'react';
import { motion } from 'motion/react';
import { Video, Plus, Edit, Trash2, Eye, Play } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

export function VideosManagement() {
  const videos = [
    {
      id: 'V001',
      title: 'Hair Implant Procedure Overview',
      category: 'Procedure',
      thumbnail: 'https://images.unsplash.com/photo-1624595110541-b50f76b524e1?w=400',
      duration: '5:32',
      views: '12,500',
      status: 'published',
      uploadDate: '2025-10-15',
    },
    {
      id: 'V002',
      title: 'Eyebrow Transformation Results',
      category: 'Results',
      thumbnail: 'https://images.unsplash.com/photo-1737746165411-bdb26bab61cd?w=400',
      duration: '4:15',
      views: '8,200',
      status: 'published',
      uploadDate: '2025-10-20',
    },
    {
      id: 'V003',
      title: 'Patient Testimonial - Sarah',
      category: 'Testimonial',
      thumbnail: 'https://images.unsplash.com/photo-1673378630655-6a0e8eba07b0?w=400',
      duration: '3:48',
      views: '15,300',
      status: 'published',
      uploadDate: '2025-10-25',
    },
    {
      id: 'V004',
      title: 'PRP Treatment Explained',
      category: 'Educational',
      thumbnail: 'https://images.unsplash.com/photo-1664549761426-6a1cb1032854?w=400',
      duration: '6:20',
      views: '9,700',
      status: 'draft',
      uploadDate: '2025-11-01',
    },
  ];

  const handleDelete = (id: string, title: string) => {
    toast.error(`Video "${title}" deleted`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">{videos.length} videos total</p>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Upload Video
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
              <div className="relative h-48 overflow-hidden group">
                <ImageWithFallback
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" fill="white" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {video.duration}
                </div>
                <Badge className="absolute top-2 left-2 bg-purple-500 text-white">
                  {video.category}
                </Badge>
              </div>
              <div className="p-4">
                <h3 className="mb-2 text-gray-900 line-clamp-2">{video.title}</h3>
                <div className="flex items-center justify-between text-gray-600 mb-4">
                  <span>{video.views} views</span>
                  <Badge className={video.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {video.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-xl">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl text-red-600"
                    onClick={() => handleDelete(video.id, video.title)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
