/**
 * @file rollup配置文件
 */
import babel from 'rollup-plugin-babel';
// import { uglify } from 'rollup-plugin-uglify';
import fileSize from 'rollup-plugin-filesize';
import json from 'rollup-plugin-json';
import resolve from '@rollup/plugin-node-resolve'

export default {
    input: './index.js',
    output: {
        file: './dist/RnBridge.js',
        format: 'iife',
        name: 'RnBridge'
    },
    plugins: [
        resolve({
            browser: true
        }),
        babel({ exclude: 'node_modules/**' }),
        fileSize(),
        json()
    ]
};