/**
 * 后处理：Bloom
 *
 * - 使用 EffectComposer + RenderPass + UnrealBloomPass + OutputPass
 * - strength 0.55，radius 0.7，threshold 0.85
 *   （关键：threshold=0.85 让 bloom 只作用于真正的"亮源"，根治全屏过曝）
 */
import { Vector2 } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export interface PostFXBundle {
	composer: EffectComposer;
	bloomPass: UnrealBloomPass;
	dispose: () => void;
	resize: () => void;
}

export interface PostFXOptions {
	scene: import("three").Scene;
	camera: import("three").PerspectiveCamera;
	renderer: import("three").WebGLRenderer;
	container: HTMLElement;
}

export function setupPostFX(opts: PostFXOptions): PostFXBundle {
	const { scene, camera, renderer, container } = opts;

	const composer = new EffectComposer(renderer);
	composer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
	composer.setSize(container.clientWidth, container.clientHeight);

	// 1. RenderPass：渲染场景
	const renderPass = new RenderPass(scene, camera);
	composer.addPass(renderPass);

	// 2. UnrealBloomPass：克制发光（关键参数：threshold 0.85）
	const bloomPass = new UnrealBloomPass(
		new Vector2(container.clientWidth, container.clientHeight),
		0.55, // strength：0.95 → 0.55，整体辉光减半
		0.7, // radius：  0.5  → 0.7，柔化光斑边界
		0.85, // threshold：0.0 → 0.85，根治全屏过曝
	);
	composer.addPass(bloomPass);

	// 3. OutputPass：色彩空间 / tone mapping 收尾
	const outputPass = new OutputPass();
	composer.addPass(outputPass);

	const onResize = () => {
		const w = container.clientWidth;
		const h = container.clientHeight;
		if (w === 0 || h === 0) return;
		composer.setSize(w, h);
		bloomPass.setSize(w, h);
	};
	const ro = new ResizeObserver(onResize);
	ro.observe(container);

	return {
		composer,
		bloomPass,
		dispose() {
			ro.disconnect();
			composer.dispose();
		},
		resize: onResize,
	};
}
