var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'imagenanddesign.com',
  user: 'imagenan_fournee',
  password: 'L@Fourn33',
  database : 'imagenan_lafournee'
});

module.exports = {
  getConnection: function() {
    // connection.connect();
    return connection;
  },

  finishConnection: function () {
    connection.end();
  }
};
