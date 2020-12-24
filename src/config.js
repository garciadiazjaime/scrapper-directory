const convict = require('convict');

// Define a schema
const config = convict({
  env: {
    doc: 'The applicaton environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  ipaddress: {
    doc: 'The IP address to bind.',
    format: 'ipaddress',
    default: '0.0.0.0',
    env: 'NODE_IP',
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3030,
    env: 'NODE_PORT',
  },
  api: {
    url: {
      doc: 'API URL',
      format: String,
      default: 'http://127.0.0.1:3000/ports',
      env: 'API_URL',
    },
  },
  db: {
    url: {
      doc: 'Database hostname',
      format: String,
      default: 'mongodb://localhost:27017/directory',
      env: 'DB_URL',
    },
  },
  loggly: {
    token: {
      doc: 'Loggly token',
      format: String,
      default: '',
      env: 'LOGGLY_TOKEN',
    },
    subdomain: {
      doc: 'Loggly subdomain',
      format: String,
      default: '',
      env: 'LOGGLY_SUBDOMIAN',
    },
    username: {
      doc: 'Loggly username',
      format: String,
      default: '',
      env: 'LOGGLY_USERNAME',
    },
    password: {
      doc: 'Loggly password',
      format: String,
      default: '',
      env: 'LOGGLY_PASSWORD',
    },
  },
  alchemy: {
    apiUrl: {
      doc: 'Alchemy API URL',
      format: String,
      default: '',
      env: 'ALCHEMY_API_URL',
    },
    token: {
      doc: 'Alchemy token',
      format: String,
      default: '',
      env: 'ALCHEMY_TOKEN',
    },
  },
  secureToken: {
    doc: 'Our token',
    format: String,
    default: '',
    env: 'MINT_TOKEN',
  },
  google: {
    apiKey: {
      doc: 'Google api key',
      format: String,
      default: '',
      env: 'GOOGLE_API_KEY',
    },
    searchCx: {
      doc: 'Google search CX',
      format: String,
      default: '',
      env: 'GOOGLE_SEARCH_CX',
    },
    imageCx: {
      doc: 'Google image CX',
      format: String,
      default: '',
      env: 'GOOGLE_IMAGE_CX',
    },
    analyticsEmail: {
      doc: 'Google analytics client email',
      format: String,
      default: '',
      env: 'GOOGLE_ANALYTICS_EMAIL',
    },
    analyticsPrivateKey: {
      doc: 'Google analytics private key',
      format: String,
      default: '',
      env: 'GOOGLE_ANALYTICS_KEY',
    },
    analyticsViewId: {
      doc: 'Google analytics view id',
      format: String,
      default: '',
      env: 'GOOGLE_ANALYTICS_VIEW_ID',
    },
  },
  facebook: {
    shortToken: {
      doc: 'Facebook Short token',
      format: String,
      default: '',
      env: 'FB_SHORT_TOKEN',
    },
    longToken: {
      doc: 'Facebook Long token',
      format: String,
      default: '',
      env: 'FB_LONG_TOKEN',
    },
    appId: {
      doc: 'Facebook Application ID',
      format: String,
      default: '',
      env: 'FB_APPLICATION_ID',
    },
    appSecret: {
      doc: 'Facebook Application Secret',
      format: String,
      default: '',
      env: 'FB_APPLICATION_SECRET',
    },
    pageId: {
      doc: 'Facebook Page ID',
      format: String,
      default: '',
      env: 'FB_PAGE_ID',
    },
    apiUrl: {
      doc: 'Facebook API URL',
      format: String,
      default: '',
      env: 'FB_API_URL',
    },
  },
  yelp: {
    consumerKey: {
      doc: 'Yelp Consumer Key',
      format: String,
      default: '',
      env: 'YELP_CONSUMER_KEY',
    },
    consumerSecret: {
      doc: 'Yelp Consumer Secret',
      format: String,
      default: '',
      env: 'YELP_CONSUMER_SECRET',
    },
    token: {
      doc: 'Yelp Token',
      format: String,
      default: '',
      env: 'YELP_TOKEN',
    },
    tokenSecret: {
      doc: 'Yelp token secret',
      format: String,
      default: '',
      env: 'YELP_TOKEN_SECRET',
    },
  },
  foursquare: {
    clientId: {
      doc: 'Foursquare Client id',
      format: String,
      default: '',
      env: 'FOURSQUARE_CLIENTIDKEY',
    },
    consumerSecret: {
      doc: 'Foursquare Client secret',
      format: String,
      default: '',
      env: 'FOURSQUARE_CLIENTSECRETKEY',
    },
  },
});

// Perform validation
config.validate({ strict: true });

module.exports = config;
