/**
 * 场景搭建器
 *
 * - 创建 Scene / PerspectiveCamera / WebGLRenderer
 * - 自适应容器尺寸 + 像素比上限
 * - ACESFilmicToneMapping 电影级色调映射 + exposure 0.85 整体压暗
 * - 暴露 dispose / resize 给外部
 *
 * 注意：所有 Three.js 子模块在浏览器侧使用，因此 scene-builder 仅在
 * StarMap3D 的 onMount 内被调用，避免 SSR 触发 window 引用。
 */
import {
	ACESFilmicToneMapping,
	PerspectiveCamera,
	Scene,
	SRGBColorSpace,
	WebGLRenderer,
} from "three";

export interface SceneBundle {
	scene: Scene;
	camera: PerspectiveCamera;
	renderer: WebGLRenderer;
	dispose: () => void;
	resize: () => void;
}

export function buildScene(container: HTMLElement): SceneBundle {
	const { clientWidth, clientHeight } = container;

	// === Scene ===
	// 关键：背景设为 null，让 CSS 径向渐变（深空黑）透出来
	const scene = new Scene();
	scene.background = null;

	// === Camera ===
	const camera = new PerspectiveCamera(
		60,
		Math.max(1, clientWidth) / Math.max(1, clientHeight),
		0.1,
		2000,
	);
	camera.position.set(0, 18, 60);
	camera.lookAt(0, 0, 0);

	// === Renderer ===
	const renderer = new WebGLRenderer({
		antialias: true,
		alpha: true,
		powerPreference: "high-performance",
	});
	renderer.setSize(clientWidth, clientHeight);
	renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
	renderer.outputColorSpace = SRGBColorSpace;
	// ACES Filmic 电影级色调映射，配合 exposure 0.85 整体压暗
	renderer.toneMapping = ACESFilmicToneMapping;
	renderer.toneMappingExposure = 0.85;
	// 不开 shadow（节点全为自发光）
	renderer.shadowMap.enabled = false;
	container.appendChild(renderer.domElement);
	renderer.domElement.style.display = "block";
	renderer.domElement.style.width = "100%";
	renderer.domElement.style.height = "100%";

	// === Resize 监听 ===
	const onResize = () => {
		const w = container.clientWidth;
		const h = container.clientHeight;
		if (w === 0 || h === 0) return;
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		renderer.setSize(w, h);
		renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
	};
	const ro = new ResizeObserver(onResize);
	ro.observe(container);

	// === Dispose ===
	const dispose = () => {
		ro.disconnect();
		renderer.dispose();
		if (renderer.domElement.parentElement) {
			renderer.domElement.parentElement.removeChild(renderer.domElement);
		}
	};

	return { scene, camera, renderer, dispose, resize: onResize };
}

/**
 * WebGL 能力检测（用于降级）
 */
export function isWebGLAvailable(): boolean {
	if (typeof window === "undefined") return false;
	try {
		const canvas = document.createElement("canvas");
		const gl =
			canvas.getContext("webgl2") ||
			canvas.getContext("webgl") ||
			canvas.getContext("experimental-webgl");
		return !!gl;
	} catch {
		return false;
	}
}
