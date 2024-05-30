import fs from 'node:fs';
import path from 'node:path';

import { isValidValue } from '~/types/helpers';

import {
	type BaseCommand,
	type Command,
	type CommandLetter,
	type Follower,
	type GlobalEqSet,
	type InventoryItem,
	type LocalEqSet,
	type LootableItem,
	type Mob,
	type ObjectInRoom,
	type PlacedItem,
	type WornItem,
	type Zone,
} from './parse-zonefile.types';

const RAW_COMMANDS = new Set([
	// A <if_flag> <room_vnum_start> <room_vnum_end>
	'A',

	// B <if_flag> <obj_vnum> <max_exist> <room_vnum>
	'B',

	// C <if_flag> <mob_vnum> <max_exist> <room_vnum>
	'C',

	// D <if_flag> <room_vnum> <exit_dir> <lock_arg> = [1, 2]
	'D',

	// E <if_flag> <obj_vnum> <max_exist> <wear_slot>
	'E',

	// F <if_flag> <op_type> <op_parameter>
	'F',

	// G <if_flag> <obj_vnum> <max_exist>
	'G',

	// H <if_flag> <op_type> <op_parameter>
	'H',

	// I <if_flag> <obj_vnum> <max_exist> <wear_slot>
	'I',

	// J <if_flag> <local_set_number> <load_chance>
	'J',

	// K <if_flag> <mob_vnum> <max_exist> <room_vnum>
	'K',

	// L <if_flag> <loot_min_level> <loot_max_level> 0 <load_target> = 0 (mob) | 1 (obj) | room_vnum
	'L',

	// O <if_flag> <obj_vnum> <amount> <room_vnum>
	'O',

	// M <if_flag> <mob_vnum> <max_exist> <room_vnum>
	'M',

	// P <if_flag> <obj_vnum> <max_exist> <container_vnum>
	'P',

	// R <if_flag> <mob_vnum> <max_exist> <room_vnum>
	'R',

	// T 0 <room_vnum> <exit_dir> <trap_type> <damage>
	// T 1 <trap_type> <damage>
	'T',

	// V <if_flag> = 1 <which_value> = [0 - 3] <new_value>
	'V',

	// X <local_set_number> <wear_slot> <obj_vnum>
	'X',

	// Y <if_flag> <set_number> <load_chance>
	'Y',

	// Z <if_flag> <local_set_number> <load_chance>
	'Z',

	// '?' <if_flag> <chance> <unused> <linked_command_type>
	'?',
]);

const VALIDATED_COMMANDS = [
	// A <if_flag> <room_vnum_start> <room_vnum_end>
	'A',

	// B <if_flag> <obj_vnum> <max_exist> <room_vnum>
	'B',

	// C <if_flag> <mob_vnum> <max_exist> <room_vnum>
	'C',

	// D <if_flag> <room_vnum> <exit_dir> <lock_arg> = [1, 2]
	'D',

	// E <if_flag> <obj_vnum> <max_exist> <wear_slot>
	'E',

	// F <if_flag> <op_type> <op_parameter>
	'F',

	// G <if_flag> <obj_vnum> <max_exist>
	'G',

	// H <if_flag> <op_type> <op_parameter>
	'H',

	// I <if_flag> <obj_vnum> <max_exist> <wear_slot>
	'I',

	// J <if_flag> <local_set_number> <load_chance>
	'J',

	// K <if_flag> <mob_vnum> <max_exist> <room_vnum>
	'K',

	// L <if_flag> <loot_min_level> <loot_max_level> 0 <load_target> = 0 (mob)/1 (obj)/room_vnum
	'L',

	// O <if_flag> <obj_vnum> <amount> <room_vnum>
	'O',

	// M <if_flag> <mob_vnum> <max_exist> <room_vnum>
	'M',

	// P <if_flag> <obj_vnum> <max_exist> <container_vnum>
	'P',

	// R <if_flag> <mob_vnum> <max_exist> <room_vnum>
	'R',

	// T 0 <room_vnum> <exit_dir> <trap_type> <damage>
	'T0',

	// T 1 <trap_type> <damage>
	'T1',

	// V <if_flag> = 1 <which_value> = [0 - 3] <new_value>
	'V',

	// X <local_set_number> <wear_slot> <obj_vnum>
	'X',

	// Y <if_flag> <set_number> <load_chance>
	'Y',

	// Z <if_flag> <local_set_number> <load_chance>
	'Z',

	// 'Q' <if_flag> <chance> <unused> <linked_command_type>
	'Q',
];

