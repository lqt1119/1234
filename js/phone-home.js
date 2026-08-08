/* ============================================================
 * 手机主屏 (phone-home) 独立功能模块
 *
 * 在启动页（splash）之后全屏显示一个手机主屏界面：
 *   · 顶部状态栏：当前时间 + 电量示意
 *   · 中间两块：纪念日倒数（可自定义 / 重复 / 背景图） 与 日历（含经期标记 + 智能预测）
 *   · 底部微信图标（绿色）进入聊天 + 商城图标（粉色）打开礼物商城
 *   · 商城内支持：许愿自定义上架 / 购物车 / 对方 24 小时随机挑礼物 / 我送TA / TA送我
 * z-index = 500000，低于 splash(999999)、高于聊天界面(300001)
 * 因此，首次进入在 splash 消失之后、聊天之前，会先显示手机主屏。
 * 点击聊天入口后隐藏本模块，露出下方聊天应用。
 * 数据保存在 localStorage，前缀 ph_。
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- 状态 / 存储 ---------- */
  var LS_KEY_ANN = 'ph_anniversaries';
  var LS_KEY_PERIOD = 'ph_period_days';
  var LS_KEY_CYCLE = 'ph_cycle';
  var LS_KEY_BG = 'ph_bg';
  var LS_KEY_SHOP = 'ph_shop';
  var LS_KEY_FOOD = 'ph_food';
  var LS_KEY_SCHED = 'ph_schedules';

  /* 商城商品清单（共 30 个常规商品） */
  var SHOP_ITEMS = [
    { id: 1,  icon: '🌹', name: '浪漫红玫瑰',   price: 99,  desc: '九十九朵玫瑰，刚好说尽所有的喜欢与在乎。' },
    { id: 2,  icon: '🧸', name: '泰迪熊玩偶',   price: 128, desc: '一只可以代替我陪你的小熊，抱在怀里暖暖入睡。' },
    { id: 3,  icon: '💍', name: '默契对戒',     price: 520, desc: '两个人的约定，只戴在彼此看得见心口的地方。' },
    { id: 4,  icon: '☕️', name: '生日保温杯',   price: 68,  desc: '印着对方名字的杯子，像捧着温热的心意，随时都在。' },
    { id: 5,  icon: '🌙', name: '星空夜灯',     price: 45,  desc: '把一片星空搬进房间，晚上陪你一起等天亮。' },
    { id: 6,  icon: '🍫', name: '巧克力礼盒',   price: 88,  desc: '丝滑沁甜，像我们在一起时，每一口都是欢喜。' },
    { id: 7,  icon: '🐻', name: '成对情侣熊',   price: 268, desc: '一只给我一只给你，分开了也要在彼此心里徘徊。' },
    { id: 8,  icon: '⌚️', name: '情侣对表',     price: 398, desc: '从此每次低头看时间，都像看见对方的脸庞。' },
    { id: 9,  icon: '🌌', name: '星空投影仪',   price: 158, desc: '把整个银河搬进房间，抬头就能一起看星星。' },
    { id: 10, icon: '📿', name: '情侣手链',     price: 89,  desc: '一半留给我，一半给你，凑起来才完整。' },
    { id: 11, icon: '🧣', name: '冬夜围巾',     price: 76,  desc: '把寒风挡在外面，把我给你的温度裹进脖子里。' },
    { id: 12, icon: '🧢', name: '情侣情侣帽',   price: 59,  desc: '同款帽子，走在街上别人都知道我们是一对。' },
    { id: 13, icon: '☁️', name: '云朵抱枕',     price: 66,  desc: '软乎乎的一团，气呼呼的时候可以抱着它砸我。' },
    { id: 14, icon: '👟', name: '情侣运动鞋',   price: 328, desc: '踩着同款的步调，我们一起去看更远的世界。' },
    { id: 15, icon: '🌸', name: '定情香水',     price: 299, desc: '记住这个味道，它在的地方就是我在想你。' },
    { id: 16, icon: '✒️', name: '钢笔手写信',   price: 36,  desc: '从前慢，一封信要写很久，爱要说得很郑重。' },
    { id: 17, icon: '📔', name: '回忆相册',     price: 55,  desc: '把我们的聊天截图、合照都收进去，老了慢慢翻。' },
    { id: 18, icon: '👕', name: '定制情侣T恤', price: 79,  desc: '我的印着你的名字，你的印着我的，谁都不许脱。' },
    { id: 19, icon: '♨️', name: '暖手宝',       price: 42,  desc: '手冷的时候摸一摸，就像我在旁边搓你的手。' },
    { id: 20, icon: '🛌', name: '情侣睡衣',     price: 128, desc: '同款毛茸茸，视频里看起来像两只互相蹭的小动物。' },
    { id: 21, icon: '🌷', name: '永生花',       price: 199, desc: '永不凋谢的花，代表这份喜欢也没有保质期。' },
    { id: 22, icon: '🎵', name: '蓝牙音箱',     price: 218, desc: '一起听同一首歌，让旋律替我陪在你耳朵边。' },
    { id: 23, icon: '💆', name: '肩颈按摩枕',   price: 148, desc: '你低头太久了，让它代替我揉揉你酸疼的肩膀。' },
    { id: 24, icon: '🛏️', name: '暖绒绒床垫',   price: 139, desc: '躺进去像被一大团云抱住，梦里都是我的。' },
    { id: 25, icon: '🥤', name: '情侣吸管杯',   price: 52,  desc: '连喝水都要用一对的，生活的小事也要有仪式感。' },
    { id: 26, icon: '🔗', name: '定制项链',     price: 268, desc: '挂坠里刻着只有我们知道的暗号，贴在心口。' },
    { id: 27, icon: '🗒️', name: '恋爱手账',     price: 38,  desc: '从今天开始记，第一次生气、第一句我爱你。' },
    { id: 28, icon: '🔖', name: '星空书签',     price: 22,  desc: '夹在你读的那一页，下次翻到就是我的落款。' },
    { id: 29, icon: '📱', name: '情侣手机壳',   price: 48,  desc: '锁屏一亮就是对方，连解锁都变得开心。' },
    { id: 30, icon: '🔑', name: '定制钥匙扣',   price: 29,  desc: '钥匙串上挂着你，走到哪里都把你带在身上。' }
  ];

  /* ---------- 外卖商品 ---------- */
  // 每个商品可配置规格（如甜度/冰度/辣度/份量等），购买时选择
  var FOOD_ITEMS = [
    { id: 'f1',  icon: '🧋', name: '珍珠奶茶',        price: 15, desc: '经典波霸，Q弹有嚼劲', cat: '奶茶',
      opts: [
        { k: '甜度', v: ['正常甜', '少甜', '半糖', '三分糖', '无糖'] },
        { k: '冰度', v: ['正常冰', '少冰', '去冰', '热饮'] }
      ] },
    { id: 'f2',  icon: '🧋', name: '椰果奶茶',        price: 14, desc: '清新椰果，解腻爽口', cat: '奶茶',
      opts: [
        { k: '甜度', v: ['正常甜', '七糖', '半糖', '三分糖', '无糖'] },
        { k: '冰度', v: ['正常冰', '少冰', '去冰'] }
      ] },
    { id: 'f3',  icon: '🍵', name: '茉莉奶绿',        price: 13, desc: '茉莉花香，奶绿清甜', cat: '奶茶',
      opts: [
        { k: '甜度', v: ['正常甜', '七糖', '半糖', '三分糖', '无糖'] },
        { k: '冰度', v: ['正常冰', '少冰', '去冰', '热饮'] }
      ] },
    { id: 'f4',  icon: '🧊', name: '波霸奶茶',        price: 16, desc: '大颗波霸，嚼劲满满', cat: '奶茶',
      opts: [
        { k: '甜度', v: ['正常甜', '七糖', '半糖', '三分糖', '无糖'] },
        { k: '冰度', v: ['正常冰', '少冰', '去冰'] }
      ] },
    { id: 'f5',  icon: '🥤', name: '柠檬红',          price: 12, desc: '柠檬酸甜，清爽解腻', cat: '奶茶',
      opts: [
        { k: '甜度', v: ['正常甜', '七糖', '半糖', '三分糖', '无糖'] },
        { k: '冰度', v: ['正常冰', '少冰', '去冰'] }
      ] },
    { id: 'f6',  icon: '🍓', name: '草莓鲜奶',        price: 20, desc: '新鲜草莓，奶香浓郁', cat: '奶茶',
      opts: [
        { k: '甜度', v: ['正常甜', '七糖', '半糖', '三分糖', '无糖'] },
        { k: '冰度', v: ['正常冰', '少冰', '去冰'] }
      ] },

    { id: 'f7',  icon: '🍔', name: '经典牛肉堡',      price: 25, desc: '安格斯牛肉饼，爆汁多肉', cat: '汉堡',
      opts: [
        { k: '辣度', v: ['不辣', '微辣', '中辣', '特辣'] },
        { k: '酱料', v: ['原味', '番茄酱', '蜂蜜芥末'] }
      ] },
    { id: 'f8',  icon: '🍔', name: '鸡肉双人堡',      price: 28, desc: '香脆鸡腿排，双层满足', cat: '汉堡',
      opts: [
        { k: '辣度', v: ['不辣', '微辣', '中辣', '特辣'] },
        { k: '酱料', v: ['照烧酱', '千岛酱', '原味'] }
      ] },
    { id: 'f9',  icon: '🍟', name: '黄金薯条',        price: 10, desc: '外脆里软，金黄酥脆', cat: '汉堡',
      opts: [
        { k: '份量', v: ['小份', '中份', '大份'] },
        { k: '口味', v: ['原味', '加盐', '海苔味'] }
      ] },
    { id: 'f10', icon: '🍗', name: '香辣鸡块',        price: 12, desc: '香辣酥脆，一口一个', cat: '汉堡',
      opts: [
        { k: '辣度', v: ['不辣', '微辣', '中辣', '特辣'] },
        { k: '蘸酱', v: ['原味', '甜辣酱', '番茄酱'] }
      ] },
    { id: 'f11', icon: '🍦', name: '草莓圣代',        price: 8,  desc: '绵密冰淇淋配草莓果酱', cat: '汉堡',
      opts: [
        { k: '杯型', v: ['小杯', '中杯', '大杯'] },
        { k: '配料', v: ['奥利奥', '坚果碎', '焦糖'] }
      ] },
    { id: 'f12', icon: '🥤', name: '可乐(中)',        price: 6,  desc: '冰爽可乐，解腻圣品', cat: '汉堡',
      opts: [
        { k: '冰量', v: ['正常冰', '少冰', '去冰'] },
        { k: '规格', v: ['中杯', '大杯'] }
      ] },

    { id: 'f13', icon: '🍢', name: '羊肉串',          price: 18, desc: '孜然烤羊肉，肥瘦相间', cat: '烧烤',
      opts: [
        { k: '辣度', v: ['不辣', '微辣', '中辣', '特辣'] },
        { k: '份量', v: ['5串', '10串'] }
      ] },
    { id: 'f14', icon: '🍢', name: '烤鸡翅',          price: 15, desc: '蜜汁或椒盐，外焦里嫩', cat: '烧烤',
      opts: [
        { k: '口味', v: ['蜜汁', '椒盐', '香辣'] },
        { k: '份量', v: ['4只', '6只'] }
      ] },
    { id: 'f15', icon: '🦐', name: '烤生蚝',          price: 20, desc: '蒜蓉烧烤，鲜香多汁', cat: '烧烤',
      opts: [
        { k: '份量', v: ['6只', '12只'] },
        { k: '辣度', v: ['不辣', '微辣', '中辣'] }
      ] },
    { id: 'f16', icon: '🐔', name: '烤鸡心',          price: 12, desc: '紧实有嚼劲，越吃越香', cat: '烧烤',
      opts: [
        { k: '辣度', v: ['不辣', '微辣', '中辣', '特辣'] },
        { k: '份量', v: ['10串', '15串'] }
      ] },
    { id: 'f17', icon: '🥓', name: '烤五花肉',        price: 16, desc: '腌制入味，肥而不腻', cat: '烧烤',
      opts: [
        { k: '辣度', v: ['不辣', '微辣', '中辣', '特辣'] },
        { k: '份量', v: ['10串', '15串'] }
      ] },
    { id: 'f18', icon: '🥔', name: '烤土豆片',        price: 8,  desc: '薄如蝉翼，香脆可口', cat: '烧烤',
      opts: [
        { k: '口味', v: ['原味', '香辣', '孜然'] },
        { k: '份量', v: ['10片', '20片'] }
      ] },

    { id: 'f19', icon: '🍜', name: '黄焖鸡米饭',      price: 22, desc: '鸡肉嫩滑，汤汁浓郁', cat: '盖饭',
      opts: [
        { k: '辣度', v: ['不辣', '微辣', '中辣', '特辣'] },
        { k: '份量', v: ['标准', '加量'] }
      ] },
    { id: 'f20', icon: '🍛', name: '咖喱牛肉饭',      price: 24, desc: '日式咖喱，牛肉软烂', cat: '盖饭',
      opts: [
        { k: '辣度', v: ['不辣', '微辣', '中辣'] },
        { k: '份量', v: ['标准', '加饭'] }
      ] },
    { id: 'f21', icon: '🍚', name: '扬州炒饭',         price: 16, desc: '粒粒分明，配料丰富', cat: '盖饭',
      opts: [
        { k: '份量', v: ['小份', '中份', '大份'] },
        { k: '加料', v: ['加蛋', '加火腿', '加虾仁'] }
      ] },
    { id: 'f22', icon: '🥩', name: '黑椒牛仔骨饭',     price: 32, desc: '黑椒香浓，牛仔骨鲜嫩', cat: '盖饭',
      opts: [
        { k: '辣度', v: ['不辣', '微辣', '中辣'] },
        { k: '份量', v: ['标准', '加量'] }
      ] },
    { id: 'f23', icon: '🍤', name: '虾仁蛋炒饭',       price: 26, desc: '虾仁弹牙，蛋香四溢', cat: '盖饭',
      opts: [
        { k: '份量', v: ['大份', '小份'] },
        { k: '加料', v: ['加蛋', '加叉烧'] }
      ] },
    { id: 'f24', icon: '🍲', name: '麻辣香锅',         price: 38, desc: '一锅麻辣，鲜香过瘾', cat: '盖饭',
      opts: [
        { k: '辣度', v: ['不辣', '微辣', '中辣', '特辣'] },
        { k: '份量', v: ['单人餐', '双人餐'] }
      ] },

    { id: 'f25', icon: '🍣', name: '综合寿司拼盘',    price: 35, desc: '多种寿司一次满足', cat: '寿司',
      opts: [
        { k: '份量', v: ['8粒', '12粒'] },
        { k: '口味', v: ['原味', '麻辣', '炙烧'] }
      ] },
    { id: 'f26', icon: '🍱', name: '鳗鱼饭',          price: 33, desc: '蒲烧鳗鱼，酱香四溢', cat: '盖饭',
      opts: [
        { k: '份量', v: ['标准', '加量'] },
        { k: '调味', v: ['原味', '多酱'] }
      ] },
    { id: 'f27', icon: '🥟', name: '手工水饺',        price: 14, desc: '皮薄馅大，现包现煮', cat: '主食',
      opts: [
        { k: '馅料', v: ['猪肉玉米', '韭菜鸡蛋', '香菇鸡肉'] },
        { k: '份量', v: ['8个', '12个'] }
      ] },
    { id: 'f28', icon: '🦞', name: '麻辣小龙虾',      price: 68, desc: '香辣过瘾，膏满肉肥', cat: '夜宵',
      opts: [
        { k: '辣度', v: ['微辣', '中辣', '特辣'] },
        { k: '份量', v: ['小份', '大份'] }
      ] },
    { id: 'f29', icon: '🍕', name: '榴莲披萨',        price: 40, desc: '榴莲果肉，芝士拉丝', cat: '披萨',
      opts: [
        { k: '尺寸', v: ['7寸', '9寸', '12寸'] },
        { k: '边料', v: ['普通', '芝心卷边'] }
      ] },
    { id: 'f30', icon: '🥗', name: '脆皮鸡排沙拉',    price: 22, desc: '低脂轻食，营养均衡', cat: '轻食',
      opts: [
        { k: '酱汁', v: ['芝麻酱', '油醋汁', '千岛酱'] },
        { k: '份量', v: ['标准', '加量'] }
      ] }
  ];

  /* 许愿（自定义商品）图标候选 emoji */
  var WISH_EMOJIS = ['🧸','🌹','💍','🐱','🎧','📿','🍫','🕯️','🐱','🐶','🐰','🌙','⚡','🌈','🎂','🍰','🍓','🍑','🧋','🍦','🏀','🎼','🎨','📷','🧣','👟','🧢','🛍️','💄','🧴','🚗','✈️','🏠','🌿','🌸','🍀','🦋','💖','🔥'];

  var WEEK_CN = ['日', '一', '二', '三', '四', '五', '六'];
  var MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  var S = {
    anniversaries: [],
    periods: new Set(),
    cycle: { lastStart: '', length: 28, duration: 5 },
    shop: { got: [], given: [], cart: [], wishes: [] },
    food: { got: [], given: [], cart: [] },
    schedules: {},
    year: new Date().getFullYear(),
    month: new Date().getMonth()
  };
  var root = null;
  var slotTick = null;
  var momPending = [];

  /* ---------- 工具 ---------- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseYMD(s) {
    var p = String(s).split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function todayBase() {
    var t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }
  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
  function diffDays(a, b) { return Math.round((b - a) / 86400000); }
  function lsGet(k, fb) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /* ---------- 纪念日计算 ---------- */
  // 返回某纪念日“下一次（未来，含今天）发生”的基准，用于显示天数
  function annivInfo(a) {
    var today = todayBase();
    var base = parseYMD(a.date);
    var m = base.getMonth(), d = base.getDate(), y = today.getFullYear();

    if (a.repeat === 'none') {
      var fixed = new Date(a.date);
      var diff = diffDays(today, fixed);
      if (diff >= 0) return { text: '还有 ' + diff + ' 天', days: diff };
      return { text: '已过 ' + (-diff) + ' 天', days: diff };
    }
    if (a.repeat === 'year') {
      var cand = new Date(y, m, Math.min(d, daysInMonth(y, m)));
      if (cand < today) cand = new Date(y + 1, m, Math.min(d, daysInMonth(y + 1, m)));
      return { text: '距离还有 ' + diffDays(today, cand) + ' 天', days: diffDays(today, cand) };
    }
    if (a.repeat === 'month') {
      var cm = today.getMonth();
      var c1 = new Date(y, cm, Math.min(d, daysInMonth(y, cm)));
      if (c1 < today) { c1 = new Date(y + (cm === 11 ? 1 : 0), (cm + 1) % 12, Math.min(d, daysInMonth(y + (cm === 11 ? 1 : 0), (cm + 1) % 12))); }
      return { text: '距离还有 ' + diffDays(today, c1) + ' 天', days: diffDays(today, c1) };
    }
    // week
    var targetW = base.getDay();
    for (var i = 0; i < 7; i++) {
      var t = new Date(today.getTime() + i * 86400000);
      if (t.getDay() === targetW) {
        return { text: '距离还有 ' + i + ' 天', days: i };
      }
    }
    return { text: '', days: 0 };
  }

  /* 判断某天（Date）是否是某纪念日的“生效日”（用于日历标记） */
  function isAnnivOn(dayDate) {
    var today = todayBase();
    var s = ymd(dayDate);
    return S.anniversaries.some(function (a) {
      if (a.repeat === 'none') {
        // 只标记基准日期当天
        var fixed = parseYMD(a.date);
        return fixed.getMonth() === dayDate.getMonth() && fixed.getDate() === dayDate.getDate() &&
          ymd(fixed) === s;
      }
      if (a.repeat === 'year') {
        var base = parseYMD(a.date);
        return base.getMonth() === dayDate.getMonth() && base.getDate() === dayDate.getDate();
      }
      if (a.repeat === 'month') {
        return parseYMD(a.date).getDate() === dayDate.getDate();
      }
      if (a.repeat === 'week') {
        return parseYMD(a.date).getDay() === dayDate.getDay();
      }
      return false;
    });
  }
  // 预留给 todayBase 的别名（补充缺失的 day0 引用）
  function today0() { return todayBase(); }

  /* ---------- 数据 ---------- */
  function loadData() {
    S.anniversaries = lsGet(LS_KEY_ANN, []);
    S.periods = new Set(lsGet(LS_KEY_PERIOD, []));
    S.cycle = Object.assign({ lastStart: '', length: 28, duration: 5 }, lsGet(LS_KEY_CYCLE, {}));
    S.shop = Object.assign({ got: [], given: [], cart: [], wishes: [] }, lsGet(LS_KEY_SHOP, {}));
    S.food = Object.assign({ got: [], given: [], cart: [] }, lsGet(LS_KEY_FOOD, {}));
    S.schedules = lsGet(LS_KEY_SCHED, {}) || {};
  }
  function saveAnniv() { lsSet(LS_KEY_ANN, S.anniversaries); }
  function savePeriods() { lsSet(LS_KEY_PERIOD, Array.from(S.periods)); }
  function saveCycle() { lsSet(LS_KEY_CYCLE, S.cycle); }
  function saveShop() { lsSet(LS_KEY_SHOP, S.shop); }
  function saveFood() { lsSet(LS_KEY_FOOD, S.food); }
  function saveSched() { lsSet(LS_KEY_SCHED, S.schedules); }

  /* 智能经期预测：依据最近一次经期起始日 + 周期长度推算后续周期（预测范围：当前渲染月份的前后各 3 个周期，避免无限循环） */
  function predictPeriodDays(year, month) {
    var c = S.cycle;
    var out = new Set();
    if (!c || !c.lastStart) return out;
    var len = Math.max(15, parseInt(c.length, 10) || 28);
    var dur = Math.max(1, parseInt(c.duration, 10) || 5);
    var first = new Date(year, month, 1);
    var last = parseYMD(c.lastStart);
    var delta = diffDays(last, first);
    var base = Math.floor(delta / len) - 3;
    for (var k = 0; k < 6; k++) {
      var cycleStart = new Date(last.getFullYear(), last.getMonth(), last.getDate() + (base + k) * len);
      for (var d = 0; d < dur; d++) {
        var day = new Date(cycleStart.getFullYear(), cycleStart.getMonth(), cycleStart.getDate() + d);
        if (day.getFullYear() === year && day.getMonth() === month) out.add(ymd(day));
      }
    }
    return out;
  }

  /* ==========================================
   * 主屏结构与样式（注入）
   * ========================================== */
  var CSS = '<style>' +
    '#phone-home{position:fixed;inset:0;z-index:500000;background:url("assets/img/hw-bg.jpg") center/cover no-repeat;' +
    'background-attachment:fixed;background-blend-mode:normal;' +
    'color:#16325c;font-family:"Noto Serif SC","Microsoft YaHei",system-ui,sans-serif;display:flex;flex-direction:column;overflow:hidden;user-select:none;' +
    'box-shadow:inset 0 0 0 2000px rgba(232,241,255,.42);}' +
    '#phone-home.hidden{display:none !important;}' +
    '#phone-home .ph-sb{display:flex;justify-content:space-between;align-items:center;padding:12px 20px 2px;font-size:13px;font-weight:600;letter-spacing:.5px;flex:0 0 auto;color:#16325c;}' +
    '#phone-home .ph-clock{text-align:center;padding:2px 0 0;flex:0 0 auto;}' +
    '#phone-home .ph-time{font-size:44px;font-weight:200;letter-spacing:2px;font-variant-numeric:tabular-nums;color:#16325c;text-shadow:0 0 24px rgba(59,130,246,.22);line-height:1;}' +
    '#phone-home .ph-date{margin-top:2px;font-size:13px;letter-spacing:1px;color:#4a6fa5;}' +
    '#phone-home .ph-widgets{flex:0 0 auto;display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px 14px;justify-content:center;}' +
    '#phone-home .ph-widget{background:rgba(255,255,255,.78);border:1px solid rgba(59,130,246,.25);border-radius:18px;padding:10px;width:172px;' +
    'position:relative;box-shadow:0 6px 18px rgba(59,130,246,.10);backdrop-filter:blur(10px);min-height:0;display:flex;flex-direction:column;overflow:hidden;}' +
    '#phone-home .ph-widget-title{font-size:11px;letter-spacing:1px;color:#3b6bb5;margin-bottom:6px;display:flex;align-items:center;gap:6px;flex:0 0 auto;font-weight:700;}' +
    '#phone-home .ph-widget-title .ph-rep{font-weight:400;opacity:.55;font-size:10px;}' +
    /* 倒计时 */
    '#phone-home .cd-card{position:relative;flex:1;border-radius:14px;overflow:hidden;background-size:cover;background-position:center;background-color:#eef4ff;' +
    'padding:12px 12px 10px;display:flex;flex-direction:column;min-height:150px;}' +
    '#phone-home .cd-card:after{content:"";position:absolute;inset:0;background:rgba(233,242,255,.35);pointer-events:none;}' +
    '#phone-home .cd-content{position:relative;z-index:2;flex:1;display:flex;flex-direction:column;}' +
    '#phone-home .cd-list{flex:1;overflow:auto;margin-bottom:8px;}' +
    '#phone-home .cd-empty{color:#5a7ba8;font-size:12px;padding:6px 2px;}' +
    '#phone-home .cd-item{display:flex;justify-content:space-between;align-items:center;font-size:12px;padding:4px 8px;margin:2px 0;border-radius:8px;border:1px solid rgba(59,130,246,.18);background:rgba(255,255,255,.55);box-shadow:0 1px 4px rgba(59,130,246,.12);cursor:pointer;}' +
    '#phone-home .cd-item:hover{background:rgba(255,255,255,.85);}' +
    '#phone-home .cd-item .n{color:#16325c;max-width:74px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}' +
    '#phone-home .cd-item .d{color:#000;font-weight:600;white-space:nowrap;text-shadow:0 1px 2px rgba(255,255,255,.8);}' +
    '#phone-home .cd-tools{display:flex;gap:6px;margin-top:auto;}' +
    '#phone-home .ph-btn{border:none;border-radius:20px;padding:6px 10px;font-size:12px;cursor:pointer;background:#e6efff;color:#1d4ed8;transition:.2s;font-family:inherit;}' +
    '#phone-home .ph-btn:hover{background:#d7e6ff;}' +
    '#phone-home .ph-btn.primary{background:#3b82f6;color:#fff;}#phone-home .ph-btn.primary:hover{background:#2b6de8;}' +
    /* 日历 */
    '#phone-home .cal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}' +
    '#phone-home .cal-nav{cursor:pointer;padding:2px 8px;border-radius:6px;color:#1d4ed8;}#phone-home .cal-nav:hover{background:rgba(59,130,246,.14);}' +
    '#phone-home .cal-month{font-size:13px;font-weight:700;color:#16325c;}' +
    '#phone-home .cal-week{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;font-size:10px;color:#4a6fa5;margin-bottom:2px;}' +
    '#phone-home .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);grid-auto-rows:26px;gap:1px;}' +
    '#phone-home .cal-cell{display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:12px;border-radius:8px;' +
    'position:relative;cursor:pointer;color:#16325c;}#phone-home .cal-cell.other{color:#93a9c9;}' +
    '#phone-home .cal-cell.today{background:rgba(59,130,246,.22);font-weight:700;}' +
    '#phone-home .cal-cell .dot{display:inline-flex;gap:2px;margin-top:1px;min-height:4px;}' +
    '#phone-home .cal-cell .dot span{width:3px;height:3px;border-radius:50%;}' +
    '#phone-home .cal-cell.ann .dot span{background:#ffb857;}' +
    '#phone-home .cal-cell.sched .dot span{background:#22c55e;}' +
    '#phone-home .cal-cell.period .dot span{background:#ff5b7a;box-shadow:0 0 4px rgba(255,91,122,.7);}' +
    '#phone-home .cal-cell.pred{background:rgba(255,91,122,.12);}' +
    '#phone-home .cal-cell.pred .dot span{background:#ff5b7a;opacity:.5;}' +
    '#phone-home .cal-hint{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:4px;font-size:9px;color:#4a6fa5;}' +
    '#phone-home .cal-hint span{display:inline-flex;align-items:center;gap:3px;}' +
    '#phone-home .cal-hint i{width:6px;height:6px;border-radius:50%;display:inline-block;}' +
    '#phone-home .cal-hint .ii{color:#1d4ed8;cursor:pointer;}#phone-home .cal-hint .ii:hover{color:#0a2a6b;text-decoration:underline;}' +
    /* 聊天 dock */
    '#phone-home .ph-dock{flex:0 0 84px;display:flex;align-items:center;justify-content:center;padding-bottom:2px;}' +
    '#phone-home .wx-icon{width:64px;display:flex;flex-direction:column;align-items:center;cursor:pointer;gap:6px;}' +
    '#phone-home .wx-avatar{width:56px;height:56px;border-radius:14px;background:linear-gradient(145deg,#4cc06a,#2d9c4e);' +
    'box-shadow:0 10px 24px rgba(38,160,90,.45),inset 0 1px 0 rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;transition:transform .12s;overflow:hidden;}' +
    '#phone-home .wx-avatar img{width:100%;height:100%;object-fit:cover;display:block;}' +
    '#phone-home .shop-av{font-size:30px;background:linear-gradient(145deg,#ff8a5b,#ff5b7a);box-shadow:0 10px 24px rgba(255,91,122,.4),inset 0 1px 0 rgba(255,255,255,.35);}' +
    '#phone-home .wx-icon:hover .wx-avatar{transform:scale(1.06);}#phone-home .wx-icon:active .wx-avatar{transform:scale(.94);}' +
    '#phone-home .wx-label{font-size:12px;color:#16325c;font-weight:600;letter-spacing:.5px;}' +
    /* 弹层 / 输入 */
    '#phone-home .ph-ov{position:absolute;inset:0;z-index:20;background:rgba(13,30,58,.35);display:flex;align-items:center;justify-content:center;padding:22px;}' +
    '#phone-home .ph-modal{background:#ffffff;border:1px solid rgba(59,130,246,.28);border-radius:18px;width:100%;max-width:330px;max-height:88vh;overflow:auto;padding:18px;box-shadow:0 16px 40px rgba(13,30,58,.22);}' +
    '#phone-home .ph-modal h3{margin:0 0 12px;font-size:15px;color:#16325c;}' +
    '#phone-home .ph-field{margin-bottom:10px;display:flex;flex-direction:column;gap:4px;}' +
    '#phone-home .ph-field label{font-size:12px;color:#4a6fa5;}' +
    '#phone-home .ph-field input,#phone-home .ph-field select{background:#f4f8ff;border:1px solid rgba(59,130,246,.32);' +
    'border-radius:8px;padding:8px 10px;color:#16325c;font-size:13px;font-family:inherit;outline:none;}' +
    '#phone-home .ph-field input[type=date]{color-scheme:light;}' +
    '#phone-home .ph-field select{color-scheme:light;}' +
    '#phone-home select option{color:#16325c;}' +
    '#phone-home .ph-btns{display:flex;gap:8px;margin-top:14px;}' +
    '#phone-home .ph-list{display:flex;flex-direction:column;gap:6px;margin:8px 0;max-height:40vh;overflow:auto;}' +
    '#phone-home .ph-li{display:flex;justify-content:space-between;align-items:center;gap:8px;background:#f4f8ff;' +
    'border:1px solid rgba(59,130,246,.18);border-radius:10px;padding:8px 10px;font-size:13px;}' +
    '#phone-home .ph-li .name{flex:1;color:#16325c;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
    '#phone-home .ph-li .sub{opacity:.55;font-size:11px;color:#4a6fa5;}' +
    '#phone-home .ph-li .act{display:flex;gap:6px;}' +
    '#phone-home .ph-mini{border:none;background:#e6efff;color:#1d4ed8;border-radius:8px;padding:4px 8px;font-size:12px;cursor:pointer;font-family:inherit;}' +
    '#phone-home .ph-mini.danger{background:rgba(255,80,100,.16);color:#d9263f;}#phone-home .ph-mini.primary{background:rgba(59,130,246,.2);color:#1d4ed8;}' +
    '#phone-home .ph-toast{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);background:rgba(13,30,58,.92);' +
    'border:1px solid rgba(255,255,255,.18);color:#fff;padding:9px 16px;border-radius:30px;font-size:13px;z-index:30;box-shadow:0 8px 22px rgba(13,30,58,.3);}' +
    /* 商城 / 礼物柜 */
    '#phone-home .shop-ov{position:absolute;inset:0;z-index:15;background:linear-gradient(180deg,#e8f1ff,#f7faff 55%,#ffffff);display:flex;flex-direction:column;}' +
    '#phone-home .shop-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;' +
    'background:rgba(255,255,255,.65);border-bottom:1px solid rgba(59,130,246,.2);flex:0 0 auto;}' +
    '#phone-home .shop-head .tabs{display:flex;gap:4px;background:rgba(59,130,246,.14);border-radius:20px;padding:3px;}' +
    '#phone-home .shop-head .tab{border:none;background:transparent;color:#3b6bb5;font-size:12px;padding:6px 14px;border-radius:18px;cursor:pointer;font-family:inherit;}' +
    '#phone-home .shop-head .tab.on{background:#3b82f6;color:#fff;}' +
    '#phone-home .shop-close{border:none;background:rgba(59,130,246,.16);color:#1d4ed8;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px;font-family:inherit;}' +
    /* 支付宝余额 */
    '#phone-home .ali-ov{position:absolute;inset:0;z-index:16;background:linear-gradient(180deg,#1677ff,#0f5fd4 45%,#ffffff 45.5%,#f2f6ff);display:flex;flex-direction:column;}' +
    '#phone-home .ali-top{flex:0 0 auto;color:#fff;padding:14px 16px 18px;display:flex;align-items:center;justify-content:space-between;}' +
    '#phone-home .ali-title{font-size:16px;font-weight:700;}' +
    '#phone-home .ali-topbtn{background:rgba(255,255,255,.22);border:none;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:15px;font-family:inherit;display:flex;align-items:center;justify-content:center;}' +
    '#phone-home .ali-cards{padding:4px 16px 16px;display:flex;flex-direction:column;gap:12px;}' +
    '#phone-home .ali-card{background:#fff;border-radius:16px;padding:16px;box-shadow:0 6px 18px rgba(15,95,212,.14);display:flex;align-items:center;gap:12px;cursor:pointer;}' +
    '#phone-home .ali-card .ali-logo{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex:0 0 auto;}' +
    '#phone-home .ali-card .ali-name{font-size:13px;color:#5a7ba8;}' +
    '#phone-home .ali-card .ali-amt{font-size:26px;font-weight:800;color:#0a2540;line-height:1.2;}' +
    '#phone-home .ali-hint{color:#8b94bf;font-size:11px;padding:0 16px 8px;}' +
    '#phone-home .shop-body{flex:1;overflow-y:auto;padding:12px;}' +
    '#phone-home .shop-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}' +
    '#phone-home .shop-item{background:rgba(255,255,255,.85);border:1px solid rgba(59,130,246,.22);border-radius:14px;padding:10px 6px;' +
    'display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;transition:.2s;text-align:center;box-shadow:0 4px 12px rgba(59,130,246,.08);}' +
    '#phone-home .shop-item:hover{background:#ffffff;transform:translateY(-2px);box-shadow:0 8px 18px rgba(59,130,246,.16);}' +
    '#phone-home .shop-item .si{font-size:30px;}' +
    '#phone-home .shop-item .sn{font-size:11px;color:#16325c;line-height:1.3;}' +
    '#phone-home .shop-item .sp{font-size:12px;color:#ff9d2e;font-weight:700;}' +
    '#phone-home .shop-item .sb{background:#3b82f6;border:none;color:#fff;font-size:11px;padding:4px 12px;border-radius:12px;cursor:pointer;font-family:inherit;margin-top:2px;}' +
    '#phone-home .shop-item .sb-cart{background:#e6efff;color:#1d4ed8;}' +
    '#phone-home .shop-item .sb-del{background:rgba(255,80,100,.16);color:#d9263f;}' +
    '#phone-home .shop-item{position:relative;}' +
    '#phone-home .wish-tag{position:absolute;top:4px;left:4px;background:linear-gradient(135deg,#8a4bff,#a855f7);color:#fff;font-size:9px;padding:1px 6px;border-radius:8px;box-shadow:0 1px 4px rgba(138,75,255,.4);}' +
    '#phone-home .wish-btn{display:inline-flex;align-items:center;gap:5px;margin:0;background:linear-gradient(135deg,#8a4bff,#c084fc);color:#fff;border:none;font-size:12px;padding:7px 15px;border-radius:18px;cursor:pointer;font-weight:700;font-family:inherit;box-shadow:0 4px 12px rgba(138,75,255,.45);transition:transform .15s ease,box-shadow .15s ease;}' +
    '#phone-home .wish-btn:hover{transform:translateY(-1px) scale(1.03);box-shadow:0 6px 16px rgba(138,75,255,.55);}' +
    '#phone-home .wish-btn:active{transform:translateY(0) scale(.97);}' +
    '#phone-home .wish-emojis{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-bottom:12px;}' +
    '#phone-home .wish-emojis [data-e]{font-size:24px;text-align:center;padding:4px;border-radius:10px;cursor:pointer;background:rgba(59,130,246,.1);}' +
    '#phone-home .wish-emojis [data-e].on{background:#3b82f6;}' +
    '#phone-home .wish-upload{border:1px dashed rgba(59,130,246,.45);border-radius:10px;text-align:center;padding:12px;font-size:13px;color:#1d4ed8;cursor:pointer;margin-bottom:8px;background:#f4f8ff;}' +
    '#phone-home .wish-preview{min-height:56px;display:flex;align-items:center;justify-content:center;margin-bottom:8px;}' +
    '#phone-home .wish-icon-preview{font-size:44px;}' +
    '#phone-home .wish-icon-preview img{width:56px;height:56px;object-fit:cover;border-radius:12px;}' +
    '#phone-home .wish-img{width:44px;height:44px;object-fit:cover;border-radius:10px;display:inline-block;}' +
    '#phone-home .wish-img-lg{width:64px;height:64px;object-fit:cover;border-radius:14px;display:inline-block;}' +
    '#phone-home .gi-img{width:34px;height:34px;object-fit:cover;border-radius:8px;display:inline-block;}' +
    '#phone-home .tab-badge{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;border-radius:9px;' +
    'background:#ff5b7a;color:#fff;font-size:10px;font-weight:700;margin-left:4px;padding:0 4px;vertical-align:top;}' +
    /* 礼物柜 */
    '#phone-home .gift-tabs{display:flex;gap:8px;margin-bottom:10px;}' +
    '#phone-home .gift-tabs button{border:none;background:rgba(59,130,246,.12);color:#1d4ed8;flex:1;padding:6px;border-radius:10px;font-size:12px;cursor:pointer;font-family:inherit;}' +
    '#phone-home .gift-tabs button.on{background:#ff5b7a;color:#fff;}' +
    '#phone-home .gift-empty{color:#4a6fa5;font-size:12px;text-align:center;padding:30px 10px;}' +
    '#phone-home .gift-row{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.85);border:1px solid rgba(59,130,246,.22);' +
    'border-radius:12px;padding:8px 10px;margin-bottom:8px;box-shadow:0 4px 12px rgba(59,130,246,.07);}' +
    '#phone-home .gift-row .gi{font-size:24px;}' +
    '#phone-home .gift-row .gn{font-size:12px;color:#16325c;flex:1;}' +
    '#phone-home .gift-row .gd{font-size:10px;color:#4a6fa5;text-align:right;line-height:1.4;}' +
    '#phone-home .gift-row .gbuy{border:none;background:#8a4bff;color:#fff;font-size:10px;padding:3px 9px;border-radius:10px;cursor:pointer;font-family:inherit;}' +
    '#phone-home .gift-talk{margin-top:4px;font-size:11px;line-height:1.5;padding:2px 7px;border-radius:8px;display:inline-block;white-space:normal;}' +
    '#phone-home .gift-talk.mine{background:#eaf2ff;color:#1d4ed8;}' +
    '#phone-home .gift-talk.theirs{background:#fff0e6;color:#a15a00;}' +
    '#phone-home .gift-talk.pending{color:#999;font-size:10px;display:block;}' +
    /* 外卖 App */
    '#phone-home .fd-ov{position:absolute;inset:0;z-index:15;background:#f5f6f7;display:flex;flex-direction:column;}' +
    '#phone-home .fd-top{flex:0 0 auto;background:#ff6a3d;color:#fff;padding:12px 14px;display:flex;align-items:center;gap:8px;}' +
    '#phone-home .fd-top .fd-title{font-size:16px;font-weight:700;}' +
    '#phone-home .fd-top .fd-addr{font-size:11px;opacity:.85;}' +
    '#phone-home .fd-close{margin-left:auto;border:none;background:rgba(255,255,255,.22);color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:15px;font-family:inherit;}' +
    '#phone-home .fd-body{flex:1;overflow-y:auto;padding:0 0 10px;}' +
    '#phone-home .fd-banner{height:74px;background:linear-gradient(120deg,#ff6a3d,#ff8f5e);display:flex;align-items:center;padding:0 16px;color:#fff;}' +
    '#phone-home .fd-banner .fd-b1{font-size:15px;font-weight:700;}' +
    '#phone-home .fd-banner .fd-b2{font-size:11px;opacity:.9;margin-top:3px;}' +
    '#phone-home .fd-search{display:flex;align-items:center;gap:8px;background:#fff;margin:10px 12px 4px;border-radius:20px;padding:8px 14px;color:#999;font-size:13px;}' +
    '#phone-home .fd-search input{border:none;outline:none;flex:1;font-size:13px;font-family:inherit;color:#333;background:transparent;}' +
    '#phone-home .fd-catbar{display:flex;gap:4px;padding:8px 12px;overflow-x:auto;flex:0 0 auto;}' +
    '#phone-home .fd-cat{flex:0 0 auto;border:none;background:#fff;color:#666;font-size:12px;padding:6px 14px;border-radius:16px;cursor:pointer;font-family:inherit;}' +
    '#phone-home .fd-cat.on{background:#ff6a3d;color:#fff;font-weight:700;}' +
    '#phone-home .fd-list{display:flex;flex-direction:column;gap:10px;padding:6px 12px;}' +
    '#phone-home .fd-item{background:#fff;border-radius:14px;display:flex;gap:12px;padding:12px;box-shadow:0 2px 8px rgba(0,0,0,.05);cursor:pointer;}' +
    '#phone-home .fd-item .fd-pic{width:64px;height:64px;flex:0 0 auto;border-radius:12px;background:linear-gradient(145deg,#fff3ec,#ffe0d2);display:flex;align-items:center;justify-content:center;font-size:32px;}' +
    '#phone-home .fd-item .fd-mid{flex:1;min-width:0;}' +
    '#phone-home .fd-item .fd-n{font-size:14px;color:#222;font-weight:700;}' +
    '#phone-home .fd-item .fd-desc{font-size:11px;color:#999;margin:3px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
    '#phone-home .fd-item .fd-spec{font-size:10px;color:#ff6a3d;border:1px solid rgba(255,106,61,.4);border-radius:4px;padding:1px 5px;display:inline-block;}' +
    '#phone-home .fd-item .fd-price{color:#ff4b2b;font-weight:800;font-size:15px;}' +
    '#phone-home .fd-item .fd-price i{font-style:normal;font-size:11px;margin-right:1px;}' +
    '#phone-home .fd-item .fd-add{width:26px;height:26px;border-radius:50%;background:#ff6a3d;color:#fff;border:none;font-size:16px;line-height:1;cursor:pointer;align-self:center;font-family:inherit;}' +
    '#phone-home .fd-tabs{display:flex;gap:8px;padding:10px 12px 4px;flex:0 0 auto;}' +
    '#phone-home .fd-tabs button{border:none;background:#fff;color:#666;flex:1;padding:8px;border-radius:10px;font-size:13px;cursor:pointer;font-family:inherit;}' +
    '#phone-home .fd-tabs button.on{background:#ff6a3d;color:#fff;}' +
    '#phone-home .fd-empty{color:#999;font-size:13px;text-align:center;padding:50px 20px;}' +
    '#phone-home .fd-talk{margin-top:5px;font-size:11px;line-height:1.5;padding:3px 8px;border-radius:8px;white-space:normal;}' +
    '#phone-home .fd-talk.mine{background:#eaf2ff;color:#1d4ed8;display:inline-block;}' +
    '#phone-home .fd-talk.theirs{background:#ffe;color:#a15a00;display:inline-block;}' +
    '#phone-home .fd-talk.pending{color:#999;font-size:10px;}' +
    /* 朋友圈 */
    '#phone-home .mom-ov{position:absolute;inset:0;z-index:16;background:#f7f7f7;display:flex;flex-direction:column;overflow:hidden;}' +
    '#phone-home .mom-head{position:relative;flex:0 0 auto;height:190px;background-size:cover;background-position:center;}' +
    '#phone-home .mom-head::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.18));}' +
    '#phone-home .mom-head-top{position:absolute;top:0;left:0;right:0;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;z-index:2;}' +
    '#phone-home .mom-title{color:#fff;font-size:16px;font-weight:700;text-shadow:0 1px 3px rgba(0,0,0,.4);}' +
    '#phone-home .mom-topbtns{display:flex;gap:10px;}' +
    '#phone-home .mom-topbtn{background:rgba(255,255,255,.22);border:none;color:#fff;font-size:20px;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;backdrop-filter:blur(2px);}' +
    '#phone-home .mom-head-bottom{position:absolute;right:14px;bottom:12px;z-index:2;display:flex;align-items:flex-end;gap:10px;}' +
    '#phone-home .mom-head-bottom .mom-me{font-size:13px;color:#fff;font-weight:700;text-shadow:0 1px 2px rgba(0,0,0,.5);}' +
    '#phone-home .mom-avatar{width:46px;height:46px;border-radius:8px;object-fit:cover;border:2px solid #fff;background:#cfd6e0;display:flex;align-items:center;justify-content:center;font-size:22px;overflow:hidden;flex-shrink:0;}' +
    '#phone-home .mom-body{flex:1;overflow-y:auto;padding:10px 0;}' +
    '#phone-home .mom-item{display:flex;gap:10px;padding:14px 16px;background:#fff;margin-bottom:8px;}' +
    '#phone-home .mom-item .mom-av{width:38px;height:38px;border-radius:6px;object-fit:cover;flex:0 0 auto;background:#cfd6e0;display:flex;align-items:center;justify-content:center;font-size:18px;overflow:hidden;}' +
    '#phone-home .mom-content{flex:1;min-width:0;}' +
    '#phone-home .mom-name{font-size:14px;font-weight:700;color:#576b95;cursor:pointer;}' +
    '#phone-home .mom-text{font-size:14px;color:#1a1a1a;line-height:1.55;margin:4px 0;white-space:pre-wrap;word-break:break-word;}' +
    '#phone-home .mom-img{max-width:230px;border-radius:8px;margin-top:4px;display:block;}' +
    '#phone-home .mom-time{font-size:11px;color:#b2b2b2;margin-top:6px;display:flex;align-items:center;gap:10px;}' +
    '#phone-home .mom-actions{font-size:12px;color:#576b95;cursor:pointer;}' +
    '#phone-home .mom-cmts{margin-top:8px;background:#f4f4f4;border-radius:6px;padding:6px 8px;font-size:12px;line-height:1.7;}' +
    '#phone-home .mom-cmt{border-bottom:none;color:#1a1a1a;word-break:break-word;}' +
    '#phone-home .mom-cmt b{color:#576b95;font-weight:700;}' +
    '#phone-home .mom-cmt .reply{margin-left:2px;}' +
    '#phone-home .mom-cmt .to{color:#576b95;font-weight:700;margin:0 2px;}' +
    '#phone-home .mom-likes{margin-top:8px;background:#f4f4f4;border-radius:6px;padding:4px 8px;font-size:12px;line-height:1.7;}' +
    '#phone-home .mom-likes .like-icon{color:#e74c3c;font-size:12px;}' +
    '#phone-home .mom-likes b{color:#576b95;font-weight:700;font-weight:bold;color:#3a7bd5;}' +
    '#phone-home .mom-pub{position:absolute;right:16px;bottom:26px;z-index:2;background:#111;color:#fff;border:none;width:52px;height:52px;border-radius:50%;font-size:24px;font-weight:300;line-height:1;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.35);font-family:inherit;display:flex;align-items:center;justify-content:center;}' +
    /* 规格选择弹层 */
    '#phone-home .sp-group{margin-bottom:12px;}' +
    '#phone-home .sp-group .sp-t{font-size:12px;color:#4a6fa5;font-weight:700;margin-bottom:6px;}' +
    '#phone-home .sp-chips{display:flex;flex-wrap:wrap;gap:6px;}' +
    '#phone-home .sp-chip{border:1px solid rgba(59,130,246,.35);background:#fff;color:#1d4ed8;font-size:12px;padding:6px 12px;border-radius:16px;cursor:pointer;font-family:inherit;}' +
    '#phone-home .sp-chip.on{background:#3b82f6;color:#fff;border-color:#3b82f6;}' +
    '#phone-home .fd-wish{flex:0 0 auto;background:linear-gradient(135deg,#ff7a3d,#ff4b2b);color:#fff;border:none;font-size:12px;padding:9px 15px;border-radius:20px;cursor:pointer;font-weight:700;font-family:inherit;box-shadow:0 4px 12px rgba(255,75,43,.4);transition:transform .15s ease,box-shadow .15s ease;}' +
    '#phone-home .fd-wish:hover{transform:translateY(-1px) scale(1.03);box-shadow:0 6px 16px rgba(255,75,43,.55);}' +
    '#phone-home .fd-wish:active{transform:translateY(0) scale(.97);}' +
    '#phone-home .sp-box{border:1px solid rgba(59,130,246,.2);background:#f7faff;border-radius:10px;padding:8px 10px;margin-bottom:10px;}' +
    '#phone-home .sp-box .sp-mini{display:flex;gap:6px;align-items:center;margin-bottom:6px;}' +
    '#phone-home .sp-box .sp-mini input{flex:1;background:#fff;border:1px solid rgba(59,130,246,.3);border-radius:6px;padding:6px 8px;font-size:12px;color:#16325c;font-family:inherit;outline:none;}' +
    '#phone-home .sp-add{width:100%;border:1px dashed rgba(59,130,246,.45);background:#fff;color:#1d4ed8;font-size:12px;padding:8px;border-radius:10px;cursor:pointer;font-family:inherit;margin-bottom:10px;}' +
    '#phone-home .fd-del{border:none;background:rgba(255,80,100,.14);color:#d9263f;width:24px;height:24px;border-radius:50%;cursor:pointer;font-size:13px;line-height:1;font-family:inherit;}' +
    '</style>';

  var TPL =
    '<div class="ph-sb">' +
    '  <span id="ph-sbTime">--:--</span>' +
    '  <span style="opacity:.8">🔋&nbsp;&nbsp;⚡&nbsp;&nbsp;▮▮&nbsp;&nbsp;📶</span>' +
    '</div>' +
    '<div class="ph-clock">' +
    '  <div class="ph-time" id="ph-bigTime">--:--:--</div>' +
    '  <div class="ph-date" id="ph-dateLine"></div>' +
    '</div>' +
    '<div class="ph-widgets">' +
    '  <div class="ph-widget">' +
    '    <div class="ph-widget-title">❤️ 纪念日倒数 <span class="ph-rep">可重复设置</span></div>' +
    '    <div class="cd-card" id="ph-cdCard">' +
    '      <div class="cd-content">' +
    '        <div class="cd-list" id="ph-cdList"></div>' +
    '        <div class="cd-tools">' +
    '          <button class="ph-btn primary" id="ph-addAnn">＋</button>' +
    '          <button class="ph-btn" id="ph-manageAnn">管理</button>' +
    '          <button class="ph-btn" id="ph-bgBtn">背景</button>' +
    '        </div>' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '  <div class="ph-widget">' +
    '    <div class="ph-widget-title">📆 日历</div>' +
    '    <div class="cal-head">' +
    '      <span class="cal-nav" data-dir="-1">◀</span>' +
    '      <span class="cal-month" id="ph-calMonth"></span>' +
    '      <span class="cal-nav" data-dir="1">▶</span>' +
    '    </div>' +
    '    <div class="cal-week"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div>' +
    '    <div class="cal-grid" id="ph-calGrid"></div>' +
    '    <div class="cal-hint">' +
    '      <span><i style="background:#ffd66b"></i>纪念日</span>' +
    '      <span><i style="background:#ff5b7a"></i>生理期</span>' +
    '      <span><i style="background:#22c55e"></i>日程</span>' +
    '      <span><i style="background:#5b8bff"></i>今天</span>' +
    '      <span class="ii" id="ph-cycleSet" style="color:#8b94bf;">✨ 预测设置</span>' +
    '    </div>' +
    '  </div>' +
    '</div>' +
    '<div class="ph-dock">' +
