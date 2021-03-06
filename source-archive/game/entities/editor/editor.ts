
import {autorun} from "mobx"
import * as preact from "preact"
import * as babylon from "@babylonjs/core"

import {Entity} from "../../../core/entity.js"
import {TickInfo, EntityPlugin} from "../../../core/interfaces.js"

import {Context} from "../../game-interfaces.js"
import {LookPlugin} from "../../plugins/look-plugin.js"
import {MovePlugin} from "../../plugins/move-plugin.js"
import {PropPlugin} from "../../plugins/prop-plugin.js"
import {makeBasicCamera} from "../../tools/camtools.js"

import {EditorMenu} from "./editor-menu.js"
import {EditorEntry} from "./editor-interfaces.js"
import {createLaserDot} from "./create-laser-dot.js"
import {EditorMenuStore, SelectionTool, AdditionTool} from "./editor-menu-store.js"

export class Editor extends Entity<Context, EditorEntry> {

	readonly camera = makeBasicCamera({
		scene: this.context.scene,
		bearings: this.entry.bearings
	})

	private readonly plugins: EntityPlugin[] = [
		new MovePlugin({
			node: this.camera,
			stickStore: this.context.overlayStore.stick1
		}),
		new PropPlugin({
			scene: this.context.scene,
			canvas: this.context.canvas,
			manager: this.context.manager
		})
	]

	private readonly hyperPlugins: EntityPlugin[] = [
		new LookPlugin({
			node: this.camera,
			engine: this.context.engine,
			mainMenuStore: this.context.mainMenuStore,
			stickStore: this.context.overlayStore.stick2
		})
	]

	private readonly menu = new EditorMenuStore()
	private laserDot: babylon.Mesh

	private reactions = [
		autorun(() => {
			const {scene} = this.context
			const {activeTool} = this.menu

			const toolRequiresLaserDot = (activeTool instanceof SelectionTool
				|| activeTool instanceof AdditionTool)

			if (toolRequiresLaserDot) {
				if (!this.laserDot) this.laserDot = createLaserDot({scene})
			}
			else if (this.laserDot) {
				this.laserDot.material.dispose()
				this.laserDot.dispose()
				this.laserDot = null
			}
		})
	]

	async initialize() {
		const {overlayStore} = this.context
		const {menuBar} = overlayStore
		menuBar.addMenu(this.menu, <typeof preact.Component>EditorMenu)
		overlayStore.addStickSubscriber()
	}

	logicTick(tickInfo: TickInfo) {
		const {laserDot} = this

		for (const plugin of this.plugins)
			plugin.logic(tickInfo)

		// position the laser dot
		if (laserDot) {
			const pick = this.middlePick()
			if (pick && pick.hit) {
				laserDot.position = pick.pickedPoint.clone()
				laserDot.setEnabled(true)
			}
			else {
				laserDot.position.set(0, 0, 0)
				laserDot.setEnabled(false)
			}
		}
	}

	hyperTick(tickInfo: TickInfo) {
		for (const plugin of this.hyperPlugins)
			plugin.logic(tickInfo)
	}

	async deconstruct() {
		const {overlayStore} = this.context
		const {menuBar} = overlayStore
		menuBar.removeMenu(this.menu)
		overlayStore.subtractStickSubscriber()
		this.camera.dispose()
		for (const plugin of this.plugins) plugin.destructor()
		for (const dispose of this.reactions) dispose()
	}

	private middlePick() {
		const {scene, canvas} = this.context
		const {width, height} = canvas
		return scene.pick(width / 2, height / 2)
	}
}
