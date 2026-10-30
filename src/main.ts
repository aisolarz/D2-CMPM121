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

// declare the button rows at the top to append later at the bottom
const buttonRow = document.createElement("div");
const toolRow = document.createElement("div");

// ============= Buttons ==========================
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.type = "button";

const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.type = "button";

const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.type = "button";

const exportButton = document.createElement("button");
exportButton.textContent = "Export";
exportButton.type = "button";

//step 2: document data
type Point = { x: number; y: number };
type Stroke = { points: Point[]; lineWidth: number };

// ===================== Sticker ======================
type StickerTool = { name: string; emoji: string };
type StickerPosition = { x: number; y: number };
const stickerTools: StickerTool[] = [
  { name: "Love", emoji: "😍" },
  { name: "Laugh", emoji: "😹" },
  { name: "Awkward", emoji: "🫥" },
];

// ====================== Buttons for Creating a Custom Button ===================================
const userInput = document.createElement("input"); // where user can input text for custom sticker
userInput.type = "text";
userInput.placeholder = "Custom sticker here...";

const customButton = document.createElement("button"); // button to click to make the new sticker
customButton.type = "button";
customButton.textContent = "Create a Sticker!";

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
function makeStickerCommand(x: number, y: number, emoji: string): DrawCommand {
  return {
    display(ctx) {
      ctx.font = "32px cursive";
      ctx.textAlign = "center"; // these two lines make it so that the sticker is in the middle of the click
      ctx.textBaseline = "middle"; // ^^^^
      ctx.fillText(emoji, x, y);
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

let selectedTool: MarkerTool | StickerTool = markerTools[0]; // tool can be marker or sticker
const toolButtons: HTMLButtonElement[] = [];

//toolsForButtons[i] is the tool that toolButtons[i] selects
const toolsForButtons: (MarkerTool | StickerTool)[] = [];

//one function that builds a button for ANY tool
function addToolButton(
  tool: MarkerTool | StickerTool,
  label: string,
): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", () => {
    selectedTool = tool; //only changed the selection. not doc or history
    updateToolButtons();
  });
  toolButtons.push(button);
  toolsForButtons.push(tool);
  return button;
}

//make the selecte tools buttons BOLDD
function updateToolButtons() {
  for (let i = 0; i < toolButtons.length; i++) {
    if (toolsForButtons[i] === selectedTool) { // is this buttons tool the selected one
      toolButtons[i].style.fontWeight = "bold";
    } else {
      toolButtons[i].style.fontWeight = "normal";
    }
  }
}

function refreshToolbar() {
  toolRow.innerHTML = ""; // clear the tool row
  toolButtons.length = 0;
  toolsForButtons.length = 0;
  for (const marker of markerTools) { // adds the tool buttons to the row
    toolRow.append(addToolButton(marker, marker.name));
  }
  for (const sticker of stickerTools) { // adds sticker buttons to the row
    toolRow.append(addToolButton(sticker, sticker.emoji + sticker.name));
  }
  toolRow.append(userInput, customButton); // adds the custom sticker stuff
  updateToolButtons(); // takes care of button bolding
}
refreshToolbar(); // sets up the tool bar

function redraw(target: CanvasRenderingContext2D) { // now can be used on any ctx instead of just the canvas (needed for step 8)
  if (target !== null) { // makes sure ctx loaded
    target.clearRect(0, 0, canvas.width, canvas.height); // clears the canvas for a clean slate
    // Holds the other lines
    for (const command of strokes) {
      command.display(target);
    }
    // current line
    if (currentStroke !== null) { // if there is a drawing occuring
      target.beginPath(); // start the path and set the thickness
      target.lineWidth = currentStroke.lineWidth;
      target.moveTo(currentStroke.points[0].x, currentStroke.points[0].y);
      for (let i = 1; i < currentStroke.points.length; i++) { // path for the pen
        target.lineTo(currentStroke.points[i].x, currentStroke.points[i].y);
      }
      target.stroke(); // draws the line
    }
  }
  // controls when buttons should be disabled
  undoButton.disabled = strokes.length === 0;
  redoButton.disabled = redoStrokes.length === 0;
  clearButton.disabled = strokes.length === 0;
}
// ============ Canvas Event Listeners =========
canvas.addEventListener("pointerdown", (event) => {
  if ("lineWidth" in selectedTool) {
    currentStroke = {
      points: [{ x: event.offsetX, y: event.offsetY }],
      lineWidth: selectedTool.lineWidth,
    };
  } else {
    const sticker = makeStickerCommand(
      event.offsetX,
      event.offsetY,
      selectedTool.emoji,
    );
    strokes.push(sticker);
    redoStrokes.length = 0;
  }

  redraw(ctx!);
});

