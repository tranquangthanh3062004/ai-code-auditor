import express from 'express';
import https from 'node:https';

const app = express();
app.use(express.json());

// 1. Insecure eval execution (SEC-007)
app.post('/api/calculate', (req, res) => {
  const { formula } = req.body;
  const result = eval(formula);
  res.json({ result });
});

// 2. DOM / Raw innerHTML injection (SEC-008)
app.get('/render-user-profile', (req, res) => {
  const userHtml = `<div class="profile">${req.query.bio}</div>`;
  document.getElementById('content').innerHTML = userHtml;
  res.send(userHtml);
});

// 3. Storing JWT tokens in browser LocalStorage (SEC-009)
export function saveUserSession(token) {
  localStorage.setItem('token', token);
  localStorage.setItem('jwt', token);
}

// 4. Insecure TLS / SSL disabling (SEC-010)
export function fetchInternalMicroservice() {
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });
  return agent;
}

app.listen(8080, () => {
  console.log('Vulnerable server running on port 8080');
});
