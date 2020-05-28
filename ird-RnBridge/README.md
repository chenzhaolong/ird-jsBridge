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

- h5 如果是在h5端，则会拥有以下的api：

1. RnBridge.initH5: 用来注册给RN调用的js方法。


```
RnBridge.initH5({
    a1(params, send) {}
})
```
其中，params时rn传过来的参数；send是回调函数，用来发送信息给RN层，send({isSuccess: boolean, result: xxx})

2. RnBridge.checkSafety: 发起H5验证，只有Rn侧验证通过，才会建立通信桥梁。
 
```
RnBridge.checkSafety(params, cb)
```
其中cb时成功时的回调；

3. RnBridge.invokeRn: 调用RN层的方法，只有再安全验证通过的时候才能调用。

```
RnBridge.invokeRn(options)
```
其中options的格式：

```
{
    method, params, success, fail
}
```


4. RnBridge.listenRN: 监听Rn调用h5的方法，此方法时initH5的一个补充。
 
```
RnBridge.listenH5(method, () => {})
```

5. RnBridge.extends: 用来扩展RnBridge的行为

```
RnBridge.extends(methodName, cb)
```


- rn 如果是rn端，则会拥有以下的api：

1. RnBridge.initWebview: RN的webview组件componentDidMount时初始化RnBridge，主要是用来提供给h5侧调用的js方法。

```
RnBridge.initWebview(webview, {
    method(params, send) {}
})
```

2. RnBridge.executeCheckSafety: 处理H5发送验证信息的方法，默认是验证通过，如果initWebview中有定义checkSafety的处理方式，会将验证权交给checkSafety方法处理。


3. RnBridge.listenH5: 主要使用来监听h5发送过来的调用信息。


```
RnBridge.listenH5(params)
```


4. RnBridge.invokeH5: 调用h5方法

```
RnBridge.invokeH5({
    method, params, success, fail
})
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

RnBridge.checkSafety({demo: 'demo'}, () => {
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
        send({isSuccess: true});
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
