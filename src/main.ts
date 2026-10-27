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

canvas.addEventListener("pointercancel", () => {
  cursor.isDrawing = false;
});

//step 2: document data
type Point = { x: number; y: number };
type Stroke = { points: Point[]; lineWidth: number };

//all of the finishes strokes in order they were drawn
const strokes: Stroke[] = [];
//current stroke (duh) but its null when nothing is being drawn
let currentStroke: Stroke | null = null;

function finishStroke() {
  //only keeps the strokes that have min 2 points
  if (currentStroke != null && currentStroke.points.length >= 2) {
    strokes.push(currentStroke);
  }
  currentStroke = null;
}

function cancelStroke() {
  currentStroke = null;
}

canvas.addEventListener("pointerdown", (event) => {
  currentStroke = {
    points: [{ x: event.offsetX, y: event.offsetY }],
    lineWidth: 1,
  };
});

canvas.addEventListener("pointermove", (event) => {
  if (currentStroke != null) {
    currentStroke.points.push({ x: event.offsetX, y: event.offsetY });
  }
});

canvas.addEventListener("pointerup", () => {
  finishStroke();
});

canvas.addEventListener("pointerleave", () => {
  finishStroke();
});

canvas.addEventListener("pointercancel", () => {
  cancelStroke();
});

app.append(heading, message, canvas);
