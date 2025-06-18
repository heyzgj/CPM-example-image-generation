'use client';

import { useState, useEffect } from 'react';
import { ProjectHistory } from '@/lib/types/project-history';
import { blobToDataUrl } from '@/lib/storage/image-compression';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Download, 
  Trash2, 
  Calendar, 
  Clock, 
  Image as ImageIcon,
  Eye
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface ProjectCardProps {
  project: ProjectHistory;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onView?: () => void;
  className?: string;
}

export function ProjectCard({
  project,
  onDelete,
  onToggleFavorite,
  onView,
  className = '',
}: ProjectCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  // const [transformedUrl, setTransformedUrl] = useState<string>(''); // For future use
  const [showActions, setShowActions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let thumbUrl: string | null = null;
    let transUrl: string | null = null;

    const loadImages = async () => {
      try {
        const [thumbUrlResult, transUrlResult] = await Promise.all([
          blobToDataUrl(project.thumbnail),
          blobToDataUrl(project.transformedImage.data),
        ]);
        
        thumbUrl = thumbUrlResult;
        transUrl = transUrlResult;
        
        setThumbnailUrl(thumbUrl);
        // setTransformedUrl(transUrl); // For future use
      } catch (error) {
        console.error('Failed to load project images:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();

    // Cleanup URLs on unmount
    return () => {
      if (thumbUrl) URL.revokeObjectURL(thumbUrl);
      if (transUrl) URL.revokeObjectURL(transUrl);
    };
  }, [project]);

  const handleDownload = async () => {
    try {
      const url = await blobToDataUrl(project.transformedImage.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = project.transformedImage.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <Card className={`overflow-hidden transition-all duration-200 ${className}`}>
        <div className="aspect-square bg-gray-100 animate-pulse" />
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 hover:shadow-lg group ${className}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon size={48} />
          </div>
        )}

        {/* Overlay actions */}
        <div 
          className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200 ${
            showActions ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex gap-2">
            {onView && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onView}
                className="backdrop-blur-sm"
              >
                <Eye size={16} />
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDownload}
              className="backdrop-blur-sm"
            >
              <Download size={16} />
            </Button>
          </div>
        </div>

        {/* Favorite indicator */}
        {project.metadata.favorited && (
          <div className="absolute top-2 right-2">
            <Heart 
              size={16} 
              className="text-red-500 fill-red-500" 
            />
          </div>
        )}

        {/* Style badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs backdrop-blur-sm">
            {project.style.name}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title */}
          <h3 className="font-medium text-sm leading-tight line-clamp-2 text-gray-900">
            {project.title}
          </h3>

          {/* Metadata */}
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{formatDate(project.metadata.createdAt)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{(project.metadata.transformationTime / 1000).toFixed(1)}s</span>
            </div>

            <div className="flex items-center gap-1">
              <ImageIcon size={12} />
              <span>{formatFileSize(project.transformedImage.size)}</span>
            </div>
          </div>

          {/* Tags */}
          {project.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.metadata.tags.slice(0, 2).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="text-xs px-1 py-0"
                >
                  {tag}
                </Badge>
              ))}
              {project.metadata.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{project.metadata.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleFavorite}
              className={`p-1 h-8 ${
                project.metadata.favorited 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart 
                size={16} 
                className={project.metadata.favorited ? 'fill-current' : ''} 
              />
            </Button>

            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDownload}
                className="p-1 h-8 text-gray-400 hover:text-blue-500"
                title="Download"
              >
                <Download size={16} />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="p-1 h-8 text-gray-400 hover:text-red-500"
                title="Delete"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 