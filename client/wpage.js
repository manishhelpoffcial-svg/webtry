let allWorks = [];
let categories = [];
let currentFilter = 'all';

async function init() {
  try {
    const [worksRes, catsRes] = await Promise.all([
      fetch('/api/works'),
      fetch('/api/categories')
    ]);
    allWorks = await worksRes.json();
    categories = await catsRes.json();
    
    console.log("Categories data:", categories);
    
    renderCategoryBar();
    renderGrid();
  } catch (e) { 
    console.error("Init failed:", e); 
    // Manual fallback for buttons if API fails
    renderCategoryBar();
  }
}

function renderCategoryBar() {
  const bar = document.querySelector('.category-bar');
  if (!bar) return;
  const mainCats = categories.filter(c => !c.parent_id);
  
  let html = `<button id="cat-all" class="active" onclick="filter('all')"><i class="fa-solid fa-border-all"></i> All</button>`;
  
  mainCats.forEach(c => {
    const icon = getCategoryIcon(c.name);
    html += `<button id="cat-${c.id}" onclick="filter(${c.id})">${icon} ${c.name}</button>`;
  });
  
  // If still empty (e.g. Supabase loading), provide the core 2 without (Fallback) text
  if (mainCats.length === 0) {
    html += `<button onclick="filter('graphic_design')"><i class="fa-solid fa-palette"></i> Graphic Design</button>`;
    html += `<button onclick="filter('video_editing')"><i class="fa-solid fa-video"></i> Video Editing</button>`;
  }
  
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
  
  // Use a more robust selector that handles both numeric IDs and string fallbacks
  const buttons = document.querySelectorAll('.category-bar button');
  buttons.forEach(btn => {
    if (btn.id === `cat-${catId}` || (catId === 'graphic_design' && btn.innerText.includes('Graphic')) || (catId === 'video_editing' && btn.innerText.includes('Video'))) {
        btn.classList.add('active');
    }
  });

  const subBar = document.getElementById('subcatBar');
  if (!subBar) return;
  subBar.innerHTML = "";
  
  // Robust check for sub-categories
  const subCats = categories.filter(c => String(c.parent_id) === String(catId));
  
  // FALLBACK Sub-categories if DB is still populating/empty
  let fallbackSubs = [];
  if (catId === 'graphic_design' || (catId !== 'all' && !isNaN(catId) && categories.find(c => c.id == catId)?.name === 'Graphics Design')) {
    fallbackSubs = ["Poster", "Logo", "Menu Card", "Business Card", "Thumbnail"];
  } else if (catId === 'video_editing' || (catId !== 'all' && !isNaN(catId) && categories.find(c => c.id == catId)?.name === 'Video Editing')) {
    fallbackSubs = ["Short Video", "Long Video", "Wedding Video"];
  }

  if (subCats.length > 0 || fallbackSubs.length > 0) {
    subBar.style.display = 'flex';
    let html = '<button id="sub-all" class="active" onclick="filterSub(\'all\')">All Sub</button>';
    
    if (subCats.length > 0) {
        subCats.forEach(s => {
            html += `<button id="sub-${s.id}" onclick="filterSub(${s.id})">${s.name}</button>`;
        });
    } else {
        fallbackSubs.forEach(s => {
            html += `<button onclick="filterSub('${s.toLowerCase().replace(/\s/g, '_')}')">${s}</button>`;
        });
    }
    subBar.innerHTML = html;
  } else {
    subBar.style.display = 'none';
  }
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('grid');
  if (!grid) return;
  grid.innerHTML = "";
  
  let filtered = allWorks;
  if (currentFilter !== 'all') {
    filtered = filtered.filter(w => {
        const matchesMain = String(w.category_id) === String(currentFilter);
        const matchesFallback = (currentFilter === 'graphic_design' && String(w.category_id).toLowerCase().includes('graphic')) || 
                                (currentFilter === 'video_editing' && String(w.category_id).toLowerCase().includes('video'));
        return matchesMain || matchesFallback;
    });

    if (currentSubFilter !== 'all') {
      filtered = filtered.filter(w => {
        const matchesSub = String(w.subcategory_id) === String(currentSubFilter);
        const subName = categories.find(c => c.id == w.subcategory_id)?.name || "";
        const matchesFallbackSub = String(currentSubFilter).replace(/_/g, ' ').toLowerCase() === subName.toLowerCase();
        return matchesSub || matchesFallbackSub;
      });
    }
  }

  filtered.forEach(w => {
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => openFocus(w);
    
    const isVideo = w.image && (w.image.includes("youtube.com") || w.image.includes("youtu.be") || (w.image.includes("dropbox.com") && w.image.includes("raw=1")));
    
    if (isVideo) {
      card.innerHTML = `
        <div style="position:relative; padding-top: 56.25%; background: #000; border-radius: 12px; overflow: hidden;">
          <i class="fa-solid fa-play" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:white; font-size: 30px; z-index: 2;"></i>
          <div style="position:absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.3);"></div>
        </div>
      `;
    } else {
      card.innerHTML = `<img src="${w.image}" style="width:100%; border-radius: 12px; display:block;" onerror="this.src='https://placehold.co/400x300?text=Media+Error'">`;
    }
    grid.appendChild(card);
  });
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
