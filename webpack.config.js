const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        clean: true, // Очистка выходной папки перед каждой сборкой
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
        })
    ],

    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    'style-loader', // Обрабатывает CSS и вставляет его в DOM
                    'css-loader',   // Интерпретирует @import и url()
                    'sass-loader'   // Компилирует Sass в CSS
                ],
            },
            {
                test: /\.html$/,
                use: 'html-loader'
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
                type: 'asset/resource', // Позволяет Webpack импортировать файлы как ресурсы
                generator: {
                    filename: 'fonts/[name][ext]', // Указывает, куда сохранять выходные шрифты
                },
            },
            {
                test: /\.js$/,
                exclude: /node_modules/
            }
        ]
    },

    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000,
        open: true,
        hot: true,
        liveReload: true, // Добавлено для перезагрузки страницы при изменении HTML
    },

    resolve: {
        alias: {
            assets: path.resolve(__dirname, 'src/assets/')
        },
        extensions: ['.js', '.json'],
    },

    mode: 'development',
};
