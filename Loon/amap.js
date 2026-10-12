/*
 * 高德地图全量卡片净化脚本
 * 彻底消除通勤、常去地点及所有后备推荐卡片
 */

let obj = JSON.parse($response.body);
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
// 2. 首页路线规划与卡片服务（关键：破坏卡片容器结构防止展示其他内容）
else if (url.indexOf("ws/faas/amap-navigation/card-service-route-plan") !== -1) {
    if (obj.data) {
        // 清空所有卡片并删除关键渲染节点
        obj.data.cardList = [];
        delete obj.data.dataList;
        delete obj.data.containers;
        delete obj.data.commonData;
        if (obj.data.pull3) {
            delete obj.data.pull3;
        }
    }
    $done({ body: JSON.stringify(obj) });
} 
// 3. 通用推荐卡片与常去地点流（拦截替代展示的推荐流）
else if (url.indexOf("ws/shield/frog/commute") !== -1) {
    if (obj.data) {
        obj.data = {};
    }
    $done({ body: JSON.stringify(obj) });
} 
// 4. 首页下拉/底栏综合信息流
else if (url.indexOf("ws/shield/search/new_hotword") !== -1) {
    if (obj.data) {
        const deleteKeys = ["hotword", "scene", "hint", "ads", "activity", "cardList", "recommend"];
        deleteKeys.forEach(key => delete obj.data[key]);
    }
    $done({ body: JSON.stringify(obj) });
} 
// 5. 消息通知与弹窗
else if (url.indexOf("ws/message/notice/list") !== -1) {
    if (obj.data?.noticeList) {
        obj.data.noticeList = [];
    }
    $done({ body: JSON.stringify(obj) });
} 
// 6. 其他未命中接口直接放行
else {
    $done({});
}