'  <div class="wx-icon" id="ph-enterChat">' +
    '    <div class="wx-avatar" id="phChatIcon">' +
    '      <svg width="38" height="32" viewBox="0 0 48 40" fill="none">' +
    '        <rect x="2" y="4" width="38" height="26" rx="6" fill="#46a0ff"/>' +
    '        <path d="M12 30 L14 38 L24 30 Z" fill="#46a0ff"/>' +
    '        <ellipse cx="26" cy="17" rx="9.5" ry="8.2" fill="#fff"/>' +
    '        <path d="M17 10.5 L7.5 3 L22.5 9 Z" fill="#2b2b2b"/>' +
    '        <path d="M35 10.5 L42.5 3 L29.5 9 Z" fill="#2b2b2b"/>' +
    '        <circle cx="23" cy="16" r="1.5" fill="#2b2b2b"/>' +
    '        <circle cx="29" cy="16" r="1.5" fill="#2b2b2b"/>' +
    '        <path d="M24 21 q2 2 4 0" stroke="#2b2b2b" stroke-width="1.1" stroke-linecap="round" fill="none"/>' +
    '      </svg>' +
    '    </div>' +
    '    <div class="wx-label">聊天</div>' +
    '  </div>' +
    '  <div class="wx-icon" id="ph-openShop">' +
    '    <div class="wx-avatar shop-av" id="phShopIcon">🎁</div>' +
    '    <div class="wx-label">商城</div>' +
    '  </div>' +
