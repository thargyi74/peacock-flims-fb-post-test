'use client';

import { FacebookPost } from '@/types/facebook';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share, ExternalLink, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface PostCardProps {
  post: FacebookPost;
}

export default function PostCard({ post }: PostCardProps) {
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getEngagementCount = (type: 'reactions' | 'comments' | 'shares') => {
    switch (type) {
      case 'reactions':
        return post.reactions?.summary?.total_count || 0;
      case 'comments':
        return post.comments?.summary?.total_count || 0;
      case 'shares':
        return post.shares?.count || 0;
      default:
        return 0;
    }
  };

  const handleImageError = (imageKey: string) => {
    setImageErrors(prev => ({ ...prev, [imageKey]: true }));
  };

  // Extract all images from the post
  const getAllImages = () => {
    const images: Array<{ src: string; width?: number; height?: number; key: string }> = [];
    
    // Add full_picture if available
    if (post.full_picture) {
      images.push({
        src: post.full_picture,
        key: 'full_picture'
      });
    }

    // Add images from attachments
    if (post.attachments?.data) {
      post.attachments.data.forEach((attachment, attachmentIndex) => {
        // Main attachment image
        if (attachment.media?.image?.src) {
          images.push({
            src: attachment.media.image.src,
            width: attachment.media.image.width,
            height: attachment.media.image.height,
            key: `attachment_${attachmentIndex}`
          });
        }

        // Subattachment images (for multiple photo posts)
        if (attachment.subattachments?.data) {
          attachment.subattachments.data.forEach((subattachment, subIndex) => {
            if (subattachment.media?.image?.src) {
              images.push({
                src: subattachment.media.image.src,
                width: subattachment.media.image.width,
                height: subattachment.media.image.height,
                key: `subattachment_${attachmentIndex}_${subIndex}`
              });
            }
          });
        }
      });
    }

    // Remove duplicates based on src
    const uniqueImages = images.filter((image, index, self) => 
      index === self.findIndex(img => img.src === image.src)
    );

    return uniqueImages;
  };

  const renderImageGrid = (images: Array<{ src: string; width?: number; height?: number; key: string }>) => {
    if (images.length === 0) return null;

    if (images.length === 1) {
      // Single image - full width
      const image = images[0];
      return (
        <div className="relative w-full h-64 mb-4">
          {!imageErrors[image.key] ? (
            <Image
              src={image.src}
              alt="Post image"
              fill
              className="object-cover rounded-md"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => handleImageError(image.key)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
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
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
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
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
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
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
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

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">
          {formatDate(post.created_time)}
        </div>
        <a
          href={post.permalink_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ExternalLink size={16} />
        </a>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        {post.message && (
          <p className="text-gray-800 mb-4 whitespace-pre-wrap">
            {post.message}
          </p>
        )}
        
        {post.story && (
          <p className="text-gray-600 mb-4 italic">
            {post.story}
          </p>
        )}

        {/* Post Images */}
        {renderImageGrid(allImages)}

        {/* Non-image Attachments */}
        {post.attachments?.data && post.attachments.data.length > 0 && (
          <div className="mb-4">
            {post.attachments.data
              .filter(attachment => !attachment.media?.image && attachment.type !== 'photo')
              .map((attachment, index) => (
                <div key={index} className="border rounded-md p-4 mb-2">
                  {attachment.title && (
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {attachment.title}
                    </h4>
                  )}
                  {attachment.description && (
                    <p className="text-gray-600 text-sm mb-2">
                      {attachment.description}
                    </p>
                  )}
                  {attachment.target?.url && (
                    <a
                      href={attachment.target.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center gap-1"
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
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6 text-gray-600">
          <div className="flex items-center space-x-1">
            <Heart size={16} className="text-red-500" />
            <span className="text-sm">{getEngagementCount('reactions')}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <MessageCircle size={16} className="text-blue-500" />
            <span className="text-sm">{getEngagementCount('comments')}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Share size={16} className="text-green-500" />
            <span className="text-sm">{getEngagementCount('shares')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
