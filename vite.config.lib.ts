import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from "vite-plugin-dts";

export default defineConfig({
    build: {
        lib: {
            entry: resolve(import.meta.dirname, 'src/1.0/index.ts'),
            name: 'index',
            formats: ['es'],
        },
        assetsDir: 'public/sagi-style/assets',
        cssCodeSplit: true,
    },
    base: '/',
    plugins: [
        dts({
            insertTypesEntry: true,
        }),
    ],
})