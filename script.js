gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.15,
  smoothWheel: true,
  wheelMultiplier: 0.9
});

lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

gsap.from(".hero-title .line", {
  yPercent: 120,
  opacity: 0,
  duration: 1.2,
  ease: "power4.out",
  stagger: 0.08
});

gsap.from(".reveal", {
  y: 28,
  opacity: 0,
  duration: 1,
  ease: "power3.out",
  stagger: 0.1,
  delay: 0.35
});

gsap.to(".hero-orbit img", {
  y: -30,
  rotation: 8,
  ease: "none",
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: 1.2
  }
});

gsap.to(".orbit-ring", {
  rotation: 180,
  duration: 24,
  repeat: -1,
  ease: "none"
});

gsap.from(".manifesto-text", {
  y: 70,
  opacity: 0,
  scrollTrigger: {
    trigger: ".manifesto",
    start: "top 72%",
    end: "top 42%",
    scrub: 1
  }
});

document.querySelectorAll(".product-panel").forEach((panel, index) => {
  const img = panel.querySelector(".product-visual img");
  const copy = panel.querySelector(".product-copy");
  const halo = panel.querySelector(".halo");

  gsap.fromTo(copy,
    { y: 90, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: panel,
        start: "top 72%",
        end: "top 40%",
        scrub: 1
      }
    }
  );

  gsap.fromTo(img,
    { y: 110, rotate: index % 2 ? 9 : -9, scale: 0.84 },
    {
      y: -40,
      rotate: index % 2 ? -4 : 4,
      scale: 1.06,
      ease: "none",
      scrollTrigger: {
        trigger: panel,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.1
      }
    }
  );

  gsap.to(halo, {
    scale: 1.13,
    opacity: 0.55,
    ease: "sine.inOut",
    duration: 2.8,
    repeat: -1,
    yoyo: true
  });

  ScrollTrigger.create({
    trigger: panel,
    start: "top 55%",
    end: "bottom 45%",
    onEnter: () => setTheme(panel),
    onEnterBack: () => setTheme(panel)
  });
});

function setTheme(panel) {
  const tone = panel.dataset.tone || "#171b12";
  const accent = panel.dataset.accent || "#d9b37a";
  document.documentElement.style.setProperty("--current-tone", tone);
  document.documentElement.style.setProperty("--current-accent", accent);
}

document.querySelectorAll("a[href^='#']").forEach((link) => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: 0, duration: 1.2 });
  });
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion && window.THREE) {
  const canvas = document.getElementById("webgl");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    48,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 5;

  const group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.IcosahedronGeometry(1.55, 2);
  const material = new THREE.MeshBasicMaterial({
    color: 0xd6bd91,
    wireframe: true,
    transparent: true,
    opacity: 0.075
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(2.8, -0.4, -1);
  group.add(mesh);

  const particlesGeometry = new THREE.BufferGeometry();
  const count = 130;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
  }

  particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particlesMaterial = new THREE.PointsMaterial({
    color: 0xf0e5cf,
    size: 0.018,
    transparent: true,
    opacity: 0.3
  });

  const points = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(points);

  let targetX = 0;
  let targetY = 0;

  window.addEventListener("pointermove", (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 0.35;
    targetY = (e.clientY / window.innerHeight - 0.5) * 0.25;
  });

  function render() {
    group.rotation.y += 0.0015;
    group.rotation.x += 0.0007;
    points.rotation.y += 0.00025;
    camera.position.x += (targetX - camera.position.x) * 0.03;
    camera.position.y += (-targetY - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
}

window.addEventListener("load", () => {
  ScrollTrigger.refresh();
});