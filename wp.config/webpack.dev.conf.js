const baseWabpackConfig = require("./webpack.base.conf");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const PATHS = baseWabpackConfig.externals.paths;
const isDev = true;
const isProd = !isDev;
const filename = (ext) => `${PATHS.assetsDirName}/${ext}/[name].${ext}`;
const fileid = (ext) => `${PATHS.assetsDirName}/${ext}/[id].${ext}`;

module.exports = {
    mode: "development",
    output: {
        filename: filename("js"),
    },
    devtool: "#cheap-module-eval-source-map",
    devServer: {
        port: 8081,
        hot: true,
        contentBase: PATHS.dist,
        overlay: {
            warnings: false,
            errors: true,
        },
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: filename("css"),
            chunkFilename: fileid("css"),
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: "[file].map",
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
                loader: "file-loader",
                options: {
                    name: `[name].[ext]`,
                    outputPath: `${PATHS.assetsDirName}/img`,
                    useRelativePath: true,
                },
            },
            {
                test: /\.(ttf|eot|woff2)$/i,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            outputPath: `${PATHS.assetsDirName}/fonts`,
                            useRelativePath: true,
                        },
                    },
                ],
            },
        ],
    },
};
