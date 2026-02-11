'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'development') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
            console.log('Service worker unregistered');
          }
        });
        if ('caches' in window) {
          caches.keys().then((names) => {
            for (const name of names) {
              caches.delete(name);
              console.log('Cache deleted:', name);
            }
          });
        }
      } else {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => console.log('Service worker registered with scope:', registration.scope))
          .catch((error) => console.error('Service worker registration failed:', error));
      }
    }
  }, [])

  return null
}

export default ServiceWorkerRegistrar;
