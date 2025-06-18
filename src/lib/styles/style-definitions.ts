export interface StyleParameter {
  name: string;
  type: 'slider' | 'toggle' | 'select';
  min?: number;
  max?: number;
  default: number | boolean | string;
  options?: string[];
  description: string;
}

export interface ArtStyle {
  id: string;
  name: string;
  category: StyleCategory;
  description: string;
  shortDescription: string;
  prompt: string;
  parameters: StyleParameter[];
  previewUrl: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  processingTime: 'fast' | 'medium' | 'slow';
  featured: boolean;
  popularity: number;
  created: string;
}

export type StyleCategory = 
  | 'classic'
  | 'modern' 
  | 'digital'
  | 'traditional'
  | 'contemporary'
  | 'photographic';

export const STYLE_CATEGORIES: Record<StyleCategory, {
  name: string;
  description: string;
  icon: string;
}> = {
  classic: {
    name: 'Classic Art',
    description: 'Timeless artistic movements from art history',
    icon: '🎨'
  },
  modern: {
    name: 'Modern Art',
    description: '20th century artistic innovations',
    icon: '🖼️'
  },
  digital: {
    name: 'Digital Art',
    description: 'Contemporary digital and cyber aesthetics',
    icon: '💻'
  },
  traditional: {
    name: 'Traditional Media',
    description: 'Classic artistic techniques and materials',
    icon: '🖌️'
  },
  contemporary: {
    name: 'Contemporary',
    description: 'Modern popular culture and street art',
    icon: '🎭'
  },
  photographic: {
    name: 'Photography',
    description: 'Photographic styles and effects',
    icon: '📸'
  }
};

