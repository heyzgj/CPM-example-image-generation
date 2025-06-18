'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageModal } from '@/components/ui/modal';
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
  const [modalImage, setModalImage] = useState<{ src: string; alt: string; title: string } | null>(null);
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
    setTransformedResult(null); // Clear results when removing image
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
      console.error('Transformation error:', error);
      setError('Failed to transform image. Please try again.');
      trackCustomMetric('transformation_exception', Date.now() - transformStartTime, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTransforming(false);
    }
  }, [uploadedImage, selectedStyle, isServiceReady, startImageTransform, trackImageTransform, trackCustomMetric]);

  const saveToHistory = useCallback(async () => {
    if (!uploadedImage || !transformedResult || !selectedStyle || !transformedResult.transformedImage) return;

    setIsSaving(true);
    try {
      const styleDefinition = getStyleById(selectedStyle);
      
      // Convert transformed image data URL to blob
      const response = await fetch(transformedResult.transformedImage);
      const transformedBlob = await response.blob();
      
      const saveRequest: SaveProjectRequest = {
        title: `${styleDefinition?.name || selectedStyle} - ${uploadedImage.name}`,
        originalImage: uploadedImage.file,
        transformedImage: transformedBlob,
        style: {
          name: styleDefinition?.name || selectedStyle,
          parameters: styleDefinition?.parameters?.reduce((acc, param) => ({
            ...acc,
            [param.name]: param.default
          }), {}) || {}
        },
        transformationTime: 3000, // Default transformation time
        tags: styleDefinition?.category ? [styleDefinition.category] : []
      };

      const result = await projectStorage.saveProject(saveRequest);
      if (result.success) {
        setSavedSuccessfully(true);
        setTimeout(() => setSavedSuccessfully(false), 3000);
      } else {
        setError(result.error || 'Failed to save to history');
      }
    } catch (error) {
      console.error('Save error:', error);
      setError('Failed to save to history');
    } finally {
      setIsSaving(false);
    }
  }, [uploadedImage, transformedResult, selectedStyle, projectStorage]);

  const canTransform = uploadedImage && selectedStyle && isServiceReady && !isTransforming;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Container with proper max-width and centering */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Image Transformer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your images with the power of AI. Upload any photo and apply stunning artistic styles in seconds.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Something went wrong</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto flex-shrink-0 text-red-400 hover:text-red-600"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          
          {/* Left Column - Controls */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Step 1: Upload Image */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <CardTitle className="text-xl text-gray-900">Upload Your Image</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {!uploadedImage ? (
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                      isDragging
                        ? 'border-blue-400 bg-blue-50 scale-[1.02]'
                        : isUploading
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClick}
                    role="button"
                    tabIndex={0}
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
                    />
                    
                    {isUploading ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto">
                          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium mb-3">Uploading your image...</p>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.4M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium mb-2">
                            {isDragging ? 'Drop your image here!' : 'Drag & drop your image here'}
                          </p>
                          <p className="text-gray-500 text-sm mb-4">or click to browse your files</p>
                          <div className="inline-flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            JPEG, PNG up to 10MB
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative group">
                      <Image
                        src={uploadedImage.previewUrl}
                        alt="Uploaded preview"
                        width={400}
                        height={300}
                        className="w-full h-auto max-h-64 object-contain rounded-xl cursor-pointer transition-transform group-hover:scale-[1.02]"
                        unoptimized
                        onClick={() => setModalImage({
                          src: uploadedImage.previewUrl,
                          alt: 'Uploaded image (full size)',
                          title: uploadedImage.name
                        })}
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors shadow-lg"
                        aria-label="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                          <span className="text-sm font-medium text-gray-900">Click to view full size</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-sm truncate max-w-48">{uploadedImage.name}</p>
                          <p className="text-gray-500 text-xs">{formatFileSize(uploadedImage.size)}</p>
                        </div>
                        <button
                          onClick={() => {
                            handleRemoveImage();
                            setTimeout(() => fileInputRef.current?.click(), 100);
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Choose Style */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold text-sm">2</span>
                  </div>
                  <CardTitle className="text-xl text-gray-900">Choose Your Style</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <SimpleStyleGallery
                  selectedStyle={selectedStyle}
                  onStyleSelect={handleStyleSelect}
                />
              </CardContent>
            </Card>

            {/* Transform Button */}
            <div className="sticky bottom-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border">
              <button
                onClick={handleTransformImage}
                disabled={!canTransform}
                className={`w-full px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                  canTransform
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isTransforming ? (
                  <span className="flex items-center gap-3 justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                    Transforming Magic...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Transform Image
                  </span>
                )}
              </button>
              
              <div className="mt-3 text-center">
                {isTransforming ? (
                  <p className="text-sm text-gray-600">Our AI is creating your masterpiece...</p>
                ) : uploadedImage && selectedStyle ? (
                  <p className="text-sm text-green-600 font-medium">✓ Ready to transform!</p>
                ) : (
                  <p className="text-sm text-gray-500">Upload an image and select a style to continue</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-7">
            <div className="sticky top-8">
              {!transformedResult || !transformedResult.transformedImage ? (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm h-96">
                  <CardContent className="h-full flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your transformed image will appear here</h3>
                        <p className="text-gray-500">Upload an image and select a style to see the magic happen!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <CardTitle className="text-xl text-gray-900">✨ Transformed Result</CardTitle>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        AI Generated
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="relative group">
                      <Image
                        src={transformedResult.transformedImage}
                        alt="AI transformed result"
                        width={600}
                        height={400}
                        className="w-full h-auto max-h-96 object-contain rounded-xl cursor-pointer transition-transform group-hover:scale-[1.02]"
                        unoptimized
                        onClick={() => transformedResult.transformedImage && setModalImage({
                          src: transformedResult.transformedImage,
                          alt: 'Transformed image (full size)',
                          title: `Transformed with ${getStyleById(selectedStyle)?.name || selectedStyle}`
                        })}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                          <span className="text-sm font-medium text-gray-900">Click to view full size</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={saveToHistory}
                        disabled={isSaving}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-green-500/20"
                      >
                        {isSaving ? (
                          <span className="flex items-center gap-2 justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                            Saving...
                          </span>
                        ) : savedSuccessfully ? (
                          <span className="flex items-center gap-2 justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Saved!
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save to History
                          </span>
                        )}
                      </button>

                      <a
                        href={transformedResult.transformedImage}
                        download={`transformed_${uploadedImage?.name || 'image'}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </a>
                    </div>

                    {savedSuccessfully && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-green-800">Successfully saved!</p>
                            <p className="text-sm text-green-600">Your transformed image has been added to your history.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {modalImage && (
        <ImageModal
          isOpen={!!modalImage}
          src={modalImage.src}
          alt={modalImage.alt}
          title={modalImage.title}
          onClose={() => setModalImage(null)}
        />
      )}
    </div>
  );
} 