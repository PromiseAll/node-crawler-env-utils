import { hookToNativeString, hookDefineBsEnv, setEnvProxy } from "./lib/hook.js"
import { createRequire } from 'node:module';
hookDefineBsEnv()
window.canvas = {
    getContext: function (name) {
        console.log("canvas getContext", name);
        return {

        }
    },
    toDataURL: function () {
        console.log("canvas toDataURL");
    }
}

window.require = createRequire(import.meta.url)
window.sessionStorage = {
    getItem: function (name) {
        console.log("sessionStorage getItem", name);
        switch (name) {
            case "__ac_referer":
            // return "https://live.douyin.com/99362047100"
            default:
                return null
        }
    },
    removeItem: function (name) {
        console.log(name);
    }
}
window.HTMLElement = hookToNativeString(function (name) {
    console.log("HTMLElement", name);
})

window.localStorage = {
    getItem: function (name) {
        console.log("localStorage getItem", name);
        switch (name) {
            case "xmst":
                return "hEzicj2ZzUkALztl3HS_t0G9yw8NaNMKTUUMqgSPwR0LPnmnHvlANuWnwIBaxoq_QOR8CfXXIvRPdG-IY-v2Kdyh8njzoyB6gCdhk8rUSahRkod_KT1m9fxvEOJiUzPL6wvN32al7UJ2rj8mfCxeeoYW-81DeKCkcvVEF_QH9qhr"
            default:
                return null
        }
    },
    removeItem: function (name) {
        console.log(name);
    },
}

location.href = "https://live.douyin.com/99362047100"
navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
navigator.platform = "Win32"
document.cookie = '__ac_nonce=068711f0400f2cd38fe50; __ac_signature=_02B4Z6wo00f01C5071gAAIDDhXxpZbQi.7wuVOvAAGPy9c; x-web-secsdk-uid=8459cd3e-f947-4a61-8d23-28992eb468ef; xgplayer_device_id=40159074267; xgplayer_user_id=254766197649; has_avx2=null; device_web_cpu_core=20; device_web_memory_size=8; webcast_local_quality=null; live_use_vvc=%22false%22; hevc_supported=true; csrf_session_id=5856afe39fa6618b6ffb91d89be17e58; h265ErrorNum=-1; fpk1=U2FsdGVkX1/IoJXrsKIsw7E0bS06Yms8ytgOqSnrjLZEvDXFvRZ818dizvSkEPgqxCPNbADbBxWUBvPWsTq05w==; fpk2=7ddeda88d0c599cc494da0dece6554d5; __live_version__=%221.1.3.5791%22; xg_device_score=7.983585126412278; live_can_add_dy_2_desktop=%221%22; download_guide=%222%2F20250711%2F0%22; IsDouyinActive=false'
document.referrer = "https://live.douyin.com/99362047100"
document.addEventListener = hookToNativeString(function (name, callback) {
    console.log(name, callback);
})
document.createEvent = hookToNativeString(function (name) {
    console.log(name);
})
document.createElement = hookToNativeString(function (name) {
    console.log("createElement", name);
    switch (name) {
        case "canvas":
            return window.canvas
        default:
            return null
    }
})

window.Image = function () {
    console.log("Image");
    return {
        _u: ""
    }
}

console.log = function (...args) {
}

// setEnvProxy(["global", "window", "document", "navigator", "location", "history", "Image", "canvas"], {
//     mode: "filter",
//     deepProxyPaths: ["window", "document", "navigator", "location", "history", "Image", "canvas"]
// })