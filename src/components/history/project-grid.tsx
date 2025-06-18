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
      />
    ))}
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Memoized error state component
const ErrorState = memo(({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="text-center py-12">
    <div className="text-red-500 mb-4">
      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
    <p className="text-gray-600 mb-4">{error}</p>
    <Button onClick={onRetry} variant="outline">
      Try Again
    </Button>
  </div>
));

ErrorState.displayName = 'ErrorState';

// Memoized empty state component
const EmptyState = memo(({ 
  searchQuery, 
  styleFilter 
}: { 
  searchQuery?: string; 
  styleFilter?: string; 
}) => (
  <div className="text-center py-12">
    <div className="text-gray-400 mb-4">
      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      {searchQuery || styleFilter ? 'No projects found' : 'No projects yet'}
    </h3>
    <p className="text-gray-600 mb-6">
      {searchQuery || styleFilter 
        ? 'Try adjusting your search or filter criteria'
        : "You haven't created any projects yet. Start by transforming your first image!"
      }
    </p>
    {!searchQuery && !styleFilter && (
      <Button asChild>
        <a href="/upload">Create Your First Project</a>
      </Button>
    )}
  </div>
));

EmptyState.displayName = 'EmptyState';

// Main component with performance optimizations
export function ProjectGrid({ 
  searchQuery = '', 
  styleFilter = '', 
  favoritesOnly = false,
  className = ''
}: ProjectGridProps) {
  // Ref to keep track of the latest projects array length without re-creating callbacks
  const projectsRef = useRef<ProjectHistory[]>([]);

  const [projects, setProjects] = useState<ProjectHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [mounted, setMounted] = useState(false);

  const projectStorage = getProjectStorage();

  // Ensure component is mounted before running effects
  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep projectsRef in sync with projects state
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  // Memoize the filter object to prevent unnecessary re-renders
  const filter = useMemo((): ProjectFilter => ({
    search: searchQuery || undefined,
    style: styleFilter || undefined,
    favorited: favoritesOnly || undefined
  }), [searchQuery, styleFilter, favoritesOnly]);

  // Stable loadProjects function that doesn't depend on projects.length
  const loadProjects = useCallback(async (reset = false) => {
    if (!mounted) return;

    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      // Use projectsRef.current.length instead of projects.length to avoid dependency
      const offset = reset ? 0 : projectsRef.current.length;
      const limit = 12;

      const result = await Promise.race([
        projectStorage.searchProjects(filter, limit, offset),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Search timeout after 10 seconds')), 10000)
        )
      ]);

      if (result.success && result.data) {
        const newProjects = reset
          ? result.data.projects
          : [...projectsRef.current, ...result.data.projects];

        // update state & mutable ref in one place
        setProjects(newProjects);
        projectsRef.current = newProjects;
        setHasMore(result.data.hasMore);
      } else {
        setError(result.error || 'Failed to load projects');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      if (error instanceof Error && error.message.includes('timeout')) {
        setError('Loading took too long. Please try again.');
      } else {
        setError('Failed to load projects. Please try again.');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [mounted, filter, projectStorage]);

  // Load projects when component mounts or filters change
  useEffect(() => {
    if (!mounted) return;
    
    // Use a small delay to prevent rapid re-renders
    const timeoutId = setTimeout(() => {
      loadProjects(true);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [mounted, loadProjects]);

  // Load more function for manual loading
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadProjects(false);
    }
  }, [loadProjects, loadingMore, hasMore]);

  // Handle project actions
  const handleToggleFavorite = useCallback(async (projectId: string) => {
    try {
      const result = await projectStorage.toggleFavorite(projectId);
      if (result.success) {
        setProjects(prev => prev.map(project => 
          project.id === projectId 
            ? { ...project, metadata: { ...project.metadata, favorited: !project.metadata.favorited } }
            : project
        ));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [projectStorage]);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    try {
      const result = await projectStorage.deleteProject(projectId);
      if (result.success) {
        setProjects(prev => prev.filter(project => project.id !== projectId));
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  }, [projectStorage]);

  // Memoized grid content
  const gridContent = useMemo(() => {
    if (!mounted) {
      return <LoadingSkeleton />;
    }
    
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
      />;
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onToggleFavorite={() => handleToggleFavorite(project.id)}
              onDelete={() => handleDeleteProject(project.id)}
            />
          ))}
        </div>

        {/* Manual Load More Button (intersection observer disabled) */}
        {hasMore && (
          <div className="text-center pt-6">
            <Button 
              onClick={loadMore}
              disabled={loadingMore}
              variant="outline"
              size="lg"
            >
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Loading more...
                </span>
              ) : (
                'Load More Projects'
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }, [
    mounted,
    loading,
    error,
    projects,
    searchQuery,
    styleFilter,
    hasMore,
    loadingMore,
    loadProjects,
    loadMore,
    handleToggleFavorite,
    handleDeleteProject
  ]);

  return (
    <div className={className}>
      {gridContent}
    </div>
  );
}

ProjectGrid.displayName = 'ProjectGrid'; 