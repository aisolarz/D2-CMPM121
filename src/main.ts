const app = document.querySelector<HTMLElement>("#app")!;
app.style.textAlign = "center";

const heading = document.createElement("h1");
heading.textContent = "D2 project";

const message = document.createElement("p");
message.textContent = "Draw below ⬇️";

const canvas = document.createElement("canvas");
canvas.width = 400;
canvas.height = 400;
canvas.style.border = "1px solid black";

const ctx = canvas.getContext("2d");

// ============= Buttons ==========================
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.type = "button";

const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.type = "button";
// ============ Canvas Event Listeners =========
//step 2: document data
type Point = { x: number; y: number };
type Stroke = { points: Point[]; lineWidth: number };

//all of the finishes strokes in order they were drawn
const strokes: Stroke[] = [];
const redoStrokes: Stroke[] = [];
//current stroke (duh) but its null when nothing is being drawn
let currentStroke: Stroke | null = null;

function finishStroke() {
  //only keeps the strokes that have min 2 points
  if (currentStroke != null && currentStroke.points.length >= 2) {
    strokes.push(currentStroke);
    redoStrokes.length = 0;
  }
  currentStroke = null;
}

function cancelStroke() {
  currentStroke = null;
}

function redraw() {
  if (ctx !== null) { // makes sure ctx loaded
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clears the canvas for a clean slate
    // Holds the other lines
    for (const stroke of strokes) { // for each stroke
      ctx.beginPath(); // start the path and set the thickness
      ctx.lineWidth = stroke.lineWidth;
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) { // where the line will be drawn
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke(); // draws the line
    }
    // current line
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
  undoButton.disabled = strokes.length === 0;
  redoButton.disabled = redoStrokes.length === 0;
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
undoButton.addEventListener("click", () => {
  if (strokes.length > 0) { // if there are stokes to undo
    const poppedStroke = strokes.pop();
    if (poppedStroke !== undefined) {
      redoStrokes.push(poppedStroke); // add them to the strokes we could potentially redo later
      redraw();
    }
  }
});
redoButton.addEventListener("click", () => {
  if (redoStrokes.length > 0) { // if we have strokes to redo
    const poppedRedo = redoStrokes.pop();
    if (poppedRedo !== undefined) {
      strokes.push(poppedRedo); // add it to the strokes (put it back on the page)
      redraw();
    }
  }
});

//step 3: redraw button
const redrawButton = document.createElement("button");
redrawButton.textContent = "Redraw";
redrawButton.type = "button";
redrawButton.addEventListener("click", () => {
  //has to clear the pixels not the strokes
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
  redraw();
});

app.append(heading, message, canvas, undoButton, redoButton, redrawButton);

redraw(); //the starting state of the undo and redo button
