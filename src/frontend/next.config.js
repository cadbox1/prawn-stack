const withMDX = require("@next/mdx")({
	extension: /\.mdx$/,
});

const { createVanillaExtractPlugin } = require("@vanilla-extract/next-plugin");
const withVanillaExtract = createVanillaExtractPlugin();

const isDevelopment = process.env.NODE_ENV !== "production";
const rewritesConfig = isDevelopment
	? [
			{
				source: "/api/:path*",
				destination: "http://api:3001/api/:path*",
			},
	  ]
	: [];

const nextConfig = {
	pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
	rewrites: async () => rewritesConfig,
};

module.exports = withVanillaExtract(withMDX(nextConfig));
