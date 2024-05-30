export interface Zone {
	builder_name: string;
	doors: Door[];
	enabled: boolean;
	end_vnum: number;
	local_sets: Record<
		number,
		Array<{
			disabled: boolean;
			obj_vnum: number;
			wear_slot: number;
		}>
	>;
	lootable_items: LootableItem[];
	mobs: Mob[];
	objects: ObjectInRoom[];
	reset_timer: number;
	reset_type: number;
	start_vnum: number;
	zone_name: string;
}

export type CommandLetter =
	| 'A'
	| 'B'
	| 'C'
	| 'D'
	| 'E'
	| 'F'
	| 'G'
	| 'H'
	| 'I'
	| 'J'
	| 'K'
	| 'L'
	| 'M'
	| 'O'
	| 'P'
	| 'Q'
	| 'R'
	| 'T0'
	| 'T1'
	| 'V'
	| 'X'
	| 'Y'
	| 'Z';

interface CommandLetterToType {
	A: A;
	B: B;
	C: C;
	D: D;
	E: E;
	F: F;
	G: G;
	H: H;
	I: I;
	J: J;
	K: K;
	L: L;
	M: M;
	O: O;
	P: P;
	Q: Q;
	R: R;
	T: T;
	T0: T0;
	T1: T1;
	V: V;
	X: X;
	Y: Y;
	Z: Z;
}

type IfFlag = 0 | 1;

export interface BaseCommand {
	[key: string]: unknown;
	command: CommandLetter;
	disabled: boolean;
}

export type Command = {
	[K in CommandLetter]: BaseCommand & CommandLetterToType[K];
};

interface BaseEqSet {
	disabled: boolean;
	per_piece_load_chance: number;
}

export interface GlobalEqSet extends BaseEqSet {
	global_set_number: number;
}

export interface LocalEqSet extends BaseEqSet {
	isProp: boolean;
	local_set_number: number;
}

interface Loads {
	items?: { inventory?: InventoryItem[]; worn?: WornItem[] };
	sets?: {
		global?: GlobalEqSet[];
		local?: LocalEqSet[];
	};
}

interface A {
	chance?: number;
	command: 'A';
	if_flag: IfFlag;
	room_vnum_end: number;
	room_vnum_start: number;
}

interface RandomizedRoomRange {
	disabled: boolean;
	room_vnum_end: number;
	room_vnum_start: number;
}

// Loads on every zone repop - for lootable items
interface B {
	chance?: number;
	command: 'B';
	contains?: PlacedItem[];
	if_flag: IfFlag;
	obj_vnum: number;
	randomized_room_range?: RandomizedRoomRange;
	room_vnum: 'random' | number;
}

export interface LootableItem {
	chance?: number;
	contains?: PlacedItem[];
	disabled: boolean;
	obj_vnum: number;
	randomized_room_range?: RandomizedRoomRange;
	room_vnum: 'random' | number;
}

interface C {
	command: 'C';
	if_flag: IfFlag;
	loads?: Loads;
	max_exist: number;
	mob_vnum: number;
	room_vnum: number;
}

interface D {
	command: 'D';
	// 7 = NW, 8 = SE, 9 = SW
	exit_dir: number;
	if_flag: IfFlag; // Should be 0
	// Exit dirs: 0 = N, 1 = E, 2 = S, 3 = W, 4 = U, 5 = D, 6 = NE,
	// 1 = closed, 2 = closed and locked
	lock_arg: number;
	room_vnum: number;
}

interface Door {
	disabled: boolean;
	exit_dir: number;
	lock_arg: number;
	room_vnum: number;
	trap?: Trap;
}

interface E {
	chance?: number;
	command: 'E';
	contains?: PlacedItem[];
	if_flag: IfFlag; // Should be 1 usually
	max_exist: number;
	obj_vnum: number;
	wear_slot: number;
}

export interface WornItem {
	chance?: number;
	contains?: PlacedItem[];
	disabled: boolean;
	isProp: boolean;
	max_exist: number;
	obj_vnum: number;
	wear_slot: number;
}

interface F {
	command: 'F';
	if_flag: IfFlag; // should be 1
	op_parameter: number;
	op_type: number;
}

// Put object in mob's inventory (keys or containers, etc)
interface G {
	chance?: number;
	command: 'G';
	contains?: PlacedItem[];
	if_flag: IfFlag; // Should be 1
	max_exist: number;
	obj_vnum: number;
}

export interface InventoryItem {
	chance?: number;
	contains?: PlacedItem[];
	disabled: boolean;
	max_exist: number;
	obj_vnum: number;
}

interface H {
	command: 'H';
	if_flag: IfFlag; // should be 1
	op_parameter: number;
	op_type: number;
}

interface I {
	chance?: number;
	command: 'I';
	contains?: PlacedItem[];
	if_flag: IfFlag;
	max_exist: number;
	obj_vnum: number;
	wear_slot: number;
}

