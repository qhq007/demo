const path = require("path");
const EslintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const isProduction = process.env.NODE_ENV === "production";
const TerserWebpackplugin = require("terser-webpack-plugin");

const getStyleLoaders = (pre) => {
    return [
        isProduction ? MiniCssExtractPlugin.loader : "style-loader",
        "css-loader",
        {
            loader:"postcss-loader",
            options: {
                postcssOptions: {
                  plugins: [
                    [
                      'postcss-preset-env',
                    ],
                  ],
                },
              }
        },
        pre
    ].filter(Boolean);
}

module.exports = {
    entry:"./src/index.js",
    output:{
        path:isProduction ? path.resolve(__dirname,"./dist") : undefined,
        filename:isProduction ?"static/js/[name].[contenthash:10].js":"static/js/[name].js",
        chunkFilename:isProduction ?"static/js/[name].[contenthash:10].chunk.js":"static/js/[name].chunk.js",
        assetModuleFilename:"static/media/[hash:10][ext][query]",
        clean:true
    },
    module:{
        rules:[
            {
                test:/\.css$/,
                use:getStyleLoaders()
            },
            {
                test:/\.less$/,
                use:getStyleLoaders("less-loader")
            },
            {
                test:/\.(png|jpe?g|webp|gif)$/,
                type:"asset",
                parser:{
                    dataUrlCondition:{
                        maxSize:10*1024
                    }
                }
            },
            {
                test:/\.jsx?$/,
                loader:"babel-loader",
                include:path.resolve(__dirname,"./src"),
                options:{
                    cacheDirectory:true,
                    cacheCompression:false,
                    plugins:[
                        !isProduction && "react-refresh/babel"
                    ].filter(Boolean)
                }
            }
        ]
    },
    plugins:[
        new EslintWebpackPlugin({
            context:path.resolve(__dirname,"./src"),
            cache:true,
            cacheLocation:path.resolve(__dirname,"./node_modules/.cache/.eslintcache")
        }),
        new HtmlWebpackPlugin({
            template:path.resolve(__dirname,"./public/index.html")
        }),
        isProduction && new MiniCssExtractPlugin({
            filename:"static/css/[name].[contenthash:10].css",
            chunkFilename:"static/css/[name].[contenthash:10].chunk.css"
        }),
        isProduction && new CopyPlugin({
            patterns: [
              {
                  from:path.resolve(__dirname,"./public"),
                  to:path.resolve(__dirname,"./dist"),
                  globOptions: {
                    ignore: ["**/index.html"],
                  },
              }
            ],
          }),
        !isProduction && new ReactRefreshWebpackPlugin()
    ].filter(Boolean),
    mode:isProduction ? "production" :"development",
    devtool:isProduction ?"source-map":"cheap-module-source-map",
    optimization:{
        splitChunks:{
            chunks:"all",
            cacheGroups:{
                react:{
                    test:/node_modules[\\/]react(.*)?/,
                    name:"chunk-react",
                    priority:40
                },
                antd:{
                    test:/node_modules[\\/]antd(.*)?/,
                    name:"chunk-antd",
                    priority:30
                },
                lib:{
                    test:/node_modules[\\/]/,
                    name:"chunk-libs",
                    priority:20
                }
            }
        },
        runtimeChunk:{
            name: (entrypoint) => `runtime~${entrypoint.name}.js`
        },
        minimize:isProduction,
        minimizer:[
            new CssMinimizerPlugin(),
            new TerserWebpackplugin()
        ]
    },
    resolve:{
        extensions:[".jsx",".js",".json"]
    },
    devServer:{
        host:"localhost",
        port:3000,
        open:true,
        hot:true,
        historyApiFallback:true
    },
    performance:false
}