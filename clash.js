function main(config) {
  try {
    return build(config);
  } catch (e) {
    if (typeof console !== "undefined" && console.log) {
      console.log("[clash.js] build failed, fallback to raw config: " + e);
    }
    return config;
  }
}

function build(config) {
  config = config || {};

  var RESERVED = [
    "Proxy", "AI", "YouTube", "Spotify", "GitHub", "Google", "Telegram",
    "AppleID", "Microsoft", "Final", "HK", "TW", "JP", "SG", "US",
    "DIRECT", "REJECT", "GLOBAL", "PASS", "COMPATIBLE"
  ];

  // ---------- 1. 剔除机场广告 / 到期信息节点 ----------
  var DIRTY = /(剩余流量|到期|过期|套餐|官网|重置|订阅|购买|续费|客服|通知|频道|群组|Traffic|Expire|Premium|Official|Renew|Website)/i;

  var src = Object.prototype.toString.call(config.proxies) === "[object Array]" ? config.proxies : [];
  var kept = [];
  var i;
  for (i = 0; i < src.length; i++) {
    var node = src[i];
    if (!node || typeof node.name !== "string") continue;
    if (!node.name.replace(/\s/g, "")) continue;
    if (DIRTY.test(node.name)) continue;
    kept.push(node);
  }

  // ---------- 2. 地区匹配（first-match 互斥） ----------
  var ZONES = ["HK", "TW", "JP", "SG", "US"];
  var RE = {
    // 英文缩写必须带非字母边界，否则 "plus"/"AUS"/"Russia" 会被吃进 US 组
    HK: /(香港|港|HKG|Hong ?Kong|(^|[^a-z])HK([^a-z]|$))/i,
    TW: /(台湾|台灣|台北|新北|台中|台南|高雄|彰化|新竹|桃园|Taiwan|(^|[^a-z])(TW|CHT)([^a-z]|$))/i,
    // 去掉了裸 "日" 与裸 "美"，只保留可判定的组合词
    JP: /(日本|东京|東京|大阪|埼玉|札幌|名古屋|(川|泉|沪|深|广|苏|杭)日|Japan|(^|[^a-z])(JP|JPN)([^a-z]|$))/i,
    SG: /(新加坡|狮城|坡|Singapore|(^|[^a-z])(SG|SGP)([^a-z]|$))/i,
    US: /(美国|美西|美东|美中|美区|洛杉矶|硅谷|圣何塞|西雅图|波特兰|俄勒冈|达拉斯|凤凰城|拉斯维加斯|纽约|芝加哥|迈阿密|阿什本|United ?States|(^|[^a-z])(US|USA|LAX|SJC|SEA|NYC)([^a-z]|$))/i
  };

  var buckets = {};
  ZONES.forEach(function (z) { buckets[z] = []; });
  kept.forEach(function (p) {
    for (var k = 0; k < ZONES.length; k++) {
      if (RE[ZONES[k]].test(p.name)) {
        buckets[ZONES[k]].push(p);
        return; // 互斥：一个节点只进一个地区组
      }
    }
  });

  // ---------- 3. 节点名唯一化，并避开策略组同名 ----------
  var used = Object.create(null);
  for (i = 0; i < RESERVED.length; i++) used[RESERVED[i].toLowerCase()] = 1;

  kept.forEach(function (p) {
    var base = p.name.trim();
    var name = base;
    var n = 1;
    while (used[name.toLowerCase()]) {
      n++;
      name = base + " #" + n;
    }
    used[name.toLowerCase()] = 1;
    p.name = name;
  });

  config.proxies = kept; // 关键：把清理结果写回，垃圾节点不再出现在节点列表里

  var allNames = kept.map(function (p) { return p.name; });
  if (!allNames.length) return config;

  // 地区组为空时回退到第一个真实节点（不要回退 DIRECT：AI 组会直连打不开）
  var zoneList = {};
  ZONES.forEach(function (z) {
    zoneList[z] = buckets[z].length
      ? buckets[z].map(function (p) { return p.name; })
      : [allNames[0]];
  });

  // ---------- 4. 策略组 ----------
  var ICON = "https://testingcf.jsdelivr.net/gh/Orz-3/mini@master/Color";
  var HEALTH = "https://www.gstatic.com/generate_204";

  function sel(name, icon, proxies) {
    return { name: name, type: "select", icon: ICON + "/" + icon, proxies: proxies };
  }
  function auto(name, icon, proxies) {
    return {
      name: name,
      type: "url-test",
      icon: ICON + "/" + icon,
      url: HEALTH,
      interval: 300,
      tolerance: 50,
      lazy: true,
      proxies: proxies
    };
  }

  config["proxy-groups"] = [
    sel("Proxy", "Static.png", ["HK", "TW", "JP", "SG", "US"].concat(allNames)),
    sel("AI", "OpenAI.png", ["JP", "SG", "US", "TW", "Proxy"].concat(allNames)),
    sel("YouTube", "YouTube.png", ["Proxy", "HK", "TW", "JP", "SG", "US"].concat(allNames)),
    sel("Spotify", "Spotify.png", ["Proxy", "US", "HK", "JP", "SG"].concat(allNames)),
    sel("GitHub", "github.png", ["Proxy", "HK", "JP", "SG", "US"].concat(allNames)),
    sel("Google", "Google.png", ["Proxy", "HK", "TW", "JP", "SG", "US"].concat(allNames)),
    sel("Telegram", "Telegram.png", ["Proxy", "SG", "HK", "JP", "US"].concat(allNames)),
    sel("AppleID", "Apple.png", ["DIRECT", "Proxy", "US", "HK", "JP"].concat(allNames)),
    sel("Microsoft", "Microsoft.png", ["DIRECT", "Proxy", "US", "HK"].concat(allNames)),
    sel("Final", "Final.png", ["Proxy"].concat(allNames)),
    auto("HK", "HK.png", zoneList.HK),
    auto("TW", "TW.png", zoneList.TW),
    auto("JP", "JP.png", zoneList.JP),
    auto("SG", "SG.png", zoneList.SG),
    auto("US", "US.png", zoneList.US)
  ];

  // ---------- 5. Rule Providers（缓存文件名必须唯一） ----------
  function meta(type, sub, behavior) {
    return {
      type: "http",
      format: "yaml",
      behavior: behavior,
      url: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/" + type + "/" + sub + ".yaml",
      // 原脚本只用了 sub.yaml，导致 geosite/cn 与 geoip/cn 写同一个文件
      path: "./ruleset/" + type + "-" + sub.replace(/!/g, "not") + ".yaml",
      interval: 86400
    };
  }

  function bm(name) {
    return {
      type: "http",
      format: "yaml",
      behavior: "classical",
      url: "https://testingcf.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/" + name + "/" + name + ".yaml",
      path: "./ruleset/bm-" + name.toLowerCase() + ".yaml",
      interval: 86400
    };
  }

  config["rule-providers"] = {
    private: meta("geosite", "private", "domain"),
    cn_domain: meta("geosite", "cn", "domain"),
    cn_ip: meta("geoip", "cn", "ipcidr"),
    geolocation_not_cn: meta("geosite", "geolocation-!cn", "domain"),
    google_domain: meta("geosite", "google", "domain"),
    google_ip: meta("geoip", "google", "ipcidr"),
    telegram_domain: meta("geosite", "telegram", "domain"),
    telegram_ip: meta("geoip", "telegram", "ipcidr"),
    openai: bm("OpenAI"),
    claude: bm("Claude"),
    gemini: bm("Gemini"),
    youtube: bm("YouTube"),
    spotify: bm("Spotify"),
    github: bm("GitHub"),
    appleid: bm("AppleID"),
    microsoft: bm("Microsoft")
  };

  // ---------- 6. 分流规则 ----------
  config["rules"] = [
    "RULE-SET,private,DIRECT",
    "GEOIP,LAN,DIRECT,no-resolve",

    "RULE-SET,openai,AI",
    "RULE-SET,claude,AI",
    "RULE-SET,gemini,AI",

    "RULE-SET,youtube,YouTube",
    "RULE-SET,spotify,Spotify",
    "RULE-SET,github,GitHub",
    "RULE-SET,appleid,AppleID",
    "RULE-SET,microsoft,Microsoft",

    "RULE-SET,google_domain,Google",
    "RULE-SET,google_ip,Google,no-resolve",
    "RULE-SET,telegram_domain,Telegram",
    "RULE-SET,telegram_ip,Telegram,no-resolve",

    // 国内域名/网段先直连，再让境外兜底规则接盘
    "RULE-SET,cn_domain,DIRECT",
    "RULE-SET,cn_ip,DIRECT,no-resolve",
    "RULE-SET,geolocation_not_cn,Proxy",

    "GEOIP,CN,DIRECT,no-resolve",
    "MATCH,Final"
  ];

  return config;
}

// =====================================================================
// 如果你的订阅走 proxy-providers（config.proxies 为空、节点在 provider 里），
// 上面的显式节点名分组拿不到节点，需要改成 include-all + filter 的写法：
//
//   { name: "HK", type: "url-test", include-all: true,
//     filter: "(香港|HK|Hong ?Kong)", url: "...", interval: 300 }
//
// 其余非地区组用 include-all: true 即可。Mihomo 1.16+ 支持 include-all。
// =====================================================================