interface J {
	command: 'J';
	if_flag: IfFlag;
	local_set_number: number;
	per_piece_load_chance: number;
}

interface K {
	command: 'K';
	if_flag: IfFlag;
	loads?: Loads;
	max_exist: number;
	mob_vnum: number;
	room_vnum: number;
}

export interface Follower {
	disabled: boolean;
	isCharmed: boolean;
	loads?: Loads;
	max_exist: number;
	mob_vnum: number;
}

interface L {
	chance: number;
	command: 'L';
	if_flag: IfFlag; // should be 1
	load_target: number; // 0 mob | 1 obj | room vnum
	loot_max_level: number;
	loot_min_level: number;
}

interface RandomizedLoot {
	chance: number;
	disabled: boolean;
	load_target: number;
	loot_max_level: number;
	loot_min_level: number;
}

interface O {
	amount: number;
	chance?: number;
	command: 'O';
	contains?: PlacedItem[];
	if_flag: IfFlag; // Should be 0
	modified_values?: ModifiedValues[];
	obj_vnum: number;
	random_loot?: RandomizedLoot;
	randomized_room_range?: RandomizedRoomRange;
	room_vnum: 'random' | number;
	trap?: Trap;
}

export interface ObjectInRoom {
	amount: number;
	chance?: number;
	contains?: PlacedItem[];
	disabled: boolean;
	modified_values?: ModifiedValues[];
	obj_vnum: number;
	random_loot?: RandomizedLoot;
	randomized_room_range?: RandomizedRoomRange;
	room_vnum: 'random' | number;
	trap?: Trap;
}

interface M {
	chance?: number;
	command: 'M';
	followers?: Follower[];
	if_flag: IfFlag; // Usually 0, controlled by max_exist
	loads?: Loads;
	// Controls max # of this mob that will repop into this room over time
	max_exist: number;
	mob_vnum: number;
	randomized_room_range?: RandomizedRoomRange;
	riding?: Mount;
	room_vnum: 'random' | number;
}

export interface Mob {
	chance?: number;
	disabled: boolean;
	followers?: Follower[];
	loads?: Loads;
	max_exist: number;
	mob_vnum: number;
	randomized_room_range?: RandomizedRoomRange;
	riding?: Mount;
	room_vnum: 'random' | number;
}

// Put item into container
// Only use following an O/G/B command representing a container
interface P {
	chance?: number;
	command: 'P';
	container_vnum: number;
	contains?: PlacedItem[];
	// Should be 1 normally, can be 0 to reset items on zone reset
	if_flag: IfFlag;
	max_exist: number;
	modified_values?: ModifiedValues[];
	obj_vnum: number;
}

// A P command after it's been converted to an object inside its parent's `contains` array
export interface PlacedItem {
	chance?: number;
	contains?: PlacedItem[];
	disabled: boolean;
	max_exist: number;
	modified_values?: ModifiedValues[];
	obj_vnum: number;
}

interface R {
	command: 'R';
	if_flag: IfFlag;
	max_exist: number;
	mob_vnum: number;
	room_vnum: number;
}

interface Mount {
	disabled: boolean;
	max_exist: number;
	mob_vnum: number;
}

interface T {
	command: 'T' | 'T0' | 'T1';
	damage: number;
	if_flag: IfFlag;
	trap_type: number;
}

interface Trap {
	damage: number;
	disabled: boolean;
	trap_type: number;
}

interface T0 extends T {
	command: 'T0';
	exit_dir: number;
	if_flag: 0;
	room_vnum: number;
}

interface T1 extends T {
	command: 'T1';
	if_flag: 1;
}

interface V {
	command: 'V';
	if_flag: IfFlag; // should be 1
	new_value: number;
	// Should be 0 | 1 | 2 | 3
	which_value: number;
}

interface ModifiedValues {
	disabled: boolean;
	new_value: number;
	which_value: number;
}

interface X {
	command: 'X';
	local_set_number: number;
	obj_vnum: number;
	wear_slot: number;
}

interface Y {
	command: 'Y';
	global_set_number: number;
	if_flag: IfFlag;
	per_piece_load_chance: number;
}

interface Z {
	command: 'Z';
	if_flag: IfFlag;
	local_set_number: number;
	per_piece_load_chance: number;
}

interface Q {
	chance: number;
	command: 'Q';
	if_flag: IfFlag;
	linked_command_type: 'A' | 'B' | 'E' | 'G' | 'I' | 'L' | 'M' | 'O' | 'P';
}

export enum OLD_WEAR_SLOTS {
	WEAR_NOWHERE,
	WEAR_FINGER_R,
	WEAR_FINGER_L,
	WEAR_NECK,
	WEAR_BODY,
	WEAR_HEAD,
	WEAR_LEG_R,
	WEAR_LEG_L,
	WEAR_FOOT_R,
	WEAR_FOOT_L,
	WEAR_HAND_R,
	WEAR_HAND_L,
	WEAR_ARM_R,
	WEAR_ARM_L,
	WEAR_BACK,
	WEAR_WAIST,
	WEAR_WRIST_R,
	WEAR_WRIST_L,
	HOLD_RIGHT,
	HOLD_LEFT,
}

