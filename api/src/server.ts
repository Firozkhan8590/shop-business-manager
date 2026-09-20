import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/products/product.routes";
import customerRoutes from "./routes/customers/customer.route";
import supplierRoutes from "./routes/suppliers/supplier.routes";
import purchaseRoutes from "./routes/purchases/purchase.route";
import saleRoutes from "./routes/sales/sale.route";
import paymentRoutes from "./routes/payments/payment.route";

const app = express();

const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Shop Business Manager API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/payments", paymentRoutes);

app.listen(PORT, () => {
  console.log(
    `🚀 API server running on http://localhost:${PORT}`
  );
});