'use client';

import { useState } from 'react';
import { ProjectGrid } from '@/components/history/project-grid';
import { StorageMeter } from '@/components/history/storage-meter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Heart, 
  Calendar, 
  Palette,
  Grid3X3,
  List,
  SortAsc,
  SortDesc 
} from 'lucide-react';

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const toggleFavoritesFilter = () => {
    setFavoritesOnly(!favoritesOnly);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStyleFilter('');
    setFavoritesOnly(false);
  };

  const hasActiveFilters = searchQuery || styleFilter || favoritesOnly;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Project History</h1>
                <p className="mt-2 text-gray-600">
                  Browse and manage your AI-transformed image collection
                </p>
              </div>
              
              {/* View controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 size={16} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Storage meter */}
            <StorageMeter />

            {/* Filters */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter size={16} />
                Filters
              </h3>

              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search 
                      size={16} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    />
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Style filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Art Style
                  </label>
                  <div className="relative">
                    <Palette 
                      size={16} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    />
                    <select
                      value={styleFilter}
                      onChange={(e) => setStyleFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All styles</option>
                      <option value="Photorealistic">Photorealistic</option>
                      <option value="Watercolor">Watercolor</option>
                      <option value="Oil Painting">Oil Painting</option>
                      <option value="Sketch">Sketch</option>
                      <option value="Cartoon">Cartoon</option>
                      <option value="Vintage">Vintage</option>
                      <option value="Modern Art">Modern Art</option>
                      <option value="Minimalist">Minimalist</option>
                      <option value="Impressionist">Impressionist</option>
                      <option value="Renaissance">Renaissance</option>
                      <option value="Baroque">Baroque</option>
                      <option value="Romantic">Romantic</option>
                      <option value="Realism">Realism</option>
                      <option value="Post-Impressionist">Post-Impressionist</option>
                      <option value="Cubist">Cubist</option>
                      <option value="Surrealist">Surrealist</option>
                      <option value="Abstract Expressionist">Abstract Expressionist</option>
                      <option value="Pop Art">Pop Art</option>
                      <option value="Art Deco">Art Deco</option>
                      <option value="Pixel Art">Pixel Art</option>
                      <option value="Cyberpunk">Cyberpunk</option>
                      <option value="Synthwave">Synthwave</option>
                      <option value="Glitch Art">Glitch Art</option>
                      <option value="Charcoal Drawing">Charcoal Drawing</option>
                      <option value="Pastel">Pastel</option>
                      <option value="Acrylic">Acrylic</option>
                      <option value="Pen & Ink">Pen & Ink</option>
                      <option value="Street Art">Street Art</option>
                      <option value="Manga/Anime">Manga/Anime</option>
                      <option value="Instagram Filter">Instagram Filter</option>
                      <option value="HDR Photography">HDR Photography</option>
                    </select>
                  </div>
                </div>

                {/* Favorites filter */}
                <div>
                  <Button
                    variant={favoritesOnly ? 'default' : 'outline'}
                    size="sm"
                    onClick={toggleFavoritesFilter}
                    className="w-full justify-start"
                  >
                    <Heart 
                      size={16} 
                      className={`mr-2 ${favoritesOnly ? 'fill-current' : ''}`} 
                    />
                    {favoritesOnly ? 'Showing Favorites' : 'Show Favorites Only'}
                  </Button>
                </div>

                {/* Sort order */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Sort Order
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="w-full justify-start"
                  >
                    {sortOrder === 'desc' ? (
                      <>
                        <SortDesc size={16} className="mr-2" />
                        Newest First
                      </>
                    ) : (
                      <>
                        <SortAsc size={16} className="mr-2" />
                        Oldest First
                      </>
                    )}
                  </Button>
                </div>

                {/* Clear filters */}
                {hasActiveFilters && (
                  <div className="pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="w-full text-gray-500"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={16} />
                Quick Stats
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>This Week</span>
                  <span className="font-medium">--</span>
                </div>
                <div className="flex justify-between">
                  <span>This Month</span>
                  <span className="font-medium">--</span>
                </div>
                <div className="flex justify-between">
                  <span>All Time</span>
                  <span className="font-medium">--</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            <ProjectGrid
              searchQuery={searchQuery}
              styleFilter={styleFilter}
              favoritesOnly={favoritesOnly}
              className="bg-white rounded-lg border p-6"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 