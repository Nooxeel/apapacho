'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { isDntEnabled } from '@/lib/dnt';

// Reemplaza con tu ID de medición de GA4
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

export function GoogleAnalytics() {
  // DNT (Do Not Track): never load GA if the browser signals opt-out.
  // We resolve the flag on the client only (navigator is SSR-undefined), so
  // for one render the component returns null and only mounts the GA scripts
  // when DNT is confirmed off. This means a DNT user never even fetches the
  // gtag.js bundle from googletagmanager.com.
  const [dnt, setDnt] = useState<boolean | null>(null);
  useEffect(() => {
    setDnt(isDntEnabled());
  }, []);

  // No cargar en desarrollo si no hay ID configurado
  if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    return null;
  }

  // While we haven't checked yet (SSR + first paint) OR if DNT is on, skip GA.
  if (dnt === null || dnt === true) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
            cookie_flags: 'SameSite=None;Secure',
          });
        `}
      </Script>
    </>
  );
}

// Función para trackear eventos personalizados
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Eventos predefinidos para Apapacho
export const analyticsEvents = {
  // Conversión
  signup: () => trackEvent('sign_up', 'engagement'),
  login: () => trackEvent('login', 'engagement'),
  
  // Monetización
  subscribe: (creatorUsername: string, tierName: string, amount: number) => 
    trackEvent('purchase', 'ecommerce', `${creatorUsername}:${tierName}`, amount),
  donate: (creatorUsername: string, amount: number) => 
    trackEvent('donate', 'ecommerce', creatorUsername, amount),
  
  // Engagement
  viewCreator: (username: string) => 
    trackEvent('view_item', 'engagement', username),
  addFavorite: (username: string) => 
    trackEvent('add_to_wishlist', 'engagement', username),
  sendMessage: () => 
    trackEvent('generate_lead', 'engagement'),
  
  // Contenido
  viewPost: (postId: string) => 
    trackEvent('view_item', 'content', postId),
  unlockContent: (postId: string, amount: number) => 
    trackEvent('unlock_achievement', 'content', postId, amount),
};
