gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 0.9 });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const heroSection = document.querySelector(".agrumea-hero");
const marqueeTrack = document.querySelector(".hero-product-track");
const heroProducts = [...document.querySelectorAll(".hero-product")];
const enterProducts = document.getElementById("enter-products");
const productsIntro = document.getElementById("productos");

let heroGateLocked = document.body.classList.contains("hero-gate-locked");
let heroProgress = 0;
let heroTouchY = 0;

function getHeroLoopWidth() {
  if (!marqueeTrack) return 0;
  return marqueeTrack.scrollWidth / 2;
}

function renderHeroProgress(progress, immediate = false) {
  heroProgress = ((progress % 1) + 1) % 1;
  const loopWidth = getHeroLoopWidth();
  const x = -loopWidth * heroProgress;

  gsap.to(marqueeTrack, {
    x,
    duration: immediate ? 0 : .42,
    ease: "power3.out",
    overwrite: true
  });

  heroProducts.forEach((product, i) => {
    const media = product.querySelector(".hero-product-media");
    if (!media) return;
    const phase = (heroProgress * Math.PI * 2) + i * .55;
    gsap.to(media, {
      y: Math.sin(phase) * 14,
      rotation: Math.cos(phase) * 2.4,
      duration: immediate ? 0 : .45,
      ease: "power2.out",
      overwrite: "auto"
    });
  });
}

function unlockHeroAndEnterProducts() {
  if (!heroGateLocked) return;
  heroGateLocked = false;
  document.body.classList.remove("hero-gate-locked");
  document.body.classList.add("hero-gate-open");
  lenis.start();

  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    if (productsIntro) {
      lenis.scrollTo(productsIntro, { offset: -24, duration: 1.15 });
    }
  });
}

if (heroSection && marqueeTrack) {
  lenis.stop();
  renderHeroProgress(0, true);

  window.addEventListener("wheel", (e) => {
    if (!heroGateLocked) return;
    e.preventDefault();
    const delta = e.deltaY || e.deltaX;
    renderHeroProgress(heroProgress + delta * 0.00042);
  }, { passive: false });

  window.addEventListener("keydown", (e) => {
    if (!heroGateLocked) return;
    if (["ArrowDown","ArrowRight","PageDown"," "].includes(e.key)) {
      e.preventDefault();
      renderHeroProgress(heroProgress + .1);
    } else if (["ArrowUp","ArrowLeft","PageUp"].includes(e.key)) {
      e.preventDefault();
      renderHeroProgress(heroProgress - .1);
    }
  });

  heroSection.addEventListener("touchstart", (e) => {
    if (!heroGateLocked) return;
    heroTouchY = e.touches[0]?.clientY || 0;
  }, { passive: true });

  heroSection.addEventListener("touchmove", (e) => {
    if (!heroGateLocked) return;
    const y = e.touches[0]?.clientY || heroTouchY;
    const delta = heroTouchY - y;
    heroTouchY = y;
    renderHeroProgress(heroProgress + delta * 0.0022);
  }, { passive: true });

  enterProducts?.addEventListener("click", (e) => {
    e.preventDefault();
    unlockHeroAndEnterProducts();
  });

  // Product cards on the locked hero remain interactive visually,
  // but only the top PRODUCTS control unlocks vertical navigation.
  heroProducts.forEach((product) => {
    product.addEventListener("click", (e) => {
      if (heroGateLocked) e.preventDefault();
    });
  });

  window.addEventListener("resize", () => renderHeroProgress(heroProgress, true));
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
let manualSelectionUntil = 0;
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
  const orbitA = item?.querySelector(".orbit-a");
  const orbitB = item?.querySelector(".orbit-b");
  if (!product) return;

  ambientTweens.push(
    gsap.to(product,{y:-10,duration:3.1,repeat:-1,yoyo:true,ease:"sine.inOut"}),
    gsap.to(orbitA,{rotation:360,duration:24+i,repeat:-1,ease:"none"}),
    gsap.to(orbitB,{rotation:-360,duration:19+i,repeat:-1,ease:"none"})
  );
}

steps.forEach((step,index)=>{
  ScrollTrigger.create({
    trigger:step,
    start:"top center",
    end:"bottom center",
    onEnter:()=>{ if(performance.now() > manualSelectionUntil) activateProduct(index,1); },
    onEnterBack:()=>{ if(performance.now() > manualSelectionUntil) activateProduct(index,-1); }
  });
});

dockButtons.forEach(btn=>{
  btn.addEventListener("pointerdown",(e)=>{
    e.stopPropagation();
  });

  btn.addEventListener("click",(e)=>{
    e.preventDefault();
    e.stopPropagation();

    const i = Number(btn.dataset.go);
    if (!Number.isInteger(i) || !items[i]) return;

    manualSelectionUntil = performance.now() + 1200;
    const direction = i >= activeIndex ? 1 : -1;
    activateProduct(i, direction, false);

    gsap.fromTo(btn,
      { scale: .88 },
      { scale: 1, duration: .38, ease: "back.out(2.2)", overwrite: true }
    );
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

const showcaseProducts = [...document.querySelectorAll(".showcase-product")];
const finePointerShowcase = window.matchMedia("(pointer:fine)").matches;

if (finePointerShowcase) {
  showcaseProducts.forEach((product) => {
    const visual = product.querySelector(":scope > img, .image-medallion");
    const aura = product.querySelector(".product-aura");
    const chip = product.querySelector(".product-chip");
    if (!visual) return;

    gsap.set(visual, {
      transformPerspective: 900,
      transformOrigin: "50% 50%"
    });

    const rotateYTo = gsap.quickTo(visual, "rotationY", { duration: .28, ease: "power3.out" });
    const rotateXTo = gsap.quickTo(visual, "rotationX", { duration: .28, ease: "power3.out" });
    const scaleTo = gsap.quickTo(visual, "scale", { duration: .28, ease: "power3.out" });
    const yTo = gsap.quickTo(visual, "y", { duration: .28, ease: "power3.out" });

    product.addEventListener("pointerenter", () => {
      scaleTo(1.085);
      yTo(-12);

      if (aura) {
        gsap.to(aura, {
          scale: 1.18,
          opacity: .78,
          duration: .35,
          ease: "power2.out",
          overwrite: true
        });
      }

      if (chip) {
        gsap.to(chip, {
          y: -7,
          scale: 1.06,
          duration: .32,
          ease: "power2.out",
          overwrite: true
        });
      }
    }, { passive: true });

    product.addEventListener("pointermove", (e) => {
      const r = product.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;

      rotateYTo(px * 13);
      rotateXTo(py * -9);
    }, { passive: true });

    product.addEventListener("pointerleave", () => {
      rotateYTo(0);
      rotateXTo(0);
      scaleTo(1);
      yTo(0);

      if (aura) {
        gsap.to(aura, {
          scale: 1,
          opacity: .55,
          duration: .38,
          ease: "power2.out",
          overwrite: true
        });
      }

      if (chip) {
        gsap.to(chip, {
          y: 0,
          scale: 1,
          duration: .32,
          ease: "power2.out",
          overwrite: true
        });
      }
    }, { passive: true });
  });
}

document.querySelectorAll("a[href^='#']:not(#enter-products)").forEach((link)=>{
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