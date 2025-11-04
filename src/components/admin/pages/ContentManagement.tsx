import { useState } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Video, BookOpen, Plus } from 'lucide-react';
import { VideosManagement } from './VideosManagement';
import { MagazineManagement } from './MagazineManagement';

export function ContentManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-gray-900">Content Management</h1>
        <p className="text-gray-600">Manage videos, articles, and media content</p>
      </div>

      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="videos">
            <Video className="w-4 h-4 mr-2" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="magazine">
            <BookOpen className="w-4 h-4 mr-2" />
            Magazine
          </TabsTrigger>
        </TabsList>
        <TabsContent value="videos" className="mt-6">
          <VideosManagement />
        </TabsContent>
        <TabsContent value="magazine" className="mt-6">
          <MagazineManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
