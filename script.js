const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");

let images = [];
let selectedBox = null;

// sliders
const posX = document.getElementById("posX");
const posY = document.getElementById("posY");
const scale = document.getElementById("scale");
const rotate = document.getElementById("rotate");

function applyLiveTransform(box) {
  if (!box) return;

  const img = box.querySelector("img");

  img.style.transform = `
    translate(${posX.value}px, ${posY.value}px)
    scale(${scale.value / 100})
    rotate(${rotate.value}deg)
  `;
}

[posX, posY, scale, rotate].forEach(el => {
  el.addEventListener("input", () => applyLiveTransform(selectedBox));
});

input.addEventListener("change", () => {
  preview.innerHTML = "";
  images = [];
  selectedBox = null;

  [...input.files].forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = e => {
      const box = document.createElement("div");
      box.className = "image-box";

      const img = document.createElement("img");
      img.src = e.target.result;

      box.appendChild(img);
      preview.appendChild(box);
      images.push(e.target.result);

      box.onclick = () => {
        document
          .querySelectorAll(".image-box")
          .forEach(b => b.classList.remove("active"));

        box.classList.add("active");
        selectedBox = box;
        applyLiveTransform(box);
      };
    };
    reader.readAsDataURL(file);
  });
});
