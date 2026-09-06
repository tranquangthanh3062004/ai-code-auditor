import express from 'express';

const app = express();
app.use(express.json());

// 1. LỖ HỔNG CRITICAL: Hardcoded API Key
const OPENAI_SECRET_KEY = "sk-live-99998888777766665555444433332222";

// 2. LỖ HỔNG HIGH: SQL Injection
app.get('/api/users/search', async (req, res) => {
  const searchTerm = req.query.q;
  const sql = `SELECT * FROM users WHERE username = '${searchTerm}'`;
  // database.query(sql)
  res.json({ status: "ok", query: sql });
});

// 3. LỖ HỔNG LOGIC: Giỏ hàng không kiểm tra số lượng âm
app.post('/api/cart/checkout', (req, res) => {
  const { items, totalPrice } = req.body;
  // Bỏ qua kiểm tra: nếu items có quantity = -10, totalPrice có thể âm!
  res.json({ message: "Thanh toán thành công", charged: totalPrice });
});

// 4. LỖ HỔNG HIGH: XSS render
app.get('/api/render', (req, res) => {
  const userHtml = req.query.content;
  // dangerouslySetInnerHTML
  res.send(`<div dangerouslySetInnerHTML={{ __html: '${userHtml}' }} />`);
});

app.listen(3000, () => console.log("Server running on port 3000"));
