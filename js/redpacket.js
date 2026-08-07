/* 红包功能：发红包 / 开红包 / 退回 / 对方领取 */
(function () {
  if (typeof window === 'undefined') return;

  var MAX_AMOUNT = 10000;

  /* ---------- 样式 ---------- */
  if (!document.getElementById('rp-style')) {
    var style = document.createElement('style');
    style.id = 'rp-style';
    style.textContent =
      '.redpacket-card{position:relative;background:linear-gradient(145deg,#ff5a50 0%,#e63d3f 55%,#b82c1f 100%);'
      + 'border:1px solid #a72014;border-radius:14px;padding:10px 14px;margin:4px 0;cursor:pointer;color:#fff;'
      + 'box-shadow:0 3px 12px rgba(150,30,20,.35), inset 0 1px 0 rgba(255,255,255,.25);transition:transform .15s;overflow:hidden;}'
      + '.redpacket-card::before{content:"";position:absolute;inset:0;pointer-events:none;'
      + 'background:repeating-linear-gradient(90deg,transparent 0 66px,rgba(150,25,10,.12) 66px 74px);}'
      + '.redpacket-card:hover{transform:translateY(-1px);}'
      + '.redpacket-card.pending{box-shadow:0 3px 14px rgba(240,180,90,.5), inset 0 1px 0 rgba(255,255,255,.25);}'
      + '.redpacket-card.claimed, .redpacket-card.returned{filter:saturate(.35);opacity:.85;}'
      + '.rp-head{font-size:12px;font-weight:700;color:#ffe08a;display:flex;align-items:center;gap:6px;position:relative;z-index:1;}'
      + '.rp-head .fa-envelope{color:#ffe08a;}'
      + '.rp-seal{width:34px;height:34px;border-radius:50%;flex:0 0 auto;'
      + 'background:radial-gradient(circle at 30% 25%,#ffe9a8,#f0b64a 72%);color:#a81d0f;font-size:18px;'
      + 'display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.45);}'
      + '.rp-body{display:flex;align-items:flex-end;gap:8px;margin-top:4px;position:relative;z-index:1;}'
      + '.rp-amt{font-size:24px;font-weight:800;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.25);}'
      + '.rp-state{font-size:11px;color:#ffdcd6;}'
      + '.rp-bless{font-size:11px;color:#ffe6df;margin-top:2px;position:relative;z-index:1;}'

      + '.rp-ov{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.62);display:flex;align-items:center;justify-content:center;padding:16px;}'
      + '.rp-modal{background:#1b1b1b;border-radius:16px;max-width:320px;width:100%;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.55);animation:rpPop .22s ease;}'
      + '@keyframes rpPop{from{transform:scale(.85);opacity:0;}to{transform:scale(1);opacity:1;}}'
      + '.rp-modal-top{background:linear-gradient(145deg,#ff5a50 0%,#e63d3f 55%,#b3231f 100%);color:#fff;padding:20px;text-align:center;position:relative;}'
      + '.rp-modal-top::before{content:"";position:absolute;inset:0;pointer-events:none;'
      + 'background:repeating-linear-gradient(90deg,transparent 0 72px,rgba(150,25,10,.1) 72px 82px);}'
      + '.rp-modal-top .rp-title{font-size:16px;font-weight:700;color:#ffe08a;position:relative;z-index:1;}'
      + '.rp-modal-top .rp-sub{font-size:11px;color:#ffe6e2;margin-top:3px;position:relative;z-index:1;}'
      + '.rp-modal-top .rp-seal-lg{width:64px;height:64px;border-radius:50%;margin:12px auto 8px;position:relative;z-index:1;'
      + 'background:radial-gradient(circle at 30% 25%,#ffe9a8,#f0b64a 72%);color:#b3231f;font-size:28px;'
      + 'display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.5);}'
      + '.rp-modal-top .rp-amt-top{font-size:34px;font-weight:800;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.3);position:relative;z-index:1;}'
      + '.rp-modal-body{padding:16px 20px;background:#1b1b1b;text-align:center;}'
      + '.rp-modal-amt{font-size:28px;font-weight:800;color:#f5c04a;}'
      + '.rp-modal-bless{display:block;margin:8px auto 4px;max-width:90%;background:#2b2b2b;color:#e8d9a6;'
      + 'border-radius:8px;padding:5px 10px;font-size:12px;text-align:center;line-height:1.4;}'
      + '.rp-acts{display:flex;gap:10px;justify-content:center;margin-top:14px;flex-wrap:wrap;position:relative;z-index:1;}'
      + '.rp-act{border:none;border-radius:999px;padding:10px 20px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:filter .15s;}'
      + '.rp-act.primary{background:linear-gradient(135deg,#f0b64a,#d99a2b);color:#1a1a1a;box-shadow:0 4px 12px rgba(240,180,74,.4);}'
      + '.rp-act.ghost{background:#333;color:#ccc;}'
      + '.rp-act.lock{background:#333;color:#9a9a9a;}'
      + '.rp-act.link{background:none;color:#8a8a8a;font-size:12px;padding:8px 4px;}'
      + '.rp-act:hover{filter:brightness(1.1);}'

      + '.rp-ov-send .rp-coverpick{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:0 0 8px;}'
      + '.rp-ov-send .rp-coverpick span{font-size:26px;padding:2px 4px;border-radius:8px;cursor:pointer;transition:transform .12s;filter:saturate(.9);}'
      + '.rp-ov-send .rp-coverpick span.on{background:#f0b64a33;box-shadow:0 0 0 1px #f0b64a;transform:scale(1.15);}'
      + '.rp-preset{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:8px 0 12px;}'
      + '.rp-preset .rp-pres{background:#3a3a3a;border:1px solid #555;color:#f0b64a;border-radius:999px;padding:6px 12px;font-size:13px;cursor:pointer;font-family:inherit;}'
      + '.rp-preset .rp-pres.on{background:#f0b64a;border-color:#f0b64a;color:#1a1a1a;}'
      + '.rp-custom{width:100%;padding:9px 12px;border:1px solid #4a4a4a;border-radius:10px;font-size:14px;box-sizing:border-box;outline:none;background:#262626;color:#eee;}'
      + '.rp-custom:focus{border-color:#f0b64a;}'
      + '.rp-bless-in{width:100%;padding:9px 12px;border:1px solid #4a4a4a;border-radius:10px;font-size:13px;box-sizing:border-box;outline:none;margin-top:8px;background:#262626;color:#eee;font-family:inherit;}'
      + '.rp-hint{font-size:11px;color:#9a9a9a;text-align:center;margin-top:8px;line-height:1.5;}'
      + '.rp-ov-send .rp-custom{margin-top:4px;}';
    document.head.appendChild(style);
  }

  /* ---------- 工具 ---------- */
  function toast(msg) {
    if (typeof window.toast === 'function') return window.toast(msg);
    if (typeof toast === 'function') return toast(msg);
  }
  function wallet() { return window.phoneWallet; }
  function partnerName() { return window.settings && window.settings.partnerName ? window.settings.partnerName : '对方'; }
  function fmtMoney(n) {
    n = Number(n);
    return n % 1 === 0 ? String(n) : n.toFixed(2);
  }
  window.fmtMoney = fmtMoney;
  function esc(s) {
    if (typeof window.esc === 'function') return window.esc(s);
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function coverOf(rp) { return rp && rp.cover && rp.cover !== 'none' ? rp.cover : '🧧'; }
  function safeDecode(s) {
    try {
      var d = decodeURIComponent(String(s || ''));
      return d === 'undefined' || d === 'none' || d === '' ? '🧧' : d;
    } catch (e) { return '🧧'; }
  }

  var COVERS = ['🧧', '🎉', '💖', '🌹', '🎀', '🐉', '🌟', '😘', '🎊', '🦊'];
  var PRESETS = [1.2, 5.2, 8.8, 13.14, 18.88, 52, 66.6, 88.8, 131.4, 520];

  /* 查找单条消息并更新其红包状态显示（轻微改动，不整体重渲染） */
  function patchState(id) {
    try {
      var m = (window.messages || []).find(function (x) { return String(x.id) === String(id); });
      if (!m || !m.redpacket) return;
      var wrap = document.getElementById('messagesContainer');
      if (!wrap) wrap = document.querySelector('.messages-container');
      if (!wrap) return;
      var w = wrap.querySelector('[data-id="' + id + '"]');
      if (!w) return;
      var card = w.querySelector('.redpacket-card');
      if (!card) return;
      ['sent', 'claimed', 'returned', 'pending'].forEach(function (c) { card.classList.remove(c); });
      card.classList.add(m.redpacket.status || 'pending');
      var st = card.querySelector('.rp-state');
      if (st) st.textContent = m.redpacket.status === 'claimed' ? '已领取' : m.redpacket.status === 'returned' ? '已退回' : '待开启';
    } catch (e) {}
  }

  function save() {
    try { if (typeof throttledSaveData === 'function') throttledSaveData(); } catch (e) {}
  }

  /* ---------- 打开红包（领取 / 退回 / 查看状态） ---------- */
  window._openRedPacket = function (id, rpFromMe, coverEnc) {
    try {
      var m = (window.messages || []).find(function (x) { return String(x.id) === String(id); });
      if (!m || !m.redpacket) return;
      var rp = m.redpacket;
      var cover = safeDecode(coverEnc);

      var ov = document.createElement('div');
      ov.className = 'rp-ov';
      var isMine = rpFromMe;
      var topTitle = isMine ? '我发的红包' : partnerName() + ' 的红包';
      var topSub = isMine ? '我发出的红包' : '点击开启，领取这份心意';
      ov.innerHTML =
        '<div class="rp-modal">'
        + '<div class="rp-modal-top">'
        + '<div class="rp-title">' + topTitle + '</div>'
        + '<div class="rp-seal-lg">' + esc(cover) + '</div>'
        + '<div class="rp-amt-top">¥ ' + fmtMoney(rp.amount) + '</div>'
        + '<div class="rp-sub">' + topSub + '</div>'
        + '</div>'
        + '<div class="rp-modal-body">'
        + (rp.bless ? '<div class="rp-modal-bless">' + esc(rp.bless) + '</div>' : '')
        + '<div class="rp-acts" id="rpActs"></div>'
        + '</div></div>';
      document.body.appendChild(ov);
      ov.addEventListener('click', function (e) { if (e.target === ov) ov.remove(); });

      var acts = ov.querySelector('#rpActs');
      var sub = ov.querySelector('.rp-sub');
      var status = rp.status || (rpFromMe ? 'sent' : 'open');

      if (rpFromMe) {
        /* —— 我发出的红包 —— */
        if (status === 'claimed') {
          sub.textContent = partnerName() + ' 已领取';
          acts.innerHTML = '<button class="rp-act lock">已领取 ¥' + fmtMoney(rp.amount) + '</button>';
        } else if (status === 'returned') {
          sub.textContent = '红包已退回';
          acts.innerHTML = '<button class="rp-act lock">已退回</button>';
        } else {
          sub.textContent = '等待' + partnerName() + '开启…';
          acts.innerHTML = '<button class="rp-act ghost" id="rpRefund">撤回红包</button>'
            + '<button class="rp-act ghost" id="rpClose">关闭</button>';
          acts.querySelector('#rpRefund').addEventListener('click', function () {
            if (!window.confirm('撤回红包？金额将原路退回我的余额。')) return;
            rp.status = 'returned';
            var w = wallet(); if (w) w.addMine(rp.amount);
            ov.remove();
            patchState(m.id);
            save();
            toast('红包已撤回，金额退回余额');
          });
          acts.querySelector('#rpClose').addEventListener('click', function () { ov.remove(); });
        }
      } else {
        /* —— 对方发我的红包 —— */
        if (status === 'claimed') {
          sub.textContent = '已领取 ¥' + fmtMoney(rp.amount);
          acts.innerHTML = '<span class="rp-act lock">已领取</span>';
        } else if (status === 'returned') {
          sub.textContent = '已退回红包';
          acts.innerHTML = '<span class="rp-act lock">已退回</span>';
        } else {
          sub.textContent = '点击开启红包';
          acts.innerHTML = '<button class="rp-act primary" id="rpGrab">开</button>'
            + '<button class="rp-act ghost" id="rpReturn">退回</button>';
          acts.querySelector('#rpGrab').addEventListener('click', function () {
            rp.status = 'claimed';
            var w = wallet(); if (w) w.addMine(rp.amount);
            sub.textContent = '已领取 ¥' + fmtMoney(rp.amount) + '，已入余额';
            acts.innerHTML = '<span class="rp-act lock">已领取</span>';
            patchState(m.id);
            save();
            toast('收到红包 ¥' + fmtMoney(rp.amount));
          });
          acts.querySelector('#rpReturn').addEventListener('click', function () {
            rp.status = 'returned';
            var w = wallet(); if (w) w.addTheirs(rp.amount);
            sub.textContent = '红包已退回' + partnerName() + '的余额';
            acts.innerHTML = '<span class="rp-act lock">已退回</span>';
            patchState(m.id);
            save();
            toast('红包已退回');
          });
        }
      }
    } catch (e) { console.warn('[redpacket]', e); }
  };

  /* ---------- 发红包弹层 ---------- */
  window.openSendModal = function () {
    var w = wallet();
    if (!w) { toast('钱包尚未就绪'); return; }
    var ov = document.createElement('div');
    ov.className = 'rp-ov rp-ov-send';
    ov.innerHTML =
      '<div class="rp-modal">'
      + '<div class="rp-modal-top"><div class="rp-title">发红包</div>'
      + '<div class="rp-seal-lg">🧧</div>'
      + '<div class="rp-sub">我的余额 ¥ ' + fmtMoney(w.get().mine) + '</div></div>'
      + '<div class="rp-modal-body">'
      + '<div class="rp-coverpick" id="rpCoverPick"></div>'
      + '<input class="rp-custom" id="rpCustomIn" type="number" min="0.01" step="any" placeholder="自定义金额（最高 ¥' + MAX_AMOUNT + '）">'
      + '<div class="rp-preset" id="rpPreset"></div>'
      + '<input class="rp-bless-in" id="rpBlessIn" maxlength="20" placeholder="恭喜发财，大吉大利">'
      + '<span class="rp-act primary" id="rpDo" style="width:100%;margin-top:12px;text-align:center;box-sizing:border-box;cursor:pointer;">发红包</span>'
      + '<div class="rp-hint">发出后余额即时扣除；对方可开领或退回，退回时原路返还。</div>'
      + '</div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) { if (e.target === ov) ov.remove(); });

    var coverPick = ov.querySelector('#rpCoverPick');
    var presetWrap = ov.querySelector('#rpPreset');
    var customIn = ov.querySelector('#rpCustomIn');
    var cover = '🧧';
    COVERS.forEach(function (c) {
      var span = document.createElement('span');
      span.className = 'rp-cov' + (c === cover ? ' on' : '');
      span.textContent = c;
      span.addEventListener('click', function () {
        cover = c;
        coverPick.querySelectorAll('.rp-cov').forEach(function (x) { x.classList.remove('on'); });
        span.classList.add('on');
      });
      coverPick.appendChild(span);
    });
    PRESETS.forEach(function (p) {
      var b = document.createElement('span');
      b.className = 'rp-pres';
      b.textContent = '¥' + fmtMoney(p);
      b.addEventListener('click', function () {
        presetWrap.querySelectorAll('.rp-pres').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        customIn.value = p;
      });
      presetWrap.appendChild(b);
    });

    ov.querySelector('#rpDo').addEventListener('click', function () {
      var amt = Number(customIn.value);
      if (isNaN(amt) || amt <= 0) { toast('请输入有效金额'); return; }
      amt = Math.max(0.01, Math.min(MAX_AMOUNT, Math.round(amt * 100) / 100));
      var w = wallet();
      if (!w) { toast('钱包未就绪'); return; }
      if (amt > w.get().mine + 0.0001) { toast('余额不足！可在支付宝修改余额'); return; }
      var bless = (ov.querySelector('#rpBlessIn') && ov.querySelector('#rpBlessIn').value || '').trim();
      ov.remove();
      sendRedPacket(amt, cover, bless);
    });
  };

  /* ---------- 真正发红包 ---------- */
  window.sendRedPacket = function (amount, cover, bless) {
    var w = wallet();
    if (!w) return false;
    var amt = Math.max(0.01, Math.min(MAX_AMOUNT, Number(amount) || 0));
    if (amt > w.get().mine + 0.0001) { toast('余额不足'); return false; }
    if (w.payMine(amt) === false) { toast('余额不足'); return false; }

    var msgId = Date.now() + Math.random();
    if (typeof addMessage !== 'function') { toast('聊天尚未就绪'); return true; }
    addMessage({
      id: msgId,
      sender: 'user',
      text: '',
      timestamp: new Date(),
      status: 'sent',
      type: 'normal',
      redpacket: { amount: amt, cover: cover || '🧧', bless: bless || '', from: 'me', status: null }
    });
    toast('已发出红包 ¥' + fmtMoney(amt));

    // 模拟对方稍后领取（小概率退回）
    setTimeout(function () {
      try {
        var m = (window.messages || []).find(function (x) { return String(x.id) === String(msgId); });
        if (!m || !m.redpacket || m.redpacket.status) return;
        if (Math.random() < 0.12) {
          m.redpacket.status = 'returned';
          var w2 = wallet(); if (w2) w2.addMine(amt);
          patchState(msgId);
          save();
          toast(partnerName() + ' 退回了你的红包');
        } else {
          m.redpacket.status = 'claimed';
          var w3 = wallet(); if (w3) w3.addTheirs(amt);
          patchState(msgId);
          save();
          toast(partnerName() + ' 领取了你的红包 ¥' + fmtMoney(amt));
        }
      } catch (e) {}
    }, 3000 + Math.random() * 4000);

    return true;
  };

  /* ---------- 按钮绑定 ---------- */
  function bindSendBtn() {
    var btn = document.getElementById('redpacket-btn');
    if (!btn || btn.dataset.rpBound) return;
    btn.dataset.rpBound = '1';
    btn.addEventListener('click', function () { window.openSendModal(); });
  }

  document.addEventListener('DOMContentLoaded', bindSendBtn);
  bindSendBtn(); // index 中脚本在底部，DOM 已就绪
})();