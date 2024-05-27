import { useState } from 'react';

import LabeledInput from './LabeledInput';
import { chanceToLoad } from './utils/chance-to-load-set-pieces';

export default function ChanceToLoadSet() {
	const [{ chance, piecesInSet }, setState] = useState({
		chance: 0,
		piecesInSet: 0,
	});

	const handleChange = ({
		target: { name, value },
	}: React.ChangeEvent<HTMLInputElement>) => {
		setState((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const chanceToLoadPerPiece = chanceToLoad({
		chanceToLoadPerPiece: Number(chance) / 100,
		totalNumberOfPiecesInSet: Number(piecesInSet),
	});

	return (
		<>
			<div className="grid grid-cols-[auto,1fr] items-center gap-2 text-nowrap">
				<h4 className="col-span-full text-left font-semibold">
					Chance to Load At Least X Pieces
				</h4>
				<LabeledInput
					handleChange={handleChange}
					label="% chance per piece"
					name="chance"
					value={chance}
				/>
				<LabeledInput
					handleChange={handleChange}
					label="pieces in set"
					name="piecesInSet"
					value={piecesInSet}
				/>
			</div>
			{chance > 0 && piecesInSet > 0 && (
				<pre className="mt-4 rounded bg-zinc-600 p-2">
					{chanceToLoadPerPiece}
				</pre>
			)}
		</>
	);
}
