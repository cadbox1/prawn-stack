const withMDX = require("@next/mdx")({
	extension: /\.mdx$/,
});

const isDevelopment = process.env.NODE_ENV !== "production";
const rewritesConfig = isDevelopment
	? [
			{
				source: "/api/:path*",
				destination: "http://api:3001/api/:path*",
			},
	  ]
	: [];

module.exports = withMDX({
	pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
	rewrites: async () => rewritesConfig,
});
