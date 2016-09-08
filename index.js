'use strict';

const dns = require('dns');
const net = require('net');

const email  = process.argv[2];
const domain = email && email.split('@', 2)[1];

if (!domain) {
  console.error(`Invalid email: ${email}`);
  process.exit(1);
}

promisify(dns.resolveMx)(domain)
  .then(addresses =>
    addresses.reduce((best, next) => best.priority > next.priority ? best : next).exchange
  )
  .then(mx => net.connect(25, mx))
  .then(socket => new Promise((resolve, reject) => {
    socket.setEncoding('utf-8');
    socket.on('error', reject);

    socket.once('data', data => {
      expect(data, 220, `Invalid response: ${data}`);

      resolve(send(socket, `helo hi`)
        .then(() => send(socket, `mail from: <${email}>`))
        .then(() => send(socket, `rcpt to: <${email}>`))
        .then(data => expect(data, 250, `Unknown email: ${email}`))
        .then(() => send(socket, 'quit'))
      );
    });
  }))
  .then(() => console.log(`Valid email: ${email}`))
  .catch(error => {
    console.error(error.message);
    process.exit(1);
  });

function promisify(callback, context) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      const func = context ? callback.bind(context) : callback;

      func(...args, (err, ...results) => {
        if (err) {
          return reject(err);
        }

        if (results.length <= 1) {
          return resolve(results[0]);
        }

        resolve(results);
      });
    });
  };
}

function expect(data, code, message) {
  if (!data.startsWith(code)) {
    throw new Error(message);
  }
}

function send(socket, message) {
  return new Promise(resolve => {
    socket.once('data', resolve);
    socket.write(`${message}\r\n`);
  });
}