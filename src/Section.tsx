import Divider from './Divider';

export default function Section({
	children,
	sectionName,
}: {
	readonly children: React.ReactNode;
	readonly sectionName: string;
}) {
	return (
		<>
			<h2 className="text-lg font-semibold">{sectionName}</h2>
			<Divider />

			<div className="mx-4 md:max-w-fit">{children}</div>
		</>
	);
}
