function factorial(n: number) {
	let result = 1;
	for (let i = 2; i <= n; i++) {
		result *= i;
	}
	return result;
}

function binomialCoefficient(n: number, k: number) {
	return factorial(n) / (factorial(k) * factorial(n - k));
}

function binomialProbability({
	numSuccesses,
	successChancePerAttempt,
	totalAttempts,
}: {
	readonly numSuccesses: number;
	readonly successChancePerAttempt: number;
	readonly totalAttempts: number;
}) {
	return (
		binomialCoefficient(totalAttempts, numSuccesses) *
		Math.pow(successChancePerAttempt, numSuccesses) *
		Math.pow(1 - successChancePerAttempt, totalAttempts - numSuccesses)
	);
}

export function probabilityAtLeast({
	numSuccesses,
	successChancePerAttempt,
	totalAttempts,
}: {
	readonly numSuccesses: number;
	readonly successChancePerAttempt: number;
	readonly totalAttempts: number;
}) {
	let probability = 0;
	for (let i = numSuccesses; i <= totalAttempts; i++) {
		probability += binomialProbability({
			numSuccesses: i,
			successChancePerAttempt,
			totalAttempts,
		});
	}
	return Math.round(probability * 10_000) / 100;
}

export function chanceToLoad({
	chanceToLoadPerPiece,
	totalNumberOfPiecesInSet,
}: {
	readonly chanceToLoadPerPiece: number;
	readonly totalNumberOfPiecesInSet: number;
}) {
	let output = '';

	for (let i = 1; i <= totalNumberOfPiecesInSet; i++) {
		let probability = probabilityAtLeast({
			numSuccesses: i,
			successChancePerAttempt: chanceToLoadPerPiece,
			totalAttempts: totalNumberOfPiecesInSet,
		});

		if (probability > 1) probability = Math.round(probability);
		else {
			output += `${i}+ pieces: less than 1%\n`;
			break;
		}

		output += `${i} pieces: ${probability}%\n`;
	}

	return output;
}
