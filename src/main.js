// ==========================================================================
// reGoggles Banner - 3D Interactive Model & Section Logic
// ==========================================================================
import { initHero3D } from './hero3d.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Three.js interactive 3D hero model viewer
  initHero3D();

  // Modal Elements
  const modalBackdrop = document.getElementById('action-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-title-text');
  const modalDesc = document.getElementById('modal-desc-text');

  const joinBtn = document.getElementById('join-community-btn');
  const subscribeBtn = document.getElementById('subscribe-btn');
  const contactBtn = document.getElementById('contact-us-btn');
  const buildContactBtn = document.getElementById('build-contact-btn');

  function openModal(title, desc) {
    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;
    if (modalBackdrop) modalBackdrop.classList.add('active');
  }

  function closeModal() {
    if (modalBackdrop) modalBackdrop.classList.remove('active');
  }

  if (joinBtn) {
    joinBtn.addEventListener('click', () => {
      openModal(
        'Join 100 Community Builders',
        'Be among the first developers, makers, and AI roboticists shaping reGoggles. Enter your email below:'
      );
    });
  }

  if (subscribeBtn) {
    subscribeBtn.addEventListener('click', () => {
      openModal(
        'Subscribe to reGoggles Updates',
        'Stay updated with the latest news, hardware builds, and developer releases.'
      );
    });
  }

  const handleContactClick = () => {
    openModal(
      'Contact reGoggles Team',
      'Have technical inquiries, partnership proposals, or media questions? Leave your email and we will reach out.'
    );
  };

  if (contactBtn) {
    contactBtn.addEventListener('click', handleContactClick);
  }

  if (buildContactBtn) {
    buildContactBtn.addEventListener('click', handleContactClick);
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

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

  // VoltPile 100% 梯形 3D 百叶窗吸顶滚动复刻
  const communityWrapper = document.getElementById('community-builders');
  const slatBlades = document.querySelectorAll('.slat-blade');

  function updateBlindsOnScroll() {
    if (!communityWrapper || !slatBlades.length) return;

    const rect = communityWrapper.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const totalScrollableDistance = rect.height - windowHeight;

    // 当用户刚滑动到 Section 2 时，rect.top 为 0，progress 为 0（此时背景为 100% 纯色暗绿，遮挡底层图片）
    // 当用户在 Section 2 内部继续下拉时，rect.top 从 0 减少到 -totalScrollableDistance，progress 从 0.0 渐变为 1.0
    let progress = -rect.top / totalScrollableDistance;
    progress = Math.max(0, Math.min(1, progress));

    const numSlats = slatBlades.length;
    slatBlades.forEach((blade, index) => {
      // 级联波浪动画延迟
      const staggerStart = (index / numSlats) * 0.35;
      const staggerEnd = staggerStart + 0.65;
      const slatProgress = Math.max(0, Math.min(1, (progress - staggerStart) / (staggerEnd - staggerStart)));

      // 梯形百叶窗收缩 scaleY (初始 1.38 保证纯色覆盖 -> 渐变收缩至 0 露出高清底层图片)
      const currentScale = 1.38 * (1 - slatProgress);
      const opacity = slatProgress >= 0.96 ? (1 - slatProgress) / 0.04 : 1;

      // 初始 slatProgress 为 0 时为 0% 与 100%（纯色平整底，无侧边锯齿），滚动开合时平滑过度到 8% 与 92% 梯形
      const insetPercent = (slatProgress * 8.0).toFixed(2);
      const rightPercent = (100 - slatProgress * 8.0).toFixed(2);
      const clipPath = `polygon(${insetPercent}% 0%, ${rightPercent}% 0%, 100% 100%, 0% 100%)`;

      blade.style.transform = `scaleY(${currentScale.toFixed(4)})`;
      blade.style.clipPath = clipPath;
      blade.style.opacity = opacity.toFixed(3);
    });
  }

  window.addEventListener('scroll', updateBlindsOnScroll, { passive: true });
  updateBlindsOnScroll();

  // Section 3: ID Product Iteration Step-by-Step Sensitive Carousel
  const evolvingWrapper = document.getElementById('evolving');
  const iterationTrack = document.getElementById('iteration-track');
  const iterationCards = document.querySelectorAll('.iteration-card');

  function updateIterationOnScroll() {
    if (!evolvingWrapper || !iterationTrack || !iterationCards.length) return;

    const rect = evolvingWrapper.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const totalScrollableDistance = rect.height - windowHeight;

    if (totalScrollableDistance <= 0) return;

    // 原始滚动进度 (0.0 到 1.0)
    let rawProgress = -rect.top / totalScrollableDistance;
    rawProgress = Math.max(0, Math.min(1, rawProgress));

    // 默认是 V1.0 (Index 0) 在正中间，滚一下 (rawProgress > 0) 立刻触发下一个图 V2.0
    let snappedIndex = 0;
    if (rawProgress <= 0.001) {
      snappedIndex = 0; // 默认 V1.0
    } else if (rawProgress < 0.33) {
      snappedIndex = 1; // 触发 V2.0
    } else if (rawProgress < 0.67) {
      snappedIndex = 2; // 触发 V3.0
    } else {
      snappedIndex = 3; // 触发 V4.0
    }

    const screenCenter = window.innerWidth / 2;
    const currentCard = iterationCards[snappedIndex];

    // 静态计算绝对屏幕中轴对齐，绝不读取动效中变化的 getBoundingClientRect，彻底消灭抖动跳跃
    const cardCenterInTrack = currentCard.offsetLeft + currentCard.offsetWidth / 2;
    const targetTranslate = screenCenter - cardCenterInTrack;

    iterationTrack.style.transform = `translateX(${targetTranslate}px)`;

    // 动态卡片放大：正中央当前选中卡片 100% 居中放大 (scale 2.05)，两侧卡片缩小淡化 (scale 0.72)
    iterationCards.forEach((card, idx) => {
      const isCurrent = idx === snappedIndex;
      const scale = isCurrent ? 2.05 : 0.72;
      const opacity = isCurrent ? 1 : 0.42;

      card.style.transform = `scale(${scale.toFixed(2)})`;
      card.style.opacity = opacity.toFixed(2);
    });
  }

  if (evolvingWrapper && iterationTrack && iterationCards.length) {
    window.addEventListener('scroll', updateIterationOnScroll, { passive: true });
    window.addEventListener('resize', updateIterationOnScroll);
    updateIterationOnScroll();
  }

  // ==========================================================================
  // Section 4: Versatile Expansion Interactive Accordion & Video Switcher
  // ==========================================================================
  const expansionItems = document.querySelectorAll('.expansion-item');
  const expansionVideos = document.querySelectorAll('.expansion-video');
  const hudStatusText = document.getElementById('hud-status-text');
  const hotspotGeneral = document.getElementById('hotspot-general');
  const hotspotVision = document.getElementById('hotspot-vision');
  const videoGen = document.getElementById('video-general');
  const videoVis = document.getElementById('video-vision');

  function updateHotspotsVisibility() {
    // 02 General Expansion Port Hotspot
    if (hotspotGeneral && videoGen) {
      const item02 = document.querySelector('.expansion-item[data-target="video-general"]');
      const isItem02Active = item02 && item02.classList.contains('active') && videoGen.classList.contains('active');
      if (isItem02Active && (videoGen.ended || (videoGen.paused && videoGen.currentTime > 0))) {
        hotspotGeneral.classList.add('active');
      } else {
        hotspotGeneral.classList.remove('active');
      }
    }

    // 03 Vision Expansion Port Hotspot
    if (hotspotVision && videoVis) {
      const item03 = document.querySelector('.expansion-item[data-target="video-vision"]');
      const isItem03Active = item03 && item03.classList.contains('active') && videoVis.classList.contains('active');
      if (isItem03Active && (videoVis.ended || (videoVis.paused && videoVis.currentTime > 0))) {
        hotspotVision.classList.add('active');
      } else {
        hotspotVision.classList.remove('active');
      }
    }
  }

  if (videoGen) {
    videoGen.addEventListener('ended', updateHotspotsVisibility);
    videoGen.addEventListener('play', updateHotspotsVisibility);
    videoGen.addEventListener('playing', updateHotspotsVisibility);
    videoGen.addEventListener('pause', updateHotspotsVisibility);
  }

  if (videoVis) {
    videoVis.addEventListener('ended', updateHotspotsVisibility);
    videoVis.addEventListener('play', updateHotspotsVisibility);
    videoVis.addEventListener('playing', updateHotspotsVisibility);
    videoVis.addEventListener('pause', updateHotspotsVisibility);
  }

  // Initialize 1.5x speed for all expansion videos
  expansionVideos.forEach((video) => {
    video.playbackRate = 1.5;
    video.addEventListener('play', () => { video.playbackRate = 1.5; });
    video.addEventListener('playing', () => { video.playbackRate = 1.5; });
  });

  if (expansionItems.length) {
    expansionItems.forEach((item) => {
      item.addEventListener('click', () => {
        if (item.classList.contains('active')) return;

        // 1. Update active item in left accordion list
        expansionItems.forEach((el) => el.classList.remove('active'));
        item.classList.add('active');

        // 2. Switch right video display (plays once & freezes on last frame at 1.5x speed)
        const targetVideoId = item.dataset.target;
        const targetStatus = item.dataset.status;

        expansionVideos.forEach((video) => {
          if (video.id === targetVideoId) {
            video.classList.add('active');
            try {
              video.currentTime = 0;
              video.playbackRate = 1.5;
              const p = video.play();
              if (p && p.catch) p.catch(() => {});
            } catch (e) {}
          } else {
            video.classList.remove('active');
          }
        });

        // 3. Immediately evaluate hotspots visibility (hides while playing)
        updateHotspotsVisibility();

        // 4. Update HUD overlay status badge
        if (hudStatusText && targetStatus) {
          hudStatusText.textContent = targetStatus;
        }
      });
    });
  }

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
});


