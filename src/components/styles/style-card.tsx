'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type ArtStyle } from '@/lib/styles/style-definitions';

interface StyleCardProps {
  style: ArtStyle;
  isSelected: boolean;
  onClick: () => void;
  onInfoClick: (e: React.MouseEvent) => void;
}

export function StyleCard({ style, isSelected, onClick, onInfoClick }: StyleCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
        isSelected 
          ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
          : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Preview Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-gray-100">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {!imageError ? (
            <Image
              src={style.previewUrl}
              alt={`${style.name} style preview`}
              fill
              className={`object-cover transition-opacity duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              } group-hover:scale-110 transition-transform duration-300`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs font-medium">{style.name}</p>
              </div>
            </div>
          )}

          {/* Overlay with badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
              {style.featured && (
                <Badge variant="default" className="text-xs bg-yellow-500 text-white">
                  ⭐ Featured
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs bg-white/20 text-white backdrop-blur-sm">
                {style.difficulty}
              </Badge>
              <Badge variant="secondary" className="text-xs bg-white/20 text-white backdrop-blur-sm">
                {style.processingTime}
              </Badge>
            </div>
          </div>

          {/* Info button */}
          <button
            onClick={onInfoClick}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/30"
            title="Style details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Selection indicator */}
          {isSelected && (
            <div className="absolute top-2 left-2 p-1.5 rounded-full bg-blue-500 text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-3">
          <div className="flex items-start justify-between mb-2">
            <h3 className={`font-semibold text-sm leading-tight ${
              isSelected ? 'text-blue-600' : 'text-gray-900'
            }`}>
              {style.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 ml-2">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{style.popularity}</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {style.shortDescription}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {style.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                {tag}
              </Badge>
            ))}
            {style.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto text-gray-500">
                +{style.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 