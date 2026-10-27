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

const ctx = canvas.getContext("2d");

// ============ Canvas Event Listeners =========
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

function redraw() {
  if (ctx !== null) { // makes sure ctx loaded
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clears the canvas for a clean slate
    for (const stroke of strokes) { // for each stroke
      ctx.beginPath(); // start the path and set the thickness
      ctx.lineWidth = stroke.lineWidth;
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) { // where the line will be drawn
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke(); // draws the line
    }
    if (currentStroke !== null) { // if there is a drawing occuring
      ctx.beginPath(); // start the path and set the thickness
      ctx.lineWidth = currentStroke.lineWidth;
      ctx.moveTo(currentStroke.points[0].x, currentStroke.points[0].y);
      for (let i = 1; i < currentStroke.points.length; i++) { // path for the pen
        ctx.lineTo(currentStroke.points[i].x, currentStroke.points[i].y);
      }
      ctx.stroke(); // draws the line
    }
  }
}
canvas.addEventListener("pointerdown", (event) => {
  currentStroke = {
    points: [{ x: event.offsetX, y: event.offsetY }],
    lineWidth: 1,
  };
  redraw();
});

canvas.addEventListener("pointermove", (event) => {
  if (currentStroke != null) {
    currentStroke.points.push({ x: event.offsetX, y: event.offsetY });
    redraw();
  }
});

canvas.addEventListener("pointerup", () => {
  finishStroke();
  redraw();
});

canvas.addEventListener("pointerleave", () => {
  finishStroke();
  redraw();
});

canvas.addEventListener("pointercancel", () => {
  cancelStroke();
  redraw();
});

app.append(heading, message, canvas);
