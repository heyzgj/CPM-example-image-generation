'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { getProjectStorage } from '@/lib/storage/project-storage';
import { Menu, X } from 'lucide-react';

export function Navigation() {
  const [projectCount, setProjectCount] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const projectStorage = getProjectStorage();

  // Ensure component is mounted before rendering dynamic content
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const loadProjectCount = async () => {
      try {
        const result = await projectStorage.getStorageStats();
        if (result.success && result.data) {
          setProjectCount(result.data.totalProjects);
        }
      } catch (error) {
        console.error('Failed to load project count:', error);
      }
    };

    loadProjectCount();
  }, [projectStorage, mounted]);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navigationItems = [
    { href: '/upload', label: 'Upload', description: 'Transform images with AI styles' },
    { 
      href: '/history', 
      label: 'History', 
      description: 'View your creative projects',
      badge: mounted && projectCount > 0 ? (projectCount > 99 ? '99+' : projectCount.toString()) : undefined
    },
    { href: '/settings', label: 'Settings', description: 'Manage your API keys' },
  ];

  const isActivePath = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Don't render dynamic content until mounted
  if (!mounted) {
    return (
      <nav 
        className="sticky top-0 z-40"
        role="navigation"
        aria-label="Main navigation"
        id="navigation"
      >
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="StyleGenie - AI Image Style Transfer, go to homepage"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white" aria-hidden="true">AI</span>
            </div>
            <span className="text-xl font-bold text-gray-900">StyleGenie</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8" role="menubar">
            <Link
              href="/upload"
              className="font-medium transition-colors rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              role="menuitem"
            >
              Upload
            </Link>
            <Link
              href="/history"
              className="font-medium transition-colors rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              role="menuitem"
            >
              History
            </Link>
            <Link
              href="/settings"
              className="font-medium transition-colors rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              role="menuitem"
            >
              Settings
            </Link>
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/upload">
              <Button 
                size="sm"
                className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-controls="mobile-menu"
              aria-expanded={false}
              aria-label="Open main menu"
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="block h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className="sticky top-0 z-40"
      role="navigation"
      aria-label="Main navigation"
      id="navigation"
    >
      <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="StyleGenie - AI Image Style Transfer, go to homepage"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white" aria-hidden="true">AI</span>
            </div>
            <span className="text-xl font-bold text-gray-900">StyleGenie</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8" role="menubar">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition-colors rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 ${
                  isActivePath(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                role="menuitem"
                aria-current={isActivePath(item.href) ? 'page' : undefined}
                title={item.description}
              >
                {item.label}
                {item.badge && (
                  <span 
                    className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-blue-600 rounded-full"
                    aria-label={`${item.badge} saved projects`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/upload">
              <Button 
                size="sm"
                className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">
                {isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}
              </span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-white"
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-heading"
        >
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link 
                href="/" 
                className="flex items-center space-x-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="StyleGenie - AI Image Style Transfer, go to homepage"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <span className="text-sm font-bold text-white" aria-hidden="true">AI</span>
                </div>
                <span className="text-xl font-bold text-gray-900">StyleGenie</span>
              </Link>
              
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Close main menu"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex-1 px-4 py-6 space-y-1" role="menu">
              <h2 id="mobile-menu-heading" className="sr-only">
                Main navigation menu
              </h2>
              
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isActivePath(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  role="menuitem"
                  aria-current={isActivePath(item.href) ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-gray-500">{item.description}</div>
                  </div>
                  {item.badge && (
                    <span 
                      className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-bold text-white bg-blue-600 rounded-full"
                      aria-label={`${item.badge} saved projects`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile CTA */}
            <div className="border-t border-gray-200 p-4">
              <Link href="/upload" onClick={() => setIsMobileMenuOpen(false)}>
                <Button 
                  className="w-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Create Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 