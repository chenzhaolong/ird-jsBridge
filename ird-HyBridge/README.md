# ird-HyBridge

## 1.介绍

- 定义：ird-HyBridge是一个基于webview的原生和js两端通信的桥梁，可以通过注入指定的三种webview的通信协议，然后在被原生认可的基础上，建立通信桥梁。本工具只涉及js层的开发，原生层的开发还需要原生层的同学去搞，只要原生层能正确的解析和调用本工具传输的数据结构，就可以畅顺的进行通信。

- 安装：

```
npm i ird-HyBridge
```

- 调用形式：

1. iife：直接在html文件引入

```
<script type='text/script' src='./ird-HyBridge/dist/HyBridge.js' />
```

 2.umd：

```
import HyBridge from 'ird-HyBridge';
```

- 使用：

```
HyBridge.injectScheme({
    ui: xxx,
    wk: xxx,
    android: xxx
});
HyBridge.init(options, () => {
  console.log('建立通信')
})
```

## 2. API

- injectScheme：

注入用来和原生通信的协议，按照不同类型的webview进行注入。

```
HyBridge.injectScheme({
    ui: 'REACT_NATIVE://postmessage',
    wk: 'REACT_NATIVE',
    android: 'REACTNATIVE'
});
```


- init

初始化桥梁，只有被原生认可的初始化，才会获取到原生颁发的token令牌，以后每次调用原生方法都会带有该令牌。
发送到原生层时type的值为checkSafety。

```
HyBridge.init({cookie: xxx}, () => {
    console.log('建立通信');
}) 
```


- invokeByNative：

原生层通过次方法会调用js层的回调方法，适用于执行js层的回调情况；

```
HyBridge.invokeNative({
    type: 类型，初始化时是填safety，如果是执行回调则填jsCb
    callbackId: 回调id,
    result: 结果，如果是初始化且被认可时，会带有原生层暴露给js层的全部方法，如果是调用cb，则是原生层执行完后的结果。
    token?: 在初始化结束调用js层时带回来。
    isSuccess?: 在js层调用原生方法时原生方法执行成功后的标志。
})
```


- invoke：

调用原生方法，会带上token令牌，原生层需要判断判断token令牌是否一致才处理。
发送到原生层的type是na


```
HyBridge.invoke({
    methodName: 原生层的方法,
    success: 成功回调函数,
    fail: 失败回调函数,
    params: 参数
})
```


- registerAll：

注册一系列提供给原生调用的js方法，这些注册的js方法，js方法中有两个参数，一个是原生层传过来的参数，另一个则是开发者是否决定将该js方法执行的结果回传给原生的方法。


```
HyBridge.registerAll({
    方法名: (params, send) => {
        ...
        send(结果)
    },
    ...
})
```


- register：

单个提供给原生调用的js方法注册，用法和上面一致。


```
HyBridge.register(methodName, (params, send) => {
    ...
    send(结果)
})
```

send发送到原生层的type为nacb

- invokeJs：

提供给原生层调用js层方法的方法。

```
webView.loadUrl("javascript:HyBridge.invokeJs(methodName, params, callbackId)")
```


- listen：

能监听HyBridge.emit发射的事件，主要是用来作为钩子使用，原生层调用emit，js层就可以对某些特殊时刻进行监听。


```
HyBridge.listen('onLoad', () => {
  ...
})
```


- emit：
主要是提供给原生层调用。


```
webview.loadUrl("javascript: HyBridge.emit('onLoad', {a1: 1}")
```


- remove：

删除被绑定的事件


```
HyBridge.remove('onload')
```


- extends：

主要是用来扩展HyBridge。

```
HyBridge.extend('setTitle', (title) => {
    ...
    HyBridge.invoke({
        methodName: 'setTitle',
        params: {title: title}
    })
})

HyBridge.setTitle('xxx')
```
