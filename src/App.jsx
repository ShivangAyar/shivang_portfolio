import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Text, ContactShadows, KeyboardControls, useKeyboardControls } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';

// --- KEYBOARD CONTROLS MAPPING ---
const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
];

// --- THE PLAYER (ROLLING SPHERE) ---
function Player() {
  const bodyRef = useRef();
  const [subscribeKeys, getKeys] = useKeyboardControls();
  
  useFrame((state) => {
    if (!bodyRef.current) return;

    const keys = getKeys();
    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };
    const speed = 0.5;

    // Apply movement forces based on keyboard input
    if (keys.forward) { impulse.z -= speed; torque.x -= speed; }
    if (keys.backward) { impulse.z += speed; torque.x += speed; }
    if (keys.left) { impulse.x -= speed; torque.z += speed; }
    if (keys.right) { impulse.x += speed; torque.z -= speed; }

    bodyRef.current.applyImpulse(impulse, true);
    bodyRef.current.applyTorqueImpulse(torque, true);

    // Make the camera follow the ball smoothly
    const ballPosition = bodyRef.current.translation();
    const cameraPosition = new THREE.Vector3(ballPosition.x, ballPosition.y + 10, ballPosition.z + 15);
    state.camera.position.lerp(cameraPosition, 0.1);
    state.camera.lookAt(ballPosition.x, ballPosition.y, ballPosition.z);
  });

  return (
    <RigidBody ref={bodyRef} colliders="ball" mass={1} restitution={0.8} friction={1} position={[0, 2, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} toneMapped={false} />
      </mesh>
    </RigidBody>
  );
}

// --- PHYSICAL SKILL/PROJECT BLOCKS ---
function PhysicsBlock({ position, text, color }) {
  const [hovered, setHover] = useState(false);

  return (
    <RigidBody colliders="cuboid" mass={2} position={position} restitution={0.5} friction={0.5}>
      <mesh 
        onPointerOver={() => setHover(true)} 
        onPointerOut={() => setHover(false)}
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[4, 2, 2]} />
        <meshStandardMaterial color={hovered ? "#ffffff" : color} />
        <Text 
          position={[0, 0, 1.01]} 
          fontSize={0.5} 
          color="#000000" 
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
        >
          {text}
        </Text>
      </mesh>
    </RigidBody>
  );
}

// --- THE ENVIRONMENT ---
function Arena() {
  return (
    <>
      {/* The Floor */}
      <RigidBody type="fixed" restitution={0.2} friction={1}>
        <mesh receiveShadow position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
      </RigidBody>

      {/* Invisible Walls to keep the player from falling off */}
      <RigidBody type="fixed"><CuboidCollider args={[50, 10, 1]} position={[0, 5, -50]} /></RigidBody>
      <RigidBody type="fixed"><CuboidCollider args={[50, 10, 1]} position={[0, 5, 50]} /></RigidBody>
      <RigidBody type="fixed"><CuboidCollider args={[1, 10, 50]} position={[-50, 5, 0]} /></RigidBody>
      <RigidBody type="fixed"><CuboidCollider args={[1, 10, 50]} position={[50, 5, 0]} /></RigidBody>

      {/* Skills & Projects Scattered Around */}
      <PhysicsBlock position={[-5, 2, -10]} text="React.js" color="#3b82f6" />
      <PhysicsBlock position={[5, 4, -12]} text="Node.js" color="#22c55e" />
      <PhysicsBlock position={[0, 6, -15]} text="Java OOP" color="#ef4444" />
      <PhysicsBlock position={[-8, 2, -20]} text="MongoDB" color="#10b981" />
      <PhysicsBlock position={[8, 2, -18]} text="Power BI" color="#eab308" />
      
      {/* Big Project Blocks */}
      <PhysicsBlock position={[0, 2, -30]} text="Movie Watchlist App" color="#8b5cf6" />
      <PhysicsBlock position={[-10, 2, -25]} text="Voice AI Chatbot" color="#06b6d4" />
    </>
  );
}

export default function App() {
  return (
    <div className="bg-[#050505] text-white min-h-screen w-full overflow-hidden font-sans cursor-crosshair">
      
      {/* --- UI OVERLAY --- */}
      <div className="absolute top-0 left-0 w-full z-10 pointer-events-none p-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">SHIVANG<span className="text-cyan-500">.AYAR</span></h1>
          <p className="text-gray-400 font-medium">Full-Stack Developer Sandbox</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/10 text-right">
          <p className="font-bold text-cyan-400 mb-1">CONTROLS</p>
          <p className="text-sm text-gray-300">W A S D or Arrows to Move</p>
          <p className="text-sm text-gray-300">Mouse to look around</p>
        </div>
      </div>

      {/* --- 3D PHYSICS WORLD --- */}
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ position: [0, 10, 15], fov: 45 }}>
          <color attach="background" args={['#050505']} />
          <ambientLight intensity={0.5} />
          <directionalLight castShadow position={[10, 20, 10]} intensity={1.5} color="#ffffff" shadow-mapSize={[2048, 2048]} />
          
          <Environment preset="city" />
          
          <Physics gravity={[0, -9.81, 0]}>
            <Player />
            <Arena />
          </Physics>

          {/* Grid visual for the floor */}
          <gridHelper args={[100, 100, '#111111', '#111111']} position={[0, -0.99, 0]} />
        </Canvas>
      </KeyboardControls>

    </div>
  );
}