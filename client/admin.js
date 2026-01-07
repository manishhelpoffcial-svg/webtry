const list = document.getElementById("list");

let categories = [];

async function fetchCategories() {
  try {
    const res = await fetch('/api/categories');
    categories = await res.json();
    
    // Fallback if DB is empty or fails
    if (!categories || categories.length === 0) {
      console.log("Using fallback categories for admin");
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
    console.error("Cat fetch failed", e);
    // Hard fallback on error
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
  console.log("Updating selects with main categories:", mainCats);
  
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

  // Use numeric comparison for safety
  const subCats = categories.filter(c => String(c.parent_id) === String(catId));
  console.log("Found sub-categories:", subCats, "for parent ID:", catId);
  
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
    } else {
      const err = await res.json();
      alert("Error: " + err.message);
    }
  } catch (e) {
    alert("Request failed");
  }
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
        <i class="fa-solid fa-pen" style="cursor:pointer; color:#10b981" onclick="editCategory('${c.id}', '${c.name.replace(/'/g, "\\'")}')" title="Edit Name"></i>
        <i class="fa-solid fa-trash" style="cursor:pointer; color:#ef4444" onclick="deleteCategory('${c.id}')" title="Delete"></i>
      </div>
    `;
    list.appendChild(chip);
  });
}

async function editCategory(id, currentName) {
  const newName = prompt("Enter new name for category:", currentName);
  if (!newName || newName.trim() === currentName) return;
  
  try {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() })
    });
    if (res.ok) {
      fetchCategories();
    } else {
      alert("Failed to update name");
    }
  } catch (e) {
    alert("Error updating category");
  }
}

function getCategoryIcon(name) {
  const lower = name.toLowerCase();
  if (lower.includes('graphic')) return '<i class="fa-solid fa-palette"></i>';
  if (lower.includes('video')) return '<i class="fa-solid fa-video"></i>';
  if (lower.includes('logo')) return '<i class="fa-solid fa-pen-nib"></i>';
  if (lower.includes('poster')) return '<i class="fa-solid fa-image"></i>';
  if (lower.includes('card')) return '<i class="fa-solid fa-address-card"></i>';
  if (lower.includes('thumbnail')) return '<i class="fa-solid fa-clapperboard"></i>';
  if (lower.includes('wedding')) return '<i class="fa-solid fa-heart"></i>';
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
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Fetch works failed", e);
    return JSON.parse(localStorage.getItem('grafx_works_fallback') || '[]');
  }
}

function updateStats(data) {
    const statWorks = document.getElementById('statWorks');
    const statInquiries = document.getElementById('statInquiries');
    if (statWorks) statWorks.innerText = data.length;
    
    fetch('/api/inquiries')
      .then(r => r.json())
      .then(inqs => {
        if (statInquiries) statInquiries.innerText = inqs.length;
      })
      .catch(() => {});
}

async function save() {
  const img = document.getElementById("img");
  const cat = document.getElementById("cat");
  const subcat = document.getElementById("subcat");
  const idField = document.getElementById("workId");

  if (!img.value || !cat.value) return alert("Please fill media link and category");

  const work = {
    id: idField.value,
    category_id: cat.value,
    subcategory_id: subcat.value || null,
    image: img.value.trim(),
    created_at: new Date().toISOString()
  };

  try {
    const res = await fetch('/api/works', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(work)
    });

    if (res.ok) {
      const localData = JSON.parse(localStorage.getItem('grafx_works_fallback') || '[]');
      localData.push(work);
      localStorage.setItem('grafx_works_fallback', JSON.stringify(localData));

      img.value = "";
      cat.value = "";
      subcat.value = "";
      render();
      alert("Work published successfully!");
    } else {
      const err = await res.json();
      alert("Error publishing: " + (err.message || "Unknown error"));
    }
  } catch (e) {
    alert("Failed to connect to server");
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
    const response = await fetch(`/api/works/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (response.ok) {
      const localData = JSON.parse(localStorage.getItem('grafx_works_fallback') || '[]');
      const filtered = localData.filter(w => w.id !== id);
      localStorage.setItem('grafx_works_fallback', JSON.stringify(filtered));
      render();
    } else {
      alert("Failed to delete from server");
    }
  } catch (e) {
    alert("Error connecting to server");
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
    const res = await fetch(`/api/works/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedWork)
    });

    if (res.ok) {
      const localData = JSON.parse(localStorage.getItem('grafx_works_fallback') || '[]');
      const idx = localData.findIndex(w => w.id === id);
      if (idx !== -1) {
        localData[idx] = updatedWork;
        localStorage.setItem('grafx_works_fallback', JSON.stringify(localData));
      }
      render();
    } else {
      alert("Failed to update work");
    }
  } catch (e) {
    alert("Error updating work");
  }
}

async function render() {
  if (!list) return;
  list.innerHTML = "";
  const data = await getData();
  
  updateStats(data);
  
  const idField = document.getElementById('workId');
  if (idField) {
    idField.value = getNextId(data);
  }

  if (data.length === 0) {
    list.innerHTML = "<p style='padding: 20px; text-align: center; color: #64748b;'>No items in portfolio.</p>";
    return;
  }

  data.forEach((w) => {
    const d = document.createElement("div");
    d.className = "item";
    let preview = "";
    const isVideo = w.image && (w.image.includes("youtube.com") || w.image.includes("youtu.be") || (w.image.includes("dropbox.com") && w.image.includes("raw=1")));
    
    if (isVideo) {
      preview = '<i class="fa-solid fa-video" style="font-size: 30px; color: #10b981; width: 60px; text-align: center;"></i>';
    } else {
      preview = `<img src="${w.image}" onerror="this.src='https://placehold.co/100x100?text=Media'">`;
    }
    
    const catName = categories.find(c => String(c.id) === String(w.category_id))?.name || "Unknown";
    const subName = categories.find(c => String(c.id) === String(w.subcategory_id))?.name || "";

    d.innerHTML = `
      ${preview}
      <div class="item-info">
        <b>${w.id}</b>
        <small>${catName} ${subName ? '/ ' + subName : ''}</small>
      </div>
      <div style="display:flex; gap:10px; margin-left:auto;">
        <button class="btn-edit" style="background:#10b981; color:white; border:none; padding:5px 10px; border-radius:12px; cursor:pointer; font-size:12px;" onclick="editWork('${w.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
        <button class="btn-delete" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:12px; cursor:pointer; font-size:12px;" onclick="del('${w.id}')"><i class="fa-solid fa-trash"></i> Delete</button>
      </div>
    `;
    list.appendChild(d);
  });
}

async function renderInquiries() {
  const inquiryList = document.getElementById('inquiryList');
  if (!inquiryList) return;
  inquiryList.innerHTML = "<p style='padding: 20px; text-align: center;'>Loading inquiries...</p>";
  
  try {
    const response = await fetch('/api/inquiries');
    const inquiries = await response.json();
    inquiryList.innerHTML = "";
    
    if (inquiries.length === 0) {
      inquiryList.innerHTML = "<p style='padding: 20px; text-align: center; color: #64748b;'>No inquiries received yet.</p>";
      return;
    }
    
    inquiries.forEach((inq) => {
      const date = new Date(inq.created_at).toLocaleString();
      const d = document.createElement("div");
      d.className = "item inquiry-card";
      d.style.flexDirection = "column";
      d.style.alignItems = "flex-start";
      d.innerHTML = `
        <div class="inquiry-header">
          <b style="color: var(--primary); font-size: 16px;">${inq.name}</b>
          <span class="badge badge-new">New</span>
        </div>
        <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">
          <i class="fa-solid fa-envelope"></i> ${inq.email} | 
          <i class="fa-solid fa-wallet"></i> Budget: ₹${parseInt(inq.budget).toLocaleString()} | 
          <i class="fa-solid fa-calendar"></i> ${date}
        </div>
        <div class="message-text">${inq.message}</div>
        <button class="btn-delete" onclick="delInquiry(${inq.id})"><i class="fa-solid fa-check"></i> Mark as Resolved</button>
      `;
      inquiryList.appendChild(d);
    });
  } catch (error) {
    inquiryList.innerHTML = "<p style='color: #ef4444; padding: 20px; text-align: center;'>Failed to load inquiries.</p>";
    console.error(error);
  }
}

async function delInquiry(id) {
  if (!confirm("Mark this inquiry as resolved and delete?")) return;
  try {
    const response = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
    if (response.ok) renderInquiries();
  } catch (error) {
    alert("Operation failed");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchCategories().then(() => render());
});