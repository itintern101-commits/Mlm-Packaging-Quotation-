import React, { useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  FaCube,
  FaArrowUp,
  FaArrowCircleRight,
  FaRegEye,
} from "react-icons/fa";

/* Smooth camera animation */
function CameraAnimator({ target }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.lerp(target, 0.12);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* Box edge-only wireframe (NO inner lines) */
function WireBox({ size }) {
  const edges = useMemo(() => {
    const box = new THREE.BoxGeometry(...size);
    return new THREE.EdgesGeometry(box);
  }, [size]);

  return (
    <lineSegments>
      <primitive object={edges} />
      <lineBasicMaterial color="#2563eb" />
    </lineSegments>
  );
}

export default function Bag3DVisualization({ form }) {
  // Dimensions (mm → m)
  const widthMm = Number(form?.width || 150);
  const heightMm = Number(form?.height || 250);
  const gussetMm = Number(form?.gusset || 100);

  const W = widthMm / 1000;
  const H = heightMm / 1000;
  const G = gussetMm / 1000;

  const SCALE = 2.5;

  const [camTarget, setCamTarget] = useState(
    new THREE.Vector3(1.0, 1.2, 1.3)
  );

  // Optional features
  const foilEnabled = form?.foilEnabled === true;
  const foilW = (form?.foilWidth || 50) / 1000;
  const foilH = (form?.foilHeight || 30) / 1000;
  const foilX = (form?.foilOffsetX || 0) / 1000;
  const foilY = (form?.foilOffsetY || 0) / 1000;

  const handlesEnabled = form?.handlesEnabled !== false;
  const handleRadius = W * 0.28;     // bigger loop
  const handleThickness = W * 0.0025; // thinner handle


  // Styles
  const labelStyle = (color) => ({
    color,
    fontWeight: "bold",
    fontSize: "14px",
    background: "rgba(255,255,255,0.85)",
    padding: "2px 6px",
    borderRadius: "4px",
    whiteSpace: "nowrap",
  });

  const buttonStyle = (bg) => ({
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    backgroundColor: bg,
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
  });

  return (
    <div className="w-full bg-white border rounded-xl shadow-md p-2">
      {/* CAMERA BUTTONS */}
      <div className="flex gap-3 mb-3">
        <div
          style={buttonStyle("#374151")}
          onClick={() => setCamTarget(new THREE.Vector3(1, 1.2, 1.3))}
        >
          <FaCube /> 3D
        </div>
        <div
          style={buttonStyle("#1e40af")}
          onClick={() => setCamTarget(new THREE.Vector3(0, 2, 0.01))}
        >
          <FaArrowUp /> Top
        </div>
        <div
          style={buttonStyle("#059669")}
          onClick={() => setCamTarget(new THREE.Vector3(0, 1, 2.3))}
        >
          <FaRegEye /> Front
        </div>
        <div
          style={buttonStyle("#7c3aed")}
          onClick={() => setCamTarget(new THREE.Vector3(2.3, 1, 0))}
        >
          <FaArrowCircleRight /> Side
        </div>
      </div>

      <div className="w-full h-[480px] border rounded-lg overflow-hidden">
        <Canvas camera={{ position: [1, 1.2, 1.3], fov: 42 }}>
          <CameraAnimator target={camTarget} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 4]} intensity={1.2} />

          <group scale={SCALE}>
            {/* BAG BODY */}
            <WireBox size={[W, H, G]} />

            {/* FOIL */}
            {foilEnabled && (
              <mesh position={[foilX, foilY, G / 2 + 0.001]}>
                <planeGeometry args={[foilW, foilH]} />
                <meshBasicMaterial color="#2563eb" wireframe />
              </mesh>
            )}

   
            {/* HANDLES — FRONT & BACK */}
            {handlesEnabled && (
              <>
                {/* FRONT HANDLE */}
                <mesh position={[0, H / 2 + handleThickness * 2, G / 2 + 0.002]}>
                  <torusGeometry
                    args={[handleRadius, handleThickness, 16, 60, Math.PI]}
                  />
                  <meshBasicMaterial color="#2563eb" wireframe />
                </mesh>

                {/* BACK HANDLE */}
                <mesh
                  position={[0, H / 2 + handleThickness * 2, -G / 2 - 0.002]}
                  rotation={[0, Math.PI, 0]}
                >
                  <torusGeometry
                    args={[handleRadius, handleThickness, 16, 60, Math.PI]}
                  />
                  <meshBasicMaterial color="#2563eb" wireframe />
                </mesh>
              </>
            )}


            {/* DIMENSIONS */}
            {/* WIDTH */}
            <mesh position={[0, -H / 2 - 0.015, G / 2]}>
              <boxGeometry args={[W, 0.002, 0.002]} />
              <meshBasicMaterial color="#2563eb" />
            </mesh>
            <Html position={[0, -H / 2 - 0.04, G / 2]} center>
              <div style={labelStyle("#2563eb")}>
                Width ({widthMm} mm)
              </div>
            </Html>

            {/* HEIGHT */}
            <mesh position={[W / 2 + 0.02, 0, G / 2]}>
              <boxGeometry args={[0.002, H, 0.002]} />
              <meshBasicMaterial color="#16a34a" />
            </mesh>
            <Html position={[W / 2 + 0.06, 0, G / 2]} center>
              <div style={labelStyle("#16a34a")}>
                Height ({heightMm} mm)
              </div>
            </Html>

            {/* GUSSET */}
            <mesh position={[W / 2 + 0.02, -H / 2 - 0.015, 0]}>
              <boxGeometry args={[0.002, 0.002, G]} />
              <meshBasicMaterial color="#dc2626" />
            </mesh>
            <Html position={[W / 2 + 0.06, -H / 2 - 0.015, 0]} center>
              <div style={labelStyle("#dc2626")}>
                Gusset ({gussetMm} mm)
              </div>
            </Html>
          </group>

          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}
