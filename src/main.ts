const app = document.querySelector<HTMLElement>("#app")!;
app.style.textAlign = "center";

const heading = document.createElement("h1");
heading.textContent = "D2 project";

const message = document.createElement("p");
message.textContent = "Draw below ⬇️";

const canvas = document.createElement("canvas");
canvas.width = 500;
canvas.height = 500;
canvas.style.border = "1px solid black";

const cursor = { isDrawing: false, x: 0, y: 0 };

const ctx = canvas.getContext("2d");

// ============ Canvas Event Listeners =========
canvas.addEventListener("pointerdown", (event) => {
  cursor.isDrawing = true;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
});

canvas.addEventListener("pointermove", (event) => {
  if (cursor.isDrawing === true && ctx != null) {
    ctx.beginPath();
    ctx.moveTo(cursor.x, cursor.y);
    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;
  }
});

canvas.addEventListener("pointerup", () => {
  cursor.isDrawing = false;
});

canvas.addEventListener("pointerleave", () => {
  cursor.isDrawing = false;
});

app.append(heading, message, canvas);
