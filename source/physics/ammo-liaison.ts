
import {Vector, Quaternion} from "./data"

export type AmmoModule = typeof Ammo

export function loadAmmo(onLoad: (ammo: AmmoModule) => void) {
	const Ammo = window["Ammo"]
	if (!Ammo) throw new Error("'ammo.js' not loaded")
	Ammo().then(ammo => onLoad(ammo))
}

export declare namespace Ammo {
	export const enum ActivationState {
		DisableDeactivation = 4
	}

	export class btVector3 { constructor(x: number, y: number, z: number) }
	export class btQuaternion { constructor(x: number, y: number, z: number, w: number) }
	export class btShape {
		constructor(size: btVector3)
		calculateLocalInertia(mass: number, localInertia: btVector3)
	}
	export class btBoxShape extends btShape {}
	export class btTransform {
		setIdentity()
		setOrigin(v: btVector3)
		setRotation(q: btQuaternion)
		getOrigin(): btVector3
		getRotation(): btQuaternion
	}
	export class btCollisionConfiguration {}
	export class btDefaultCollisionConfiguration extends btCollisionConfiguration {}
	export class btMotionState {
		constructor(transform: btTransform)
		getWorldTransform(transform: btTransform)
	}
	export class btDefaultMotionState extends btMotionState {}
	export class btRigidBodyConstructionInfo {
		constructor(
			mass: number,
			motionState: btMotionState,
			geometry: btShape,
			localInertia: btVector3
		)
	}
	export class btRigidBody {
		constructor(bodyInfo: btRigidBodyConstructionInfo)
		setActivationState(state: ActivationState)
		setFriction(friction: number)
		getMotionState(): btMotionState
	}
	export class btVehicleTuning {}
	export class btVehicleRaycaster {
		constructor(world: btDiscreteDynamicsWorld)
	}
	export class btDefaultVehicleRaycaster extends btVehicleRaycaster {}
	export class WheelInfo {
		set_m_suspensionStiffness(stiffness: number)
		set_m_wheelsDampingRelaxation(relaxation: number)
		set_m_wheelsDampingCompression(compression: number)
		set_m_frictionSlip(friction: number)
		set_m_rollInfluence(rollInfluence: number)
	}
	export class btRaycastVehicle {
		constructor(tuning: btVehicleTuning, body: btRigidBody, caster: btVehicleRaycaster)
		setCoordinateSystem(x: number, y: number, z: number)
		addWheel(
			position: btVector3,
			wheelDirection: btVector3,
			wheelAxle: btVector3,
			suspensionRestLength: number,
			radius: number,
			tuning: btVehicleTuning,
			isFront: boolean
		): WheelInfo
	}
	export class btCollisionDispatcher { constructor(config: btCollisionConfiguration) }
	export class btDbvtBroadphase {}
	export class btSequentialImpulseConstraintSolver {}

	export class btDiscreteDynamicsWorld {
		constructor(
			dispatcher: btCollisionDispatcher,
			broadphase: btDbvtBroadphase,
			solver: btSequentialImpulseConstraintSolver,
			config: btCollisionConfiguration
		)
		setGravity(v: btVector3): void
		stepSimulation(time: number, maxStepSubdivisions?: number): void
		addRigidBody(body: btRigidBody)
		removeRigidBody(body: btRigidBody)
	}
}

export const vect = p => <Vector>[p.x(), p.y(), p.z()]
export const quat = q => <Quaternion>[q.x(), q.y(), q.z(), q.w()]

export const conversionTools = (ammo: typeof Ammo) => {
	return {
		vect,
		quat,
		bvect: (v: Vector) => new ammo.btVector3(v[0], v[1], v[2]),
		bquat: (q: Quaternion) => new ammo.btQuaternion(q[0], q[1], q[2], q[3])
	}
}
