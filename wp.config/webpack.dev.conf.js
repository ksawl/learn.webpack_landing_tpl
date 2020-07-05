const baseWabpackConfig = require("./webpack.base.conf");
const webpack = require("webpack");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const PATHS = baseWabpackConfig.externals.paths;
const isDev = true;
const isProd = !isDev;
const filename = (ext = "") => {
    return ext.length > 0
        ? `${PATHS.assetsDirName}/${ext}/[name].${ext}`
        : "[path][name].[ext]";
};
const fileid = (ext) => `${PATHS.assetsDirName}/${ext}/[id].${ext}`;

const cssLoader = (extra) => {
    const ret = [
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
                ident: "postcss",
                plugins: [
                    require("cssnano")({
                        preset: [
                            "default",
                            {
                                discardComments: {
                                    removeAll: true,
                                },
                            },
                        ],
                    }),
                ],
                sourceMap: isDev,
            },
        },
    ];

    if (extra) {
        Array.prototype.push.apply(ret, extra);
    }

    return ret;
};

module.exports = {
    mode: "development",
    output: {
        filename: filename("js"),
    },
    devtool: "#cheap-module-eval-source-map",
    devServer: {
        port: 8081,
        contentBase: PATHS.dist,
        overlay: {
            warnings: false,
            errors: true,
        },
    },
    plugins: [
        new HTMLWebpackPlugin({
            hash: false,
            template: `${PATHS.srcAssets}/index.html`,
            filename: "./index.html",
        }),
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
                use: cssLoader(),
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoader([
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
                ]),
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                loader: "file-loader",
                options: {
                    name: filename(),
                },
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
