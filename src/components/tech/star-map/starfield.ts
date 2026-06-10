/**
 * 多层星点场
 *
 * - 远 / 中 / 近 三层 Points，每层独立大小 / 闪烁周期 / 颜色
 * - 自定义 ShaderMaterial：每颗星点带独立相位 + 频率，闪烁
 * - 球面随机分布，半径 200~600，营造宇宙纵深
 * - 整体以 Y 轴 0.005 rad/s 缓速旋转
 */
import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	Group,
	Points,
	ShaderMaterial,
} from "three";
import type { StarFieldHandle, StarLayer } from "./types";

interface LayerConfig {
	count: number;
	// 球面半径区间
	radiusMin: number;
	radiusMax: number;
	// 屏幕尺寸区间（points size in world units with sizeAttenuation）
	sizeMin: number;
	sizeMax: number;
	// 闪烁周期区间
	twinkleMin: number;
	twinkleMax: number;
	// 颜色（HSL hue 列表，随机分配）
	hues: number[];
}

const LAYER_CONFIGS: LayerConfig[] = [
	// 远景：6000 颗，小而密（v2：3000 → 6000）
	{
		count: 6000,
		radiusMin: 400,
		radiusMax: 700,
		sizeMin: 0.5,
		sizeMax: 1.0,
		twinkleMin: 4.0,
		twinkleMax: 7.0,
		hues: [220, 240, 260, 40, 200],
	},
	// 中景：2500 颗（v2：800 → 2500）
	{
		count: 2500,
		radiusMin: 250,
		radiusMax: 400,
		sizeMin: 1.0,
		sizeMax: 1.8,
		twinkleMin: 2.0,
		twinkleMax: 4.0,
		hues: [200, 220, 240, 38, 50, 280],
	},
	// 近景：200 颗，大而亮（v2：150 → 200）
	{
		count: 200,
		radiusMin: 180,
		radiusMax: 260,
		sizeMin: 1.6,
		sizeMax: 3.0,
		twinkleMin: 1.5,
		twinkleMax: 3.0,
		hues: [40, 200, 220, 280, 60],
	},
];

const STAR_VERT = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute float aFreq;
attribute vec3 aColor;

uniform float uTime;
uniform float uPixelRatio;

varying vec3 vColor;
varying float vAlpha;

void main() {
  // 闪烁：sin(time * freq + phase) * 0.5 + 0.5
  float twinkle = sin(uTime * aFreq + aPhase) * 0.5 + 0.5;
  vAlpha = 0.4 + 0.6 * twinkle;
  vColor = aColor;

  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPos;
  // size 受 perspective 影响
  gl_PointSize = aSize * uPixelRatio * (300.0 / -mvPos.z);
}
`;

const STAR_FRAG = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  // 圆形 + 软边
  vec2 c = gl_PointCoord - vec2(0.5);
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d);
  // 中心提亮
  a = pow(a, 1.4);
  gl_FragColor = vec4(vColor * vAlpha, a * vAlpha);
}
`;

export function createStarField(): StarFieldHandle {
	const group = new Group();
	group.name = "starfield";

	const layers: StarLayer[] = LAYER_CONFIGS.map((cfg, layerIdx) => {
		const positions = new Float32Array(cfg.count * 3);
		const sizes = new Float32Array(cfg.count);
		const phases = new Float32Array(cfg.count);
		const freqs = new Float32Array(cfg.count);
		const colors = new Float32Array(cfg.count * 3);

		for (let i = 0; i < cfg.count; i++) {
			// 球面随机分布
			const u = Math.random();
			const v = Math.random();
			const theta = 2 * Math.PI * u;
			const phi = Math.acos(2 * v - 1);
			const r = cfg.radiusMin + Math.random() * (cfg.radiusMax - cfg.radiusMin);

			positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
			positions[i * 3 + 1] = r * Math.cos(phi);
			positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

			sizes[i] = cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin);
			phases[i] = Math.random() * Math.PI * 2;
			freqs[i] =
				(2 * Math.PI) /
				(cfg.twinkleMin + Math.random() * (cfg.twinkleMax - cfg.twinkleMin));

			// 颜色：随机选 hue + 偏白（v2：sat 0.15-0.4 → 0.05-0.2，更偏白）
			const hue = cfg.hues[Math.floor(Math.random() * cfg.hues.length)];
			const sat = 0.05 + Math.random() * 0.15;
			const lit = 0.9 + Math.random() * 0.1;
			const c = hslToRgb(hue / 360, sat, lit);
			colors[i * 3 + 0] = c[0];
			colors[i * 3 + 1] = c[1];
			colors[i * 3 + 2] = c[2];
		}

		const geo = new BufferGeometry();
		geo.setAttribute("position", new BufferAttribute(positions, 3));
		geo.setAttribute("aSize", new BufferAttribute(sizes, 1));
		geo.setAttribute("aPhase", new BufferAttribute(phases, 1));
		geo.setAttribute("aFreq", new BufferAttribute(freqs, 1));
		geo.setAttribute("aColor", new BufferAttribute(colors, 3));

		const mat = new ShaderMaterial({
			uniforms: {
				uTime: { value: 0 },
				uPixelRatio: { value: Math.min(2, window.devicePixelRatio || 1) },
			},
			vertexShader: STAR_VERT,
			fragmentShader: STAR_FRAG,
			transparent: true,
			blending: AdditiveBlending,
			depthWrite: false,
		});

		const points = new Points(geo, mat);
		points.name = `starfield-layer-${layerIdx}`;
		points.frustumCulled = false;
		group.add(points);

		return {
			points,
			material: mat,
			count: cfg.count,
			twinkleSpeed: 1.0,
			twinkleOffset: layerIdx * 0.5,
		};
	});

	return {
		group,
		layers,
		update(t) {
			for (const l of layers) l.material.uniforms.uTime.value = t;
			// 整体慢速 Y 轴旋转
			group.rotation.y = t * 0.005;
		},
		dispose() {
			for (const l of layers) {
				l.points.geometry.dispose();
				l.material.dispose();
			}
		},
	};
}

/**
 * HSL → RGB (0-1)
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
	let r: number;
	let g: number;
	let b: number;
	if (s === 0) {
		r = g = b = l;
	} else {
		const hue2rgb = (p: number, q: number, t: number) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}
	return [r, g, b];
}