// How many elements to slice for each type of command. Cuts out comments/junk while retaining data.
const SLICE_CONFIG = {
	'4': ['A', 'F', 'G', 'H', 'J', 'T1', 'V', 'X', 'Y', 'Z'],
	'5': ['B', 'C', 'D', 'E', 'I', 'K', 'L', 'O', 'M', 'P', 'R', 'Q'],
	'6': ['T0'],
};

const COMMAND_LABELS: {
	[key in string]: {
		a1: string;
		a2?: string;
		a3?: string;
		a4?: string;
		a5?: string;
	};
} = {
	A: {
		a1: 'if_flag',
		a2: 'room_vnum_start',
		a3: 'room_vnum_end',
	},
	B: {
		a1: 'if_flag',
		a2: 'obj_vnum',
		a3: 'max_exist',
		a4: 'room_vnum',
	},
	C: {
		a1: 'if_flag',
		a2: 'mob_vnum',
		a3: 'max_exist',
		a4: 'room_vnum',
	},
	D: {
		a1: 'if_flag',
		a2: 'room_vnum',
		a3: 'exit_dir',
		a4: 'lock_arg',
	},
	E: {
		a1: 'if_flag',
		a2: 'obj_vnum',
		a3: 'max_exist',
		a4: 'wear_slot',
	},
	F: {
		a1: 'if_flag',
		a2: 'op_type',
		a3: 'op_parameter',
	},
	G: {
		a1: 'if_flag',
		a2: 'obj_vnum',
		a3: 'max_exist',
	},
	H: {
		a1: 'if_flag',
		a2: 'op_type',
		a3: 'op_parameter',
	},
	I: {
		a1: 'if_flag',
		a2: 'obj_vnum',
		a3: 'max_exist',
		a4: 'wear_slot',
	},
	J: {
		a1: 'if_flag',
		a2: 'local_set_number',
		a3: 'per_piece_load_chance',
	},
	K: {
		a1: 'if_flag',
		a2: 'mob_vnum',
		a3: 'max_exist',
		a4: 'room_vnum',
	},
	L: {
		a1: 'if_flag',
		a2: 'loot_min_level',
		a3: 'loot_max_level',
		a4: 'help_harm',
		a5: 'load_target',
	},
	M: {
		a1: 'if_flag',
		a2: 'mob_vnum',
		a3: 'max_exist',
		a4: 'room_vnum',
	},
	O: {
		a1: 'if_flag',
		a2: 'obj_vnum',
		a3: 'amount',
		a4: 'room_vnum',
	},
	P: {
		a1: 'if_flag',
		a2: 'obj_vnum',
		a3: 'max_exist',
		a4: 'container_vnum',
	},
	Q: {
		a1: 'if_flag',
		a2: 'chance',
		a4: 'linked_command_type',
	},
	R: {
		a1: 'if_flag',
		a2: 'mob_vnum',
		a3: 'max_exist',
		a4: 'room_vnum',
	},
	T0: {
		a1: 'if_flag',
		a2: 'room_vnum',
		a3: 'exit_dir',
		a4: 'trap_type',
		a5: 'damage',
	},
	T1: {
		a1: 'if_flag',
		a2: 'trap_type',
		a3: 'damage',
	},
	V: {
		a1: 'if_flag',
		a2: 'which_value',
		a3: 'new_value',
	},
	X: {
		a1: 'local_set_number',
		a2: 'wear_slot',
		a3: 'obj_vnum',
	},
	Y: {
		a1: 'if_flag',
		a2: 'global_set_number',
		a3: 'per_piece_load_chance',
	},
	Z: {
		a1: 'if_flag',
		a2: 'local_set_number',
		a3: 'per_piece_load_chance',
	},
};

function isCommandLetter(value: string): value is CommandLetter {
	return isValidValue(value, VALIDATED_COMMANDS);
}

function isCommand<C extends CommandLetter>(
	fullCommand: BaseCommand,
	commandLetter: readonly C[],
): fullCommand is Command[C] {
	return isValidValue(fullCommand.command, commandLetter);
}

