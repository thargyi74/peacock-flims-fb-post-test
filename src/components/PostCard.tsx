'use client';

import { FacebookPost } from '@/types/facebook';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share, ExternalLink, ImageIcon, Calendar, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: FacebookPost;
  priority?: boolean;
}

export default function PostCard({ post, priority = false }: PostCardProps) {
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getEngagementCount = (type: 'reactions' | 'comments' | 'shares') => {
    switch (type) {
      case 'reactions':
        // Try aliased field first, fallback to original
        return post.reactions_count?.summary?.total_count || post.reactions?.summary?.total_count || 0;
      case 'comments':
        // Try aliased field first, fallback to original
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

  // Extract all images from the post
  const getAllImages = () => {
    const images: Array<{ src: string; width?: number; height?: number; key: string; quality: number }> = [];
    
    // Collect all potential images with quality scoring
    const allPotentialImages: Array<{ src: string; width?: number; height?: number; key: string; quality: number }> = [];

    // Add main picture/full picture
    const mainImage = post.main_picture || post.full_picture;
    if (mainImage) {
      allPotentialImages.push({
        src: mainImage,
        width: 800, // We know this is 800px from our API request
        height: 800,
        key: post.main_picture ? 'main_picture' : 'full_picture',
        quality: 100 // Highest priority for main picture
      });
    }

    // Add images from attachments
    if (post.attachments?.data) {
      post.attachments.data.forEach((attachment, attachmentIndex) => {
        // Main attachment image
        if (attachment.media?.image?.src) {
          const imageSize = (attachment.media.image.width || 0) * (attachment.media.image.height || 0);
          allPotentialImages.push({
            src: attachment.media.image.src,
            width: attachment.media.image.width,
            height: attachment.media.image.height,
            key: `attachment_${attachmentIndex}`,
            quality: 80 + (imageSize / 10000) // Higher quality for larger images
          });
        }

        // Subattachment images (for multiple photo posts)
        if (attachment.subattachments?.data) {
          attachment.subattachments.data.forEach((subattachment, subIndex) => {
            if (subattachment.media?.image?.src) {
              const imageSize = (subattachment.media.image.width || 0) * (subattachment.media.image.height || 0);
              allPotentialImages.push({
                src: subattachment.media.image.src,
                width: subattachment.media.image.width,
                height: subattachment.media.image.height,
                key: `subattachment_${attachmentIndex}_${subIndex}`,
                quality: 60 + (imageSize / 10000) // Lower base quality for subattachments
              });
            }
          });
        }
      });
    }

    // Group by base URL and keep only the highest quality version of each unique image
    const imageGroups = new Map<string, typeof allPotentialImages[0]>();
    
    allPotentialImages.forEach(image => {
      const baseUrl = getImageBaseUrl(image.src);
      const existing = imageGroups.get(baseUrl);
      
      if (!existing || image.quality > existing.quality) {
        imageGroups.set(baseUrl, image);
      }
    });

    // Convert back to array and sort by quality (highest first)
    const uniqueImages = Array.from(imageGroups.values())
      .sort((a, b) => b.quality - a.quality)
      .map(({ quality, ...image }) => image); // Remove quality field from final result

    return uniqueImages;
  };

  const renderImageGrid = (images: Array<{ src: string; width?: number; height?: number; key: string }>) => {
    // Check if this is a link post that should use fallback image
    const hasUrlInMessage = post.message && /(https?:\/\/[^\s]+)/i.test(post.message);
    const isLinkPost = hasUrlInMessage || post.attachments?.data?.some(att => att.target?.url && att.type !== 'photo');
    
    // For link posts, show fallback image instead of Facebook's auto-generated preview
    if (isLinkPost) {
      return (
        <div className="mb-4">
          <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden shadow-sm">
            <Image
              src="/fb_cover.jpg"
              alt="DVB Peacock Film Festival"
              width={800}
              height={400}
              className="w-full h-auto object-cover"
              sizes="(max-width: 768px) calc(100vw - 32px), 640px"
              style={{
                maxHeight: '300px',
                minHeight: '200px'
              }}
              onError={(e) => {
                console.error('Fallback image failed to load:', e);
              }}
              onLoad={() => {
                console.log('Fallback image loaded successfully for link post');
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <div className="text-sm font-medium opacity-90">DVB Peacock Film Festival</div>
            </div>
          </div>
        </div>
      );
    }

    // For regular posts with no images, return null
    if (images.length === 0) {
      return null;
    }

    if (images.length === 1) {
      // Single image - responsive height based on image aspect ratio
      const image = images[0];
      
      return (
        <div className="mb-4">
          {!imageErrors[image.key] ? (
            <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden shadow-sm">
              <Image
                src={image.src}
                alt="Post image"
                width={image.width || 800}
                height={image.height || 450}
                className="w-full h-auto object-contain"
                sizes="(max-width: 768px) calc(100vw - 32px), 640px"
                priority={priority}
                onError={() => handleImageError(image.key)}
                style={{
                  maxHeight: '500px', // Prevent extremely tall images
                  minHeight: '200px'  // Ensure minimum visibility
                }}
              />
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <ImageIcon size={24} className="mx-auto mb-2" />
                <span className="text-sm">Image unavailable</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (images.length === 2) {
      // Two images - side by side
      return (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {images.map((image) => (
            <div key={image.key} className="relative h-48">
              {!imageErrors[image.key] ? (
                <Image
                  src={image.src}
                  alt="Post image"
                  fill
                  className="object-cover rounded-md"
                  sizes="(max-width: 768px) calc(50vw - 20px), 316px"
                  priority={priority}
                  onError={() => handleImageError(image.key)}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                  <ImageIcon size={20} className="text-gray-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (images.length === 3) {
      // Three images - first full width, other two side by side
      return (
        <div className="mb-4">
          <div className="relative w-full h-48 mb-2">
            {!imageErrors[images[0].key] ? (
              <Image
                src={images[0].src}
                alt="Post image"
                fill
                className="object-cover rounded-md"
                sizes="(max-width: 768px) calc(100vw - 32px), 640px"
                priority={priority}
                onError={() => handleImageError(images[0].key)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                <ImageIcon size={24} className="text-gray-500" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {images.slice(1).map((image) => (
              <div key={image.key} className="relative h-32">
                {!imageErrors[image.key] ? (
                  <Image
                    src={image.src}
                    alt="Post image"
                    fill
                    className="object-cover rounded-md"
                    sizes="(max-width: 768px) calc(50vw - 20px), 316px"
                    priority={priority}
                    onError={() => handleImageError(image.key)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                    <ImageIcon size={16} className="text-gray-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Four or more images - 2x2 grid with overlay for additional images
    const displayImages = images.slice(0, 4);
    const remainingCount = images.length - 4;

    return (
      <div className="grid grid-cols-2 gap-2 mb-4">
        {displayImages.map((image, index) => (
          <div key={image.key} className="relative h-32">
            {!imageErrors[image.key] ? (
              <Image
                src={image.src}
                alt="Post image"
                fill
                className="object-cover rounded-md"
                sizes="(max-width: 768px) calc(50vw - 20px), 316px"
                priority={priority}
                onError={() => handleImageError(image.key)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                <ImageIcon size={16} className="text-gray-500" />
              </div>
            )}
            {index === 3 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  +{remainingCount}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const allImages = getAllImages();
  const totalEngagement = getTotalEngagement();
  const isHighEngagement = totalEngagement > 50;

  // Debug logging for development - check ALL posts
  if (process.env.NODE_ENV === 'development') {
    console.log('Post analysis:', {
      postId: post.id,
      imageCount: allImages.length,
      hasMainPicture: !!post.main_picture,
      hasFullPicture: !!post.full_picture,
      hasAttachments: !!post.attachments?.data?.length,
      attachmentTypes: post.attachments?.data?.map(att => att.type),
      messagePreview: post.message?.substring(0, 100),
      images: allImages.map(img => ({
        key: img.key,
        src: img.src.substring(0, 100) + '...',
        dimensions: `${img.width}x${img.height}`
      }))
    });
  }

  return (
    <article className={cn(
      "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-300",
      isHighEngagement && "ring-2 ring-blue-100 border-blue-200"
    )}>
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.created_time}>
              {formatDate(post.created_time)}
            </time>
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
            <ExternalLink size={16} />
          </a>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          {post.message && (
            <div className="prose prose-sm max-w-none">
              {shouldTruncateText(post.message) && !isExpanded ? (
                <div>
                  <p className="text-gray-800 whitespace-pre-wrap mb-2">
                    {post.message.substring(0, 300)}...
                  </p>
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                  >
                    Read more
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-800 whitespace-pre-wrap mb-2">
                    {post.message}
                  </p>
                  {shouldTruncateText(post.message) && isExpanded && (
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      Show less
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          
          {post.story && (
            <p className="text-gray-600 italic bg-gray-50 p-3 rounded-lg border-l-4 border-blue-200">
              {post.story}
            </p>
          )}
        </div>

        {/* Post Images */}
        {renderImageGrid(allImages)}

        {/* Non-image Attachments */}
        {post.attachments?.data && post.attachments.data.length > 0 && (
          <div className="mb-4">
            {post.attachments.data
              .filter(attachment => !attachment.media?.image && attachment.type !== 'photo')
              .map((attachment, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-2 bg-gray-50 hover:bg-gray-100 transition-colors">
                  {attachment.title && (
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {attachment.title}
                    </h4>
                  )}
                  {attachment.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {attachment.description}
                    </p>
                  )}
                  {attachment.target?.url && (
                    <a
                      href={attachment.target.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm inline-flex items-center gap-1 font-medium transition-colors"
                    >
                      View Link <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <EngagementButton
              icon={Heart}
              count={getEngagementCount('reactions')}
              color="text-red-500"
              hoverColor="hover:text-red-600"
              bgColor="hover:bg-red-50"
              label="reactions"
            />
            
            <EngagementButton
              icon={MessageCircle}
              count={getEngagementCount('comments')}
              color="text-blue-500"
              hoverColor="hover:text-blue-600"
              bgColor="hover:bg-blue-50"
              label="comments"
            />
            
            <EngagementButton
              icon={Share}
              count={getEngagementCount('shares')}
              color="text-green-500"
              hoverColor="hover:text-green-600"
              bgColor="hover:bg-green-50"
              label="shares"
            />
          </div>
          
          {totalEngagement > 0 && (
            <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
              {totalEngagement} total engagement{totalEngagement !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </article>
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
      className={cn(
        "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 group",
        bgColor
      )}
      aria-label={`${count} ${label}`}
    >
      <Icon size={16} className={cn(color, hoverColor, "transition-colors")} />
      <span className={cn("text-sm font-medium", count > 0 ? "text-gray-700" : "text-gray-400")}>
        {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
      </span>
    </button>
  );
}
