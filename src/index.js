import axios from 'axios';
import http from 'http';
import url from 'url';

const min = 1;
const max = 10;
const domainSet = ['.com', '.co.kr', '.net', '.kr', '.org', '.tv', '.info', '.xxx'];
const domainReg = /.com|.co.kr|.net|.kr|.org|.tv|.info|.xxx/g;
const numberReg = /[\d]+/g;
const port = 8000;

const connect = async url => {
  try {
    await axios.get(url, {
      timeout: 2000
    });
    return true;
  } catch (e) {
    console.error(e.message);
    return false;
  }
};

const make = target => {
  const { origin } = new URL(target);
  const domains = [];
  for (let i = 0; i < domainSet.length; i ++) {
    const d = domainSet[i];
    for (let n = min; n <= max; n ++) {
      if (n < 10) {
        const domain = origin.replace(/www./g, '').replace(domainReg, d).replace(numberReg, `0${n}`);  
        domains.push(domain);
      }

      const domain = origin.replace(/www./g, '').replace(domainReg, d).replace(numberReg, n);
      domains.push(domain);
    }
  }

  return domains;
};

const validate = async domains => {
  const results = [];

  for (let i = 0; i < domains.length; i ++) {
    const domain = domains[i];
    const result = await connect(domain);
    results.push(result);
  }

  return results;
};

(async () => {

  http.createServer(async (req, res) => {
    if (req.url === '/favicon.ico') return;

    const { query } = url.parse(req.url, true);
    const { target } = query;

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<h1>Loading..</h1>');

    const domains = await make(target);
    const results = await validate(domains);

    let html = "";
    for (let i = 0; i < domains.length; i ++) {
      const result = results[i];
      const color = result ? 'blue' : 'red';
      html += `<strong>${domains[i]}</strong>\t`;
      html += `<strong style="color: ${color}">${result}</strong><br>`;
    }
    
    res.write(html);
    res.end();
    
  }).listen(port, () => {
    console.log(`Server running on ${port}`);
  });
})();
