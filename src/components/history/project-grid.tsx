'use client';

import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { ProjectHistory, ProjectFilter } from '@/lib/types/project-history';
import { getProjectStorage } from '@/lib/storage/project-storage';
import { ProjectCard } from '@/components/history/project-card';
import { Button } from '@/components/ui/button';

interface ProjectGridProps {
  searchQuery?: string;
  styleFilter?: string;
  favoritesOnly?: boolean;
  className?: string;
}

// Memoized loading skeleton component
const LoadingSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div 
        key={i} 
        className="aspect-square bg-gray-100 rounded-lg animate-pulse"
        style={{ animationDelay: `${i * 50}ms` }}
      />
    ))}
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Memoized empty state component
const EmptyState = memo(({ 
  searchQuery, 
  styleFilter, 
  favoritesOnly 
}: { 
  searchQuery: string; 
  styleFilter: string; 
  favoritesOnly: boolean; 
}) => (
  <div className="text-center py-12">
    <div className="text-gray-500 mb-4">
      {searchQuery || styleFilter || favoritesOnly 
        ? 'No projects match your filters' 
        : 'No projects saved yet'}
    </div>
    {!searchQuery && !styleFilter && !favoritesOnly && (
      <p className="text-gray-400">
        Transform your first image to start building your creative portfolio!
      </p>
    )}
  </div>
));

EmptyState.displayName = 'EmptyState';

// Memoized error state component
const ErrorState = memo(({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="text-center py-12">
    <div className="text-red-500 mb-4">⚠️ {error}</div>
    <Button onClick={onRetry} variant="outline">
      Try Again
    </Button>
  </div>
));

ErrorState.displayName = 'ErrorState';

// Intersection observer hook for infinite scrolling
function useIntersectionObserver(
  callback: () => void,
  enabled: boolean = true
) {
  const observer = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    observer.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const element = elementRef.current;
    if (element) {
      observer.current.observe(element);
    }

    return () => {
      if (observer.current && element) {
        observer.current.unobserve(element);
      }
    };
  }, [callback, enabled]);

  return elementRef;
}

// Performance monitoring hook
function usePerformanceMonitor() {
  const metricsRef = useRef({
    renderStart: 0,
    renderEnd: 0,
    itemCount: 0
  });

  const startRender = useCallback(() => {
    metricsRef.current.renderStart = performance.now();
  }, []);

  const endRender = useCallback((itemCount: number) => {
    metricsRef.current.renderEnd = performance.now();
    metricsRef.current.itemCount = itemCount;
    
    if (process.env.NODE_ENV === 'development') {
      const duration = metricsRef.current.renderEnd - metricsRef.current.renderStart;
      console.log(`ProjectGrid render: ${duration.toFixed(2)}ms for ${itemCount} items`);
    }
  }, []);

  return { startRender, endRender, metrics: metricsRef.current };
}

// Main component with performance optimizations
export const ProjectGrid = memo(function ProjectGrid({ 
  searchQuery = '', 
  styleFilter = '', 
  favoritesOnly = false,
  className = '' 
}: ProjectGridProps) {
  const [projects, setProjects] = useState<ProjectHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Performance monitoring
  const { startRender, endRender } = usePerformanceMonitor();

  // Memoized project storage instance
  const projectStorage = useMemo(() => getProjectStorage(), []);

  // Memoized filter object
  const filter = useMemo((): ProjectFilter => ({
    ...(searchQuery && { search: searchQuery }),
    ...(styleFilter && { style: styleFilter }),
    ...(favoritesOnly && { favorited: true }),
  }), [searchQuery, styleFilter, favoritesOnly]);

  // Optimized load projects function
  const loadProjects = useCallback(async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setProjects([]);
        startRender();
      }

      const offset = reset ? 0 : projects.length;
      const result = await projectStorage.searchProjects(filter, 20, offset);

      if (result.success && result.data) {
        const newProjects = reset 
          ? result.data.projects 
          : [...projects, ...result.data.projects];

        setProjects(newProjects);
        setHasMore(result.data.hasMore);
        setError(null);
        
        if (reset) {
          endRender(result.data.projects.length);
        }
      } else {
        setError(result.error || 'Failed to load projects');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Project loading error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [projectStorage, filter, projects, startRender, endRender]);

  // Optimized load more function
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    
    setLoadingMore(true);
    await loadProjects(false);
  }, [hasMore, loadingMore, loadProjects]);

  // Optimized delete handler
  const handleDeleteProject = useCallback(async (id: string) => {
    const result = await projectStorage.deleteProject(id);
    
    if (result.success) {
      setProjects(prev => prev.filter(p => p.id !== id));
    } else {
      setError(result.error || 'Failed to delete project');
    }
  }, [projectStorage]);

  // Optimized favorite toggle handler
  const handleToggleFavorite = useCallback(async (id: string) => {
    const result = await projectStorage.toggleFavorite(id);
    
    if (result.success) {
      setProjects(prev => prev.map(p => 
        p.id === id 
          ? { ...p, metadata: { ...p.metadata, favorited: !p.metadata.favorited } }
          : p
      ));
    } else {
      setError(result.error || 'Failed to update favorite');
    }
  }, [projectStorage]);

  // Intersection observer for infinite scroll
  const loadMoreRef = useIntersectionObserver(loadMore, hasMore && !loadingMore);

  // Load projects when filters change
  useEffect(() => {
    loadProjects(true);
  }, [filter, loadProjects]); // Use memoized filter

  // Memoized grid content
  const gridContent = useMemo(() => {
    if (loading) {
      return <LoadingSkeleton />;
    }

    if (error) {
      return <ErrorState error={error} onRetry={() => loadProjects(true)} />;
    }

    if (projects.length === 0) {
      return <EmptyState 
        searchQuery={searchQuery} 
        styleFilter={styleFilter} 
        favoritesOnly={favoritesOnly} 
      />;
    }

    return (
      <>
        {/* Results summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
            {styleFilter && ` in ${styleFilter} style`}
            {favoritesOnly && ' in favorites'}
          </span>
        </div>

        {/* Optimized project grid with CSS Grid */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          style={{
            // CSS Grid optimization for better performance
            contentVisibility: 'auto',
            containIntrinsicSize: '300px',
          }}
        >
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={() => handleDeleteProject(project.id)}
              onToggleFavorite={() => handleToggleFavorite(project.id)}
            />
          ))}
        </div>

        {/* Infinite scroll trigger */}
        {hasMore && (
          <div 
            ref={loadMoreRef}
            className="text-center pt-6 min-h-[100px] flex items-center justify-center"
          >
            {loadingMore ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                <span>Loading more projects...</span>
              </div>
            ) : (
              <Button 
                onClick={loadMore} 
                variant="outline"
                className="min-w-32"
              >
                Load More
              </Button>
            )}
          </div>
        )}

        {/* Performance info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-400 border-t pt-4">
            Loaded {projects.length} projects
            {hasMore && ' • More available'}
            • Optimized rendering enabled
          </div>
        )}
      </>
    );
  }, [
    loading, 
    error, 
    projects, 
    searchQuery, 
    styleFilter, 
    favoritesOnly, 
    hasMore, 
    loadingMore,
    handleDeleteProject,
    handleToggleFavorite,
    loadMore,
    loadProjects,
    loadMoreRef
  ]);

  return (
    <div className={`space-y-6 ${className}`}>
      {gridContent}
    </div>
  );
});

ProjectGrid.displayName = 'ProjectGrid'; 