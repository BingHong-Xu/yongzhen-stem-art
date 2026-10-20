/**
 * Main Application Logic for Yongzhen STEM+Art Showcase (Curated & Restructured)
 */

const App = {
  data: null,
  currentCategory: 'all',
  currentTab: 'artworks', // 'artworks' or 'process'
  searchQuery: '',
  currentPage: 1,
  pageSize: 18,
  filteredWorks: [],
  currentLightboxIndex: -1,
  touchStartX: 0,
  touchEndX: 0,

  async init() {
    this.data = await DataHelper.loadData();
    if (!this.data) {
      console.error('Failed to load dataset');
      return;
    }

    this.renderHeroStats();
    this.renderTeam();
    this.renderPavilions();
    this.renderMilestonesPhases();
    this.renderEpisodes();
    this.renderTutorials();
    this.renderDocuments();
    this.initGallery();
    this.initLightbox();
    this.initVideoModal();
    this.initNavigation();

    // Initialize Interactive Labs
    if (window.AestheticLabs) {
      window.AestheticLabs.init();
    }

    if (window.lucide) {
      lucide.createIcons();
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.renderGallery();
      }, 200);
    });

    console.log('永貞國小跨領域美感成果網站 重構完成！');
  },

  // --- Hero Stats Counter Animation ---
  renderHeroStats() {
    const stats = [
      { id: 'statWorks', target: this.data.site_info?.total_artworks || this.data.student_works?.length || 304, label: '學生原創藝術品' },
      { id: 'statPhotos', target: this.data.site_info?.total_photos || this.data.process_photos?.length || 196, label: '課堂實踐剪影' },
      { id: 'statVideos', target: (this.data.episodes?.length || 0) + (this.data.tutorials?.length || 0), label: '專題影音與示範' },
      { id: 'statSteps', target: this.data.milestones?.length || 18, label: '跨領域實踐歷程' }
    ];

    stats.forEach(s => {
      const el = document.getElementById(s.id);
      if (!el) return;
      let count = 0;
      const step = Math.ceil(s.target / 35);
      const timer = setInterval(() => {
        count += step;
        if (count >= s.target) {
          count = s.target;
          clearInterval(timer);
        }
        el.innerText = count + (s.id === 'statWorks' || s.id === 'statPhotos' ? '+' : '');
      }, 30);
    });
  },

  // --- Teaching Team ---
  renderTeam() {
    const container = document.getElementById('teamContainer');
    if (!container || !this.data.team) return;

    const roleGradients = [
      'from-indigo-600 to-purple-600',
      'from-blue-600 to-cyan-500',
      'from-pink-600 to-rose-500',
      'from-amber-600 to-orange-500',
      'from-purple-600 to-indigo-600',
      'from-emerald-600 to-teal-500'
    ];

    container.innerHTML = this.data.team.map((member, idx) => {
      const grad = roleGradients[idx % roleGradients.length];

      return `
        <div class="glass-card p-5 sm:p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500/50 transition-all flex flex-col justify-between">
          <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div>
            <div class="flex items-center gap-3.5 mb-3.5">
              <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr ${grad} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform flex-shrink-0">
                <i data-lucide="${member.icon || 'user'}" class="w-5 h-5 sm:w-6 sm:h-6"></i>
              </div>
              <div>
                <h4 class="text-base sm:text-lg font-bold text-white group-hover:text-indigo-200 transition-colors">${member.name}</h4>
                <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-indigo-500/30">${member.role}</span>
              </div>
            </div>
            <p class="text-slate-300 text-xs sm:text-sm leading-relaxed">${member.responsibility}</p>
          </div>
        </div>
      `;
    }).join('');
  },

  // --- Pavilions (Four Core Wings) ---
  renderPavilions() {
    const container = document.getElementById('pavilionsContainer');
    if (!container || !this.data.pavilions) return;

    const pavilionColorMap = {
      part1: { text: 'text-indigo-300', iconBg: 'bg-indigo-600/30 text-indigo-400', btn: 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-200 border-indigo-500/40' },
      part2: { text: 'text-cyan-300', iconBg: 'bg-cyan-600/30 text-cyan-400', btn: 'bg-cyan-600/20 hover:bg-cyan-600 text-cyan-200 border-cyan-500/40' },
      part3: { text: 'text-amber-300', iconBg: 'bg-amber-600/30 text-amber-400', btn: 'bg-amber-600/20 hover:bg-amber-600 text-amber-200 border-amber-500/40' },
      part4: { text: 'text-emerald-300', iconBg: 'bg-emerald-600/30 text-emerald-400', btn: 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-200 border-emerald-500/40' }
    };

    container.innerHTML = this.data.pavilions.map(p => {
      const col = pavilionColorMap[p.id] || pavilionColorMap.part1;

      return `
        <div class="glass-card pavilion-${p.id} p-6 sm:p-8 rounded-3xl relative overflow-hidden group transition-all flex flex-col justify-between">
          <div class="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${p.bg_gradient} rounded-full blur-3xl opacity-40 group-hover:opacity-75 transition-opacity pointer-events-none"></div>
          
          <div>
            <div class="flex items-center justify-between gap-2 mb-4">
              <span class="badge-tag badge-${p.id}">${p.part}</span>
              <span class="text-[11px] font-semibold text-slate-300 bg-slate-800/90 px-3 py-1 rounded-full border border-slate-700">${p.badge}</span>
            </div>
            
            <div class="flex items-center gap-3.5 mb-3">
              <div class="w-11 h-11 rounded-2xl ${col.iconBg} flex items-center justify-center group-hover:scale-105 transition-all flex-shrink-0">
                <i data-lucide="${p.icon || 'sparkles'}" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="text-xl sm:text-2xl font-black text-white group-hover:text-white transition-colors">${p.title}</h3>
                <p class="text-xs sm:text-sm font-medium ${col.text}">${p.subtitle}</p>
              </div>
            </div>
            
            <p class="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 mt-3">${p.desc}</p>
          </div>

          <div class="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <button onclick="App.filterByCategory('${p.id}')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl ${col.btn} active:scale-95 hover:text-white text-xs font-bold border transition-all touch-target">
              <i data-lucide="eye" class="w-4 h-4"></i> 查看展區作品
            </button>
            ${p.breakout_url ? `
              <a href="${p.breakout_url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors py-2">
                <span>分組教室 Padlet</span>
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              </a>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  // --- Curriculum Milestones (Four Pedagogical Phases) ---
  renderMilestonesPhases() {
    const container = document.getElementById('milestonesContainer');
    if (!container || !this.data.milestones) return;

    const phases = [
      {
        title: "階段一：色彩心靈與專注奠基",
        tag: "美感啟蒙",
        color: "border-pink-500/40 text-pink-300 bg-pink-500/10",
        steps: this.data.milestones.slice(0, 4)
      },
      {
        title: "階段二：工藝實構與幾何光影",
        tag: "立體造物",
        color: "border-amber-500/40 text-amber-300 bg-amber-500/10",
        steps: this.data.milestones.slice(4, 8)
      },
      {
        title: "階段三：拓印創作與風格共融",
        tag: "版畫拓印",
        color: "border-indigo-500/40 text-indigo-300 bg-indigo-500/10",
        steps: this.data.milestones.slice(8, 11)
      },
      {
        title: "階段四：數位策展與畢業展演",
        tag: "成果展現",
        color: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
        steps: this.data.milestones.slice(11, 18)
      }
    ];

    container.innerHTML = phases.map(phase => `
      <div class="glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
            <h3 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full ${phase.color.split(' ')[2]}"></span>
              ${phase.title}
            </h3>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${phase.color}">${phase.tag}</span>
          </div>

          <div class="space-y-3">
            ${phase.steps.map(m => `
              <div class="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition-all">
                <span class="w-6 h-6 rounded-lg ${m.status === 'completed' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'} flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                  ${m.step}
                </span>
                <div class="min-w-0 flex-grow">
                  <h4 class="text-xs sm:text-sm font-bold text-slate-100 mb-0.5 truncate">${m.title}</h4>
                  <p class="text-[11px] text-slate-400 leading-relaxed">${m.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');
  },

  // --- Documentary Episodes ---
  renderEpisodes() {
    const container = document.getElementById('episodesContainer');
    if (!container || !this.data.episodes) return;

    const featured = this.data.episodes.slice(0, 12);
    container.innerHTML = featured.map(ep => `
      <div class="glass-card rounded-2xl overflow-hidden group hover:border-cyan-500/40 transition-all flex flex-col justify-between">
        <div class="p-4 sm:p-5">
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="badge-tag bg-red-500/15 text-red-300 border border-red-500/30 text-[10px]">
              <i data-lucide="video" class="w-3 h-3"></i>
              卓越領航紀錄片
            </span>
            <span class="text-[10px] text-slate-500 font-mono">1080P</span>
          </div>
          <h4 class="text-sm sm:text-base font-bold text-white line-clamp-2 group-hover:text-cyan-300 transition-colors mb-2">${ep.title}</h4>
          ${ep.body ? `<div class="text-[11px] sm:text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">${ep.body}</div>` : ''}
        </div>
        
        <div class="p-4 sm:p-5 pt-0">
          <button onclick="App.openVideoModal('${ep.video_url || ep.url}', '${encodeURIComponent(ep.title)}')" class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-indigo-950 flex items-center justify-center gap-2 transition-all touch-target">
            <i data-lucide="play" class="w-4 h-4 fill-current"></i> 播放精華影片
          </button>
        </div>
      </div>
    `).join('');
  },

  // --- YouTube Tutorials ---
  renderTutorials() {
    const container = document.getElementById('tutorialsContainer');
    if (!container || !this.data.tutorials) return;

    const featured = this.data.tutorials.slice(0, 8);
    container.innerHTML = featured.map(tut => {
      let ytId = '';
      const match = (tut.url || tut.video_url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match) ytId = match[1];
      const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';

      return `
        <div class="glass-card rounded-2xl overflow-hidden group hover:border-purple-500/40 transition-all flex flex-col justify-between">
          <div>
            ${thumbUrl ? `
              <div class="relative h-32 sm:h-36 overflow-hidden bg-slate-900">
                <img src="${thumbUrl}" alt="${tut.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
                <div class="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                  <span class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <i data-lucide="play" class="w-4 h-4 fill-current ml-0.5"></i>
                  </span>
                </div>
              </div>
            ` : ''}
            <div class="p-3.5 sm:p-4">
              <h4 class="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-purple-300 transition-colors mb-2">${tut.title}</h4>
            </div>
          </div>
          
          <div class="p-3.5 sm:p-4 pt-0">
            <button onclick="App.openVideoModal('${tut.url || tut.video_url}', '${encodeURIComponent(tut.title)}')" class="w-full py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-all touch-target">
              <i data-lucide="youtube" class="w-3.5 h-3.5 text-red-500"></i> 開啟教學示範
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  // --- Documents & Presentation Files ---
  renderDocuments() {
    const container = document.getElementById('documentsContainer');
    if (!container || !this.data.documents) return;

    container.innerHTML = this.data.documents.map(doc => `
      <div class="glass-card p-4 sm:p-5 rounded-2xl border border-indigo-500/30 flex items-center justify-between gap-4 hover:border-indigo-400 transition-all">
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
            <i data-lucide="file-text" class="w-5 h-5"></i>
          </div>
          <div class="min-w-0">
            <h4 class="text-sm font-bold text-white truncate">${doc.title}</h4>
            <p class="text-xs text-slate-400 truncate">${doc.body || '跨領域美感課程完整教學手冊與成果簡報檔案'}</p>
          </div>
        </div>
        <a href="${doc.file_url || doc.online_url || '#'}" target="_blank" download class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 touch-target">
          <i data-lucide="download" class="w-3.5 h-3.5"></i>
          <span>下載 PDF</span>
        </a>
      </div>
    `).join('');
  },

  // --- Student Works Gallery ---
  getWorkMedia(item) {
    const rawLocal = item.image_url || item.local_path || '';
    const rawOnline = item.online_url || '';

    // Check if local image exists/valid
    if (rawLocal && (rawLocal.startsWith('assets/images/') || /\.(jpg|jpeg|png|gif|webp|svg)($|\?)/i.test(rawLocal))) {
      return {
        type: 'image',
        src: rawLocal,
        fallbackSrc: (rawOnline && /\.(jpg|jpeg|png|gif|webp|svg)($|\?)/i.test(rawOnline)) ? rawOnline : ''
      };
    }

    // Check if online url is an image
    if (rawOnline && /\.(jpg|jpeg|png|gif|webp|svg)($|\?)/i.test(rawOnline)) {
      return {
        type: 'image',
        src: rawOnline,
        fallbackSrc: ''
      };
    }

    // Check YouTube
    const candidateUrl = rawLocal || rawOnline;
    const ytMatch = candidateUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) {
      return {
        type: 'youtube',
        ytId: ytMatch[1],
        src: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
        linkUrl: candidateUrl
      };
    }

    // Check external link
    if (candidateUrl && (candidateUrl.startsWith('http://') || candidateUrl.startsWith('https://'))) {
      let label = '外部資源連結';
      let icon = 'external-link';
      if (candidateUrl.includes('facebook.com')) {
        label = 'Facebook 成果專頁';
        icon = 'share-2';
      } else if (candidateUrl.includes('forms.gle') || candidateUrl.includes('docs.google.com/forms')) {
        label = 'Google 表單問卷';
        icon = 'clipboard-check';
      } else if (candidateUrl.includes('photos.app.goo.gl')) {
        label = 'Google 相簿紀錄';
        icon = 'camera';
      }
      return {
        type: 'link',
        linkUrl: candidateUrl,
        label,
        icon
      };
    }

    return {
      type: 'text'
    };
  },

  initGallery() {
    const btnArtworks = document.getElementById('btnTabArtworks');
    if (btnArtworks) {
      const count = this.data.student_works?.length || this.data.site_info?.total_artworks || 304;
      btnArtworks.innerHTML = `<i data-lucide="award" class="w-4 h-4"></i><span>🏆 學生原創藝術品 (${count} 件)</span>`;
    }
    const btnProcess = document.getElementById('btnTabProcess');
    if (btnProcess) {
      const count = this.data.process_photos?.length || this.data.site_info?.total_photos || 196;
      btnProcess.innerHTML = `<i data-lucide="camera" class="w-4 h-4"></i><span>📸 課堂實作花絮剪影 (${count} 張)</span>`;
    }

    this.updateFilteredWorks();
    this.renderGallery();

    const searchInput = document.getElementById('gallerySearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.currentPage = 1;
        this.updateFilteredWorks();
        this.renderGallery();
      });
    }

    const filterButtons = document.querySelectorAll('.gallery-filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.dataset.category || 'all';
        this.currentPage = 1;
        this.updateFilteredWorks();
        this.renderGallery();
      });
    });
  },

  setGalleryTab(tab) {
    this.currentTab = tab;
    this.currentPage = 1;
    
    document.getElementById('btnTabArtworks')?.classList.toggle('active', tab === 'artworks');
    document.getElementById('btnTabProcess')?.classList.toggle('active', tab === 'process');
    
    this.updateFilteredWorks();
    this.renderGallery();
  },

  filterByCategory(category, subSearch = '') {
    this.currentCategory = category;
    this.currentTab = 'artworks';
    document.getElementById('btnTabArtworks')?.classList.add('active');
    document.getElementById('btnTabProcess')?.classList.remove('active');

    if (subSearch) {
      this.searchQuery = subSearch.toLowerCase();
      const searchInput = document.getElementById('gallerySearch');
      if (searchInput) searchInput.value = subSearch;
    }
    
    document.querySelectorAll('.gallery-filter-btn').forEach(btn => {
      if (btn.dataset.category === category) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.currentPage = 1;
    this.updateFilteredWorks();

    // If searching a specific emotion tag in 'emotion' category yields 0 results, fall back to searching in 'all' categories
    if (category === 'emotion' && subSearch && this.filteredWorks.length === 0) {
      this.currentCategory = 'all';
      document.querySelectorAll('.gallery-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === 'all');
      });
      this.updateFilteredWorks();
    }

    this.renderGallery();

    const gallerySection = document.getElementById('gallerySection');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth' });
    }
  },

  updateFilteredWorks() {
    const sourceList = this.currentTab === 'process' 
      ? (this.data.process_photos || [])
      : (this.data.student_works || []);

    this.filteredWorks = sourceList.filter(w => {
      const matchCat = this.currentTab === 'process' || this.currentCategory === 'all' || w.category === this.currentCategory;
      
      let matchSearch = true;
      if (this.searchQuery) {
        const query = this.searchQuery;
        matchSearch = (
          (w.title && w.title.toLowerCase().includes(query)) ||
          (w.student_no && w.student_no.toLowerCase().includes(query)) ||
          (w.student_name && w.student_name.toLowerCase().includes(query)) ||
          (w.body && w.body.toLowerCase().includes(query)) ||
          (w.category_label && w.category_label.toLowerCase().includes(query))
        );
      }
      return matchCat && matchSearch;
    });
  },

  renderGallery() {
    const grid = document.getElementById('galleryGrid');
    const countEl = document.getElementById('galleryCount');
    const paginationEl = document.getElementById('galleryPagination');
    if (!grid) return;

    if (countEl) {
      const label = this.currentTab === 'process' ? '課堂實作剪影' : '原創藝術作品';
      countEl.innerText = `顯示 ${this.filteredWorks.length} 件${label}`;
    }

    if (this.filteredWorks.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-12 sm:py-16 text-center text-slate-400">
          <i data-lucide="search-x" class="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-slate-600"></i>
          <p class="text-sm sm:text-base">查無符合條件的作品，請嘗試切換分類或搜尋關鍵字。</p>
        </div>
      `;
      if (paginationEl) paginationEl.innerHTML = '';
      if (window.lucide) lucide.createIcons();
      return;
    }

    const totalPages = Math.ceil(this.filteredWorks.length / this.pageSize);
    const startIdx = (this.currentPage - 1) * this.pageSize;
    const endIdx = startIdx + this.pageSize;
    const pageItems = this.filteredWorks.slice(startIdx, endIdx);

    grid.innerHTML = pageItems.map((item, idx) => {
      const globalIdx = startIdx + idx;
      const authorLabel = item.student_no ? `#${item.student_no} ${item.student_name || ''}`.trim() : '';
      const media = this.getWorkMedia(item);

      return `
        <div class="glass-card rounded-2xl overflow-hidden group hover:border-indigo-500/50 transition-all flex flex-col justify-between cursor-pointer" onclick="App.openLightbox(${globalIdx})">
          <div class="gallery-img-container aspect-square bg-slate-900 relative overflow-hidden">
            ${media.type === 'image' ? `
              <img src="${media.src}" alt="${item.title}" loading="lazy" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onerror="this.onerror=null; if('${media.fallbackSrc}'){this.src='${media.fallbackSrc}'}else{this.style.display='none'; if(this.nextElementSibling)this.nextElementSibling.classList.remove('hidden');}">
              <div class="hidden w-full h-full flex flex-col items-center justify-center p-3 text-slate-400 bg-slate-800/80">
                <i data-lucide="palette" class="w-8 h-8 mb-2 text-indigo-400"></i>
                <span class="text-[11px] font-bold text-center text-slate-300">${item.title}</span>
              </div>
              <div class="gallery-overlay absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity p-3 sm:p-4 flex flex-col justify-end pointer-events-none">
                <span class="text-[11px] sm:text-xs font-semibold text-indigo-300 flex items-center gap-1 drop-shadow">
                  <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i> 點擊放大
                </span>
              </div>
            ` : media.type === 'youtube' ? `
              <img src="${media.src}" alt="${item.title}" loading="lazy" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                <span class="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg">
                  <i data-lucide="play" class="w-4 h-4 fill-current ml-0.5"></i>
                </span>
              </div>
            ` : media.type === 'link' ? `
              <div class="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-900 to-indigo-950/40">
                <div class="w-11 h-11 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <i data-lucide="${media.icon || 'external-link'}" class="w-5 h-5"></i>
                </div>
                <span class="text-[11px] font-bold text-indigo-200 line-clamp-2 px-2 mb-1">${item.title}</span>
                <span class="text-[10px] text-slate-400 font-medium">${media.label}</span>
              </div>
            ` : `
              <div class="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-900 to-purple-950/40">
                <div class="w-11 h-11 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <i data-lucide="sparkles" class="w-5 h-5"></i>
                </div>
                <span class="text-[11px] font-bold text-purple-200 line-clamp-2 px-2 mb-1">${item.title}</span>
                <span class="text-[10px] text-slate-400 font-medium">主題展區導覽解說</span>
              </div>
            `}
          </div>
          
          <div class="p-3 sm:p-4">
            <div class="flex items-center justify-between gap-1.5 mb-1.5">
              <span class="badge-tag badge-${item.category || 'general'} text-[9px] sm:text-[10px] py-0.5 px-1.5 sm:px-2">
                ${item.category_label || '作品'}
              </span>
              ${authorLabel ? `
                <span class="text-[10px] sm:text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-500/30 truncate max-w-[120px]">
                  ${authorLabel}
                </span>
              ` : ''}
            </div>
            <h4 class="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">${item.title}</h4>
            ${item.body ? `<p class="text-[11px] sm:text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">${item.body.replace(/<[^>]*>?/gm, '')}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Render Responsive Pagination
    if (paginationEl && totalPages > 1) {
      const isMobile = window.innerWidth < 640;
      const maxButtons = isMobile ? 3 : 7;
      let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
      let endPage = Math.min(totalPages, startPage + maxButtons - 1);
      if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
      }

      let pageBtns = `
        <button onclick="App.changePage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''} class="px-3 py-2 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 active:scale-95 touch-target">
          ‹ 上一頁
        </button>
      `;

      for (let p = startPage; p <= endPage; p++) {
        pageBtns += `
          <button onclick="App.changePage(${p})" class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border text-xs sm:text-sm font-bold transition-all ${p === this.currentPage ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'} active:scale-95">
            ${p}
          </button>
        `;
      }

      pageBtns += `
        <button onclick="App.changePage(${this.currentPage + 1})" ${this.currentPage === totalPages ? 'disabled' : ''} class="px-3 py-2 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 active:scale-95 touch-target">
          下一頁 ›
        </button>
      `;

      paginationEl.innerHTML = `
        <div class="flex items-center justify-center gap-1.5 flex-wrap">
          ${pageBtns}
        </div>
      `;
    } else if (paginationEl) {
      paginationEl.innerHTML = '';
    }

    if (window.lucide) lucide.createIcons();
  },

  changePage(newPage) {
    const totalPages = Math.ceil(this.filteredWorks.length / this.pageSize);
    if (newPage >= 1 && newPage <= totalPages) {
      this.currentPage = newPage;
      this.renderGallery();
      const grid = document.getElementById('galleryGrid');
      if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  // --- Lightbox Modal with Touch Swipe & Responsive Controls ---
  initLightbox() {
    document.addEventListener('keydown', (e) => {
      const modal = document.getElementById('lightboxModal');
      if (!modal || modal.classList.contains('hidden')) return;
      if (e.key === 'Escape') this.closeLightbox();
      if (e.key === 'ArrowLeft') this.prevLightbox();
      if (e.key === 'ArrowRight') this.nextLightbox();
    });

    const modalBox = document.getElementById('lightboxContentBox');
    if (modalBox) {
      modalBox.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      modalBox.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipeGesture();
      }, { passive: true });
    }
  },

  handleSwipeGesture() {
    const swipeDistance = this.touchEndX - this.touchStartX;
    if (Math.abs(swipeDistance) > 50) {
      if (swipeDistance > 0) {
        this.prevLightbox();
      } else {
        this.nextLightbox();
      }
    }
  },

  openLightbox(index) {
    if (index < 0 || index >= this.filteredWorks.length) return;
    this.currentLightboxIndex = index;
    const item = this.filteredWorks[index];
    const modal = document.getElementById('lightboxModal');
    if (!modal) return;

    const imgEl = document.getElementById('lightboxImg');
    const placeholderEl = document.getElementById('lightboxPlaceholder');
    const titleEl = document.getElementById('lightboxTitle');
    const tagEl = document.getElementById('lightboxTag');
    const studentEl = document.getElementById('lightboxStudent');
    const descEl = document.getElementById('lightboxDesc');
    const countEl = document.getElementById('lightboxCount');
    const countMobileEl = document.getElementById('lightboxCountMobile');
    const rawLinkEl = document.getElementById('lightboxRawLink');

    const media = this.getWorkMedia(item);

    if (media.type === 'image') {
      if (placeholderEl) placeholderEl.classList.add('hidden');
      if (imgEl) {
        imgEl.classList.remove('hidden');
        imgEl.src = media.src;
        imgEl.alt = item.title;
        imgEl.onerror = () => {
          if (media.fallbackSrc && imgEl.src !== media.fallbackSrc) {
            imgEl.src = media.fallbackSrc;
            return;
          }
          imgEl.classList.add('hidden');
          if (placeholderEl) {
            placeholderEl.classList.remove('hidden');
            placeholderEl.innerHTML = `
              <div class="w-16 h-16 rounded-2xl bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center mb-3 mx-auto">
                <i data-lucide="image" class="w-8 h-8"></i>
              </div>
              <h4 class="text-base font-bold text-white mb-1">${item.title}</h4>
              <p class="text-xs text-slate-400">學生作品影像載入中或離線備份</p>
            `;
            if (window.lucide) lucide.createIcons();
          }
        };
      }
      if (rawLinkEl) {
        rawLinkEl.href = media.src;
        rawLinkEl.target = '_blank';
        rawLinkEl.innerHTML = '<i data-lucide="external-link" class="w-3.5 h-3.5"></i> 開啟原圖 / 下載';
      }
    } else if (media.type === 'youtube') {
      if (imgEl) imgEl.classList.add('hidden');
      if (placeholderEl) {
        placeholderEl.classList.remove('hidden');
        placeholderEl.innerHTML = `
          <div class="w-16 h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center mb-4 mx-auto shadow-lg cursor-pointer hover:scale-105 transition-transform" onclick="App.openVideoModal('${media.linkUrl}', '${encodeURIComponent(item.title)}')">
            <i data-lucide="play" class="w-8 h-8 fill-current ml-1"></i>
          </div>
          <h4 class="text-base sm:text-lg font-bold text-white mb-2">${item.title}</h4>
          <p class="text-xs text-slate-400 mb-4">點擊下方按鈕以內嵌視窗播放 YouTube 示範影片</p>
          <button onclick="App.openVideoModal('${media.linkUrl}', '${encodeURIComponent(item.title)}')" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg active:scale-95">
            <i data-lucide="play" class="w-4 h-4 fill-current"></i> 播放 YouTube 影片
          </button>
        `;
        if (window.lucide) lucide.createIcons();
      }
      if (rawLinkEl) {
        rawLinkEl.href = media.linkUrl;
        rawLinkEl.target = '_blank';
        rawLinkEl.innerHTML = '<i data-lucide="youtube" class="w-3.5 h-3.5 text-red-400"></i> 前往 YouTube 觀看';
      }
    } else if (media.type === 'link') {
      if (imgEl) imgEl.classList.add('hidden');
      if (placeholderEl) {
        placeholderEl.classList.remove('hidden');
        placeholderEl.innerHTML = `
          <div class="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4 mx-auto">
            <i data-lucide="${media.icon || 'external-link'}" class="w-8 h-8"></i>
          </div>
          <h4 class="text-base sm:text-lg font-bold text-white mb-1.5">${item.title}</h4>
          <span class="text-xs text-indigo-300 font-semibold mb-4 inline-block px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30">${media.label}</span>
          <div>
            <a href="${media.linkUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg active:scale-95">
              <span>前往外部連結</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
      }
      if (rawLinkEl) {
        rawLinkEl.href = media.linkUrl;
        rawLinkEl.target = '_blank';
        rawLinkEl.innerHTML = `<i data-lucide="external-link" class="w-3.5 h-3.5"></i> 開啟外部連結`;
      }
    } else {
      if (imgEl) imgEl.classList.add('hidden');
      if (placeholderEl) {
        placeholderEl.classList.remove('hidden');
        placeholderEl.innerHTML = `
          <div class="w-16 h-16 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mb-4 mx-auto">
            <i data-lucide="sparkles" class="w-8 h-8"></i>
          </div>
          <h4 class="text-base sm:text-lg font-bold text-white mb-2">${item.title}</h4>
          <span class="text-xs text-purple-300 font-semibold mb-2 inline-block px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30">主題展區導覽解說</span>
          <p class="text-xs text-slate-400 max-w-sm mx-auto">右側欄位提供六年甲班策展小組的完整創作構想與教學實踐心路歷程。</p>
        `;
        if (window.lucide) lucide.createIcons();
      }
      if (rawLinkEl) {
        rawLinkEl.href = '#';
        rawLinkEl.innerHTML = '';
      }
    }

    if (titleEl) titleEl.innerText = item.title;
    if (tagEl) {
      tagEl.className = `badge-tag badge-${item.category || 'general'}`;
      tagEl.innerText = item.category_label || '跨領域美感作品';
    }
    if (studentEl) {
      studentEl.innerText = item.student_no ? `座號: #${item.student_no} ${item.student_name || ''}`.trim() : '';
    }
    if (descEl) {
      descEl.innerHTML = item.body ? `<p class="leading-relaxed whitespace-pre-wrap">${item.body}</p>` : '<p class="text-slate-500 italic">此作品為六年甲班跨領域幾何創作成果。</p>';
    }
    const countStr = `${index + 1} / ${this.filteredWorks.length}`;
    if (countEl) countEl.innerText = countStr;
    if (countMobileEl) countMobileEl.innerText = countStr;

    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    if (window.lucide) lucide.createIcons();
  },

  closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (modal) modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
  },

  prevLightbox() {
    if (this.currentLightboxIndex > 0) {
      this.openLightbox(this.currentLightboxIndex - 1);
    } else {
      this.openLightbox(this.filteredWorks.length - 1);
    }
  },

  nextLightbox() {
    if (this.currentLightboxIndex < this.filteredWorks.length - 1) {
      this.openLightbox(this.currentLightboxIndex + 1);
    } else {
      this.openLightbox(0);
    }
  },

  openLightboxByWork(item) {
    if (!item) return;
    if (!this.filteredWorks || this.filteredWorks.length === 0) {
      this.filteredWorks = (this.data && this.data.student_works) ? [...this.data.student_works] : [item];
    }
    const idx = this.filteredWorks.findIndex(w => w.id === item.id);
    if (idx !== -1) {
      this.openLightbox(idx);
    } else {
      this.filteredWorks.unshift(item);
      this.openLightbox(0);
    }
  },

  openWorkInLightbox(id) {
    const allWorks = (this.data && this.data.student_works) ? this.data.student_works : (window.YONGZHEN_RAW_DATA?.student_works || []);
    const item = allWorks.find(w => w.id === id);
    if (item) {
      this.openLightboxByWork(item);
    }
  },

  // --- Video Modal ---
  initVideoModal() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeVideoModal();
    });
  },

  openVideoModal(url, encodedTitle) {
    const modal = document.getElementById('videoModal');
    const container = document.getElementById('videoPlayerContainer');
    const titleEl = document.getElementById('videoModalTitle');
    if (!modal || !container) return;

    const title = decodeURIComponent(encodedTitle || '教學影音紀錄');
    if (titleEl) titleEl.innerText = title;

    let ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) {
      const ytId = ytMatch[1];
      container.innerHTML = `
        <div class="aspect-video w-full">
          <iframe class="w-full h-full rounded-xl" src="https://www.youtube.com/embed/${ytId}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="aspect-video w-full bg-black rounded-xl overflow-hidden flex items-center justify-center">
          <video controls autoplay playsinline class="w-full h-full">
            <source src="${url}">
            您的瀏覽器不支援 HTML5 影片播放。
          </video>
        </div>
      `;
    }

    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    if (window.lucide) lucide.createIcons();
  },

  closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const container = document.getElementById('videoPlayerContainer');
    if (modal) modal.classList.add('hidden');
    if (container) container.innerHTML = '';
    document.body.classList.remove('modal-open');
  },

  // --- Navigation & Mobile Menu UX ---
  initNavigation() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    if (mobileBtn && mobileNav) {
      mobileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileNav.classList.toggle('hidden');
        const icon = mobileBtn.querySelector('i');
        if (icon) {
          icon.setAttribute('data-lucide', mobileNav.classList.contains('hidden') ? 'menu' : 'x');
          if (window.lucide) lucide.createIcons();
        }
      });

      mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileNav.classList.add('hidden');
          const icon = mobileBtn.querySelector('i');
          if (icon) {
            icon.setAttribute('data-lucide', 'menu');
            if (window.lucide) lucide.createIcons();
          }
        });
      });

      document.addEventListener('click', (e) => {
        if (!mobileNav.classList.contains('hidden') && !mobileNav.contains(e.target) && !mobileBtn.contains(e.target)) {
          mobileNav.classList.add('hidden');
          const icon = mobileBtn.querySelector('i');
          if (icon) {
            icon.setAttribute('data-lucide', 'menu');
            if (window.lucide) lucide.createIcons();
          }
        }
      });
    }
  }
};

window.App = App;

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
