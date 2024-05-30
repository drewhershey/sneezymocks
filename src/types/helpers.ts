export function isValidValue<T>(
	value: unknown,
	validValues: T[] | readonly T[],
): value is T {
	for (const validValue of validValues) {
		if (
			value === validValue ||
			(typeof value === 'string' &&
				typeof validValue === 'string' &&
				value.toLowerCase() === validValue.toLowerCase())
		)
			return true;
	}

	return false;
}

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export function getKeys<T extends object>(obj: T): Array<keyof T> {
	const output: Array<keyof T> = new Array<keyof T>();

	for (const key in obj) {
		output.push(key);
	}

	return output;
}

export function isKeyOf<T extends object>(
	obj: T,
	key: number | string | symbol,
): key is keyof T {
	return key in obj;
}
