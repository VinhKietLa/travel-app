import React, { useState, useEffect } from "react";

const DraggableLegend = ({ children }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 627, y: 29 });
  const [hasMoved, setHasMoved] = useState(false); // Flag to track if dragging occurred
  const [isLoaded, setIsLoaded] = useState(false); // New state to track if position is loaded

  // Fetch the saved position from the backend when the component mounts
  useEffect(() => {
    fetch("http://localhost:3000/legend_position")
      .then((res) => res.json())
      .then((data) => {
        setPosition({ x: data.x, y: data.y });
        setIsLoaded(true); // Still allow rendering even if there's an error
      })
      .catch((error) => {
        console.error("Error fetching legend position:", error);
        setIsLoaded(true); // Still allow rendering even if there's an error
      });
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setHasMoved(false); // Reset the movement flag when dragging starts
    // Calculate the initial offset when the mouse is clicked
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    setHasMoved(true); // Mark as moved
    // Update the position dynamically as the mouse moves
    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Save position to backend only after dragging stops and only if the position has changed
  useEffect(() => {
    if (!isDragging && hasMoved) {
      fetch("http://localhost:3000/legend_position", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          legend_position: {
            x: position.x,
            y: position.y,
          },
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Position saved:", data);
        })
        .catch((error) =>
          console.error("Error saving legend position:", error)
        );
    }
  }, [isDragging, hasMoved, position]);

  // Attach the mousemove and mouseup listeners to the document to handle dragging smoothly
  useEffect(() => {
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

  if (!isLoaded) {
    return null; // Don't render anything until position is loaded
  }
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
