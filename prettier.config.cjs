/** @type {import("prettier").Config} */
const config = {
	overrides: [
		{
			files: '*.xml',
			options: {
				xmlWhitespaceSensitivity: 'ignore',
			},
		},
	],
	plugins: ['@prettier/plugin-xml', 'prettier-plugin-tailwindcss'],
	singleAttributePerLine: true,
	singleQuote: true,
	useTabs: true,
};

module.exports = config;
