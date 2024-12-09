const defaultConfig = require("@wordpress/scripts/config/webpack.config");
 
const config = {
    ...defaultConfig,


    performance: {
        maxEntrypointSize: 5000000,
        maxAssetSize: 5000000
    }
}

module.exports = config;

