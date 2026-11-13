function main(config) {
  // 1. 过滤垃圾/残留节点（流量信息、到期提示、群组推广等）
  const dirtyFilter = /(?i)GB|Traffic|Expire|Premium|频道|订阅|ISP|流量|到期|重置|官网|群|通知/;
  const proxies = (config.proxies || []).filter((p) => !dirtyFilter.test(p.name));
  const allNodes = proxies.map((p) => p.name);
  if (allNodes.length === 0) return config;

  // 2. 按地区筛选节点
  const filterNodes = (regex) => {
    const matched = allNodes.filter((name) => regex.test(name));
    return matched.length > 0 ? matched : ["DIRECT"];
  };

  const hkNodes = filterNodes(/\u6e2f|HK|hk|Hong Kong|HongKong|hongkong/i);
  const twNodes = filterNodes(/\u53f0|\u65b0\u5317|\u5f70\u5316|TW|Taiwan/i);
  const jpNodes = filterNodes(/\u65e5\u672c|\u5ddd\u65e5|\u4e1c\u4eac|\u5927\u962a|\u6cc9\u65e5|\u57fc\u7389|\u6caa\u65e5|\u6df1\u65e5|[^-]\u65e5|JP|Japan/i);
  const sgNodes = filterNodes(/\u65b0\u52a0\u5761|\u5761|\u72ee\u57ce|SG|Singapore/i);
  const usNodes = filterNodes(/\u7f8e|\u6ce2\u7279\u5170|\u8fbe\u62c9\u65af|\u4fc4\u52d2\u5188|\u51e4\u51f0\u57ce|\u8d39\u5229\u8499|\u7845\u8c37|\u62c9\u65af\u7ef4\u52a0\u65af|\u6d1b\u6749\u77f6|\u5723\u4f55\u585e|\u5723\u514b\u62c9\u62c9|\u897f\u96c5\u56fe|\u829d\u52a0\u54e5|US|United States/i);

  // 3. 策略组（全配图标，去除了 Auto 和 AdBlock）
  const iconBase = "https://testingcf.jsdelivr.net/gh/Orz-3/mini@master/Color";

  config["proxy-groups"] = [
    {
      name: "Proxy",
      type: "select",
      icon: `${iconBase}/Static.png`,
      proxies: ["HK", "TW", "JP", "SG", "US", "DIRECT", ...allNodes],
    },
    {
      name: "AI",
      type: "select",
      icon: `${iconBase}/OpenAI.png`,
      proxies: ["JP", "SG", "US", "TW", "Proxy", ...allNodes],
    },
    {
      name: "YouTube",
      type: "select",
      icon: `${iconBase}/YouTube.png`,
      proxies: ["Proxy", "HK", "TW", "JP", "SG", "US", ...allNodes],
    },
    {
      name: "Spotify",
      type: "select",
      icon: `${iconBase}/Spotify.png`,
      proxies: ["Proxy", "US", "HK", "JP", "SG", "DIRECT", ...allNodes],
    },
    {
      name: "GitHub",
      type: "select",
      icon: `${iconBase}/Github.png`,
      proxies: ["Proxy", "HK", "JP", "SG", "US", "DIRECT", ...allNodes],
    },
    {
      name: "Google",
      type: "select",
      icon: `${iconBase}/Google.png`,
      proxies: ["Proxy", "HK", "TW", "JP", "SG", "US", ...allNodes],
    },
    {
      name: "Telegram",
      type: "select",
      icon: `${iconBase}/Telegram.png`,
      proxies: ["Proxy", "SG", "HK", "JP", "US", ...allNodes],
    },
    {
      name: "AppleID",
      type: "select",
      icon: `${iconBase}/Apple.png`,
      proxies: ["DIRECT", "Proxy", "US", "HK", "JP"],
    },
    {
      name: "Microsoft",
      type: "select",
      icon: `${iconBase}/Microsoft.png`,
      proxies: ["DIRECT", "Proxy", "US", "HK"],
    },
    {
      name: "Direct",
      type: "select",
      icon: `${iconBase}/Direct.png`,
      proxies: ["DIRECT", "Proxy"],
    },
    {
      name: "Final",
      type: "select",
      icon: `${iconBase}/Final.png`,
      proxies: ["Proxy", "Direct"],
    },
    // 地区自动优选测速组
    {
      name: "HK",
      type: "url-test",
      icon: `${iconBase}/HK.png`,
      url: "http://www.gstatic.com/generate_204",
      interval: 300,
      tolerance: 50,
      proxies: hkNodes,
    },
    {
      name: "TW",
      type: "url-test",
      icon: `${iconBase}/TW.png`,
      url: "http://www.gstatic.com/generate_204",
      interval: 300,
      tolerance: 50,
      proxies: twNodes,
    },
    {
      name: "JP",
      type: "url-test",
      icon: `${iconBase}/JP.png`,
      url: "http://www.gstatic.com/generate_204",
      interval: 300,
      tolerance: 50,
      proxies: jpNodes,
    },
    {
      name: "SG",
      type: "url-test",
      icon: `${iconBase}/SG.png`,
      url: "http://www.gstatic.com/generate_204",
      interval: 300,
      tolerance: 50,
      proxies: sgNodes,
    },
    {
      name: "US",
      type: "url-test",
      icon: `${iconBase}/US.png`,
      url: "http://www.gstatic.com/generate_204",
      interval: 300,
      tolerance: 50,
      proxies: usNodes,
    },
  ];

  // 4. Rule Providers (全面接入 MetaCubeX/meta-rules-dat + blackmatrix7 细分规则)
  const metaProvider = (type, subPath, behavior) => ({
    type: "http",
    format: "yaml",
    behavior,
    url: `https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/${type}/${subPath}.yaml`,
    path: `./ruleset/${subPath}.yaml`,
    interval: 86400,
  });

  const bmProvider = (name) => ({
    type: "http",
    format: "yaml",
    behavior: "classical",
    url: `https://testingcf.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/${name}/${name}.yaml`,
    path: `./ruleset/${name.toLowerCase()}.yaml`,
    interval: 86400,
  });

  config["rule-providers"] = {
    // 基础与 Geo 规则（MetaCubeX 数据源）
    private: metaProvider("geosite", "private", "domain"),
    cn_domain: metaProvider("geosite", "cn", "domain"),
    cn_ip: metaProvider("geoip", "cn", "ipcidr"),
    geolocation_not_cn: metaProvider("geosite", "geolocation-!cn", "domain"),
    google_domain: metaProvider("geosite", "google", "domain"),
    google_ip: metaProvider("geoip", "google", "ipcidr"),
    telegram_domain: metaProvider("geosite", "telegram", "domain"),
    telegram_ip: metaProvider("geoip", "telegram", "ipcidr"),

    // 应用细分规则（blackmatrix7 数据源）
    openai: bmProvider("OpenAI"),
    claude: bmProvider("Claude"),
    gemini: bmProvider("Gemini"),
    youtube: bmProvider("YouTube"),
    spotify: bmProvider("Spotify"),
    github: bmProvider("GitHub"),
    appleid: bmProvider("AppleID"),
    microsoft: bmProvider("Microsoft"),
  };

  // 5. 分流规则（Rules）
  config["rules"] = [
    // 局域网 / 私有地址直连
    "RULE-SET,private,Direct",

    // AI 相关分流
    "RULE-SET,openai,AI",
    "RULE-SET,claude,AI",
    "RULE-SET,gemini,AI",

    // 细分媒体及服务分流
    "RULE-SET,youtube,YouTube",
    "RULE-SET,spotify,Spotify",
    "RULE-SET,github,GitHub",
    "RULE-SET,appleid,AppleID",
    "RULE-SET,microsoft,Microsoft",

    // Google / Telegram 专属规则（域名 + IP）
    "RULE-SET,google_domain,Google",
    "RULE-SET,google_ip,Google",
    "RULE-SET,telegram_domain,Telegram",
    "RULE-SET,telegram_ip,Telegram",

    // 境外常用域名走代理
    "RULE-SET,geolocation_not_cn,Proxy",

    // 国内域名及国内 IP 直连
    "RULE-SET,cn_domain,Direct",
    "RULE-SET,cn_ip,Direct,no-resolve",
    "GEOIP,CN,Direct",

    // 兜底策略
    "MATCH,Final",
  ];

  return config;
}
