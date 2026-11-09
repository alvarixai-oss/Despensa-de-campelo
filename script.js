gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 0.9 });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const heroSection = document.querySelector(".agrumea-hero");
const marqueeTrack = document.querySelector(".hero-product-track");
const heroProducts = [...document.querySelectorAll(".hero-product")];

if (heroSection && marqueeTrack) {
  const getTravel = () => {
    const halfWidth = marqueeTrack.scrollWidth / 2;
    return Math.max(0, halfWidth - window.innerWidth * 0.55);
  };

  gsap.set(marqueeTrack, { x: 0 });

  const heroTween = gsap.to(marqueeTrack, {
    x: () => -getTravel(),
    ease: "none",
    scrollTrigger: {
      trigger: heroSection,
      start: "top top",
      end: () => "+=" + Math.max(2200, getTravel() * 1.35),
      pin: true,
      scrub: 0.7,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });

  heroProducts.forEach((product, i) => {
    const img = product.querySelector(".hero-product-media");
    if (!img) return;
    gsap.fromTo(img,
      { y: i % 2 ? 12 : -12, rotation: i % 2 ? 1.5 : -1.5 },
      {
        y: i % 2 ? -18 : 18,
        rotation: i % 2 ? -2.5 : 2.5,
        ease: "none",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: () => "+=" + Math.max(2200, getTravel() * 1.35),
          scrub: 0.7
        }
      }
    );
  });

  const openProductDetail = (product) => {
    const index = Number(product.dataset.productIndex);
    const target = steps[index];
    if (!target) return;
    lenis.scrollTo(target, { offset: window.innerHeight * 0.02, duration: 1.4 });
  };

  heroProducts.forEach((product) => {
    product.addEventListener("click", () => openProductDetail(product));
    product.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openProductDetail(product);
      }
    });
  });

  window.addEventListener("resize", () => ScrollTrigger.refresh());
}


gsap.from(".manifesto-text", { y:70, opacity:0, scrollTrigger:{trigger:".manifesto",start:"top 72%",end:"top 42%",scrub:1}});

const showcase = document.querySelector(".product-showcase");
const stage = document.querySelector(".showcase-stage");
const items = [...document.querySelectorAll(".showcase-item")];
const steps = [...document.querySelectorAll(".product-step")];
const dockButtons = [...document.querySelectorAll(".product-dock button")];
const counter = document.getElementById("stageCurrent");
const progress = document.querySelector(".showcase-progress span");
let activeIndex = 0;

function activateProduct(index, direction = 1) {
  if (index === activeIndex && items[index].classList.contains("is-active")) return;
  const oldItem = items[activeIndex];
  const newItem = items[index];
  if (!newItem) return;

  const oldCopy = oldItem?.querySelector(".showcase-copy");
  const oldProduct = oldItem?.querySelector(".showcase-product");
  const newCopy = newItem.querySelector(".showcase-copy");
  const newProduct = newItem.querySelector(".showcase-product");
  const newGhost = newItem.querySelector(".showcase-ghost");

  items.forEach((it,i)=>{ if(i!==activeIndex && i!==index){ it.classList.remove("is-active"); gsap.set(it,{autoAlpha:0}); }});
  if (oldItem) {
    gsap.to(oldCopy,{x:-70*direction,autoAlpha:0,duration:.42,ease:"power2.in"});
    gsap.to(oldProduct,{x:120*direction,rotation:10*direction,scale:.84,autoAlpha:0,duration:.48,ease:"power2.in"});
    gsap.to(oldItem,{autoAlpha:0,duration:.5,onComplete:()=>oldItem.classList.remove("is-active")});
  }

  newItem.classList.add("is-active");
  gsap.set(newItem,{autoAlpha:1});
  gsap.fromTo(newCopy,{x:70*direction,autoAlpha:0},{x:0,autoAlpha:1,duration:.75,ease:"power3.out",delay:.1});
  gsap.fromTo(newProduct,{x:-120*direction,y:45,rotation:-12*direction,scale:.72,autoAlpha:0},{x:0,y:0,rotation:0,scale:1,autoAlpha:1,duration:.9,ease:"power4.out"});
  gsap.fromTo(newGhost,{scale:1.12,autoAlpha:0},{scale:1,autoAlpha:1,duration:1,ease:"power2.out"});

  const tone = newItem.dataset.tone;
  const accent = newItem.dataset.accent;
  stage.style.setProperty("--showcase-tone", tone);
  stage.style.setProperty("--showcase-accent", accent);
  document.documentElement.style.setProperty("--showcase-accent", accent);

  counter.textContent = String(index + 1).padStart(2,"0");
  dockButtons.forEach((b,i)=>b.classList.toggle("is-active",i===index));
  gsap.to(progress,{width:`${((index+1)/items.length)*100}%`,duration:.55,ease:"power3.out"});
  activeIndex = index;
}

