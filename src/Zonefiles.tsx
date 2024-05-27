import ChanceToLoad from './ChanceToLoadSet';
import Section from './Section';
import ZonefileCommandSection from './ZonefileCommandSection';

export default function Zonefiles() {
	return (
		<Section sectionName="Zonefiles">
			<ZonefileCommandSection
				commandExample="Y 0 set_number load_chance"
				commandLetter="Y"
			>
				<ChanceToLoad />
			</ZonefileCommandSection>
		</Section>
	);
}
