export default function LabeledInput({
	handleChange,
	label,
	name,
	value,
}: {
	readonly handleChange: React.ChangeEventHandler<HTMLInputElement>;
	readonly label: string;
	readonly name: string;
	readonly value: number | string;
}) {
	return (
		<>
			<input
				className="ml-1 w-[3ch] rounded border-none bg-zinc-200 p-1 text-center text-black"
				maxLength={2}
				name={name}
				onChange={handleChange}
				type="text"
				value={value}
			/>
			<span>{label}</span>
		</>
	);
}
