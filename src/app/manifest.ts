import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Space Link',
    short_name: 'SpaceLink',
    description: 'Social Media Platform',
    start_url: '/',
    display: 'standalone', 
    background_color: '#0F172A',
    theme_color: '#10b981',
    icons: [
      {
        src: '/icon.png', 
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}