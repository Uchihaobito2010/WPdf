function updateBadges() {
  [...preview.children].forEach((box, i) => {
    const badge = box.querySelector(".badge");
    if (badge) badge.textContent = i + 1;
  });
}
const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const createBtn = document.getElementById("createBtn");
const pdfNameInput = document.getElementById("pdfName");

const posX = document.getElementById("posX");
const posY = document.getElementById("posY");
const scale = document.getElementById("scale");
const rotate = document.getElementById("rotate");

let pages = [];
let activeIndex = null;

/* ---------- live preview ---------- */
function applyPreview(i) {
  const box = preview.children[i];
  if (!box) return;

  const img = box.querySelector("img");
  const p = pages[i];

  img.style.transform = `
    translate(${p.x}px, ${p.y}px)
    scale(${p.scale / 100})
    rotate(${p.rotate}deg)
  `;
}

[posX, posY, scale, rotate].forEach(el => {
  el.addEventListener("input", () => {
    if (activeIndex === null) return;

    Object.assign(pages[activeIndex], {
      x: +posX.value,
      y: +posY.value,
      scale: +scale.value,
      rotate: +rotate.value
    });

    applyPreview(activeIndex);
  });
});

/* ---------- load images ---------- */
input.addEventListener("change", () => {
  preview.innerHTML = "";
  pages = [];
  activeIndex = null;

  [...input.files].forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = e => {
      pages.push({ src: e.target.result, x: 0, y: 0, scale: 100, rotate: 0 });

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
        document.querySelectorAll(".image-box").forEach(b => b.classList.remove("active"));
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

/* ---------- reorder ---------- */
new Sortable(preview, {
  animation: 150,
  onEnd: () => {
    pages = [...preview.children].map(b => {
      const src = b.querySelector("img").src;
      return pages.find(p => p.src === src);
    });
    activeIndex = null;
  }
});

/* ---------- generate pdf ---------- */
createBtn.onclick = () => {
  if (!pages.length) return alert("Select images first");

  const name = (pdfNameInput.value || "image-to-pdf").replace(/\.pdf$/i, "");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  pages.forEach((p, i) => {
    if (i) pdf.addPage();

    const w = (210 * p.scale) / 100;
    const h = (297 * p.scale) / 100;
    const rad = (p.rotate * Math.PI) / 180;

    pdf.saveGraphicsState();
    pdf.translate(105 + p.x, 148 + p.y);
    pdf.rotate(rad);
    pdf.addImage(p.src, "JPEG", -w / 2, -h / 2, w, h);
    pdf.restoreGraphicsState();
  });

  pdf.save(`${name}.pdf`);
};
