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
    //转换typescript
    {   
        watch: true, // 监听文件修改，默认false
        watchOptions: {
            ignored: /node_modules/,
            aggregateTimeout: 300 // 300ms后再去执行，默认值
        },
        entry: {
            bundle: './src/ts/test.ts'
        },
        output: {
            path: path.resolve(__dirname, './src/ts'),
            filename: '[name].js'
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        }
    },
// 打包css
    {
        watch: true,
        watchOptions: {
            ignored: /node_modules/,
            aggregateTimeout: 300
        },
        devtool: 'cheap-module-eval-source-map',
        context: path.resolve(__dirname),
        entry: getCSSEntries(CSS_PATH.css),
        output: {
            path: CSS_PATH.css.dst,
            filename: '[name].css'
        },
        module: {
            rules: [
                {  
                    test: /\.(scss|css)$/,
                    exclude: /node_modules/,
                    use: ExtractTextPlugin.extract({
                        use:[{
                                loader:'css-loader',
                                options: { minimize: false }
                            },
                            {
                                loader:'sass-loader'
                            },
							'postcss-loader'
						]
                    })
                }
            ]
        },
        plugins: [ new ExtractTextPlugin("[name].css") ]
    },
// 打包js
    {
        watch: true,
        watchOptions: {
            ignored: /node_modules/,
            aggregateTimeout: 300 
        },
        mode: "production", 
        //入口文件的配置项
        entry: {
            bundle: './src/js/bundle.js',
            webservice: './src/js/server.js'
        },
        //出口文件的配置项
        output: {
            path: path.join(__dirname, './public/js'),
            filename: '[name].js'
        },
        //模块：例如解读CSS,图片如何转换，压缩
        module: {
            rules: [
                {
                    //判断是否为.js，若是就进行es6转换
                    test: /\.js$/,
                    //打包除这个文件之外的文件
                    exclude: /node_modules/,
                    //打包包括的文件
                    include: path.join(__dirname, "./src/js"),
                    loader: "babel-loader"
                }
            ]
        }
    }
];