export enum NEW_WEAR_SLOTS {
	WEAR_NOWHERE,
	WEAR_HEAD,
	WEAR_NECK,
	WEAR_BODY,
	WEAR_BACK,
	WEAR_ARM_R,
	WEAR_ARM_L,
	WEAR_WRIST_R,
	WEAR_WRIST_L,
	WEAR_HAND_R,
	WEAR_HAND_L,
	WEAR_FINGER_R,
	WEAR_FINGER_L,
	WEAR_WAIST,
	WEAR_LEG_R,
	WEAR_LEG_L,
	WEAR_FOOT_R,
	WEAR_FOOT_L,
	HOLD_RIGHT,
	HOLD_LEFT,
}

export const WEAR_SLOTS = {
	HOLD_LEFT: {
		new: NEW_WEAR_SLOTS.HOLD_LEFT,
		old: OLD_WEAR_SLOTS.HOLD_LEFT,
	},
	HOLD_RIGHT: {
		new: NEW_WEAR_SLOTS.HOLD_RIGHT,
		old: OLD_WEAR_SLOTS.HOLD_RIGHT,
	},
	WEAR_ARM_L: {
		new: NEW_WEAR_SLOTS.WEAR_WAIST,
		old: OLD_WEAR_SLOTS.WEAR_ARM_L,
	},
	WEAR_ARM_R: {
		new: NEW_WEAR_SLOTS.WEAR_FINGER_L,
		old: OLD_WEAR_SLOTS.WEAR_ARM_R,
	},
	WEAR_BACK: {
		new: NEW_WEAR_SLOTS.WEAR_LEG_R,
		old: OLD_WEAR_SLOTS.WEAR_BACK,
	},
	WEAR_BODY: {
		new: NEW_WEAR_SLOTS.WEAR_BACK,
		old: OLD_WEAR_SLOTS.WEAR_BODY,
	},
	WEAR_FINGER_L: {
		new: NEW_WEAR_SLOTS.WEAR_NECK,
		old: OLD_WEAR_SLOTS.WEAR_FINGER_L,
	},
	WEAR_FINGER_R: {
		new: NEW_WEAR_SLOTS.WEAR_HEAD,
		old: OLD_WEAR_SLOTS.WEAR_FINGER_R,
	},
	WEAR_FOOT_L: {
		new: NEW_WEAR_SLOTS.WEAR_HAND_R,
		old: OLD_WEAR_SLOTS.WEAR_FOOT_L,
	},
	WEAR_FOOT_R: {
		new: NEW_WEAR_SLOTS.WEAR_WRIST_L,
		old: OLD_WEAR_SLOTS.WEAR_FOOT_R,
	},
	WEAR_HAND_L: {
		new: NEW_WEAR_SLOTS.WEAR_FINGER_R,
		old: OLD_WEAR_SLOTS.WEAR_HAND_L,
	},
	WEAR_HAND_R: {
		new: NEW_WEAR_SLOTS.WEAR_HAND_L,
		old: OLD_WEAR_SLOTS.WEAR_HAND_R,
	},
	WEAR_HEAD: {
		new: NEW_WEAR_SLOTS.WEAR_ARM_R,
		old: OLD_WEAR_SLOTS.WEAR_HEAD,
	},
	WEAR_LEG_L: {
		new: NEW_WEAR_SLOTS.WEAR_WRIST_R,
		old: OLD_WEAR_SLOTS.WEAR_LEG_L,
	},
	WEAR_LEG_R: {
		new: NEW_WEAR_SLOTS.WEAR_ARM_L,
		old: OLD_WEAR_SLOTS.WEAR_LEG_R,
	},
	WEAR_NECK: {
		new: NEW_WEAR_SLOTS.WEAR_BODY,
		old: OLD_WEAR_SLOTS.WEAR_NECK,
	},
	WEAR_NOWHERE: {
		new: NEW_WEAR_SLOTS.WEAR_NOWHERE,
		old: OLD_WEAR_SLOTS.WEAR_NOWHERE,
	},
	WEAR_WAIST: {
		new: NEW_WEAR_SLOTS.WEAR_LEG_L,
		old: OLD_WEAR_SLOTS.WEAR_WAIST,
	},
	WEAR_WRIST_L: {
		new: NEW_WEAR_SLOTS.WEAR_FOOT_L,
		old: OLD_WEAR_SLOTS.WEAR_WRIST_L,
	},
	WEAR_WRIST_R: {
		new: NEW_WEAR_SLOTS.WEAR_FOOT_R,
		old: OLD_WEAR_SLOTS.WEAR_WRIST_R,
	},
} as const;
