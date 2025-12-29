'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, Badge } from '@/components/ui';
import { BadgeCheck, Heart, Search } from 'lucide-react';

interface Creator {
  id: string;
  userId: string;
  profileImage: string | null;
  bio: string | null;
  isVerified: boolean;
  accentColor: string;
  backgroundColor: string;
  backgroundGradient: string | null;
  user: {
    username: string;
    displayName: string;
    avatar: string | null;
  };
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCreators();
  }, []);

  const loadCreators = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/creators');
      if (response.ok) {
        const data = await response.json();
        setCreators(data);
      }
    } catch (error) {
      console.error('Error loading creators:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCreators = creators.filter(creator =>
    (creator.user?.displayName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (creator.user?.username?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const getCreatorImage = (creator: Creator) => {
    if (creator.profileImage) return `http://localhost:3001${creator.profileImage}`;
    if (creator.user?.avatar) return creator.user.avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.user?.displayName || 'User')}&background=random&size=200`;
  };

  return (
    <div className="min-h-screen bg-[#0f0f14]">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Explora <span className="gradient-text">Creadores</span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Descubre creadores únicos con perfiles personalizables
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Buscar creadores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500 mx-auto"></div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredCreators.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/40">
                {searchQuery ? 'No se encontraron creadores' : 'No hay creadores disponibles'}
              </p>
            </div>
          )}

          {/* Creators Grid */}
          {!isLoading && filteredCreators.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCreators.map((creator) => (
                <Link key={creator.id} href={`/${creator.user?.username || ''}`}>
                  <Card
                    variant="solid"
                    hover
                    className="overflow-hidden cursor-pointer group h-full"
                  >
                    {/* Cover with background color */}
                    <div 
                      className={`relative h-24 bg-gradient-to-br ${creator.backgroundGradient || ''}`}
                      style={{
                        backgroundColor: creator.backgroundGradient ? undefined : (creator.backgroundColor || '#1a1a2e')
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      
                      {/* Profile Image - Circular Avatar */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                        <div className="relative w-20 h-20 rounded-full border-4 border-[#0f0f14] overflow-hidden bg-white/10">
                          {creator.profileImage ? (
                            <img
                              src={creator.profileImage}
                              alt={creator.user?.displayName || 'Creator'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold bg-gradient-to-br from-purple-600 to-pink-600">
                              {(creator.user?.displayName || 'U').substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 pt-12">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white truncate group-hover:gradient-text transition-all">
                          {creator.user?.displayName || 'Sin nombre'}
                        </h3>
                        {creator.isVerified && (
                          <BadgeCheck 
                            className="w-4 h-4 flex-shrink-0" 
                            style={{ color: creator.accentColor }}
                            fill={creator.accentColor}
                          />
                        )}
                      </div>
                      <p className="text-white/50 text-sm mb-3">@{creator.user?.username || 'unknown'}</p>
                      
                      {creator.bio && (
                        <p className="text-white/40 text-xs line-clamp-2">
                          {creator.bio}
                        </p>
                      )}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
