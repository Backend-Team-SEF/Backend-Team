const User = require("../models/User.model")
const Order = require("../models/Order.model")
const Cart = require("../models/Cart.model")
const Wishlist = require("../models/Wishlist.model")
const Product = require("../models/Product.model")

// Sales are counted from every order that was not cancelled
const NOT_CANCELLED = { status: { $ne: "cancelled" } }

const round = (n) => Math.round((n || 0) * 100) / 100

const getPage = (req) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100)
    return { page, limit, skip: (page - 1) * limit }
}

const adminController = {
    // GET /api/admin/dashboard
    getDashboard: async (req, res) => {
        try {
            const now = new Date()
            const startThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
            const startLastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
            const startOf7Days = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6))

            const [totalSales, monthly, ordersByStatus, topProducts, last7Days, latestOrders, totalCustomers] =
                await Promise.all([
                    // 1) total sales + total orders
                    Order.aggregate([
                        { $match: NOT_CANCELLED },
                        { $group: { _id: null, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } }
                    ]),

                    // 2) this month vs last month
                    Order.aggregate([
                        { $match: { ...NOT_CANCELLED, createdAt: { $gte: startLastMonth } } },
                        {
                            $group: {
                                _id: { $cond: [{ $gte: ["$createdAt", startThisMonth] }, "thisMonth", "lastMonth"] },
                                revenue: { $sum: "$totalPrice" },
                                orders: { $sum: 1 }
                            }
                        }
                    ]),

                    // 3) number of orders for each status
                    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),

                    // 4) top 5 best selling products
                    Order.aggregate([
                        { $match: NOT_CANCELLED },
                        { $unwind: "$items" },
                        {
                            $group: {
                                _id: "$items.name",
                                image: { $first: "$items.image" },
                                quantitySold: { $sum: "$items.quantity" },
                                revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                            }
                        },
                        { $sort: { quantitySold: -1 } },
                        { $limit: 5 }
                    ]),

                    // 5) revenue per day for the last 7 days
                    Order.aggregate([
                        { $match: { ...NOT_CANCELLED, createdAt: { $gte: startOf7Days } } },
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                                revenue: { $sum: "$totalPrice" },
                                orders: { $sum: 1 }
                            }
                        }
                    ]),

                    // 6) latest 5 orders
                    Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "username email"),

                    // 7) total customers
                    User.countDocuments({ role: "customer" })
                ])

            const thisMonth = monthly.find((m) => m._id === "thisMonth") || { revenue: 0, orders: 0 }
            const lastMonth = monthly.find((m) => m._id === "lastMonth") || { revenue: 0, orders: 0 }

            let growth = 0
            if (lastMonth.revenue > 0) {
                growth = ((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100
            } else if (thisMonth.revenue > 0) {
                growth = 100
            }

            // make sure every status appears, even with 0 orders
            const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
            const statusCounts = {}
            statuses.forEach((s) => {
                statusCounts[s] = ordersByStatus.find((o) => o._id === s)?.count || 0
            })

            // make sure all 7 days appear, even with no sales
            const chart = []
            for (let i = 6; i >= 0; i--) {
                const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i))
                const key = d.toISOString().slice(0, 10)
                const found = last7Days.find((x) => x._id === key)
                chart.push({ date: key, revenue: round(found?.revenue), orders: found?.orders || 0 })
            }

            res.status(200).send({
                data: {
                    totalSales: round(totalSales[0]?.revenue),
                    totalOrders: totalSales[0]?.orders || 0,
                    monthlySales: {
                        thisMonth: round(thisMonth.revenue),
                        lastMonth: round(lastMonth.revenue),
                        growthPercent: round(growth)
                    },
                    ordersByStatus: statusCounts,
                    topProducts: topProducts.map((p) => ({
                        name: p._id,
                        image: p.image,
                        quantitySold: p.quantitySold,
                        revenue: round(p.revenue)
                    })),
                    last7DaysSales: chart,
                    latestOrders,
                    totalCustomers
                }
            })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    },

    // GET /api/admin/carts
    getAllCarts: async (req, res) => {
        try {
            const { page, limit, skip } = getPage(req)
            const [carts, total] = await Promise.all([
                Cart.find()
                    .sort({ updatedAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate("user", "username email"),
                Cart.countDocuments()
            ])

            res.status(200).send({ total, page, pages: Math.ceil(total / limit), data: carts })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    },

    // GET /api/admin/wishlists
    getAllWishlists: async (req, res) => {
        try {
            const { page, limit, skip } = getPage(req)
            const [wishlists, total] = await Promise.all([
                Wishlist.find()
                    .sort({ updatedAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate("user", "username email")
                    .populate("products", "name price"),
                Wishlist.countDocuments()
            ])

            res.status(200).send({ total, page, pages: Math.ceil(total / limit), data: wishlists })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    },

    // GET /api/admin/wishlists/stats
    getWishlistStats: async (req, res) => {
        try {
            const [summary, top] = await Promise.all([
                Wishlist.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalWishlists: { $sum: 1 },
                            totalSavedItems: { $sum: { $size: { $ifNull: ["$products", []] } } }
                        }
                    }
                ]),
                Wishlist.aggregate([
                    { $unwind: "$products" },
                    { $group: { _id: "$products", count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 5 }
                ])
            ])

            const products = await Product.find({ _id: { $in: top.map((t) => t._id) } }).select("name price")
            const mostWishlisted = top.map((t) => {
                const p = products.find((x) => x._id.equals(t._id))
                return { productId: t._id, name: p?.name || null, price: p?.price ?? null, count: t.count }
            })

            const totalWishlists = summary[0]?.totalWishlists || 0
            const totalSavedItems = summary[0]?.totalSavedItems || 0

            res.status(200).send({
                data: {
                    totalWishlists,
                    totalSavedItems,
                    averageItemsPerWishlist: totalWishlists ? round(totalSavedItems / totalWishlists) : 0,
                    mostWishlisted
                }
            })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    }
}

module.exports = adminController