'  <div class="wx-icon" id="ph-openFood">' +
    '    <div class="wx-avatar" style="background:linear-gradient(145deg,#ff8f5e,#ff4b2b);" id="phFoodIcon">🍔</div>' +
    '    <div class="wx-label">外卖</div>' +
    '  </div>' +
    '  <div class="wx-icon" id="ph-openMoments">' +
    '    <div class="wx-avatar" style="background:linear-gradient(145deg,#3f9bff,#3f7fff);" id="phMomIcon">📸</div>' +
    '    <div class="wx-label">朋友圈</div>' +
    '  </div>' +
    '  <div class="wx-icon" id="ph-iconBeauty">' +
    '    <div class="wx-avatar" style="background:linear-gradient(145deg,#9aa4b8,#6b7488);" id="phBeautyIcon">🎨</div>' +
    '    <div class="wx-label">图标美化</div>' +
    '  </div>' +
    '  <div class="wx-icon" id="ph-openAlipay">' +
    '    <div class="wx-avatar" style="background:linear-gradient(145deg,#1677ff,#1f66d8);" id="phAlipayIcon">💰</div>' +
    '    <div class="wx-label">支付宝</div>' +
    '  </div>' +
        '</div>' +
    '<input type="file" id="ph-bgFile" accept="image/*" style="display:none" />';

  /* ---------- 构建 ---------- */
  function buildDOM() {
    if (document.getElementById('phone-home')) return document.getElementById('phone-home');
    var wrapper = document.createElement('div');
    wrapper.id = 'phone-home';
    wrapper.innerHTML = CSS + TPL;
    document.body.appendChild(wrapper);
    root = wrapper;
    return wrapper;
  }

  /* ---------- 渲染 ---------- */
  function renderClock() {
    var now = new Date();
    var t = pad(now.getHours()) + ':' + pad(now.getMinutes());
    document.getElementById('ph-sbTime').textContent = t;
    document.getElementById('ph-bigTime').textContent = t + ':' + pad(now.getSeconds());
    document.getElementById('ph-dateLine').textContent =
      now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日 · 星期' + WEEK_CN[now.getDay()];
  }

  function renderCountdown() {
    var card = document.getElementById('ph-cdCard');
    var listEl = document.getElementById('ph-cdList');
    var bg = localStorage.getItem(LS_KEY_BG);
    card.style.backgroundImage = bg ? 'url(' + bg + ')' : '';
    if (!S.anniversaries.length) {
      listEl.innerHTML = '<div class="cd-empty">还没有纪念日<br>点击 ＋添加</div>';
      return;
    }
    listEl.innerHTML = S.anniversaries.map(function (a) {
      var info = annivInfo(a);
      var rep = { none: '固定', year: '每年', month: '每月', week: '每周' }[a.repeat] || '固定';
      return '<div class="cd-item" data-id="' + a.id + '">' +
        '<span class="n" title="' + esc(a.name) + '">' + esc(a.name) + '</span>' +
        '<span class="d" style="font-size:11px;">' + esc(info.text) + '</span>' +
        '</div>';
    }).join('');
    listEl.querySelectorAll('.cd-item').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        openAnnEditor(el.dataset.id);
      });
    });
  }

  function renderCalendar() {
    var grid = document.getElementById('ph-calGrid');
    document.getElementById('ph-calMonth').textContent = S.year + '年' + MONTHS[S.month];
    var predSet = predictPeriodDays(S.year, S.month);
    var todayS = ymd(new Date());
    var first = new Date(S.year, S.month, 1);
    var lead = first.getDay();
    var dim = daysInMonth(S.year, S.month);
    var cells = [];
    for (var i = lead - 1; i >= 0; i--) cells.push({ d: new Date(S.year, S.month, -i), o: true });
    for (var day = 1; day <= dim; day++) cells.push({ d: new Date(S.year, S.month, day), o: false });
    var k = 0;
    while (cells.length % 7 !== 0) { k++; cells.push({ d: new Date(S.year, S.month, dim + k), o: true }); }

    grid.innerHTML = cells.map(function (c) {
      var s = ymd(c.d);
      var isToday = s === todayS;
      var isPeriod = S.periods.has(s);
      var isPred = predSet.has(s) && !isPeriod;
      var isAnn = isAnnivOn(c.d);
      var hasSched = !!( (S.schedules && S.schedules[s]) && (S.schedules[s].length) );
      var cls = 'cal-cell' + (c.o ? ' other' : '') + (isToday ? ' today' : '') + (isAnn ? ' ann' : '') + (isPeriod ? ' period' : '') + (isPred ? ' pred' : '') + (hasSched ? ' sched' : '');
      var dots = (isAnn ? '<span></span>' : '') + (isPeriod || isPred ? '<span></span>' : '') + (hasSched ? '<span style="display:inline-block;"></span>' : '');
      return '<div class="' + cls + '" data-date="' + s + '">' + c.d.getDate() + '<span class="dot">' + dots + '</span></div>';
    }).join('');

    grid.querySelectorAll('.cal-cell').forEach(function (el) {
      el.addEventListener('click', function () { onDayClick(el.dataset.date); });
    });
  }

  function onDayClick(dateStr) {
    var isPeriod = S.periods.has(dateStr);
    var predSet = predictPeriodDays(S.year, S.month);
    var isPred = !isPeriod && predSet.has(dateStr);
    var annDay = parseYMD(dateStr);
    var isAnn = S.anniversaries.filter(function (a) {
      if (a.repeat === 'none') {
        var f = parseYMD(a.date);
        return f.getMonth() === annDay.getMonth() && f.getDate() === annDay.getDate() && ymd(f) === ymd(annDay);
      }
      if (a.repeat === 'year') {
        var b = parseYMD(a.date);
        return b.getMonth() === annDay.getMonth() && b.getDate() === annDay.getDate();
      }
      if (a.repeat === 'month') {
        return parseYMD(a.date).getDate() === annDay.getDate();
      }
      if (a.repeat === 'week') {
        return parseYMD(a.date).getDay() === annDay.getDay();
      }
      return false;
    });
    var daySched = (S.schedules && (S.schedules[dateStr] || [])) || [];
    var d = parseYMD(dateStr);
    var title = (d.getMonth() + 1) + '月' + d.getDate() + '日 · ' + WEEK_CN[d.getDay()] +
      (ymd(new Date()) === dateStr ? '（今天）' : '');

    function renderBody() {
      var periodRow =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 2px;">' +
        '<span style="font-size:13px;color:#16325c;">经期</span>' +
        (isPeriod
          ? '<button class="ph-mini danger" data-act="period-on">生理期（可点击取消）</button>'
          : (isPred
            ? '<button class="ph-mini" data-act="period-pred">预测经期（点击标记为实际）</button>'
            : '<button class="ph-mini" data-act="period-off">未标记（点击标记）</button>')) +
        '</div>';

      var annHtml = isAnn.length
        ? isAnn.map(function (a) { return '<div class="ph-li"><span class="name">🌸 ' + esc(a.name || '纪念日') + '</span><span class="sub">' + esc(a.date) + '</span></div>'; }).join('')
        : '<div style="font-size:12px;color:#8b94bf;padding:4px 2px;">当天没有纪念日</div>';

      var schedList = daySched.length
        ? daySched.map(function (t, idx) {
            return '<div class="ph-li"><span class="name">📌 ' + esc(t) + '</span>' +
              '<span class="act"><button class="ph-mini danger" data-act="del-sched" data-idx="' + idx + '">删除</button></span></div>';
          }).join('')
        : '<div style="font-size:12px;color:#8b94bf;padding:4px 2px;">当天暂无日程</div>';

      return '<h3>『' + title + '』</h3>' +
        '<div style="color:#4a6fa5;font-size:11px;margin-bottom:8px;">点击可查看 / 标记当天状态</div>' +
        periodRow +
        '<div style="border-top:1px solid rgba(59,130,246,.15);margin:8px 0;"></div>' +
        '<div style="font-size:12px;color:#16325c;font-weight:700;margin-bottom:6px;">🌸 纪念日</div>' + annHtml +
        '<div style="border-top:1px solid rgba(59,130,246,.15);margin:8px 0;"></div>' +
        '<div style="font-size:12px;color:#16325c;font-weight:700;margin-bottom:6px;">📌 日程安排</div>' +
        '<div style="max-height:120px;overflow:auto;">' + schedList + '</div>' +
        '<div style="display:flex;gap:6px;margin-top:8px;">' +
        '<input id="phSchedInput" placeholder="添加日程，如：晚上一起视频" style="flex:1;border:1px solid rgba(59,130,246,.3);border-radius:8px;padding:8px 10px;font-size:13px;color:#16325c;font-family:inherit;" />' +
        '<button class="ph-btn primary" data-act="add-sched">＋</button>' +
        '</div>' +
        '<div class="ph-btns" style="margin-top:12px;">' +
        '<button class="ph-btn" data-act="close">关闭</button>' +
        '</div>';
    }

    var ov = openModal(renderBody());
    ov.addEventListener('click', function (e) {
      if (e.target === ov) { ov.remove(); return; }
      var actEl = e.target.closest('[data-act]');
      if (!actEl) return;
      var act = actEl.dataset.act;
      if (act === 'close') { ov.remove(); return; }
      if (act === 'period-on') {
        S.periods.delete(dateStr); savePeriods();
        isPeriod = false; isPred = false; renderCalendar();
        ov.firstElementChild.innerHTML = renderBody(); toast('已取消当天生理期标记');
      } else if (act === 'period-pred') {
        S.periods.add(dateStr); savePeriods();
        isPeriod = true; isPred = false; renderCalendar();
        ov.firstElementChild.innerHTML = renderBody(); toast('已标记为实际生理期');
      } else if (act === 'period-off') {
        S.periods.add(dateStr); savePeriods();
        isPeriod = true; isPred = false; renderCalendar();
        ov.firstElementChild.innerHTML = renderBody(); toast('已标记生理期');
      } else if (act === 'add-sched') {
        var input = ov.querySelector('#phSchedInput');
        var txt = (input && input.value || '').trim();
        if (!txt) { toast('请先输入日程内容'); return; }
        daySched.push(txt);
        S.schedules[dateStr] = daySched;
        saveSched(); renderCalendar();
        ov.firstElementChild.innerHTML = renderBody();
        toast('已添加日程 📌');
      } else if (act === 'del-sched') {
        var idx = parseInt(actEl.dataset.idx, 10);
        daySched.splice(idx, 1);
        if (daySched.length) S.schedules[dateStr] = daySched; else delete S.schedules[dateStr];
        saveSched(); renderCalendar();
        ov.firstElementChild.innerHTML = renderBody();
        toast('已删除该日程');
      }
    });
  }

  /* ---------- 弹层工具 ---------- */
  function openModal(html) {
    var ov = document.createElement('div');
    ov.className = 'ph-ov';
    ov.innerHTML = '<div class="ph-modal">' + html + '</div>';
    root.appendChild(ov);
    return ov;
  }
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'ph-toast'; t.textContent = msg;
    root.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }

  /* ---------- 周期设置 ---------- */
  function openCycleSettings() {
    var c = S.cycle;
    var ov = openModal(
      '<h3>经期智能预测</h3>' +
      '<div style="color:#4a6fa5;font-size:12px;margin-bottom:10px;">设置后，日历将以半透明粉色自动标出未来（及附近月份）推测的经期日。点击预测日可转为实际标记。</div>' +
      '<div class="ph-field"><label>最近一次经期开始日</label><input type="date" id="phCyc-last" value="' + esc(c.lastStart || ymd(new Date())) + '" /></div>' +
      '<div class="ph-field"><label>周期天数（通常 28）</label><input type="number" id="phCyc-len" min="15" max="60" value="' + (parseInt(c.length, 10) || 28) + '" /></div>' +
      '<div class="ph-field"><label>经期天数</label><input type="number" id="phCyc-dur" min="1" max="10" value="' + (parseInt(c.duration, 10) || 5) + '" /></div>' +
      '<div class="ph-btns">' +
      '<button class="ph-btn primary" data-act="save">保存</button>' +
      '<button class="ph-btn" data-act="clear">清除预测</button>' +
      '<button class="ph-btn" data-act="close">关闭</button>' +
      '</div>'
    );
    ov.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'close') { ov.remove(); return; }
      if (b.dataset.act === 'clear') {
        S.cycle = { lastStart: '', length: 28, duration: 5 };
        saveCycle(); ov.remove(); renderCalendar(); toast('已清除预测');
        return;
      }
      var last = ov.querySelector('#phCyc-last').value;
      var len = parseInt(ov.querySelector('#phCyc-len').value, 10);
      var dur = parseInt(ov.querySelector('#phCyc-dur').value, 10);
      if (!last) toast('请选择经期开始日');
      else {
        S.cycle.lastStart = last;
        S.cycle.length = len >= 15 ? len : 28;
        S.cycle.duration = dur >= 1 ? dur : 5;
        saveCycle(); ov.remove(); renderCalendar(); toast('预测已更新');
      }
    });
  }

  /* ---------- 管理 / 编辑 ---------- */
  function openAnnManager() {
    var ov = openModal(
      '<h3>纪念日管理</h3>' +
      '<div style="color:#4a6fa5;font-size:12px;margin-bottom:6px;">点击条目编辑 / 删除</div>' +
      '<div class="ph-list" id="ph-mgList"></div>' +
      '<div class="ph-btns">' +
      '<button class="ph-btn primary" data-act="add">＋新增</button>' +
      '<button class="ph-btn" data-act="close">关闭</button>' +
      '</div>'
    );
    var list = ov.querySelector('#ph-mgList');
    render();
    list.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      var li = btn && btn.closest('.ph-li');
      if (!btn || !li) return;
      var id = li.dataset.id;
      if (btn.dataset.act === 'edit') { ov.remove(); openAnnEditor(id); }
      else if (btn.dataset.act === 'del') {
        if (!confirm('删除该纪念日吗？')) return;
        S.anniversaries = S.anniversaries.filter(function (a) { return a.id !== id; });
        saveAnniv(); render(); renderCountdown(); renderCalendar();
      }
    });
    ov.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'add') { ov.remove(); openAnnEditor(null); }
      else if (b.dataset.act === 'close') ov.remove();
    });
    function renderList() { list.innerHTML = ''; }
    render();
    function render() {
      if (!S.anniversaries.length) {
        list.innerHTML = '<div style="color:#4a6fa5;font-size:12px;padding:10px 2px;">暂无纪念日，点击新增</div>';
        return;
      }
      list.innerHTML = S.anniversaries.map(function (a) {
        var rep = { none: '不重复', year: '每年', month: '每月', week: '每周' }[a.repeat];
        return '<div class="ph-li" data-id="' + a.id + '">' +
          '<div><div class="name">' + esc(a.name) + '</div>' +
          '<div class="sub">' + esc(a.date) + ' · ' + rep + '</div></div>' +
          '<div class="act">' +
          '<button class="ph-mini primary" data-act="edit">编辑</button>' +
          '<button class="ph-mini danger" data-act="del">删除</button>' +
          '</div></div>';
      }).join('');
    }
  }

  /* ---------- 购物商城 / 礼物柜 ---------- */
  var shopTab = 'mall';
  var giftTab = 'got';

  function openShop() {
    var ov = document.createElement('div');
    ov.className = 'shop-ov';
    ov.innerHTML =
      '<div class="shop-head">' +
      '<div class="tabs">' +
      '<button class="tab on" data-tab="mall">🛍 商城</button>' +
      '<button class="tab" data-tab="cart">🛒 购物车<span class="cart-badge" data-cartcount></span></button>' +
      '<button class="tab" data-tab="cab">🎀 礼物柜</button>' +
      '</div>' +
      '<button class="shop-close" data-act="close">✕</button>' +
      '</div>' +
      '<div class="shop-body" id="phShopBody"></div>';
    root.appendChild(ov);
    ov.querySelectorAll('.tab').forEach(function (t) {
      t.addEventListener('click', function () {
        shopTab = t.dataset.tab;
        ov.querySelectorAll('.tab').forEach(function (x) { x.classList.toggle('on', x === t); });
        renderShopBody(ov);
      });
    });
    ov.querySelector('[data-act="close"]').addEventListener('click', function () { ov.remove(); });
    renderShopBody(ov);
  }

  function renderShopBody(ov) {
    var body = ov.querySelector('#phShopBody');
    // 更新购物车角标
    var badges = ov.querySelectorAll('[data-cartcount]');
    var n = (S.shop.cart || []).length;
    badges.forEach(function (b) { b.textContent = n ? n : ''; });
    if (shopTab === 'cab') { renderGiftCab(body); return; }
    if (shopTab === 'cart') { renderCart(body); return; }
    body.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
      '<span style="color:#5a7ba8;font-size:12px;">挑一件心意，送给自己或送给心里的那个人。</span>' +
      '<button class="wish-btn" data-wish>🌟 许愿</button>' +
      '</div>' +
      '<div class="shop-grid">' +
      (S.shop.wishes || []).map(function (w) {
        var wi = inCart(w.id);
        return '<div class="shop-item wish-item" data-id="' + w.id + '">' +
          '<span class="wish-tag">许愿</span>' +
          '<div class="si">' + iconHTML(w.icon, 'wish-img') + '</div>' +
          '<div class="sn">' + esc(w.name) + '</div>' +
          '<div class="sp">' + w.price + '</div>' +
          '<div style="display:flex;gap:4px;width:100%;justify-content:center;">' +
          '<button class="sb" data-buy="' + w.id + '">选择</button>' +
          '<button class="sb sb-cart" data-cart="' + w.id + '">' + (wi ? '已添加' : '🛒') + '</button>' +
          '<button class="sb sb-del" data-del="' + w.id + '">✕</button>' +
          '</div>' +
          '</div>';
      }).join('') +
      SHOP_ITEMS.map(function (it) {
        var inCart = (S.shop.cart || []).some(function (c) { return c.id === it.id; });
        return '<div class="shop-item" data-id="' + it.id + '">' +
          '<div class="si">' + it.icon + '</div>' +
          '<div class="sn">' + esc(it.name) + '</div>' +
          '<div class="sp">' + it.price + '</div>' +
          '<div style="display:flex;gap:4px;width:100%;justify-content:center;">' +
          '<button class="sb" data-buy="' + it.id + '">选择</button>' +
          '<button class="sb sb-cart" data-cart="' + it.id + '">' + (inCart ? '已添加' : '🛒') + '</button>' +
          '</div>' +
          '</div>';
      }).join('') +
      '</div>';
    var wishBtn = body.querySelector('[data-wish]');
    if (wishBtn) wishBtn.addEventListener('click', function () { openWishDialog(); });
    body.querySelectorAll('.shop-item').forEach(function (el) {
      el.addEventListener('click', function (e) {
        var buyEl = e.target.closest('[data-buy]');
        var cartEl = e.target.closest('[data-cart]');
        var delEl = e.target.closest('[data-del]');
        var id = buyEl || cartEl || delEl || el;
        id = id.getAttribute('data-id') || id.getAttribute('data-buy') || id.getAttribute('data-cart') || id.getAttribute('data-del');
        var item;
        if (delEl) {
          if (confirm('删除该许愿商品吗？')) {
            S.shop.wishes = (S.shop.wishes || []).filter(function (x) { return String(x.id) === String(id); });
            saveShop(); renderShopBody(ov);
          }
          return;
        }
        if (cartEl) {
          item = findItem(id);
          if (item) addToCart(item);
          return;
        }
        item = findItem(id);
        if (item) openBuyDialog(ov, item);
      });
    });
  }

  /* ---------- 购物车 ---------- */
  function addToCart(item) {
    var cart = S.shop.cart || (S.shop.cart = []);
    if (cart.some(function (c) { return c.id === item.id; })) { toast(item.name + ' 已在购物车'); return; }
    cart.push({ id: item.id, name: item.name, icon: item.icon, price: item.price, ts: Date.now() });
    saveShop();
    toast('已加入购物车 🛒 ' + item.name);
  }

  function removeFromCart(id) {
    S.shop.cart = (S.shop.cart || []).filter(function (c) { return c.id !== id; });
    saveShop();
  }

  function renderCart(body) {
    var cart = S.shop.cart || [];
    body.innerHTML =
      '<div style="color:#5a7ba8;font-size:12px;margin-bottom:10px;">把想要的放进购物车，' + getPartnerName() + ' 会在 24 小时可能随机从里面挑一件送给你～</div>' +
      (cart.length ? '' : '<div class="gift-empty">购物车空空如也<br>回商城点 🛒 加入想要的礼物吧</div>') +
      '<div id="cartList"></div>';
    var list = body.querySelector('#cartList');
    if (!cart.length) return;
    list.innerHTML = cart.map(function (c) {
      return '<div class="gift-row">' +
        '<div class="gi">' + iconHTML(c.icon, 'gi-img') + '</div>' +
        '<div class="gn">' + esc(c.name) + '<div style="color:#5a7ba8;font-size:10px;margin-top:2px;">购物车</div></div>' +
        '<div class="gd">¥' + c.price + '<br><button class="gbuy" data-rm="' + c.id + '">移除</button></div>' +
        '</div>';
    }).join('') +
      '<button class="ph-btn" style="width:100%;margin-top:6px;" data-cartclear>清空购物车</button>';
    list.querySelectorAll('[data-rm]').forEach(function (b) {
      b.addEventListener('click', function () {
        removeFromCart(parseInt(b.dataset.rm, 10));
        renderCart(body);
      });
    });
    var clearBtn = body.querySelector('[data-cartclear]');
    if (clearBtn) clearBtn.addEventListener('click', function () {
      if (!confirm('清空购物车吗？')) return;
      S.shop.cart = []; saveShop(); renderCart(body);
    });
  }

  /* 限 24 小时：对方从购物车随机挑一件送我（与主动赠礼互不冲突） */
  function maybeCartGiftFromPartner() {
    try {
      if (!S.shop) return;
      var cart = S.shop.cart || [];
      if (!cart.length) return;
      var key = 'ph_cart_gift_ts';
      var now = Date.now();
      var next = parseInt(lsGet(key, 0), 10) || 0;
      if (now < next) return;
      lsSet(key, now + 24 * 60 * 60 * 1000);
      var item = cart[Math.floor(Math.random() * cart.length)];
      walletPayTheirs(item.price); // 扣 TA 的余额
      item = Object.assign({}, item, { note: giftNoteForPartner(), who: 'partner-cart', ts: now });
      S.shop.got.push({ id: item.id, name: item.name, icon: item.icon, price: item.price, who: 'partner-cart', ts: now, note: item.note });
      S.shop.cart = cart.filter(function (c) { return c.id !== item.id; });
      saveShop();
      toast('💝 ' + getPartnerName() + ' 从你的购物车里挑走了：' + item.name);
      maybeNotifyChat(item, 'receive');
    } catch (e) {}
  }

  /* ---------- 许愿（自定义商品） ---------- */
  function inCart(id) {
    return (S.shop.cart || []).some(function (c) { return String(c.id) === String(id); });
  }
  function findItem(id) {
    var s = String(id);
    var w = (S.shop.wishes || []).find(function (x) { return String(x.id) === s; });
    if (w) return w;
    return SHOP_ITEMS.find(function (x) { return String(x.id) === s; });
  }
  /* 图标 HTML：emoji 直接显示，图片（dataURL/URL) 用 <img> */
  function iconHTML(icon, cls) {
    var s = String(icon || '🎁');
    if (s.indexOf('data:') === 0 || /^(https?:|\/)/.test(s)) {
      return '<img src="' + s + '" class="' + (cls || 'wish-img') + '"/>';
    }
    return s;
  }
  function openWishDialog() {
    var chosen = '';
    var imgIcon = '';
    var ov = openModal(
      '<h3>✏️ 许愿（自定义上架）</h3>' +
      '<div style="color:#4a6fa5;font-size:12px;margin-bottom:10px;">自定义一件商品上架到商城，TA 有机会送给你。</div>' +
      '<div class="ph-field"><label>商品名称</label><input type="text" id="phW-name" placeholder="例如：喜欢的小夜灯" /></div>' +
      '<div class="ph-field"><label>价格</label><input type="number" id="phW-price" min="1" placeholder="例如：66" /></div>' +
      '<div class="ph-field"><label>选择图标（emoji 或上传图片）</label>' +
      '<input type="file" id="phW-file" accept="image/*" style="display:none" />' +
      '<div class="wish-upload" id="phW-upload">📁 上传图片</div>' +
      '<div class="wish-preview" id="phW-prev"></div>' +
      '</div>' +
      '<div class="wish-emojis" id="phW-emo">' +
      WISH_EMOJIS.map(function (e) { return '<span data-e="' + e + '">' + e + '</span>'; }).join('') +
      '</div>' +
      '<div class="ph-btns">' +
      '<button class="ph-btn primary" data-act="save">上架商品</button>' +
      '<button class="ph-btn" data-act="cancel">取消</button>' +
      '</div>'
    );
    ov.querySelector('#phW-emo').addEventListener('click', function (e) {
      var s = e.target.closest('[data-e]'); if (!s) return;
      chosen = s.dataset.e; imgIcon = '';
      ov.querySelectorAll('#phW-emo [data-e]').forEach(function (x) { x.classList.toggle('on', x === s); });
      ov.querySelector('#phW-prev').innerHTML = '<div class="wish-icon-preview">' + chosen + '</div>';
    });
    ov.querySelector('#phW-upload').addEventListener('click', function () { ov.querySelector('#phW-file').click(); });
    ov.querySelector('#phW-file').addEventListener('change', function () {
      var f = ov.querySelector('#phW-file').files && ov.querySelector('#phW-file').files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        compressImage(r.result, function (out) {
          imgIcon = out; chosen = '';
          ov.querySelectorAll('#phW-emo [data-e]').forEach(function (x) { x.classList.remove('on'); });
          ov.querySelector('#phW-prev').innerHTML = '<div class="wish-icon-preview"><img src="' + out + '" alt=""/></div>';
        });
      };
      r.readAsDataURL(f);
      ov.querySelector('#phW-file').value = '';
    });
    ov.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'cancel') { ov.remove(); return; }
      var name = (ov.querySelector('#phW-name').value || '').trim();
      var price = parseInt(ov.querySelector('#phW-price').value, 10);
      if (!name) { toast('请填写商品名称'); return; }
      if (!price || price < 1) { toast('请填写价格'); return; }
      var icon = imgIcon || chosen;
      if (!icon) { toast('请选择或上传图标'); return; }
      var w = { id: 'w' + Date.now() + Math.floor(Math.random() * 1000), name: name, price: price, icon: icon, desc: '许愿商品，TA 有机会送给你', custom: true };
      (S.shop.wishes = S.shop.wishes || []).push(w);
      saveShop();
      ov.remove();
      toast('已上架 ✏️ ' + name);
      var shopOv = root.querySelector('.shop-ov');
      if (shopOv) renderShopBody(shopOv.querySelector('#phShopBody'));
    });
  }

  function openBuyDialog(ov, item) {
    var picks = [];
    if (item.opts && item.opts.length) {
      item.opts.forEach(function (o) { picks.push({ k: o.k, v: o.v[0] }); });
    }
    function specHTML() {
      if (!item.opts || !item.opts.length) return '';
      return '<div style="margin-bottom:12px;">' + item.opts.map(function (o, gi) {
        return '<div class="sp-group"><div class="sp-t">' + esc(o.k) + '</div><div class="sp-chips" data-g="' + gi + '">' +
          o.v.map(function (v, vi) {
            return '<button type="button" class="sp-chip' + (picks[gi].v === v ? ' on' : '') + '" data-v="' + vi + '">' + esc(v) + '</button>';
          }).join('') +
          '</div></div>';
      }).join('') + '</div>';
    }
    var modal = openModal(
      '<div style="text-align:center;">' +
      '<div style="font-size:52px;">' + iconHTML(item.icon, 'wish-img-lg') + '</div>' +
      '<h3 style="margin:6px 0 4px;">' + esc(item.name) + '</h3>' +
      '<div style="color:#ffd66b;font-weight:600;margin-bottom:8px;">¥' + item.price + '</div>' +
      '<div style="color:#5a7ba8;font-size:12px;line-height:1.6;margin-bottom:14px;">' + esc(item.desc || '') + '</div>' +
      '</div>' +
      specHTML() +
      '<div class="ph-btns" style="flex-direction:column;gap:8px;">' +
      '<button class="ph-btn primary" data-act="self">🎁 买给自己</button>' +
      '<button class="ph-btn" data-act="them" style="background:linear-gradient(90deg,#8a4bff,#ff5b7a);">💝 买给 TA</button>' +
      '<button class="ph-btn" data-act="cancel">取消</button>' +
      '</div>'
    );
    // 送 TA 时可选择留言
    var noteInput = document.createElement('div');
    noteInput.className = 'ph-field';
    noteInput.innerHTML = '<label>送 ' + esc(getPartnerName()) + ' 时留言（选填，写上后 TA 会在几分钟内回应你）</label>' +
      '<input type="text" id="shop-msg" maxlength="40" placeholder="想对他说的话…" />';
    modal.querySelector('.ph-btns').parentNode.insertBefore(noteInput, modal.querySelector('.ph-btns'));
    modal.querySelectorAll('.sp-chips').forEach(function (box) {
      box.addEventListener('click', function (e) {
        var c = e.target.closest('.sp-chip'); if (!c) return;
        var gi = parseInt(box.dataset.g, 10);
        var vi = parseInt(c.dataset.v, 10);
        picks[gi].v = item.opts[gi].v[vi];
        box.querySelectorAll('.sp-chip').forEach(function (x, i) { x.classList.toggle('on', i === vi); });
      });
    });
    modal.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'cancel') { modal.remove(); return; }
      var rec = { id: item.id, name: item.name, icon: item.icon, price: item.price, spec: picks.length ? picks : null, ts: Date.now() };
      if (b.dataset.act === 'self') {
        // 我为自己购入：扣我的余额
        if (!walletTryPayMine(item.price)) return;
        rec.who = 'me';
        S.shop.got.push(rec);
        saveShop();
        modal.remove();
        toast('已为自己收入 🎁 ' + item.name);
        afterBuyRefresh(ov);
      } else if (b.dataset.act === 'them') {
        // 我买给 TA：扣我的余额
        if (!walletTryPayMine(item.price)) return;
        rec.who = 'them';
        rec.note = (modal.querySelector('#shop-msg') && modal.querySelector('#shop-msg').value || '').trim();
        S.shop.given.push(rec);
        saveShop();
        modal.remove();
        toast('已送给 TA 💝 ' + item.name);
        try {
          if (rec.spec && typeof notifyFoodGift === 'function') { notifyFoodGift(rec, 'give'); }
          else maybeNotifyChat(item, 'give');
        } catch (e) { try { maybeNotifyChat(item, 'give'); } catch (e2) {} }
        if (rec.note) schedulePartnerReply(rec);
        afterBuyRefresh(ov);
      }
    });
  }

  function afterBuyRefresh(ov) { if (ov && ov.isConnected) renderShopBody(ov); }

  function renderGiftCab(body) {
    var got = S.shop.got || [];
    var given = S.shop.given || [];
    body.innerHTML =
      '<div class="gift-tabs">' +
      '<button data-gt="got" class="' + (giftTab === 'got' ? 'on' : '') + '">她送我（' + got.length + '）</button>' +
      '<button data-gt="given" class="' + (giftTab === 'given' ? 'on' : '') + '">我送他/她（' + given.length + '）</button>' +
      '</div>' +
      '<div id="giftList"></div>';
    body.querySelectorAll('.gift-tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        giftTab = b.dataset.gt;
        renderGiftCab(body);
      });
    });
    var list = body.querySelector('#giftList');
    var arr = giftTab === 'got' ? got : given;
    if (!arr.length) {
      list.innerHTML = '<div class="gift-empty">礼物柜空空的<br>去商城挑一件吧</div>';
      return;
    }
    list.innerHTML = arr.slice().reverse().map(function (g) {
      var who = giftTab === 'got' ? (g.who === 'me' ? '自己购入' : (getPartnerName() + ' 赠送')) : '送给 ' + getPartnerName();
      var convo = '';
      if (g.note) convo += '<div class="gift-talk mine">🗨 ' + esc(g.note) + '</div>';
      if (g.reply) {
        var rplArr = Array.isArray(g.reply) ? g.reply : [g.reply];
        rplArr.forEach(function (r) { if (r) convo += '<div class="gift-talk theirs">💬 ' + esc(r) + '</div>'; });
      }
      else if (g.replyPending !== false && g.note && giftTab === 'given') convo += '<div class="gift-talk pending">⏳ ' + esc(getPartnerName()) + ' 回复中…</div>';
      return '<div class="gift-row">' +
        '<div class="gi">' + iconHTML(g.icon, 'gi-img') + '</div>' +
        '<div class="gn">' + esc(g.name) + '<div style="color:#5a7ba8;font-size:10px;margin-top:2px;">' + esc(who) + '</div>' + convo + '</div>' +
        '<div class="gd">¥' + g.price + '<br>' + fmtDate(g.ts) + '</div>' +
        '</div>';
    }).join('');
  }

  function getPartnerName() {
    try { if (typeof settings !== 'undefined' && settings.partnerName) return settings.partnerName; } catch (e) {}
    return '她/他';
  }

  function fmtDate(ts) {
    var d = new Date(ts);
    return (d.getMonth() + 1) + '-' + d.getDate();
  }

  /* 对方随机赠礼：有几率在进入主屏时触发 */
  function maybeGiftFromPartner() {
    try {
      if (!S.shop) return;
      var key = 'ph_gift_cooldown';
      var now = Date.now();
      var next = parseInt(lsGet(key, 0), 10) || 0;
      if (now < next) return;
      var roll = Math.random();
      var cooldown = 1000 * 60 * 60 * (8 + Math.floor(Math.random() * 16)); // 8~24h
      if (roll < 0.25) {
        var item = SHOP_ITEMS[Math.floor(Math.random() * SHOP_ITEMS.length)];
        walletPayTheirs(item.price); // 扣 TA 的余额
        S.shop.got.push({ id: item.id, name: item.name, icon: item.icon, price: item.price, who: 'partner', ts: now, note: giftNoteForPartner() });
        saveShop();
        lsSet(key, now + cooldown);
        toast('💝 ' + getPartnerName() + ' 悄悄送了你：' + item.name);
        maybeNotifyChat(item, 'receive');
      } else {
        lsSet(key, now + cooldown * 2);
      }
    } catch (e) {}
  }

  function maybeNotifyChat(item, kind) {
    try {
      var name = getPartnerName();
      var noteTxt = item.note ? '「' + item.note + '」' : '';
      var text = kind === 'give'
        ? '我买了一件礼物送给你：' + item.name + '（¥' + item.price + '）💝' + (noteTxt ? ' · ' + noteTxt : '')
        : name + ' 在商城挑了一件礼物送给你：' + item.name + '（¥' + item.price + '）💝' + (noteTxt ? ' · ' + noteTxt : '');
      if (typeof window._pushGiftMessage === 'function') {
        window._pushGiftMessage({ give: kind === 'give', item: item, text: text });
        // 我送给他/她 → 对方有几率回复感谢语（内容来自"主字卡"池）
        if (kind === 'give' && typeof window._partnerGiftReply === 'function') {
          try {
            setTimeout(function () {
              var pool = (typeof window.getReplyCardPool === 'function') ? window.getReplyCardPool() : [];
              window._partnerGiftReply(pool && pool.length ? pool : GIFT_REPLIES);
            }, 600 + Math.random() * 900);
          } catch (e) {}
        }
      } else if (typeof window.showNotification === 'function') {
        window.showNotification(text, 'info', 4000);
      }
    } catch (e) {}
  }

  var GIFT_REPLIES = [
    '收到啦!!我也超喜欢这个，谢谢我的宝 💝',
    '哇！你送我这个了吗？我开心得冒泡 🥰',
    '呜呜太甜了，我要好好收藏起来',
    '嘿嘿，那我是不是也该给你挑一个？',
    '收到你这份心意,今晚我都能笑着睡啦',
    '你可太懂我了，这正是我想要的',
    '等见面我一定要让你亲自帮我戴上/挂上 🎀'
  ];

  function openAnnEditor(id) {
    var item = id ? (S.anniversaries.find(function (x) { return x.id === id; }) || null) : null;
    var ov = openModal(
      '<h3>' + (item ? '编辑纪念日' : '新增纪念日') + '</h3>' +
      '<div class="ph-field"><label>名称</label><input type="text" id="phE-name" placeholder="例如：我们相恋" value="' + esc(item ? item.name : '') + '" /></div>' +
      '<div class="ph-field"><label>日期</label><input type="date" id="phE-date" value="' + (item ? item.date : ymd(new Date())) + '" /></div>' +
      '<div class="ph-field"><label>重复规则</label><select id="phE-rep">' +
      '<option value="none"'  + (item && item.repeat === 'none'  ? ' selected' : '') + '>不重复（显示已过天数）</option>' +
      '<option value="year"'  + (item && item.repeat === 'year'  ? ' selected' : '') + '>每年重复</option>' +
      '<option value="month"' + (item && item.repeat === 'month' ? ' selected' : '') + '>每月重复</option>' +
      '<option value="week"'  + (item && item.repeat === 'week'  ? ' selected' : '') + '>每周重复</option>' +
      '</select></div>' +
      '<div class="ph-btns">' +
      '<button class="ph-btn primary" data-act="save">保存</button>' +
      '<button class="ph-btn" data-act="cancel">取消</button>' +
      '</div>'
    );
    ov.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'cancel') { ov.remove(); return; }
      var name = ov.querySelector('#phE-name').value.trim();
      var date = ov.querySelector('#phE-date').value;
      var rep = ov.querySelector('#phE-rep').value;
      if (!name) { toast('请填写名称'); return; }
      if (!date) { toast('请选择日期'); return; }
      if (item) { item.name = name; item.date = date; item.repeat = rep; }
      else S.anniversaries.push({ id: 'a' + Date.now() + Math.random().toString(16).slice(2, 6), name: name, date: date, repeat: rep });
      saveAnniv(); ov.remove(); renderCountdown(); renderCalendar();
      toast(item ? '已保存' : '已添加纪念日');
    });
  }

  /* ---------- 背景上传 ---------- */
  function bindBgUpload() {
    var file = document.getElementById('ph-bgFile');
    document.getElementById('ph-bgBtn').addEventListener('click', function (e) {
      e.stopPropagation(); file.click();
    });
    file.addEventListener('change', function () {
      var f = file.files && file.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () { compressImage(r.result, function (out) { localStorage.setItem(LS_KEY_BG, out); renderCountdown(); toast('背景已更新'); }); };
      r.readAsDataURL(f);
      file.value = '';
    });
  }
  function compressImage(dataUrl, cb) {
    var img = new Image();
    img.onload = function () {
      var max = 430, w = img.width, h = img.height, ratio = Math.max(w, h) > max ? max / Math.max(w, h) : 1;
      var nw = Math.round(w * ratio), nh = Math.round(h * ratio);
      var c = document.createElement('canvas'); c.width = nw; c.height = nh;
      c.getContext('2d').drawImage(img, 0, 0, nw, nh);
      cb(c.toDataURL('image/jpeg', 0.78));
    };
    img.onerror = function () { cb(dataUrl); };
    img.src = dataUrl;
  }

  /* ---------- 进入聊天 ---------- */
  function enterChat() {
    root.classList.add('hidden');
    try { if (window.showNotification) window.showNotification('进入聊天', 'success', 1200); } catch (e) {}
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    if (root && root.dataset.bound === '1') return;
    if (root) root.dataset.bound = '1';
    document.getElementById('ph-addAnn').addEventListener('click', function () { openAnnEditor(null); });
    document.getElementById('ph-manageAnn').addEventListener('click', function () { openAnnManager(); });
    document.getElementById('ph-enterChat').addEventListener('click', enterChat);
    document.getElementById('ph-openShop').addEventListener('click', function () { loadData(); openShop(); });
    document.getElementById('ph-openFood').addEventListener('click', function () { loadData(); openFood(); });
    document.getElementById('ph-openMoments').addEventListener('click', function () { loadData(); openMoments(); });
    document.getElementById('ph-iconBeauty').addEventListener('click', function () { openIconBeauty(); });
    document.getElementById('ph-openAlipay').addEventListener('click', function () { loadData(); openAlipay(); });
    document.getElementById('ph-cycleSet').addEventListener('click', function () { openCycleSettings(); });

    document.querySelectorAll('.cal-nav').forEach(function (el) {
      el.addEventListener('click', function () {
        S.month += parseInt(el.dataset.dir, 10);
        if (S.month < 0) { S.month = 11; S.year -= 1; }
        if (S.month > 11) { S.month = 0; S.year += 1; }
        renderCalendar();
      });
    });
    bindBgUpload();
  }

  /* ---------- 外卖 App ---------- */
  var FOOD_REPLIES = [
    '收到啦🍜才刚出锅你就送来啦，太贴心啦💕',
    '哇！！这个正好是我念叨好久的，谢谢宝😍',
    '呜呜这也太暖了吧，我要趁热吃给你看 🥰',
    '嘿嘿那我今晚也给你点一份啊～',
    '好吃到冒星星，被你记住口味真的太甜了吧',
    '等这边忙完我就去接这份，谢谢你的心意💝'
  ];

  function openFood() {
    var ov = document.createElement('div');
    ov.className = 'fd-ov';
    ov.innerHTML =
      '<div class="fd-top">' +
      '<span class="fd-title">🍔 美食外卖</span>' +
      '<span class="fd-addr">📍 送到 {partner}</span>'.replace('{partner}', esc(getPartnerName()) + ' 的家') +
      '<button class="fd-close" data-act="close">✕</button>' +
      '</div>' +
      '<div class="fd-banner">' +
      '<div style="flex:1;"><div class="fd-b1">和你一起吃遍全世界</div>' +
      '<div class="fd-b2">30 份美味 · 甜度冰度辣度都能挑 · 点开选规格</div></div>' +
      '<button class="fd-wish" id="phFoodWish">🌟 许愿上架</button>' +
      '</div>' +
      '<div class="fd-search">🔍<input id="fdSearch" placeholder="搜点什么好吃的…" /></div>' +
      '<div class="fd-catbar" id="fdCatbar"></div>' +
      '<div class="fd-tabs">' +
      '<button class="on" data-ft="menu">📖 点餐</button>' +
      '<button data-ft="got">🎁 我收到的</button>' +
      '<button data-ft="given">💝 我送出的</button>' +
      '</div>' +
      '<div class="fd-body" id="fdBody"></div>';
    root.appendChild(ov);
    var ft = 'menu';
    ov.querySelector('.fd-tabs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-ft]'); if (!b) return;
      ft = b.dataset.ft;
      ov.querySelectorAll('.fd-tabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
      ov.querySelector('.fd-catbar').style.display = ft === 'menu' ? '' : 'none';
      ov.querySelector('.fd-search').style.display = ft === 'menu' ? '' : 'none';
      ov.querySelector('.fd-banner').style.display = ft === 'menu' ? '' : 'none';
      renderFoodBody(ov, ft);
    });
    // 分类
    var cats = ['全部'];
    FOOD_ITEMS.forEach(function (f) { if (cats.indexOf(f.cat) < 0) cats.push(f.cat); });
    ov.querySelector('#fdCatbar').innerHTML = cats.map(function (c) {
      return '<button class="fd-cat' + (c === '全部' ? ' on' : '') + '" data-cat="' + c + '">' + c + '</button>';
    }).join('');
    var curCat = '全部';
    ov.querySelector('#fdCatbar').addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]'); if (!b) return;
      curCat = b.dataset.cat;
      ov.querySelectorAll('#fdCatbar .fd-cat').forEach(function (x) { x.classList.toggle('on', x === b); });
      renderFoodMenu(ov, curCat, ov.querySelector('#fdSearch').value.trim());
    });
    // 搜索
    ov.querySelector('#fdSearch').addEventListener('input', function () {
      renderFoodMenu(ov, curCat, this.value.trim());
    });
    ov.querySelector('[data-act="close"]').addEventListener('click', function () { ov.remove(); });
    var wishBtn = ov.querySelector('#phFoodWish');
    if (wishBtn) wishBtn.addEventListener('click', function () { openFoodWish(); });
    renderFoodBody(ov, 'menu');
  }

  function renderFoodBody(ov, ft) {
    var body = ov.querySelector('#fdBody');
    if (ft === 'got') return renderFoodRecords(body, 'got');
    if (ft === 'given') return renderFoodRecords(body, 'given');
    renderFoodMenu(ov, '全部', ov.querySelector('#fdSearch').value.trim());
  }

  function renderFoodMenu(ov, cat, kw) {
    var body = ov.querySelector('#fdBody');
    var list = FOOD_ITEMS.filter(function (f) {
      var okCat = cat === '全部' || f.cat === cat;
      var okKw = !kw || f.name.indexOf(kw) >= 0 || f.desc.indexOf(kw) >= 0;
      return okCat && okKw;
    });
    if (!list.length) { body.innerHTML = '<div class="fd-empty">没有找到相关美食~</div>'; return; }
    body.innerHTML = '<div class="fd-list">' + list.map(function (f) {
      return '<div class="fd-item" data-id="' + f.id + '">' +
        '<div class="fd-pic">' + f.icon + '</div>' +
        '<div class="fd-mid">' +
        '<div class="fd-n">' + esc(f.name) + '</div>' +
        '<div class="fd-spec">' + f.opts.map(function (o) { return '可挑' + o.k; }).join(' · ') + '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:center;gap:6px;min-width:68px;">' +
        '<div class="fd-price"><i>¥</i>' + f.price + '</div>' +
        '<button class="fd-add" data-add="' + f.id + '">＋</button>' +
        '</div>' +
        '</div>';
    }).join('') + '</div>';
    body.querySelectorAll('.fd-item').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = e.target.closest('.fd-item').dataset.id;
        openFoodSpec(id, ov);
      });
    });
    body.querySelectorAll('.fd-add').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        openFoodSpec(b.dataset.add, ov);
      });
    });
  }

  function renderFoodRecords(body, which) {
    var arr = (which === 'got' ? S.food.got : S.food.given) || [];
    if (!arr.length) {
      body.innerHTML = '<div class="fd-empty">' + (which === 'got' ? '还没收到外送～去点一份吧' : '还没送过外卖～') + '</div>';
      return;
    }
    body.innerHTML = '<div class="fd-list">' + arr.slice().reverse().map(function (g) {
      var who = which === 'got' ? (g.who === 'me' ? '自己购买' : getPartnerName() + ' 送我的') : '送给 ' + getPartnerName();
      var specTxt = (g.spec || []).map(function (s) { return s.k + '：' + s.v; }).join(' · ');
      var convo = '';
      if (g.note) {
        convo += '<div class="fd-talk mine">🗨 ' + esc(g.note) + '</div>';
      }
      if (g.reply) {
        var rplArr = Array.isArray(g.reply) ? g.reply : [g.reply];
        rplArr.forEach(function (r) { if (r) convo += '<div class="fd-talk theirs">💬 ' + esc(r) + '</div>'; });
      } else if (g.replyPending !== false && g.note && which === 'given') {
        convo += '<div class="fd-talk pending">⏳ ' + esc(getPartnerName()) + ' 回复中…</div>';
      }
      return '<div class="fd-item">' +
        '<div class="fd-pic">' + (g.icon || '🍽') + '</div>' +
        '<div class="fd-mid">' +
        '<div class="fd-n">' + esc(g.name) + '</div>' +
        (specTxt ? '<div class="fd-desc" style="white-space:normal;">规格：' + esc(specTxt) + '</div>' : '<div class="fd-desc" style="white-space:normal;"></div>') +
        convo +
        '<div class="fd-spec">' + esc(who) + ' · ' + fmtDate(g.ts) + '</div>' +
        '</div>' +
        '<div class="fd-price"><i>¥</i>' + g.price + '</div>' +
        '</div>';
    }).join('') + '</div>';
  }

  function openFoodSpec(id, foodOv) {
    var f = null;
    FOOD_ITEMS.forEach(function (x) { if (x.id === id) f = x; });
    if (!f) return;
    var picks = [];
    f.opts.forEach(function (o) { picks.push({ k: o.k, v: o.v[0] }); });
    function choiceHTML() {
      return f.opts.map(function (o, gi) {
        return '<div class="sp-group"><div class="sp-t">' + esc(o.k) + '</div><div class="sp-chips" data-g="' + gi + '">' +
          o.v.map(function (v, vi) {
            return '<button type="button" class="sp-chip' + (picks[gi].v === v ? ' on' : '') + '" data-v="' + vi + '">' + esc(v) + '</button>';
          }).join('') +
          '</div></div>';
      }).join('');
    }
    var modal = openModal(
      '<div style="text-align:center;">' +
      '<div style="font-size:52px;">' + f.icon + '</div>' +
      '<h3 style="margin:6px 0 2px;">' + esc(f.name) + '</h3>' +
      '<div style="color:#ff4b2b;font-weight:800;margin-bottom:4px;">¥' + f.price + '</div>' +
      '<div style="color:#5a7ba8;font-size:12px;margin-bottom:10px;">' + esc(f.desc) + '</div>' +
      '</div>' +
      '<div id="fdSpec">' + choiceHTML() + '</div>' +
      '<div class="ph-field"><label>送 ' + esc(getPartnerName()) + ' 时留言（选填，写上后 TA 会在几分钟内回应你）</label>' +
      '<input type="text" id="fmsg" maxlength="40" placeholder="想对他说的话…" /></div>' +
      '<div class="ph-btns" style="flex-direction:column;gap:8px;">' +
      '<button class="ph-btn primary" data-act="self">🎁 买给自己吃</button>' +
      '<button class="ph-btn" data-act="them" style="background:linear-gradient(90deg,#ff6a3d,#ff4b2b);">💝 送给 ' + esc(getPartnerName()) + '</button>' +
      '<button class="ph-btn" data-act="cancel">取消</button>' +
      '</div>'
    );
    modal.querySelectorAll('.sp-chips').forEach(function (box) {
      box.addEventListener('click', function (e) {
        var c = e.target.closest('.sp-chip'); if (!c) return;
        var gi = parseInt(box.dataset.g, 10);
        var vi = parseInt(c.dataset.v, 10);
        picks[gi].v = f.opts[gi].v[vi];
        box.querySelectorAll('.sp-chip').forEach(function (x, i) { x.classList.toggle('on', i === vi); });
      });
    });
    modal.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'cancel') { modal.remove(); return; }
      var record = { id: f.id, name: f.name, icon: f.icon, price: f.price, spec: picks, ts: Date.now() };
      if (b.dataset.act === 'self') {
        // 我为自己点：扣我的余额
        if (!walletTryPayMine(f.price)) return;
        record.who = 'me';
        (S.food.got = S.food.got || []).push(record);
        saveFood();
        modal.remove();
        toast('已给自己点好 🍔 ' + f.name);
      } else if (b.dataset.act === 'them') {
        // 我买给 TA：扣我的余额
        if (!walletTryPayMine(f.price)) return;
        record.who = 'them';
        record.note = (modal.querySelector('#fmsg') && modal.querySelector('#fmsg').value || '').trim();
        (S.food.given = S.food.given || []).push(record);
        saveFood();
        modal.remove();
        toast('已给 ' + getPartnerName() + ' 点好 💝 ' + f.name);
        notifyFoodGift(record, 'give');
        if (record.note) schedulePartnerReply(record);
      }
      if (foodOv && foodOv.isConnected) renderFoodBody(foodOv, 'menu');
    });
  }

  /* 外卖赠礼推送到聊天 + 对方有几率回复 */
  function notifyFoodGift(g, kind) {
    try {
      var name = getPartnerName();
      var spec = (g.spec || []).map(function (s) { return s.k + s.v; }).join('，');
      var noteTxt = g.note ? '「' + g.note + '」' : '';
      var text = kind === 'give'
        ? '给你点了外卖：' + g.name + '（' + spec + '）¥' + g.price + '，记得趁热吃哦💝' + (noteTxt ? ' · ' + noteTxt : '')
        : name + ' 给你点了外卖：' + g.name + '（' + spec + '）¥' + g.price + '🍱' + (noteTxt ? ' · ' + noteTxt : '');
      if (typeof window._pushGiftMessage === 'function') {
        window._pushGiftMessage({ give: kind === 'give', item: { name: g.name, icon: g.icon, price: g.price }, text: text });
        if (kind === 'give' && typeof window._partnerGiftReply === 'function') {
          try {
            setTimeout(function () {
              var pool = (typeof window.getReplyCardPool === 'function') ? window.getReplyCardPool() : [];
              window._partnerGiftReply(pool && pool.length ? pool : FOOD_REPLIES);
            }, 700 + Math.random() * 1100);
          } catch (e) {}
        }
      } else if (typeof window.showNotification === 'function') {
        window.showNotification(text, 'info', 4000);
      }
    } catch (e) {}
  }

  /* ---------- 对方主动帮我点外卖：按时间窗口 + 每日各渠道限次 ---------- */
  // 渠道：饭点（8/12/18点前后2小时）每天≤2次、非饭点每天≤2次、聊天喊饿每天≤2次
  var LS_KEY_FOOD_DAILY = 'ph_food_daily';
  var KEY_FOOD_GIFT_NEXT = 'ph_food_gift_next';

  function foodDailyKey(ts) {
    var d = new Date(ts || Date.now());
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  function foodDaily(ts) {
    var st = lsGet(LS_KEY_FOOD_DAILY, {});
    var day = foodDailyKey(ts);
    if (st.day !== day) st = { day: day, meal: 0, snack: 0, chat: 0 };
    return st;
  }
  // 当前饭点窗口的结束时间戳（6-10 / 10-14 / 16-20）；不在饭点窗口返回 null
  function mealWindowEnd(ts) {
    var d = new Date(ts), h = d.getHours(), endH = null;
    if (h >= 6 && h < 10) endH = 10;
    else if (h >= 10 && h < 14) endH = 14;
    else if (h >= 16 && h < 20) endH = 20;
    if (!endH) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), endH, 0, 0, 0).getTime();
  }
  // 生成一份随机外卖并记录到 got（附带渠道 tag 与每日计数）
  function sendPartnerFood(channel) {
    try {
      var now = Date.now();
      var f = FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)];
      var picks = f.opts.map(function (o) { return { k: o.k, v: o.v[Math.floor(Math.random() * o.v.length)] }; });
      var gift = { id: f.id, name: f.name, icon: f.icon, price: f.price, spec: picks, who: 'partner', ts: now };
      gift.kindText = channel === 'meal' ? '饭点外卖' : '外卖';
      gift.note = giftNoteForPartner();
      walletPayTheirs(f.price); // 扣 TA 的余额
      (S.food.got = S.food.got || []).push(gift);
      saveFood();
      var st = foodDaily(now);
      st[channel === 'meal' ? 'meal' : (channel === 'snack' ? 'snack' : 'chat')]++;
      lsSet(LS_KEY_FOOD_DAILY, st);
      toast('💌 ' + getPartnerName() + ' 给你点了' + gift.kindText + '：' + f.name);
      notifyFoodGift(gift, 'receive');
    } catch (e) {}
  }

  function maybePartnerFoodGift() {
    try {
      if (!S.food) return;
      var now = Date.now();
      var h = new Date(now).getHours();
      var isMeal = mealWindowEnd(now) !== null; // 8/12/18 点前后2小时
      var next = parseInt(lsGet(KEY_FOOD_GIFT_NEXT, 0), 10) || 0;
      if (now < next) return;
      var st = foodDaily(now);
      if (isMeal) {
        if (st.meal >= 2) { lsSet(KEY_FOOD_GIFT_NEXT, now + 1000 * 60 * 60); return; } // 满额，下个窗口再看
        if (Math.random() < 0.8) {
          sendPartnerFood('meal');
        }
        lsSet(KEY_FOOD_GIFT_NEXT, mealWindowEnd(now) + 2000); // 每次只在当前饭点窗口判断一次
      } else {
        if (st.snack >= 2) { lsSet(KEY_FOOD_GIFT_NEXT, now + 1000 * 60 * 60); return; }
        if (Math.random() < 0.2) {
          sendPartnerFood('snack');
          lsSet(KEY_FOOD_GIFT_NEXT, now + (40 + Math.random() * 120) * 60000); // 40~160 分钟后再判
        } else {
          lsSet(KEY_FOOD_GIFT_NEXT, now + (30 + Math.random() * 90) * 60000); // 0.5~2 小时后再判
        }
      }
    } catch (e) {}
  }
  // 聊天触发：我说“好饿/饿死了/没吃饭/没吃”等 → 20% 对方点外卖，每天≤2次
  function maybeHungryFoodGift(text) {
    try {
      if (!S.food) return;
      var t = (text || '').trim();
      if (!/(好饿|饿死了|还没吃饭|还没吃|没吃饭|没吃)/.test(t)) return;
      var st = foodDaily(Date.now());
      if (st.chat >= 2) return;
      if (Math.random() < 0.2) sendPartnerFood('chat');
    } catch (e) {}
  }
  window._onUserHungry = function (t) { maybeHungryFoodGift(t); };
  window.phoneHomeDebug = {
    isMealWindow: function (ts) { return mealWindowEnd(ts || Date.now()) !== null; },
    windowMatrix: function () {
      var out = [];
      [7.5, 8, 9, 12, 13, 18, 19, 3, 20.5, 21].forEach(function (hh) {
        var h = Math.floor(hh); var m = Math.round((hh - h) * 60);
        out.push(h + ':' + (m < 10 ? '0' : '') + m + '=' + (mealWindowEnd(new Date(2026, 7, 8, h, m, 0).getTime()) !== null));
      });
      return out.join(',');
    },
    daily: function () { return foodDaily(Date.now()); },
    hungryMatch: function (t) { return /(好饿|饿死|还没吃|没吃饭|没吃)/.test((t || '').trim()); }
  };

  /* ---------- 外卖许愿：自定义商品上架到商城 ---------- */
  var FOOD_WISH_EMOJIS = ['🧋','🧋','🍵','🧊','🍔','🍟','🍗','🍤','🍢','🍜','🍛','🍚','🍲','🍣','🍱','🥟','🦞','🍕','🥗','🌭','🥤','🍦','🌸','🧸','📿','💍','🌹','☁️','⚡'];

  function openFoodWish() {
    var chosen = '';
    var imgIcon = '';
    // 规格编辑状态：[{k,name},{k values:strings}]
    var specs = [ { k: '甜度', v: ['正常', '半糖', '无糖'] }, { k: '冰度', v: ['正常冰', '少冰', '去冰'] } ];

    function specBoxesHTML() {
      var html = '<div id="fwSpecs">';
      specs.forEach(function (s, i) {
        html += '<div class="sp-box" data-i="' + i + '">' +
          '<div class="sp-head"><input class="fw-k" value="' + esc(s.k) + '" placeholder="规格名，如甜度"/><button type="button" class="fd-del" data-del-spec="' + i + '">✕</button></div>' +
          '<input class="fw-v" value="' + esc(s.v.join('，')) + '" placeholder="选项，用顿号分隔，如 正常，半糖，无糖" style="width:100%;background:#fff;border:1px solid rgba(59,130,246,.3);border-radius:6px;padding:6px 8px;font-size:12px;color:#16325c;font-family:inherit;outline:none;margin-bottom:4px;" />' +
          '</div>';
      });
      html += '</div>';
      return html;
    }

    var ov = openModal(
      '<h3>✏️ 许愿点餐（上架到商城）</h3>' +
      '<div style="color:#4a6fa5;font-size:12px;margin-bottom:10px;">自定义一件商品上架到商城，TA 有机会为你下单送给你哦。</div>' +
      '<div class="ph-field"><label>商品名称</label><input type="text" id="fw-name" placeholder="例如：想吃的手工冰粉" /></div>' +
      '<div class="ph-field"><label>价格</label><input type="number" id="fw-price" min="1" placeholder="例如：38" /></div>' +
      '<div class="ph-field"><label>规格（可增减，选填）</label>' + specBoxesHTML() + '</div>' +
      '<div class="ph-field"><label>选择图标（emoji 或上传图片）</label>' +
      '<input type="file" id="fw-file" accept="image/*" style="display:none" />' +
      '<div class="wish-upload" id="fw-upload">📁 上传图片</div>' +
      '<div class="wish-preview" id="fw-prev"></div>' +
      '</div>' +
      '<div class="wish-emojis" id="fw-emo">' +
      FOOD_WISH_EMOJIS.map(function (e) { return '<span data-e="' + e + '">' + e + '</span>'; }).join('') +
      '</div>' +
      '<div class="ph-btns">' +
      '<button class="ph-btn primary" data-act="save">上架商品</button>' +
      '<button class="ph-btn" data-act="cancel">取消</button>' +
      '</div>'
    );
    // 动态增删规格
    function refreshSpecs() {
      ov.querySelector('#fwSpecs').outerHTML = specBoxesHTML();
      var box = ov.querySelector('#fwSpecs');
      box.addEventListener('click', function (e) {
        var d = e.target.closest('[data-del-spec]');
        if (!d) return;
        specs.splice(parseInt(d.dataset.delSpec, 10), 1);
        refreshSpecs();
      });
      box.querySelectorAll('.fw-k').forEach(function (inp, i) {
        inp.addEventListener('input', function () { specs[i].k = inp.value; });
      });
      box.querySelectorAll('.fw-v').forEach(function (inp, i) {
        inp.addEventListener('input', function () {
          specs[i].v = inp.value.split(/[，,]/).map(function (x) { return x.trim(); }).filter(Boolean);
        });
      });
    }
    var addSpecBtn = document.createElement('button');
    addSpecBtn.type = 'button';
    addSpecBtn.className = 'sp-add';
    addSpecBtn.textContent = '＋ 添加一种规格';
    ov.querySelector('#fwSpecs').after(addSpecBtn);
    addSpecBtn.addEventListener('click', function () {
      specs.push({ k: '新规格' + (specs.length + 1), v: ['选项A', '选项B'] });
      refreshSpecs();
    });
    refreshSpecs();
    // 图标
    ov.querySelector('#fw-emo').addEventListener('click', function (e) {
      var s = e.target.closest('[data-e]'); if (!s) return;
      chosen = s.dataset.e; imgIcon = '';
      ov.querySelectorAll('#fw-emo [data-e]').forEach(function (x) { x.classList.toggle('on', x === s); });
      ov.querySelector('#fw-prev').innerHTML = '<div class="wish-icon-preview">' + chosen + '</div>';
    });
    ov.querySelector('#fw-upload').addEventListener('click', function () { ov.querySelector('#fw-file').click(); });
    ov.querySelector('#fw-file').addEventListener('change', function () {
      var f = ov.querySelector('#fw-file').files && ov.querySelector('#fw-file').files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        compressImage(r.result, function (out) {
          imgIcon = out; chosen = '';
          ov.querySelectorAll('#fw-emo [data-e]').forEach(function (x) { x.classList.remove('on'); });
          ov.querySelector('#fw-prev').innerHTML = '<div class="wish-icon-preview"><img src="' + out + '" alt=""/></div>';
        });
      };
      r.readAsDataURL(f);
      ov.querySelector('#fw-file').value = '';
    });
    ov.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'cancel') { ov.remove(); return; }
      var name = (ov.querySelector('#fw-name').value || '').trim();
      var price = parseInt(ov.querySelector('#fw-price').value, 10);
      if (!name) { toast('请填写商品名称'); return; }
      if (!price || price < 1) { toast('请填写价格'); return; }
      var icon = imgIcon || chosen;
      if (!icon) { toast('请选择或上传图标'); return; }
      var opts = specs.filter(function (s) { return s.k && s.v && s.v.length; }).map(function (s) {
        return { k: s.k, v: s.v.slice(0, 12) };
      });
      var w = {
        id: 'fw' + Date.now() + Math.floor(Math.random() * 1000),
        name: name, price: price, icon: icon,
        desc: '许愿外卖商品，TA 有机会为你下单',
        cat: '我的许愿', custom: true, food: true, opts: opts
      };
      (S.shop.wishes = S.shop.wishes || []).push(w);
      saveShop();
      ov.remove();
      toast('已上架 ✏️ ' + name + '(可去商城查看)');
      var shopOv = root.querySelector('.shop-ov');
      if (shopOv) renderShopBody(shopOv.querySelector('#phShopBody'));
    });
  }

  /* ---------- 礼物留言系统 ---------- */
  var GIFT_NOTE_POOL = [
    '送你的，收好哦💝',
    '一眼就想到你了，给你带了一份',
    '希望你喜欢呀，顺便告诉你我一直想你',
    '今天突然很想你，就挑了这个小礼物',
    '礼轻情意重，收下我的心意吧',
    '记得想我五分钟哦😉',
    '猜猜这是不是你一直念叨的那份'
  ];
  var GIFT_REPLY_POOL = [
    '收到啦！！我这就拆开看看，谢谢宝💝',
    '哇，你这么有心，我感动到不行',
    '来啦～我猜到了你会送我，好开心',
    '看回复都说这是心意，我肯定好好珍藏',
    '收到你的留言，我更想你了',
    '我这就去看看，等我把开心也发给你'
  ];
  // 从"主字卡"池取一句：拼字卡开启时可能拼多条(也可能一条不拼→空)，否则随机取 1 条
  function cardText() {
    try {
      var puzOn = typeof window.puzzleCardEnabled === 'function' && window.puzzleCardEnabled();
      if (typeof window.composeGiftNote === 'function') {
        var composed = window.composeGiftNote(); // 仅开启时返回组合；未开启返回 ''
        if (composed) return composed;
      }
      // 未开启或没拼出 → 从主字卡池随机取 1 条
      var pool = (typeof window.getReplyCardPool === 'function') ? window.getReplyCardPool() : [];
      if (pool && pool.length) {
        return pool[Math.floor(Math.random() * pool.length)];
      }
    } catch (e) {}
    return '';
  }
  // 对方主动送的礼物/外卖留言：一律从主字卡调取（拼字卡开启→可能拼多条；否则单条）
  function giftNoteForPartner() {
    var t = cardText();
    return t || GIFT_NOTE_POOL[Math.floor(Math.random() * GIFT_NOTE_POOL.length)];
  }
  // 对方回复留言：同样从主字卡调取
  function replyFromPool() {
    var t = cardText();
    return t || GIFT_REPLY_POOL[Math.floor(Math.random() * GIFT_REPLY_POOL.length)];
  }
  // 我送他并留言时：送出后 5 分钟内，在"我送出的"页回复留言。
  // 每次随机回复 1~5 条，每条都从主字卡取（受拼字卡开关影响）；字卡取不到时兜底用默认文案，保证一定回复。
  function schedulePartnerReply(record) {
    try {
      record.replyPending = true;                    // 持久化"待回复"标记，刷新/重启后仍会补发
      record.replyEta = Date.now() + Math.random() * 5 * 60 * 1000; // 0~5 分钟内随机时刻回复
      saveShop(); saveFood();
      if (typeof window.phoneHome === 'object' && window.phoneHome.flushRecords) window.phoneHome.flushRecords();
    } catch (e) {}
  }
  // 全局 tick：扫描所有"待回复"的礼物/外卖记录，到期后写入回复并持久化
  function tickPartnerReplies(now) {
    try {
      var changed = false;
      function scan(list) {
        (list || []).forEach(function (g) {
          if (!g || g.reply) return;
          if (!g.note) return;
          if (typeof g.replyEta === 'number' && now < g.replyEta) return;
          var n = 1 + Math.floor(Math.random() * 5); // 1~5 条
          var replies = [];
          for (var i = 0; i < n; i++) {
            var t = cardText();
            replies.push(t || GIFT_REPLY_POOL[Math.floor(Math.random() * GIFT_REPLY_POOL.length)]);
          }
          g.reply = replies;       // 数组
          g.replyAt = now;
          g.replyPending = false;
          changed = true;
        });
      }
      scan(S.shop && S.shop.given);
      scan(S.food && S.food.given);
      if (changed) {
        saveShop(); saveFood();
        if (typeof window.phoneHome === 'object' && window.phoneHome.flushRecords) window.phoneHome.flushRecords();
      }
    } catch (e) {}
  }
  // save 保存级别 shop + food + moments（memory 持久化到 localStorage）
  function save() { saveShop(); saveFood(); }

  /* ---------- 朋友圈 ---------- */
  var LS_KEY_MOM = 'ph_moments';
  var LS_KEY_MOM_SET = 'ph_moments_settings';
  var MOM_EMOJIS = ['😄','😍','🥰','😋','🤔','😭','😌','🌹','🌸','💐','🌙','✨','⭐','☀️','🌈','☁️','🍀','🐱','🐶','🐰','🦋','🎂','🍰','🍓','🍉','🧋','☕','🍕','🍜','📸','🎨','🎧','🎵','📚','🏃','💪','🧸','💝','❤️','🧡','💙','🚗','🏠','🌊','🏔️','🍁','❄️'];

  function getMomSettings() {
    var d = lsGet(LS_KEY_MOM_SET, {});
    return {
      bg: d.bg || '',
      signature: d.signature || '记录美好生活',
      replyMin: Math.max(0, Math.min(10, parseInt(d.replyMin, 10) || 5)),   // 他回复我 0~10 分钟（默认 5）
      postMin: Math.max(0, Math.min(1440, parseInt(d.postMin, 10) || 0)),    // 他发布朋友圈速度 0~1440 分钟
      likers: Array.isArray(d.likers) ? d.likers : []   // 额外会点赞的人（每人 50% 概率）
    };
  }
  function saveMomSettings(s) { lsSet(LS_KEY_MOM_SET, s); }

  function getMomData() {
    var d = lsGet(LS_KEY_MOM, { posts: [], myPosts: [] });
    if (!Array.isArray(d.posts)) d.posts = [];
    if (!Array.isArray(d.myPosts)) d.myPosts = [];
    return d;
  }
  function saveMomData(d) { lsSet(LS_KEY_MOM, d); }

  function getMyNameMom() {
    try { if (typeof settings !== 'undefined' && settings.myName) return settings.myName; } catch (e) {}
    return '我';
  }
  function getMyAvatarMom() {
    try { var img = document.querySelector('#my-avatar img,.my-avatar img'); if (img && img.src) return img.src; } catch (e) {}
    return '';
  }
  function getPartnerAvatarMom() {
    try { var img = document.querySelector('#partner-avatar img,[id*="partner-avatar"] img,.partner-avatar img'); if (img && img.src) return img.src; } catch (e) {}
    return '';
  }

  // 统一从"主字卡"池取内容：拼字卡开启→可能拼多条；否则随机单条
  function momCardText() {
    try {
      if (typeof window.composeGiftNote === 'function') {
        var composed = window.composeGiftNote();
        if (composed) return composed;
      }
      var pool = (typeof window.getReplyCardPool === 'function') ? window.getReplyCardPool() : [];
      if (pool && pool.length) return pool[Math.floor(Math.random() * pool.length)];
    } catch (e) {}
    return '';
  }
  function momCardPool() {
    try { return (typeof window.getReplyCardPool === 'function') ? window.getReplyCardPool() : []; } catch (e) { return []; }
  }
  function momRandomMoment() {
    var t = momCardText();
    var emo = MOM_EMOJIS[Math.floor(Math.random() * MOM_EMOJIS.length)];
    return t || ('今天也过得很充实' + emo);
  }

  // 排序：最新在前
  function momAllPosts() {
    var d = getMomData();
    var mine = (d.myPosts || []).map(function (p) { p.from = 'me'; return p; });
    var theirs = (d.posts || []).map(function (p) { p.from = 'them'; return p; });
    return mine.concat(theirs).sort(function (a, b) { return b.ts - a.ts; });
  }

  function openMoments() {
    var ov = document.createElement('div');
    ov.className = 'mom-ov';
    ov.innerHTML =
      '<div class="mom-head" id="momHead" style="background-image:url({bg});">'.replace('{bg}', getMomSettings().bg || '') +
      '<div class="mom-head-top">' +
      '<span class="mom-title">朋友圈</span>' +
      '<div class="mom-topbtns">' +
      '<button class="mom-topbtn" id="momSettingsBtn" title="设置">⚙️</button>' +
      '<button class="mom-topbtn" id="momClose" title="关闭">✕</button>' +
      '</div>' +
      '</div>' +
      '<div class="mom-head-bottom">' +
      '<span class="mom-me">' + esc(getMyNameMom()) + '</span>' +
      '<span class="mom-avatar" id="momMeAvatar">' + (getMyAvatarMom() ? '' : '🙂') + '</span>' +
      '</div>' +
      '</div>' +
      '<div class="mom-body" id="momBody"></div>' +
      '<button class="mom-pub" id="momPublish" title="发布">＋</button>';
    root.appendChild(ov);

    // 头像
    var av = ov.querySelector('#momMeAvatar');
    var avSrc = getMyAvatarMom();
    if (avSrc) {
      av.innerHTML = '';
      var im = document.createElement('img');
      im.src = avSrc; im.className = 'mom-avatar'; im.style.cssText = 'width:46px;height:46px;border-radius:8px;object-fit:cover;border:2px solid #fff;';
      av.parentNode.insertBefore(im, av);
      av.style.display = 'none';
    }

    ov.querySelector('#momSettingsBtn').addEventListener('click', function () { openMomSettings(ov); });
    ov.querySelector('#momClose').addEventListener('click', function () { ov.remove(); });
    ov.querySelector('#momPublish').addEventListener('click', function () { openMomPublish(ov); });

    renderMoments(ov);
    // 检查是否有到期的"对方回复/发布"
    checkMomPending(ov);
  }

  function renderMoments(ov) {
    var body = ov.querySelector('#momBody');
    var list = momAllPosts();
    if (!list.length) {
      body.innerHTML = '<div style="color:#b2b2b2;font-size:13px;text-align:center;padding:60px 20px;">还没有动态<br>点击右下角发布第一条吧</div>';
      return;
    }
    body.innerHTML = list.map(function (p) {
      var mine = p.from === 'me';
      var name = mine ? getMyNameMom() : getPartnerName();
      var avSrc = mine ? getMyAvatarMom() : getPartnerAvatarMom();
      var sig = getMomSettings().signature;
      var sigHtml = (mine && sig) ? '<div style="font-size:12px;color:#999;margin-top:2px;">' + esc(sig) + '</div>' : '';
      var likes = Array.isArray(p.likes) ? p.likes : [];
      if (!likes.length && p.liked) likes = [getMyNameMom()]; // 兼容旧数据
      var likeHtml = '';
      if (likes.length) {
        var likeStr = likes.map(function (n) { return '<b data-act="like-badge">' + esc(n) + '</b>'; }).join('、');
        likeHtml = '<div class="mom-likes"><span class="like-icon">❤️</span> ' + likeStr + '</div>';
      }
      var cmtHtml = '';
      var cmts = (p.comments || []).filter(function (c) { return c && c.text; });
      if (cmts.length) {
        cmtHtml = '<div class="mom-cmts">' + cmts.map(function (c) {
          var cn = c.from === 'me' ? getMyNameMom() : getPartnerName();
          // 被回复对象：replyTo 记录的是被回复者身份
          var toName = null;
          if (c.replyTo === 'me') toName = getMyNameMom();
          else if (c.replyTo === 'them') toName = getPartnerName();
          return '<div class="mom-cmt">' +
            '<b data-act="reply-cmt" data-post="' + p.id + '" data-cid="' + c.id + '">' + esc(cn) + '</b>' +
            (toName ? '<span class="to"> 回复 ' + esc(toName) + '</span>' : '') +
            '<span class="reply">：' + esc(c.text) + '</span></div>';
        }).join('') + '</div>';
      }
      return '<div class="mom-item" data-post="' + p.id + '">' +
        '<span class="mom-av">' + (avSrc ? '<img src="' + esc(avSrc) + '" style="width:38px;height:38px;object-fit:cover;display:block;" />' : (mine ? '🙂' : '😊')) + '</span>' +
        '<div class="mom-content">' +
        '<div class="mom-name">' + esc(name) + '</div>' +
        (mine ? sigHtml : '') +
        '<div class="mom-text">' + esc(p.text || '') + '</div>' +
        (p.img ? '<img class="mom-img" src="' + esc(p.img) + '" />' : '') +
        '<div class="mom-time">' + fmtDate(p.ts) +
        '<span class="mom-actions" data-act="comment" data-post="' + p.id + '">💬 评论</span>' +
        '<span class="mom-actions" data-act="like" data-post="' + p.id + '">' + (likes.indexOf(getMyNameMom()) !== -1 ? '❤️' : '🤍') + '</span>' +
        '</div>' + likeHtml + cmtHtml +
        '</div>' +
        '</div>';
    }).join('');

    body.querySelectorAll('[data-act="comment"]').forEach(function (el) {
      el.addEventListener('click', function () { openMomComment(ov, el.dataset.post); });
    });
    body.querySelectorAll('[data-act="reply-cmt"]').forEach(function (el) {
      el.addEventListener('click', function () { openMomReply(ov, el.dataset.post, el.dataset.cid); });
    });
    body.querySelectorAll('[data-act="like"]').forEach(function (el) {
      el.addEventListener('click', function () {
        toggleMomLike(el.dataset.post);
        renderMoments(ov);
      });
    });
  }

  function toggleMomLike(postId) {
    var d = getMomData();
    var myName = getMyNameMom();
    ['posts', 'myPosts'].forEach(function (k) {
      (d[k] || []).forEach(function (p) {
        if (String(p.id) === String(postId)) {
          p.likes = Array.isArray(p.likes) ? p.likes : [];
          var i = p.likes.indexOf(myName);
          if (i >= 0) p.likes.splice(i, 1); else p.likes.push(myName);
          p.liked = p.likes.length > 0;
        }
      });
    });
    saveMomData(d);
  }

  // 发布我的朋友圈后：随机抽取点赞人（聊天对象 80%，其他设定人每人 50%），延迟浮现
  var MOM_LIKE_PEND_KEY = 'ph_mom_like_pending';
  function loadMomLikePending() { try { var a = lsGet(MOM_LIKE_PEND_KEY, []); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function saveMomLikePending() { try { lsSet(MOM_LIKE_PEND_KEY, momLikePending); } catch (e) {} }
  var momLikePending = loadMomLikePending();

  function scheduleMomLikesForPost(post, ov) {
    try {
      var st = getMomSettings();
      var likers = [];
      if (Math.random() < 0.8) likers.push(getPartnerName());                 // 聊天对象 80%
      (st.likers || []).forEach(function (n) {
        if (Math.random() < 0.5) likers.push(String(n));                       // 其他设定者每人 50%
      });
      if (!likers.length) return;                                            // 可能无人点赞
      var eta = Date.now() + 800 + Math.random() * 5000;                    // 3~6 秒左右浮现，模拟真实
      momLikePending.push({ postId: String(post.id), likers: likers, eta: eta });
      saveMomLikePending();
    } catch (e) {}
  }

  // 到期的点赞写入对应动态
  function tickMomLikes(now) {
    try {
      if (!momLikePending.length) return;
      var remain = [];
      var changed = false;
      var d = getMomData();
      momLikePending.forEach(function (p) {
        if (now < p.eta) { remain.push(p); return; }
        var found = null;
        ['posts', 'myPosts'].forEach(function (k) {
          (d[k] || []).forEach(function (post) { if (String(post.id) === String(p.postId)) found = post; });
        });
        if (found) {
          found.likes = Array.isArray(found.likes) ? found.likes : [];
          var dedup = {};
          (found.likes || []).forEach(function (n) { dedup[n] = true; });
          (p.likers || []).forEach(function (n) { if (!dedup[n]) { dedup[n] = true; found.likes.push(n); } });
          found.liked = found.likes.length > 0;
          changed = true;
        }
      });
      momLikePending = remain;
      if (changed) {
        saveMomData(d);
        saveMomLikePending();
        try {
          var momOv = root && root.querySelector('.mom-ov');
          if (momOv && momOv.isConnected) renderMoments(momOv);
        } catch (e) {}
      }
    } catch (e) {}
  }

  // 发布输入弹窗
  function openMomPublish(ov) {
    var pm = document.createElement('div');
    pm.className = 'ph-ov';
    pm.style.zIndex = 30;
    pm.innerHTML =
      '<div class="ph-modal">' +
      '<h3>📝 发布朋友圈</h3>' +
      '<div class="ph-field"><textarea id="momPubText" style="background:#f4f8ff;border:1px solid rgba(59,130,246,.32);border-radius:8px;padding:8px 10px;font-size:13px;color:#16325c;font-family:inherit;outline:none;height:80px;resize:none;"></textarea></div>' +
      '<div class="ph-field"><label>配图（选填）</label>' +
      '<input type="file" id="momPubImg" accept="image/*" /></div>' +
      '<div class="ph-btns">' +
      '<button class="ph-btn" data-act="cancel" style="background:#eef3fb;color:#5a7ba8;">取消</button>' +
      '<button class="ph-btn primary" data-act="ok">发布</button>' +
      '</div></div>';
    root.appendChild(pm);
    var imgVal = '';
    pm.querySelector('#momPubImg').addEventListener('change', function () {
      var f = this.files && this.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function (e) { imgVal = e.target.result; };
      r.readAsDataURL(f);
    });
    pm.querySelector('[data-act="cancel"]').addEventListener('click', function () { pm.remove(); });
    pm.querySelector('[data-act="ok"]').addEventListener('click', function () {
      var text = pm.querySelector('#momPubText').value.trim();
      if (!text) { toast('写点什么再发布吧'); return; }
      var d = getMomData();
      d.myPosts = d.myPosts || [];
      d.myPosts.push({ id: 'm' + Date.now() + Math.random().toString(16).slice(2, 6), text: text, img: imgVal || null, ts: Date.now(), comments: [], from: 'me' });
      saveMomData(d);
      pm.remove();
      renderMoments(ov);
      toast('已发布');
      // 发布后，对方会按设定速度回复
      scheduleMomReplyToMe(d.myPosts[d.myPosts.length - 1], ov);
      // 发布后，随机抽取点赞（聊天对象80% / 其他设定者每人50%），延迟浮现
      scheduleMomLikesForPost(d.myPosts[d.myPosts.length - 1], ov);
    });
    pm.addEventListener('click', function (e) { if (e.target === pm) pm.remove(); });
  }

  // 我评论他的朋友圈，或回复评论
  function openMomComment(ov, postId) { openMomCmtInput(ov, postId, null, 'comment'); }
  function openMomReply(ov, postId, cid) { openMomCmtInput(ov, postId, cid, 'reply'); }
  function openMomCmtInput(ov, postId, cid, mode) {
    var p = document.createElement('div');
    p.className = 'ph-ov';
    p.style.zIndex = 30;
    p.innerHTML =
      '<div class="ph-modal">' +
      '<h3>' + (mode === 'reply' ? '回复评论' : '发表评论') + '</h3>' +
      '<div class="ph-field"><input id="momCmtText" placeholder="说点什么…" /></div>' +
      '<div class="ph-btns">' +
      '<button class="ph-btn" data-act="cancel" style="background:#eef3fb;color:#5a7ba8;">取消</button>' +
      '<button class="ph-btn primary" data-act="ok">发送</button>' +
      '</div></div>';
    root.appendChild(p);
    p.querySelector('[data-act="cancel"]').addEventListener('click', function () { p.remove(); });
    p.querySelector('[data-act="ok"]').addEventListener('click', function () {
      var text = p.querySelector('#momCmtText').value.trim();
      if (!text) { toast('写点内容吧'); return; }
      var d = getMomData();
      var target = null;
      ['posts', 'myPosts'].forEach(function (k) {
        (d[k] || []).forEach(function (post) {
          if (String(post.id) === String(postId)) target = post;
        });
      });
      if (!target) { p.remove(); return; }
      target.comments = target.comments || [];
      // 回复场景：replyTo 记录被回复者的身份（me=回复我的，them=回复TA的）
      var replyToWho = null;
      if (mode === 'reply' && cid) {
        var src = (target.comments || []).find(function (x) { return String(x.id) === String(cid); });
        if (src) replyToWho = src.from === 'me' ? 'me' : 'them';
      }
      target.comments.push({ id: 'c' + Date.now() + Math.random().toString(16).slice(2, 6), from: 'me', text: text, ts: Date.now(), replyTo: replyToWho });
      saveMomData(d);
      p.remove();
      renderMoments(ov);
      // 我的评论，对方有几率回复
      if (mode === 'comment' && target.from === 'them') scheduleMomReplyToComment(target, target.comments[target.comments.length - 1], ov);
      else if (mode === 'reply') scheduleMomReplyToComment(target, target.comments[target.comments.length - 1], ov);
    });
    p.addEventListener('click', function (e) { if (e.target === p) p.remove(); });
  }

  // 对方回复我发布的动态
  function scheduleMomReplyToMe(post, ov) {
    try {
      var st = getMomSettings();
      if (st.replyMin < 1) return; // 0=不回复
      momPending.push({ postId: String(post.id), eta: Date.now() + Math.random() * st.replyMin * 60 * 1000, isMe: true });
      saveMomPending();
    } catch (e) {}
  }

  // 我的评论/回复，对方有几率回复（剩余 50% 概率放弃；持久化待回复队列，刷新不丢失）
  function scheduleMomReplyToComment(target, myComment, ov) {
    if (Math.random() > 0.5) return; // 有几率
    try {
      var st = getMomSettings();
      if (st.replyMin < 1) return; // 0=不回复
      momPending.push({ postId: String(target.id), eta: Date.now() + Math.random() * st.replyMin * 60 * 1000, isMe: false });
      saveMomPending();
    } catch (e) {}
  }
  // 待回复队列存储
  var MOM_PENDING_KEY = 'ph_mom_pending';
  function loadMomPending() { try { var a = lsGet(MOM_PENDING_KEY, []); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function saveMomPending() { try { lsSet(MOM_PENDING_KEY, momPending); } catch (e) {} }
  // 全局 tick：扫描待回复，到期后写入对方回复并持久化
  function tickMomReplies(now) {
    try {
      if (!momPending.length) return;
      var remain = [];
      var changed = false;
      var d = getMomData();
      momPending.forEach(function (p) {
        if (now < p.eta) { remain.push(p); return; }
        var found = null;
        ['posts', 'myPosts'].forEach(function (k) {
          (d[k] || []).forEach(function (post) { if (String(post.id) === String(p.postId)) found = post; });
        });
        if (found) {
          found.comments = found.comments || [];
          var reply = p.isMe
            ? (momCardText() || '看到啦！我也很喜欢 💕')
            : (momCardText() || '嗯嗯，我也这么觉得 😊');
          found.comments.push({ id: 'c' + Date.now() + Math.random().toString(16).slice(2, 6), from: 'them', text: reply, ts: now, replyTo: 'me' });
          changed = true;
        }
      });
      momPending = remain;
      if (changed) {
        saveMomData(d);
        saveMomPending();
        try {
          var momOv = root && root.querySelector('.mom-ov');
          if (momOv && momOv.isConnected) renderMoments(momOv);
        } catch (e) {}
      }
    } catch (e) {}
  }

  // 对方发布朋友圈（定时，基于下次发布时间戳，避免多次打开堆积定时器）
  var MOM_NEXT_POST_KEY = 'ph_mom_next_post_ts';
  function scheduleMomPostFromPartner(ov) {
    try {
      var st = getMomSettings();
      if (!st.postMin || st.postMin < 1) return;
      var now = Date.now();
      var next = parseInt(lsGet(MOM_NEXT_POST_KEY, 0), 10) || 0;
      if (next > now) {
        // 已有排程：等它到时
        setTimeout(function () { doMomPartnerPost(ov); }, next - now);
        return;
      }
      doMomPartnerPost(ov);
    } catch (e) {}
  }
  function doMomPartnerPost(ov) {
    try {
      var st = getMomSettings();
      var d = getMomData();
      d.posts = d.posts || [];
      d.posts.push({ id: 'p' + Date.now() + Math.random().toString(16).slice(2, 6), text: momRandomMoment(), ts: Date.now(), comments: [], from: 'them' });
      saveMomData(d);
      if (ov && ov.isConnected) renderMoments(ov);
      // 排下一次发布
      var nextGap = Math.random() * Math.max(1, st.postMin) * 60 * 1000;
      var nextTs = Date.now() + nextGap;
      lsSet(MOM_NEXT_POST_KEY, nextTs);
      setTimeout(function () { doMomPartnerPost(ov); }, nextGap);
    } catch (e) {}
  }

  // 打开时：为已发布尚未被对方回复/已到期处理
  function checkMomPending(ov) {
    scheduleMomPostFromPartner(ov);
  }

  // 朋友圈设置
  function openMomSettings(ov) {
    var st = getMomSettings();
    var s = document.createElement('div');
    s.className = 'ph-ov';
    s.style.zIndex = 30;
    s.innerHTML =
      '<div class="ph-modal">' +
      '<h3>⚙️ 朋友圈设置</h3>' +
      '<div class="ph-field"><label>背景图片（选填）</label>' +
      '<input type="file" id="momSetBg" accept="image/*" /></div>' +
      '<div class="ph-field"><label>签名</label>' +
      '<input id="momSetSig" value="' + esc(st.signature) + '" /></div>' +
      '<div class="ph-field"><label>TA 回复我动态速度（分钟）</label>' +
      '<input type="range" id="momSetReply" min="0" max="10" step="1" value="' + st.replyMin + '" style="width:100%;accent-color:#3f9d3f;" />' +
      '<div style="display:flex;justify-content:space-between;font-size:11px;color:#4a6fa5;"><span>0（不回复）</span><span id="momSetReplyV">' + st.replyMin + ' 分钟</span></div></div>' +
      '<div class="ph-field"><label>TA 发布朋友圈速度（分钟）</label>' +
      '<input type="range" id="momSetPost" min="0" max="1440" step="1" value="' + st.postMin + '" style="width:100%;accent-color:#3f9d3f;" />' +
      '<div style="display:flex;justify-content:space-between;font-size:11px;color:#4a6fa5;"><span>0（不发布）</span><span id="momSetPostV">' + st.postMin + ' 分钟</span></div></div>' +
      '<div class="ph-field" style="font-size:11px;color:#8b94bf;">头像和名字跟随聊天设置；TA 的内容来自回复库「主字卡」，并受拼字卡开关影响。</div>' +
      '<div class="ph-field"><label style="font-weight:700;">👍 点赞设置</label>' +
      '<div style="font-size:11px;color:#8b94bf;margin-bottom:6px;">你发布朋友圈后，TA 有 80% 概率点赞；下方设置的人，每人 50% 概率点赞（可能无人点赞）。</div>' +
      '<div id="momLikers"><div style="font-size:12px;color:#4a6fa5;margin-bottom:4px;">TA 必在其中</div></div>' +
      '<div style="display:flex;gap:6px;margin-top:6px;">' +
      '<input id="momLikerAdd" placeholder="添加会点赞的人名" style="flex:1;border:1px solid rgba(59,130,246,.3);border-radius:8px;padding:8px 10px;font-size:13px;color:#16325c;font-family:inherit;" />' +
      '<button class="ph-btn primary" data-act="add-liker" type="button" style="padding:6px 12px;">＋</button></div></div>' +
      '<div class="ph-btns">' +
      '<button class="ph-btn" data-act="cancel" style="background:#eef3fb;color:#5a7ba8;">取消</button>' +
      '<button class="ph-btn primary" data-act="ok">保存</button>' +
      '</div></div>';
    root.appendChild(s);

    var bgVal = st.bg;
    var likers = st.likers.slice();

    function renderLikers() {
      var box = s.querySelector('#momLikers');
      box.innerHTML = '<div style="font-size:12px;color:#4a6fa5;margin-bottom:4px;">TA 必在其中</div>' +
        (likers.length ? likers.map(function (n, i) {
          return '<div class="ph-li" style="margin:2px 0;padding:4px 6px;"><span class="name">👤 ' + esc(n) + '</span><span class="act"><button class="ph-mini danger" data-del-liker="' + i + '" type="button">删除</button></span></div>';
        }).join('') : '<div style="font-size:12px;color:#8b94bf;">暂无其他设定的人</div>');
    }
    renderLikers();
    s.querySelector('#momLikers').addEventListener('click', function (e) {
      var del = e.target.closest('[data-del-liker]');
      if (!del) return;
      likers.splice(parseInt(del.dataset.delLiker, 10), 1);
      renderLikers();
    });
    s.querySelector('[data-act="add-liker"]').addEventListener('click', function () {
      var v = s.querySelector('#momLikerAdd').value.trim();
      if (!v) { toast('请输入人名'); return; }
      if (likers.indexOf(v) !== -1) { toast('这个人已在列表中'); return; }
      likers.push(v);
      s.querySelector('#momLikerAdd').value = '';
      renderLikers();
    });
    s.querySelector('#momLikerAdd').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); s.querySelector('[data-act="add-liker"]').click(); }
    });
    s.querySelector('#momSetBg').addEventListener('change', function () {
      var f = this.files && this.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function (e) { bgVal = e.target.result; };
      r.readAsDataURL(f);
    });
    s.querySelector('#momSetReply').addEventListener('input', function () {
      s.querySelector('#momSetReplyV').textContent = this.value + ' 分钟';
    });
    s.querySelector('#momSetPost').addEventListener('input', function () {
      s.querySelector('#momSetPostV').textContent = this.value + ' 分钟';
    });
    s.querySelector('[data-act="cancel"]').addEventListener('click', function () { s.remove(); });
    s.querySelector('[data-act="ok"]').addEventListener('click', function () {
      var sig = s.querySelector('#momSetSig').value.trim();
      var ns = {
        bg: bgVal,
        signature: sig || '记录美好生活',
        replyMin: parseInt(s.querySelector('#momSetReply').value, 10) || 0,
        postMin: parseInt(s.querySelector('#momSetPost').value, 10) || 0,
        likers: likers
      };
      saveMomSettings(ns);
      s.remove();
      if (ov && ov.isConnected) {
        ov.querySelector('#momHead').style.backgroundImage = ns.bg ? 'url(' + ns.bg + ')' : '';
        renderMoments(ov);
      }
      toast('朋友圈设置已保存');
    });
    s.addEventListener('click', function (e) { if (e.target === s) s.remove(); });
  }

  /* ---------- 图标美化 ---------- */
  var LS_KEY_ICONS = 'ph_icons';
  // 可美化的主屏按钮：id / 名称 / 图标容器 id
  var BEAUTY_TARGETS = [
    { key: 'chat',    name: '聊天',   elId: 'phChatIcon' },
    { key: 'shop',    name: '商城',   elId: 'phShopIcon' },
    { key: 'food',    name: '外卖',   elId: 'phFoodIcon' },
    { key: 'moments', name: '朋友圈', elId: 'phMomIcon' },
    { key: 'alipay',  name: '支付宝', elId: 'phAlipayIcon' },
    { key: 'beauty',  name: '图标美化', elId: 'phBeautyIcon' }
  ];
  function getBeautyIcons() { return lsGet(LS_KEY_ICONS, {}); }
  function saveBeautyIcons(map) { lsSet(LS_KEY_ICONS, map); }
  // 把已保存的自定义图标应用到 dock（构建后调用）
  function applyBeautyIcons() {
    try {
      if (!root) return;
      var map = getBeautyIcons();
      BEAUTY_TARGETS.forEach(function (t) {
        var src = map[t.key];
        if (!src) return;
        var el = document.getElementById(t.elId);
        if (!el) return;
        el.innerHTML = '<img src="' + src + '" alt=""/>';
      });
    } catch (e) {}
  }
  function openIconBeauty() {
    var map = getBeautyIcons();
    var b = document.createElement('div');
    b.className = 'ph-ov';
    b.style.zIndex = 30;
    b.innerHTML =
      '<div class="ph-modal">' +
      '<h3>🎨 图标美化</h3>' +
      '<div style="font-size:12px;color:#4a6fa5;margin-bottom:12px;">为「聊天」「商城」「外卖」「朋友圈」「支付宝」上传自定义图标，或恢复默认。</div>' +
      BEAUTY_TARGETS.map(function (t) {
        return '<div class="ph-li" style="display:flex;align-items:center;gap:10px;">' +
          '<span class="wx-avatar" style="width:40px;height:40px;border-radius:10px;flex:0 0 auto;" id="beautyPrev-' + t.key + '">' +
          (map[t.key] ? '<img src="' + map[t.key] + '" alt=""/>' : '') +
          '</span>' +
          '<span class="name" style="flex:1;color:#16325c;font-size:13px;font-weight:600;">' + t.name + '</span>' +
          '<input type="file" accept="image/*" style="display:none;" id="beautyFile-' + t.key + '" />' +
          '<button class="ph-mini primary" data-pick="' + t.key + '">上传</button>' +
          (map[t.key] ? '<button class="ph-mini danger" data-reset="' + t.key + '">恢复</button>' : '') +
          '</div>';
      }).join('') +
      '<div class="ph-btns">' +
      '<button class="ph-btn" data-act="done" style="background:#eef3fb;color:#5a7ba8;">完成</button>' +
      '</div></div>';
    root.appendChild(b);

    // 上传
    BEAUTY_TARGETS.forEach(function (t) {
      var pickBtn = b.querySelector('[data-pick="' + t.key + '"]');
      var fileInp = b.querySelector('#beautyFile-' + t.key);
      pickBtn.addEventListener('click', function () { fileInp.click(); });
      fileInp.addEventListener('change', function () {
        var f = this.files && this.files[0]; if (!f) return;
        var r = new FileReader();
        r.onload = function (e) {
          var src = e.target.result;
          map[t.key] = src;
          saveBeautyIcons(map);
          applyBeautyIcons();
          // 刷新预览
          var prev = b.querySelector('#beautyPrev-' + t.key);
          prev.innerHTML = '<img src="' + src + '" alt=""/>';
          // 出现"恢复"按钮
          var resetWrap = b.querySelector('[data-reset="' + t.key + '"]');
          if (!resetWrap) {
            var resetBtn = document.createElement('button');
            resetBtn.className = 'ph-mini danger';
            resetBtn.textContent = '恢复';
            resetBtn.dataset.reset = t.key;
            resetBtn.addEventListener('click', function () {
              delete map[t.key];
              saveBeautyIcons(map);
              applyBeautyIcons();
              var p = b.querySelector('#beautyPrev-' + t.key);
              p.innerHTML = '';
              resetBtn.remove();
            });
            pickBtn.parentNode.appendChild(resetBtn);
          }
        };
        r.readAsDataURL(f);
      });
    });
    // 恢复
    b.querySelectorAll('[data-reset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.reset;
        delete map[key];
        saveBeautyIcons(map);
        applyBeautyIcons();
        b.querySelector('#beautyPrev-' + key).innerHTML = '';
        btn.remove();
      });
    });
    b.querySelector('[data-act="done"]').addEventListener('click', function () { b.remove(); });
    b.addEventListener('click', function (e) { if (e.target === b) b.remove(); });
  }

  /* ---------- 余额钱包 ---------- */
  var LS_KEY_WALLET = 'ph_wallet';
  // 钱包结构：{ mine: 余额, theirs: 余额 }
  function getWallet() {
    var w = lsGet(LS_KEY_WALLET, {});
    var mine = Number(w.mine);
    var theirs = Number(w.theirs);
    if (isNaN(mine)) mine = 5000;
    if (isNaN(theirs)) theirs = 5000;
    return { mine: mine, theirs: theirs };
  }
  function saveWallet(w) { lsSet(LS_KEY_WALLET, { mine: Number(w.mine) || 0, theirs: Number(w.theirs) || 0 }); }
  // 全局暴露给聊天(红包)等使用
  window.phoneWallet = {
    get: getWallet,
    save: saveWallet,
    setMine: function (v) { var w = getWallet(); w.mine = Number(v) || 0; saveWallet(w); return w.mine; },
    setTheirs: function (v) { var w = getWallet(); w.theirs = Number(v) || 0; saveWallet(w); return w.theirs; },
    // 转账：退回金额扣款前先检查，保证余额不为负。失败返回 false，成功返回 true
    payMine: function (amt) { var w = getWallet(); amt = Number(amt) || 0; if (amt > w.mine + 0.0001) return false; w.mine = w.mine - amt; saveWallet(w); return true; },
    payTheirs: function (amt) { var w = getWallet(); amt = Number(amt) || 0; if (amt > w.theirs + 0.0001) return false; w.theirs = w.theirs - amt; saveWallet(w); return true; },
    addMine: function (amt) { var w = getWallet(); w.mine += Number(amt) || 0; saveWallet(w); return w.mine; },
    addTheirs: function (amt) { var w = getWallet(); w.theirs += Number(amt) || 0; saveWallet(w); return w.theirs; }
  };
  // 从支付宝余额扣除"我"的金额（商城/外卖购买）
  function walletTryPayMine(price) {
    var ok = window.phoneWallet && window.phoneWallet.payMine(price);
    if (!ok) { toast('余额不足！请先在支付宝修改余额'); return false; }
    return true;
  }
  // 扣除 TA 的余额（TA 赠送/购买时模拟扣 TA 的钱）
  function walletPayTheirs(price) {
    if (window.phoneWallet) window.phoneWallet.payTheirs(price);
  }

