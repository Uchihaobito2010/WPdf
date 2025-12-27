const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");

let images = [];

input.addEventListener("change", () => {
  preview.innerHTML = "";
  images = [];

  [...input.files].forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = e => {
      const box = document.createElement("div");
      box.className = "image-box";

      const img = document.createElement("img");
      img.src = e.target.result;

      const badge = document.createElement("span");
      badge.textContent = i + 1;
      badge.className = "badge";

      box.append(img, badge);
      preview.appendChild(box);

      images.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
});

// drag reorder
new Sortable(preview, {
  animation: 150,
  onEnd: () => {
    images = [...preview.children].map(
      b => b.querySelector("img").src
    );
  }
});

function generatePDF() {
  if (!images.length) {
    alert("No images selected");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const x = Number(document.getElementById("posX").value);
  const y = Number(document.getElementById("posY").value);
  const scale = Number(document.getElementById("scale").value);
  const rotate = Number(document.getElementById("rotate").value);

  images.forEach((src, i) => {
    if (i !== 0) pdf.addPage();

    const img = new Image();
    img.src = src;

    const w = (210 * scale) / 100;
    const h = (297 * scale) / 100;

    if (rotate !== 0) {
      pdf.saveGraphicsState();
      pdf.rotate(rotate, { origin: [105, 148] });
      pdf.addImage(img, "JPEG", 105 - w / 2, 148 - h / 2, w, h);
      pdf.restoreGraphicsState();
    } else {
      pdf.addImage(img, "JPEG", x, y, w, h);
    }
  });

  pdf.save("obito-image-to-pdf.pdf");
}
