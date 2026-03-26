import mongoose from "mongoose";

const CATEGORY = {
  MEN: "MEN",
  WOMEN: "WOMEN",
  CHILDREN: "CHILDREN",
};

const BRAND = {
  NIKE: "NIKE",
  ADIDAS: "ADIDAS",
  PUMA: "PUMA",
};

const productsSchema = new mongoose.Schema(
  {
    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
    image: [
      {
        type: String,
        required: true,
      },
    ],
    productName: {
      type: String,
      required: true,
    },
    stock: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      enum: Object.values(BRAND),
      required: "true",
    },
    price: {
      type: String,
      required: true,
    },
    colour: [
      {
        type: String,
        required: true,
      },
    ],
    category: {
      type: String,
      enum: Object.values(CATEGORY),
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
);

// 🔥 slug function
function createSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// 🔥 auto slug before save
productsSchema.pre("save", async function () {
  if (!this.productName) return;

  let baseSlug = createSlug(this.productName);
  let slug = baseSlug;
  let count = 1;

  const Model = mongoose.model("Products");

  while (await Model.findOne({ slug })) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  this.slug = slug;
});

const Products = mongoose.model("Products", productsSchema);
export default Products;
