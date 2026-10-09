(function () {
  'use strict';
  var G = window.HR_GALLERY || {}, V = window.HR_VIDEOS || [];
  var CATS = [
    ['all', 'كل الأعمال'],
    ['facades', 'واجهات كرتن وول'],
    ['finishing', 'تشطيبات وحمامات'],
    ['electrical', 'أعمال الكهرباء'],
    ['kitchens', 'مطابخ'],
    ['dressing', 'دريسنج ودواليب'],
    ['woodwork', 'وحدات خشبية'],
    ['outdoor', 'برجولات وأعمال خارجية']
  ];
  var LABEL = {}; CATS.forEach(function (c) { LABEL[c[0]] = c[1]; });
  var $ = function (s) { return document.querySelector(s); };

  /* header + menu */
  var header = $('#header'), menuBtn = $('#menuBtn');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
  document.querySelectorAll('#nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  /* active nav link */
  var links = {}; document.querySelectorAll('#nav a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && links[e.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
          links[e.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* reveal */
  var ro = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function reveal(el) { if (ro) ro.observe(el); else el.classList.add('in'); }
  document.querySelectorAll('.rv').forEach(reveal);

  /* gallery */
  var all = [];
  Object.keys(G).forEach(function (c) { G[c].forEach(function (it) { all.push({ f: it.f, c: it.c, w: it.w, h: it.h, cat: c }); }); });
  // interleave categories for the "all" view so it opens varied
  function interleave() {
    var lists = Object.keys(G).map(function (c) { return all.filter(function (x) { return x.cat === c; }); });
    var out = [], i = 0, left = true;
    while (left) { left = false; lists.forEach(function (l) { if (l[i]) { out.push(l[i]); left = true; } }); i++; }
    return out;
  }
  var mixed = interleave();
  var grid = $('#grid'), filters = $('#filters'), moreBtn = $('#moreBtn');
  var current = 'all', shown = 0, list = mixed, PAGE = window.innerWidth < 600 ? 12 : 20;

  CATS.forEach(function (c) {
    var n = c[0] === 'all' ? all.length : (G[c[0]] || []).length;
    if (!n) return;
    var b = document.createElement('button');
    b.type = 'button'; b.dataset.cat = c[0];
    b.setAttribute('aria-pressed', c[0] === 'all');
    b.innerHTML = c[1] + '<sup>' + n + '</sup>';
    b.addEventListener('click', function () { setFilter(c[0]); });
    filters.appendChild(b);
  });

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { var im = e.target; im.src = im.dataset.src; io.unobserve(im); } });
  }, { rootMargin: '300px 0px' }) : null;

  function tile(it, idx) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'tile rv';
    b.setAttribute('aria-label', 'عرض: ' + it.c);
    var im = document.createElement('img');
    im.alt = it.c; im.width = it.w; im.height = it.h; im.decoding = 'async';
    im.style.aspectRatio = it.w + '/' + it.h;
    im.onload = function () { im.classList.add('loaded'); };
    im.dataset.src = 'assets/thumbs/' + it.f;
    if (io) io.observe(im); else im.src = im.dataset.src;
    var cap = document.createElement('figcaption');
    cap.innerHTML = '<small>' + LABEL[it.cat] + '</small>' + it.c;
    b.appendChild(im); b.appendChild(cap);
    b.addEventListener('click', function () { openLb(idx); });
    return b;
  }
  function renderMore() {
    var frag = document.createDocumentFragment(), end = Math.min(list.length, shown + PAGE);
    for (var i = shown; i < end; i++) frag.appendChild(tile(list[i], i));
    grid.appendChild(frag);
    grid.querySelectorAll('.tile.rv:not(.in)').forEach(reveal);
    shown = end;
    moreBtn.parentNode.style.display = shown >= list.length ? 'none' : '';
    moreBtn.textContent = 'عرض المزيد (' + (list.length - shown) + ' صورة)';
  }
  function setFilter(cat) {
    current = cat;
    list = cat === 'all' ? mixed : all.filter(function (x) { return x.cat === cat; });
    filters.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.cat === cat); });
    grid.innerHTML = ''; shown = 0; renderMore();
  }
  moreBtn.addEventListener('click', renderMore);
  setFilter('all');

  /* lightbox */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbCount = $('#lbCount'), li = 0, lastFocus;
  function show(i) {
    li = (i + list.length) % list.length;
    var it = list[li];
    lbImg.src = 'assets/img/' + it.f; lbImg.alt = it.c;
    lbCap.textContent = LABEL[it.cat] + ' — ' + it.c;
    lbCount.textContent = (li + 1) + ' / ' + list.length;
    [li + 1, li - 1].forEach(function (k) { var n = list[(k + list.length) % list.length]; if (n) (new Image()).src = 'assets/img/' + n.f; });
  }
  function openLb(i) { lastFocus = document.activeElement; show(i); lb.classList.add('open'); document.documentElement.style.overflow = 'hidden'; $('#lbClose').focus(); }
  function closeLb() { lb.classList.remove('open'); document.documentElement.style.overflow = ''; lbImg.removeAttribute('src'); if (lastFocus) lastFocus.focus(); }
  // RTL: "next" is visually to the left
  $('#lbNext').addEventListener('click', function () { show(li + 1); });
  $('#lbPrev').addEventListener('click', function () { show(li - 1); });
  $('#lbClose').addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.id === 'lbStage') closeLb(); });
  var tx = null, ty = null;
  $('#lbStage').addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  $('#lbStage').addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(li + (dx > 0 ? 1 : -1)); // swipe right = next in RTL
    tx = null;
  });

  /* videos */
  var vids = $('#vids'), vm = $('#vm'), vmVideo = $('#vmVideo');
  V.forEach(function (v, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'vid rv' + (i % 4 ? ' rv-d' + (i % 4) : '');
    b.innerHTML = '<img src="assets/video/' + v.f + '.jpg" alt="" loading="lazy"><span class="vid-play"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11L13.5 8 4 2.5Z"/></svg></span><span class="vid-cap">' + v.c + '</span>';
    b.setAttribute('aria-label', 'تشغيل فيديو: ' + v.c);
    b.addEventListener('click', function () {
      lastFocus = b; vmVideo.src = 'assets/video/' + v.f + '.mp4'; vmVideo.poster = 'assets/video/' + v.f + '.jpg';
      vm.classList.add('open'); document.documentElement.style.overflow = 'hidden';
      var p = vmVideo.play(); if (p && p.catch) p.catch(function () {});
      $('#vmClose').focus();
    });
    vids.appendChild(b); reveal(b);
  });
  function closeVm() { vmVideo.pause(); vmVideo.removeAttribute('src'); vmVideo.load(); vm.classList.remove('open'); document.documentElement.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  $('#vmClose').addEventListener('click', closeVm);
  vm.addEventListener('click', function (e) { if (e.target === vm) closeVm(); });

  document.addEventListener('keydown', function (e) {
    if (lb.classList.contains('open')) {
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') show(li + 1);
      else if (e.key === 'ArrowRight') show(li - 1);
    } else if (vm.classList.contains('open') && e.key === 'Escape') closeVm();
    else if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
  });

  /* catalog page count */
  if (window.HR_PAGES) { var cp = $('#catPages'); if (cp) cp.textContent = window.HR_PAGES.length; }

  /* whatsapp form */
  $('#waForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, name = f.name.value.trim(), note = $('#formNote');
    if (!name) { note.textContent = 'من فضلك اكتب الاسم.'; f.name.focus(); return; }
    var msg = 'مرحبًا هاي روياليتي،\nالاسم: ' + name +
      (f.phone.value.trim() ? '\nالموبايل: ' + f.phone.value.trim() : '') +
      '\nالخدمة: ' + f.service.value +
      (f.msg.value.trim() ? '\nالتفاصيل: ' + f.msg.value.trim() : '');
    window.open('https://wa.me/201023083184?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    note.textContent = 'تم فتح واتساب — اضغط إرسال لإتمام الطلب.';
  });

  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
})();
