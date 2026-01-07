let allWorks = [];
let categories = [];
let currentFilter = 'all';
let currentSubFilter = 'all';

async function init() {
  try {
    const [worksRes, catsRes] = await Promise.all([
      fetch('/api/works'),
      fetch('/api/categories')
    ]);
    
    let dbWorks = await worksRes.json();
    const dbCats = await catsRes.json();
    
    // Merge DB works with local storage works for complete resilience
    const localWorks = JSON.parse(localStorage.getItem('grafx_works_fallback') || '[]');
    
    // De-duplicate works by ID
    const workMap = new Map();
    dbWorks.forEach(w => workMap.set(String(w.id), w));
    localWorks.forEach(w => workMap.set(String(w.id), w));
    
    allWorks = Array.from(workMap.values());
    categories = dbCats;
    
    // Fallback categories if API fails or empty
    if (!categories || categories.length === 0) {
      categories = [
        { id: 'graphic_design', name: 'Graphics Design', parent_id: null },
        { id: 'video_editing', name: 'Video Editing', parent_id: null },
        { id: 'poster', name: 'Poster', parent_id: 'graphic_design' },
        { id: 'logo', name: 'Logo', parent_id: 'graphic_design' },
        { id: 'menu_card', name: 'Menu Card', parent_id: 'graphic_design' },
        { id: 'business_card', name: 'Business Card', parent_id: 'graphic_design' },
        { id: 'thumbnail', name: 'Thumbnail', parent_id: 'graphic_design' },
        { id: 'short_video', name: 'Short Video', parent_id: 'video_editing' },
        { id: 'long_video', name: 'Long Video', parent_id: 'video_editing' },
        { id: 'wedding_video', name: 'Wedding Video', parent_id: 'video_editing' }
      ];
    }
    
    console.log("Portfolio Init:", { worksCount: allWorks.length, catsCount: categories.length });
    
    renderCategoryBar();
    renderGrid();
  } catch (e) { 
    console.error("Init failed:", e); 
    // Manual fallback for buttons if API fails entirely
    allWorks = JSON.parse(localStorage.getItem('grafx_works_fallback') || '[]');
    categories = [
        { id: 'graphic_design', name: 'Graphics Design', parent_id: null },
        { id: 'video_editing', name: 'Video Editing', parent_id: null },
        { id: 'poster', name: 'Poster', parent_id: 'graphic_design' },
        { id: 'logo', name: 'Logo', parent_id: 'graphic_design' },
        { id: 'menu_card', name: 'Menu Card', parent_id: 'graphic_design' },
        { id: 'business_card', name: 'Business Card', parent_id: 'graphic_design' },
        { id: 'thumbnail', name: 'Thumbnail', parent_id: 'graphic_design' },
        { id: 'short_video', name: 'Short Video', parent_id: 'video_editing' },
        { id: 'long_video', name: 'Long Video', parent_id: 'video_editing' },
        { id: 'wedding_video', name: 'Wedding Video', parent_id: 'video_editing' }
    ];
    renderCategoryBar();
    renderGrid();
  }
}

function renderCategoryBar() {
  const bar = document.querySelector('.category-bar');
  if (!bar) return;
  const mainCats = categories.filter(c => !c.parent_id);
  
  let html = `<button id="cat-all" class="active" onclick="filter('all')"><i class="fa-solid fa-border-all"></i> All</button>`;
  
  mainCats.forEach(c => {
    const icon = getCategoryIcon(c.name);
    html += `<button id="cat-${c.id}" onclick="filter('${c.id}')">${icon} ${c.name}</button>`;
  });
  
  bar.innerHTML = html;
}

