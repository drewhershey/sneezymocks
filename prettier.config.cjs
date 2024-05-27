/** @type {import("prettier").Config} */
const config = {
	overrides: [
		{
			files: "*.xml",
			options: {
				xmlWhitespaceSensitivity: "ignore",
			},
		},
	],
	plugins: ["@prettier/plugin-xml"],
	singleAttributePerLine: true,
	useTabs: true,
	singleQuote: true,
};

module.exports = config;
