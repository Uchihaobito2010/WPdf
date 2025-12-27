const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");

const posX = document.getElementById("posX");
const posY = document.getElementById("posY");
const scale = document.getElementById("scale");
const rotate = document.getElementById("rotate");

let pages = []; // { src, x, y, scale, rotate }
let activeIndex = null;

/* =========================
   APPLY LIVE PREVIEW
========================= */
function applyPreview(index) {
  if (index === null) return;

  const box = preview.children[index];
  if (!box) return;

  const img = box.querySelector("img");
  const p = pages[index];

  img.style.transform = `
    translate(${p.x}px, ${p.y}px)
    scale(${p.scale / 100})
    rotate(${p.rotate}deg)
  `;
}

/* =========================
   SLIDER LIVE UPDATE
========================= */
[posX, posY, scale, rotate].forEach(el => {
  el.addEventListener("input", () => {
    if (activeIndex === null) return;

    pages[activeIndex].x = Number(posX.value);
    pages[activeIndex].y = Number(posY.value);
    pages[activeIndex].scale = Number(scale.value);
    pages[activeIndex].rotate = Number(rotate.value);

    applyPreview(activeIndex);
  });
});

/* =========================
   IMAGE INPUT
========================= */
input.addEventListener("change", () => {
  preview.innerHTML = "";
  pages = [];
  activeIndex = null;

  [...input.files].forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = e => {
      pages.push({
        src: e.target.result,
        x: 0,
        y: 0,
        scale: 100,
        rotate: 0
      });

      const box = document.createElement("div");
      box.className = "image-box";

      const img = document.createElement("img");
      img.src = e.target.result;

      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = i + 1;

      box.append(img, badge);
      preview.appendChild(box);

      box.onclick = () => {
        document
          .querySelectorAll(".image-box")
          .forEach(b => b.classList.remove("active"));

        box.classList.add("active");
        activeIndex = i;

        posX.value = pages[i].x;
        posY.value = pages[i].y;
        scale.value = pages[i].scale;
        rotate.value = pages[i].rotate;

        applyPreview(i);
      };
    };
    reader.readAsDataURL(file);
  });
});

/* =========================
   DRAG REORDER
========================= */
new Sortable(preview, {
  animation: 150,
  onEnd: () => {
    const newPages = [];
    [...preview.children].forEach(box => {
      const src = box.querySelector("img").src;
      const page = pages.find(p => p.src === src);
      if (page) newPages.push(page);
    });
    pages = newPages;
    activeIndex = null;
  }
});

/* =========================
   PDF GENERATION (FIXED)
========================= */
function generatePDF() {
  if (!pages.length) {
    alert("Please select images first");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  pages.forEach((p, i) => {
    if (i !== 0) pdf.addPage();

    const pageW = 210;
    const pageH = 297;

    const imgW = (pageW * p.scale) / 100;
    const imgH = (pageH * p.scale) / 100;

    const centerX = pageW / 2 + p.x;
    const centerY = pageH / 2 + p.y;

    pdf.saveGraphicsState();
    pdf.translate(centerX, centerY);
    pdf.rotate(p.rotate);
    pdf.addImage(
      p.src,
      "JPEG",
      -imgW / 2,
      -imgH / 2,
      imgW,
      imgH
    );
    pdf.restoreGraphicsState();
  });

  pdf.save("obito-image-to-pdf.pdf");
        }
