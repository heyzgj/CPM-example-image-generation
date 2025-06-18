'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { validateFile } from '@/lib/file-utils';
import { geminiService } from '@/lib/gemini-service';
import { ImageTransformationResult } from '@/lib/gemini-client';
import { SimpleStyleGallery } from '@/components/styles/simple-style-gallery';
import { getStyleById } from '@/lib/styles/style-definitions';
import { getProjectStorage } from '@/lib/storage/project-storage';
import { SaveProjectRequest } from '@/lib/types/project-history';
import { usePerformanceMonitoring } from '@/lib/performance-monitor';

interface UploadedImage {
  file: File;
  previewUrl: string;
  name: string;
  size: number;
}

export default function UploadPage() {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformedResult, setTransformedResult] = useState<ImageTransformationResult | null>(null);
  const [isServiceReady, setIsServiceReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const projectStorage = getProjectStorage();
  const { startImageTransform, trackImageTransform, trackCustomMetric } = usePerformanceMonitoring();

  // Initialize Gemini service
  useEffect(() => {
    const initializeService = async () => {
      try {
        await geminiService.initialize();
        setIsServiceReady(true);
      } catch (error) {
        console.error('Failed to initialize Gemini service:', error);
        setError('Failed to initialize AI service. Please refresh the page.');
      }
    };

    initializeService();
  }, []);

  // Legacy styles removed - now using comprehensive style definitions from StyleGallery

  const handleFileValidation = useCallback((file: File): string | null => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      return validation.error || 'Invalid file';
    }
    return null;
  }, []);

  const processFile = useCallback(async (file: File) => {
    const validationError = handleFileValidation(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Complete the upload
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        setUploadedImage({
          file,
          previewUrl,
          name: file.name,
          size: file.size
        });
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      console.error('File processing error:', error);
      setError('Failed to process file. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [handleFileValidation]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFile]);

  const handleClick = useCallback(() => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  }, [isUploading]);

  const handleRemoveImage = useCallback(() => {
    if (uploadedImage?.previewUrl) {
      URL.revokeObjectURL(uploadedImage.previewUrl);
    }
    setUploadedImage(null);
    setError(null);
  }, [uploadedImage?.previewUrl]);

  const handleStyleSelect = useCallback((style: string) => {
    setSelectedStyle(style);
    // Clear previous transformation when style changes
    setTransformedResult(null);
  }, []);

  const handleTransformImage = useCallback(async () => {
    if (!uploadedImage || !selectedStyle || !isServiceReady) {
      setError('Missing required data for transformation');
      return;
    }

    setIsTransforming(true);
    setError(null);
    setTransformedResult(null);

    // Start performance tracking
    const transformStartTime = startImageTransform();
    trackCustomMetric('transformation_started', Date.now());

    try {
      const result = await geminiService.transformImage({
        image: uploadedImage.file,
        style: selectedStyle
      });

      // Track transformation performance
      const transformDuration = trackImageTransform(transformStartTime);
      
      if (result.success) {
        setTransformedResult(result);
        // Track successful transformation
        trackCustomMetric('transformation_success', transformDuration, {
          style: selectedStyle,
          fileSize: uploadedImage.size,
          fileName: uploadedImage.name
        });
      } else {
        setError(result.error || 'Transformation failed');
        trackCustomMetric('transformation_error', transformDuration, {
          error: result.error || 'Unknown error',
          style: selectedStyle
        });
      }
    } catch (error) {
      // Track transformation error with timing
      const transformDuration = trackImageTransform(transformStartTime);
      console.error('Transformation error:', error);
      setError('Failed to transform image. Please try again.');
      trackCustomMetric('transformation_exception', transformDuration, {
        error: String(error),
        style: selectedStyle
      });
    } finally {
      setIsTransforming(false);
    }
  }, [uploadedImage, selectedStyle, isServiceReady, startImageTransform, trackImageTransform, trackCustomMetric]);

  const handleSaveProject = useCallback(async () => {
    if (!uploadedImage || !selectedStyle || !transformedResult?.transformedImage) {
      setError('Missing required data to save project');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSavedSuccessfully(false);

    try {
      // Convert transformed image data URL to blob
      const response = await fetch(transformedResult.transformedImage);
      const transformedBlob = await response.blob();

      // Get style information
      const styleInfo = getStyleById(selectedStyle);
      
      // Create save request
      const saveRequest: SaveProjectRequest = {
        originalImage: uploadedImage.file,
        transformedImage: transformedBlob,
        style: {
          name: styleInfo?.name || selectedStyle,
          parameters: styleInfo?.parameters.reduce((acc, param) => ({
            ...acc,
            [param.name]: param.default
          }), {}) || {},
        },
        transformationTime: 3000, // Default 3 seconds - we'll track this properly later
        tags: styleInfo?.category ? [styleInfo.category] : [],
      };

      const result = await projectStorage.saveProject(saveRequest);

      if (result.success) {
        setSavedSuccessfully(true);
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSavedSuccessfully(false), 3000);
      } else {
        setError(result.error || 'Failed to save project');
      }
    } catch (error) {
      console.error('Save project error:', error);
      setError('Failed to save project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [uploadedImage, selectedStyle, transformedResult, projectStorage]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canTransform = uploadedImage && selectedStyle && !isUploading && !isTransforming && isServiceReady;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Transform Your Image
          </h1>
          <p className="text-gray-600">
            Upload an image and choose an artistic style to create your masterpiece
          </p>
        </div>

        {error && (
          <div 
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg 
                  className="h-5 w-5 text-red-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>1. Upload Image</CardTitle>
            </CardHeader>
            <CardContent>
              {!uploadedImage ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    isDragging
                      ? 'border-blue-400 bg-blue-50'
                      : isUploading
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleClick}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload image by clicking or dragging"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleClick();
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileInput}
                    className="hidden"
                    aria-label="File input"
                  />
                  
                  {isUploading ? (
                    <div>
                      <div className="w-12 h-12 mx-auto mb-4" aria-hidden="true">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                      <p className="text-gray-600 mb-2" aria-live="polite">Uploading...</p>
                      <div 
                        className="w-full bg-gray-200 rounded-full h-2 mb-2"
                        role="progressbar"
                        aria-valuenow={uploadProgress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Upload progress: ${uploadProgress}%`}
                      >
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500" aria-live="polite">
                        {uploadProgress}% complete
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4">
                        <svg
                          className="w-12 h-12 text-gray-400 mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.4M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-600 mb-2">
                        {isDragging 
                          ? 'Drop your image here'
                          : 'Drag and drop your image here, or click to browse'
                        }
                      </p>
                      <p className="text-sm text-gray-400">
                        Supports JPEG, PNG up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                                  <div className="space-y-4">
                    <div className="relative">
                      <Image
                        src={uploadedImage.previewUrl}
                        alt="Uploaded preview"
                        width={400}
                        height={256}
                        className="w-full h-64 object-cover rounded-lg"
                        unoptimized
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium text-gray-900 text-sm">
                      {uploadedImage.name}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {formatFileSize(uploadedImage.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // Clear current image first, then trigger file input
                      handleRemoveImage();
                      setTimeout(() => {
                        fileInputRef.current?.click();
                      }, 100);
                    }}
                    className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    Upload Different Image
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Style Selection */}
          <Card>
            <CardHeader>
              <CardTitle>2. Choose Style</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleStyleGallery
                selectedStyle={selectedStyle}
                onStyleSelect={handleStyleSelect}
              />
            </CardContent>
          </Card>
        </div>

        {/* Transform Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleTransformImage}
            disabled={!canTransform}
            className={`px-8 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              canTransform
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            aria-describedby="transform-status"
            aria-disabled={!canTransform}
          >
            {isTransforming ? (
              <span className="flex items-center gap-2 justify-center">
                <div 
                  className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
                  aria-hidden="true"
                ></div>
                Transforming...
              </span>
            ) : (
              'Transform Image'
            )}
          </button>
          <p 
            id="transform-status" 
            className="text-sm text-gray-500 mt-2"
            aria-live="polite"
          >
            {isTransforming
              ? 'AI is working its magic...'
              : uploadedImage && selectedStyle
              ? 'Ready to transform!'
              : 'Upload an image and select a style to continue'
            }
          </p>
        </div>

        {/* Transformation Result */}
        {transformedResult && transformedResult.transformedImage && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>✨ Transformed Result</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Original Image */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Original</h3>
                    <Image
                      src={uploadedImage?.previewUrl || ''}
                      alt="Original image"
                      width={400}
                      height={256}
                      className="w-full h-64 object-cover rounded-lg border"
                      unoptimized
                    />
                  </div>

                  {/* Transformed Image */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      {getStyleById(selectedStyle)?.name || selectedStyle} Style
                    </h3>
                    <Image
                      src={transformedResult.transformedImage}
                      alt="Transformed image"
                      width={400}
                      height={256}
                      className="w-full h-64 object-cover rounded-lg border"
                      unoptimized
                    />
                  </div>
                </div>

                {/* Generated Text */}
                {transformedResult.generatedText && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">AI Description:</h4>
                    <p className="text-gray-700 text-sm">{transformedResult.generatedText}</p>
                  </div>
                )}

                {/* Usage Stats */}
                {transformedResult.usage && (
                  <div className="mt-4 text-xs text-gray-500">
                    Tokens used: {transformedResult.usage.totalTokens} 
                    (Input: {transformedResult.usage.promptTokens}, Output: {transformedResult.usage.completionTokens})
                  </div>
                )}

                {/* Success Message */}
                {savedSuccessfully && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Project saved successfully!</span>
                    </div>
                    <p className="text-green-600 text-sm mt-1">
                      You can view it in your <a href="/history" className="underline hover:text-green-800">project history</a>.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = transformedResult.transformedImage!;
                      link.download = `transformed_${selectedStyle}_${uploadedImage?.name || 'image'}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </button>
                  
                  <button
                    onClick={handleSaveProject}
                    disabled={isSaving || savedSuccessfully}
                    className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      savedSuccessfully
                        ? 'bg-green-100 text-green-800 cursor-default'
                        : isSaving
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Saving...
                      </>
                    ) : savedSuccessfully ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Saved!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Save Project
                      </>
                    )}
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Save your project to build your creative portfolio and easily find it later!
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 