/*
 * 高德地图净化脚本（已移除首页回家、去单位及常去地点卡片）
 */

let obj = JSON.parse($response.body);
const url = $request.url;

// 1. 开屏与启动广告
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
// 2. 首页卡片服务（原脚本在此处保留了通勤卡片，现直接置空移除）
else if (url.indexOf("ws/faas/amap-navigation/card-service-route-plan") !== -1) {
    if (obj.data) {
        obj.data.cardList = [];
        if (obj.data.dataList) {
            delete obj.data.dataList;
        }
        if (obj.data.pull3?.msgs) {
            obj.data.pull3.msgs = [];
        }
    }
    $done({ body: JSON.stringify(obj) });
} 
// 3. 通用首页聚合卡片（移除非订单类的其余卡片）
else if (url.indexOf("ws/shield/frog/commute") !== -1) {
    if (obj.data) {
        if (obj.data.cardList) {
            // 仅保留必要订单信息，剔除回家、去单位与常去地点
            obj.data.cardList = Object.values(obj.data.cardList).filter(
                item => item.dataType === "MyOrderCard"
            );
        }
        delete obj.data.commuteInfo;
    }
    $done({ body: JSON.stringify(obj) });
} 
// 4. 搜索框提示词与推荐
else if (url.indexOf("ws/valueadded/amapinstruction/commute") !== -1) {
    if (obj.data?.commuteCard) {
        obj.data.commuteCard = [];
    }
    $done({ body: JSON.stringify(obj) });
} 
// 5. 消息红点与通知弹窗
else if (url.indexOf("ws/message/notice/list") !== -1) {
    if (obj.data?.noticeList) {
        obj.data.noticeList = [];
    }
    $done({ body: JSON.stringify(obj) });
} 
// 6. 首页顶部/中间营销气泡与推荐位
else if (url.indexOf("ws/shield/search/new_hotword") !== -1) {
    const propsToDelete = ["hotword", "scene", "hint", "ads", "activity"];
    if (obj.data) {
        propsToDelete.forEach(prop => {
            delete obj.data[prop];
        });
    }
    $done({ body: JSON.stringify(obj) });
} 
// 其他未匹配请求原样放行
else {
    $done({});
}
