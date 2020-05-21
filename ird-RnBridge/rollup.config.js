/**
 * @file rollup配置文件
 */
import babel from 'rollup-plugin-babel';
// import { uglify } from 'rollup-plugin-uglify';
import fileSize from 'rollup-plugin-filesize';
import json from 'rollup-plugin-json';

export default {
    input: './index.js',
    output: {
        file: './dist/RhBridge.js',
        format: 'umd',
        name: 'RhBridge'
    },
    plugins: [
        babel({ exclude: 'node_modules/**' }),
        fileSize(),
        json(),
        // uglify()
    ]
};