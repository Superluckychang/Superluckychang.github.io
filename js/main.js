/* ============================================
   个人网站 - 交互脚本
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ===== 导航栏滚动效果 =====
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const updateNavbar = () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();
  }

  // ===== 移动端汉堡菜单 =====
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navOverlay = document.querySelector('.nav-overlay');

  if (navToggle && navLinks) {
    const openMenu = () => {
      navToggle.classList.add('active');
      navLinks.classList.add('open');
      if (navOverlay) navOverlay.classList.add('visible');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
      if (navOverlay) navOverlay.classList.remove('visible');
      document.body.style.overflow = '';
    };

    navToggle.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (navOverlay) {
      navOverlay.addEventListener('click', closeMenu);
    }

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (navLinks.classList.contains('open')) {
          closeMenu();
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  // ===== 回到顶部按钮 =====
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    const toggleBackToTop = () => {
      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== 滚动渐入动画 =====
  const fadeElements = document.querySelectorAll('.fade-in');
  if (fadeElements.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));
  }

  // ===== 照片灯箱（所有可点击图片） =====
  const LIGHTBOX_SELECTOR = '.photo-clickable img, .hero-photo-clickable img, .interest-panel-img img';

  // 创建灯箱 DOM
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="关闭">✕</button>
    <button class="lightbox-prev" aria-label="上一张">‹</button>
    <button class="lightbox-next" aria-label="下一张">›</button>
    <img src="" alt="">
    <span class="lightbox-counter"></span>
  `;
  document.body.appendChild(overlay);

  const lightboxImg = overlay.querySelector('img');
  const counter = overlay.querySelector('.lightbox-counter');
  const prevBtn = overlay.querySelector('.lightbox-prev');
  const nextBtn = overlay.querySelector('.lightbox-next');
  let currentIndex = 0;

  function collectAllPhotos() {
    const imgs = document.querySelectorAll(LIGHTBOX_SELECTOR);
    return Array.from(imgs).map(img => img.src);
  }

  function openLightbox(index) {
    const photos = collectAllPhotos();
    currentIndex = index;
    lightboxImg.src = photos[index];
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
    updateCounter();
  }

  function closeLightbox() {
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  function updateCounter() {
    const photos = collectAllPhotos();
    if (photos.length > 1) {
      counter.textContent = `${currentIndex + 1} / ${photos.length}`;
      counter.style.display = '';
      prevBtn.style.display = '';
      nextBtn.style.display = '';
    } else {
      counter.style.display = 'none';
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    }
  }

  function showPrev() {
    const photos = collectAllPhotos();
    currentIndex = (currentIndex - 1 + photos.length) % photos.length;
    lightboxImg.src = photos[currentIndex];
    updateCounter();
  }

  function showNext() {
    const photos = collectAllPhotos();
    currentIndex = (currentIndex + 1) % photos.length;
    lightboxImg.src = photos[currentIndex];
    updateCounter();
  }

  // 事件委托：统一处理所有可放大图片的点击
  document.addEventListener('click', (e) => {
    if (overlay.classList.contains('visible')) return; // 灯箱已开，不处理
    const img = e.target.closest(LIGHTBOX_SELECTOR);
    if (!img) return;
    e.preventDefault();
    const photos = collectAllPhotos();
    const index = photos.indexOf(img.src);
    if (index >= 0) openLightbox(index);
  });

  // 关闭事件
  overlay.querySelector('.lightbox-close').addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showPrev();
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showNext();
  });

  // 键盘控制
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('visible')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // 触摸滑动
  let touchStartX = 0;
  overlay.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  overlay.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      if (diff > 0) showNext();
      else showPrev();
    }
  });

  // ===== 简历折叠面板 =====
  const expCards = document.querySelectorAll('.exp-card');
  expCards.forEach(card => {
    const desc = card.querySelector('.desc');
    if (!desc) return;

    // 包装：把 desc 以外的内容放入 header
    const headerInfo = document.createElement('div');
    headerInfo.className = 'header-info';

    // 把 company, role, meta 移到 headerInfo
    const company = card.querySelector('.company');
    const role = card.querySelector('.role');
    const meta = card.querySelector('.meta');

    if (company) headerInfo.appendChild(company);
    if (role) headerInfo.appendChild(role);
    if (meta) headerInfo.appendChild(meta);

    // 创建折叠头部
    const collapsibleHeader = document.createElement('div');
    collapsibleHeader.className = 'collapsible-header';
    collapsibleHeader.appendChild(headerInfo);

    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'toggle-icon';
    toggleIcon.textContent = '▾';
    collapsibleHeader.appendChild(toggleIcon);

    // 包裹 desc 为折叠内容
    const collapsibleContent = document.createElement('div');
    collapsibleContent.className = 'collapsible-content';
    desc.parentNode.insertBefore(collapsibleContent, desc);
    collapsibleContent.appendChild(desc);

    // 插入折叠头部
    card.insertBefore(collapsibleHeader, card.firstChild);

    // 默认展开状态
    collapsibleContent.classList.add('open');
    card.classList.remove('collapsed');

    // 点击切换
    collapsibleHeader.addEventListener('click', () => {
      const isOpen = collapsibleContent.classList.contains('open');
      if (isOpen) {
        collapsibleContent.classList.remove('open');
        card.classList.add('collapsed');
      } else {
        collapsibleContent.classList.add('open');
        card.classList.remove('collapsed');
      }
    });
  });

  // ===== 兴趣爱好详情面板 =====
  const interestPanel = document.getElementById('interestPanel');
  const interestItems = document.querySelectorAll('.interest-item');
  const panelInner = interestPanel?.querySelector('.interest-panel-inner');

  // 兴趣详情数据
  const interestData = {
    travel: {
      icon: '✈️',
      title: '旅行探索',
      img: '旅行足迹.jpg',
      desc: '中国探索进度 24/34，绝大部分是 solo trip，一个人搞定所有。喜欢自由行，喜欢不期而遇的风景。每一段独自走过的路，都让我更了解自己也更热爱这个世界。'
    },
    reading: {
      icon: '📚',
      title: '阅读思考',
      img: '阅读记录.jpg',
      desc: '微信读书 1200+ 小时。偏好非虚构类和社科类，偶尔也读小说放松。每本书都是一次与作者的深度对话，做笔记、写感想，让思考不只停留在翻页之间。'
    },
    movie: {
      icon: '🎬',
      title: '观影记录',
      img: '观影记录.jpg',
      desc: '豆瓣 Top 250 观影进度 70%，争取毕业前刷完。喜欢在周末晚上窝在沙发里看一部好片，科幻、悬疑、剧情片都有涉猎，偶尔也会二刷经典。'
    },
    food: {
      icon: '🍜',
      title: '美食探店',
      img: null,
      desc: '无辣不欢！钟爱云贵川湘和东南亚菜。从苍蝇馆子到精致餐厅，只要好吃都愿意尝试。最享受和朋友们一起分享美食的快乐时光。'
    },
    coding: {
      icon: '💻',
      title: 'Vibe Coding',
      img: null,
      desc: '用AI辅助创作有趣的小项目。从个人网站到「毕业旅行去哪玩」网页，享受把想法变成现实的成就感。Coding 不只是一项技能，更是一种创造的方式。'
    },
    outdoor: {
      icon: '🏔️',
      title: '户外',
      img: '雪山合集.jpg',
      desc: '喜欢大自然和绿色，尤其爱雪山，心愿是工作前登上第一座5000米雪山。日常爬山和徒步是最好的充电方式，山里的风、脚下的路、登顶后的开阔视野，是城市生活最好的解药。上：梅里雪山日照金山，下：冷噶措贡嘎倒影。'
    },
    mysticism: {
      icon: '🔮',
      title: '玄学',
      img: null,
      desc: '对算命和塔罗充满好奇，但更相信科学。与其说是迷信，不如说是一种理解自我和世界的另类视角。偶尔给朋友算一卦，准不准另说，过程总是很有趣。'
    }
  };

  if (interestPanel && panelInner && interestItems.length > 0) {
    let activeInterest = null;

    function showPanel(interestKey) {
      const data = interestData[interestKey];
      if (!data) return;

      let html = '';
      if (data.img) {
        const imgs = Array.isArray(data.img) ? data.img : [data.img];
        if (imgs.length === 1) {
          html += `<div class="interest-panel-img"><img src="${imgs[0]}" alt="${data.title}"></div>`;
        } else {
          html += `<div class="interest-panel-imgs">`;
          imgs.forEach((src, i) => {
            html += `<div class="interest-panel-img"><img src="${src}" alt="${data.title} ${i + 1}"></div>`;
          });
          html += `</div>`;
        }
      }
      html += `
        <div class="interest-panel-text">
          <h4>${data.icon} ${data.title}</h4>
          <p>${data.desc}</p>
        </div>
      `;
      panelInner.innerHTML = html;

      if (activeInterest !== interestKey) {
        interestPanel.classList.add('open');
      }
      activeInterest = interestKey;
    }

    function closePanel() {
      interestPanel.classList.remove('open');
      activeInterest = null;
    }

    interestItems.forEach(item => {
      item.addEventListener('click', () => {
        const key = item.getAttribute('data-interest');
        if (!key) return;

        // 如果点的是已激活的卡片，关闭面板
        if (activeInterest === key && interestPanel.classList.contains('open')) {
          closePanel();
          item.classList.remove('active');
          return;
        }

        // 切换 active 状态
        interestItems.forEach(other => other.classList.remove('active'));
        item.classList.add('active');

        showPanel(key);
      });
    });
  }

  // ===== 联系表单处理 =====
  const contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    if (!contactForm.getAttribute('action') || contactForm.getAttribute('action') === '#') {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = contactForm.querySelector('[name="name"]')?.value?.trim();
        const email = contactForm.querySelector('[name="email"]')?.value?.trim();
        const message = contactForm.querySelector('[name="message"]')?.value?.trim();

        if (!name || !email || !message) {
          showFormMessage('请填写所有必填字段', 'error');
          return;
        }

        if (!isValidEmail(email)) {
          showFormMessage('请输入有效的邮箱地址', 'error');
          return;
        }

        const subject = encodeURIComponent(`来自 ${name} 的留言 - 个人网站`);
        const body = encodeURIComponent(
          `姓名：${name}\n邮箱：${email}\n\n留言内容：\n${message}`
        );
        const mailtoLink = `mailto:tangchang_r@163.com?subject=${subject}&body=${body}`;

        window.open(mailtoLink, '_blank');
        showFormMessage('邮件客户端已打开，请发送邮件完成联系 ✉️', 'success');
        contactForm.reset();
      });
    }
  }

  function showFormMessage(msg, type) {
    const existing = document.querySelector('.form-message');
    if (existing) existing.remove();

    const msgEl = document.createElement('div');
    msgEl.className = `form-message form-message-${type}`;
    msgEl.textContent = msg;
    msgEl.style.cssText = `
      margin-top: 16px;
      padding: 14px 18px;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 500;
      text-align: center;
      ${type === 'success'
        ? 'background: #e8efe5; color: #5a7a50;'
        : 'background: #fce4db; color: #a0503a;'}
      animation: fadeInUp 0.3s ease;
    `;

    contactForm.appendChild(msgEl);

    setTimeout(() => {
      msgEl.style.opacity = '0';
      msgEl.style.transition = 'opacity 0.3s ease';
      setTimeout(() => msgEl.remove(), 300);
    }, 4000);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // 添加动画关键帧
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

});
