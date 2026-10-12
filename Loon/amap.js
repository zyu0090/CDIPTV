/*
 * 高德地图首页彻底净化脚本
 * 正常返回成功状态码，阻止触发本地离线兜底模板
 */

let obj = {};
try {
    obj = JSON.parse($response.body);
} catch (e) {
    $done({});
}

const url = $request.url;

// 1. 开屏与启动页广告
if (url.indexOf("ws/valueadded/alimama/splash_screen") !== -1) {
    if (obj.data && obj.data.ad) {
        for (let item of obj.data.ad) {
            item.set.setting.display_time = 0;
            item.creative[0].start_time = 2240113536;
            item.creative[0].end_time = 2240113536;
        }
    }
    $done({ body: JSON.stringify(obj) });
} 
// 2. 首页核心卡片接口（正常返回 code 1，显式置空卡片列表，防止触发本地离线占位）
else if (url.indexOf("ws/faas/amap-navigation/card-service-route-plan") !== -1) {
    const cleanData = {
        code: 1,
        message: "success",
        result: true,
        data: {
            cardList: [],
            pull3: { msgs: [] }
        }
    };
    $done({ body: JSON.stringify(cleanData) });
} 
// 3. 拦截探索本地、周边推荐流
else if (url.indexOf("ws/shield/frog/commute") !== -1 || url.indexOf("ws/shield/search/new_hotword") !== -1) {
    const cleanCommute = {
        code: 1,
        message: "success",
        result: true,
        data: {}
    };
    $done({ body: JSON.stringify(cleanCommute) });
} 
// 4. 探索本地/附近卡片服务
else if (url.indexOf("ws/faas/amap-navigation/main-page") !== -1 || url.indexOf("ws/valueadded/amapinstruction/commute") !== -1) {
    const cleanMain = {
        code: 1,
        message: "success",
        result: true,
        data: {
            cardList: []
        }
    };
    $done({ body: JSON.stringify(cleanMain) });
} 
// 5. 消息红点与通知
else if (url.indexOf("ws/message/notice/list") !== -1) {
    if (obj.data?.noticeList) {
        obj.data.noticeList = [];
    }
    $done({ body: JSON.stringify(obj) });
} 
else {
    $done({});
}
