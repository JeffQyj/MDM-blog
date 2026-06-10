/**
 * 银河带 / 星云（v2：暗色尘埃带 + 中心核 + 辅助云气）
 *
 * 关键改进：
 * - 从 3 块亮色 Plane 改为 1 块贯穿场景的银河主带（PlaneGeometry 3000x400）
 * - 自定义 ShaderMaterial 渲染「深色尘埃带 + 微弱紫色辉光」（真实银河的"暗带剪影"）
 * - 银河主带倾斜 -15° 绕 X 轴，绕 Y 轴慢速旋转
 * - 主带中心叠加球状核（模拟银心）
 * - 主带两端外侧叠加 2 块辅助云气（带紫色辉光）
 */
import {
	AdditiveBlending,
	Color,
	DoubleSide,
	Group,
	Mesh,
	PlaneGeometry,
	ShaderMaterial,
} from "three";
import type { NebulaHandle } from "./types";

/** 银河主带 shader：暗色尘埃 + 微弱辉光 */
const BAND_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const BAND_FRAG = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  // 横向为带长方向，纵向为带宽方向
  // 整体在带宽方向上的衰减
  float bandFalloff = 1.0 - smoothstep(0.0, 0.5, abs(vUv.y - 0.5) * 2.0);
  // 横向波动：FBM 噪声扰动
  float wisp = fbm(vec2(vUv.x * 6.0, vUv.y * 2.0 + uTime * 0.02));
  // 中心更暗（尘埃带），边缘有微弱辉光
  float center = smoothstep(0.0, 0.3, abs(vUv.y - 0.5) * 2.0);
  // 沿带长的密度变化（让带更"不规则"）
  float lengthWisp = fbm(vec2(vUv.x * 3.0, 0.0)) * 0.6 + 0.4;

  float dust = (1.0 - center) * wisp * lengthWisp * 0.35;
  float glow = center * 0.12;
  float alpha = (dust + glow) * bandFalloff * uOpacity;

  gl_FragColor = vec4(uColor, alpha);
}
`;

/** 球状核 shader：径向辉光 */
const CORE_VERT = BAND_VERT;
const CORE_FRAG = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;

void main() {
  vec2 d = vUv - vec2(0.5);
  float r = length(d);
  if (r > 0.5) discard;
  // 中心最亮，向外快速衰减
  float core = exp(-r * 18.0) * 1.0;
  float halo = exp(-r * 5.0) * 0.25;
  // 微弱呼吸
  float breath = 1.0 + 0.08 * sin(uTime * 0.5);
  float intensity = (core + halo) * breath;
  gl_FragColor = vec4(uColor, intensity * uOpacity);
}
`;

/** 辅助云气 shader：柔和的椭圆云团 */
const CLOUD_VERT = BAND_VERT;
const CLOUD_FRAG = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 d = vUv - vec2(0.5);
  // 椭圆形状（横向拉伸）
  d.y *= 1.8;
  float r = length(d);
  if (r > 0.5) discard;
  // FBM 噪声扰动边缘
  float n = fbm(vUv * 4.0 + vec2(uTime * 0.05, 0.0));
  // 中心亮、边缘暗
  float falloff = exp(-r * 6.0) * (0.6 + 0.4 * n);
  gl_FragColor = vec4(uColor, falloff * uOpacity);
}
`;

interface PatchConfig {
	color: number;
	opacity: number;
	width: number;
	height: number;
	position: [number, number, number];
	rotation: [number, number, number];
}

const BAND_CONFIG: PatchConfig = {
	color: 0xb8a4ff, // 淡紫
	opacity: 0.55,
	width: 3000,
	height: 400,
	position: [0, 0, -250],
	rotation: [(-Math.PI * 15) / 180, 0, 0], // 倾斜 -15°
};

const CORE_CONFIG: PatchConfig = {
	color: 0xfff2c8, // 暖白（银心）
	opacity: 0.9,
	width: 60,
	height: 60,
	position: [0, 0, -240],
	rotation: [0, 0, 0],
};

const CLOUD_CONFIGS: PatchConfig[] = [
	{
		color: 0xffb3d9, // 粉紫
		opacity: 0.18,
		width: 800,
		height: 220,
		position: [-1100, 50, -230],
		rotation: [(-Math.PI * 18) / 180, 0, 0.05],
	},
	{
		color: 0x88c8ff, // 冷蓝
		opacity: 0.16,
		width: 900,
		height: 240,
		position: [1100, -30, -230],
		rotation: [(-Math.PI * 12) / 180, 0, -0.05],
	},
];

export function createNebula(): NebulaHandle {
	const group = new Group();
	group.name = "nebula";

	const mats: ShaderMaterial[] = [];

	// === 银河主带 ===
	const bandGeo = new PlaneGeometry(
		BAND_CONFIG.width,
		BAND_CONFIG.height,
		1,
		1,
	);
	const bandMat = new ShaderMaterial({
		vertexShader: BAND_VERT,
		fragmentShader: BAND_FRAG,
		uniforms: {
			uTime: { value: 0 },
			uColor: { value: new Color(BAND_CONFIG.color) },
			uOpacity: { value: BAND_CONFIG.opacity },
		},
		transparent: true,
		blending: AdditiveBlending,
		side: DoubleSide,
		depthWrite: false,
	});
	mats.push(bandMat);
	const bandMesh = new Mesh(bandGeo, bandMat);
	bandMesh.position.set(...BAND_CONFIG.position);
	bandMesh.rotation.set(...BAND_CONFIG.rotation);
	group.add(bandMesh);

	// === 球状核心（银心）===
	const coreGeo = new PlaneGeometry(
		CORE_CONFIG.width,
		CORE_CONFIG.height,
		1,
		1,
	);
	const coreMat = new ShaderMaterial({
		vertexShader: CORE_VERT,
		fragmentShader: CORE_FRAG,
		uniforms: {
			uTime: { value: 0 },
			uColor: { value: new Color(CORE_CONFIG.color) },
			uOpacity: { value: CORE_CONFIG.opacity },
		},
		transparent: true,
		blending: AdditiveBlending,
		side: DoubleSide,
		depthWrite: false,
	});
	mats.push(coreMat);
	const coreMesh = new Mesh(coreGeo, coreMat);
	coreMesh.position.set(...CORE_CONFIG.position);
	coreMesh.rotation.set(...CORE_CONFIG.rotation);
	group.add(coreMesh);

	// === 辅助云气 ===
	for (const cfg of CLOUD_CONFIGS) {
		const geo = new PlaneGeometry(cfg.width, cfg.height, 1, 1);
		const mat = new ShaderMaterial({
			vertexShader: CLOUD_VERT,
			fragmentShader: CLOUD_FRAG,
			uniforms: {
				uTime: { value: 0 },
				uColor: { value: new Color(cfg.color) },
				uOpacity: { value: cfg.opacity },
			},
			transparent: true,
			blending: AdditiveBlending,
			side: DoubleSide,
			depthWrite: false,
		});
		mats.push(mat);
		const mesh = new Mesh(geo, mat);
		mesh.position.set(...cfg.position);
		mesh.rotation.set(...cfg.rotation);
		group.add(mesh);
	}

	return {
		group,
		update(t) {
			for (const m of mats) m.uniforms.uTime.value = t;
			// 银河带整体绕 Y 轴慢速旋转（0.005 rad/s）
			group.rotation.y = t * 0.005;
		},
		dispose() {
			group.traverse((obj) => {
				if (obj instanceof Mesh) {
					obj.geometry.dispose();
					const mat = obj.material as ShaderMaterial;
					mat.dispose();
				}
			});
		},
	};
}
