AFRAME.registerComponent("energy-triangle", {
  schema: {
    m0: { type: "selector" },
    m1: { type: "selector" },
    m2: { type: "selector" },
    edgeColor: { type: "color", default: "#31f1ff" },
    glowColor: { type: "color", default: "#ff80ff" },
    sparkleColor: { type: "color", default: "#ffffff" },
    sparkleCount: { type: "int", default: 48 }
  },

  init() {
    // stan widoczności markerów
    this.found = { 
      m0: false, 
      m1: false, 
      m2: false 
    };
    // potrzebne, żeby np. resetować animację przy ponownym pojawieniu się markerów
    this.wasAllVisible = false;

    // podpinamy eventy do markera
    const hook = (key, el) => {
      if (!el) return;
      
      el.addEventListener("markerFound", () => { 
        this.found[key] = true; 
      });

      el.addEventListener("markerLost", () => {
        this.found[key] = false;
        this.wasAllVisible = false;
        this.hideEffects();
      });
    };

    // podpinamy eventy do markerów wskazanych w schema
    hook("m0", this.data.m0);
    hook("m1", this.data.m1);
    hook("m2", this.data.m2);

    // 3 wierzchołki * 3 składowe (x,y,z) = 9 floatów
    this.edgePositions = new Float32Array(9);
    // geometria z atrybutem "position"
    this.edgeGeometry = new THREE.BufferGeometry();
    this.edgeGeometry.setAttribute("position", new THREE.BufferAttribute(this.edgePositions, 3));
    
    // materiał linii (kolor, przezroczystość)
    this.edgeMaterial = new THREE.LineBasicMaterial({ 
      color: new THREE.Color(this.data.edgeColor), 
      transparent: true, 
      opacity: 0.9 
    });
    
    // LineLoop = automatycznie domyka linię (0->1->2->0)
    this.edgeLine = new THREE.LineLoop(this.edgeGeometry, this.edgeMaterial);

    // w AR często obiekty “znikają” bo frustum culling uzna, że są poza kamerą
    // wyłączamy to (bezpieczniej w AR)
    this.edgeLine.frustumCulled = false;

    // dodajemy do sceny (root object3D)
    this.el.sceneEl.object3D.add(this.edgeLine);
    this.edgeLine.visible = false;

    // GLOW RING
    this.glowMaterial = new THREE.MeshBasicMaterial({ 
      color: new THREE.Color(this.data.glowColor), 
      transparent: true, 
      opacity: 0.6, 
      side: THREE.DoubleSide 
    });
    
    // torus
    this.glowRing = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.025, 12, 120), this.glowMaterial);
    this.glowRing.frustumCulled = false;
    this.el.sceneEl.object3D.add(this.glowRing);
    this.glowRing.visible = false;

    // SPARKLES
    this.sparkleCount = Math.max(12, this.data.sparkleCount);
    
    // kazdy punkt ma 3 skladowe (x,y,z)
    this.sparklePositions = new Float32Array(this.sparkleCount * 3);
    this.sparkleGeometry = new THREE.BufferGeometry();
    this.sparkleGeometry.setAttribute("position", new THREE.BufferAttribute(this.sparklePositions, 3));
    this.sparkleMaterial = new THREE.PointsMaterial({ 
      color: new THREE.Color(this.data.sparkleColor), 
      size: 0.03, 
      transparent: true, 
      opacity: 0.9, 
      depthWrite: false 
    });

    this.sparkles = new THREE.Points(this.sparkleGeometry, this.sparkleMaterial);
    this.sparkles.frustumCulled = false;
    this.el.sceneEl.object3D.add(this.sparkles);
    this.sparkles.visible = false;
    
    // faza [0..1] dla każdej iskry, żeby startowały losowo na krawędziach
    this.sparklePhases = new Float32Array(this.sparkleCount);
    for (let i = 0; i < this.sparkleCount; i++) {
      this.sparklePhases[i] = Math.random();
    }
    // OBIEKTY TYMCZASOWE
    this.tmpP0 = new THREE.Vector3();
    this.tmpP1 = new THREE.Vector3();
    this.tmpP2 = new THREE.Vector3();
    this.tmpCenter = new THREE.Vector3();
    this.tmpNormal = new THREE.Vector3();
    this.tmpPos = new THREE.Vector3();
    this.tmpQuat = new THREE.Quaternion();
    this.tmpSpinQuat = new THREE.Quaternion();
    this.upVector = new THREE.Vector3(0, 1, 0);
    
    // kąt obrotu ringu
    this.ringSpin = 0;
  },

  allVisible() {
    return this.found.m0 && this.found.m1 && this.found.m2;
  },

  hideEffects() {
    this.edgeLine.visible = false;
    this.glowRing.visible = false;
    this.sparkles.visible = false;
  },

  tick(time, timeDelta) {
    // Jeśli nie ma kompletu markerów to nic nie rysuj
    if (!this.allVisible()) return;

    if (!this.wasAllVisible) {
      this.wasAllVisible = true;
      this.ringSpin = 0;
    }

    // Pobieramy pozycje markerów w przestrzeni świata
    this.data.m0.object3D.getWorldPosition(this.tmpP0);
    this.data.m1.object3D.getWorldPosition(this.tmpP1);
    this.data.m2.object3D.getWorldPosition(this.tmpP2);

    // Wyliczamy środek trójkąta
    this.tmpCenter.copy(this.tmpP0).add(this.tmpP1).add(this.tmpP2).divideScalar(3);

    // Wyliczamy normalną płaszczyzny trójkąta
    const edgeA = this.tmpP1.clone().sub(this.tmpP0);
    const edgeB = this.tmpP2.clone().sub(this.tmpP0);
    this.tmpNormal.copy(edgeA).cross(edgeB).normalize();

    // Aktualizujemy geometrię linii trójkąta
    const edgePositions = [this.tmpP0, this.tmpP1, this.tmpP2];
    for (let i = 0; i < 3; i++) {
      this.edgePositions[i * 3] = edgePositions[i].x;
      this.edgePositions[i * 3 + 1] = edgePositions[i].y;
      this.edgePositions[i * 3 + 2] = edgePositions[i].z;
    }
    this.edgeGeometry.attributes.position.needsUpdate = true;
    this.edgeLine.visible = true;

    // Glow ring: dopasowanie rozmiaru i orientacji
    const largestEdge = Math.max(edgeA.length(), edgeB.length(), edgeB.clone().sub(edgeA).length());
    // ring ma być “trochę mniejszy” niż trójkąt + minimum, żeby nie znikł
    const scale = Math.max(largestEdge * 0.75, 0.18);
    // ring na środek
    this.glowRing.position.copy(this.tmpCenter);
    this.glowRing.scale.setScalar(scale);

    // ustawiamy orientację ringu tak, żeby jego up (0,1,0) wskazywał normalną trójkąta
    this.tmpQuat.setFromUnitVectors(this.upVector, this.tmpNormal);

    // dodatkowy obrót wokół normalnej (efekt “wirującego energii”)
    this.tmpSpinQuat.setFromAxisAngle(this.tmpNormal, this.ringSpin);

    // dopasowanie do normalnej * spin
    this.tmpQuat.multiply(this.tmpSpinQuat);
    
    // ustawiamy rotację obiektu
    this.glowRing.setRotationFromQuaternion(this.tmpQuat);
    this.glowRing.visible = true;

    // Aktualizacja ringSpin w czasie
    const dt = timeDelta / 1000;
    this.ringSpin = (this.ringSpin + dt * 1.2) % (Math.PI * 2);
    
    // Sparkles poruszają się po 3 krawędziach
    const edges = [
      [this.tmpP0, this.tmpP1],
      [this.tmpP1, this.tmpP2],
      [this.tmpP2, this.tmpP0],
    ];

    const sparklePositions = this.sparklePositions;
    for (let i = 0; i < this.sparkleCount; i++) {
      // prędkość przesuwania fazy, zależna od grupy nadaje trochę różnorodności
      const phaseSpeed = 0.3 + (i % 3) * 0.08;
      // faza 0..1 (wzdłuż krawędzi)
      this.sparklePhases[i] = (this.sparklePhases[i] + dt * phaseSpeed) % 1;
      const edge = edges[i % 3];
      // pozycja na odcinku
      this.tmpPos.lerpVectors(edge[0], edge[1], this.sparklePhases[i]);

      // lekkie falowanie w kierunku normalnej
      const wobble = Math.sin(time * 0.002 + i) * 0.04;
      this.tmpPos.addScaledVector(this.tmpNormal, wobble);

      // zapisujemy do bufora pozycji
      sparklePositions[i * 3] = this.tmpPos.x;
      sparklePositions[i * 3 + 1] = this.tmpPos.y;
      sparklePositions[i * 3 + 2] = this.tmpPos.z;
    }
    //informujemy o zmianie bufora
    this.sparkleGeometry.attributes.position.needsUpdate = true;
    this.sparkles.visible = true;
  },
});


