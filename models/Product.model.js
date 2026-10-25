const mongoose = require("mongoose")
const slugify = require("slugify")

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        },
        name: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
)

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true
        },
        shortDescription: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        discountPrice: {
            type: Number,
            default: 0,
            min: 0
        },
        stock: {
            type: Number,
            required: true,
            min: 0
        },
        sku: {
            type: String,
            trim: true
        },
        images: [
            {
                public_id: {
                    type: String,
                    required: true
                },
                url: {
                    type: String,
                    required: true
                }
            }
        ],
        category: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        subcategory: {
            type: String,
            lowercase: true,
            trim: true
        },
        brand: {
            type: String,
            trim: true
        },
        tags: [
            {
                type: String,
                trim: true
            }
        ],
        reviews: [reviewSchema],
        averageRating: {
            type: Number,
            default: 0
        },
        numReviews: {
            type: Number,
            default: 0
        },
        featured: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        }
    },
    { timestamps: true }
)

productSchema.pre("save", async function () {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, { lower: true, strict: true })
    }
})

productSchema.methods.calcAverageRating = function () {
    if (!this.reviews || this.reviews.length === 0) {
        this.averageRating = 0
        this.numReviews = 0
    } else {
        const sum = this.reviews.reduce((acc, item) => acc + item.rating, 0)
        this.averageRating = Number((sum / this.reviews.length).toFixed(1))
        this.numReviews = this.reviews.length
    }
}

productSchema.index({ name: "text", description: "text", brand: "text" })
productSchema.index({ category: 1, brand: 1, price: 1, averageRating: -1 })

const Product = mongoose.model("Product", productSchema)

module.exports = Product
