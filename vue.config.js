let path = require('path');

module.exports = {
  // 第三方插件配置（scss和它一样）
  pluginOptions: {
    'style-resources-loader': {
      // less的话  这里改成less
      preProcessor: 'less',
      //在assets（静态资源文件夹）下创建全局样式文件；index.less 它就是less全局变量
      patterns: [path.resolve(__dirname, './src/styles/index.less')]
    }
  }
}
