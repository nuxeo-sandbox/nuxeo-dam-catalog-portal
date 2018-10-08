module.exports = {
  configureWebpack: {
    output: {
      globalObject: 'this' // `typeof self !== 'undefined' ? self : this`'' -- not working
    }
  },
  devServer: {
    proxy: {
      '/nuxeo': {
        target: process.env.DEV_SERVER_URL,
        ws: true,
        changeOrigin: true,
        headers: {
          'Authorization': process.env.DEV_SERVER_CRED
        }
      }
    }
  },
  baseUrl: process.env.NODE_ENV === 'production'
    ? '/nuxeo/catalog'
    : '/'
}
