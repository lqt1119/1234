/* 手机浏览器软键盘适配（Chrome Android 108+）
 * Chrome 弹起软键盘默认只改 VisualViewport，不重排布局，
 * 导致 position:fixed 的输入区被键盘遮住 / 点击输入无反应。
 * 这里用 visualViewport 实时校正，确保聚焦的输入框始终在键盘上方。
 */
(function () {
  'use strict';
  if (!('visualViewport' in window)) return;

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

  function scrollInputIntoView(el) {
    var vv = window.visualViewport;
    if (!vv) return;
    var keyboardTop = vv.offsetTop + vv.height; // 键盘上边缘 相对视觉视口
    var r = el.getBoundingClientRect();
    if (r.bottom > keyboardTop) {
      var dy = r.bottom - keyboardTop + 14;
      // 输入区内先滚，再滚 document
      var wrap = document.querySelector('.input-area-wrapper');
      if (wrap) {
        try { wrap.scrollTop = 0; } catch (e) {}
      }
      try {
        document.body.scrollTop = document.body.scrollTop + dy;
      } catch (e) {}
      try {
        document.documentElement.scrollTop = document.documentElement.scrollTop + dy;
      } catch (e) {}
      var box = el.closest('.input-area') || el;
      if (box) {
        try { box.scrollTop = box.scrollTop + dy; } catch (e) {}
      }
    }
  }

  function onKbChange() {
    var el = document.activeElement;
    if (el && isEditable(el)) scrollInputIntoView(el);
  }
  try {
    window.visualViewport.addEventListener('resize', onKbChange);
    window.visualViewport.addEventListener('scroll', onKbChange);
  } catch (e) {}

  document.addEventListener('focusin', function (e) {
    if (!isEditable(e.target)) return;
    setTimeout(function () { scrollInputIntoView(e.target); }, 120);
    setTimeout(function () { scrollInputIntoView(e.target); }, 450);
  }, true);

  document.addEventListener('touchend', function (e) {
    var el = e.target;
    if (isEditable(el)) {
      setTimeout(function () { scrollInputIntoView(el); }, 60);
    }
  }, true);
})();