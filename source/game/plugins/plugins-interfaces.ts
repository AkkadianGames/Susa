
import * as babylon from "babylonjs"
import {Manager} from "../../manager"
import {StickStore} from "../../overlay/stores"
import {RotatableNode, MovableNode} from "../tools/tools-interfaces"

export interface LookPluginOptions {
	node: RotatableNode
	engine: babylon.Engine
	stickStore: StickStore
}

export interface MovePluginOptions {
	node: MovableNode
	stickStore: StickStore
}

export interface PropPluginOptions {
	manager: Manager
	scene: babylon.Scene
	canvas: HTMLCanvasElement
}