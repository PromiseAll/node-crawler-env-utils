import { globalEnvProxyConfig, setEnvProxy, createProxy, toFnNative, definedValue, definedProtoValue } from "node-crawler-env-utils";
globalEnvProxyConfig.logConfig = {
    level: 2,
    maxValueLength: 100,
}
// globalEnvProxyConfig.isProxyEnabled = false
globalThis.window = globalThis.top = globalThis.self = globalThis.parent = globalThis

delete globalThis.Buffer

globalThis.outerWidth = 390
globalThis.innerWidth = 390
globalThis.outerHeight = 844
globalThis.innerHeight = 844
globalThis.xsecappid = "ranchi"
globalThis.dssts = 0
globalThis.loadts = Date.now().toString()

globalThis.chrome = createProxy({}, {}, "chrome")

delete globalThis[Symbol.toStringTag]
definedValue(globalThis, Symbol.toStringTag, "Window", {
    configurable: false,
    enumerable: false,
    writable: false
})

globalThis.requestAnimationFrame = toFnNative(function requestAnimationFrame(callback) {
    setTimeout(() => {
        callback()
    }, 0)
})

// requestIdleCallback
globalThis.requestIdleCallback = toFnNative(function requestIdleCallback(callback) {
    setTimeout(() => {
        callback()
    }, 0)
})

globalThis.addEventListener = toFnNative(function addEventListener(type, listener) {
    // console.log(type, listener)
})


globalThis.MouseEvent = toFnNative(function MouseEvent(type, options) {

})

// TouchEvent
globalThis.TouchEvent = toFnNative(function TouchEvent(type, options) {
    this.type = type
    this.options = options
})
// DeviceMotionEvent
globalThis.DeviceMotionEvent = toFnNative(function DeviceMotionEvent(type, options) {
    this.type = type
    this.options = options
})
// DeviceOrientationEvent
globalThis.DeviceOrientationEvent = toFnNative(function DeviceOrientationEvent(type, options) {
    this.type = type
    this.options = options
})



globalThis.Screen = function Screen() {
    this.width = 390
    this.height = 844
}

globalThis.Navigator = function Navigator() {

}
globalThis.Navigator.prototype.userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1 Edg/138.0.0.0"
globalThis.Navigator.prototype.webdriver = false
globalThis.Navigator.prototype.appName = 'Netscape'


globalThis.Location = function Location() {
    definedValue(this, "href", "https://www.xiaohongshu.com/?channel_id=homefeed.fashion_v3", {
        configurable: false,
        enumerable: true,
        writable: false
    })
}
globalThis.location = createProxy(new Location(), {}, "location")

function HTMLBodyElement() {
    definedProtoValue(this, "removeChild", toFnNative(function removeChild(child) {
        console.log("removeChild", child)
    }))
}
function HTMLDocument() {

}

function HTMLHtmlElement() {
    definedProtoValue(this, "getAttribute", toFnNative(function getAttribute(name) {
        console.log("getAttribute", name)
        return undefined
    }))
}

function HTMLCollection(length) {
    this.length = length
    this[Symbol.iterator] = toFnNative(function* () {
        for (let i = 0; i < this.length; i++) {
            yield createProxy({
                tagName: "html",
            }, {}, `HTMLCollection->html-${i}`)
        }
    })
}


globalThis.HTMLElement = function HTMLElement() {
    return createProxy({}, {}, "HTMLElement")
}

function HTMLAllCollection() {
    definedProtoValue(this, "length", 1)
    definedProtoValue(this, Symbol.iterator, function* () {
        for (let i = 0; i < this.length; i++) {
            yield createProxy({
                tagName: "div",
            }, {}, "HTMLAllCollection->div")
        }
    })

}


HTMLDocument.prototype.body = createProxy(new HTMLBodyElement(), {}, "document.body")
HTMLDocument.prototype.cookie = 'abRequestId=0121de06-175e-5c7f-932e-ede367379454; a1=1921df45a34zullulpbbiog25sj6rebo53h87tgma50000129098; webId=83a86a473e0e7ce3fe74ee7660a99e9d; gid=yjJyfi42fS20yjJyfi420q9kq4u71171UDD3x60lkJ2MVY28KFdDlW888yJj8jY84WqYj4iq; webBuild=4.74.0; xsecappid=ranchi; loadts=1753325327941; websectiga=59d3ef1e60c4aa37a7df3c23467bd46d7f1da0b1918cf335ee7f2e9e52ac04cf'
HTMLDocument.prototype.documentElement = createProxy(new HTMLHtmlElement(), {}, "document.documentElement")
HTMLDocument.prototype.addEventListener = createProxy(globalThis.addEventListener, {}, "document.addEventListener")
// getElementsByTagName
HTMLDocument.prototype.getElementsByTagName = toFnNative(function getElementsByTagName(name) {
    // return [globalThis.body]
    console.log("getElementsByTagName", name)
    return createProxy(new HTMLCollection(1), {}, "getElementsByTagName")
})

HTMLDocument.prototype.all = createProxy(new HTMLAllCollection())




globalThis.document = createProxy(new HTMLDocument(), {}, "document")
globalThis.screen = createProxy(new Screen(), {}, "screen")
delete globalThis.navigator
globalThis.navigator = createProxy(new Navigator(), {}, "navigator")
globalThis.history = createProxy({}, {}, "history")

globalThis.XMLHttpRequest = function XMLHttpRequest() {
    this.open = toFnNative(function open(method, url, async, user, password) {
        console.log("open", method, url, async, user, password)
    })
    this.send = toFnNative(function send() {
        console.log("send")
    })
    this.setRequestHeader = toFnNative(function setRequestHeader(header, value) {
        console.log("setRequestHeader", header, value)
    })
    this.getResponseHeader = toFnNative(function getResponseHeader(header) {
        console.log("getResponseHeader", header)
        return undefined
    })

    this.onreadystatechange = toFnNative(function onreadystatechange() {
        console.log("onreadystatechange")
    })
    return createProxy(this)
}





setEnvProxy(
    {
        paths: [
            "globalThis",
        ],
        isDeepProxy: false
    }
)




