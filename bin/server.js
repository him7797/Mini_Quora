// let app = require('../app');
// let debug = require('debug')('harbor:server');
// let http = require('http');
// let winston=require('winston');



// const port = process.env.PORT || 5000;
// app.listen(port, () => winston.info(`Listening on port ${port}...`));

// let port = normalizePort(process.env.PORT || '5000');
// app.set('port', port);





// let server = http.createServer(app);

// /**
//  * Listen on provided port, on all network interfaces.
//  */

// server.listen(port);
// server.on('error', onError);
// server.on('listening', onListening);






// function normalizePort(val) {
//     let port = parseInt(val, 10);
  
//     if (isNaN(port)) {
//       // named pipe
//       return val;
//     }
  
//     if (port >= 0) {
//       // port number
//       return port;
//     }
  
//     return false;
//   }
  
//   /**
//    * Event listener for HTTP server "error" event.
//    */
  
//   function onError(error) {
//     if (error.syscall !== 'listen') {
//       throw error;
//     }
  
//     let bind = typeof port === 'string'
//       ? 'Pipe ' + port
//       : 'Port ' + port;
  
//     // handle specific listen errors with friendly messages
//     switch (error.code) {
//       case 'EACCES':
//         console.error(bind + ' requires elevated privileges');
//         process.exit(1);
//         break;
//       case 'EADDRINUSE':
//         console.error(bind + ' is already in use');
//         process.exit(1);
//         break;
//       default:
//         throw error;
//     }
//   }
  
//   /**
//    * Event listener for HTTP server "listening" event.
//    */
  
//   function onListening() {
//     let addr = server.address();
//     let bind = typeof addr === 'string'
//       ? 'pipe ' + addr
//       : 'port ' + addr.port;
//     debug('Listening on ' + bind);
//   }