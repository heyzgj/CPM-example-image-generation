'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ArtStyle } from '@/lib/styles/style-definitions';

interface StyleModalProps {
  style: ArtStyle;
  isOpen: boolean;
  onClose: () => void;
  onSelect: () => void;
  isSelected: boolean;
}

export function StyleModal({ style, isOpen, onClose, onSelect, isSelected }: StyleModalProps) {
  const [imageError, setImageError] = useState(false);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                {style.name}
              </CardTitle>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-xs">
                  {style.category}
                </Badge>
                {style.featured && (
                  <Badge variant="default" className="text-xs bg-yellow-500">
                    ⭐ Featured
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {style.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {style.processingTime}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{style.popularity}</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Preview Image */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
            {!imageError ? (
              <Image
                src={style.previewUrl}
                alt={`${style.name} style preview`}
                fill
                className="object-cover"
                onError={handleImageError}
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium">Preview not available</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {style.description}
            </p>
          </div>

          {/* Tags */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {style.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Parameters */}
          {style.parameters.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Style Parameters</h3>
              <div className="space-y-3">
                {style.parameters.map((param, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900 capitalize">
                        {param.name}
                      </span>
                      <span className="text-xs text-gray-500 uppercase">
                        {param.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {param.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Default:</span>
                      <Badge variant="outline" className="text-xs">
                        {param.default?.toString()}
                      </Badge>
                      {param.type === 'slider' && param.min !== undefined && param.max !== undefined && (
                        <>
                          <span className="ml-2">Range:</span>
                          <span>{param.min} - {param.max}</span>
                        </>
                      )}
                      {param.type === 'select' && param.options && (
                        <>
                          <span className="ml-2">Options:</span>
                          <span>{param.options.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-medium text-gray-900 mb-1">Difficulty</div>
              <div className="text-gray-600 capitalize">{style.difficulty}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-medium text-gray-900 mb-1">Processing Time</div>
              <div className="text-gray-600 capitalize">{style.processingTime}</div>
            </div>
          </div>

          {/* AI Prompt Preview */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Prompt</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <code className="text-xs text-gray-700 break-words">
                {style.prompt}
              </code>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={onSelect}
              className={`flex-1 ${
                isSelected 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSelected ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Selected
                </>
              ) : (
                'Select This Style'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 