export function parseZonefile(filePath: string) {
	// '/home/drew/source/repos/sneezymud/lib/zonefiles/27100'
	const file = fs.readFileSync(filePath, { encoding: 'utf8' });

	// Clean data and convert to an array of lines, with each line a single string
	const lines = file
		// Combine repeated newlines
		.replaceAll(/\n+/g, '\n')
		// Split on newline
		.split('\n')
		// Convert one or more tabs or two or more spaces to a single space
		.map((e) => e.replaceAll(/\t+| {2,}/g, ' '))
		// Remove any empty elements
		.filter((e) => e.trim() !== '');

	// Save zone info
	if (!lines[0]) throw new Error('Unable to parse zone number');
	const start_vnum = Number(lines[0].replace('#', ''));

	if (!lines[1]) throw new Error('Unable to parse zone builder and name');
	let [builder_name, zone_name] = lines[1].split(' - ');

	if (!zone_name) {
		zone_name = builder_name;
		builder_name = '';
	}

	if (!lines[2]) throw new Error('Unable to parse zone info line 3');
	const [end_vnum, reset_timer, reset_type, enabled] = lines[2]
		.split(' ')
		.map(Number);

	if (
		!(
			start_vnum >= 0 &&
			zone_name &&
			end_vnum !== undefined &&
			end_vnum >= start_vnum &&
			reset_timer !== undefined &&
			reset_type !== undefined &&
			enabled !== undefined
		)
	)
		throw new Error(
			`Bad zone info: ${start_vnum}, ${zone_name}, ${end_vnum}, ${reset_timer}, ${reset_type}, ${enabled}`,
		);

	const zone: Zone = {
		builder_name: builder_name ?? '',
		doors: [],
		enabled: !!enabled,
		end_vnum,
		local_sets: {},
		lootable_items: [],
		mobs: [],
		objects: [],
		reset_timer,
		reset_type,
		start_vnum,
		zone_name: zone_name.replace('~', ''),
	};

	const raw_commands = lines
		// Remove non-command lines at beginning
		.slice(3)
		// Remove any spaces between * and command, then split each line on spaces
		.map((line) => line.trim().replaceAll(/\* +/g, '*').split(' '))
		// Filter out any undesired commands or non-command lines using flatMap
		// Slice out only the actual data for each command, drop anything after
		.flatMap((line, index) => {
			if (!line[0]) throw new Error(`Command missing for line ${index}!`);

			const disabled = line[0].startsWith('*');
			let command = line[0].replace('*', '');

			if (command.length > 1 || !RAW_COMMANDS.has(command)) return [];

			// Since there are two types of T commands only differentiated by their
			// if_flag value and their number of valid args, have to convert any
			// T commands found before slicing
			if (command === 'T') command = line[1] === '0' ? 'T0' : 'T1';
			// Convert ? to Q since ? isn't an easy character to work with
			else if (command === '?') command = 'Q';

			if (!isCommandLetter(command))
				throw new Error(
					`Invalid command ${command} made it through filter at line ${index}`,
				);

			let slice: number | undefined = undefined;

			for (const [key, value] of Object.entries(SLICE_CONFIG)) {
				if (value.includes(command)) {
					slice = Number(key);
					break;
				}
			}

			if (!slice)
				throw new Error(`No slice config found for command ${command}!`);

			const config = COMMAND_LABELS[command];

			if (!config)
				throw new Error(
					`No command label config found for command ${command}!`,
				);

			const [a1v, a2v, a3v, a4v, a5v] = line.slice(1, slice);
			const { a1, a2, a3, a4, a5 } = config;

			const output: BaseCommand = {
				command,
				disabled,
			};

			if (a1v) output[a1] = Number(a1v);
			if (a2v && a2) output[a2] = Number(a2v);
			if (a3v && a3) output[a3] = Number(a3v);
			if (a4v && a4) output[a4] = command === 'Q' ? a4v : Number(a4v);
			if (a5v && a5) output[a5] = Number(a5v);

			return output;
		});

	let currentVCmdParent: Command['O' | 'P'] | null = null;
	let mostRecentOCmd: Command['O'] | null = null;

	// First pass merges Q, A, R, H, F, T1, L, and V commands into their linked commands and moves D and X commands into the zone object
	const cmdsAfterFirstPass = raw_commands.flatMap((cmd, index, commands) => {
		if (isCommand(cmd, ['O'])) {
			mostRecentOCmd = cmd;
			return [cmd];
		}

		if (
			!isCommand(cmd, ['Q', 'A', 'M', 'R', 'D', 'X', 'H', 'F', 'T1', 'V', 'L'])
		)
			return [cmd];

		if (cmd.command !== 'V' && currentVCmdParent !== null)
			currentVCmdParent = null;

		const next = commands[index + 1];
		const prev = commands[index - 1];

		const log = (msg: string) =>
			`Zone #${zone.start_vnum}, Command #${index}: ${msg}. Current: ${JSON.stringify(cmd, null, 2)}, Next: ${JSON.stringify(next, null, 2)}, Previous: ${JSON.stringify(prev, null, 2)}`;

		// 'R' commands should be dropped, as they've already been merged into and replaced their linked M command
		if (cmd.command === 'R') return [];

		// 'Q' commands should be embedded within the next command, as it's the one they modify.
		if (cmd.command === 'Q') {
			if (!next) throw new Error(log('Is ? command but next === undefined'));

			if (cmd.if_flag !== 0) throw new Error(log('? command has if_flag 1'));

			if (
				!isCommand(next, ['A', 'B', 'E', 'G', 'I', 'L', 'M', 'O', 'P']) ||
				cmd.linked_command_type !== next.command
			)
				throw new Error(
					log("Is ? command but its linked type !== following command's type"),
				);

			if (next.if_flag !== 1) {
				throw new Error(log('Is after ? command but has if_flag 0'));
			}

			next.chance = cmd.chance;

			// Drop this command
			return [];
		}

		// Doors should get merged into the zone object and dropped
		if (cmd.command === 'D') {
			const { disabled, exit_dir, if_flag, lock_arg, room_vnum } = cmd;

			if (if_flag !== 0) throw new Error(log('D command has if_flag 1'));

			if (!(lock_arg >= 0 && lock_arg <= 2))
				throw new Error(
					log('D command has invalid lock_arg. Value should be 0, 1, or 2.'),
				);

			zone.doors.push({
				disabled,
				exit_dir,
				lock_arg,
				room_vnum,
			});

			return [];
		}

		// 'A' commands should be embedded within the next command, as it's the one they modify.
		if (cmd.command === 'A') {
			if (!next) throw new Error(log('Is A command but next === undefined'));

			if (!isCommand(next, ['B', 'M', 'O']))
				throw new Error(
					log(
						'Is A command but the following command is not a valid child command type',
					),
				);

			// Throw if following command's final arg isn't -99, as that's the only acceptable syntax for the command following an A command
			if (next.room_vnum !== -99) {
				throw new Error(
					log(
						`The command following an A command's room_vnum isn't set to -99`,
					),
				);
			}

			const { chance, disabled, if_flag, room_vnum_end, room_vnum_start } = cmd;

			if (disabled && !next.disabled)
				throw new Error(log('A command disabled but next command enabled'));

			if (room_vnum_start >= room_vnum_end)
				throw new Error(log('A command has invalid room range'));

			if (chance && if_flag === 0)
				throw new Error(log('A command has chance and if_flag 0'));

			if (if_flag === 1 && next.if_flag !== 1)
				throw new Error(
					log('A command has if_flag 1 but next command has if_flag 0'),
				);

			// An A command that follows a Q command would have inherited its chance value, so pass that on to the A's child command
			if (chance) next.chance = chance;

			next.room_vnum = 'random';
			next.randomized_room_range = {
				disabled,
				room_vnum_end,
				room_vnum_start,
			};

			// Drop this command
			return [];
		}

		// 'F' and 'H' commands should always follow an M command and be embedded within it
		if (cmd.command === 'F' || cmd.command === 'H') {
			const prev = commands[index - 1];

			if (!prev) throw new Error(log('Is F/H command but prev === undefined'));

			if (prev.command !== 'M')
				throw new Error(
					log('Is F/H command but prev command is not an M command'),
				);

			const { command, if_flag, op_parameter, op_type } = cmd;

			if (if_flag === 0) throw new Error(log('F/H command has if_flag 0'));

			if (op_type < 1 || op_type > 7)
				throw new Error(log('F/H command has invalid op_type'));

			if (prev['hates'] || prev['fears'])
				throw new Error(log('M command already has a fears or hates property'));

			prev[command === 'F' ? 'fears' : 'hates'] = {
				op_parameter,
				op_type,
			};

			return [];
		}

		// An 'R' command always follows an 'M' command, but the actual mob loaded
		// via 'R' is the one that should be kept. So convert the following 'R' to an
		// 'M' with the previous 'M' values merged into the new 'M' values as its
		// 'rider' property, and replace this 'M' command with it.
		if (cmd.command === 'M') {
			// Only care about 'M' commands that are followed by 'R' commands in this pass
			if (next?.command !== 'R' || !isCommand(next, ['R'])) return [cmd];

			if (next.if_flag === 0) throw new Error(log('R command has if_flag 0'));

			if (cmd.room_vnum !== next.room_vnum)
				throw new Error(
					log(`R command's room_vnum !== linked M command's room_vnum`),
				);

			if (cmd.disabled !== next.disabled)
				throw new Error(
					log(
						`R command's disabled state doesn't match linked M command's disabled state`,
					),
				);

			return [
				{
					...cmd,
					disabled: next.disabled,
					max_exist: next.max_exist,
					mob_vnum: next.mob_vnum,
					riding: {
						disabled: cmd.disabled,
						max_exist: cmd.max_exist,
						mob_vnum: cmd.mob_vnum,
					},
				},
			];
		}

		// Local suit sets should be added to the zone object and dropped
		if (cmd.command === 'X') {
			const { disabled, local_set_number, obj_vnum, wear_slot } = cmd;

			const set =
				zone.local_sets[local_set_number] ??
				(zone.local_sets[local_set_number] = []);

			set.push({ disabled, obj_vnum, wear_slot });
			return [];
		}

		// Traps on objects should be merged into their linked O command and dropped
		if (cmd.command === 'T1') {
			const { damage, disabled, trap_type } = cmd;

			if (trap_type < 1 || trap_type > 15)
				throw new Error(log('Door trap type out of range'));

			if (!prev) throw new Error(log('T1 command has no previous command'));

			if (!isCommand(prev, ['O']))
				throw new Error(log('T1 command has no valid parent command'));

			prev.trap = {
				damage,
				disabled,
				trap_type,
			};

			return [];
		}

		// Merge V commands into linked O or P commands. V commands can be linked to other V commands, so the currentVCmdParent variable is used to keep track of the last O or P command that was encountered.
		if (cmd.command === 'V') {
			const { disabled, if_flag, new_value, which_value } = cmd;

			if (if_flag !== 1) throw new Error(log('V command has if_flag 0'));

			if (which_value < 0 || which_value > 3)
				throw new Error(log('V command has invalid which_value'));

			if (!prev) throw new Error(log('V command has no previous command'));

			if (!isCommand(prev, ['O', 'P', 'V']))
				throw new Error(log('V command has no valid parent command'));

			if (prev.command !== 'V') currentVCmdParent = prev;

			const modifiedValues =
				prev.command === 'V'
					? currentVCmdParent?.modified_values
					: prev.modified_values ?? (prev.modified_values = []);

			if (!modifiedValues)
				throw new Error(
					log(
						'V command linked to previous V command but currentVCmdParent === null',
					),
				);

			modifiedValues.push({
				disabled,
				new_value,
				which_value,
			});

			return [];
		}

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (cmd.command === 'L') {
			if (mostRecentOCmd === null)
				throw new Error(log('L command has no linked O command'));

			if (mostRecentOCmd.random_loot)
				throw new Error(
					log('Current O command already has random loot defined'),
				);

			const {
				chance,
				disabled,
				if_flag,
				load_target,
				loot_max_level,
				loot_min_level,
			} = cmd;

			if (if_flag !== 1) throw new Error(log('L command has if_flag 0'));

			mostRecentOCmd.random_loot = {
				chance,
				disabled,
				load_target,
				loot_max_level,
				loot_min_level,
			};

			return [];
		}

		throw new Error(log('Reached unhandled command in second pass'));
	});

	if (
		cmdsAfterFirstPass.some(({ command }) =>
			['A', 'D', 'F', 'H', 'L', 'Q', 'R', 'T1', 'V', 'X'].includes(command),
		)
	)
		throw new Error('Unexpected command remaining after first pass');

	let currentPCmdParent: Command['B' | 'E' | 'G' | 'O'] | null = null;
	let currentNestedP: Command['P'] | null = null;

	// Have to process P commands nested within other P commands first
	let cmdsAfterSecondPass = cmdsAfterFirstPass.flatMap(
		(cmd, index, commands) => {
			if (!isCommand(cmd, ['P'])) {
				if (isCommand(cmd, ['B', 'G', 'O', 'E'])) currentPCmdParent = cmd;
				return [cmd];
			}

			const log = (msg: string, parent?: object) =>
				`Zone #${zone.start_vnum}, Command #${index}: ${msg}. Command: ${JSON.stringify(cmd, null, 2)}, Parent: ${JSON.stringify(parent, null, 2)}`;

			if (!currentPCmdParent)
				throw new Error(log('P command has no linked parent command'));

			const {
				chance,
				container_vnum,
				contains,
				disabled,
				if_flag,
				max_exist,
				modified_values,
				obj_vnum,
			} = cmd;

			if (if_flag !== 1) throw new Error(log('P command has if_flag 0'));

			// Don't nest P commands in O/G/B commands yet until nested Ps have been processed. This pass is only concerned with P commands that should be nested within other P commands (e.g. gem in a pouch in a chest)
			if (container_vnum === currentPCmdParent.obj_vnum) {
				// When a new P command that belongs inside an O/G/B command is encountered, reset the currentNestedP variable
				if (currentNestedP) currentNestedP = null;
				return [cmd];
			}

			const prev = commands[index - 1];

			if (!prev || !isCommand(prev, ['P']))
				throw new Error(log('Nested P command has no previous P command'));

			const item: PlacedItem = {
				disabled,
				max_exist,
				obj_vnum,
			};

			if (modified_values) item.modified_values = modified_values;
			if (chance) item.chance = chance;
			if (contains) item.contains = contains;

			if (prev.obj_vnum !== container_vnum) {
				// Sometimes multiple P commands are nested within the same parent P command, so check if the current P command's container_vnum matches the parent P command's obj_vnum
				if (
					currentNestedP?.obj_vnum === container_vnum &&
					currentNestedP.contains
				) {
					currentNestedP.contains.push(item);
					return [];
				}

				throw new Error(
					log(
						'Nested P command has different container_vnum than parent P command and current nested P command',
						prev,
					),
				);
			}

			currentNestedP = prev;

			const items = prev.contains ?? (prev.contains = []);
			items.push(item);
			return [];
		},
	);

	currentPCmdParent = null;

	// Second phase of second pass merges remaining P and T0 commands into their linked commands. T0 is done here because it can't be processed until all D commands are handled, which is done in the first pass. P is done here because it can't be processed until any V commands that modify a P command are handled, which is done in the first pass. All remaining command types must be done in later passes, because they can't be processed until all P commands or P-parents are handled. P commands that are nested within other P commands should already have been processed by this point.
	cmdsAfterSecondPass = cmdsAfterSecondPass.flatMap((cmd, index) => {
		// Keep track of most recently seen parent command of type P,
		// as P commands are very often not linked directly to their parent command
		if (!isCommand(cmd, ['T0', 'P'])) {
			if (isCommand(cmd, ['B', 'G', 'O', 'E'])) currentPCmdParent = cmd;
			return [cmd];
		}

		const log = (msg: string, parent?: object) =>
			`Zone #${zone.start_vnum}, Command #${index}: ${msg}. Command: ${JSON.stringify(cmd, null, 2)}, Parent: ${JSON.stringify(parent, null, 2)}`;

		// Merge door traps into their respective door objects in the zone object
		if (cmd.command === 'T0') {
			const { damage, disabled, exit_dir, room_vnum, trap_type } = cmd;

			if (trap_type < 1 || trap_type > 15)
				throw new Error(log('Door trap type out of range'));

			const door = zone.doors.find(
				(door) => door.room_vnum === room_vnum && door.exit_dir === exit_dir,
			);

			if (!door)
				throw new Error(
					log(
						`Matching door not found in zone for door trap. Zone: ${JSON.stringify(zone, null, 2)}`,
					),
				);

			door.trap = {
				damage,
				disabled,
				trap_type,
			};

			return [];
		}

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (cmd.command === 'P') {
			if (!currentPCmdParent)
				throw new Error(log('P command has no linked parent command'));

			const {
				chance,
				container_vnum,
				contains,
				disabled,
				if_flag,
				max_exist,
				modified_values,
				obj_vnum,
			} = cmd;

			if (if_flag !== 1) throw new Error(log('P command has if_flag 0'));

			// By this point all remaining P commands should be nested within O/B/G containers, so throw if the container_vnum doesn't match the parent command's obj_vnum
			if (container_vnum !== currentPCmdParent.obj_vnum)
				throw new Error(
					log(
						'P command has different container_vnum than parent command',
						currentPCmdParent,
					),
				);

			const item: PlacedItem = {
				disabled,
				max_exist,
				obj_vnum,
			};

			if (modified_values) item.modified_values = modified_values;
			if (chance) item.chance = chance;
			if (contains) item.contains = contains;

			const items =
				currentPCmdParent.contains ?? (currentPCmdParent.contains = []);
			items.push(item);
			return [];
		}

		throw new Error(log('Reached unhandled command in second pass'));
	});

	currentPCmdParent = null;

	if (cmdsAfterSecondPass.some(({ command }) => ['P', 'T0'].includes(command)))
		throw new Error('Unexpected command remaining after second pass');

	// The most recently seen command that is modified by the commands processed in the third pass. This is used to link the commands to their parent command, as these commands are often not directly linked to their parent command.
	let currentThirdPassRoot: Command['C' | 'K' | 'M'] | null = null;

	// Third pass processes E/G/I/J/Y/Z commands, as those commands modify C/K/M commands and must be processed before those commands can be processed.
	const cmdsAfterThirdPass = cmdsAfterSecondPass.flatMap((cmd, index) => {
		if (!isCommand(cmd, ['E', 'G', 'I', 'J', 'Y', 'Z', 'O', 'B'])) {
			if (isCommand(cmd, ['M', 'K', 'C'])) currentThirdPassRoot = cmd;
			return [cmd];
		}

		const log = (msg: string, parent?: object) =>
			`Zone #${zone.start_vnum}, Command #${index}: ${msg}. Command: ${JSON.stringify(cmd, null, 2)}, Parent: ${JSON.stringify(parent, null, 2)}`;

		if (cmd.command === 'B') {
			const {
				chance,
				contains,
				disabled,
				if_flag,
				obj_vnum,
				randomized_room_range,
				room_vnum,
			} = cmd;

			if (chance && if_flag === 0)
				throw new Error(log('B command has chance and if_flag 0'));

			const item: LootableItem = {
				disabled,
				obj_vnum,
				room_vnum,
			};

			if (contains) item.contains = contains;
			if (chance) item.chance = chance;
			if (randomized_room_range)
				item.randomized_room_range = randomized_room_range;

			zone.lootable_items.push(item);
			return [];
		}

		if (cmd.command === 'O') {
			const {
				amount,
				chance,
				contains,
				disabled,
				if_flag,
				modified_values,
				obj_vnum,
				random_loot,
				randomized_room_range,
				room_vnum,
				trap,
			} = cmd;

			if (chance && if_flag === 0)
				throw new Error(log('O command has chance and if_flag 0'));

			const item: ObjectInRoom = {
				amount,
				disabled,
				obj_vnum,
				room_vnum,
			};

			if (contains) item.contains = contains;
			if (chance) item.chance = chance;
			if (modified_values) item.modified_values = modified_values;
			if (random_loot) item.random_loot = random_loot;
			if (randomized_room_range)
				item.randomized_room_range = randomized_room_range;
			if (trap) item.trap = trap;

			zone.objects.push(item);
			return [];
		}

		if (!currentThirdPassRoot)
			throw new Error(
				log(
					'Encountered third pass E/I/G/J/Y/Z command with no current parent command',
				),
			);

		if (cmd.command === 'E' || cmd.command === 'I') {
			const {
				chance,
				command,
				contains,
				disabled,
				if_flag,
				max_exist,
				obj_vnum,
				wear_slot,
			} = cmd;

			if (chance && if_flag === 0)
				throw new Error(log('E/I command has chance and if_flag 0'));

			if (wear_slot < 1 || wear_slot > 19)
				throw new Error(log('E/I command has invalid wear_slot'));

			const item: WornItem = {
				disabled,
				isProp: command === 'I',
				max_exist,
				obj_vnum,
				wear_slot,
			};

			if (chance) item.chance = chance;
			if (contains) item.contains = contains;

			const loads =
				currentThirdPassRoot.loads ?? (currentThirdPassRoot.loads = {});
			const items = loads.items ?? (loads.items = {});
			const worn = items.worn ?? (items.worn = []);
			worn.push(item);
			return [];
		}

		if (cmd.command === 'G') {
			const { chance, contains, disabled, if_flag, max_exist, obj_vnum } = cmd;

			if (chance && if_flag === 0)
				throw new Error(log('G command has chance and if_flag 0'));

			const item: InventoryItem = {
				disabled,
				max_exist,
				obj_vnum,
			};

			if (contains) item.contains = contains;
			if (chance) item.chance = chance;

			const loads =
				currentThirdPassRoot.loads ?? (currentThirdPassRoot.loads = {});
			const items = loads.items ?? (loads.items = {});
			const inventory = items.inventory ?? (items.inventory = []);
			inventory.push(item);
			return [];
		}

		if (cmd.command === 'J' || cmd.command === 'Z') {
			const {
				command,
				disabled,
				if_flag,
				local_set_number,
				per_piece_load_chance,
			} = cmd;

			if (if_flag === 1) throw new Error(log('J/Z command has if_flag 1'));

			if (!zone.local_sets[local_set_number])
				throw new Error(
					log(
						`J/Z command has local_set_number that doesn't exist in zone.local_sets`,
						zone,
					),
				);

			const set: LocalEqSet = {
				disabled,
				isProp: command === 'J',
				local_set_number,
				per_piece_load_chance,
			};

			const loads =
				currentThirdPassRoot.loads ?? (currentThirdPassRoot.loads = {});
			const sets = loads.sets ?? (loads.sets = {});
			const localSets = sets.local ?? (sets.local = []);
			localSets.push(set);
			return [];
		}

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (cmd.command === 'Y') {
			const { disabled, global_set_number, if_flag, per_piece_load_chance } =
				cmd;

			if (if_flag === 1) throw new Error(log('Y command has if_flag 1'));

			const set: GlobalEqSet = {
				disabled,
				global_set_number,
				per_piece_load_chance,
			};

			const loads =
				currentThirdPassRoot.loads ?? (currentThirdPassRoot.loads = {});
			const sets = loads.sets ?? (loads.sets = {});
			const globalSets = sets.global ?? (sets.global = []);
			globalSets.push(set);
			return [];
		}

		throw new Error(log('Reached unhandled command in third pass'));
	});

	if (
		cmdsAfterThirdPass.some(({ command }) =>
			['B', 'E', 'G', 'I', 'J', 'O', 'Y', 'Z'].includes(command),
		)
	)
		throw new Error('Unexpected command remaining after third pass');

	let mostRecentMCmd: Command['M'] | null = null;

	const final = cmdsAfterThirdPass.flatMap((cmd, index) => {
		if (isCommand(cmd, ['M'])) {
			mostRecentMCmd = cmd;
			return [cmd];
		}

		const log = (msg: string, parent?: object) =>
			`Zone #${zone.start_vnum}, Command #${index}: ${msg}. Command: ${JSON.stringify(cmd, null, 2)}, Parent: ${JSON.stringify(parent, null, 2)}`;

		if (!isCommand(cmd, ['C', 'K']))
			throw new Error(log('Unexpected command type in final pass'));

		if (!mostRecentMCmd)
			throw new Error(
				log(
					'mostRecentMCmd === null when processing C/K command in final pass',
				),
			);

		const {
			command,
			disabled,
			if_flag,
			loads,
			max_exist,
			mob_vnum,
			room_vnum,
		} = cmd;

		if (if_flag !== 1) console.warn(log('C/K command has if_flag 0'));

		if (room_vnum !== mostRecentMCmd.room_vnum)
			throw new Error(
				log(
					'C/K command room_vnum !== mostRecentMCmd room_vnum',
					mostRecentMCmd,
				),
			);

		if (disabled !== mostRecentMCmd.disabled)
			throw new Error(
				log('C/K command disabled !== mostRecentMCmd disabled', mostRecentMCmd),
			);

		const follower: Follower = {
			disabled,
			isCharmed: command === 'C',
			max_exist,
			mob_vnum,
		};

		if (loads) follower.loads = loads;

		const followers =
			mostRecentMCmd.followers ?? (mostRecentMCmd.followers = []);
		followers.push(follower);
		return [];
	});

	for (const cmd of final) {
		if (!isCommand(cmd, ['M']))
			throw new Error('Unexpected command type in final pass');

		const {
			chance,
			disabled,
			followers,
			if_flag,
			loads,
			max_exist,
			mob_vnum,
			randomized_room_range,
			riding,
			room_vnum,
		} = cmd;

		if (chance && if_flag === 0)
			throw new Error('M command has chance and if_flag 0');

		const mob: Mob = {
			disabled,
			max_exist,
			mob_vnum,
			room_vnum,
		};

		if (chance) mob.chance = chance;
		if (followers) mob.followers = followers;
		if (loads) mob.loads = loads;
		if (randomized_room_range)
			mob.randomized_room_range = randomized_room_range;
		if (riding) mob.riding = riding;

		zone.mobs.push(mob);
	}

	console.log(`Zone ${zone.start_vnum} finished parsing. Writing to file.`);

	fs.writeFileSync(
		`./data/zonefiles/json/zone_${zone.start_vnum}_commands.json`,
		JSON.stringify(zone, null, '\t'),
		{
			encoding: 'utf8',
		},
	);
}

export function parseZonefiles(dir = './data/zonefiles/original') {
	fs.readdir(dir, (err, files) => {
		if (err) throw err;

		for (const file of files) parseZonefile(path.join(dir, file));
	});
}
