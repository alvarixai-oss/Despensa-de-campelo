
const marqueeTrack = document.querySelector(".hero-product-track");
if (marqueeTrack) {
  const halfWidth = marqueeTrack.scrollWidth / 2;
  gsap.to(marqueeTrack, {
    x: -halfWidth,
    duration: 28,
    ease: "none",
    repeat: -1,
    modifiers: {
      x: (x) => {
        const n = parseFloat(x);
        return `${n <= -halfWidth ? n + halfWidth : n}px`;
      }
    }
  });

  document.querySelectorAll(".hero-product img").forEach((img, i) => {
    gsap.to(img, {
      y: i % 2 ? 18 : -18,
      rotation: i % 2 ? 3 : -3,
      duration: 2.8 + (i % 4) * .45,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });
  });
}

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 0.9 });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

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
if (!reduceMotion && window.THREE) {
  const canvas=document.getElementById("webgl");
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7));
  renderer.setSize(window.innerWidth,window.innerHeight);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(48,window.innerWidth/window.innerHeight,.1,100);
  camera.position.z=5;
  const group=new THREE.Group();scene.add(group);
  const geometry=new THREE.IcosahedronGeometry(1.55,2);
  const material=new THREE.MeshBasicMaterial({color:0xd6bd91,wireframe:true,transparent:true,opacity:.075});
  const mesh=new THREE.Mesh(geometry,material);mesh.position.set(2.8,-.4,-1);group.add(mesh);
  const pg=new THREE.BufferGeometry(),count=130,pos=new Float32Array(count*3);
  for(let i=0;i<count;i++){pos[i*3]=(Math.random()-.5)*10;pos[i*3+1]=(Math.random()-.5)*8;pos[i*3+2]=(Math.random()-.5)*5}
  pg.setAttribute("position",new THREE.BufferAttribute(pos,3));
  const points=new THREE.Points(pg,new THREE.PointsMaterial({color:0xf0e5cf,size:.018,transparent:true,opacity:.3}));scene.add(points);
  let targetX=0,targetY=0;
  window.addEventListener("pointermove",(e)=>{targetX=(e.clientX/window.innerWidth-.5)*.35;targetY=(e.clientY/window.innerHeight-.5)*.25});
  function render(){group.rotation.y+=.0015;group.rotation.x+=.0007;points.rotation.y+=.00025;camera.position.x+=(targetX-camera.position.x)*.03;camera.position.y+=(-targetY-camera.position.y)*.03;camera.lookAt(0,0,0);renderer.render(scene,camera);requestAnimationFrame(render)}
  render();
  window.addEventListener("resize",()=>{renderer.setSize(window.innerWidth,window.innerHeight);camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix()});
}

window.addEventListener("load",()=>{activateProduct(0,1);ScrollTrigger.refresh()});