
import * as cannon from "cannon"
import * as babylon from "babylonjs"
import {Scene, Engine, PickingInfo, Camera, Vector3, IPhysicsEnginePlugin} from "babylonjs"

import {Vector} from "./interfaces"
import {now, Service} from "./toolbox"

export interface SusaOptions {
	scene: Scene
	engine: Engine
	window: Window
	canvas: HTMLCanvasElement
}

/**
 * SUSA CLASS
 *  - manage the babylon rendering loop (start/stop methods)
 *  - html dom event handling for pointer locking
 */
export class Susa implements Service {
	private readonly scene: babylon.Scene
	private readonly engine: babylon.Engine
	private readonly window: Window
	private readonly canvas: HTMLCanvasElement

	private active: boolean = false
	private readonly fallbackCamera: Camera
	private pick: PickingInfo = new PickingInfo()
	private lastFrameTime = now()
	private locked: boolean = false

	private readonly listeners: { [eventName: string]: () => void } = {
		resize: () => {
			this.engine.resize()
		},

		mousemove: () => {
			this.pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY)
		},

		pointerlockchange: () => {
			if (this.scene.activeCamera) {
				const locked = (this.window.document.pointerLockElement === this.canvas)
				this.locked = locked
			}
		}
	}

	constructor({engine, scene, window, canvas}: SusaOptions) {
		canvas.onclick = () => canvas.requestPointerLock()

		const fallbackCamera = new Camera("susa.fallback.camera", new Vector3(0, 1, -15), scene)
		if (!scene.activeCamera) scene.activeCamera = fallbackCamera

		Object.assign(this, {engine, scene, window, canvas, fallbackCamera})
	}

	destructor() {}

	start() {
		const {window, listeners, engine, scene} = this
		this.active = true

		window.addEventListener("resize", listeners.resize)
		window.addEventListener("mousemove", listeners.mousemove)
		window.document.addEventListener("pointerlockchange", listeners.pointerlockchange)

		engine.runRenderLoop(() => {
			if (!this.active) return null
			const since = now() - this.lastFrameTime
			scene.render()
			this.lastFrameTime = now()
		})
	}

	stop() {
		const {window, listeners, engine} = this
		this.active = false

		window.removeEventListener("resize", listeners.resize)
		window.removeEventListener("mousemove", listeners.mousemove)
		window.document.removeEventListener("pointerlockchange", listeners.pointerlockchange)

		engine.stopRenderLoop()
	}
}
