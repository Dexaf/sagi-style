import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    build: {
        lib: {
            entry: resolve(import.meta.dirname, 'src/1.0/index.ts'),
            name: 'sagi-style',
            formats: ['es'],
        },
    },
})