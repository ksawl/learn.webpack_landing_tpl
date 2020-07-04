const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");

const PATHS = {
    assetsDirName: "assets",
    distDirName: "dist",
    src: path.join(__dirname, "../src"),
    srcAssets: path.join(__dirname, "../src/assets"),
    dist: path.join(__dirname, "../dist"),
};

module.exports = {
    externals: {
        paths: PATHS,
    },
    context: PATHS.src,
    entry: {
        app: ["@babel/polyfill", "./index.js"],
    },
    output: {
        path: PATHS.dist,
        publicPath: "/",
    },
    resolve: {
        alias: {
            "@assets": PATHS.srcAssets,
            "@": PATHS.src,
        },
    },
    optimization: {
        splitChunks: {
            chunks: "all",
        },
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HTMLWebpackPlugin({
            hash: false,
            template: `${PATHS.srcAssets}/index.html`,
            filename: "./index.html",
        }),
        new CopyWebpackPlugin({
            patterns: [{ from: `${PATHS.srcAssets}/static`, to: "" }],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                        plugins: ["@babel/plugin-proposal-class-properties"],
                    },
                },
            },
        ],
    },
};
