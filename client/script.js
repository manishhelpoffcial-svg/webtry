function toggleMenu(){
  document.getElementById("mobileMenu").classList.toggle("active");
}

const thumbs = document.querySelectorAll(".thumb");

const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("visible");
    }
  });
},{threshold:0.3});

thumbs.forEach(t=>observer.observe(t));

const carousel = document.getElementById("carousel");
if (carousel) {
  let scrollPos = 0;
  setInterval(()=>{
    scrollPos += 1;
    carousel.scrollLeft = scrollPos;
    if(scrollPos >= carousel.scrollWidth - carousel.clientWidth){
      scrollPos = 0;
    }
  },30);
}

thumbs.forEach(t=>{
  t.addEventListener("click",()=>{
    thumbs.forEach(x=>x.classList.remove("active"));
    t.classList.add("active");
  });
});
