"use client";

import React from "react";

export function NeuralFlowSVG() {
    return (
        <div className="neural-flow-container" aria-hidden="true">
            <svg
                viewBox="0 0 1000 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="neural-svg"
            >
                <defs>
                    <linearGradient id="line-grad" x1="0%" y1="50%" x2="100%" y2="50%">
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
                        <stop offset="40%" stopColor="rgba(59, 130, 246, 0.4)" />
                        <stop offset="100%" stopColor="rgba(147, 197, 253, 0.8)" />
                    </linearGradient>

                    <linearGradient id="node-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                    </linearGradient>

                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* --- Flowing Waves (Left to Center) --- */}
                <g stroke="url(#line-grad)" strokeWidth="1.5" fill="none" className="flowing-waves">
                    <path d="M 50,200 C 200,100 300,300 500,200" className="wave w1" />
                    <path d="M 50,220 C 250,150 250,280 480,230" className="wave w2" />
                    <path d="M 50,180 C 180,250 350,120 520,170" className="wave w3" />
                    <path d="M 50,240 C 220,320 320,150 490,260" className="wave w4" />
                    <path d="M 50,160 C 260,80 280,320 510,140" className="wave w5" />
                    <path d="M 50,210 C 210,180 290,220 500,200" className="wave w6" />
                </g>

                {/* --- Neural Network Connections (Center to Right) --- */}
                <g stroke="rgba(147, 197, 253, 0.3)" strokeWidth="1" className="network-lines">
                    {/* Layer 1 to Layer 2 */}
                    <line x1="500" y1="200" x2="650" y2="120" />
                    <line x1="500" y1="200" x2="620" y2="210" />
                    <line x1="500" y1="200" x2="640" y2="280" />

                    <line x1="480" y1="230" x2="620" y2="210" />
                    <line x1="480" y1="230" x2="640" y2="280" />
                    <line x1="480" y1="230" x2="600" y2="340" />

                    <line x1="520" y1="170" x2="650" y2="120" />
                    <line x1="520" y1="170" x2="680" y2="80" />

                    {/* Layer 2 to Layer 3 */}
                    <line x1="650" y1="120" x2="800" y2="90" />
                    <line x1="650" y1="120" x2="780" y2="190" />

                    <line x1="620" y1="210" x2="780" y2="190" />
                    <line x1="620" y1="210" x2="820" y2="260" />

                    <line x1="640" y1="280" x2="780" y2="190" />
                    <line x1="640" y1="280" x2="820" y2="260" />
                    <line x1="640" y1="280" x2="790" y2="350" />

                    <line x1="600" y1="340" x2="820" y2="260" />
                    <line x1="600" y1="340" x2="790" y2="350" />

                    <line x1="680" y1="80" x2="800" y2="90" />
                    <line x1="680" y1="80" x2="850" y2="130" />

                    {/* Layer 3 to Outer */}
                    <line x1="800" y1="90" x2="950" y2="70" />
                    <line x1="800" y1="90" x2="920" y2="150" />

                    <line x1="780" y1="190" x2="920" y2="150" />
                    <line x1="780" y1="190" x2="960" y2="230" />

                    <line x1="820" y1="260" x2="960" y2="230" />
                    <line x1="820" y1="260" x2="930" y2="320" />

                    <line x1="790" y1="350" x2="930" y2="320" />
                    <line x1="790" y1="350" x2="900" y2="390" />

                    <line x1="850" y1="130" x2="950" y2="70" />
                    <line x1="850" y1="130" x2="980" y2="160" />
                </g>

                {/* --- Neural Nodes (Glowing Dots) --- */}
                <g fill="url(#node-grad)" filter="url(#glow)" className="network-nodes">
                    {/* Transition points */}
                    <circle cx="500" cy="200" r="4" />
                    <circle cx="480" cy="230" r="3" />
                    <circle cx="520" cy="170" r="3" />
                    <circle cx="490" cy="260" r="2.5" />
                    <circle cx="510" cy="140" r="2.5" />

                    {/* Layer 2 */}
                    <circle cx="650" cy="120" r="5" className="pulse-node n1" />
                    <circle cx="620" cy="210" r="6" className="pulse-node n2" />
                    <circle cx="640" cy="280" r="5" className="pulse-node n3" />
                    <circle cx="600" cy="340" r="4" />
                    <circle cx="680" cy="80" r="3" />

                    {/* Layer 3 */}
                    <circle cx="800" cy="90" r="6" className="pulse-node n4" />
                    <circle cx="780" cy="190" r="7" className="pulse-node n5" />
                    <circle cx="820" cy="260" r="6" className="pulse-node n6" />
                    <circle cx="790" cy="350" r="5" className="pulse-node n7" />
                    <circle cx="850" cy="130" r="4" />

                    {/* Layer 4 Outer */}
                    <circle cx="950" cy="70" r="4" />
                    <circle cx="920" cy="150" r="5" />
                    <circle cx="960" cy="230" r="5" className="pulse-node n8" />
                    <circle cx="930" cy="320" r="4" />
                    <circle cx="980" cy="160" r="3" />
                    <circle cx="900" cy="390" r="3" />
                </g>
            </svg>
        </div>
    );
}
