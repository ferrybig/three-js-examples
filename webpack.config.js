'use strict';

const webpack = require("webpack");
const fs = require("fs");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MinifyPlugin = require("babel-minify-webpack-plugin");

const entryPoints = {};
const files = [];
const htmlPlugins = [];
fs.readdirSync('./src/js/examples').forEach(file => {
	const baseName = file.slice(0, -3);
	entryPoints[baseName] = './src/js/examples/' + file;
	htmlPlugins.push(new HtmlWebpackPlugin({
		inject: false,
		chunks: ['common', 'threejs', baseName],
		filename: baseName + '.html',
		template: 'src/index.ejs',
		title: baseName,
	}));
	files.push({
		name: baseName,
		url: baseName + ".html",
	});
});
htmlPlugins.push(new HtmlWebpackPlugin({
		inject: false,
		chunks: [],
		filename: 'index.html',
		template: 'src/listing.ejs',
		title: 'Three JS examples',
		examples: files,
	}));

module.exports = {
	devtool: 'eval-source-map',
	entry: entryPoints,
	output: {
		filename: '[name].js',
		path: __dirname + '/dist',
		libraryTarget: 'var',
		library: 'ThreeDemo',
	},
	resolve: {
		alias: {
			src: path.resolve('./src'),
			js: path.resolve('./src/js'),
			assets: path.resolve('./src/assets'),
		},
		extensions: ['.js'],
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin({
			name: 'threejs',
			minChunks: function (module) {
				return module.context && module.context.includes("node_modules") && module.context.includes("three");
			}}),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'common',
			minChunks: function (module) {
				return module.context && module.context.includes("node_modules") && !module.context.includes("three");
			}}),
		...htmlPlugins,
		//new MinifyPlugin({}, {}),
	],
	module: {
		rules: [
			{
				test: /\.(gif|png|jpe?g|svg)$/i,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'assets/img/[name].[ext]'
						}
					},
					{
						loader: 'image-webpack-loader',
						options: {
							bypassOnDebug: true,
						},
					},
				],
			},
			{
				test: /\.(ogv)$/i,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'assets/other/[name].[ext]'
						}
					},
				],
			},
			{
				test: /\.js/,
				exclude: /(node_modules|bower_components)/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							
							presets: [[require("babel-preset-minify"), {mangle: {
								topLevel: true
							},}]],
						},
					},
				],
			},
		],
	}
};