items.forEach((item,i)=>{
  const product = item.querySelector(".showcase-product");
  const img = item.querySelector(".showcase-product > img, .image-medallion");
  const orbitA = item.querySelector(".orbit-a");
  const orbitB = item.querySelector(".orbit-b");
  gsap.to(product,{y:-12,duration:2.8+i*.13,repeat:-1,yoyo:true,ease:"sine.inOut"});
  if(img) gsap.to(img,{rotation:i%2?3:-3,duration:3.6+i*.12,repeat:-1,yoyo:true,ease:"sine.inOut"});
  gsap.to(orbitA,{rotation:360,duration:22+i,repeat:-1,ease:"none"});
  gsap.to(orbitB,{rotation:-360,duration:17+i,repeat:-1,ease:"none"});
});

steps.forEach((step,index)=>{
  ScrollTrigger.create({
    trigger:step,
    start:"top center",
    end:"bottom center",
    onEnter:()=>activateProduct(index,1),
    onEnterBack:()=>activateProduct(index,-1)
  });
});

dockButtons.forEach(btn=>{
  btn.addEventListener("click",()=>{
    const i=Number(btn.dataset.go);
    const target=steps[i];
    if(target) lenis.scrollTo(target,{offset:window.innerHeight*.02,duration:1.25});
  });
});

if (showcase) {
  ScrollTrigger.create({
    trigger:showcase,
    start:"top top",
    end:"bottom bottom",
    onUpdate:(self)=>{
      const item = items[activeIndex];
      const product = item?.querySelector(".showcase-product");
      if(product){
        const local = (self.progress*items.length)%1;
        gsap.to(product,{rotationY:(local-.5)*10,rotationX:(local-.5)*-4,duration:.2,overwrite:true});
      }
    }
  });
}

document.querySelectorAll("a[href^='#']").forEach((link)=>{
  link.addEventListener("click",(e)=>{
    const target=document.querySelector(link.getAttribute("href"));
    if(!target) return;
    e.preventDefault();
    lenis.scrollTo(target,{duration:1.2});
  });
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Lightweight Agrumea-style depth: scroll-driven pitch + pointer tilt, no WebGL.
if (!reduceMotion) {
  const finePointer = window.matchMedia("(pointer:fine)").matches;
  const visibleHeroProducts = heroProducts.filter(p => p.getAttribute("aria-hidden") !== "true");

  visibleHeroProducts.forEach((product, i) => {
    const media = product.querySelector(".hero-product-media");
    if (!media) return;

    if (finePointer) {
      const xTo = gsap.quickTo(media, "rotationY", { duration: .35, ease: "power2.out" });
      const yTo = gsap.quickTo(media, "rotationX", { duration: .35, ease: "power2.out" });
      const sTo = gsap.quickTo(media, "scale", { duration: .28, ease: "power2.out" });

      product.addEventListener("pointermove", (e) => {
        const r = product.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        xTo(px * 12);
        yTo(py * -9);
        sTo(1.035);
      }, { passive: true });

      product.addEventListener("pointerleave", () => {
        xTo(0); yTo(0); sTo(1);
      }, { passive: true });
    }
  });
}

window.addEventListener("load",()=>{activateProduct(0,1);ScrollTrigger.refresh()});