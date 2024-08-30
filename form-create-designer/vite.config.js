import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJSX from '@vitejs/plugin-vue-jsx';
import banner from 'vite-plugin-banner';
import { resolve } from 'path';
import { author, license, name, version } from './package.json';

// 自定义横幅
const __banner__ = {
    author: `2021-${new Date().getFullYear()} ${author}\n * Github https://github.com/xaboy/form-create-designer\n * Site https://form-create.com/`,
    license,
    name,
    version
};

export default defineConfig({
    root: resolve(__dirname, 'examples'),  // 将根目录设置为 examples 目录
    base: '/',  // 基础公共路径
    server: {
        port: 8081,  // 服务器启动端口号
        open: true,  // 启动时自动打开浏览器
        proxy: {
            // https://cn.vitejs.dev/config/#server-proxy
            '/dev-api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                rewrite: (p) => p.replace(/^\/dev-api/, '')
            }
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, '../RuoYi-Vue/src/'),  // 配置路径别名，将 '@' 指向 src 目录
        }
    },
    build: {
        outDir: '../dist',  // 输出目录，设置为相对于 root 的路径
        sourcemap: true,  // 生成 source map 文件
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'examples/index.html'),  // 主入口 HTML 文件
            },
            output: {
                manualChunks: {
                    vue: ['vue'],
                    'element-plus': ['element-plus'],
                },
                globals: {
                    vue: 'Vue',
                }
            }
        },
        chunkSizeWarningLimit: 2000,  // 文件大小警告限制
    },
    plugins: [
        vue(),
        vueJSX(),
        banner({
            content: `/*!
 * ${__banner__.name} v${__banner__.version}
 * (c) ${__banner__.author}
 * Released under the ${__banner__.license} License.
 */`
        })
    ]
});