export const ART_STYLES: ArtStyle[] = [
  // CLASSIC ART STYLES
  {
    id: 'impressionist',
    name: 'Impressionist',
    category: 'classic',
    description: 'Capture light and atmosphere with loose brushwork and vibrant colors, inspired by Monet and Renoir',
    shortDescription: 'Light-filled paintings with loose brushwork',
    prompt: 'in the style of impressionist painting, loose brushwork, visible brushstrokes, capturing light and atmosphere, plein air technique, vibrant colors',
    parameters: [
      {
        name: 'brushwork',
        type: 'slider',
        min: 0,
        max: 100,
        default: 75,
        description: 'Intensity of visible brushstrokes'
      },
      {
        name: 'lightness',
        type: 'slider',
        min: 0,
        max: 100,
        default: 80,
        description: 'Brightness and luminosity'
      }
    ],
    previewUrl: '/style-previews/impressionist.jpg',
    tags: ['monet', 'renoir', 'light', 'atmosphere', 'brushwork'],
    difficulty: 'intermediate',
    processingTime: 'medium',
    featured: true,
    popularity: 95,
    created: '2024-12-28'
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    category: 'classic',
    description: 'Masterful realism with perfect proportions and divine lighting, inspired by Leonardo da Vinci',
    shortDescription: 'Classical realism with perfect proportions',
    prompt: 'in the style of Renaissance painting, sfumato technique, chiaroscuro lighting, perfect proportions, classical composition, oil painting technique',
    parameters: [
      {
        name: 'chiaroscuro',
        type: 'slider',
        min: 0,
        max: 100,
        default: 70,
        description: 'Dramatic light and shadow contrast'
      },
      {
        name: 'detail',
        type: 'slider',
        min: 0,
        max: 100,
        default: 90,
        description: 'Level of fine detail'
      }
    ],
    previewUrl: '/style-previews/renaissance.jpg',
    tags: ['leonardo', 'michelangelo', 'classical', 'realism', 'sfumato'],
    difficulty: 'advanced',
    processingTime: 'slow',
    featured: true,
    popularity: 85,
    created: '2024-12-28'
  },
  {
    id: 'baroque',
    name: 'Baroque',
    category: 'classic',
    description: 'Dramatic, emotional scenes with rich colors and dynamic movement, inspired by Caravaggio',
    shortDescription: 'Dramatic scenes with rich colors',
    prompt: 'in the style of Baroque painting, dramatic chiaroscuro, rich colors, dynamic composition, emotional intensity, tenebrism',
    parameters: [
      {
        name: 'drama',
        type: 'slider',
        min: 0,
        max: 100,
        default: 85,
        description: 'Emotional and visual drama'
      },
      {
        name: 'richness',
        type: 'slider',
        min: 0,
        max: 100,
        default: 80,
        description: 'Color richness and saturation'
      }
    ],
    previewUrl: '/style-previews/baroque.jpg',
    tags: ['caravaggio', 'dramatic', 'chiaroscuro', 'emotional', 'dynamic'],
    difficulty: 'advanced',
    processingTime: 'slow',
    featured: false,
    popularity: 70,
    created: '2024-12-28'
  },
  {
    id: 'romantic',
    name: 'Romantic',
    category: 'classic',
    description: 'Sublime landscapes and emotional depth, inspired by Caspar David Friedrich',
    shortDescription: 'Sublime landscapes with emotional depth',
    prompt: 'in the style of Romantic painting, sublime landscape, emotional depth, dramatic skies, solitary figures, nature worship',
    parameters: [
      {
        name: 'sublime',
        type: 'slider',
        min: 0,
        max: 100,
        default: 75,
        description: 'Sense of awe and grandeur'
      },
      {
        name: 'emotion',
        type: 'slider',
        min: 0,
        max: 100,
        default: 80,
        description: 'Emotional intensity'
      }
    ],
    previewUrl: '/style-previews/romantic.jpg',
    tags: ['friedrich', 'sublime', 'landscape', 'emotion', 'nature'],
    difficulty: 'intermediate',
    processingTime: 'medium',
    featured: false,
    popularity: 65,
    created: '2024-12-28'
  },
  {
    id: 'post_impressionist',
    name: 'Post-Impressionist',
    category: 'classic',
    description: 'Bold colors and expressive brushwork, inspired by Van Gogh and Cézanne',
    shortDescription: 'Bold colors and expressive brushwork',
    prompt: 'in the style of Post-Impressionist painting, bold colors, expressive brushwork, emotional color, structural composition, visible texture',
    parameters: [
      {
        name: 'boldness',
        type: 'slider',
        min: 0,
        max: 100,
        default: 85,
        description: 'Color boldness and saturation'
      },
      {
        name: 'expression',
        type: 'slider',
        min: 0,
        max: 100,
        default: 80,
        description: 'Expressive brushwork intensity'
      }
    ],
    previewUrl: '/style-previews/post-impressionist.jpg',
    tags: ['van gogh', 'cezanne', 'bold', 'expressive', 'color'],
    difficulty: 'intermediate',
    processingTime: 'medium',
    featured: true,
    popularity: 90,
    created: '2024-12-28'
  },

  // MODERN ART STYLES
  {
    id: 'cubist',
    name: 'Cubist',
    category: 'modern',
    description: 'Geometric abstraction with multiple perspectives, inspired by Picasso and Braque',
    shortDescription: 'Geometric abstraction with multiple perspectives',
    prompt: 'in the style of Cubist painting, geometric forms, multiple perspectives, fragmented planes, analytical cubism, abstract geometry',
    parameters: [
      {
        name: 'fragmentation',
        type: 'slider',
        min: 0,
        max: 100,
        default: 75,
        description: 'Level of geometric fragmentation'
      },
      {
        name: 'abstraction',
        type: 'slider',
        min: 0,
        max: 100,
        default: 70,
        description: 'Degree of abstraction'
      }
    ],
    previewUrl: '/style-previews/cubist.jpg',
    tags: ['picasso', 'braque', 'geometric', 'abstract', 'perspective'],
    difficulty: 'advanced',
    processingTime: 'slow',
    featured: true,
    popularity: 75,
    created: '2024-12-28'
  },
  {
    id: 'surrealist',
    name: 'Surrealist',
    category: 'modern',
    description: 'Dreamlike imagery and impossible scenes, inspired by Salvador Dalí',
    shortDescription: 'Dreamlike imagery and impossible scenes',
    prompt: 'in the style of Surrealist painting, dreamlike imagery, impossible scenes, subconscious mind, melting forms, hyperrealistic details',
    parameters: [
      {
        name: 'dreaminess',
        type: 'slider',
        min: 0,
        max: 100,
        default: 85,
        description: 'Dreamlike quality'
      },
      {
        name: 'impossibility',
        type: 'slider',
        min: 0,
        max: 100,
        default: 80,
        description: 'Level of impossible elements'
      }
    ],
    previewUrl: '/style-previews/surrealist.jpg',
    tags: ['dali', 'dream', 'subconscious', 'impossible', 'melting'],
    difficulty: 'advanced',
    processingTime: 'slow',
    featured: true,
    popularity: 88,
    created: '2024-12-28'
  },
  {
    id: 'abstract_expressionist',
    name: 'Abstract Expressionist',
    category: 'modern',
    description: 'Spontaneous, gestural painting with emotional intensity, inspired by Jackson Pollock',
    shortDescription: 'Spontaneous gestural painting',
    prompt: 'in the style of Abstract Expressionist painting, gestural brushwork, color field, emotional expression, spontaneous technique, large scale',
    parameters: [
      {
        name: 'gesture',
        type: 'slider',
        min: 0,
        max: 100,
        default: 90,
        description: 'Gestural brushwork intensity'
      },
      {
        name: 'spontaneity',
        type: 'slider',
        min: 0,
        max: 100,
        default: 85,
        description: 'Spontaneous painting quality'
      }
    ],
    previewUrl: '/style-previews/abstract-expressionist.jpg',
    tags: ['pollock', 'rothko', 'gestural', 'emotional', 'spontaneous'],
    difficulty: 'advanced',
    processingTime: 'medium',
    featured: false,
    popularity: 70,
    created: '2024-12-28'
  },
  {
    id: 'pop_art',
    name: 'Pop Art',
    category: 'modern',
    description: 'Bold colors and commercial imagery, inspired by Andy Warhol',
    shortDescription: 'Bold colors and commercial imagery',
    prompt: 'in the style of Pop Art, bold colors, commercial imagery, screen printing effect, repetition, consumer culture aesthetic',
    parameters: [
      {
        name: 'boldness',
        type: 'slider',
        min: 0,
        max: 100,
        default: 95,
        description: 'Color boldness and contrast'
      },
      {
        name: 'commercial',
        type: 'slider',
        min: 0,
        max: 100,
        default: 80,
        description: 'Commercial aesthetic'
      }
    ],
    previewUrl: '/style-previews/pop-art.jpg',
    tags: ['warhol', 'lichtenstein', 'bold', 'commercial', 'repetition'],
    difficulty: 'beginner',
    processingTime: 'fast',
    featured: true,
    popularity: 92,
    created: '2024-12-28'
  },
  {
    id: 'art_deco',
    name: 'Art Deco',
    category: 'modern',
    description: 'Geometric elegance with luxurious materials, inspired by the Jazz Age',
    shortDescription: 'Geometric elegance with luxury',
    prompt: 'in the style of Art Deco, geometric patterns, luxurious materials, streamlined forms, metallic accents, elegant symmetry',
    parameters: [
      {
        name: 'elegance',
        type: 'slider',
        min: 0,
        max: 100,
        default: 85,
        description: 'Elegant refinement'
      },
      {
        name: 'luxury',
        type: 'slider',
        min: 0,
        max: 100,
        default: 80,
        description: 'Luxurious materials and finish'
      }
    ],
    previewUrl: '/style-previews/art-deco.jpg',
    tags: ['geometric', 'luxury', 'jazz age', 'streamlined', 'metallic'],
    difficulty: 'intermediate',
    processingTime: 'medium',
    featured: false,
    popularity: 75,
    created: '2024-12-28'
  },

  // DIGITAL ART STYLES
  {
    id: 'pixel_art',
    name: 'Pixel Art',
    category: 'digital',
    description: '8-bit and 16-bit gaming aesthetic with crisp pixel details',
    shortDescription: 'Retro gaming pixel aesthetic',
    prompt: 'in pixel art style, 8-bit aesthetic, limited color palette, crisp pixels, retro gaming, low resolution charm',
    parameters: [
      {
        name: 'pixelSize',
        type: 'slider',
        min: 1,
        max: 10,
        default: 4,
        description: 'Pixel size multiplier'
      },
      {
        name: 'colorLimit',
        type: 'slider',
        min: 8,
        max: 256,
        default: 32,
        description: 'Color palette size'
      }
    ],
    previewUrl: '/style-previews/pixel-art.jpg',
    tags: ['8-bit', '16-bit', 'gaming', 'retro', 'pixels'],
    difficulty: 'beginner',
    processingTime: 'fast',
    featured: true,
    popularity: 85,
    created: '2024-12-28'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    category: 'digital',
    description: 'Neon-lit futuristic cityscapes with high-tech aesthetics',
    shortDescription: 'Neon-lit futuristic cityscapes',
    prompt: 'in cyberpunk style, neon lights, futuristic cityscape, high-tech aesthetic, dark atmosphere, electric colors, dystopian future',
    parameters: [
      {
        name: 'neonIntensity',
        type: 'slider',
        min: 0,
        max: 100,
        default: 85,
        description: 'Neon light intensity'
      },
      {
        name: 'techLevel',
        type: 'slider',
        min: 0,
        max: 100,
        default: 80,
        description: 'High-tech elements'
      }
    ],
    previewUrl: '/style-previews/cyberpunk.jpg',
    tags: ['neon', 'futuristic', 'high-tech', 'dystopian', 'electric'],
    difficulty: 'intermediate',
    processingTime: 'medium',
    featured: true,
    popularity: 90,
    created: '2024-12-28'
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    category: 'digital',
    description: '80s retro-futuristic aesthetic with neon grids and sunsets',
    shortDescription: '80s retro-futuristic aesthetic',
    prompt: 'in synthwave style, 80s retro-futuristic, neon grid, sunset colors, chrome effects, outrun aesthetic, vaporwave',
    parameters: [
      {
        name: 'retro',
        type: 'slider',
        min: 0,
        max: 100,
        default: 90,
        description: '80s retro intensity'
      },
      {
        name: 'neonGrid',
        type: 'toggle',
        default: true,
        description: 'Include neon grid elements'
      }
    ],
    previewUrl: '/style-previews/synthwave.jpg',
    tags: ['80s', 'retro', 'neon', 'grid', 'outrun', 'vaporwave'],
    difficulty: 'intermediate',
    processingTime: 'medium',
    featured: true,
    popularity: 88,
    created: '2024-12-28'
  },
  {
    id: 'glitch_art',
    name: 'Glitch Art',
    category: 'digital',
    description: 'Digital corruption aesthetic with data moshing effects',
    shortDescription: 'Digital corruption aesthetic',
    prompt: 'in glitch art style, digital corruption, data moshing, pixel sorting, RGB shift, digital artifacts, error aesthetics',
    parameters: [
      {
        name: 'corruption',
        type: 'slider',
        min: 0,
        max: 100,
        default: 70,
        description: 'Digital corruption level'
      },
      {
        name: 'rgbShift',
        type: 'slider',
        min: 0,
        max: 100,
        default: 60,
        description: 'RGB color shift intensity'
      }
    ],
    previewUrl: '/style-previews/glitch-art.jpg',
    tags: ['glitch', 'corruption', 'digital', 'error', 'artifacts'],
    difficulty: 'advanced',
    processingTime: 'medium',
    featured: false,
    popularity: 72,
    created: '2024-12-28'
  },

  // TRADITIONAL MEDIA STYLES
  {
    id: 'charcoal',
    name: 'Charcoal Drawing',
    category: 'traditional',
    description: 'Rich blacks and subtle grays with textured charcoal strokes',
    shortDescription: 'Rich blacks with charcoal texture',
    prompt: 'charcoal drawing style, rich blacks, subtle grays, textured strokes, smudging technique, dramatic contrast',
    parameters: [
      {
        name: 'contrast',
        type: 'slider',
        min: 0,
        max: 100,
        default: 80,
        description: 'Black and white contrast'
      },
      {
        name: 'texture',
        type: 'slider',
        min: 0,
        max: 100,
        default: 75,
        description: 'Charcoal texture visibility'
      }
    ],
    previewUrl: '/style-previews/charcoal.jpg',
    tags: ['charcoal', 'drawing', 'monochrome', 'texture', 'contrast'],
    difficulty: 'intermediate',
    processingTime: 'fast',
    featured: false,
    popularity: 68,
    created: '2024-12-28'
  },
  {
    id: 'pastel',
    name: 'Pastel',
    category: 'traditional',
    description: 'Soft, dreamy colors with gentle blending',
    shortDescription: 'Soft, dreamy colors with gentle blending',
    prompt: 'pastel drawing style, soft colors, gentle blending, dreamy atmosphere, chalk pastel texture, delicate strokes',
    parameters: [
      {
        name: 'softness',
        type: 'slider',
        min: 0,
        max: 100,
        default: 85,
        description: 'Color softness and blending'
      },
      {
        name: 'dreaminess',
        type: 'slider',
        min: 0,
        max: 100,
        default: 80,
        description: 'Dreamy atmospheric quality'
      }
    ],
    previewUrl: '/style-previews/pastel.jpg',
    tags: ['pastel', 'soft', 'dreamy', 'blending', 'delicate'],
    difficulty: 'beginner',
    processingTime: 'fast',
    featured: false,
    popularity: 70,
    created: '2024-12-28'
  },
  {
    id: 'acrylic',
    name: 'Acrylic',
    category: 'traditional',
    description: 'Vibrant colors with bold brush strokes and texture',
    shortDescription: 'Vibrant colors with bold brush strokes',
    prompt: 'acrylic painting style, vibrant colors, bold brush strokes, thick paint texture, contemporary technique, matte finish',
    parameters: [
      {
        name: 'vibrancy',
        type: 'slider',
        min: 0,
        max: 100,
        default: 85,
        description: 'Color vibrancy and saturation'
      },
      {
        name: 'thickness',
        type: 'slider',
        min: 0,
        max: 100,
        default: 70,
        description: 'Paint thickness and texture'
      }
    ],
    previewUrl: '/style-previews/acrylic.jpg',
    tags: ['acrylic', 'vibrant', 'bold', 'texture', 'contemporary'],
    difficulty: 'intermediate',
    processingTime: 'medium',
    featured: false,
    popularity: 75,
    created: '2024-12-28'
  },
  {
    id: 'pen_ink',
    name: 'Pen & Ink',
    category: 'traditional',
    description: 'Precise line work with crosshatching and stippling',
    shortDescription: 'Precise line work with crosshatching',
    prompt: 'pen and ink drawing style, precise line work, crosshatching, stippling, black ink, detailed illustration',
    parameters: [
      {
        name: 'precision',
        type: 'slider',
        min: 0,
        max: 100,
        default: 90,
        description: 'Line precision and control'
      },
      {
        name: 'detail',
        type: 'slider',
        min: 0,
        max: 100,
        default: 85,
        description: 'Level of fine detail'
      }
    ],
    previewUrl: '/style-previews/pen-ink.jpg',
    tags: ['pen', 'ink', 'crosshatch', 'stipple', 'precise', 'detailed'],
    difficulty: 'advanced',
    processingTime: 'medium',
    featured: false,
    popularity: 65,
    created: '2024-12-28'
  },

  // CONTEMPORARY STYLES
  {
    id: 'street_art',
    name: 'Street Art',
    category: 'contemporary',
    description: 'Urban graffiti aesthetic with bold colors and spray paint effects',
    shortDescription: 'Urban graffiti with spray paint effects',
    prompt: 'street art style, graffiti aesthetic, spray paint effects, urban culture, bold colors, stencil art, wall texture',
    parameters: [
      {
        name: 'urban',
        type: 'slider',
        min: 0,
        max: 100,
        default: 85,
        description: 'Urban street aesthetic'
      },
      {
        name: 'sprayEffect',
        type: 'slider',
        min: 0,
        max: 100,
        default: 80,
        description: 'Spray paint effect intensity'
      }
    ],
    previewUrl: '/style-previews/street-art.jpg',
    tags: ['graffiti', 'urban', 'spray paint', 'street', 'bold'],
    difficulty: 'intermediate',
    processingTime: 'medium',
    featured: true,
    popularity: 82,
    created: '2024-12-28'
  },
  {
    id: 'manga',
    name: 'Manga/Anime',
    category: 'contemporary',
    description: 'Japanese comic and animation style with clean lines',
    shortDescription: 'Japanese comic and animation style',
    prompt: 'manga anime style, clean line art, cel shading, Japanese animation, expressive characters, screen tones',
    parameters: [
      {
        name: 'cleanness',
        type: 'slider',
        min: 0,
        max: 100,
        default: 90,
        description: 'Line art cleanness'
      },
      {
        name: 'expression',
        type: 'slider',
        min: 0,
        max: 100,
        default: 85,
        description: 'Character expressiveness'
      }
    ],
    previewUrl: '/style-previews/manga.jpg',
    tags: ['manga', 'anime', 'japanese', 'clean', 'cel shading'],
    difficulty: 'intermediate',
    processingTime: 'medium',
    featured: true,
    popularity: 93,
    created: '2024-12-28'
  },
  {
    id: 'instagram_filter',
    name: 'Instagram Filter',
    category: 'contemporary',
    description: 'Social media aesthetic with enhanced colors and vintage feel',
    shortDescription: 'Social media aesthetic with enhanced colors',
    prompt: 'Instagram filter style, enhanced colors, vintage feel, social media aesthetic, warm tones, slight vignette',
    parameters: [
      {
        name: 'enhancement',
        type: 'slider',
        min: 0,
        max: 100,
        default: 75,
        description: 'Color enhancement level'
      },
      {
        name: 'vintage',
        type: 'slider',
        min: 0,
        max: 100,
        default: 60,
        description: 'Vintage filter intensity'
      }
    ],
    previewUrl: '/style-previews/instagram.jpg',
    tags: ['instagram', 'filter', 'social media', 'enhanced', 'vintage'],
    difficulty: 'beginner',
    processingTime: 'fast',
    featured: false,
    popularity: 78,
    created: '2024-12-28'
  },

  // PHOTOGRAPHIC STYLES
  {
    id: 'hdr_photography',
    name: 'HDR Photography',
    category: 'photographic',
    description: 'High dynamic range with enhanced detail and dramatic lighting',
    shortDescription: 'High dynamic range with enhanced detail',
    prompt: 'HDR photography style, high dynamic range, enhanced detail, dramatic lighting, tone mapping, surreal colors',
    parameters: [
      {
        name: 'dynamicRange',
        type: 'slider',
        min: 0,
        max: 100,
        default: 85,
        description: 'Dynamic range enhancement'
      },
      {
        name: 'drama',
        type: 'slider',
        min: 0,
        max: 100,
        default: 75,
        description: 'Dramatic lighting intensity'
      }
    ],
    previewUrl: '/style-previews/hdr.jpg',
    tags: ['hdr', 'photography', 'dynamic range', 'dramatic', 'enhanced'],
    difficulty: 'intermediate',
    processingTime: 'medium',
    featured: false,
    popularity: 72,
    created: '2024-12-28'
  },
  {
    id: 'black_white',
    name: 'Black & White',
    category: 'photographic',
    description: 'Classic monochrome photography with rich tonal range',
    shortDescription: 'Classic monochrome photography',
    prompt: 'black and white photography style, monochrome, rich tonal range, classic photography, dramatic contrast, film grain',
    parameters: [
      {
        name: 'contrast',
        type: 'slider',
        min: 0,
        max: 100,
        default: 75,
        description: 'Tonal contrast'
      },
      {
        name: 'grain',
        type: 'slider',
        min: 0,
        max: 100,
        default: 30,
        description: 'Film grain intensity'
      }
    ],
    previewUrl: '/style-previews/black-white.jpg',
    tags: ['black white', 'monochrome', 'photography', 'contrast', 'classic'],
    difficulty: 'beginner',
    processingTime: 'fast',
    featured: false,
    popularity: 80,
    created: '2024-12-28'
  },
  {
    id: 'vintage_photo',
    name: 'Vintage Photo',
    category: 'photographic',
    description: 'Nostalgic film photography with warm tones and soft focus',
    shortDescription: 'Nostalgic film photography with warm tones',
    prompt: 'vintage photography style, nostalgic film look, warm tones, soft focus, aged paper texture, sepia undertones',
    parameters: [
      {
        name: 'warmth',
        type: 'slider',
        min: 0,
        max: 100,
        default: 80,
        description: 'Warm tone intensity'
      },
      {
        name: 'aging',
        type: 'slider',
        min: 0,
        max: 100,
        default: 70,
        description: 'Vintage aging effect'
      }
    ],
    previewUrl: '/style-previews/vintage-photo.jpg',
    tags: ['vintage', 'film', 'nostalgic', 'warm', 'sepia'],
    difficulty: 'beginner',
    processingTime: 'fast',
    featured: false,
    popularity: 85,
    created: '2024-12-28'
  }
];

// Helper functions
export const getStyleById = (id: string): ArtStyle | undefined => {
  return ART_STYLES.find(style => style.id === id);
};

export const getStylesByCategory = (category: StyleCategory): ArtStyle[] => {
  return ART_STYLES.filter(style => style.category === category);
};

export const getFeaturedStyles = (): ArtStyle[] => {
  return ART_STYLES.filter(style => style.featured);
};

export const getPopularStyles = (limit: number = 10): ArtStyle[] => {
  return ART_STYLES
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
};

export const searchStyles = (query: string): ArtStyle[] => {
  const lowercaseQuery = query.toLowerCase();
  return ART_STYLES.filter(style => 
    style.name.toLowerCase().includes(lowercaseQuery) ||
    style.description.toLowerCase().includes(lowercaseQuery) ||
    style.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}; 