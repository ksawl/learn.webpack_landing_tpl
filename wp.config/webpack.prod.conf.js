const baseWabpackConfig = require("./webpack.base.conf");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");

const PATHS = baseWabpackConfig.externals.paths;
const isDev = true;
const isProd = !isDev;
const filename = (ext = "") => {
    return ext.length > 0
        ? `${PATHS.assetsDirName}/${ext}/[name].[hash].${ext}`
        : "[path][name].[hash].[ext]";
};
const fileid = (ext) => `${PATHS.assetsDirName}/${ext}/[id].[hash].${ext}`;

module.exports = {
    mode: "production",
    output: {
        filename: filename("js"),
    },
    devtool: false,
    optimization: {
        minimizer: [
            new OptimizeCssAssetsWebpackPlugin({
                assetNameRegExp: /\.css$/g,
                cssProcessor: require("cssnano"),
                cssProcessorPluginOptions: {
                    preset: [
                        "default",
                        { discardComments: { removeAll: true } },
                    ],
                },
                canPrint: true,
            }),
            new TerserWebpackPlugin(),
        ],
    },
    plugins: [
        new HTMLWebpackPlugin({
            hash: false,
            template: `${PATHS.srcAssets}/index.html`,
            filename: "./index.html",
            minify: {
                collapseWhitespace: isProd,
            },
        }),
        new MiniCssExtractPlugin({
            filename: filename("css"),
            chunkFilename: fileid("css"),
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: "../../",
                            hmr: isDev,
                            reloadAll: true,
                        },
                    },
                    { loader: "css-loader", options: { sourceMap: isDev } },
                    {
                        loader: "postcss-loader",
                        options: {
                            sourceMap: isDev,
                        },
                    },
                ],
            },
            {
                test: /\.s[ac]ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: "../../",
                            hmr: isDev,
                            reloadAll: true,
                        },
                    },
                    { loader: "css-loader", options: { sourceMap: isDev } },
                    {
                        loader: "postcss-loader",
                        options: {
                            sourceMap: isDev,
                        },
                    },
                    {
                        loader: "resolve-url-loader",
                        options: {
                            sourceMap: isDev,
                        },
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            // Prefer `dart-sass`
                            implementation: require("sass"),
                            sourceMap: isDev,
                        },
                    },
                ],
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: filename(),
                        },
                    },
                    {
                        loader: "image-webpack-loader",
                        options: {
                            mozjpeg: {
                                progressive: true,
                                quality: 65,
                            },
                            // optipng.enabled: false will disable optipng
                            optipng: {
                                enabled: true,
                            },
                            pngquant: {
                                quality: [0.65, 0.9],
                                speed: 4,
                            },
                            gifsicle: {
                                interlaced: true,
                            },
                            // the webp option will enable WEBP
                            // Compress JPG & PNG images into WEBP
                            // webp: {
                            //     quality: 75,
                            // },
                        },
                    },
                ],
            },
            {
                test: /\.(woff2?|ttf|otf|eot)$/,
                exclude: /node_modules/,
                loader: "file-loader",
                options: {
                    name: filename(),
                },
            },
        ],
    },
};
