import { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

export function MagazineManagement() {
  const articles = [
    {
      id: 'A001',
      title: 'Complete Guide to Hair Transplantation 2025',
      category: 'Guide',
      thumbnail: 'https://images.unsplash.com/photo-1624595110541-b50f76b524e1?w=400',
      author: 'Dr. Sarah Anderson',
      readTime: '12 min',
      views: '8,400',
      status: 'published',
      publishDate: '2025-11-04',
    },
    {
      id: 'A002',
      title: 'FUE vs FUT: Which Method Is Right?',
      category: 'Comparison',
      thumbnail: 'https://images.unsplash.com/photo-1624595110541-b50f76b524e1?w=400',
      author: 'Dr. Emily Roberts',
      readTime: '8 min',
      views: '6,200',
      status: 'published',
      publishDate: '2025-11-01',
    },
    {
      id: 'A003',
      title: 'Perfect Eyebrow Shape Guide',
      category: 'Beauty Tips',
      thumbnail: 'https://images.unsplash.com/photo-1737746165411-bdb26bab61cd?w=400',
      author: 'Dr. Lisa Chen',
      readTime: '6 min',
      views: '5,100',
      status: 'draft',
      publishDate: '2025-10-28',
    },
    {
      id: 'A004',
      title: 'PRP Treatment Benefits',
      category: 'Treatment',
      thumbnail: 'https://images.unsplash.com/photo-1664549761426-6a1cb1032854?w=400',
      author: 'Dr. Maria Garcia',
      readTime: '10 min',
      views: '7,800',
      status: 'published',
      publishDate: '2025-10-25',
    },
  ];

  const handleDelete = (id: string, title: string) => {
    toast.error(`Article "${title}" deleted`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">{articles.length} articles total</p>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          New Article
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {articles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
              <div className="flex">
                <div className="relative w-48 h-48 flex-shrink-0">
                  <ImageWithFallback
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 left-2 bg-blue-500 text-white">
                    {article.category}
                  </Badge>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="mb-2 text-gray-900 line-clamp-2">{article.title}</h3>
                  <p className="text-gray-600 mb-2">By {article.author}</p>
                  <div className="flex items-center gap-4 text-gray-600 mb-4">
                    <span>{article.readTime} read</span>
                    <span>•</span>
                    <span>{article.views} views</span>
                  </div>
                  <div className="mt-auto">
                    <Badge className={article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {article.status}
                    </Badge>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1 rounded-xl">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl text-red-600"
                        onClick={() => handleDelete(article.id, article.title)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