/* ---------- 支付宝余额页 ---------- */
  function openAlipay() {
    var w = getWallet();
    var myName = (typeof settings !== 'undefined' && settings.myName) || '我';
    var myAvatar = phAvatarFor('me');
    var pAvatar = phAvatarFor('partner');
    var ov = document.createElement('div');
    ov.className = 'ali-ov';
    ov.innerHTML =
      '<div class="ali-top">' +
      '<span class="ali-title">支付宝</span>' +
      '<button class="ali-topbtn" id="aliClose">✕</button>' +
      '</div>' +
      '<div class="ali-cards">' +
      '<div class="ali-card" data-ed="mine">' +
      '<div class="ali-logo" style="background:linear-gradient(145deg,#4c86ff,#1f66d8);">' + avatarHtml(myAvatar, '👤') + '</div>' +
      '<div style="flex:1;"><div class="ali-name">' + esc(myName) + '（余额）</div>' +
      '<div class="ali-amt">¥ ' + (w.mine % 1 === 0 ? w.mine : w.mine.toFixed(2)) + '</div></div>' +
      '<span style="color:#8b94bf;font-size:11px;">点击修改</span>' +
      '</div>' +
      '<div class="ali-card" data-ed="theirs">' +
      '<div class="ali-logo" style="background:linear-gradient(135deg,#ff9a3d,#ff6b3d);">' + avatarHtml(pAvatar, '💗') + '</div>' +
      '<div style="flex:1;"><div class="ali-name">' + esc(getPartnerName()) + ' 的余额</div>' +
      '<div class="ali-amt">¥ ' + (w.theirs % 1 === 0 ? w.theirs : w.theirs.toFixed(2)) + '</div></div>' +
      '<span style="color:#8b94bf;font-size:11px;">点击修改</span>' +
      '</div>' +
      '</div>' +
      '<div class="ali-hint">余额受「商城」「外卖」消费和红包收发影响，点击数字可自行修改（无上限）。</div>';
    root.appendChild(ov);
    ov.querySelector('#aliClose').addEventListener('click', function () { ov.remove(); });
    ov.querySelectorAll('[data-ed]').forEach(function (card) {
      card.addEventListener('click', function () {
        var who = card.dataset.ed;
        var cur = who === 'mine' ? getWallet().mine : getWallet().theirs;
        var val = prompt('修改' + (who === 'mine' ? myName : getPartnerName() + '的') + '余额（可带两位小数）：', cur);
        if (val === null) return;
        var n = Number(String(val).trim());
        if (isNaN(n) || n < 0) { toast('请输入有效金额'); return; }
        if (who === 'mine') window.phoneWallet.setMine(n); else window.phoneWallet.setTheirs(n);
        ov.remove();
        openAlipay();
      });
    });
  }

  // 取聊天页的头像（优先内存缓存，其次 DOM 的 img.src），返回 '' 表示用默认 emoji
  function phAvatarFor(who) {
    try {
      if (window._avatarCache) {
        var s = who === 'me' ? window._avatarCache.me : window._avatarCache.partner;
        if (s) return s;
      }
      var img = document.querySelector(who === 'me' ? '#me-avatar img,#my-avatar img' : '#partner-avatar img');
      if (img && img.src && img.src.indexOf('data:') === 0) return img.src;
      if (img && img.src && img.naturalWidth) return img.src;
    } catch (e) {}
    return '';
  }
  function avatarHtml(src, fallback) {
    return src ? '<img src="' + src + '" style="width:44px;height:44px;border-radius:12px;object-fit:cover;" alt=""/>' : fallback;
  }

  /* ---------- 公共接口 ---------- */
  window.phoneHome = {
    show: function () { loadData(); buildDOM(); if (!root) return; root.classList.remove('hidden'); slotTick = setInterval(function(){ var n = Date.now(); tickPartnerReplies(n); tickMomReplies(n); tickMomLikes(n); maybePartnerFoodGift(); }, 2000); renderClock(); renderCountdown(); renderCalendar(); bindEvents(); applyBeautyIcons(); setInterval(renderClock, 1000); maybeGiftFromPartner(); maybeCartGiftFromPartner(); maybePartnerFoodGift(); scheduleMomPostFromPartner(null); },
    hide: function () { if (root) root.classList.add('hidden'); },
    enterChat: enterChat,
    openManager: openAnnManager,
    flushRecords: function () {
      // 供定时器/回复完成后刷新当前打开的礼物柜或外卖记录
      try {
        var shopOv = root && root.querySelector('.shop-ov');
        if (shopOv && shopOv.isConnected && shopTab === 'cab') renderShopBody(shopOv.querySelector('#phShopBody'));
        var fdOv = root && root.querySelector('.fd-ov');
        if (fdOv && fdOv.isConnected) renderFoodBody(fdOv, 'menu');
      } catch (e) {}
    }
  };

  /* ---------- 启动（覆盖应用，直到进入聊天） ---------- */
  function boot() {
    loadData();
    buildDOM();
    bindEvents();
    renderClock();
    renderCountdown();
    renderCalendar();
    applyBeautyIcons();
    setInterval(renderClock, 1000);
    momPending = loadMomPending();
    momLikePending = loadMomLikePending();
    slotTick = setInterval(function(){ var n = Date.now(); tickPartnerReplies(n); tickMomReplies(n); tickMomLikes(n); maybePartnerFoodGift(); }, 2000);
    tickPartnerReplies(Date.now());
    tickMomReplies(Date.now());
    tickMomLikes(Date.now());
    maybePartnerFoodGift();
    scheduleMomPostFromPartner(null);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();