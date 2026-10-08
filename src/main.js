// ==========================================================================
// reGoggles Banner - Flat Image & Interactive Section Logic
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Modal Elements
  const modalBackdrop = document.getElementById('action-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-title-text');
  const modalDesc = document.getElementById('modal-desc-text');

  const joinBtn = document.getElementById('join-community-btn');
  const subscribeBtn = document.getElementById('subscribe-btn');
  const contactBtn = document.getElementById('contact-us-btn');

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

  if (contactBtn) {
    contactBtn.addEventListener('click', () => {
      openModal(
        'Contact reGoggles Team',
        'Have technical inquiries, partnership proposals, or media questions? Leave your email and we will reach out.'
      );
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

  let currentTx = 0;

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

    // 精准计算绝对屏幕中轴对齐（扣除外部容器内边距/外边距偏移）
    const trackRectLeft = iterationTrack.getBoundingClientRect().left;
    const trackBaseLeft = trackRectLeft - currentTx;
    const cardCenterInTrack = currentCard.offsetLeft + currentCard.offsetWidth / 2;

    const targetTranslate = screenCenter - trackBaseLeft - cardCenterInTrack;

    currentTx = targetTranslate;
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
});