function getCategoryIcon(name) {
  const lower = name.toLowerCase();
  let iconClass = 'fa-tag';
  if (lower.includes('graphic')) iconClass = 'fa-palette';
  else if (lower.includes('video')) iconClass = 'fa-video';
  else if (lower.includes('logo')) iconClass = 'fa-pen-nib';
  else if (lower.includes('poster')) iconClass = 'fa-image';
  else if (lower.includes('card')) iconClass = 'fa-address-card';
  else if (lower.includes('thumbnail')) iconClass = 'fa-clapperboard';
  else if (lower.includes('wedding')) iconClass = 'fa-heart';
  
  return `<i class="fa-solid ${iconClass}" style="color: #10b981;"></i>`;
}

function filter(catId) {
  currentFilter = catId;
  currentSubFilter = 'all';
  
  // Update Active Class
  document.querySelectorAll('.category-bar button').forEach(btn => btn.classList.remove('active'));
  
  const buttons = document.querySelectorAll('.category-bar button');
  buttons.forEach(btn => {
    if (btn.id === `cat-${catId}` || (catId === 'graphic_design' && btn.innerText.includes('Graphic')) || (catId === 'video_editing' && btn.innerText.includes('Video'))) {
        btn.classList.add('active');
    }
  });

  const subBar = document.getElementById('subcatBar');
  if (!subBar) return;
  subBar.innerHTML = "";
  
  const subCats = categories.filter(c => String(c.parent_id) === String(catId));
  
  if (subCats.length > 0) {
    subBar.style.display = 'flex';
    let html = '<button id="sub-all" class="active" onclick="filterSub(\'all\')">All</button>';
    
    subCats.forEach(s => {
        const icon = getCategoryIcon(s.name);
        html += `<button id="sub-${s.id}" onclick="filterSub('${s.id}')">${icon} ${s.name}</button>`;
    });
    subBar.innerHTML = html;
  } else {
    subBar.style.display = 'none';
  }
  renderGrid();
}

function filterSub(subId) {
  currentSubFilter = subId;
  // Show active state for sub-categories
  document.querySelectorAll('#subcatBar button').forEach(btn => btn.classList.remove('active'));
  
  const buttons = document.querySelectorAll('#subcatBar button');
  buttons.forEach(btn => {
    if (btn.id === `sub-${subId}` || (subId === 'all' && btn.id === 'sub-all')) {
      btn.classList.add('active');
    }
  });
  
  renderGrid();
}

function isVideoLink(url) {
  if (!url) return false;
  const videoPatterns = [
    'youtube.com',
    'youtu.be',
    'vimeo.com',
    'drive.google.com/file',
    '.mp4',
    '.mov',
    '.webm',
    'raw=1'
  ];
  
  const isVideo = videoPatterns.some(p => url.toLowerCase().includes(p));
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  const isImageExt = imageExtensions.some(ext => url.toLowerCase().split('?')[0].endsWith(ext));
  
  return isVideo && !isImageExt;
}

