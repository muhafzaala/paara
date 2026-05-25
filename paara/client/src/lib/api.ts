import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("paara_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("paara_token");
      localStorage.removeItem("paara_user");
      localStorage.removeItem("paara-auth");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  register: (data: { name: string; email: string; password: string; role?: string; shopName?: string; city?: string }) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
  verifyEmailOtp: (email: string, otp: string) => api.post("/auth/verify-email-otp", { email, otp }),
  resendEmailOtp: (email: string) => api.post("/auth/resend-email-otp", { email }),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) => api.post(`/auth/reset-password/${token}`, { password }),
  setup2FA: () => api.post("/auth/2fa/setup"),
  verify2FA: (token: string) => api.post("/auth/2fa/verify", { token }),
  disable2FA: (password: string) => api.post("/auth/2fa/disable", { password }),
};

export const productsApi = {
  getAll: (params?: Record<string, string | number | undefined>) => api.get("/products", { params }),
  getOne: (id: string) => api.get(`/products/${id}`),
  create: (data: object) => api.post("/products", data),
  update: (id: string, data: object) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  getSellerProducts: () => api.get("/products/seller/my-products"),
  askQuestion: (productId: string, question: string) => api.post(`/products/${productId}/ask-question`, { question }),
  answerQuestion: (productId: string, qid: string, answer: string) => api.patch(`/products/${productId}/questions/${qid}/answer`, { answer }),
};

export const cartApi = {
  get: () => api.get("/cart"),
  add: (productId: string, quantity: number, variant?: string) => api.post("/cart", { productId, quantity, variant }),
  update: (productId: string, quantity: number) => api.put(`/cart/${productId}`, { quantity }),
  remove: (productId: string) => api.delete(`/cart/${productId}`),
  clear: () => api.post("/cart/clear"),
  checkout: (data: { shippingAddress: object; payment: { method: string }; couponCode?: string; giftWrap?: object }) => api.post("/cart/checkout", data),
};

export const couponsApi = {
  validate: (code: string, cartValue: number) => api.post("/coupons/validate", { code, cartValue }),
};

export const ordersApi = {
  getMyOrders: () => api.get("/orders/my-orders"),
  getOne: (id: string) => api.get(`/orders/${id}`),
  getTracking: (id: string) => api.get(`/orders/${id}/tracking`),
  cancel: (id: string, reason: string) => api.patch(`/orders/${id}/cancel`, { reason }),
  updateStatus: (id: string, status: string, extra?: object) => api.patch(`/orders/${id}/status`, { status, ...(extra || {}) }),
  getSellerOrders: (params?: object) => api.get("/seller/orders", { params }),
};

export const reviewsApi = {
  getForProduct: (productId: string) => api.get(`/products/${productId}/reviews`),
  create: (data: { product: string; rating: number; title?: string; comment: string }) => api.post("/reviews", data),
  voteHelpful: (reviewId: string) => api.patch(`/reviews/${reviewId}/helpful`),
  sellerReply: (reviewId: string, text: string) => api.patch(`/reviews/${reviewId}/seller-response`, { text }),
  getMyReviews: () => api.get("/reviews/user/my-reviews"),
};

export const wishlistApi = {
  get: () => api.get("/wishlist"),
  getAll: () => api.get("/wishlist/all"),
  add: (productId: string) => api.post("/wishlist", { productId }),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`),
  create: (name: string) => api.post("/wishlist/create", { name }),
  generateShareLink: (wishlistId: string) => api.post(`/wishlist/${wishlistId}/generate-share-link`),
  getShared: (token: string) => api.get(`/wishlist/share/${token}`),
};

export const userApi = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data: object) => api.put("/users/profile", data),
  changePassword: (currentPassword: string, newPassword: string) => api.patch("/users/change-password", { currentPassword, newPassword }),
  deleteAccount: (password?: string) => api.delete("/users/account", { data: { password } }),
  getAddresses: () => api.get("/users/addresses"),
  addAddress: (data: object) => api.post("/users/addresses", data),
  updateAddress: (id: string, data: object) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/users/addresses/${id}`),
  getCulturalJourney: () => api.get("/users/cultural-journey"),
};

