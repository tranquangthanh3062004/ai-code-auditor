import express from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json());

// 1. API key đọc an toàn từ biến môi trường
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

// 2. Schema kiểm tra dữ liệu đầu vào nghiêm ngặt
const CheckoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive('Số lượng sản phẩm phải lớn hơn 0'),
    unitPrice: z.number().positive('Đơn giá phải là số dương')
  })).nonempty('Giỏ hàng không được để trống')
});

app.post('/api/checkout', (req, res) => {
  const parseResult = CheckoutSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.format() });
  }

  const { items } = parseResult.data;
  const calculatedTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  res.json({ status: "success", amount: calculatedTotal });
});

app.listen(3000, () => console.log("Secure payment server ready"));