/*************************************************************
 * UI PANEL: Nike / Apple
 * 
 * Cel:
 * - jak marker m0 (Nike) jest widoczny to pokaż panel Nike
 * - jak marker m1 (Apple) jest widoczny to pokaż panel Apple
 * - jak marker znika i panel był od niego -> schowaj
 * - przycisk do włączania/wyłączania panelu (jak wyłączony to nie pokazuj nic)
 *************************************************************/
window.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("infoPanel");
  const titleEl = document.getElementById("infoTitle");
  const bodyEl = document.getElementById("infoBody");
  const closeBtn = document.getElementById("infoClose");

  const toggleBtn = document.getElementById("panelToggle");
  let panelEnabled = false;

  const markerNike = document.getElementById("m0");
  const markerApple = document.getElementById("m1");

  let visibleMarkerId = null;

  function showInfo(title, bodyHtml) {
    // jeśli wyłączone -> nie pokazuj
    if (!panelEnabled) return;

    titleEl.innerHTML = title;
    bodyEl.innerHTML = bodyHtml;
    panel.style.display = "block";
  }

  function hideInfo() {
    panel.style.display = "none";
  }

  // Toggle ON/OFF
  toggleBtn.addEventListener("click", () => {
    panelEnabled = !panelEnabled;

    toggleBtn.classList.toggle("off", !panelEnabled);
    toggleBtn.setAttribute("aria-pressed", String(panelEnabled));

    // jak user wyłączy -> schowaj panel i zapomnij “kto był widoczny”
    if (!panelEnabled) {
      visibleMarkerId = null;
      hideInfo();
    }
  });

  closeBtn.addEventListener("click", () => {
    visibleMarkerId = null;
    hideInfo();
  });

  const content = {
    nike: {
      title: "Nike <span class='tag'>Detected</span>",
      html: `
        <p>Detected <b>Nike</b> marker. Sport style and performance technologies.</p>
        <ul>
          <li>Training and lifestyle apparel</li>
          <li>Comfort and breathability</li>
          <li>Performance collections</li>
        </ul>
        <div class="ctaRow">
          <a class="btn" href="https://www.nike.com/w/new-shoes" target="_blank">New Arrivals</a>
          <a class="btn" href="https://www.nike.com/" target="_blank">Visit Nike</a>
        </div>
      `
    },
    apple: {
      title: "Apple <span class='tag'>Detected</span>",
      html: `
        <p>Detected <b>Apple</b> marker. Ecosystem of devices and services.</p>
        <ul>
          <li>Apple Silicon: High performance</li>
          <li>Seamless experience: iPhone, Mac, iPad</li>
          <li>Privacy and security focused</li>
        </ul>
        <div class="ctaRow">
          <a class="btn" href="https://www.apple.com/iphone/" target="_blank">iPhone</a>
          <a class="btn" href="https://www.apple.com/mac/" target="_blank">Mac</a>
        </div>
      `
    }
  };

  markerNike.addEventListener("markerFound", () => {
    if (!panelEnabled) return; // <--- KLUCZ
    visibleMarkerId = "nike";
    showInfo(content.nike.title, content.nike.html);
  });
  markerNike.addEventListener("markerLost", () => {
    if (visibleMarkerId === "nike") {
      visibleMarkerId = null;
      hideInfo();
    }
  });

  markerApple.addEventListener("markerFound", () => {
    if (!panelEnabled) return; // <--- KLUCZ
    visibleMarkerId = "apple";
    showInfo(content.apple.title, content.apple.html);
  });
  markerApple.addEventListener("markerLost", () => {
    if (visibleMarkerId === "apple") {
      visibleMarkerId = null;
      hideInfo();
    }
  });
});
