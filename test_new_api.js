const https = require('https');

const options = {
  hostname: 'porn-xnxx-api.p.rapidapi.com',
  port: 443,
  path: '/search',
  method: 'POST',
  headers: {
    'x-rapidapi-key': 'd486069129msh0b8da27c0be5495p1d859djsn1739664b1f9a',
    'x-rapidapi-host': 'porn-xnxx-api.p.rapidapi.com',
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let chunks = [];
  res.on('data', (chunk) => {
    chunks.push(chunk);
  });
  res.on('end', () => {
    let body = Buffer.concat(chunks);
    let json = JSON.parse(body.toString());
    console.log(JSON.stringify(json.videos ? json.videos[0] : (Array.isArray(json) ? json[0] : json), null, 2));
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(JSON.stringify({ q: 'hot trending' }));
req.end();
