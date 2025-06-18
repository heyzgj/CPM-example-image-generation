'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ART_STYLES, STYLE_CATEGORIES, type StyleCategory } from '@/lib/styles/style-definitions';

interface SimpleStyleGalleryProps {
  selectedStyle?: string;
  onStyleSelect: (styleId: string) => void;
  className?: string;
}

type FilterType = 'all' | 'featured' | StyleCategory;

export function SimpleStyleGallery({ selectedStyle, onStyleSelect, className = '' }: SimpleStyleGalleryProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('featured');

  // Filter styles
  const filteredStyles = useMemo(() => {
    let styles = ART_STYLES;

    if (activeFilter === 'featured') {
      styles = styles.filter(style => style.featured);
    } else if (activeFilter !== 'all') {
      styles = styles.filter(style => style.category === activeFilter);
    }

    return styles;
  }, [activeFilter]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 text-sm">
        <Button
          variant={activeFilter === 'featured' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('featured')}
          className="h-9 px-3 text-xs font-medium"
        >
          Featured ({ART_STYLES.filter(s => s.featured).length})
        </Button>
        <Button
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('all')}
          className="h-9 px-3 text-xs font-medium"
        >
          All Styles ({ART_STYLES.length})
        </Button>
        {Object.entries(STYLE_CATEGORIES).map(([key, category]) => (
          <Button
            key={key}
            variant={activeFilter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(key as StyleCategory)}
            className="h-9 px-3 text-xs font-medium truncate"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Style Grid - Clean and Modern */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filteredStyles.map((style) => (
          <Card 
            key={style.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-2 min-h-[80px] ${
              selectedStyle === style.id 
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onStyleSelect(style.id)}
          >
            <CardContent className="p-3 h-full flex flex-col justify-center">
              <div className="text-center space-y-2">
                {/* Style Name */}
                <h3 className={`font-medium text-xs leading-tight truncate max-w-full ${
                  selectedStyle === style.id ? 'text-blue-700' : 'text-gray-900'
                }`} title={style.name}>
                  {style.name}
                  {style.featured && (
                    <span className="ml-1 text-yellow-500 text-xs">★</span>
                  )}
                </h3>

                {/* Selection indicator */}
                {selectedStyle === style.id && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Selected
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Results count */}
      {filteredStyles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No styles found in this category</p>
        </div>
      ) : (
        <div className="text-center text-xs text-gray-500">
          {filteredStyles.length} style{filteredStyles.length !== 1 ? 's' : ''} available
        </div>
      )}
    </div>
  );
} 