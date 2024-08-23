import { merge } from 'webpack-merge';
import common from './webpack.common.mjs';
import server from './webpack.server.mjs';

export default merge(common, server, {
  mode: 'development',
  watchOptions: {
    ignored: '**/node_modules',
  }
});
