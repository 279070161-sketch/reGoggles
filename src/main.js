// ==========================================================================
// reGoggles Banner - Section Logic (Hero 使用静态图，已移除 3D 模型)
// ==========================================================================
function initApp() {

  // Modal Elements
  const modalBackdrop = document.getElementById('action-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-title-text');
  const modalDesc = document.getElementById('modal-desc-text');
  const modalForm = document.getElementById('subscribe-form');
  const modalEmailInput = document.getElementById('modal-email-input');
  const modalDiscordGroup = document.getElementById('modal-discord-group');
  const modalDiscordInput = document.getElementById('modal-discord-input');
  const modalBtnText = document.getElementById('modal-btn-text');
  const modalPrivacyRow = document.getElementById('modal-privacy-row');
  const modalPrivacyCheckbox = document.getElementById('modal-privacy-checkbox');
  const modalPrivacy = document.getElementById('modal-privacy-text');
  const modalSubmitBtn = document.getElementById('modal-submit-btn');
  const modalSuccess = document.getElementById('modal-success-state');
  const modalSuccessTitle = document.getElementById('modal-success-title-text');
  const modalSuccessDesc = document.getElementById('modal-success-desc-text');

  const navContactBtn = document.getElementById('nav-contact-btn');
  const joinBtn = document.getElementById('join-community-btn');
  const subscribeBtn = document.getElementById('subscribe-btn');
  const contactBtn = document.getElementById('contact-us-btn');
  const buildContactBtn = document.getElementById('build-contact-btn');

  // Hero Banner Action Buttons
  const heroContactBtn = document.getElementById('hero-contact-btn');
  const heroSubscribeBtn = document.getElementById('hero-subscribe-btn');
  const heroJoinBtn = document.getElementById('hero-join-btn');

  let modalAutoCloseTimer = null;
  let currentSuccessConfig = {
    title: 'Thank you for subscribing!',
    desc: 'Be the first to know about reGoggles launch and early access.'
  };

  function openModal(options = {}) {
    const {
      title = 'Subscribe for Updates',
      desc = 'Be the first to know about reGoggles launch and early access.',
      btnText = 'Subscribe',
      showDiscord = false,
      showPrivacy = true,
      successTitle = 'Thank you for subscribing!',
      successDesc = 'Be the first to know about reGoggles launch and early access.'
    } = options;

    currentSuccessConfig = { title: successTitle, desc: successDesc };

    if (modalAutoCloseTimer) {
      clearTimeout(modalAutoCloseTimer);
      modalAutoCloseTimer = null;
    }
    if (modalTitle) {
      modalTitle.textContent = title;
      modalTitle.style.display = 'block';
    }
    if (modalDesc) {
      modalDesc.textContent = desc;
      modalDesc.style.display = 'block';
    }
    if (modalBtnText) {
      modalBtnText.textContent = btnText;
    } else if (modalSubmitBtn) {
      modalSubmitBtn.textContent = btnText;
    }
    if (modalPrivacyRow) modalPrivacyRow.style.display = showPrivacy ? 'block' : 'none';
    if (modalPrivacyCheckbox) {
      modalPrivacyCheckbox.checked = true; // 默认打勾
      modalPrivacyCheckbox.required = !!showPrivacy;
    }

    if (modalDiscordGroup) {
      modalDiscordGroup.style.display = showDiscord ? 'flex' : 'none';
    }
    if (modalDiscordInput) {
      modalDiscordInput.required = !!showDiscord;
      modalDiscordInput.value = '';
    }

    if (modalForm) modalForm.style.display = 'flex';
    if (modalSuccess) modalSuccess.style.display = 'none';
    if (modalEmailInput) {
      modalEmailInput.value = '';
      setTimeout(() => modalEmailInput.focus(), 80);
    }
    if (modalBackdrop) modalBackdrop.classList.add('active');
  }

  function closeModal() {
    if (modalAutoCloseTimer) {
      clearTimeout(modalAutoCloseTimer);
      modalAutoCloseTimer = null;
    }
    if (modalBackdrop) modalBackdrop.classList.remove('active');
  }

  const handleJoinClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    openModal({
      title: 'Join Community',
      desc: 'Subscribe and Join Our Discord Community.',
      btnText: 'Subscribe & Join Community',
      showDiscord: true,
      showPrivacy: true,
      successTitle: 'Welcome to the Community!',
      successDesc: 'Thank you for joining our Discord community. We will be in touch with your access invite shortly!'
    });
  };

  const handleSubscribeClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    openModal({
      title: 'Subscribe for Updates',
      desc: 'Be the first to know about reGoggles launch and early access.',
      btnText: 'Subscribe',
      showDiscord: false,
      showPrivacy: true,
      successTitle: 'Thank you for subscribing!',
      successDesc: 'Be the first to know about reGoggles launch and early access.'
    });
  };

  const handleContactClick = (e) => {
    if (e && e.currentTarget && e.currentTarget.tagName === 'A') {
      return; // 允许 <a> 标签原生通过 target="_blank" 打开页面
    }
    if (e && e.preventDefault) e.preventDefault();
    window.open('https://www.seeedstudio.com/contacts', '_blank', 'noopener,noreferrer');
  };

  if (navContactBtn) navContactBtn.addEventListener('click', handleContactClick);
  if (contactBtn) contactBtn.addEventListener('click', handleContactClick);
  if (heroContactBtn) heroContactBtn.addEventListener('click', handleContactClick);
  if (buildContactBtn) buildContactBtn.addEventListener('click', handleContactClick);

  if (joinBtn) joinBtn.addEventListener('click', handleJoinClick);
  if (heroJoinBtn) heroJoinBtn.addEventListener('click', handleJoinClick);

  if (subscribeBtn) subscribeBtn.addEventListener('click', handleSubscribeClick);
  if (heroSubscribeBtn) heroSubscribeBtn.addEventListener('click', handleSubscribeClick);

  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = modalEmailInput ? modalEmailInput.value.trim() : '';
      if (!email) return;

      if (modalPrivacyCheckbox && modalPrivacyRow && modalPrivacyRow.style.display !== 'none' && !modalPrivacyCheckbox.checked) {
        modalPrivacyCheckbox.reportValidity();
        return;
      }

      if (modalSuccessTitle) modalSuccessTitle.textContent = currentSuccessConfig.title;
      if (modalSuccessDesc) modalSuccessDesc.textContent = currentSuccessConfig.desc;

      // In-card success state feedback
      if (modalForm) modalForm.style.display = 'none';
      if (modalTitle) modalTitle.style.display = 'none';
      if (modalDesc) modalDesc.style.display = 'none';
      if (modalSuccess) modalSuccess.style.display = 'flex';

      modalAutoCloseTimer = setTimeout(() => {
        closeModal();
      }, 2600);
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop && modalBackdrop.classList.contains('active')) {
      closeModal();
    }
  });

  // ==========================================================================
  // Header Navigation Menu Toggle & Smooth Anchor Scroll Logic
  // ==========================================================================
  const headerMenuBtn = document.getElementById('header-menu-btn');
  const navDropdownMenu = document.getElementById('nav-dropdown-menu');
  const navLinkItems = document.querySelectorAll('.nav-link-item');

  function toggleNavMenu(forceState) {
    if (!headerMenuBtn || !navDropdownMenu) return;
    const isExpanded = typeof forceState === 'boolean' 
      ? forceState 
      : !navDropdownMenu.classList.contains('active');

    headerMenuBtn.classList.toggle('active', isExpanded);
    headerMenuBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    navDropdownMenu.classList.toggle('active', isExpanded);
  }

  if (headerMenuBtn) {
    headerMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNavMenu();
    });
  }

  // Smooth scroll and close menu on clicking any navigation link
  navLinkItems.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetHash = link.getAttribute('href');
      if (targetHash && targetHash.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetHash);
        
        toggleNavMenu(false);

        if (targetElement) {
          const headerHeight = document.querySelector('.main-header')?.offsetHeight || 80;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - (targetHash === '#hero' ? headerHeight : 0);

          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Close navigation menu when clicking outside
  document.addEventListener('click', (e) => {
    if (navDropdownMenu && navDropdownMenu.classList.contains('active')) {
      if (!navDropdownMenu.contains(e.target) && !headerMenuBtn.contains(e.target)) {
        toggleNavMenu(false);
      }
    }
  });

  // Close navigation menu on ESC key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navDropdownMenu && navDropdownMenu.classList.contains('active')) {
      toggleNavMenu(false);
    }
  });

  // Update Active Link on Scroll (Scrollspy for Nav Menu)
  const menuSections = Array.from(navLinkItems).map(link => {
    const hash = link.getAttribute('href');
    return hash && hash.startsWith('#') ? document.querySelector(hash) : null;
  }).filter(Boolean);

  function updateActiveNavLink() {
    const scrollPos = window.pageYOffset + 140;
    let currentId = null;

    for (let i = menuSections.length - 1; i >= 0; i--) {
      const sec = menuSections[i];
      if (sec && sec.offsetTop <= scrollPos) {
        currentId = '#' + sec.id;
        break;
      }
    }

    if (!currentId && menuSections.length > 0) {
      currentId = '#' + menuSections[0].id;
    }

    navLinkItems.forEach(link => {
      if (link.getAttribute('href') === currentId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });
  updateActiveNavLink();

  // ==========================================================================
  // Section: Field Worker Intelligence (6 Tabs Switching + On-Demand Expand)
  // ==========================================================================
  const fwTabs = document.querySelectorAll('.fieldwork-tab-item');
  const fwPanels = document.querySelectorAll('.fieldwork-panel');
  const fwPanelsContainer = document.querySelector('.fieldwork-panels-container');
  const fwCloseBtn = document.getElementById('fw-close-btn');

  function closeFieldworkDetails() {
    fwTabs.forEach((t) => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    fwPanels.forEach((p) => p.classList.remove('active'));
    if (fwPanelsContainer) {
      fwPanelsContainer.classList.remove('active');
    }
  }

  if (fwTabs.length && fwPanels.length) {
    fwTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const isAlreadyActive = tab.classList.contains('active');
        if (isAlreadyActive) {
          closeFieldworkDetails();
          return;
        }

        const targetId = tab.dataset.fwTarget;

        fwTabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        if (fwPanelsContainer) {
          fwPanelsContainer.classList.add('active');
        }

        fwPanels.forEach((panel) => {
          panel.classList.toggle('active', panel.id === targetId);
        });
      });
    });

    if (fwCloseBtn) {
      fwCloseBtn.addEventListener('click', closeFieldworkDetails);
    }
  }

  // ==========================================================================
  // Section 3: 底部模式按钮 (Vision / Audio / Pose / Extension) 切换静态图
  // ==========================================================================
  const modeTabs = document.querySelectorAll('.exp-mode-tab');
  const modeImages = document.querySelectorAll('.expansion-image');
  const originalCallouts = document.querySelectorAll('.original-callout');
  const extensionCallouts = document.querySelectorAll('.extension-callout');

  if (modeTabs.length) {
    modeTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        if (tab.classList.contains('active')) return;

        modeTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const targetId = tab.dataset.target;
        modeImages.forEach((img) => {
          img.classList.toggle('active', img.id === targetId);
        });

        // 标注联动：Original 显示 8 条标注，Expansion 显示扩展标注（切换时平滑重置动画）
        originalCallouts.forEach((callout) => {
          callout.classList.toggle('active', targetId === 'image-vision');
        });
        extensionCallouts.forEach((callout) => {
          callout.classList.toggle('active', targetId === 'image-extension');
        });
      });
    });
  }

  // ==========================================================================
  // Viture 风格视差引擎（滚动唤醒 + 位置预测量）
  // 旧版每帧 getBoundingClientRect 采样：即使静止也 60fps 强制整页回流，
  // 大模糊背景层更新滞后导致滚动时背景"抖动"；且位移公式含上帧位移形成反馈。
  // 新版：文档位置只在初始化/resize/布局变化时测量一次，滚动过程零布局读取；
  // 位移直接由滚动位置计算（测量时减去已知位移还原布局位置），与滚动严格同步。
  // ==========================================================================
  const parallaxEls = document.querySelectorAll('[data-parallax]');

  const pItems = Array.from(parallaxEls).map((el) => ({
    el,
    speed: parseFloat(el.dataset.parallax) || 0.1,
    top: 0,    // 元素在文档中的布局位置（不含视差位移）
    height: 0,
    t: 0,      // 当前已施加的位移，测量时用来还原布局位置
  }));

  let lastDocHeight = 0;
  let parallaxRafId = 0;
  let parallaxIdleFrames = 0;

  function measureParallax() {
    pItems.forEach((item) => {
      const rect = item.el.getBoundingClientRect();
      // rect.top 含视差位移：减去 t 得到未位移的布局位置
      item.top = rect.top + window.scrollY - item.t;
      item.height = rect.height;
    });
    lastDocHeight = document.body.scrollHeight;
  }

  function updateParallax() {
    const vh = window.innerHeight;
    const scrollY = window.scrollY;

    // 布局高度变化（图片加载、字体就绪等）时重测；滚动不改变布局，不会触发
    if (document.body.scrollHeight !== lastDocHeight) measureParallax();

    let anyVisible = false;

    pItems.forEach((item) => {
      const viewTop = item.top - scrollY; // 视口坐标（不含位移）
      if (viewTop + item.height < -180 || viewTop > vh + 180) return; // 离屏：保持当前值

      anyVisible = true;
      const offset = (viewTop + item.height / 2 - vh / 2) * item.speed;
      item.t = -offset;
      item.el.style.transform = `translate3d(0, ${(-offset).toFixed(2)}px, 0)`;
    });

    // 全部离屏连续 12 帧后停帧省空转；scroll/resize 时唤醒
    if (!anyVisible) {
      parallaxIdleFrames += 1;
      if (parallaxIdleFrames > 12) {
        parallaxRafId = 0;
        parallaxIdleFrames = 0;
        return;
      }
    } else {
      parallaxIdleFrames = 0;
    }

    parallaxRafId = requestAnimationFrame(updateParallax);
  }

  function wakeParallax() {
    if (!parallaxRafId) {
      parallaxRafId = requestAnimationFrame(updateParallax);
    }
  }

  // 滚动唤醒（passive 不阻碍手势）；resize 后布局必变，重测后再唤醒
  window.addEventListener('scroll', wakeParallax, { passive: true });
  window.addEventListener('resize', () => {
    measureParallax();
    wakeParallax();
  });
  window.addEventListener('load', measureParallax);

  measureParallax();
  parallaxRafId = requestAnimationFrame(updateParallax);

  // ==========================================================================
  // 全屏整屏自动吸附轮播滚动引擎（Full-Page Snap Scroll Controller）
  // 杜绝卡在两屏中间，滚轮/键盘/滑动手势均自动覆盖整屏（100vh）
  // ==========================================================================
  const screenNavDots = document.querySelectorAll('.screen-nav-dot');
  const sectionIds = [
    'hero',
    'field-work',
    'features',
    'sensing-system',
    'protective-design',
    'your-rules',
    'open-sdk',
    'community-builders',
    'customization'
  ];

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  let navTops = [];
  let isWheelLocked = false;
  let wheelUnlockTimer = null;
  let scrollSnapDebounceTimer = null;

  function measureScreenNav() {
    navTops = sections.map((sec) => {
      return sec.getBoundingClientRect().top + window.scrollY;
    });
  }

  function getClosestIndex() {
    const currentY = window.scrollY;
    let closestIndex = 0;
    let minDiff = Infinity;
    for (let i = 0; i < navTops.length; i += 1) {
      const diff = Math.abs(currentY - navTops[i]);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }
    return closestIndex;
  }

  function syncScreenNav() {
    const probe = window.scrollY + window.innerHeight * 0.42;
    let activeIndex = 0;
    for (let i = 0; i < navTops.length; i += 1) {
      if (probe >= navTops[i]) activeIndex = i;
    }
    screenNavDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
  }

  function scrollToSection(index, smooth = true) {
    if (index < 0 || index >= sections.length) return;
    measureScreenNav();
    const targetTop = navTops[index];
    screenNavDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    window.scrollTo({
      top: targetTop,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  // 1. 桌面端滚轮整屏切换（杜绝停滞在中间）
  window.addEventListener('wheel', (e) => {
    const modal = document.getElementById('action-modal');
    if (modal && modal.classList.contains('active')) return;

    const navDropdownMenu = document.getElementById('nav-dropdown-menu');
    if (navDropdownMenu && navDropdownMenu.classList.contains('active')) return;

    // 过滤极微小颤动
    if (Math.abs(e.deltaY) < 18) return;

    // 阻止浏览器默认零碎停顿滚动
    e.preventDefault();

    if (isWheelLocked) {
      clearTimeout(wheelUnlockTimer);
      wheelUnlockTimer = setTimeout(() => {
        isWheelLocked = false;
      }, 160);
      return;
    }

    const currentIndex = getClosestIndex();
    let nextIndex = currentIndex;

    if (e.deltaY > 0) {
      nextIndex = Math.min(sections.length - 1, currentIndex + 1);
    } else {
      nextIndex = Math.max(0, currentIndex - 1);
    }

    isWheelLocked = true;
    scrollToSection(nextIndex, true);

    clearTimeout(wheelUnlockTimer);
    wheelUnlockTimer = setTimeout(() => {
      isWheelLocked = false;
    }, 700);
  }, { passive: false });

  // 2. 键盘上/下/空格键整屏切换
  window.addEventListener('keydown', (e) => {
    const modal = document.getElementById('action-modal');
    if (modal && modal.classList.contains('active')) return;

    const activeEl = document.activeElement;
    const tag = activeEl ? activeEl.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || (activeEl && activeEl.isContentEditable)) return;

    if (['ArrowDown', 'PageDown', ' '].includes(e.key) && !e.shiftKey) {
      e.preventDefault();
      const curr = getClosestIndex();
      if (curr < sections.length - 1) scrollToSection(curr + 1, true);
    } else if (['ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey)) {
      e.preventDefault();
      const curr = getClosestIndex();
      if (curr > 0) scrollToSection(curr - 1, true);
    } else if (e.key === 'Home') {
      e.preventDefault();
      scrollToSection(0, true);
    } else if (e.key === 'End') {
      e.preventDefault();
      scrollToSection(sections.length - 1, true);
    }
  });

  // 3. 触屏滑动手势支持
  let touchStartY = 0;
  let touchStartX = 0;
  let isTouching = false;

  window.addEventListener('touchstart', (e) => {
    const modal = document.getElementById('action-modal');
    if (modal && modal.classList.contains('active')) return;
    if (e.touches.length === 1) {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      isTouching = true;
    }
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (!isTouching) return;
    isTouching = false;
    const modal = document.getElementById('action-modal');
    if (modal && modal.classList.contains('active')) return;

    if (e.changedTouches.length === 1) {
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaY) > 45 && Math.abs(deltaY) > Math.abs(deltaX)) {
        const curr = getClosestIndex();
        if (deltaY < 0 && curr < sections.length - 1) {
          scrollToSection(curr + 1, true);
        } else if (deltaY > 0 && curr > 0) {
          scrollToSection(curr - 1, true);
        }
      }
    }
  }, { passive: true });

  // 4. 左侧圆点点击切换
  screenNavDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      scrollToSection(index, true);
    });
  });

  // 5. 滚动同步与停滞自动吸附校准
  function autoSnapToNearest() {
    if (isWheelLocked) return;
    measureScreenNav();
    const currentY = window.scrollY;
    const closestIdx = getClosestIndex();
    const targetY = navTops[closestIdx];
    if (Math.abs(currentY - targetY) > 4) {
      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
      screenNavDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === closestIdx);
      });
    }
  }

  window.addEventListener('scroll', () => {
    syncScreenNav();
    if (!isWheelLocked) {
      clearTimeout(scrollSnapDebounceTimer);
      scrollSnapDebounceTimer = setTimeout(autoSnapToNearest, 180);
    }
  }, { passive: true });

  window.addEventListener('resize', measureScreenNav);
  window.addEventListener('load', () => {
    measureScreenNav();
    syncScreenNav();
  });

  measureScreenNav();
  syncScreenNav();

  // ==========================================================================
  // Section 9: Applications 3D Infinite Circular Loop Carousel Logic
  // ==========================================================================
  const stageContainer = document.querySelector('.carousel-stage-container');
  const slideCards = document.querySelectorAll('.theme-slide-card');
  const indicatorDots = document.querySelectorAll('.indicator-dot');
  const arrowPrev = document.getElementById('stage-arrow-prev');
  const arrowNext = document.getElementById('stage-arrow-next');

  let currentSlideIndex = 0;
  const totalSlides = slideCards.length;

  function update3DCarousel(activeIndex) {
    if (!slideCards.length || !stageContainer) return;

    currentSlideIndex = (activeIndex + totalSlides) % totalSlides;

    slideCards.forEach((card, idx) => {
      // Calculate circular offset relative to activeIndex (for 3 slides: -1, 0, 1)
      let diff = idx - currentSlideIndex;
      if (diff === -2) diff = 1;
      if (diff === 2) diff = -1;

      if (diff === 0) {
        // Active Center Slide
        card.style.transform = 'translate(-50%, 0) scale(1)';
        card.style.opacity = '1';
        card.style.filter = 'none';
        card.style.zIndex = '10';
        card.style.pointerEvents = 'auto';
        card.classList.add('active');
      } else if (diff === -1) {
        // Left Preview Slide (Circular Wrapped)
        card.style.transform = 'translate(calc(-50% - 100% - 2.5rem), 0) scale(0.85)';
        card.style.opacity = '0.25';
        card.style.filter = 'blur(4px) brightness(0.4)';
        card.style.zIndex = '5';
        card.style.pointerEvents = 'none';
        card.classList.remove('active');
      } else if (diff === 1) {
        // Right Preview Slide (Circular Wrapped)
        card.style.transform = 'translate(calc(-50% + 100% + 2.5rem), 0) scale(0.85)';
        card.style.opacity = '0.25';
        card.style.filter = 'blur(4px) brightness(0.4)';
        card.style.zIndex = '5';
        card.style.pointerEvents = 'none';
        card.classList.remove('active');
      }
    });

    // Update bottom indicator dots
    indicatorDots.forEach((dot, idx) => {
      if (idx === currentSlideIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  if (slideCards.length) {
    // Initial position
    update3DCarousel(0);

    // Prev / Next Arrows (Endless Infinite Circular Loop!)
    if (arrowPrev) {
      arrowPrev.addEventListener('click', () => update3DCarousel(currentSlideIndex - 1));
    }
    if (arrowNext) {
      arrowNext.addEventListener('click', () => update3DCarousel(currentSlideIndex + 1));
    }

    // Indicator Dots
    indicatorDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => update3DCarousel(idx));
    });

    // Handle window resize
    window.addEventListener('resize', () => update3DCarousel(currentSlideIndex));
  }

  // Initialize Section 3 Features Dynamic Noise Grain
  initFeaturesNoise();
}

