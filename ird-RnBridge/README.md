# **ird-RnBridge**

## 1.介绍
- 定义：ird-RnBridge是一个基于react-native内部的webview组件建立的一套通信桥梁，它能接通webview内嵌的js端和rn的js端，从而实现rn的js端和内嵌在webview的js端无缝通信。开发者只需要在各自的环境下初始化对应的api，就能实现互通。

- 安装：

```
npm i ird-rnbridge
```

- 调用形式：

1. iife：直接自爱html文件引入

```
<script type='text/script' src='./ird-RnBridge/dist/RnBridge.js' />
```

2. umd：

```
import RnBridge from 'ird-RnBridge';
```

- 使用：

h5端-内嵌在webview中：

```
RnBridge.switchMode({mode: 'h5'})
```
rn的js端：

```
RnBridge.switchMode({mode: 'rn'})
```


## 2.API

- h5: 


- rn:

## 3.使用