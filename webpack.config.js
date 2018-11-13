const path = require('path');
const glob = require('globby');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

// CSS入口配置
const CSS_PATH = {
    css: {
        pattern: ['./src/css/*.css','./src/css/*.scss'],
        src: path.join(__dirname, './src/css'),
        dst: path.resolve(__dirname, 'public/css')
    }
};

// 遍历除所有需要打包的CSS文件路径
function getCSSEntries(config) {
    const fileList = glob.sync(config.pattern);
    return fileList.reduce(function (previous, current) {
        const filePath = path.parse(path.relative(config.src, current));
        const withoutSuffix = path.join(filePath.dir, filePath.name);
        previous[withoutSuffix] = path.resolve(__dirname, current);
        return previous;
    }, {});
}

module.exports = [
// 打包css
    {
        devtool: 'cheap-module-eval-source-map',
        context: path.resolve(__dirname),
        entry: getCSSEntries(CSS_PATH.css),
        output: {
            path: CSS_PATH.css.dst,
            filename: '[name].css'
        },
        module: {
            rules: [
                {   //打包css、sass文件
                    test: /\.(scss|css)$/,
                    //打包且压缩
                    use: ExtractTextPlugin.extract({
                        use:[{
                                loader:'css-loader',
                                options: { minimize: true }
                            },
                            {
                                loader:'sass-loader'
                            }]
                    })
                }
            ]
        },
        plugins: [ new ExtractTextPlugin("[name].css") ]
    },
// 打包js
    {
        //入口文件的配置项
        entry: {
            bundle: './src/js/bundle.js',
            webservice: './src/js/webservice.js'
        },
        //出口文件的配置项
        output: {
            path: path.resolve(__dirname, './public/js'),
            filename: '[name].js'
        },
        //模块：例如解读CSS,图片如何转换，压缩
        module: {
            rules: [
                {
                    //判断是否为.js，若是就进行es6转换
                    test: /\.js$/,
                    //打包除这个文件之外的文件
                    exclude: path.resolve(__dirname,"./node_modules"),
                    //打包包括的文件
                    include: path.resolve(__dirname, "./src/js"),
                    loader: "babel-loader",
                    query: {
                        "presets":['es2015']
                    }
                }
            ]
        }
    }
];