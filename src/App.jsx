import { TbRectangle } from "react-icons/tb";
import { FaRegCircle } from "react-icons/fa";
import { FaArrowRightLong } from "react-icons/fa6";
import { LuPencil } from "react-icons/lu";
import { PiNavigationArrowFill } from "react-icons/pi";
import { HiOutlineDownload } from "react-icons/hi";
import { Arrow, Circle, Layer, Line, Rect, Stage, Transformer } from "react-konva";
import { useRef, useState } from "react";
import { ACTIONS } from "./constants";
import { v4 as uuidv4 } from 'uuid'
function App() {
  const stageRef = useRef();
  const [action, setAction] = useState(ACTIONS.SELECT);
  const [fillColor, setFillColor] = useState("#ff0000");
  const [rectangles, setRectangles] = useState([])
  const [circles, setCircles] = useState([])
  const [arrows, setArrows] = useState([])
  const [scribbles, setScribbles] = useState([])




  const strokeColor = "#000"
  const isPainting = useRef()
  const currentShapeId = useRef()
  const isDraggable = action === ACTIONS.SELECT;
  const transformerRef = useRef()


  function handleTransform(e) {
    if (action !== ACTIONS.SELECT) return;
  
    const target = e.target;
  
    // Check if the clicked target is a shape
    if (
      target.getClassName() !== "Rect" &&
      target.getClassName() !== "Circle" &&
      target.getClassName() !== "Arrow" &&
      target.getClassName() !== "Line"
    ) {
      // Clear transformer nodes to deactivate it
      transformerRef.current.nodes([]);
      return;
    }
  
    transformerRef.current.nodes([target]);
  }
  

  function onPointerDown() {
    if (action === ACTIONS.SELECT) return;

    const stage = stageRef.current
    const { x, y } = stage.getPointerPosition()
    const id = uuidv4();

    currentShapeId.current = id;
    isPainting.current = true

    switch (action) {
      case ACTIONS.RECTANGLE:
        setRectangles((rectangles) => [...rectangles, {
          id,
          x,
          y,
          height: 20,
          width: 20,
          fillColor,
        }])
        break;
      case ACTIONS.CIRCLE:
        setCircles((circles) =>
          [...circles,
          {
            id,
            x,
            y,
            fillColor,
            radius: 10,
          }])
        break;
      case ACTIONS.ARROW:
        setArrows((arrows) =>
          [...arrows,
          {
            id,
            fillColor,
            points: [x, y, x + 40, y + 40]
          }])
        break;
      case ACTIONS.SCRIBBLE:
        setScribbles((scribbles) =>
          [
            ...scribbles,
            {
              id,
              fillColor: fillColor, // Use the current fillColor state
              points: [x, y]
            }
          ]);
        break;

    }
  }
  function onPointerMove() {
    if (action === ACTIONS.SELECT || !isPainting.current) return;

    const stage = stageRef.current
    const { x, y } = stage.getPointerPosition()
    switch (action) {
      case ACTIONS.RECTANGLE:
        setRectangles((rectangles) => rectangles.map((rectangle) => {
          if (rectangle.id === currentShapeId.current) {
            return {
              ...rectangle,
              width: x - rectangle.x,
              height: y - rectangle.y,

            }
          }
          return rectangle;
        }))
        break;
      case ACTIONS.CIRCLE:
        setCircles((circles) => circles.map((circle) => {
          if (circle.id === currentShapeId.current) {
            return {
              ...circle,
              radius: ((y - circle.y) ** 2 + (x - circle.x) ** 2) ** 0.5

            }
          }
          return circle;
        }))
        break;
      case ACTIONS.ARROW:
        setArrows((arrows) => arrows.map((arrow) => {
          if (arrow.id === currentShapeId.current) {
            return {
              ...arrow,
              points: [arrow.points[0], arrow.points[1], x, y]
            }
          }
          return arrow;
        }))
        break;
      case ACTIONS.SCRIBBLE:
        setScribbles((scribbles) => scribbles.map((scribble) => {
          if (scribble.id === currentShapeId.current) {
            return {
              ...scribble,
              points: [...scribble.points, x, y]
            }
          }
          return scribble;
        }))
        break;

    }



  }

  function onPointerUp() {
    isPainting.current = false
  }

  function handleExport() {
    // Get the canvas element from Konva stage
    const canvas = stageRef.current.getStage().toCanvas();

    // Convert canvas to data URL
    const uri = canvas.toDataURL();

    // Create a temporary link element
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = uri;

    // Simulate click on the link to trigger download
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
  }


  return (
    <>
      <div className="relative w-full h-screen overflow-hidden">
        <div className="absolute top-4 z-20 w-full py-3">
          <div className="flex justify-center items-center gap-4 py-3 px-3 w-fit mx-auto border rounded-lg shadow ">
            <button
              className={
                action === ACTIONS.SELECT
                  ? "bg-violet-300 rounded p-2"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.SELECT)}
              title="Select "
            >
              <PiNavigationArrowFill size={24} />
            </button>

            <button
              className={
                action === ACTIONS.RECTANGLE
                  ? "bg-violet-300 rounded p-2"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.RECTANGLE)}
              title="Rectangle "
            >
              <TbRectangle size={26} />
            </button>

            <button
              className={
                action === ACTIONS.CIRCLE
                  ? "bg-violet-300 rounded p-2"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.CIRCLE)}
              title="Circle "
            >
              <FaRegCircle size={24} />
            </button>

            <button
              className={
                action === ACTIONS.ARROW
                  ? "bg-violet-300 rounded p-2"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.ARROW)}
              title="Arrow "
            >
              <FaArrowRightLong size={24} />
            </button>

            <button
              className={
                action === ACTIONS.SCRIBBLE
                  ? "bg-violet-300 rounded p-2"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.SCRIBBLE)}
              title="Pencil "
            >
              <LuPencil size={24} />
            </button>

            <button title="Choose Color">
              <input
                type="color"
                className="w-6 h-6 p-0"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
              />
            </button>

            <button onClick={handleExport} title="Export">
              <HiOutlineDownload size={24} />
            </button>
          </div>
        </div>
        {/* canvas */}
        <Stage
          ref={stageRef}
          width={window.innerWidth}
          height={window.innerHeight}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <Layer>
            <Rect
              x={0} y={0}
              height={window.innerHeight}
              width={window.innerWidth}
              fill="#ffffff"
              id="bg"
              onClick={() => { transformerRef.current.nodes([]) }}
            />

            {rectangles.map((rectangle) => (
              <Rect key={rectangle.id}
                x={rectangle.x}
                y={rectangle.y}
                stroke={strokeColor}
                skrokeWidth={2}
                fill={rectangle.fillColor}
                height={rectangle.height}
                width={rectangle.width}
                draggable={isDraggable}
                onClick={handleTransform}
              />
            ))}


            {circles.map((circle) => (
              <Circle key={circle.id}
                x={circle.x}
                y={circle.y}
                stroke={strokeColor}
                skrokeWidth={2}
                fill={circle.fillColor}
                radius={circle.radius}
                draggable={isDraggable}
                onClick={handleTransform}

              />
            ))}


            {arrows.map((arrow) => (
              <Arrow key={arrow.id}
                stroke={strokeColor}
                skrokeWidth={2}
                fill={arrow.fillColor}
                points={arrow.points}
                draggable={isDraggable}
                onClick={handleTransform}

              />
            ))}

            {scribbles.map((scribble) => (
              <Line key={scribble.id}
                stroke={scribble.fillColor} // Use fillColor as stroke color
                strokeWidth={3} // Correct the spelling of strokeWidth
                points={scribble.points}
                lineCap="round"
                lineJoin="round"
                draggable={isDraggable}
                onClick={handleTransform}

              />
            ))}


            <Transformer ref={transformerRef} />

          </Layer>
        </Stage>
      </div>
    </>
  );
}

export default App;
