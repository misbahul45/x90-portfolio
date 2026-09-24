import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  plugins: [
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart(),
    viteReact({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
  build: {
    // Highlight chunk (≈950 kB raw / 300 kB gz) carries highlight.js core
    // + 12 curated languages. Loaded only via lazy chunks on admin article
    // routes and AskLabs AI chat, so a relaxed limit here avoids noise
    // without shipping the bundle to public routes.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@tiptap/')) return 'editor'
          if (id.includes('highlight.js') || id.includes('lowlight')) return 'highlight'
          if (id.includes('@xyflow/react')) return 'flow'
          if (
            id.includes('openai') ||
            id.includes('@langchain/') ||
            id.includes('langchain/') ||
            id.includes('@huggingface/') ||
            id.includes('@neondatabase/') ||
            id.includes('@prisma/adapter-neon')
          )
            return 'ai'
          if (
            id.includes('@prisma/client') ||
            id.includes('@prisma/adapter-pg') ||
            id.includes('pdf-parse') ||
            id.includes('pdfjs-dist')
          )
            return 'prisma'
          if (
            id.includes('radix-ui') ||
            id.includes('lucide-react') ||
            id.includes('node_modules/motion') ||
            id.includes('class-variance-authority') ||
            id.includes('clsx') ||
            id.includes('tailwind-merge') ||
            id.includes('sonner') ||
            id.includes('next-themes')
          )
            return 'ui'
          if (
            id.includes('@tanstack/react-router') ||
            id.includes('@tanstack/react-query') ||
            id.includes('@tanstack/react-table') ||
            id.includes('@tanstack/react-form') ||
            id.includes('@tanstack/react-router-ssr-query') ||
            id.includes('@tanstack/match-sorter-utils')
          )
            return 'tanstack'
        },
      },
    },
  },
})

export default config
