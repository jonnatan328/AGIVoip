var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'jrv92328',
  database : 'ordersFournee'
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
