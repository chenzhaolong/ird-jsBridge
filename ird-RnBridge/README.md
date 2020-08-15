# **ird-RnBridge**

## 1.介绍
- 定义：ird-RnBridge是一个基于react-native内部的webview组件建立的一套通信桥梁，它能接通webview内嵌的js端和rn的js端，从而实现rn的js端和内嵌在webview的js端无缝通信。开发者只需要在各自的环境下初始化对应的api，就能实现互通。

- 安装：

```
npm i ird-rnbridge
```

- 调用形式：

1 iife：直接在html文件引入

```
<script type='text/script' src='./ird-RnBridge/dist/RnBridge.js' />
```

2  umd：

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

**注意1：Rnbridge在rn端和h5端各自具备不一样的一套api方法，原则上rn端的api不能使用在h5端，反之亦然；通过switchMode可以安装各端的api方法集合；**

**注意2：在Rnbridge在rn侧的api会注册在RNbridge本身；Rnbridge在h5侧的api则会注册在全局变量window.Rnbridge之中，一旦switchMode完，就可以直接在任何地方使用。**


## 2.API

#### h5 如果是在h5端，则会拥有以下的api：

1 . RnBridge.initH5: 用来注册给RN调用的js方法。


```
RnBridge.initH5({
    a1(params, send) {}
})
```
其中，params时rn传过来的参数；send是回调函数，用来发送信息给RN层，send({isSuccess: boolean, result: xxx})

2 . RnBridge.checkSafety: 发起H5验证，只有Rn侧验证通过，才会建立通信桥梁。
 
```
RnBridge.checkSafety(params, cb)
```
其中cb时成功时的回调，cb的参数是rn传过来的数据；

3 . RnBridge.invokeRn: 调用RN层的方法，只有在安全验证通过的时候才能调用。

```
RnBridge.invokeRn(options)
```
其中options的格式：

```
{
    method：RN方法名, params：参数, success：成功回调, fail：失败回调
}
```


4 . RnBridge.listenRN: 监听Rn调用h5的方法，此方法时initH5的一个补充。
 
```
RnBridge.listenH5(method, (params, send) => {})
params: rn侧传过来的参数；
send(options)：发送消息给rn侧，唤起rn侧的回调, options = {isSuccess: 成功还是失败, result: 传给rn侧的参数}
```

5 . RnBridge.extends: 用来扩展RnBridge的行为

```
RnBridge.extends(methodName, cb)
```

6 . sendPerformance：发送H5的性能参数，rn端必须要用listenPerformance监听，才能获取H5首屏的性能参数。


```
RnBridge.sendPerformance()
```

7 . sendPerformanceByType：发送各种资源性能参数，同样在rn侧需要listenTypePerformance监听才能获取数据


```
RnBridge.sendPerformanceByType(type);

type：是想要的资源数据，为空则是发送全部类型，
```

8 . HttpType： sendPerformanceByType参数type的枚举；


```
    ALL = 'all',
    IMG = 'img',
    LINK = 'link',
    IFRAME = 'iframe',
    SCRIPT = 'script',
    CSS = 'css',
    XHR = 'xmlhttprequest',
    NAV = 'navigation'
```

9 . getSessionStore: rn侧通过sessionStore存储的数据，可以由改api获取制定的key的数据；


```
Rnbridge.getSessionStore(key, (data) => {})

key: 指定从rn侧获取的数据的key，数组格式，支持同时获取多个key；
```
该方式是手动获取rn侧数据；

10 . getSessionStoreAsync: 异步获取store，当sessionStore设置noticeH5时，一旦存储成功后就会主动通知h5，然后该方法的回调就会执行。


```
Rnbridge.getSessionStoreAsync(key, cb)
```
该方式是等待rn层主动调用。

11 . debug：调试h5侧的代码，rn侧需要额外各自类型进行监听listenAjax，listenConsole


```
Rnbridge.debug(type, isStop)

type: 类型，有console和ajax两种模式；
istop：停止监听
```



#### rn 如果是rn端，则会拥有以下的api：

1 . RnBridge.initWebview: RN的webview组件componentDidMount时初始化RnBridge，主要是用来提供给h5侧调用的js方法。

```
RnBridge.initWebview(webview, {
    method(params, send) {}
})
```

2 . RnBridge.executeCheckSafety: 处理H5发送验证信息的方法，默认是验证通过，如果initWebview中有定义checkSafety的处理方式，会将验证权交给checkSafety方法处理。




