/**
 * @file rollup配置文件
 */
import babel from 'rollup-plugin-babel';
// import { uglify } from 'rollup-plugin-uglify';
import fileSize from 'rollup-plugin-filesize';
import json from 'rollup-plugin-json';
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace';
const pkg = require('./package');

export default {
    input: './src/index.js',
    output: {
        file: './dist/HyBridge.js',
        format: 'umd',
        name: 'HyBridge'
    },
    plugins: [
        resolve({
            browser: true
        }),
        babel({ exclude: 'node_modules/**' }),
        fileSize(),
        json(),
        replace({ __VERSION__: pkg.version })
    ]
};