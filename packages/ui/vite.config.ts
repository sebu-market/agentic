import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from 'vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import fs from 'fs';

// https://vite.dev/guide/dep-pre-bundling.html#monorepos-and-linked-dependencies

function resolveCjsDependencies() {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
  const packageScope = packageJson.name.split('/')[0];

  const localDependencies =
    Object.keys(packageJson.dependencies || {})
      .filter(dep => dep.startsWith(packageScope))

  const externalDependencies =
    Object.keys(packageJson.dependencies || {})
      .filter(dep => dep.startsWith('@radix-ui'))

  return [...localDependencies, ...externalDependencies];
}

const cjsDependencies = undefined; //resolveCjsDependencies();

console.log('cjsDependencies', cjsDependencies);

export default ({ mode }: { mode: string }) => {

  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    build: {
      commonjsOptions: {
        include: cjsDependencies,
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              const modulePath = id.split('node_modules/')[1];
              const topLevelFolder = modulePath.split('/')[0];
              if (topLevelFolder !== '.pnpm') {
                return topLevelFolder;
              }
              const scopedPackageName = modulePath.split('/')[1];
              const chunkName = scopedPackageName.split('@')[scopedPackageName.startsWith('@') ? 1 : 0];
              return chunkName;
            }
          }
        }
      }
    },
    optimizeDeps: {
      include: cjsDependencies,
    },
    plugins: [
      TanStackRouterVite(),
      react()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: process.env.VITE_API_PROXY_TARGET,
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      }
    }
  });
}
