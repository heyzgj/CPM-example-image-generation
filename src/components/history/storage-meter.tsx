'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProjectStorage } from '@/lib/storage/project-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { 
  HardDrive, 
  Trash2, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Info 
} from 'lucide-react';

interface StorageInfo {
  used: string;
  available: string;
  percentage: number;
  projectCount: number;
}

export function StorageMeter() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projectStorage = getProjectStorage();

  const loadStorageInfo = useCallback(async () => {
    try {
      setLoading(true);
      const result = await projectStorage.getStorageInfo();
      
      if (result.success && result.data) {
        setStorageInfo(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load storage info');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Storage info error:', err);
    } finally {
      setLoading(false);
    }
  }, [projectStorage]);

  const handleCleanup = async () => {
    try {
      setCleaningUp(true);
      const result = await projectStorage.cleanupStorage();
      
      if (result.success && result.data !== undefined) {
        if (result.data > 0) {
          await loadStorageInfo(); // Refresh storage info
          alert(`Cleaned up ${result.data} project${result.data !== 1 ? 's' : ''} to free space!`);
        } else {
          alert('No cleanup needed - you have plenty of storage space!');
        }
      } else {
        setError(result.error || 'Cleanup failed');
      }
    } catch (err) {
      setError('Cleanup failed unexpectedly');
      console.error('Cleanup error:', err);
    } finally {
      setCleaningUp(false);
    }
  };

  const handleExport = async () => {
    try {
      const result = await projectStorage.exportProjects();
      
      if (result.success && result.data) {
        const url = URL.createObjectURL(result.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `image-projects-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        setError(result.error || 'Export failed');
      }
    } catch (err) {
      setError('Export failed unexpectedly');
      console.error('Export error:', err);
    }
  };

  useEffect(() => {
    loadStorageInfo();
  }, [loadStorageInfo]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <HardDrive size={16} />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-2 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-red-500">
            <AlertTriangle size={16} />
            Storage Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <Button onClick={loadStorageInfo} size="sm" variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!storageInfo) return null;

  const getStatusIcon = () => {
    if (storageInfo.percentage >= 90) {
      return <AlertTriangle className="text-red-500" size={16} />;
    } else if (storageInfo.percentage >= 75) {
      return <Info className="text-yellow-500" size={16} />;
    } else {
      return <CheckCircle className="text-green-500" size={16} />;
    }
  };

  const getStatusMessage = () => {
    if (storageInfo.percentage >= 90) {
      return "Storage almost full! Consider cleaning up old projects.";
    } else if (storageInfo.percentage >= 75) {
      return "Storage getting full. You may want to backup projects.";
    } else {
      return "Storage healthy. You have plenty of space.";
    }
  };

  const getProgressColor = () => {
    if (storageInfo.percentage >= 90) return 'bg-red-500';
    if (storageInfo.percentage >= 75) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <HardDrive size={16} />
          Storage Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>{storageInfo.used} used</span>
            <span>{storageInfo.percentage}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500">
            {storageInfo.available} available
          </div>
        </div>

        {/* Status message */}
        <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
          {getStatusIcon()}
          <div className="text-xs text-gray-600 leading-relaxed">
            {getStatusMessage()}
          </div>
        </div>

        {/* Project count */}
        <div className="text-xs text-gray-600">
          {storageInfo.projectCount} project{storageInfo.projectCount !== 1 ? 's' : ''} saved
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            className="flex-1 text-xs"
            title="Backup all projects"
          >
            <Download size={12} className="mr-1" />
            Backup
          </Button>
          
          {storageInfo.percentage >= 50 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCleanup}
              disabled={cleaningUp}
              className="flex-1 text-xs"
              title="Clean up old projects"
            >
              <Trash2 size={12} className="mr-1" />
              {cleaningUp ? 'Cleaning...' : 'Cleanup'}
            </Button>
          )}
        </div>

        {/* Refresh option */}
        <div className="text-center pt-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={loadStorageInfo}
            className="text-xs text-gray-500 h-6"
          >
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 