function renderGrid() {
  const grid = document.getElementById('grid');
  if (!grid) return;
  grid.innerHTML = "";
  
  let filtered = allWorks;
  if (currentFilter !== 'all') {
    filtered = filtered.filter(w => {
        const matchesMain = String(w.category_id) === String(currentFilter);
        // Also check if the current category is a parent of the work's subcategory
        const workSubcat = categories.find(c => String(c.id) === String(w.subcategory_id));
        const matchesParent = workSubcat && String(workSubcat.parent_id) === String(currentFilter);
        
        const catName = categories.find(c => String(c.id) === String(w.category_id))?.name || "";
        const matchesFallback = (currentFilter === 'graphic_design' && catName.toLowerCase().includes('graphic')) || 
                                (currentFilter === 'video_editing' && catName.toLowerCase().includes('video'));
        
        return matchesMain || matchesParent || matchesFallback;
    });

    if (currentSubFilter !== 'all') {
      filtered = filtered.filter(w => {
        const matchesSub = String(w.subcategory_id) === String(currentSubFilter);
        return matchesSub;
      });
    }
  }

  if (filtered.length === 0) {
    grid.innerHTML = "<p style='grid-column: 1/-1; text-align:center; padding: 40px; color: #64748b;'>No projects found in this category.</p>";
    return;
  }

  filtered.forEach(w => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.position = 'relative';
    
    const isVideo = isVideoLink(w.image);
    
    let mediaHtml = "";
    if (isVideo) {
      mediaHtml = `
        <div onclick="openFocus(${JSON.stringify(w).replace(/"/g, '&quot;')})" style="position:relative; padding-top: 56.25%; background: #000; border-radius: 12px; overflow: hidden; cursor: pointer;">
          <i class="fa-solid fa-play" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:white; font-size: 30px; z-index: 2;"></i>
          <div style="position:absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.3);"></div>
        </div>
      `;
    } else {
      mediaHtml = `<img src="${w.image}" onclick="openFocus(${JSON.stringify(w).replace(/"/g, '&quot;')})" style="width:100%; border-radius: 12px; display:block; cursor: pointer;" onerror="this.src='https://placehold.co/400x300?text=Media+Error'">`;
    }

    const isAdmin = localStorage.getItem('grafx_admin_logged_in') === 'true';
    const deleteBtn = isAdmin ? `
        <button onclick="deleteWork('${w.id}')" style="position:absolute; top:10px; right:10px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            <i class="fa-solid fa-trash-can" style="font-size: 14px;"></i>
        </button>
    ` : '';

    card.innerHTML = `
        ${mediaHtml}
        ${deleteBtn}
    `;
    grid.appendChild(card);
  });
}

async function deleteWork(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
        const res = await fetch(`/api/works/${id}`, { method: 'DELETE' });
        if (res.ok) {
            // Update local state
            allWorks = allWorks.filter(w => String(w.id) !== String(id));
            
            // Update fallback
            const fallback = JSON.parse(localStorage.getItem('grafx_works_fallback') || '[]');
            const newFallback = fallback.filter(w => String(w.id) !== String(id));
            localStorage.setItem('grafx_works_fallback', JSON.stringify(newFallback));
            
            renderGrid();
        } else {
            alert('Failed to delete project');
        }
    } catch (e) {
        console.error('Delete failed:', e);
        // Fallback delete if API fails
        allWorks = allWorks.filter(w => String(w.id) !== String(id));
        const fallback = JSON.parse(localStorage.getItem('grafx_works_fallback') || '[]');
        const newFallback = fallback.filter(w => String(w.id) !== String(id));
        localStorage.setItem('grafx_works_fallback', JSON.stringify(newFallback));
        renderGrid();
    }
}

function openFocus(w) {
  const focus = document.getElementById('focus');
  const container = document.getElementById('mediaContainer');
  const isYoutube = w.image.includes("youtube.com") || w.image.includes("youtu.be");
  const isDirectVideo = w.image.includes("raw=1") || w.image.endsWith(".mp4");

  if (isYoutube) {
    let vidId = "";
    if (w.image.includes("v=")) vidId = w.image.split("v=")[1].split("&")[0];
    else if (w.image.includes("youtu.be/")) vidId = w.image.split("youtu.be/")[1].split("?")[0];
    container.innerHTML = `<div style="padding-top: 56.25%; position:relative;"><iframe src="https://www.youtube.com/embed/${vidId}?autoplay=1" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`;
  } else if (isDirectVideo) {
    container.innerHTML = `<video src="${w.image}" controls autoplay style="width:100%; display:block; aspect-ratio: 16/9; object-fit: contain;"></video>`;
  } else {
    container.innerHTML = `<img src="${w.image}" style="width:100%; display:block;">`;
  }

  document.getElementById('focusId').innerText = w.id;
  document.getElementById('focusWA').href = `https://wa.me/91891819?text=Hi, I'm interested in project ${w.id}`;
  focus.style.display = "flex";
}

function closeFocus() {
  document.getElementById('focus').style.display = "none";
  document.getElementById('mediaContainer').innerHTML = "";
}

init();