// ==========================================================================
// Section 3: Features Dynamic Noise Grain Overlay & Radial Spotlight
// ==========================================================================
function initFeaturesNoise() {
  const canvas = document.getElementById('features-noise-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let animationId = 0;
  let frame = 0;
  const canvasSize = 1024;
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  const patternRefreshInterval = 2;
  const patternAlpha = 18; // 0-255

  // Pre-generate 8 frames of noise for high performance and zero GC pauses
  const framePoolCount = 8;
  const noiseFrames = [];

  for (let f = 0; f < framePoolCount; f++) {
    const imgData = ctx.createImageData(canvasSize, canvasSize);
    const buf = new Uint32Array(imgData.data.buffer);
    const len = buf.length;
    for (let i = 0; i < len; i++) {
      const v = (Math.random() * 255) | 0;
      // Little-endian RGBA: (A << 24) | (B << 16) | (G << 8) | R
      buf[i] = (patternAlpha << 24) | (v << 16) | (v << 8) | v;
    }
    noiseFrames.push(imgData);
  }

  let currentFrameIdx = 0;
  const drawGrain = () => {
    ctx.putImageData(noiseFrames[currentFrameIdx], 0, 0);
    currentFrameIdx = (currentFrameIdx + 1) % framePoolCount;
  };

  // Initial draw
  drawGrain();

  let isVisible = false;

  const loop = () => {
    if (!isVisible) return;
    if (frame % patternRefreshInterval === 0) {
      drawGrain();
    }
    frame++;
    animationId = window.requestAnimationFrame(loop);
  };

  const startLoop = () => {
    if (!isVisible) {
      isVisible = true;
      animationId = window.requestAnimationFrame(loop);
    }
  };

  const stopLoop = () => {
    isVisible = false;
    if (animationId) {
      window.cancelAnimationFrame(animationId);
      animationId = 0;
    }
  };

  // Only animate when features section is visible in viewport
  const section = document.getElementById('features');
  if (section && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startLoop();
        } else {
          stopLoop();
        }
      });
    }, { threshold: 0.05 });
    observer.observe(section);
  } else {
    startLoop();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}


