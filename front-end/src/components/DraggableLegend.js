import React, { useState } from "react";

const DraggableLegend = ({ children }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    // Calculate the initial offset when the mouse is clicked
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    // Update the position dynamically as the mouse moves
    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Attach the mousemove and mouseup listeners to the document to handle dragging smoothly
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const style = {
    position: "absolute",
    left: `${position.x}px`,
    top: `${position.y}px`,
    cursor: isDragging ? "grabbing" : "grab",
    backgroundColor: "lightgray",
    padding: "10px",
    borderRadius: "5px",
  };

  return (
    <div
      style={style}
      onMouseDown={handleMouseDown} // Start dragging on mousedown
    >
      {children}
    </div>
  );
};

export default DraggableLegend;
