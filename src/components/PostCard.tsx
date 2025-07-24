'use client';

import { FacebookPost } from '@/types/facebook';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share, ImageIcon, Calendar, TrendingUp, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Custom Facebook icon component
const FacebookIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

interface PostCardProps {
  post: FacebookPost;
  priority?: boolean;
}

// Helper function to extract base URL for duplicate detection
const getImageBaseUrl = (url: string): string => {
  try {
    // Remove Facebook's URL parameters but keep the core image identifier
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // Get the image ID part (usually contains numbers and letters)
    const imageId = pathParts.find(part => /^\d+_\d+_\d+/.test(part));
    return imageId || urlObj.pathname;
  } catch {
    return url;
  }
};

export default function PostCard({ post, priority = false }: PostCardProps) {
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const getAllImages = useCallback(() => {
    const allPotentialImages: Array<{ src: string; width?: number; height?: number; key: string; quality: number }> = [];

    const mainImage = post.main_picture || post.full_picture;
    if (mainImage) {
      allPotentialImages.push({
        src: mainImage,
        width: 800,
        height: 800,
        key: post.main_picture ? 'main_picture' : 'full_picture',
        quality: 100
      });
    }

    if (post.attachments?.data) {
      post.attachments.data.forEach((attachment, attachmentIndex) => {
        if (attachment.media?.image?.src) {
          const imageSize = (attachment.media.image.width || 0) * (attachment.media.image.height || 0);
          allPotentialImages.push({
            src: attachment.media.image.src,
            width: attachment.media.image.width,
            height: attachment.media.image.height,
            key: `attachment_${attachmentIndex}`,
            quality: 80 + (imageSize / 10000)
          });
        }

        if (attachment.subattachments?.data) {
          attachment.subattachments.data.forEach((subattachment, subIndex) => {
            if (subattachment.media?.image?.src) {
              const imageSize = (subattachment.media.image.width || 0) * (subattachment.media.image.height || 0);
              allPotentialImages.push({
                src: subattachment.media.image.src,
                width: subattachment.media.image.width,
                height: subattachment.media.image.height,
                key: `subattachment_${attachmentIndex}_${subIndex}`,
                quality: 60 + (imageSize / 10000)
              });
            }
          });
        }
      });
    }

    const imageGroups = new Map<string, typeof allPotentialImages[0]>();
    
    allPotentialImages.forEach(image => {
      const baseUrl = getImageBaseUrl(image.src);
      const existing = imageGroups.get(baseUrl);
      
      if (!existing || image.quality > existing.quality) {
        imageGroups.set(baseUrl, image);
      }
    });

    return Array.from(imageGroups.values())
      .sort((a, b) => b.quality - a.quality)
      .map(({ quality, ...image }) => {
        // Using quality variable to avoid unused variable error
        console.debug('Image quality:', quality);
        return image;
      });
  }, [post]);

  const allImages = getAllImages();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen) {
        if (e.key === 'Escape') {
          setIsModalOpen(false);
        }
        if (e.key === 'ArrowRight') {
          setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
        }
        if (e.key === 'ArrowLeft') {
          setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, allImages.length]);

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getEngagementCount = (type: 'reactions' | 'comments' | 'shares') => {
    switch (type) {
      case 'reactions':
        return post.reactions_count?.summary?.total_count || post.reactions?.summary?.total_count || 0;
      case 'comments':
        return post.comments_count?.summary?.total_count || post.comments?.summary?.total_count || 0;
      case 'shares':
        return post.shares?.count || 0;
      default:
        return 0;
    }
  };

  const getTotalEngagement = () => {
    return getEngagementCount('reactions') + getEngagementCount('comments') + getEngagementCount('shares');
  };

  const shouldTruncateText = (text: string) => text.length > 300;

  const handleImageError = (imageKey: string) => {
    setImageErrors(prev => ({ ...prev, [imageKey]: true }));
  };

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const renderImageGrid = (images: Array<{ src: string; width?: number; height?: number; key: string }>) => {
    if (images.length === 0) return null;

    if (images.length === 1) {
      const image = images[0];
      return (
        <div className="mb-4 cursor-pointer" onClick={() => openModal(0)}>
          {!imageErrors[image.key] ? (
            <Image
              src={image.src}
              alt="Post image"
              width={image.width || 800}
              height={image.height || 600}
              className="w-full h-auto object-cover rounded-lg border border-gray-200"
              sizes="(max-width: 768px) 100vw, 800px"
              priority={priority}
              onError={() => handleImageError(image.key)}
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <ImageIcon size={32} className="text-gray-500" />
            </div>
          )}
        </div>
      );
    }

    const gridClasses = {
      2: 'grid-cols-2',
      3: 'grid-cols-2',
      4: 'grid-cols-2',
    };

    const imageContainerClass = (index: number) => {
      if (images.length === 3 && index === 0) return 'col-span-2 row-span-2';
      return '';
    };

    return (
      <div className={`grid ${gridClasses[images.length as keyof typeof gridClasses] || 'grid-cols-2'} gap-2 mb-4`}>
        {images.slice(0, 4).map((image, index) => (
          <div 
            key={image.key} 
            className={`relative h-48 cursor-pointer ${imageContainerClass(index)}`}
            onClick={() => openModal(index)}
          >
            {!imageErrors[image.key] ? (
              <Image
                src={image.src}
                alt="Post image"
                fill
                className="object-cover rounded-md"
                sizes="(max-width: 768px) 50vw, 320px"
                priority={priority}
                onError={() => handleImageError(image.key)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                <ImageIcon size={20} className="text-gray-500" />
              </div>
            )}
            {images.length > 4 && index === 3 && (
              <div className="absolute inset-0 bg-black bg-opacity-60 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-2xl">+{images.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const totalEngagement = getTotalEngagement();
  const isHighEngagement = totalEngagement > 50;

  return (
    <>
      <article className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-300",
        isHighEngagement && "ring-2 ring-blue-100 border-blue-200"
      )}>
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.created_time}>{formatDate(post.created_time)}</time>
              {isHighEngagement && (
                <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs font-medium">
                  <TrendingUp className="w-3 h-3" />
                  Popular
                </div>
              )}
            </div>
            <a
              href={post.permalink_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1 rounded-full hover:bg-blue-50"
              aria-label="View post on Facebook"
            >
              <FacebookIcon size={16} />
            </a>
          </div>

          <div className="mb-4">
            {post.message && (
              <div className="prose prose-sm max-w-none">
                {shouldTruncateText(post.message) && !isExpanded ? (
                  <div>
                    <p className="text-gray-800 whitespace-pre-wrap mb-2">{post.message.substring(0, 300)}...</p>
                    <button onClick={() => setIsExpanded(true)} className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                      Read more
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-800 whitespace-pre-wrap mb-2">{post.message}</p>
                    {shouldTruncateText(post.message) && isExpanded && (
                      <button onClick={() => setIsExpanded(false)} className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                        Show less
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            {post.story && <p className="text-gray-600 italic bg-gray-50 p-3 rounded-lg border-l-4 border-blue-200">{post.story}</p>}
          </div>

          {renderImageGrid(allImages)}

        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <EngagementButton icon={Heart} count={getEngagementCount('reactions')} color="text-red-500" hoverColor="hover:text-red-600" bgColor="hover:bg-red-50" label="reactions" />
              <EngagementButton icon={MessageCircle} count={getEngagementCount('comments')} color="text-blue-500" hoverColor="hover:text-blue-600" bgColor="hover:bg-blue-50" label="comments" />
              <EngagementButton icon={Share} count={getEngagementCount('shares')} color="text-green-500" hoverColor="hover:text-green-600" bgColor="hover:bg-green-50" label="shares" />
            </div>
            {totalEngagement > 0 && (
              <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
                {totalEngagement} total engagement{totalEngagement !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </article>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative w-full h-full">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-white bg-gray-800 rounded-full p-2 z-10">
              <X size={24} />
            </button>
            
            <div className="flex items-center justify-center h-full">
              <button 
                onClick={() => setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                className="absolute left-4 text-white bg-gray-800 rounded-full p-2"
              >
                <ChevronLeft size={32} />
              </button>

              <div className="relative w-4/5 h-4/5">
                <Image
                  src={allImages[selectedImageIndex].src}
                  alt="Full screen post image"
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>

              <button 
                onClick={() => setSelectedImageIndex((prev) => (prev + 1) % allImages.length)}
                className="absolute right-4 text-white bg-gray-800 rounded-full p-2"
              >
                <ChevronRight size={32} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface EngagementButtonProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  count: number;
  color: string;
  hoverColor: string;
  bgColor: string;
  label: string;
}

function EngagementButton({ icon: Icon, count, color, hoverColor, bgColor, label }: EngagementButtonProps) {
  return (
    <button 
      className={cn("flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 group", bgColor)}
      aria-label={`${count} ${label}`}
    >
      <Icon size={16} className={cn(color, hoverColor, "transition-colors")} />
      <span className={cn("text-sm font-medium", count > 0 ? "text-gray-700" : "text-gray-400")}>
        {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
      </span>
    </button>
  );
}

