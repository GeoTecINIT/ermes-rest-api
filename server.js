const cluster = require('cluster');

if (cluster.isMaster) {
    const cpuCount = require('os').cpus().length;
    for (var i = 0; i < cpuCount; i++) {
        cluster.fork();
    }

    cluster.on('online', (worker) => {
        console.log(` [*] Worked started with PID ${worker.process.pid}`);
    });

    cluster.on('exit', (worker, code, signal) => {
       console.log(` [x] Worker ${worker.process.pid} died, starting a new instance`);
    });
} else {
    require('./main').then(() => {
        console.log(` [*] Worked finished loading with PID ${process.pid}`);
    });
}