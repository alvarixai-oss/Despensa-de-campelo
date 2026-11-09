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
let isProgrammaticProductJump = false;
let productTransitionToken = 0;

function activateProduct(index, direction = 1, instant = false) {
  const newItem = items[index];
  if (!newItem) return;

  const token = ++productTransitionToken;
  const oldItem = items[activeIndex];
  const oldCopy = oldItem?.querySelector(".showcase-copy");
  const oldProduct = oldItem?.querySelector(".showcase-product");
  const newCopy = newItem.querySelector(".showcase-copy");
  const newProduct = newItem.querySelector(".showcase-product");
  const newGhost = newItem.querySelector(".showcase-ghost");

  items.forEach((it, i) => {
    gsap.killTweensOf(it);
    gsap.killTweensOf(it.querySelector(".showcase-copy"));
    gsap.killTweensOf(it.querySelector(".showcase-product"));
    gsap.killTweensOf(it.querySelector(".showcase-ghost"));
    if (i !== index) {
      it.classList.remove("is-active");
      gsap.set(it, { autoAlpha: 0, pointerEvents: "none" });
    }
  });

  newItem.classList.add("is-active");
  gsap.set(newItem, { autoAlpha: 1, pointerEvents: "auto" });

  if (instant || !oldItem || oldItem === newItem) {
    gsap.set(newCopy, { x: 0, autoAlpha: 1 });
    gsap.set(newProduct, { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1 });
    gsap.set(newGhost, { scale: 1, autoAlpha: 1 });
  } else {
    gsap.fromTo(newCopy,
      { x: 55 * direction, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: .55, ease: "power3.out", overwrite: true }
    );
    gsap.fromTo(newProduct,
      { x: -90 * direction, y: 28, rotation: -7 * direction, scale: .9, autoAlpha: 0 },
      { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: .72, ease: "power3.out", overwrite: true }
    );
    gsap.fromTo(newGhost,
      { scale: 1.05, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: .65, ease: "power2.out", overwrite: true }
    );
  }

  const tone = newItem.dataset.tone;
  const accent = newItem.dataset.accent;
  stage.style.setProperty("--showcase-tone", tone);
  stage.style.setProperty("--showcase-accent", accent);
  document.documentElement.style.setProperty("--showcase-accent", accent);

  counter.textContent = String(index + 1).padStart(2, "0");
  dockButtons.forEach((b, i) => {
    const selected = i === index;
    b.classList.toggle("is-active", selected);
    b.setAttribute("aria-pressed", selected ? "true" : "false");
  });

  gsap.to(progress, {
    width: `${((index + 1) / items.length) * 100}%`,
    duration: instant ? 0 : .35,
    ease: "power2.out",
    overwrite: true
  });

  activeIndex = index;
  if (token === productTransitionToken) startAmbientMotion(newItem, index);
}

let ambientTweens = [];
function startAmbientMotion(item, i) {
  ambientTweens.forEach(t => t.kill());
  ambientTweens = [];
  const product = item?.querySelector(".showcase-product");
  const img = item?.querySelector(".showcase-product > img, .image-medallion");
  const orbitA = item?.querySelector(".orbit-a");
  const orbitB = item?.querySelector(".orbit-b");
  if (!product) return;

  ambientTweens.push(
    gsap.to(product,{y:-10,duration:3.1,repeat:-1,yoyo:true,ease:"sine.inOut"}),
    gsap.to(orbitA,{rotation:360,duration:24+i,repeat:-1,ease:"none"}),
    gsap.to(orbitB,{rotation:-360,duration:19+i,repeat:-1,ease:"none"})
  );
  if (img) ambientTweens.push(
    gsap.to(img,{rotation:i%2?2.2:-2.2,duration:4.2,repeat:-1,yoyo:true,ease:"sine.inOut"})
  );
}

steps.forEach((step,index)=>{
  ScrollTrigger.create({
    trigger:step,
    start:"top center",
    end:"bottom center",
    onEnter:()=>{ if(!isProgrammaticProductJump) activateProduct(index,1); },
    onEnterBack:()=>{ if(!isProgrammaticProductJump) activateProduct(index,-1); }
  });
});

dockButtons.forEach(btn=>{
  btn.addEventListener("click",(e)=>{
    e.preventDefault();
    e.stopPropagation();

    const i = Number(btn.dataset.go);
    const target = steps[i];
    if (!target) return;

    const direction = i >= activeIndex ? 1 : -1;
    isProgrammaticProductJump = true;
    activateProduct(i, direction, false);

    lenis.scrollTo(target, {
      offset: window.innerHeight * .02,
      duration: .75,
      onComplete: () => {
        isProgrammaticProductJump = false;
        ScrollTrigger.update();
      }
    });

    window.setTimeout(() => {
      isProgrammaticProductJump = false;
    }, 950);
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

window.addEventListener("load",()=>{activateProduct(0,1,true);ScrollTrigger.refresh()});