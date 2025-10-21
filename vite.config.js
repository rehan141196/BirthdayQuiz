import { defineConfig } from 'vite';

export default defineConfig({
    base: "/BirthdayQuiz/",
    publicDir: 'public',
    build: {
        rollupOptions: {
            external: [],
            output: {
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith('.json')) {
                        return '[name][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                }
            }
        }
    }
})
