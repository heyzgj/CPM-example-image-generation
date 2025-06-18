'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ART_STYLES, STYLE_CATEGORIES, type ArtStyle, type StyleCategory, searchStyles, getStylesByCategory, getFeaturedStyles } from '@/lib/styles/style-definitions';
import { StyleCard } from './style-card';
import { StyleModal } from './style-modal';

interface StyleGalleryProps {
  selectedStyle?: string;
  onStyleSelect: (styleId: string) => void;
  className?: string;
}

type FilterType = 'all' | 'featured' | StyleCategory;

export function StyleGallery({ selectedStyle, onStyleSelect, className = '' }: StyleGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedStyleForModal, setSelectedStyleForModal] = useState<ArtStyle | null>(null);

  // Filter and search styles
  const filteredStyles = useMemo(() => {
    let styles = ART_STYLES;

    // Apply category/special filters
    if (activeFilter === 'featured') {
      styles = getFeaturedStyles();
    } else if (activeFilter !== 'all') {
      styles = getStylesByCategory(activeFilter as StyleCategory);
    }

    // Apply search
    if (searchQuery.trim()) {
      const searchedStyles = searchStyles(searchQuery);
      styles = searchedStyles.filter(style => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'featured') return style.featured;
        return style.category === activeFilter;
      });
    }

    return styles;
  }, [searchQuery, activeFilter]);

  // Group styles by category for display
  const stylesByCategory = useMemo(() => {
    const grouped: Record<string, ArtStyle[]> = {};
    
    if (activeFilter === 'all' || activeFilter === 'featured') {
      // Group by category
      filteredStyles.forEach(style => {
        const categoryName = STYLE_CATEGORIES[style.category].name;
        if (!grouped[categoryName]) {
          grouped[categoryName] = [];
        }
        grouped[categoryName].push(style);
      });
    } else {
      // Single category
      const categoryName = STYLE_CATEGORIES[activeFilter as StyleCategory].name;
      grouped[categoryName] = filteredStyles;
    }

    return grouped;
  }, [filteredStyles, activeFilter]);

  const handleStyleClick = useCallback((style: ArtStyle) => {
    onStyleSelect(style.id);
  }, [onStyleSelect]);

  const handleStyleInfo = useCallback((style: ArtStyle, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStyleForModal(style);
  }, []);

  const totalStyles = filteredStyles.length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Art Styles
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({totalStyles} style{totalStyles !== 1 ? 's' : ''})
            </span>
          </h2>
        </div>

        {/* Search */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search styles (e.g., 'impressionist', 'cyberpunk', 'bold')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('all')}
            className="h-8"
          >
            All Styles
          </Button>
          <Button
            variant={activeFilter === 'featured' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('featured')}
            className="h-8"
          >
            Featured
          </Button>
          {Object.entries(STYLE_CATEGORIES).map(([key, category]) => (
            <Button
              key={key}
              variant={activeFilter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(key as StyleCategory)}
              className="h-8"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      {totalStyles === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No styles found</h3>
            <p className="text-gray-500">
              {searchQuery 
                ? `No styles match "${searchQuery}". Try a different search term.`
                : 'No styles available for the selected filter.'
              }
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="mt-4"
              >
                Clear search
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(stylesByCategory).map(([categoryName, styles]) => (
            <div key={categoryName} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                {categoryName}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({styles.length})
                </span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {styles.map((style) => (
                  <StyleCard
                    key={style.id}
                    style={style}
                    isSelected={selectedStyle === style.id}
                    onClick={() => handleStyleClick(style)}
                    onInfoClick={(e) => handleStyleInfo(style, e)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Style Details Modal */}
      {selectedStyleForModal && (
        <StyleModal
          style={selectedStyleForModal}
          isOpen={!!selectedStyleForModal}
          onClose={() => setSelectedStyleForModal(null)}
          onSelect={() => {
            handleStyleClick(selectedStyleForModal);
            setSelectedStyleForModal(null);
          }}
          isSelected={selectedStyle === selectedStyleForModal.id}
        />
      )}
    </div>
  );
} 