export const notificationsApi = {
  getAll: () => api.get("/notifications"),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
};

export const searchApi = {
  search: (q: string, params?: object) => api.get("/search", { params: { q, ...params } }),
  suggestions: (q: string) => api.get("/search/suggestions", { params: { q } }),
};

export const citiesApi = {
  getAll: () => api.get("/cities"),
};

export const collectionsApi = {
  getAll: (featured?: boolean) => api.get("/collections", { params: featured ? { featured: "true" } : {} }),
  getOne: (slug: string) => api.get(`/collections/${slug}`),
};

export const recommendationsApi = {
  get: (params?: { productId?: string; city?: string; category?: string }) => api.get("/recommendations", { params }),
  trending: () => api.get("/recommendations/trending"),
  featured: () => api.get("/recommendations/featured"),
};

export const verificationApi = {
  apply: (data: object) => api.post("/verification/apply", data),
  addDocument: (data: { type: string; url: string }) => api.post("/verification/documents", data),
  getMyStatus: () => api.get("/verification/my-status"),
  submitAppeal: (text: string) => api.post("/verification/appeal", { text }),
};

export const uploadApi = {
  productImages: (formData: FormData) => api.post("/upload/product-images", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  avatar: (formData: FormData) => api.post("/upload/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  document: (formData: FormData) => api.post("/upload/document", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  reviewPhoto: (formData: FormData) => api.post("/upload/review-photo", formData, { headers: { "Content-Type": "multipart/form-data" } }),
};

export const adminApi = {
  getDashboard: () => api.get("/admin/dashboard"),
  getStats: () => api.get("/admin/stats"),
  getUsers: (params?: object) => api.get("/admin/users", { params }),
  updateUser: (id: string, data: object) => api.patch(`/admin/users/${id}`, data),
  toggleUserActive: (id: string) => api.patch(`/admin/users/${id}/toggle-active`),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getProducts: (params?: object) => api.get("/admin/products", { params }),
  moderateProduct: (id: string, action: string, notes?: string) => api.patch(`/admin/products/${id}/moderate`, { action, notes }),
  getOrders: (params?: object) => api.get("/admin/orders", { params }),
  getSellers: (params?: object) => api.get("/admin/sellers", { params }),
  verifySeller: (id: string, status: string) => api.patch(`/admin/sellers/${id}/verify`, { status }),
  getAnalytics: () => api.get("/admin/analytics/overview"),
  getVerificationApps: (params?: object) => api.get("/verification/admin/all", { params }),
  advanceVerification: (id: string, stage?: string, notes?: string) => api.patch(`/verification/admin/${id}/advance`, { stage, notes }),
  rejectVerification: (id: string, reason: string) => api.patch(`/verification/admin/${id}/reject`, { reason }),
  getCoupons: () => api.get("/coupons"),
  createCoupon: (data: object) => api.post("/coupons", data),
  updateCoupon: (id: string, data: object) => api.patch(`/coupons/${id}`, data),
  deleteCoupon: (id: string) => api.delete(`/coupons/${id}`),
};

export const sellerApi = {
  getDashboard: () => api.get("/seller/dashboard"),
  getOrders: (params?: object) => api.get("/seller/orders", { params }),
  getAnalytics: () => api.get("/seller/analytics"),
  getPayouts: () => api.get("/payouts/seller"),
  getBalance: () => api.get("/payouts/balance"),
  requestPayout: (data: object) => api.post("/payouts/request", data),
  updateSettings: (data: object) => api.put("/users/profile", data),
  getPublicProfile: (id: string) => api.get(`/shops/${id}`),
};

export const messagingApi = {
  getConversations: () => api.get("/messages"),
  getMessages: (conversationId: string) => api.get(`/messages/${conversationId}`),
  send: (receiverId: string, text: string, productId?: string) => api.post("/messages", { receiverId, text, productId }),
  getUnreadCount: () => api.get("/messages/unread-count"),
};

export default api;
