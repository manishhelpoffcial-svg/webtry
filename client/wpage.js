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
  
  // If still empty (e.g. Supabase loading), provide the core 2
  if (mainCats.length === 0) {
    html += `<button id="cat-graphic_design" onclick="filter('graphic_design')"><i class="fa-solid fa-palette"></i> Graphic Design</button>`;
    html += `<button id="cat-video_editing" onclick="filter('video_editing')"><i class="fa-solid fa-video"></i> Video Editing</button>`;
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
  
  let fallbackSubs = [];
  if (catId === 'graphic_design' || (catId !== 'all' && !isNaN(catId) && categories.find(c => c.id == catId)?.name === 'Graphics Design')) {
    fallbackSubs = ["Poster", "Logo", "Menu Card", "Business Card", "Thumbnail"];
  } else if (catId === 'video_editing' || (catId !== 'all' && !isNaN(catId) && categories.find(c => c.id == catId)?.name === 'Video Editing')) {
    fallbackSubs = ["Short Video", "Long Video", "Wedding Video"];
  }

  if (subCats.length > 0 || fallbackSubs.length > 0) {
    subBar.style.display = 'flex';
    let html = ''; // REMOVED "All Sub" button
    
    if (subCats.length > 0) {
        subCats.forEach(s => {
            const icon = getCategoryIcon(s.name);
            html += `<button id="sub-${s.id}" onclick="filterSub(${s.id})">${icon} ${s.name}</button>`;
        });
    } else {
        fallbackSubs.forEach(s => {
            const icon = getCategoryIcon(s);
            html += `<button onclick="filterSub('${s.toLowerCase().replace(/\s/g, '_')}')">${icon} ${s}</button>`;
        });
    }
    subBar.innerHTML = html;
  } else {
    subBar.style.display = 'none';
  }
  renderGrid();
}

function filterSub(subId) {
  currentSubFilter = subId;
  // Show active state for sub-categories
  document.querySelectorAll('.subcategory-bar button').forEach(btn => btn.classList.remove('active'));
  
  const buttons = document.querySelectorAll('.subcategory-bar button');
  buttons.forEach(btn => {
    const clickAttr = btn.getAttribute('onclick') || "";
    if (btn.id === `sub-${subId}` || clickAttr.includes(`'${subId}'`) || clickAttr.includes(`(${subId})`)) {
      btn.classList.add('active');
    }
  });
  
  renderGrid();
}
