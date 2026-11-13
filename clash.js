function main(config) {
  // 1. Extract proxy node names
  const proxies = config.proxies || [];
  const allNodes = proxies.map((p) => p.name);
  if (allNodes.length === 0) return config;

  // 2. Filter nodes by region (keep Chinese keywords in regex to match airport node names)
  const filterNodes = (regex) => {
    const matched = allNodes.filter((name) => regex.test(name));
    return matched.length > 0 ? matched : ["DIRECT"];
  };

  const hkNodes = filterNodes(/\u6e2f|HK|hk|Hong Kong|HongKong|hongkong/i);
  const twNodes = filterNodes(/\u53f0|\u65b0\u5317|\u5f70\u5316|TW|Taiwan/i);
  const jpNodes = filterNodes(/\u65e5\u672c|\u5ddd\u65e5|\u4e1c\u4eac|\u5927\u962a|\u6cc9\u65e5|\u57fc\u7389|\u6caa\u65e5|\u6df1\u65e5|[^-]\u65e5|JP|Japan/i);
  const sgNodes = filterNodes(/\u65b0\u52a0\u5761|\u5761|\u72ee\u57ce|SG|Singapore/i);
  const usNodes = filterNodes(/\u7f8e|\u6ce2\u7279\u5170|\u8fbe\u62c9\u65af|\u4fc4\u52d2\u5188|\u51e4\u51f0\u57ce|\u8d39\u5229\u8499|\u7845\u8c37|\u62c9\u65af\u7ef4\u52a0\u65af|\u6d1b\u6749\u77f6|\u5723\u4f55\u585e|\u5723\u514b\u62c9\u62c9|\u897f\u96c5\u56fe|\u829d\u52a0\u54e5|US|United States/i);

  // 3. Proxy Groups (Pure English)
  config["proxy-groups"] = [
    {
      name: "Proxy",
      type: "select",
      proxies: ["Auto", "HK", "TW", "JP", "SG", "US", "DIRECT", ...allNodes],
    },
    {
      name: "Auto",
      type: "url-test",
      url: "http://www.gstatic.com/generate_204",
      interval: 300,
      tolerance: 50,
      proxies: allNodes,
    },
    {
      name: "AI",
      type: "select",
      proxies: ["JP", "SG", "US", "TW", "Proxy", ...allNodes],
    },
    {
      name: "YouTube",
      type: "select",
      proxies: ["Proxy", "Auto", "HK", "TW", "JP", "SG", "US", ...allNodes],
    },
    {
      name: "Spotify",
      type: "select",
      proxies: ["Proxy", "US", "HK", "JP", "SG", "DIRECT", ...allNodes],
    },
    {
      name: "GitHub",
      type: "select",
      proxies: ["Proxy", "Auto", "HK", "JP", "SG", "US", "DIRECT", ...allNodes],
    },
    {
      name: "Google",
      type: "select",
      proxies: ["Proxy", "Auto", "HK", "TW", "JP", "SG", "US", ...allNodes],
    },
    {
      name: "Telegram",
      type: "select",
      proxies: ["Proxy", "SG", "HK", "JP", "US", ...allNodes],
    },
    {
      name: "AppleID",
      type: "select",
      proxies: ["DIRECT", "Proxy", "US", "HK", "JP"],
    },
    {
      name: "Microsoft",
      type: "select",
      proxies: ["DIRECT", "Proxy", "US", "HK"],
    },
    {
      name: "Direct",
      type: "select",
      proxies: ["DIRECT", "Proxy"],
    },
    {
      name: "AdBlock",
      type: "select",
      proxies: ["REJECT", "DIRECT"],
    },
    {
      name: "Final",
      type: "select",
      proxies: ["Proxy", "Direct", "Auto"],
    },
    // Region auto-test groups
    { name: "HK", type: "url-test", url: "http://www.gstatic.com/generate_204", interval: 300, tolerance: 50, proxies: hkNodes },
    { name: "TW", type: "url-test", url: "http://www.gstatic.com/generate_204", interval: 300, tolerance: 50, proxies: twNodes },
    { name: "JP", type: "url-test", url: "http://www.gstatic.com/generate_204", interval: 300, tolerance: 50, proxies: jpNodes },
    { name: "SG", type: "url-test", url: "http://www.gstatic.com/generate_204", interval: 300, tolerance: 50, proxies: sgNodes },
    { name: "US", type: "url-test", url: "http://www.gstatic.com/generate_204", interval: 300, tolerance: 50, proxies: usNodes },
  ];

  // 4. Rule Providers (Loyalsoldier + blackmatrix7)
  const domainProvider = (url, path) => ({
    type: "http",
    behavior: "domain",
    url,
    path,
    interval: 86400,
  });
  const ipProvider = (url, path) => ({
    type: "http",
    behavior: "ipcidr",
    url,
    path,
    interval: 86400,
  });
  const classicalProvider = (url, path) => ({
    type: "http",
    behavior: "classical",
    url,
    path,
    interval: 86400,
  });

  config["rule-providers"] = {
    reject: domainProvider("https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt", "./ruleset/reject.yaml"),
    private: domainProvider("https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt", "./ruleset/private.yaml"),
    lancidr: ipProvider("https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt", "./ruleset/lancidr.yaml"),
    google: domainProvider("https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt", "./ruleset/google.yaml"),
    telegramcidr: ipProvider("https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt", "./ruleset/telegramcidr.yaml"),
    gfw: domainProvider("https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt", "./ruleset/gfw.yaml"),
    proxy: domainProvider("https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt", "./ruleset/proxy.yaml"),
    direct: domainProvider("https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt", "./ruleset/direct.yaml"),
    cncidr: ipProvider("https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt", "./ruleset/cncidr.yaml"),

    openai: classicalProvider("https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/OpenAI/OpenAI.yaml", "./ruleset/openai.yaml"),
    claude: classicalProvider("https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Claude/Claude.yaml", "./ruleset/claude.yaml"),
    gemini: classicalProvider("https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Gemini/Gemini.yaml", "./ruleset/gemini.yaml"),
    youtube: classicalProvider("https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/YouTube/YouTube.yaml", "./ruleset/youtube.yaml"),
    spotify: classicalProvider("https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Spotify/Spotify.yaml", "./ruleset/spotify.yaml"),
    github: classicalProvider("https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/GitHub/GitHub.yaml", "./ruleset/github.yaml"),
    appleid: classicalProvider("https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/AppleID/AppleID.yaml", "./ruleset/appleid.yaml"),
    microsoft: classicalProvider("https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Microsoft/Microsoft.yaml", "./ruleset/microsoft.yaml"),
  };

  // 5. Rules
  config["rules"] = [
    // >>> Custom Rules (Highest Priority) <<<
    // "DOMAIN-SUFFIX,example.com,Proxy",
    // "DOMAIN-SUFFIX,mydirect.com,Direct",
    // "IP-CIDR,192.168.10.0/24,Direct,no-resolve",

    "RULE-SET,reject,AdBlock",
    "RULE-SET,private,Direct",
    "RULE-SET,lancidr,Direct,no-resolve",

    "RULE-SET,openai,AI",
    "RULE-SET,claude,AI",
    "RULE-SET,gemini,AI",

    "RULE-SET,youtube,YouTube",
    "RULE-SET,spotify,Spotify",
    "RULE-SET,github,GitHub",
    "RULE-SET,appleid,AppleID",
    "RULE-SET,microsoft,Microsoft",
    "RULE-SET,google,Google",
    "RULE-SET,telegramcidr,Telegram,no-resolve",

    "RULE-SET,gfw,Proxy",
    "RULE-SET,proxy,Proxy",
    "RULE-SET,direct,Direct",
    "RULE-SET,cncidr,Direct,no-resolve",
    "GEOIP,CN,Direct",

    "MATCH,Final",
  ];

  return config;
}