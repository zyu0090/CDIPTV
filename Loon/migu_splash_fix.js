/*
 * 咪咕视频开屏广告倒计时净化脚本
 * 作用：将倒计时时间强制置 0，清除物料与展示标记
 */

let body = $response.body;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 递归遍历并修改时间与状态字段
        const purgeSplashData = (item) => {
            if (typeof item !== 'object' || item === null) return;

            for (const key of Object.keys(item)) {
                const lowerKey = key.toLowerCase();

                // 1. 将所有倒计时、展示时长相关字段置为 0
                if (
                    lowerKey.includes('duration') ||
                    lowerKey.includes('countdown') ||
                    lowerKey.includes('displaytime') ||
                    lowerKey.includes('waittime') ||
                    lowerKey.includes('showtime') ||
                    lowerKey.includes('staytime')
                ) {
                    item[key] = 0;
                }

                // 2. 将开屏开关、广告标记设为禁用
                else if (
                    lowerKey === 'isshow' ||
                    lowerKey === 'isenable' ||
                    lowerKey === 'canshow' ||
                    lowerKey === 'advertisingswitch'
                ) {
                    item[key] = false;
                }

                // 3. 清空可能存在的广告物料列表
                else if (
                    (lowerKey.includes('adlist') || lowerKey.includes('splashlist') || lowerKey.includes('material')) &&
                    Array.isArray(item[key])
                ) {
                    item[key] = [];
                }

                // 递归深入下一层
                else if (typeof item[key] === 'object') {
                    purgeSplashData(item[key]);
                }
            }
        };

        purgeSplashData(obj);
        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        // 若非标准 JSON 或解析异常，直接放行原响应
        $done({});
    }
} else {
    $done({});
}
