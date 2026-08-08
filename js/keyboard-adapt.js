/* 手机浏览器软键盘适配（Chrome Android 108+ / 荣耀 等）
 * 核心问题：
 *   1) 部分 Chrome 弹起软键盘只改 VisualViewport 不重排布局，position:fixed 的输入栏
 *      会停在视口底部被键盘遮住，且消息列表底部被输入栏遮挡。
 *   2) .main-chat-area 的固定 padding-bottom（70px）在回复预览/批量面板展开或
 *      safe-area 差异时不够，最后一条消息会被输入栏盖住。
 * 方案：
 *   - 检测键盘占用高度 kbH = layoutHeight - visualViewport 可见底部；
 *   - 键盘可见时把 .input-area-wrapper 顶部钉在键盘上沿（bottom: kbH px）；
 *   - 用 ResizeObserver 动态把 .chat-container 的 padding-bottom 设为输入栏实际高度，
 *     保证新旧消息可完整滚到输入栏上方；
 *   - 键盘收起恢复原状。
 */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;
  var hasVV = 'visualViewport' in window;
  var chatBottom = null;

  function isEditable(el) {
    if (!el || el.disabled) return false;
    var t = (el.tagName || '').toLowerCase();
    if (t === 'textarea') return true;
    if (t === 'input') {
      var type = (el.getAttribute('type') || 'text').toLowerCase();
      var skip = ['button', 'checkbox', 'radio', 'range', 'color', 'file',
                  'hidden', 'image', 'submit', 'reset', 'search'];
      return skip.indexOf(type) === -1;
    }
    if (el.isContentEditable) return true;
    return false;
  }

  function query(sel) { try { return document.querySelector(sel); } catch (e) { return null; } }

  // 软键盘高度：视觉视口底部相对布局视口底部的差距（>0 说明键盘盖住了底部）
  function keyboardHeight() {
    if (!hasVV) return 0;
    try {
      var vv = window.visualViewport;
      var layoutH = window.innerHeight || document.documentElement.clientHeight || 0;
      var visualBottom = vv.offsetTop + vv.height;
      var kb = layoutH - visualBottom;
      return kb > 0 ? Math.round(kb) : 0;
    } catch (e) { return 0; }
  }

  function applyKb() {
    var wrap = query('.input-area-wrapper');
    if (!wrap) return;
    var kb = keyboardHeight();
    if (kb > 0) {
      wrap.style.bottom = kb + 'px';
      var body = document.body;
      if (body) body.classList.add('kb-open');
      // 键盘弹出后若已在底部则滚到最后一条，避免输入栏压住最新一条
      var cc = query('.chat-container');
      if (cc) {
        var nearBottom = cc.scrollHeight - cc.scrollTop - cc.clientHeight < 120;
        if (nearBottom) cc.scrollTop = cc.scrollHeight;
      }
    } else {
      wrap.style.bottom = '';
      var body = document.body;
      if (body) body.classList.remove('kb-open');
    }
  }

  // 聊天消息容器底部留白始终 = 输入栏实际高度（覆盖固定 70px）
  function syncChatPadding() {
    var wrap = query('.input-area-wrapper');
    var cc = query('.chat-container');
    if (!wrap || !cc) return;
    var h = wrap.offsetHeight || 0;
    var extra = keyboardHeight();
    cc.style.paddingBottom = (h + extra + 6) + 'px';
    var main = query('.main-chat-area');
    if (main) main.style.paddingBottom = '0px';
  }

  function onFit() { applyKb(); requestAnimationFrame(syncChatPadding); }

  if (hasVV) {
    try {
      window.visualViewport.addEventListener('resize', onFit);
      window.visualViewport.addEventListener('scroll', onFit);
    } catch (e) {}
  }
  window.addEventListener('resize', onFit);
  window.addEventListener('orientationchange', function () { setTimeout(syncChatPadding, 300); });
  document.addEventListener('focusin', function (e) {
    if (!isEditable(e.target)) return;
    setTimeout(onFit, 60);
    setTimeout(onFit, 260);
    setTimeout(onFit, 600);
  }, true);
  document.addEventListener('focusout', function (e) {
    if (!isEditable(e.target)) return;
    setTimeout(onFit, 120);
    setTimeout(onFit, 400);
  }, true);

  // 输入栏高度/回复预览变化时保持底部留白准确
  if (typeof ResizeObserver !== 'undefined') {
    try {
      var tie = setInterval(function () {
        var wrap = query('.input-area-wrapper');
        if (!wrap) { return; }
        clearInterval(tie);
        var ro = new ResizeObserver(function () { syncChatPadding(); });
        ro.observe(wrap);
        ['reply-preview-container', 'batch-preview', 'collapsed-extras-panel'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) ro.observe(el);
        });
      }, 300);
    } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', function () { setTimeout(onFit, 300); setTimeout(onFit, 900); });
  setTimeout(onFit, 400);
})();