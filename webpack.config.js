const webpack = require("webpack");
const merge = require("webpack-merge");
const baseWabpackConfig = require("./wp.config/webpack.base.conf");
const devWabpackConfig = require("./wp.config/webpack.dev.conf");
const buildWabpackConfig = require("./wp.config/webpack.build.conf");

module.exports = (env, options) => {
    return new Promise((resolve, rejects) => {
        resolve(
            merge(
                baseWabpackConfig,
                options.mode === "production"
                    ? buildWabpackConfig
                    : devWabpackConfig
            )
        );
    });
};
