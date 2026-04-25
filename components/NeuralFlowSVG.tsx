"use client";

import React, { useEffect, useState } from "react";

const useReducedMotion = () => {
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updatePreference = () => setReducedMotion(mediaQuery.matches);

        updatePreference();
        mediaQuery.addEventListener("change", updatePreference);
        return () => mediaQuery.removeEventListener("change", updatePreference);
    }, []);

    return reducedMotion;
};

export function NeuralFlowSVG() {
    const reducedMotion = useReducedMotion();
    const waveClassName = reducedMotion ? undefined : "wave";
    const pulseClassName = (node: string) => (reducedMotion ? undefined : `pulse-node ${node}`);

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
                        <stop offset="0%" stopColor="rgba(69, 60, 52, 0)" />
                        <stop offset="42%" stopColor="rgba(176, 138, 82, 0.35)" />
                        <stop offset="100%" stopColor="rgba(210, 196, 185, 0.62)" />
                    </linearGradient>

                    <linearGradient id="node-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d2c4b9" stopOpacity="0.72" />
                        <stop offset="55%" stopColor="#b08a52" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#675d53" stopOpacity="0.68" />
                    </linearGradient>

                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1.6" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* --- Flowing Waves (Left to Center) --- */}
                <g stroke="url(#line-grad)" strokeWidth="1.5" fill="none" className="flowing-waves">
                    <path d="M 50,200 C 200,100 300,300 500,200" className={waveClassName ? `${waveClassName} w1` : undefined} />
                    <path d="M 50,220 C 250,150 250,280 480,230" className={waveClassName ? `${waveClassName} w2` : undefined} />
                    <path d="M 50,180 C 180,250 350,120 520,170" className={waveClassName ? `${waveClassName} w3` : undefined} />
                    <path d="M 50,240 C 220,320 320,150 490,260" className={waveClassName ? `${waveClassName} w4` : undefined} />
                    <path d="M 50,160 C 260,80 280,320 510,140" className={waveClassName ? `${waveClassName} w5` : undefined} />
                    <path d="M 50,210 C 210,180 290,220 500,200" className={waveClassName ? `${waveClassName} w6` : undefined} />
                </g>

                {/* --- Neural Network Connections (Center to Right) --- */}
                <g stroke="rgba(103, 93, 83, 0.24)" strokeWidth="1" className="network-lines">
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
                    <circle cx="650" cy="120" r="5" className={pulseClassName("n1")} />
                    <circle cx="620" cy="210" r="6" className={pulseClassName("n2")} />
                    <circle cx="640" cy="280" r="5" className={pulseClassName("n3")} />
                    <circle cx="600" cy="340" r="4" />
                    <circle cx="680" cy="80" r="3" />

                    {/* Layer 3 */}
                    <circle cx="800" cy="90" r="6" className={pulseClassName("n4")} />
                    <circle cx="780" cy="190" r="7" className={pulseClassName("n5")} />
                    <circle cx="820" cy="260" r="6" className={pulseClassName("n6")} />
                    <circle cx="790" cy="350" r="5" className={pulseClassName("n7")} />
                    <circle cx="850" cy="130" r="4" />

                    {/* Layer 4 Outer */}
                    <circle cx="950" cy="70" r="4" />
                    <circle cx="920" cy="150" r="5" />
                    <circle cx="960" cy="230" r="5" className={pulseClassName("n8")} />
                    <circle cx="930" cy="320" r="4" />
                    <circle cx="980" cy="160" r="3" />
                    <circle cx="900" cy="390" r="3" />
                </g>
            </svg>
        </div>
    );
}
