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
    renderCategoryBar();
    renderGrid();
  } catch (e) { console.error(e); }
}

function renderCategoryBar() {
  const bar = document.querySelector('.category-bar');
  const mainCats = categories.filter(c => !c.parent_id);
  bar.innerHTML = '<button onclick="filter(\'all\')"><i class="fa-solid fa-border-all"></i> All</button>';
  mainCats.forEach(c => {
    bar.innerHTML += `<button onclick="filter(${c.id})">${c.name}</button>`;
  });
}

function filter(catId) {
  currentFilter = catId;
  const subBar = document.getElementById('subcatBar');
  subBar.innerHTML = "";
  
  if (catId !== 'all') {
    const subCats = categories.filter(c => c.parent_id == catId);
    if (subCats.length > 0) {
      subBar.innerHTML = '<button onclick="filterSub(\'all\')" style="padding: 5px 15px; border-radius: 20px; border: 1px solid #ddd; background: #fff; cursor: pointer;">All Sub</button>';
      subCats.forEach(s => {
        subBar.innerHTML += `<button onclick="filterSub(${s.id})" style="padding: 5px 15px; border-radius: 20px; border: 1px solid #ddd; background: #fff; cursor: pointer;">${s.name}</button>`;
      });
    }
  }
  renderGrid();
}

let currentSubFilter = 'all';
function filterSub(subId) {
  currentSubFilter = subId;
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = "";
  
  let filtered = allWorks;
  if (currentFilter !== 'all') {
    filtered = filtered.filter(w => w.category_id == currentFilter);
    if (currentSubFilter !== 'all') {
      filtered = filtered.filter(w => w.subcategory_id == currentSubFilter);
    }
  }

  filtered.forEach(w => {
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => openFocus(w);
    
    const isVideo = w.image.includes("youtube.com") || w.image.includes("youtu.be") || (w.image.includes("dropbox.com") && w.image.includes("raw=1"));
    
    if (isVideo) {
      card.innerHTML = `
        <div style="position:relative; padding-top: 56.25%; background: #000; border-radius: 12px; overflow: hidden;">
          <i class="fa-solid fa-play" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:white; font-size: 30px; z-index: 2;"></i>
          <div style="position:absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.3);"></div>
        </div>
      `;
    } else {
      card.innerHTML = `<img src="${w.image}" style="width:100%; border-radius: 12px; display:block;">`;
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
