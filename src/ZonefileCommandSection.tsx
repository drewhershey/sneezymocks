export default function ZonefileCommandSection({
	children,
	commandExample,
	commandLetter,
}: {
	readonly children: React.ReactNode;
	readonly commandExample: string;
	readonly commandLetter: string;
}) {
	return (
		<>
			<span className="flex items-center justify-between py-2 md:w-full md:gap-x-4">
				<h3 className="font-semibold">{commandLetter} Command</h3>
				<pre className="text-sm">({commandExample})</pre>
			</span>

			<div className="flex flex-col rounded bg-zinc-700 p-4">{children}</div>
		</>
	);
}
