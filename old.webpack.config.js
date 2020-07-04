const path = require("path");
const webpack = require("webpack");
//const merge = require("webpack-merge");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");

const PATHS = {
    assetsDirName: "assets",
    distDirName: "dist",
    src: path.join(__dirname, "src"),
    srcAssets: path.join(__dirname, "src/assets"),
    dist: path.join(__dirname, "dist"),
};

let conf = {
    mode: "development",
    context: PATHS.src,
    entry: {
        app: ["@babel/polyfill", "./index.js"],
    },
    output: {
        filename: "",
        path: PATHS.dist,
        publicPath: "/",
    },
    devtool: "#cheap-module-eval-source-map",
    devServer: {},
    resolve: {
        alias: {
            "@assets": PATHS.srcAssets,
            "@": PATHS.src,
        },
    },
    optimization: {},
    plugins: [
        new CleanWebpackPlugin(),
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
            {
                test: /\.(woff(2)?\ttf|eot)$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]",
                    outputPath: `${PATHS.assetsDirName}/fonts`,
                },
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                loader: "file-loader",
                options: {
                    name: "[name].[hash].[ext]",
                    outputPath: `${PATHS.assetsDirName}/img`,
                },
            },
        ],
    },
};

module.exports = (env, options) => {
    const isProd = options.mode === "production";
    const isDev = !isProd;

    const filename = (ext) => {
        const name = isProd ? "[name].[hash]" : "[name]";
        return `${PATHS.assetsDirName}/${ext}/${name}.${ext}`;
    };
    const fileid = (ext) => {
        const name = isProd ? "[id].[hash]" : "[id]";
        return `${PATHS.assetsDirName}/${ext}/${name}.${ext}`;
    };
    const optimization = () => {
        let opt = {
            splitChunks: {
                chunks: "all",
            },
        };

        if (isProd) {
            opt.minimizer = [
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
            ];
        }

        return opt;
    };
    const cssLoader = (extra) => {
        const loaders = [
            {
                loader: MiniCssExtractPlugin.loader,
                options: {
                    publicPath: "../",
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
        ];

        if (extra) {
            loaders.push(extra);
        }

        return loaders;
    };
    const imgLoader = (extra) => {
        const loaders = [
            {
                loader: "file-loader",
                options: {
                    name: filename("[ext]"),
                    outputPath: "./img",
                    //useRelativePath: true,
                },
            },
        ];

        if (extra) {
            loaders.push(extra);
        }

        return loaders;
    };

    /** Add config */
    conf.output.filename = filename("js");
    conf.optimization = optimization();
    conf.plugins.push(
        new HTMLWebpackPlugin({
            hash: false,
            template: `${PATHS.srcAssets}/index.html`,
            filename: "./index.html",
            minify: {
                collapseWhitespace: isDev,
            },
        })
    );
    conf.plugins.push(
        new MiniCssExtractPlugin({
            filename: filename("css"),
            chunkFilename: fileid("css"),
        })
    );
    conf.module.rules.push({
        test: /\.css$/,
        use: cssLoader(),
    });
    conf.module.rules.push({
        test: /\.s[ac]ss$/,
        use: cssLoader({
            loader: "sass-loader",
            options: {
                // Prefer `dart-sass`
                implementation: require("sass"),
                sourceMap: isDev,
            },
        }),
    });

    /** */
    if (isProd) {
        conf.mode = "production";
        conf.devtool = false /** "source-map" */;
        /* conf.module.rules.push({
            test: /\.(gif|png|jpe?g|svg)$/i,
            use: imgLoader({
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
            }),
        }); */
    } else {
        conf.devServer = {
            port: 8081,
            hot: true,
            contentBase: PATHS.dist,
            overlay: {
                warnings: false,
                errors: true,
            },
        };
        conf.plugins.push(
            new webpack.SourceMapDevToolPlugin({
                filename: "[file].map",
            })
        );
        /* conf.module.rules.push({
            test: /\.(gif|png|jpe?g|svg)$/i,
            use: imgLoader(),
        }); */
    }

    conf.module.rules.forEach((el) => console.log("Element: ", el));
    //console.log("Config: ", conf);

    return conf;
};
