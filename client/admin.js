const list = document.getElementById("list");

let categories = [];

async function fetchCategories() {
  try {
    const res = await fetch('/api/categories');
    categories = await res.json();
    updateCategorySelects();
    renderCategories();
  } catch (e) { console.error("Cat fetch failed", e); }
}

function updateCategorySelects() {
  const mainSelect = document.getElementById('cat');
  const parentSelect = document.getElementById('parentCatSelect');
  if (!mainSelect || !parentSelect) return;

  const mainCats = categories.filter(c => !c.parent_id);
  
  mainSelect.innerHTML = '<option value="">Select Category</option>';
  parentSelect.innerHTML = '<option value="">Main Category</option>';

  mainCats.forEach(c => {
    mainSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
    parentSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
  });
}

function updateSubCats() {
  const catId = document.getElementById("cat").value;
  const sub = document.getElementById("subcat");
  if (!sub) return;
  sub.innerHTML = '<option value="">Select Sub-Category</option>';
  
  const subCats = categories.filter(c => c.parent_id == catId);
  subCats.forEach(c => {
    sub.innerHTML += `<option value="${c.id}">${c.name}</option>`;
  });
}

async function addCategory() {
  const name = document.getElementById('newCatName').value;
  const parent_id = document.getElementById('parentCatSelect').value || null;
  if (!name) return alert("Enter name");

  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, parent_id })
  });
  if (res.ok) {
    document.getElementById('newCatName').value = "";
    fetchCategories();
  }
}

function renderCategories() {
  const list = document.getElementById('categoryList');
  if (!list) return;
  list.innerHTML = "";
  categories.forEach(c => {
    const chip = document.createElement('span');
    chip.style = "background: #e2e8f0; padding: 5px 12px; border-radius: 999px; font-size: 12px; display: flex; align-items: center; gap: 8px;";
    chip.innerHTML = `${c.name} ${c.parent_id ? '<small>(sub)</small>' : ''} <i class="fa-solid fa-xmark" style="cursor:pointer" onclick="deleteCategory(${c.id})"></i>`;
    list.appendChild(chip);
  });
}

async function deleteCategory(id) {
  if (!confirm("Delete category?")) return;
  await fetch(`/api/categories/${id}`, { method: 'DELETE' });
  fetchCategories();
}

async function getData() {
  const res = await fetch('/api/works');
  return await res.json();
}

async function save() {
  const img = document.getElementById("img");
  const cat = document.getElementById("cat");
  const subcat = document.getElementById("subcat");

  if (!img.value || !cat.value) return alert("Please fill fields");

  const work = {
    id: getNextId(await getData()),
    category_id: cat.value,
    subcategory_id: subcat.value || null,
    image: img.value
  };

  const res = await fetch('/api/works', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(work)
  });

  if (res.ok) {
    img.value = cat.value = subcat.value = "";
    render();
    alert("Work published!");
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
  await fetch(`/api/works/${id}`, { method: 'DELETE' });
  render();
}

async function render() {
  if (!list) return;
  list.innerHTML = "";
  const data = await getData();
  
  if (data.length === 0) {
    list.innerHTML = "<p style='padding: 20px; text-align: center; color: #64748b;'>No items in portfolio.</p>";
    return;
  }

  data.forEach((w) => {
    const d = document.createElement("div");
    d.className = "item";
    let preview = "";
    const isVideo = w.image.includes("youtube.com") || w.image.includes("youtu.be") || w.image.includes("dropbox.com") && w.image.includes("raw=1");
    
    if (isVideo) {
      preview = '<i class="fa-solid fa-video" style="font-size: 30px; color: #10b981; width: 60px; text-align: center;"></i>';
    } else {
      preview = `<img src="${w.image}" onerror="this.src='https://placehold.co/100x100?text=Media'">`;
    }
    
    const catName = categories.find(c => c.id == w.category_id)?.name || "Unknown";
    const subName = categories.find(c => c.id == w.subcategory_id)?.name || "";

    d.innerHTML = `
      ${preview}
      <div class="item-info">
        <b>${w.id}</b>
        <small>${catName} ${subName ? '/ ' + subName : ''}</small>
      </div>
      <button class="btn-delete" onclick="del(${w.id})"><i class="fa-solid fa-trash"></i> Delete</button>
    `;
    list.appendChild(d);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetchCategories().then(() => render());
});

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

function updateSubCats() {
  const cat = document.getElementById("cat").value;
  const sub = document.getElementById("subcat");
  if (!sub) return;
  sub.innerHTML = '<option value="">Select Sub-Category</option>';
  const options = {
    graphic_design: ["Logo Design", "Social Media", "Branding", "UI/UX"],
    video_editing: ["Reels/Shorts", "YouTube Videos", "Commercials", "Documentary"]
  };
  if (options[cat]) {
    options[cat].forEach(o => {
      const opt = document.createElement("option");
      opt.value = o.toLowerCase().replace(/\s/g, "_");
      opt.innerText = o;
      sub.appendChild(opt);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  render();
  updateIdField();
});
