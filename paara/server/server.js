const express        = require("express");
const cors           = require("cors");
const morgan         = require("morgan");
const dotenv         = require("dotenv");
const compression    = require("compression");
const helmet         = require("helmet");
const mongoSanitize  = require("express-mongo-sanitize");
const xss            = require("xss-clean");
const hpp            = require("hpp");
const cookieParser   = require("cookie-parser");
const rateLimit      = require("express-rate-limit");
const connectDB      = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { cache } = require("./middleware/cache");

dotenv.config();
connectDB();

const app = express();

app.disable("x-powered-by");

// Helmet
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(compression());

// CORS
const corsOptions = {
  origin: (origin, callback) => {
    const allowed = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : ["http://localhost:5173", "http://localhost:3000"];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-Timestamp", "X-Request-Signature"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Body parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Cookie parser
app.use(cookieParser());

// Security sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Logging
app.use(morgan("dev"));

// ─── Rate Limiters ────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

const adminMutationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many admin actions. Please slow down." },
});

// Apply rate limiters to both v1 and deprecated /api paths
app.use("/api/v1", apiLimiter);
app.use("/api",    apiLimiter);
app.use("/api/v1/admin", adminMutationLimiter);
app.use("/api/admin",    adminMutationLimiter);

// ─── Deprecation Middleware ───────────────────────────────────
// Attached to all /api/ (non-versioned) routes to signal migration
const deprecationMiddleware = (req, res, next) => {
  const host = req.get("host") || "localhost:5000";
  res.set("Deprecation", "true");
  res.set("Sunset", "Sun, 01 Jun 2026 00:00:00 GMT");
  res.set("Link", `<http://${host}/api/v1${req.path}>; rel="successor-version"`);
  next();
};

// ─── Route-level caching ──────────────────────────────────────
app.use("/api/v1/products/search", cache(120));
app.use("/api/v1/recommendations", cache(300));
app.use("/api/v1/cities",          cache(3600));

// ─── v1 Routes (current, supported) ───
app.use("/api/v1/auth",           require("./routes/authRoutes"));
app.use("/api/v1/products",       require("./routes/productRoutes"));
app.use("/api/v1/cart",           require("./routes/cartRoutes"));
app.use("/api/v1/orders",         require("./routes/orderRoutes"));
app.use("/api/v1/reviews",        require("./routes/reviewRoutes"));

// Enhanced reviews: two routers split out of enhancedReviewRoutes.js
const { productReviewRouter, standaloneReviewRouter } = require("./routes/enhancedReviewRoutes");
app.use("/api/v1/products",       productReviewRouter);
app.use("/api/v1",                standaloneReviewRouter);

app.use("/api/v1/admin",          require("./routes/adminRoutes"));
app.use("/api/v1/wishlist",       require("./routes/wishlistRoutes"));
app.use("/api/v1/heritage",      require("./routes/heritageRoutes"));
app.use("/api/v1/users",          require("./routes/userRoutes"));
app.use("/api/v1",                require("./routes/notificationRoutes"));
app.use("/api/v1/verification",   require("./routes/verificationRoutes"));
app.use("/api/v1/upload",         require("./routes/uploadRoutes"));
app.use("/api/v1/coupons",        require("./routes/couponRoutes"));

// Route files that declare their own internal path prefixes
// (e.g. /shops/*, /seller/*, /messages/*, /payouts/*, /admin/*).
// They mount at /api/v1 root, not under a specific resource prefix.
app.use("/api/v1",                require("./routes/sellerProfileRoutes"));
app.use("/api/v1",                require("./routes/messagingRoutes"));
app.use("/api/v1",                require("./routes/payoutRoutes"));
app.use("/api/v1",                require("./routes/productModerationRoutes"));
app.use("/api/v1",                require("./routes/adminAnalyticsRoutes"));
app.use("/api/v1",                require("./routes/contentModerationRoutes"));
app.use("/api/v1",                require("./routes/fieldResearchRoutes"));
app.use("/api/v1",                require("./routes/searchRoutes"));
app.use("/api/v1",                require("./routes/cityRoutes"));
app.use("/api/v1",                require("./routes/collectionRoutes"));
app.use("/api/v1",                require("./routes/recommendationsRoutes"));
app.use("/api/v1",                require("./routes/adminMgmtRoutes"));

// ─── Deprecated /api/ Aliases (backward compat, 6 months) ───
// Every alias is wrapped in deprecationMiddleware so old clients receive
// Sunset + Link headers signaling migration to /api/v1/.
app.use("/api/auth",              deprecationMiddleware, require("./routes/authRoutes"));
app.use("/api/products",          deprecationMiddleware, require("./routes/productRoutes"));
app.use("/api/cart",              deprecationMiddleware, require("./routes/cartRoutes"));
app.use("/api/orders",            deprecationMiddleware, require("./routes/orderRoutes"));
app.use("/api/reviews",           deprecationMiddleware, require("./routes/reviewRoutes"));
app.use("/api/admin",             deprecationMiddleware, require("./routes/adminRoutes"));
app.use("/api/wishlist",          deprecationMiddleware, require("./routes/wishlistRoutes"));
app.use("/api/users",             deprecationMiddleware, require("./routes/userRoutes"));
app.use("/api/notifications",     deprecationMiddleware, require("./routes/notificationRoutes"));
app.use("/api/verification",      deprecationMiddleware, require("./routes/verificationRoutes"));
app.use("/api/upload",            deprecationMiddleware, require("./routes/uploadRoutes"));
app.use("/api/coupons",           deprecationMiddleware, require("./routes/couponRoutes"));

// Route files with their own internal prefixes — deprecated alias on /api
app.use("/api",                   deprecationMiddleware, require("./routes/sellerProfileRoutes"));
app.use("/api",                   deprecationMiddleware, require("./routes/messagingRoutes"));
app.use("/api",                   deprecationMiddleware, require("./routes/payoutRoutes"));
app.use("/api",                   deprecationMiddleware, require("./routes/productModerationRoutes"));
app.use("/api",                   deprecationMiddleware, require("./routes/adminAnalyticsRoutes"));
app.use("/api",                   deprecationMiddleware, require("./routes/contentModerationRoutes"));
app.use("/api",                   deprecationMiddleware, require("./routes/fieldResearchRoutes"));
app.use("/api",                   deprecationMiddleware, require("./routes/searchRoutes"));
app.use("/api",                   deprecationMiddleware, require("./routes/cityRoutes"));
app.use("/api",                   deprecationMiddleware, require("./routes/collectionRoutes"));
app.use("/api",                   deprecationMiddleware, require("./routes/recommendationsRoutes"));

// ─── Health Check ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "PAARA API is running",
    version: "v1",
    currentBase: "/api/v1/",
    deprecatedBase: "/api/ — deprecated, use /api/v1/",
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