3 . RnBridge.listenH5: 主要使用来监听h5发送过来的调用信息。


```
RnBridge.listenH5(params)
```


4 . RnBridge.invokeH5: 调用h5方法

```
RnBridge.invokeH5({
    method, params, success, fail
})
```
5 . Rnbridge.listenPerformance: 监听H5的性能数据

```
Rnbridge.listenPerformance(cb)
```

6 . Rnbridge.listenTypePerformance: 监听H5请求资源的性能数据

```
Rnbridge.listenTypePerformance(cb)
```
7 . Rnbridge.sessionStore: 用来储存数据，在rn侧提供一份数据给h5端获取；

```
Rnbridge.sessionStore(options)

options: {
    key: 存储数据的key，
    data: 存储的数据,
    type: 储存数据的操作类型，add：添加，delete：删除，modify：修改，
    noticeH5：存储数据完成后是否通知h5侧
}
```


8 . Rnbridge.clearSessionStore: 清除session中的数据

```
Rnbridge.clearSessionStore(key) // 如果key不存在则删除全部
```


9 . Rnbridge.hasSessionStoreByKey: 判断是否在session中油key的存在

```
Rnbridge.hasSessionStoreByKey(key)
```


10 . Rnbridge.listenAjax: 监听h5发布的ajax请求

```
Rnbridge.listenAjax()
```

11 . Rnbridge.listenConsole: 监听h5发布的console

```
Rnbridge.listenConsole()
```

12 . Rnbridge.resetRN: 重置数据；

```
Rnbridge.resetRN()
```


## 3.使用

h5侧：

```
 RnBridge.switchMode({mode: 'h5'});
 
 RnBridge.initH5({
    h1: (params, send) => {
      send({isSuccess: true, result: {a2: 39}});
    },
    h2: (params, send) => {
      send({isSuccess: false, result: {a1: 21}});
    }
});

RnBridge.checkSafety({demo: 'demo'}, (data) => {
    ocument.getElementById('demo').style.color = 'blue';
});

RnBridge.invokeRN({
    method: 'a1',
    params: {a1: 12},
    success: (result) => {
        document.getElementById('demo').style.color = 'green';
        document.getElementById('demo').innerText = JSON.stringify(result);
    },
   fail: (result) => {
        document.getElementById('demo').style.color = 'red';
        document.getElementById('demo').innerText = JSON.stringify(result);
    }
});
```

rn侧：


```
RnBridge.switchMode({mode: 'rn'});

export class Demo extends React.Component {
    constructor(props) {
        super(props);
        this.webview = null;
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <WebView
                    originWhitelist={['*']}
                    source={{ uri: 'http://192.168.1.101:9001/'}}
                    ref={ele => this.webview = ele}
                    onMessage={(e) => {
                        console.log('e', e.nativeEvent.data);
                        RnBridge.listenH5(e.nativeEvent.data);
                    }}
                    onError={(e) => {
                        console.log('error', e)
                    }}
                    onLoadEnd={() => {
                        console.log('load end')
                    }}
                    onLoadStart={() => {
                        console.log('load start')
                    }}
                />
                <View>
                    <Text onPress={() => {
                        this.handleC()
                    }}>click</Text>
                </View>
            </View>
        )
    }

    componentDidMount() {
        console.log('RnBridge', RnBridge);
        RnBridge.initWebview(this.webview, {
            a1: (params, send) => {
                this.handleA(params, send);
            },
            a2: (params, send) => {
                this.handleB(params, send);
            },
            checkSafety: (params, send) => {
                this.veritySafety(params, send);
            },
            setTitle: (params, send) => {
                console.log('title', params);
            }
        })
    }

    veritySafety(params, send) {
        send({isSuccess: true, result: 'welcome'});
    }

    handleA(params, send) {
        console.log(params);
        send({isSuccess: false, result: 'asdf'})
    }

    handleB(params, send) {
        console.log(params);
        RnBridge.invokeH5({

        });
        setTimeout(() => {
            send({isSuccess: true, result: 'ok'})
        }, 1000);
    }

    handleC () {
        RnBridge.invokeH5({
            method: 'h3',
            params: {demo: true},
            success: (params) => {
                console.log('params', params);
            },
            fail: (params) => {
                console.log('fail', params);
            }
        })
    }
}
```
