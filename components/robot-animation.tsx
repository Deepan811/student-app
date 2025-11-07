
"use client"

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

export function RobotAnimation() {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("/butterfly.json")
      .then((response) => response.json())
      .then((data) => setAnimationData(data));
  }, []);

  if (!animationData) return null;

  return (
    <div className="flex justify-center items-center">
      <Lottie animationData={animationData} />
    </div>
  );
}
