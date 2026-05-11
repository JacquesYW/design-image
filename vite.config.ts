import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import AutoImport from 'unplugin-auto-import';
import postcssPresetEnv from 'postcss-preset-env';

// https://vitejs.dev/config/
export default ({ mode }: { mode: string }) => {
  let base = '/';
  if (mode === 'production') {
    base = '/design-image/';
  }
  return defineConfig({
    base,
    plugins: [
      react(),
      AutoImport.vite({
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        ],
        imports: [
          // presets
          'react',
        ],
        dts: false,
        eslintrc: {
          enabled: false,
        },
      }),
    ],
    define: {
      BASENAME: JSON.stringify(base),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    resolve: {
      alias: [
        // 应用路径别名
        {
          find: '@',
          replacement: resolve(__dirname, './src'),
        },
      ],
    },
    css: {
      modules: {
        generateScopedName: 'design-[local]-[hash:base64:5]',
        hashPrefix: 'design-',
      },
      preprocessorOptions: {
        less: {
          additionalData: `@import  "@/assets/styles/variables.less";`,
        },
      },
      postcss: {
        plugins: [postcssPresetEnv],
      },
    },
  });
};
