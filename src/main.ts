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

//the drawing command is anything that knows how to draw itself onto a canvas
type DrawCommand = {
  display(ctx: CanvasRenderingContext2D): void;
};

//wraps a finished stroke so it can draw itself
function makeStrokeCommand(stroke: Stroke): DrawCommand {
  return {
    display(ctx) {
      ctx.save(); //keeps stroke setting leaking into other commands
      ctx.beginPath();
      ctx.lineWidth = stroke.lineWidth;
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    },
  };
}

//all of the finishes strokes in order they were drawn
const strokes: DrawCommand[] = [];
const redoStrokes: DrawCommand[] = [];
//current stroke (duh) but its null when nothing is being drawn
let currentStroke: Stroke | null = null;

function finishStroke() {
  //only keeps the strokes that have min 2 points
  if (currentStroke != null && currentStroke.points.length >= 2) {
    strokes.push(makeStrokeCommand(currentStroke));
    redoStrokes.length = 0;
  }
  currentStroke = null;
}

function cancelStroke() {
  currentStroke = null;
}

//step 5: marker tool
type MarkerTool = { name: string; lineWidth: number };

const markerTools: MarkerTool[] = [
  { name: "Thin", lineWidth: 1 },
  { name: "Thick", lineWidth: 6 },
];

let selectedTool: MarkerTool = markerTools[0];
const toolButtons: HTMLButtonElement[] = [];

//make the selecte tools buttons BOLDD
function updateToolButtons() {
  for (let i = 0; i < markerTools.length; i++) {
    if (markerTools[i] === selectedTool) {
      toolButtons[i].style.fontWeight = "bold";
    } else {
      toolButtons[i].style.fontWeight = "normal";
    }
  }
}

//buillds a button for every tool in the list
for (const tool of markerTools) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = tool.name;
  button.addEventListener("click", () => {
    selectedTool = tool; //only changes what it selects and not the history/document
    updateToolButtons();
  });
  toolButtons.push(button);
}
updateToolButtons();

function redraw() {
  if (ctx !== null) { // makes sure ctx loaded
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clears the canvas for a clean slate
    // Holds the other lines
    for (const command of strokes) {
      command.display(ctx);
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
    lineWidth: selectedTool.lineWidth,
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

app.append(
  heading,
  message,
  canvas,
  undoButton,
  redoButton,
  redrawButton,
  ...toolButtons,
);

redraw(); //the starting state of the undo and redo button
