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
  const modalDiscordJumpBtn = document.getElementById('modal-discord-jump-btn');
  const DISCORD_COMMUNITY_URL = 'https://discord.com/channels/862602258452578314/1564833194052816976';

  const navContactBtn = document.getElementById('nav-contact-btn');
  const joinBtn = document.getElementById('join-community-btn');
  const subscribeBtn = document.getElementById('subscribe-btn');
  const contactBtn = document.getElementById('contact-us-btn');
  const buildContactBtn = document.getElementById('build-contact-btn');

  // Hero Banner Action Buttons
  const heroContactBtn = document.getElementById('hero-contact-btn');
  const heroSubscribeBtn = document.getElementById('hero-subscribe-btn');
  const heroJoinBtn = document.getElementById('hero-join-btn');

  // ==========================================================================
  // 数据埋点与飞书多维表格（Feishu Base）自动化联动
  // ==========================================================================
  const FEISHU_WEBHOOK_URL = 'https://seeedstudio.feishu.cn/base/automation/webhook/event/Qd0DajOjnwKtXPhUpnecQTXjnKc';

  function getVisitorId() {
    try {
      let vid = localStorage.getItem('regoggles_vid');
      if (!vid) {
        vid = 'v_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
        localStorage.setItem('regoggles_vid', vid);
      }
      return vid;
    } catch (e) {
      return 'v_anonymous_' + Math.random().toString(36).substring(2, 8);
    }
  }

  function getDeviceType() {
    const ua = navigator.userAgent || '';
    if (/iPad|Tablet|(Android(?!.*Mobile))/i.test(ua)) return 'Tablet';
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) return 'Mobile';
    return 'Desktop';
  }

  function formatCurrentTime() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  const SECTION_LABELS = {
    'hero': 'Hero (首屏)',
    'field-work': 'Field Worker (工业巡检)',
    'features': 'Features (工业设计与特性)',
    'sensing-system': 'Sensing System (扩展系统)',
    'protective-design': 'Protective Design (安全防护)',
    'your-rules': 'Your Rules (数据主权与AI私有化)',
    'open-sdk': 'Open SDK (开源开发者生态)',
    'community-builders': 'Community (社区与生态合作)',
    'customization': 'Customization (柔性制造定制)'
  };

  const visitedSections = new Set();
  let currentActiveSectionId = 'hero';

  function getCurrentSectionName() {
    return SECTION_LABELS[currentActiveSectionId] || currentActiveSectionId;
  }

  function trackEvent(eventType, eventName, options = {}) {
    try {
      const payload = {
        event_type: eventType,
        event_name: eventName,
        section: options.section || getCurrentSectionName(),
        target: options.target || '',
        extra_info: options.extra_info || '',
        device: getDeviceType(),
        screen_size: `${window.innerWidth}x${window.innerHeight}`,
        visitor_id: getVisitorId(),
        timestamp: formatCurrentTime(),
        url: window.location.href,
        referrer: document.referrer || 'direct'
      };

      console.log('[reGoggles 埋点数据]', payload);

      const jsonStr = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        const blob = new Blob([jsonStr], { type: 'text/plain;charset=UTF-8' });
        navigator.sendBeacon(FEISHU_WEBHOOK_URL, blob);
      } else {
        fetch(FEISHU_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: jsonStr
        }).catch(() => {});
      }
    } catch (err) {
      // 埋点异常严防阻断主业务流程
      console.warn('[reGoggles 埋点微异常]', err);
    }
  }

  let isCommunityModal = false;
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

    isCommunityModal = !!showDiscord;
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
    if (modalPrivacyRow) {
      modalPrivacyRow.style.display = showPrivacy ? 'block' : 'none';
      modalPrivacyRow.classList.remove('privacy-error');
    }
    if (modalPrivacyCheckbox) {
      modalPrivacyCheckbox.checked = false; // 遵循欧盟 GDPR 合规要求：默认不预先勾选，必须由用户自主主动勾选
      modalPrivacyCheckbox.required = false; // 由 JS 显式校验，防止隐藏 input 导致原生校验静默阻断表单
    }

    if (modalDiscordGroup) {
      modalDiscordGroup.style.display = showDiscord ? 'flex' : 'none';
    }
    if (modalDiscordInput) {
      modalDiscordInput.required = !!showDiscord;
      modalDiscordInput.value = '';
    }

    const errorMsgEl = document.getElementById('modal-error-msg');
    if (errorMsgEl) {
      errorMsgEl.style.display = 'none';
      errorMsgEl.textContent = '';
    }
    if (modalSubmitBtn) modalSubmitBtn.disabled = false;

    if (modalForm) modalForm.style.display = 'flex';
    if (modalSuccess) modalSuccess.style.display = 'none';
    if (modalDiscordJumpBtn) modalDiscordJumpBtn.style.display = 'none';
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
    const errorMsgEl = document.getElementById('modal-error-msg');
    if (errorMsgEl) {
      errorMsgEl.style.display = 'none';
      errorMsgEl.textContent = '';
    }
    if (modalSubmitBtn) modalSubmitBtn.disabled = false;
    if (modalBackdrop) modalBackdrop.classList.remove('active');
  }

  function subscribeToMailchimp(email, discordName) {
    return new Promise((resolve) => {
      const callbackName = 'mc_cb_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
      const url = new URL('https://seeedstudio.us11.list-manage.com/subscribe/post-json');
      url.searchParams.set('u', '0c272aa6642cc5d058579205f');
      url.searchParams.set('id', '4b071a49e3');
      url.searchParams.set('f_id', '0093fde0f0');
      url.searchParams.set('c', callbackName);
      url.searchParams.set('EMAIL', email);
      url.searchParams.set('tags', '9372724,9372726');
      url.searchParams.set('b_0c272aa6642cc5d058579205f_4b071a49e3', '');
      if (discordName) {
        url.searchParams.set('NAME', discordName);
      }

      let timeoutId = null;
      const script = document.createElement('script');

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        delete window[callbackName];
        if (script.parentNode) script.parentNode.removeChild(script);
      };

      window[callbackName] = function(resp) {
        cleanup();
        resolve(resp);
      };

      script.onerror = function() {
        cleanup();
        resolve({ result: 'fallback', msg: 'Network or adblock error' });
      };

      timeoutId = setTimeout(() => {
        cleanup();
        resolve({ result: 'fallback', msg: 'Timeout' });
      }, 6000);

      script.src = url.toString();
      document.head.appendChild(script);
    });
  }

  const handleJoinClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    trackEvent('join_community_open', '打开加入社区弹窗', {
      target: e?.currentTarget?.id || 'join-btn'
    });
    openModal({
      title: 'Join Community',
      desc: 'Subscribe and Join Our Discord Community.',
      btnText: 'Subscribe & Join Discord',
      showDiscord: true,
      showPrivacy: true,
      successTitle: 'Welcome to the Community!',
      successDesc: 'Thank you for joining our community! Redirecting you to our Discord channel...'
    });
  };

  const handleSubscribeClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    trackEvent('subscribe_open', '打开订阅弹窗', {
      target: e?.currentTarget?.id || 'subscribe-btn'
    });
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
    const targetId = e?.currentTarget?.id || 'contact-btn';
    let label = '点击联系我们';
    let sectionName = getCurrentSectionName();
    if (targetId === 'nav-contact-btn') {
      label = '点击联系我们 (顶部导航)';
      sectionName = 'Navigation';
    } else if (targetId === 'hero-contact-btn') {
      label = '点击联系我们 (首屏)';
      sectionName = SECTION_LABELS['hero'];
    } else if (targetId === 'build-contact-btn') {
      label = '点击联系我们 (定制板块)';
      sectionName = SECTION_LABELS['customization'];
    }
    trackEvent('contact_click', label, { target: targetId, section: sectionName });

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
    modalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = modalEmailInput ? modalEmailInput.value.trim() : '';
      if (!email) return;

      const errorMsgEl = document.getElementById('modal-error-msg');
      if (errorMsgEl) {
        errorMsgEl.style.display = 'none';
        errorMsgEl.textContent = '';
      }

      if (modalPrivacyCheckbox && modalPrivacyRow && modalPrivacyRow.style.display !== 'none' && !modalPrivacyCheckbox.checked) {
        if (errorMsgEl) {
          errorMsgEl.textContent = 'Please check the box to agree to our Privacy Policy.';
          errorMsgEl.style.display = 'block';
        }
        if (modalPrivacyRow) {
          modalPrivacyRow.classList.add('privacy-error');
        }
        return;
      }
      if (modalPrivacyRow) {
        modalPrivacyRow.classList.remove('privacy-error');
      }

      const originalBtnText = modalBtnText ? modalBtnText.textContent : 'Subscribe';
      if (modalBtnText) modalBtnText.textContent = 'Subscribing...';
      if (modalSubmitBtn) modalSubmitBtn.disabled = true;

      const triggerSuccess = () => {
        if (modalSuccessTitle) modalSuccessTitle.textContent = currentSuccessConfig.title;
        if (modalSuccessDesc) modalSuccessDesc.textContent = currentSuccessConfig.desc;

        // In-card success state feedback
        if (modalForm) modalForm.style.display = 'none';
        if (modalTitle) modalTitle.style.display = 'none';
        if (modalDesc) modalDesc.style.display = 'none';
        if (modalSuccess) modalSuccess.style.display = 'flex';

        // 埋点上报成功
        if (isCommunityModal) {
          trackEvent('join_community_success', '成功提交加入社区', {
            target: 'subscribe-form',
            extra_info: `Email: ${email}, Discord: ${discord}`
          });

          if (modalDiscordJumpBtn) {
            modalDiscordJumpBtn.style.display = 'inline-flex';
          }

          // 自动跳转到指定的 Discord 频道链接
          try {
            window.open(DISCORD_COMMUNITY_URL, '_blank', 'noopener,noreferrer');
          } catch (err) {
            console.warn('Popup blocked, button available on screen', err);
          }

          modalAutoCloseTimer = setTimeout(() => {
            closeModal();
          }, 8000);
        } else {
          trackEvent('subscribe_success', '成功提交订阅', {
            target: 'subscribe-form',
            extra_info: `Email: ${email}`
          });

          if (modalDiscordJumpBtn) {
            modalDiscordJumpBtn.style.display = 'none';
          }

          modalAutoCloseTimer = setTimeout(() => {
            closeModal();
          }, 3200);
        }
      };

      try {
        const resp = await subscribeToMailchimp(email, discord);
        if (modalSubmitBtn) modalSubmitBtn.disabled = false;
        if (modalBtnText) modalBtnText.textContent = originalBtnText;

        if (resp && resp.result === 'success') {
          triggerSuccess();
        } else if (resp && resp.result === 'fallback') {
          // JSONP 回退：在静默隐藏 iframe 中提交，绝对不跳转也不开新标签页
          modalForm.target = 'mailchimp_silent_iframe';
          modalForm.submit();
          triggerSuccess();
        } else {
          // 显示 Mailchimp 返回的校验提示
          const rawMsg = (resp && resp.msg) ? resp.msg : 'Subscription failed. Please check your email.';
          const cleanMsg = rawMsg.replace(/^\d+\s*-\s*/, '');
          if (errorMsgEl) {
            errorMsgEl.innerHTML = cleanMsg;
            errorMsgEl.style.display = 'block';
          } else {
            alert(cleanMsg);
          }
        }
      } catch (err) {
        if (modalSubmitBtn) modalSubmitBtn.disabled = false;
        if (modalBtnText) modalBtnText.textContent = originalBtnText;
        modalForm.target = 'mailchimp_silent_iframe';
        modalForm.submit();
        triggerSuccess();
      }
    });
  }

  if (modalPrivacyCheckbox) {
    modalPrivacyCheckbox.addEventListener('change', () => {
      if (modalPrivacyCheckbox.checked) {
        const errorMsgEl = document.getElementById('modal-error-msg');
        if (errorMsgEl && errorMsgEl.textContent.includes('Privacy Policy')) {
          errorMsgEl.style.display = 'none';
          errorMsgEl.textContent = '';
        }
        if (modalPrivacyRow) {
          modalPrivacyRow.classList.remove('privacy-error');
        }
      }
    });
  }

  const privacyLink = document.querySelector('.modal-privacy-link');
  if (privacyLink) {
    privacyLink.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  if (modalDiscordJumpBtn) {
    modalDiscordJumpBtn.addEventListener('click', () => {
      closeModal();
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
      const linkText = link.textContent.trim();
      trackEvent('nav_click', '点击导航菜单项: ' + linkText, {
        target: targetHash
      });
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
        const tabTitle = tab.querySelector('.fieldwork-tab-title')?.textContent?.trim() || tab.textContent.trim();
        trackEvent('tab_click', '切换工业巡检Tab: ' + tabTitle, {
          target: targetId,
          section: SECTION_LABELS['field-work']
        });

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
        const tabTitle = tab.textContent.trim();
        trackEvent('tab_click', '切换扩展系统视图: ' + tabTitle, {
          target: targetId,
          section: SECTION_LABELS['sensing-system']
        });
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

    const activeSectionId = sectionIds[activeIndex] || 'hero';
    if (activeSectionId !== currentActiveSectionId) {
      currentActiveSectionId = activeSectionId;
      if (!visitedSections.has(activeSectionId)) {
        visitedSections.add(activeSectionId);
        trackEvent('section_view', '浏览板块: ' + (SECTION_LABELS[activeSectionId] || activeSectionId), {
          section: SECTION_LABELS[activeSectionId] || activeSectionId,
          target: activeSectionId
        });
      }
    }
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
      const secId = sectionIds[index] || `section-${index}`;
      trackEvent('screen_nav_click', '点击左侧导航点: ' + (SECTION_LABELS[secId] || `第${index + 1}屏`), {
        target: secId,
        section: SECTION_LABELS[secId]
      });
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

  // 记录初次页面加载 PV 埋点
  visitedSections.add('hero');
  trackEvent('page_view', '访问页面', {
    target: 'landing_page',
    section: SECTION_LABELS['hero']
  });

  // ==========================================================================
  // Smart Video Autoplay & Energy Saving via IntersectionObserver
  // (Saves battery, GPU and bandwidth by only playing videos when visible)
  // ==========================================================================
  const bgVideos = document.querySelectorAll('.section-bg-video, .protective-video');
  if (bgVideos.length && 'IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (video.paused) {
            video.play().catch(() => {});
          }
        } else {
          if (!video.paused) {
            video.pause();
          }
        }
      });
    }, { rootMargin: '120px 0px 120px 0px', threshold: 0.05 });

    bgVideos.forEach((v) => videoObserver.observe(v));
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


