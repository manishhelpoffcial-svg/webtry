const list = document.getElementById("list");

let categories = [];

async function fetchCategories() {
  try {
    const res = await fetch('/api/categories');
    categories = await res.json();
    
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
    
    updateCategorySelects();
    renderCategories();
  } catch (e) { 
    categories = [
        { id: 'graphic_design', name: 'Graphics Design', parent_id: null },
        { id: 'video_editing', name: 'Video Editing', parent_id: null }
    ];
    updateCategorySelects();
    renderCategories();
  }
}

function updateCategorySelects() {
  const mainSelect = document.getElementById('cat');
  const parentSelect = document.getElementById('parentCatSelect');
  if (!mainSelect || !parentSelect) return;

  const mainCats = categories.filter(c => !c.parent_id);
  mainSelect.innerHTML = '<option value="">Select Category</option>';
  parentSelect.innerHTML = '<option value="">Main Category</option>';

  mainCats.forEach(c => {
    const opt1 = document.createElement("option");
    opt1.value = c.id;
    opt1.textContent = c.name;
    mainSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = c.id;
    opt2.textContent = c.name;
    parentSelect.appendChild(opt2);
  });
}

function updateSubCats() {
  const catId = document.getElementById("cat").value;
  const sub = document.getElementById("subcat");
  if (!sub) return;
  sub.innerHTML = '<option value="">Select Sub-Category</option>';
  if (!catId) return;

  const subCats = categories.filter(c => String(c.parent_id) === String(catId));
  subCats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    sub.appendChild(opt);
  });
}

async function addCategory() {
  const name = document.getElementById('newCatName').value.trim();
  const parent_id = document.getElementById('parentCatSelect').value || null;
  if (!name) return alert("Enter name");

  try {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parent_id })
    });
    if (res.ok) {
      document.getElementById('newCatName').value = "";
      fetchCategories();
    }
  } catch (e) {}
}

function renderCategories() {
  const list = document.getElementById('categoryList');
  if (!list) return;
  list.innerHTML = "";
  categories.forEach(c => {
    const chip = document.createElement('div');
    chip.className = "category-chip";
    chip.style = "background: white; padding: 8px 15px; border-radius: 12px; font-size: 13px; display: flex; align-items: center; gap: 10px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);";
    
    const icon = getCategoryIcon(c.name);
    const isSub = c.parent_id;
    const parentName = isSub ? (categories.find(p => String(p.id) === String(c.parent_id))?.name || 'Parent') : '';
    
    chip.innerHTML = `
      ${icon} 
      <div style="display:flex; flex-direction:column;">
        <span style="font-weight:600; color:#1e293b;">${c.name}</span>
        ${isSub ? `<small style="color:#64748b; font-size:10px;">Sub of ${parentName}</small>` : '<small style="color:#10b981; font-size:10px;">Main Category</small>'}
      </div>
      <div style="margin-left:auto; display:flex; gap:8px;">
        <i class="fa-solid fa-trash" style="cursor:pointer; color:#ef4444" onclick="deleteCategory('${c.id}')"></i>
      </div>
    `;
    list.appendChild(chip);
  });
}

async function editCategory(id, currentName) {
  const newName = prompt("Enter new name for category:", currentName);
  if (!newName || newName.trim() === currentName) return;
  await fetch(`/api/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName.trim() })
  });
  fetchCategories();
}

function getCategoryIcon(name) {
  const lower = name.toLowerCase();
  if (lower.includes('graphic')) return '<i class="fa-solid fa-palette"></i>';
  if (lower.includes('video')) return '<i class="fa-solid fa-video"></i>';
  return '<i class="fa-solid fa-tag"></i>';
}

async function deleteCategory(id) {
  if (!confirm("Delete category?")) return;
  await fetch(`/api/categories/${id}`, { method: 'DELETE' });
  fetchCategories();
}

async function getData() {
  try {
    const res = await fetch('/api/works');
    return await res.json();
  } catch (e) {
    return [];
  }
}

function updateStats(data) {
    const statWorks = document.getElementById('statWorks');
    const statInquiries = document.getElementById('statInquiries');
    if (statWorks) statWorks.innerText = data.length;
    fetch('/api/inquiries').then(r => r.json()).then(inqs => {
      if (statInquiries) statInquiries.innerText = inqs.length;
    }).catch(() => {});
}

async function save() {
  const img = document.getElementById("img");
  const cat = document.getElementById("cat");
  const subcat = document.getElementById("subcat");

  if (!img || !img.value || !cat || !cat.value) return alert("Please fill media link and category");

  const data = await getData();
  const nextId = getNextId(data);

  const work = {
    id: nextId,
    category_id: cat.value,
    subcategory_id: (subcat && subcat.value) || null,
    image: img.value.trim(),
    created_at: new Date().toISOString()
  };

  try {
    await fetch('/api/works', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(work)
    });

    img.value = "";
    cat.value = "";
    if (subcat) subcat.value = "";
    render();
    alert("Work published successfully!");
  } catch (e) {
    alert("Error saving work to database");
  }
}

function getNextId(data) {
  if (!data || data.length === 0) return "#GXC001";
  let maxNum = 0;
  data.forEach(w => {
    const num = parseInt(w.id.replace("#GXC", ""));
    if (!isNaN(num) && num > maxNum) maxNum = num;
  });
  return "#GXC" + (maxNum + 1).toString().padStart(3, "0");
}

async function del(id) {
  if (!confirm("Remove this item?")) return;
  try {
    await fetch(`/api/works/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const localData = JSON.parse(localStorage.getItem('grafx_works_fallback') || '[]');
    const filtered = localData.filter(w => w.id !== id);
    localStorage.setItem('grafx_works_fallback', JSON.stringify(filtered));
    render();
  } catch (e) {
    alert("Removed from session");
  }
}

