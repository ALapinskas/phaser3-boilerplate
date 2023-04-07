const path = require("path");

var config = {
    entry: "./src/main.js",
    output: {
        path: path.resolve("dist"),
        filename: "bundle.js",
        //chunkFormat: "module"
    },
    devServer: {
        static: {
            directory: path.resolve("dist"),
        },
        compress: true,
        hot: false,
        port: 9000,
    },
    resolve: {
        fallback: {
            "fs": false,
            "https": false,
            "http": false,
            "url": false,
            "stream": false,
            "crypto": false,
            "zlib": false,
            "utf-8-validate": false,
            "bufferutil": false,
            "net": false,
            "tls": false,
            "child_process": false
        },
    },
    target: "web"
};

module.exports = function(env, argv) {
//export default (env, argv) => {
    if (argv.mode === "development") {
        config.devtool = "source-map";
    }

    if (argv.mode === "production") {
    //...
    }

    return config;
};