canvas.addEventListener("pointermove", (event) => {
  if (currentStroke != null) {
    currentStroke.points.push({ x: event.offsetX, y: event.offsetY });
    redraw(ctx!);
  }
});

canvas.addEventListener("pointerup", () => {
  finishStroke();
  redraw(ctx!);
});

canvas.addEventListener("pointerleave", () => {
  finishStroke();
  redraw(ctx!);
});

canvas.addEventListener("pointercancel", () => {
  cancelStroke();
  redraw(ctx!);
});
// ============== Button Event Listeners ====================
undoButton.addEventListener("click", () => {
  if (strokes.length > 0) { // if there are stokes to undo
    const poppedStroke = strokes.pop();
    if (poppedStroke !== undefined) {
      redoStrokes.push(poppedStroke); // add them to the strokes we could potentially redo later
      redraw(ctx!);
    }
  }
});
redoButton.addEventListener("click", () => {
  if (redoStrokes.length > 0) { // if we have strokes to redo
    const poppedRedo = redoStrokes.pop();
    if (poppedRedo !== undefined) {
      strokes.push(poppedRedo); // add it to the strokes (put it back on the page)
      redraw(ctx!);
    }
  }
});

customButton.addEventListener("click", () => {
  const text = userInput.value.trim(); // trim() removes spaces, so "   " counts as empty
  if (text.length === 0) { // make sure the user puts something in
    alert("Enter a valid character or word!");
    return; // nothing is added, so no broken tool and no history change
  }
  const newSticker: StickerTool = { name: "", emoji: text };
  stickerTools.push(newSticker);

  // the same function the preset buttons use

  selectedTool = newSticker;
  refreshToolbar();
  userInput.value = ""; // clear the box so they can make another one
});

clearButton.addEventListener("click", () => {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
  strokes.length = 0;
  redoStrokes.length = 0;
  redraw(ctx!);
});

exportButton.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas"); // offscreen canvas that will be exported
  exportCanvas.width = canvas.width * 2; // make the canvas twice the size as the original
  exportCanvas.height = canvas.height * 2;
  const exportCtx = exportCanvas.getContext("2d");
  exportCtx?.scale(2, 2); // matches the coordinates on the new canvas
  redraw(exportCtx!);
  exportCanvas.toBlob((blob) => { // handles download
    if (blob !== null) {
      const newImg = document.createElement("a");
      const url = URL.createObjectURL(blob);
      newImg.href = url;
      newImg.download = "my-drawing.png";
      newImg.click();
    }
  });
});

//step 3: redraw button
const redrawButton = document.createElement("button");
redrawButton.textContent = "Redraw";
redrawButton.type = "button";
redrawButton.addEventListener("click", () => {
  //has to clear the pixels not the strokes
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
  redraw(ctx!);
});

// Row for undo, redo, redraw
buttonRow.append(
  undoButton,
  redoButton,
  clearButton,
  redrawButton,
  exportButton,
);

// Row for tools and custom button
toolRow.append(...toolButtons, userInput, customButton);

app.append(
  heading,
  message,
  canvas,
  buttonRow,
  toolRow,
);

redraw(ctx!); //the starting state of the undo and redo button
