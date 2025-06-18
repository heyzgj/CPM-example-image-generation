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
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeFilter === 'featured' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('featured')}
          className="h-8"
        >
          ⭐ Featured ({ART_STYLES.filter(s => s.featured).length})
        </Button>
        <Button
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('all')}
          className="h-8"
        >
          All Styles ({ART_STYLES.length})
        </Button>
        {Object.entries(STYLE_CATEGORIES).map(([key, category]) => (
          <Button
            key={key}
            variant={activeFilter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(key as StyleCategory)}
            className="h-8"
          >
            {category.icon} {category.name}
          </Button>
        ))}
      </div>

      {/* Style Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredStyles.map((style) => (
          <Card 
            key={style.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
              selectedStyle === style.id 
                ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
                : ''
            }`}
            onClick={() => onStyleSelect(style.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-semibold text-sm ${
                  selectedStyle === style.id ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {style.name}
                </h3>
                {style.featured && (
                  <span className="text-yellow-500 text-xs">⭐</span>
                )}
              </div>
              
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {style.shortDescription}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="capitalize">{style.difficulty}</span>
                <span className="capitalize">{style.processingTime}</span>
              </div>

              {/* Selection indicator */}
              {selectedStyle === style.id && (
                <div className="mt-2 text-center">
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Selected
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        Showing {filteredStyles.length} of {ART_STYLES.length} available styles
      </div>
    </div>
  );
} 