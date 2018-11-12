var path = require('path');

module.exports = {
    entry: {
        main: './public/js/es6/main.js'
    },
    output: {
        path: path.resolve(__dirname, './public/js/es5'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                //判断是否为.js，若是就进行es6转换
                test: /\.js$/,
                //打包除这个文件之外的文件
                exclude: path.resolve(__dirname,"./node_modules"),
                //打包包括的文件
                include: path.resolve(__dirname, "./public/js/es6"),
                loader: "babel-loader",
                query: {
                    "presets":['es2015']
                }
            }
        ]
    }
};