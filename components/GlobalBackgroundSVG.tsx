"use client";

import { useEffect, useRef } from "react";

export function GlobalBackgroundSVG() {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        // Generate dynamic connections after mount to avoid hydration mismatch
        if (!svgRef.current) return;

        const svg = svgRef.current;
        if (svg.querySelector(".dynamic-layer")) return; // Prevent recreation

        const dynamicLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
        dynamicLayer.setAttribute("class", "dynamic-layer");

        // Helper: Create random points
        const createPoints = (numPoints: number, width: number, height: number, centerY: number, spread: number) => {
            return Array.from({ length: numPoints }, () => ({
                x: Math.random() * width,
                y: centerY + (Math.random() * 2 - 1) * spread,
            }));
        };

        const points = createPoints(30, 2000, 1000, 500, 400);

        // Create Neural Connections
        points.forEach((p1, i) => {
            // Connect to 2-3 nearby points
            for (let j = i + 1; j < Math.min(i + 4, points.length); j++) {
                const p2 = points[j];
                if (Math.abs(p1.x - p2.x) < 400 && Math.abs(p1.y - p2.y) < 300) {
                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    line.setAttribute("x1", p1.x.toString());
                    line.setAttribute("y1", p1.y.toString());
                    line.setAttribute("x2", p2.x.toString());
                    line.setAttribute("y2", p2.y.toString());
                    line.setAttribute("stroke", "rgba(255, 255, 255, 0.4)");
                    line.setAttribute("stroke-width", "1");
                    line.setAttribute("stroke-dasharray", `${Math.random() * 20 + 10} ${Math.random() * 30 + 10}`);
                    line.setAttribute("class", "neural-pulse");
                    line.style.animationDelay = `${Math.random() * 5}s`;
                    line.style.animationDuration = `${Math.random() * 10 + 10}s`;
                    dynamicLayer.appendChild(line);
                }
            }

            // Create Nodes
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", p1.x.toString());
            circle.setAttribute("cy", p1.y.toString());
            circle.setAttribute("r", (Math.random() * 3 + 1).toString());
            circle.setAttribute("fill", "rgba(255, 255, 255, 0.8)");
            circle.setAttribute("class", "neural-node");
            circle.style.animationDelay = `${Math.random() * 4}s`;
            dynamicLayer.appendChild(circle);
        });

        // Create Soundwave Paths (Digital Frequency)
        const createWave = (baseY: number, amplitude: number, opacity: number, speed: number, delay: number) => {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            let d = `M 0 ${baseY} `;
            for (let x = 0; x <= 2000; x += 100) {
                const yOffset = (Math.random() * 2 - 1) * amplitude;
                d += `Q ${x + 50} ${baseY + yOffset * 1.5}, ${x + 100} ${baseY + yOffset} `;
            }
            path.setAttribute("d", d);
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", `rgba(255, 255, 255, ${opacity})`);
            path.setAttribute("stroke-width", "2");
            path.setAttribute("class", "sound-wave");
            path.style.animationDuration = `${speed}s`;
            path.style.animationDelay = `${delay}s`;
            return path;
        };

        dynamicLayer.appendChild(createWave(300, 50, 0.3, 15, 0));
        dynamicLayer.appendChild(createWave(700, 80, 0.2, 20, -5));
        dynamicLayer.appendChild(createWave(500, 120, 0.15, 25, -10));

        svg.insertBefore(dynamicLayer, svg.firstChild);
    }, []);

    return (
        <div className="global-bg-container">
            <svg
                ref={svgRef}
                className="global-bg-svg"
                viewBox="0 0 2000 1000"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>
                </defs>

                {/* Static Ambient Glow */}
                <circle cx="500" cy="300" r="400" fill="url(#nodeGlow)" opacity="0.15" className="ambient-glow" />
                <circle cx="1500" cy="700" r="500" fill="url(#nodeGlow)" opacity="0.1" className="ambient-glow delay-1" />
                <circle cx="1000" cy="500" r="600" fill="url(#nodeGlow)" opacity="0.08" className="ambient-glow delay-2" />

            </svg>
        </div>
    );
}
