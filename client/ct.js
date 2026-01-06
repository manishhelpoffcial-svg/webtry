function toggleMenu(){
  document.getElementById("mobileMenu").classList.toggle("active");
  document.getElementById("pageContent").classList.toggle("blurred");
}

function updateBudget(val) {
  document.getElementById('budgetValue').innerText = '₹' + parseInt(val).toLocaleString();
}

document.getElementById('contactForm').onsubmit = async (e) => {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerText;
  submitBtn.innerText = 'Sending...';
  submitBtn.disabled = true;

  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    budget: document.getElementById('budget').value,
    message: document.getElementById('message').value
  };

  try {
    const response = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      // Create modern popup
      const popup = document.createElement('div');
      popup.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        background: #10b981; color: white; 
        padding: 16px 24px; border-radius: 12px; 
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        z-index: 1000; font-weight: 600;
        animation: slideIn 0.3s ease-out;
      `;
      popup.innerText = 'Form Submitted Successfully!';
      document.body.appendChild(popup);

      setTimeout(() => {
        popup.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => popup.remove(), 300);
      }, 3000);

      e.target.reset();
      updateBudget(5000);
    } else {
      console.error('Server error:', result.message);
      alert('Error: ' + (result.message || 'Please try again later.'));
    }
  } catch (error) {
    console.error('Submission error:', error);
    alert('Something went wrong. Check your connection.');
  } finally {
    submitBtn.innerText = originalText;
    submitBtn.disabled = false;
  }
};

// Add animations to head
if (!document.getElementById('popup-styles')) {
    const style = document.createElement('style');
    style.id = 'popup-styles';
    style.innerHTML = `
      @keyframes slideIn { from { transform: translateX(120%); } to { transform: translateX(0); } }
      @keyframes slideOut { from { transform: translateX(0); } to { transform: translateX(120%); opacity: 0; } }
    `;
    document.head.appendChild(style);
}
