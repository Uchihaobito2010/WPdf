const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const createBtn = document.getElementById("createBtn");
const pdfNameInput = document.getElementById("pdfName");

const posX = document.getElementById("posX");
const posY = document.getElementById("posY");
const scale = document.getElementById("scale");
const rotate = document.getElementById("rotate");

let pages = [];
let activePage = null;

/* ---------------- helpers ---------------- */

function updateBadges() {
  [...preview.children].forEach((box, i) => {
    box.querySelector(".badge").textContent = i + 1;
  });
}

function applyPreview(page) {
  if (!page) return;
  const img = page.box.querySelector("img");

  img.style.transform = `
    translate(${page.x}px, ${page.y}px)
    scale(${page.scale / 100})
    rotate(${page.rotate}deg)
  `;
}

function syncControls(page) {
  posX.value = page.x;
  posY.value = page.y;
  scale.value = page.scale;
  rotate.value = page.rotate;
}

/* ---------------- live controls ---------------- */

[posX, posY, scale, rotate].forEach(el => {
  el.addEventListener("input", () => {
    if (!activePage) return;

    activePage.x = +posX.value;
    activePage.y = +posY.value;
    activePage.scale = +scale.value;
    activePage.rotate = +rotate.value;

    applyPreview(activePage);
  });
});

/* ---------------- image load ---------------- */

input.addEventListener("change", () => {
  preview.innerHTML = "";
  pages = [];
  activePage = null;

  [...input.files].forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const page = {
        src: e.target.result, // already loaded base64
        x: 0,
        y: 0,
        scale: 100,
        rotate: 0,
        box: null
      };

      const box = document.createElement("div");
      box.className = "image-box";

      const img = document.createElement("img");
      img.src = page.src;

      const badge = document.createElement("span");
      badge.className = "badge";

      box.append(img, badge);
      preview.appendChild(box);

      page.box = box;
      pages.push(page);

      box.onclick = () => {
        document.querySelectorAll(".image-box").forEach(b => b.classList.remove("active"));
        box.classList.add("active");

        activePage = page;
        syncControls(page);
        applyPreview(page);
      };

      updateBadges();
    };
    reader.readAsDataURL(file);
  });
});

/* ---------------- reorder ---------------- */

new Sortable(preview, {
  animation: 150,
  onEnd: () => {
    pages = [...preview.children].map(box =>
      pages.find(p => p.box === box)
    );
    updateBadges();
  }
});

/* ---------------- PDF CREATE (SYNC — THIS IS KEY) ---------------- */

createBtn.onclick = () => {
  if (!pages.length) {
    alert("Select images first");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  pages.forEach((p, i) => {
    if (i !== 0) pdf.addPage();

    const w = (210 * p.scale) / 100;
    const h = (297 * p.scale) / 100;
    const rad = (p.rotate * Math.PI) / 180;

    pdf.saveGraphicsState();
    pdf.translate(105 + p.x, 148 + p.y);
    pdf.rotate(rad);

    // IMPORTANT: use base64 directly
    pdf.addImage(p.src, "PNG", -w / 2, -h / 2, w, h);

    pdf.restoreGraphicsState();
  });

  const name = (pdfNameInput.value || "image-to-pdf").replace(/\.pdf$/i, "");
  pdf.save(name + ".pdf");
};
