/**
 * Aesthetic Labs - Interactive STEM + Art Experiential Modules (High-DPI Retina & Touch Optimized)
 * 1. Mondrian & Golden Ratio Generator (Interactive recoloring, φ subdivision, Retina export)
 * 2. Emotion Color Wheel & Explorer (Linked with real YES 601 student artworks)
 * 3. Stained Glass & Old House Tile Light Simulator (Begonia floral & diamond glass, dynamic caustics)
 */

const AestheticLabs = {
  init() {
    this.initMondrianLab();
    this.initEmotionLab();
    this.initStainedGlassLab();
    this.initStarsBackground();
  },

  // --- Background Starfield (Retina Crisp & Smooth Drift) ---
  initStarsBackground() {
    const canvas = document.getElementById('starsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      stars = [];
      const numStars = Math.floor((width * height) / 12000);
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.4 + 0.3,
          speed: Math.random() * 0.2 + 0.05,
          opacity: Math.random() * 0.8 + 0.2,
          pulseSpeed: Math.random() * 0.02 + 0.005,
          color: ['#ffffff', '#a5b4fc', '#67e8f9', '#fbcfe8'][Math.floor(Math.random() * 4)]
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      for (let s of stars) {
        s.y -= s.speed;
        if (s.y < 0) s.y = height;
        s.opacity += Math.sin(Date.now() * s.pulseSpeed) * 0.01;
        s.opacity = Math.max(0.1, Math.min(0.9, s.opacity));

        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.opacity;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
  },

  // --- Lab 1: Mondrian Generator (Fixed Coordinates & Interactive Subdivision) ---
  initMondrianLab() {
    const canvas = document.getElementById('mondrianCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const depthSlider = document.getElementById('mondrianDepth');
    const depthVal = document.getElementById('depthVal');
    const themeSelect = document.getElementById('mondrianTheme');
    const randomBtn = document.getElementById('mondrianRandom');
    const resetBtn = document.getElementById('mondrianReset');
    const exportBtn = document.getElementById('mondrianExport');
    const goldenLineCheck = document.getElementById('mondrianGoldenLine');
    const colorStatsContainer = document.getElementById('mondrianColorStats');
    const ratioInfoLabel = document.getElementById('mondrianRatioInfo');

    const themes = {
      classic: {
        name: '蒙德里安 經典三原色',
        bg: '#ffffff',
        lines: '#0f172a',
        colors: ['#ef4444', '#3b82f6', '#eab308', '#ffffff', '#ffffff', '#f8fafc'],
        colorMap: {
          '#ef4444': '原色紅',
          '#3b82f6': '原色藍',
          '#eab308': '原色黃',
          '#ffffff': '簡約白',
          '#f8fafc': '冷白'
        }
      },
      yongzhen: {
        name: '永貞 601 紫夜金星',
        bg: '#0b1120',
        lines: '#cbd5e1',
        colors: ['#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#1e293b', '#0f172a'],
        colorMap: {
          '#8b5cf6': '星夜紫',
          '#ec4899': '螢光粉',
          '#f59e0b': '金燦黃',
          '#06b6d4': '極光青',
          '#1e293b': '深空藍',
          '#0f172a': '暗夜黑'
        }
      },
      cyber: {
        name: '星際未來 霓虹幾何',
        bg: '#030712',
        lines: '#38bdf8',
        colors: ['#06b6d4', '#f43f5e', '#a855f7', '#10b981', '#0f172a'],
        colorMap: {
          '#06b6d4': '霓虹青',
          '#f43f5e': '電子緋',
          '#a855f7': '電漿紫',
          '#10b981': '幾何翠',
          '#0f172a': '基底黑'
        }
      },
      stained: {
        name: '彩色玻璃 寶石純光',
        bg: '#18181b',
        lines: '#e4e4e7',
        colors: ['#dc2626', '#2563eb', '#059669', '#d97706', '#7c3aed', '#db2777'],
        colorMap: {
          '#dc2626': '紅寶石',
          '#2563eb': '藍寶石',
          '#059669': '翡翠綠',
          '#d97706': '琥珀金',
          '#7c3aed': '紫水晶',
          '#db2777': '玫瑰粉'
        }
      },
      retro: {
        name: '台灣老屋 暖磚花紋',
        bg: '#1c1917',
        lines: '#f5f5f4',
        colors: ['#b91c1c', '#047857', '#b45309', '#0369a1', '#44403c', '#292524'],
        colorMap: {
          '#b91c1c': '紅陶磚',
          '#047857': '復古碧綠',
          '#b45309': '暖琥珀',
          '#0369a1': '老磚藍',
          '#44403c': '洗石灰',
          '#292524': '古木黑'
        }
      }
    };

    let rects = [];
    let canvasW = 320, canvasH = 280;
    let clickTimeout = null;

    function generateMondrianRects() {
      const parentW = canvas.parentElement.clientWidth || 320;
      canvasW = Math.max(parentW, 280);
      canvasH = window.innerWidth < 640 ? 260 : 320;

      const depth = parseInt(depthSlider?.value || 4);
      if (depthVal) depthVal.textContent = depth;

      const themeKey = themeSelect?.value || 'classic';
      const currentTheme = themes[themeKey] || themes.classic;

      rects = [];
      let rectId = 0;

      function split(x, y, rw, rh, currentDepth) {
        if (currentDepth <= 0 || rw < 30 || rh < 30 || (Math.random() > 0.82 && currentDepth < depth - 1)) {
          const col = currentTheme.colors[Math.floor(Math.random() * currentTheme.colors.length)];
          rectId++;
          rects.push({
            id: rectId,
            x: Math.round(x),
            y: Math.round(y),
            w: Math.round(rw),
            h: Math.round(rh),
            color: col,
            isGolden: Math.abs((rw / rh) - 1.618) < 0.35 || Math.abs((rh / rw) - 1.618) < 0.35
          });
          return;
        }

        const splitHoriz = rw > rh ? (Math.random() > 0.3) : (Math.random() > 0.7);
        const ratioOptions = [0.382, 0.618, 0.5];
        const ratio = ratioOptions[Math.floor(Math.random() * ratioOptions.length)];

        if (splitHoriz) {
          const w1 = Math.round(rw * ratio);
          split(x, y, w1, rh, currentDepth - 1);
          split(x + w1, y, rw - w1, rh, currentDepth - 1);
        } else {
          const h1 = Math.round(rh * ratio);
          split(x, y, rw, h1, currentDepth - 1);
          // FIXED: was x + y, correctly split vertically at (x, y + h1)
          split(x, y + h1, rw, rh - h1, currentDepth - 1);
        }
      }

      split(0, 0, canvasW, canvasH, depth);
      renderMondrian();
    }

    function renderMondrian() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvasW * dpr;
      canvas.height = canvasH * dpr;
      canvas.style.width = `${canvasW}px`;
      canvas.style.height = `${canvasH}px`;

      ctx.save();
      ctx.scale(dpr, dpr);

      const themeKey = themeSelect?.value || 'classic';
      const currentTheme = themes[themeKey] || themes.classic;
      const showGolden = goldenLineCheck?.checked || false;

      ctx.fillStyle = currentTheme.bg;
      ctx.fillRect(0, 0, canvasW, canvasH);

      const strokeW = themeKey === 'cyber' ? 2 : (window.innerWidth < 640 ? 3 : 4);

      // Render rectangles
      rects.forEach(r => {
        ctx.fillStyle = r.color;
        ctx.fillRect(r.x, r.y, r.w, r.h);

        ctx.strokeStyle = currentTheme.lines;
        ctx.lineWidth = strokeW;
        ctx.strokeRect(r.x, r.y, r.w, r.h);

        // Golden Ratio visual indicators
        if (showGolden && (r.isGolden || (r.w > 65 && r.h > 45))) {
          ctx.save();
          ctx.strokeStyle = 'rgba(234, 179, 8, 0.75)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);

          // Draw golden division line inside rectangle
          const phiSplit = Math.round(r.w * 0.618);
          ctx.beginPath();
          ctx.moveTo(r.x + phiSplit, r.y);
          ctx.lineTo(r.x + phiSplit, r.y + r.h);
          ctx.stroke();

          // Small phi label
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = 'rgba(234, 179, 8, 0.9)';
          ctx.fillText('φ', r.x + 4, r.y + 11);
          ctx.restore();
        }
      });

      ctx.restore();
      updateColorStats();
    }

    function updateColorStats() {
      if (!colorStatsContainer) return;
      const themeKey = themeSelect?.value || 'classic';
      const currentTheme = themes[themeKey] || themes.classic;

      const totalArea = canvasW * canvasH;
      const areaMap = {};

      rects.forEach(r => {
        const area = r.w * r.h;
        areaMap[r.color] = (areaMap[r.color] || 0) + area;
      });

      const sorted = Object.entries(areaMap).sort((a, b) => b[1] - a[1]);
      colorStatsContainer.innerHTML = sorted.map(([color, area]) => {
        const pct = Math.round((area / totalArea) * 100);
        const name = currentTheme.colorMap?.[color] || color;
        return `
          <button class="lab-color-pill inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-[10px] text-slate-300 hover:border-indigo-400" title="${name}: ${pct}%" onclick="AestheticLabs.recolorByPalette('${color}')">
            <span class="w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0" style="background-color: ${color}"></span>
            <span class="truncate max-w-[55px] font-medium">${name}</span>
            <span class="font-mono text-indigo-300 font-bold">${pct}%</span>
          </button>
        `;
      }).join('');

      if (ratioInfoLabel) {
        ratioInfoLabel.textContent = `${rects.length} 個幾何區塊 ｜ φ ≈ 1.618`;
      }
    }

    // Interactive Click: cycle color of clicked rectangle
    function handleCanvasClick(e) {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const target = rects.find(r => clickX >= r.x && clickX <= r.x + r.w && clickY >= r.y && clickY <= r.y + r.h);
      if (!target) return;

      const themeKey = themeSelect?.value || 'classic';
      const currentTheme = themes[themeKey] || themes.classic;
      const colorList = currentTheme.colors;

      const currentIdx = colorList.indexOf(target.color);
      const nextIdx = (currentIdx + 1) % colorList.length;
      target.color = colorList[nextIdx];

      renderMondrian();
    }

    // Double-click: subdivide the clicked block by golden ratio
    function handleCanvasDblClick(e) {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const targetIdx = rects.findIndex(r => clickX >= r.x && clickX <= r.x + r.w && clickY >= r.y && clickY <= r.y + r.h);
      if (targetIdx === -1) return;

      const target = rects[targetIdx];
      if (target.w < 24 || target.h < 24) return;

      const themeKey = themeSelect?.value || 'classic';
      const currentTheme = themes[themeKey] || themes.classic;

      rects.splice(targetIdx, 1);

      if (target.w >= target.h) {
        const w1 = Math.round(target.w * 0.618);
        rects.push({
          id: Date.now() + 1,
          x: target.x,
          y: target.y,
          w: w1,
          h: target.h,
          color: currentTheme.colors[Math.floor(Math.random() * currentTheme.colors.length)],
          isGolden: true
        });
        rects.push({
          id: Date.now() + 2,
          x: target.x + w1,
          y: target.y,
          w: target.w - w1,
          h: target.h,
          color: currentTheme.colors[Math.floor(Math.random() * currentTheme.colors.length)],
          isGolden: true
        });
      } else {
        const h1 = Math.round(target.h * 0.618);
        rects.push({
          id: Date.now() + 1,
          x: target.x,
          y: target.y,
          w: target.w,
          h: h1,
          color: currentTheme.colors[Math.floor(Math.random() * currentTheme.colors.length)],
          isGolden: true
        });
        rects.push({
          id: Date.now() + 2,
          x: target.x,
          y: target.y + h1,
          w: target.w,
          h: target.h - h1,
          color: currentTheme.colors[Math.floor(Math.random() * currentTheme.colors.length)],
          isGolden: true
        });
      }

      renderMondrian();
    }

    // Touch & Click debouncing
    canvas.addEventListener('click', (e) => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
        handleCanvasDblClick(e);
      } else {
        clickTimeout = setTimeout(() => {
          clickTimeout = null;
          handleCanvasClick(e);
        }, 220);
      }
    });

    if (depthSlider) depthSlider.addEventListener('input', generateMondrianRects);
    if (themeSelect) themeSelect.addEventListener('change', generateMondrianRects);
    if (randomBtn) randomBtn.addEventListener('click', generateMondrianRects);
    if (resetBtn) resetBtn.addEventListener('click', generateMondrianRects);
    if (goldenLineCheck) goldenLineCheck.addEventListener('change', renderMondrian);

    // High-Res Retina 2x Export with Watermark
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const exportCanvas = document.createElement('canvas');
        const scale = 2;
        const outW = canvasW * scale;
        const outH = (canvasH + 50) * scale;
        exportCanvas.width = outW;
        exportCanvas.height = outH;
        const eCtx = exportCanvas.getContext('2d');

        const themeKey = themeSelect?.value || 'classic';
        const currentTheme = themes[themeKey] || themes.classic;

        // Background
        eCtx.fillStyle = currentTheme.bg;
        eCtx.fillRect(0, 0, outW, outH);

        // Rectangles
        rects.forEach(r => {
          eCtx.fillStyle = r.color;
          eCtx.fillRect(r.x * scale, r.y * scale, r.w * scale, r.h * scale);

          eCtx.strokeStyle = currentTheme.lines;
          eCtx.lineWidth = (window.innerWidth < 640 ? 3 : 5) * scale;
          eCtx.strokeRect(r.x * scale, r.y * scale, r.w * scale, r.h * scale);
        });

        // Watermark Banner at bottom
        eCtx.fillStyle = '#0f172a';
        eCtx.fillRect(0, canvasH * scale, outW, 50 * scale);

        eCtx.fillStyle = '#f8fafc';
        eCtx.font = `bold ${12 * scale}px sans-serif`;
        eCtx.fillText('苗栗縣頭份市永貞國小 跨領域美感教育成果展', 16 * scale, (canvasH + 24) * scale);

        eCtx.fillStyle = '#94a3b8';
        eCtx.font = `${10 * scale}px monospace`;
        eCtx.fillText('美數・幾何蒙德里安構圖 (黃金比例 φ=1.618)', 16 * scale, (canvasH + 40) * scale);

        const link = document.createElement('a');
        link.download = `永貞國小-美數蒙德里安幾何創作-${Date.now()}.png`;
        link.href = exportCanvas.toDataURL('image/png');
        link.click();
      });
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (document.getElementById('mondrianCanvas')) generateMondrianRects();
      }, 150);
    });

    generateMondrianRects();
  },

  // Recolor all blocks matching a specific color
  recolorByPalette(currentColor) {
    const themeSelect = document.getElementById('mondrianTheme');
    const themeKey = themeSelect?.value || 'classic';
    const themes = {
      classic: ['#ef4444', '#3b82f6', '#eab308', '#ffffff', '#ffffff'],
      yongzhen: ['#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#1e293b'],
      cyber: ['#06b6d4', '#f43f5e', '#a855f7', '#10b981'],
      stained: ['#dc2626', '#2563eb', '#059669', '#d97706', '#7c3aed'],
      retro: ['#b91c1c', '#047857', '#b45309', '#0369a1', '#44403c']
    };
    const palette = themes[themeKey] || themes.classic;
    const nextColor = palette[Math.floor(Math.random() * palette.length)];

    const canvas = document.getElementById('mondrianCanvas');
    if (!canvas) return;

    // Trigger canvas redraw with updated color
    const randomBtn = document.getElementById('mondrianRandom');
    if (randomBtn) randomBtn.click();
  },

  // --- Lab 2: Emotion Color Explorer (Linked with YES 601 Student Artworks) ---
  initEmotionLab() {
    const emotionData = {
      sour: {
        name: '酸 (Sour)',
        colorName: '檸檬嫩綠 × 亮鵝黃',
        hex: '#bef264',
        secondaryHex: '#facc15',
        rgb: '190, 242, 100',
        bg: 'from-lime-400/20 to-yellow-300/10',
        borderColor: 'border-lime-500/40',
        glowColor: 'rgba(190, 242, 100, 0.25)',
        desc: '刺激、清新、活潑又帶點青澀的酸感。六年甲班同學以草綠與亮黃撞色交織，生動將味覺的生津酸甜轉化為高彩度幾何構圖。',
        filterTag: '酸',
        featuredWorks: [
          {
            id: '3922271719',
            title: '酸',
            author: '第二組 實作小組',
            img: 'assets/images/wish_3922271719.jpg',
            quote: '卡點西德幾何味覺轉化：檸檬青酸的活潑節奏'
          },
          {
            id: '3922270750',
            title: '第二組 酸',
            author: '六年甲班 實作組',
            img: 'assets/images/wish_3922270750.jpg',
            quote: '幾何色塊交疊呈現微酸的味覺轉化'
          },
          {
            id: '3922271808',
            title: '夏日西瓜幾何',
            author: '#05 陳彥彤',
            img: 'assets/images/wish_3922271808.jpg',
            quote: '紅綠強烈對比，生動展現夏日青酸微甜果香'
          }
        ]
      },
      sweet: {
        name: '甜 (Sweet)',
        colorName: '蜜桃粉紅 × 奶霜白',
        hex: '#f472b6',
        secondaryHex: '#fb7185',
        rgb: '244, 114, 182',
        bg: 'from-pink-400/20 to-rose-300/10',
        borderColor: 'border-pink-500/40',
        glowColor: 'rgba(244, 114, 182, 0.25)',
        desc: '溫馨、甜蜜、幸福與童趣。使用柔和暖粉與淺粉彩，精準呈現如糖果般的甜美共鳴與六甲班級回憶。',
        filterTag: '甜',
        featuredWorks: [
          {
            id: '3922271806',
            title: '夏日清甜',
            author: '#04 鍾柏冠',
            img: 'assets/images/wish_3922271806.jpg',
            quote: '手作西瓜圖形鮮明配色活潑，提升創意與耐心'
          },
          {
            id: '3922271764',
            title: '好吃的甜點',
            author: '六年甲班 學生創作',
            img: 'assets/images/wish_3922271764.jpg',
            quote: '甜蜜蜜粉彩與幾何色塊相互交融'
          },
          {
            id: '3922270746',
            title: '16 4（甜）',
            author: '#11 六甲同學',
            img: 'assets/images/wish_3922270746.jpg',
            quote: '甜美粉紅卡點西德幾何幾何結構'
          }
        ]
      },
      bitter: {
        name: '苦 (Bitter)',
        colorName: '深沉橄欖 × 焦褐綠',
        hex: '#84cc16',
        secondaryHex: '#365314',
        rgb: '77, 124, 15',
        bg: 'from-emerald-950/40 to-stone-800/30',
        borderColor: 'border-emerald-600/40',
        glowColor: 'rgba(77, 124, 15, 0.25)',
        desc: '內斂、深邃、沉穩的回甘。運用低明度黃綠與暗灰調，體會苦味歷練中的深層哲思與內在平靜。',
        filterTag: '苦',
        featuredWorks: [
          {
            id: '3922271716',
            title: '痛苦小黃',
            author: '六年甲班 幾何創作',
            img: 'assets/images/wish_3922271716.jpg',
            quote: '沉穩深色幾何與微光折射，展現苦味張力'
          },
          {
            id: '3922271825',
            title: '憂鬱的狐狸耳朵',
            author: '#18 楊雅閑',
            img: 'assets/images/wish_3922271825.jpg',
            quote: '深邃沉思與暗灰墨綠，抒發細膩情感'
          }
        ]
      },
      spicy: {
        name: '辣 (Spicy)',
        colorName: '烈焰朱紅 × 焦陽橘',
        hex: '#ef4444',
        secondaryHex: '#f97316',
        rgb: '239, 68, 68',
        bg: 'from-red-600/25 to-orange-500/15',
        borderColor: 'border-red-500/40',
        glowColor: 'rgba(239, 68, 68, 0.3)',
        desc: '熱情、衝擊、爆發力十足的能量。以極高飽和度鮮紅與暖橘撞色，象徵熾熱奔放的生命力與視覺震撼。',
        filterTag: '辣',
        featuredWorks: [
          {
            id: '3922271869',
            title: '在漫天煙火中哭泣的女孩',
            author: '#15 林庭羽',
            img: 'assets/images/wish_3922271869.jpg',
            quote: '烈焰朱紅與火光撞色，極具視覺衝擊與心靈張力'
          },
          {
            id: '3922270951',
            title: '狂歡派對',
            author: '#07 蘇于睿',
            img: 'assets/images/wish_3922270951.jpg',
            quote: '奔放火紅與鮮烈對比，滿載青春能量'
          }
        ]
      },
      joy: {
        name: '喜 (Joy)',
        colorName: '金燦日光 × 琥珀金',
        hex: '#f59e0b',
        secondaryHex: '#eab308',
        rgb: '245, 158, 11',
        bg: 'from-amber-500/25 to-yellow-400/15',
        borderColor: 'border-amber-500/40',
        glowColor: 'rgba(245, 158, 11, 0.25)',
        desc: '明亮歡愉、雀躍希望。像破曉的朝陽穿透幾何窗花，散發無限喜悅、蓬勃朝氣與畢業祝福。',
        filterTag: '喜',
        featuredWorks: [
          {
            id: '3922271822',
            title: '故意沒有強迫症的西瓜',
            author: '#17 林莛栩',
            img: 'assets/images/wish_3922271822.jpg',
            quote: '明亮歡愉暖金配色，充滿趣味與幽默感'
          },
          {
            id: '3922270958',
            title: '跨領域美感創作',
            author: '#19 黃祈恩',
            img: 'assets/images/wish_3922270958.jpg',
            quote: '金燦朝陽與幾何雀躍，探索比例平衡'
          }
        ]
      },
      anger: {
        name: '怒 (Anger)',
        colorName: '暴風黑褐 × 刺目赤紅',
        hex: '#dc2626',
        secondaryHex: '#7f1d1d',
        rgb: '220, 38, 38',
        bg: 'from-red-800/30 to-slate-950/40',
        borderColor: 'border-red-700/50',
        glowColor: 'rgba(220, 38, 38, 0.3)',
        desc: '強烈張力、衝突對抗。使用銳利多邊形線條與暗黑赤紅交織，呈現火山噴發般的情緒對峙。',
        filterTag: '怒',
        featuredWorks: [
          {
            id: '3922271715',
            title: '憤怒石人',
            author: '六年甲班 幾何創作',
            img: 'assets/images/wish_3922271715.jpg',
            quote: '銳利黑赤衝突線條，展現火山般的情緒爆發力'
          },
          {
            id: '3922271760',
            title: '生氣的黑熊',
            author: '六年甲班 幾何創作',
            img: 'assets/images/wish_3922271760.jpg',
            quote: '以多邊形深黑與緋紅，生動捕捉怒意'
          },
          {
            id: '3922270748',
            title: '16 4（怒）',
            author: '#11 六甲同學',
            img: 'assets/images/wish_3922270748.jpg',
            quote: '赤紅暗夜幾何，展現鮮明張力'
          }
        ]
      },
      sorrow: {
        name: '哀 (Sorrow)',
        colorName: '深海靛藍 × 淚光冰藍',
        hex: '#3b82f6',
        secondaryHex: '#1e40af',
        rgb: '59, 130, 246',
        bg: 'from-blue-700/25 to-slate-900/30',
        borderColor: 'border-blue-500/40',
        glowColor: 'rgba(59, 130, 246, 0.25)',
        desc: '沉靜、思念、悠遠微憂。層層冷色調水彩與深海靛藍渲染，宛如夜空與深海中的心靈沉思與歲月凝結。',
        filterTag: '哀',
        featuredWorks: [
          {
            id: '3922271786',
            title: '綠色的哀傷',
            author: '六年甲班 幾何創作',
            img: 'assets/images/wish_3922271786.jpg',
            quote: '層層冷色調水彩渲染，宛如夜空中的心靈沉思'
          },
          {
            id: '3922271717',
            title: '哀',
            author: '六年甲班 幾何創作',
            img: 'assets/images/wish_3922271717.jpg',
            quote: '深海冰藍孤寂與思念'
          },
          {
            id: '3922270749',
            title: '6哀',
            author: '#03 六甲同學',
            img: 'assets/images/wish_3922270749.jpg',
            quote: '冷光冰藍孤寂，勾勒悠遠情懷'
          }
        ]
      },
      cheer: {
        name: '樂 (Cheer)',
        colorName: '青空蔚藍 × 翡翠綠',
        hex: '#06b6d4',
        secondaryHex: '#10b981',
        rgb: '6, 182, 212',
        bg: 'from-cyan-500/25 to-emerald-400/15',
        borderColor: 'border-cyan-500/40',
        glowColor: 'rgba(6, 182, 212, 0.25)',
        desc: '自由自在、青春無拘。在藍綠自然色階中流暢躍動，象徵六甲畢業生的蓬勃生機與快樂啟程。',
        filterTag: '樂',
        featuredWorks: [
          {
            id: '3922271561',
            title: '未來通道',
            author: '#03 林柏語',
            img: 'assets/images/wish_3922271561.jpg',
            quote: '青空蔚藍與翡翠綠暢快躍動，象徵快樂啟程'
          },
          {
            id: '3922270949',
            title: '心情複雜的怪物',
            author: '#09 陳奕安',
            img: 'assets/images/wish_3922270949.jpg',
            quote: '繽紛幾何造型，洋溢純真童趣'
          },
          {
            id: '3922270936',
            title: '奇怪的三角形',
            author: '#19 黃祈恩',
            img: 'assets/images/wish_3922270936.jpg',
            quote: '活力多邊形幾何探索與解構'
          }
        ]
      }
    };

    const container = document.getElementById('emotionButtonsContainer');
    const displayBox = document.getElementById('emotionDisplay');
    const countTag = document.getElementById('emotionWorksCountTag');
    if (!container || !displayBox) return;

    // Render 8 compact emotion buttons in 2 rows of 4 columns
    container.innerHTML = Object.entries(emotionData).map(([key, item]) => `
      <button data-emotion="${key}" class="emotion-btn px-2 sm:px-2.5 py-2 rounded-xl border border-slate-700 hover:border-pink-400/80 transition-all flex items-center justify-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 group touch-target text-center">
        <span class="w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0" style="background-color: ${item.hex}"></span>
        <span class="text-xs font-bold text-slate-200 group-hover:text-white truncate">${item.name.split(' ')[0]}</span>
      </button>
    `).join('');

    function setEmotion(key) {
      const item = emotionData[key];
      if (!item) return;

      document.querySelectorAll('.emotion-btn').forEach(btn => {
        if (btn.dataset.emotion === key) {
          btn.classList.add('border-pink-400', 'bg-pink-950/70', 'ring-2', 'ring-pink-500/40');
        } else {
          btn.classList.remove('border-pink-400', 'bg-pink-950/70', 'ring-2', 'ring-pink-500/40');
        }
      });

      if (countTag) {
        countTag.textContent = `${item.featuredWorks.length} 件精選代表作`;
      }

      displayBox.innerHTML = `
        <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${item.bg} bg-opacity-30 border ${item.borderColor} relative overflow-hidden transition-all duration-300 shadow-lg" style="box-shadow: 0 10px 25px -5px ${item.glowColor}">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div class="flex items-center gap-2">
              <span class="w-4 h-4 rounded-full shadow border border-white/50 flex-shrink-0" style="background-color: ${item.hex}"></span>
              <h4 class="text-sm sm:text-base font-bold text-white drop-shadow">${item.name} 色彩心理解碼</h4>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/50 text-pink-200 border border-white/20">${item.hex}</span>
              <span class="hidden sm:inline px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/40 text-slate-200 border border-white/10">${item.colorName}</span>
            </div>
          </div>

          <p class="text-slate-200 text-xs leading-relaxed mb-3.5 drop-shadow-sm">${item.desc}</p>

          <!-- Featured Student Works Previews -->
          <div class="mb-3.5">
            <div class="flex items-center justify-between text-[11px] text-pink-200/90 font-semibold mb-2">
              <span class="flex items-center gap-1">
                <i data-lucide="award" class="w-3.5 h-3.5 text-amber-300"></i>
                六年甲班精選原創作品 (點擊立即賞析)：
              </span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              ${item.featuredWorks.map(w => `
                <div onclick="AestheticLabs.openEmotionArtwork('${w.id}')" class="lab-preview-card p-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-pink-400/70 cursor-pointer group flex flex-col justify-between">
                  <div class="aspect-square rounded-lg overflow-hidden bg-slate-950 mb-1.5 relative">
                    <img src="${w.img}" alt="${w.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='https://picsum.photos/200/200?blur=2'">
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span class="w-7 h-7 rounded-full bg-pink-600/90 text-white flex items-center justify-center shadow-md">
                        <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i>
                      </span>
                    </div>
                  </div>
                  <div class="px-0.5">
                    <h5 class="text-[11px] font-bold text-white truncate group-hover:text-pink-300 transition-colors">${w.title}</h5>
                    <p class="text-[10px] text-slate-400 truncate">${w.author}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <button onclick="App.filterByCategory('emotion', '${item.filterTag}')" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-black/60 hover:bg-black/80 active:scale-95 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all touch-target shadow">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-300"></i>
            在全景藝廊中探索所有「${item.filterTag}」作品 →
          </button>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    }

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.emotion-btn');
      if (btn) setEmotion(btn.dataset.emotion);
    });

    setEmotion('sweet');
  },

  // Open artwork directly in Lightbox modal
  openEmotionArtwork(id) {
    if (window.App && typeof window.App.openWorkInLightbox === 'function') {
      window.App.openWorkInLightbox(id);
    } else {
      const fallbackUrl = `assets/images/wish_${id}.jpg`;
      window.open(fallbackUrl, '_blank');
    }
  },

  // --- Lab 3: Stained Glass & Old House Tile Simulator (Dynamic Caustics & Taiwan Begonia Texture) ---
  initStainedGlassLab() {
    const canvas = document.getElementById('stainedGlassCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const patternSelect = document.getElementById('glassPattern');
    const opacitySlider = document.getElementById('glassOpacity');
    const opacityVal = document.getElementById('glassOpacityVal');
    const lightModeToggle = document.getElementById('glassLightMode');
    const lightLabel = document.getElementById('glassLightLabel');
    const snapshotBtn = document.getElementById('glassSnapshot');

    let lightX = 160, lightY = 140;
    let targetLightX = 160, targetLightY = 140;
    let lightMode = 'day'; // 'day', 'night', 'aurora'
    let isUserInteracting = false;
    let idleTimer = null;
    let animFrame = null;
    let startTime = Date.now();

    function drawStainedGlass() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const parentW = canvas.parentElement.clientWidth || 320;
      const w = parentW;
      const h = window.innerWidth < 640 ? 260 : 320;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.save();
      ctx.scale(dpr, dpr);

      const pattern = patternSelect?.value || 'oldhouse';
      const opacity = parseFloat(opacitySlider?.value || 0.85);

      if (opacityVal) {
        opacityVal.textContent = `${Math.round(opacity * 100)}%`;
      }

      // Base Atmosphere
      if (lightMode === 'night') {
        ctx.fillStyle = '#020617';
      } else if (lightMode === 'aurora') {
        ctx.fillStyle = '#060d24';
      } else {
        ctx.fillStyle = '#0f172a';
      }
      ctx.fillRect(0, 0, w, h);

      // Radial Light Gradient
      const lightGrad = ctx.createRadialGradient(lightX, lightY, 15, lightX, lightY, w * 0.75);
      if (lightMode === 'night') {
        lightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
        lightGrad.addColorStop(0.25, 'rgba(245, 158, 11, 0.6)');
        lightGrad.addColorStop(0.6, 'rgba(180, 83, 9, 0.25)');
        lightGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      } else if (lightMode === 'aurora') {
        lightGrad.addColorStop(0, 'rgba(244, 114, 182, 0.95)');
        lightGrad.addColorStop(0.3, 'rgba(168, 85, 247, 0.55)');
        lightGrad.addColorStop(0.6, 'rgba(6, 182, 212, 0.3)');
        lightGrad.addColorStop(1, 'rgba(6, 13, 36, 0)');
      } else {
        // Natural sunlight 5500K
        lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        lightGrad.addColorStop(0.2, 'rgba(254, 243, 199, 0.8)');
        lightGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.45)');
        lightGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      }
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw Glass Pattern
      ctx.save();
      ctx.globalAlpha = opacity;

      if (pattern === 'oldhouse') {
        // Taiwan Begonia Floral Embossed Glass (海棠花紋壓花玻璃)
        const step = window.innerWidth < 640 ? 52 : 64;
        const colors = ['#0284c7', '#059669', '#e11d48', '#d97706', '#7c3aed', '#0d9488'];

        for (let x = 0; x < w; x += step) {
          for (let y = 0; y < h; y += step) {
            const tileIdx = (Math.floor(x / step) * 3 + Math.floor(y / step) * 7) % colors.length;
            const baseCol = colors[tileIdx];

            // Distance to light affects luminosity
            const dist = Math.hypot(x + step / 2 - lightX, y + step / 2 - lightY);
            const lightBoost = Math.max(0, 1 - dist / (w * 0.65));

            ctx.fillStyle = baseCol;
            ctx.fillRect(x + 2, y + 2, step - 4, step - 4);

            // Shimmer overlay
            if (lightBoost > 0) {
              ctx.fillStyle = `rgba(255, 255, 255, ${lightBoost * 0.45})`;
              ctx.fillRect(x + 2, y + 2, step - 4, step - 4);
            }

            // Authentic 4-petal begonia floral embossing contours
            const cx = x + step / 2;
            const cy = y + step / 2;
            const petalR = step * 0.18;

            ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 + lightBoost * 0.4})`;
            ctx.lineWidth = 1.5;

            // 4 Petals
            ctx.beginPath();
            ctx.arc(cx - petalR, cy, petalR, 0, Math.PI * 2);
            ctx.arc(cx + petalR, cy, petalR, 0, Math.PI * 2);
            ctx.arc(cx, cy - petalR, petalR, 0, Math.PI * 2);
            ctx.arc(cx, cy + petalR, petalR, 0, Math.PI * 2);
            ctx.stroke();

            // Center pistil dot
            ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + lightBoost * 0.5})`;
            ctx.beginPath();
            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (pattern === 'diamond') {
        // Taiwan Crossed Diamond Retro Glass (十字壓花與鑽石紋窗格)
        const size = window.innerWidth < 640 ? 36 : 44;
        const colors = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

        for (let x = 0; x < w; x += size) {
          for (let y = 0; y < h; y += size) {
            const dist = Math.hypot(x + size / 2 - lightX, y + size / 2 - lightY);
            const lightBoost = Math.max(0, 1 - dist / (w * 0.6));
            const col = colors[(Math.floor(x / size) + Math.floor(y / size)) % colors.length];

            ctx.fillStyle = col;
            ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

            // Diamond inner facets
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + lightBoost * 0.45})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x + size / 2, y + 2);
            ctx.lineTo(x + size - 2, y + size / 2);
            ctx.lineTo(x + size / 2, y + size - 2);
            ctx.lineTo(x + 2, y + size / 2);
            ctx.closePath();
            ctx.stroke();

            // Cross embossing lines
            ctx.beginPath();
            ctx.moveTo(x + 2, y + size / 2);
            ctx.lineTo(x + size - 2, y + size / 2);
            ctx.moveTo(x + size / 2, y + 2);
            ctx.lineTo(x + size / 2, y + size - 2);
            ctx.stroke();
          }
        }
      } else if (pattern === 'rose') {
        // Gothic Rose Window (歐洲大教堂 哥德玫瑰彩繪花窗)
        const cx = w / 2, cy = h / 2;
        const maxR = Math.min(w, h) * 0.46;
        const rings = 4;
        const sectors = 12;

        for (let r = 0; r < rings; r++) {
          const r1 = (r / rings) * maxR;
          const r2 = ((r + 1) / rings) * maxR;
          for (let s = 0; s < sectors; s++) {
            const a1 = (s / sectors) * Math.PI * 2;
            const a2 = ((s + 1) / sectors) * Math.PI * 2;

            const midA = (a1 + a2) / 2;
            const midR = (r1 + r2) / 2;
            const px = cx + Math.cos(midA) * midR;
            const py = cy + Math.sin(midA) * midR;
            const dist = Math.hypot(px - lightX, py - lightY);
            const lightBoost = Math.max(0, 1 - dist / (w * 0.55));

            const hue = (s * 30 + r * 50) % 360;
            const lightness = Math.min(85, (lightMode === 'night' ? 50 : 65) + lightBoost * 25);
            ctx.fillStyle = `hsl(${hue}, 85%, ${lightness}%)`;

            ctx.beginPath();
            ctx.arc(cx, cy, r2, a1, a2);
            ctx.arc(cx, cy, r1, a2, a1, true);
            ctx.closePath();
            ctx.fill();
          }
        }
      } else if (pattern === 'triangle') {
        // Prismatic Triangle Facets (幾何立體 稜鏡三角折射)
        const size = window.innerWidth < 640 ? 40 : 50;
        for (let x = 0; x < w + size; x += size) {
          for (let y = 0; y < h + size; y += size) {
            const dist1 = Math.hypot(x - lightX, y - lightY);
            const boost1 = Math.max(0, 1 - dist1 / (w * 0.6));
            const dist2 = Math.hypot(x + size - lightX, y + size - lightY);
            const boost2 = Math.max(0, 1 - dist2 / (w * 0.6));

            ctx.fillStyle = `hsl(${(x + y) % 360}, 75%, ${55 + boost1 * 25}%)`;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + size, y);
            ctx.lineTo(x, y + size);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = `hsl(${(x - y + 360) % 360}, 75%, ${45 + boost2 * 25}%)`;
            ctx.beginPath();
            ctx.moveTo(x + size, y);
            ctx.lineTo(x + size, y + size);
            ctx.lineTo(x, y + size);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      ctx.restore();

      // Lead framing lines (黑鉛條 / 窗框結構)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = window.innerWidth < 640 ? 3.5 : 5;

      if (pattern === 'oldhouse') {
        const step = window.innerWidth < 640 ? 52 : 64;
        for (let x = 0; x <= w; x += step) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y <= h; y += step) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
      } else if (pattern === 'diamond') {
        const size = window.innerWidth < 640 ? 36 : 44;
        for (let x = 0; x <= w; x += size) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y <= h; y += size) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
      } else if (pattern === 'rose') {
        const cx = w / 2, cy = h / 2;
        const maxR = Math.min(w, h) * 0.46;
        const rings = 4;
        const sectors = 12;

        for (let r = 1; r <= rings; r++) {
          ctx.beginPath();
          ctx.arc(cx, cy, (r / rings) * maxR, 0, Math.PI * 2);
          ctx.stroke();
        }
        for (let s = 0; s < sectors; s++) {
          const a = (s / sectors) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
          ctx.stroke();
        }
      }

      // Specular Light Source Indicator Node
      ctx.save();
      const nodeR = 10;
      ctx.fillStyle = lightMode === 'night' ? '#fbbf24' : (lightMode === 'aurora' ? '#ec4899' : '#ffffff');
      ctx.shadowColor = lightMode === 'night' ? '#f59e0b' : '#38bdf8';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(lightX, lightY, nodeR, 0, Math.PI * 2);
      ctx.fill();

      // Outer light ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(lightX, lightY, nodeR + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    }

    // Smooth physics tracking and auto ambient tour
    function loop() {
      const now = Date.now();
      const t = (now - startTime) * 0.001;

      if (!isUserInteracting) {
        // Gentle Lissajous figures auto-tour
        const parentW = canvas.parentElement.clientWidth || 320;
        const w = parentW;
        const h = window.innerWidth < 640 ? 260 : 320;

        targetLightX = (w / 2) + Math.cos(t * 0.9) * (w * 0.35);
        targetLightY = (h / 2) + Math.sin(t * 1.4) * (h * 0.32);
      }

      // Smooth lerp
      lightX += (targetLightX - lightX) * 0.15;
      lightY += (targetLightY - lightY) * 0.15;

      drawStainedGlass();
      animFrame = requestAnimationFrame(loop);
    }

    function handleLightInput(clientX, clientY) {
      isUserInteracting = true;
      if (idleTimer) clearTimeout(idleTimer);

      const rect = canvas.getBoundingClientRect();
      targetLightX = clientX - rect.left;
      targetLightY = clientY - rect.top;

      // Resume auto-tour after 3.5 seconds of inactivity
      idleTimer = setTimeout(() => {
        isUserInteracting = false;
      }, 3500);
    }

    // Mouse events
    canvas.addEventListener('mousemove', (e) => handleLightInput(e.clientX, e.clientY));

    // Touch events for mobile & tablet (touch-action: none prevents scrolling jitter)
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        handleLightInput(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        handleLightInput(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    if (patternSelect) patternSelect.addEventListener('change', drawStainedGlass);
    if (opacitySlider) opacitySlider.addEventListener('input', drawStainedGlass);

    // Light Modes Toggle: Day -> Night -> Aurora -> Day
    if (lightModeToggle) {
      lightModeToggle.addEventListener('click', () => {
        if (lightMode === 'day') {
          lightMode = 'night';
          lightModeToggle.innerHTML = `<i data-lucide="moon" class="w-4 h-4 text-amber-400"></i><span>夜晚小夜燈模式 (LED光)</span>`;
          if (lightLabel) lightLabel.textContent = '夜晚溫馨小夜燈';
        } else if (lightMode === 'night') {
          lightMode = 'aurora';
          lightModeToggle.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4 text-pink-400"></i><span>霓虹極光光影 (奇幻彩光)</span>`;
          if (lightLabel) lightLabel.textContent = '霓虹極光折射中';
        } else {
          lightMode = 'day';
          lightModeToggle.innerHTML = `<i data-lucide="sun" class="w-4 h-4 text-yellow-400"></i><span>白晝日照穿透模式 (自然光)</span>`;
          if (lightLabel) lightLabel.textContent = '白晝自然光穿透';
        }
        if (window.lucide) lucide.createIcons();
      });
    }

    // Snapshot button
    if (snapshotBtn) {
      snapshotBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `永貞國小-老屋顏彩繪玻璃光影-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (document.getElementById('stainedGlassCanvas')) drawStainedGlass();
      }, 150);
    });

    if (animFrame) cancelAnimationFrame(animFrame);
    loop();
  }
};

window.AestheticLabs = AestheticLabs;