async function editWork(id) {
  const data = await getData();
  const work = data.find(w => w.id === id);
  if (!work) return;

  const newImg = prompt("Edit Media Link:", work.image);
  if (newImg === null) return;

  const updatedWork = { ...work, image: newImg.trim() };
  try {
    await fetch(`/api/works/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedWork)
    });
    const localData = JSON.parse(localStorage.getItem('grafx_works_fallback') || '[]');
    const idx = localData.findIndex(w => w.id === id);
    if (idx !== -1) {
      localData[idx] = updatedWork;
      localStorage.setItem('grafx_works_fallback', JSON.stringify(localData));
    }
    render();
  } catch (e) {}
}

function isVideoLink(url) {
  if (!url) return false;
  const videoPatterns = ['youtube.com', 'youtu.be', 'vimeo.com', 'drive.google.com/file', '.mp4', '.mov', '.webm', 'raw=1'];
  const isVideo = videoPatterns.some(p => url.toLowerCase().includes(p));
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  const isImageExt = imageExtensions.some(ext => url.toLowerCase().split('?')[0].endsWith(ext));
  return isVideo && !isImageExt;
}

async function render() {
  try {
    const response = await fetch('/api/works');
    const data = await response.json();
    
    // Clear legacy fallback if database is successfully reached
    localStorage.removeItem('grafx_works_fallback');
    
    updateStats(data);
  const idField = document.getElementById('workId');
  if (idField) idField.value = getNextId(data);

  if (!list) return;
  list.innerHTML = "";
  if (data.length === 0) {
    list.innerHTML = "<p style='padding: 20px; text-align: center; color: #64748b;'>No items in portfolio.</p>";
    return;
  }

  data.forEach((w) => {
    const d = document.createElement("div");
    d.className = "item";
    let preview = "";
    const isVideo = isVideoLink(w.image);
    
    if (isVideo) {
      preview = '<i class="fa-solid fa-video" style="font-size: 24px; color: #10b981; width: 60px; text-align: center;"></i>';
    } else {
      preview = `<img src="${w.image}" style="width:60px; height:40px; object-fit:cover; border-radius:4px;" onerror="this.src='https://placehold.co/100x100?text=Media'">`;
    }
    
    const catName = categories.find(c => String(c.id) === String(w.category_id))?.name || "Unknown";
    d.innerHTML = `
      ${preview}
      <div class="item-info"><b>${w.id}</b><br><small>${catName}</small></div>
      <div style="margin-left:auto; display:flex; gap:5px;">
        <button class="btn-edit" onclick="editWork('${w.id}')" style="padding:4px 8px; border-radius:4px; border:none; background:#f1f5f9;"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-delete" onclick="del('${w.id}')" style="padding:4px 8px; border-radius:4px; border:none; background:#fee2e2; color:#ef4444;"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    list.appendChild(d);
  });
}

async function renderInquiries() {
  const inquiryList = document.getElementById('inquiryList');
  if (!inquiryList) return;
  try {
    const response = await fetch('/api/inquiries');
    const inquiries = await response.json();
    inquiryList.innerHTML = "";
    inquiries.forEach((inq) => {
      const date = new Date(inq.created_at).toLocaleString();
      const d = document.createElement("div");
      d.className = "item inquiry-card";
      d.style.flexDirection = "column";
      d.style.alignItems = "flex-start";
      d.style.padding = "15px";
      d.innerHTML = `
        <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:10px;">
          <b style="color: #10b981; font-size: 16px;">${inq.name}</b>
          <span style="font-size: 12px; color: #64748b;">${date}</span>
        </div>
        <div style="font-size: 13px; color: #475569; margin-bottom: 8px; display: flex; gap: 15px; flex-wrap: wrap;">
          <span><i class="fa-solid fa-envelope" style="color:#10b981"></i> ${inq.email}</span>
          <span><i class="fa-solid fa-wallet" style="color:#10b981"></i> Budget: ₹${inq.budget}</span>
        </div>
        <div style="background: #f8fafc; padding: 10px; border-radius: 8px; width: 100%; font-size: 14px; color: #1e293b; margin-bottom: 12px; border: 1px solid #e2e8f0;">
          ${inq.message}
        </div>
        <button class="btn-delete" onclick="delInquiry(${inq.id})" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; display:flex; align-items:center; gap:5px;">
          <i class="fa-solid fa-check"></i> Mark Resolved
        </button>
      `;
      inquiryList.appendChild(d);
    });
  } catch (error) {}
}

async function delInquiry(id) {
  if (!confirm("Delete inquiry?")) return;
  await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
  renderInquiries();
}

document.addEventListener('DOMContentLoaded', () => {
  fetchCategories().then(() => render());
});