'use client';

import Script from 'next/script';

// Reemplaza con tu ID de medición de GA4
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

export function GoogleAnalytics() {
  // No cargar en desarrollo si no hay ID configurado
  if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
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
