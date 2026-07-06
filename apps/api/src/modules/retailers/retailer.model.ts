import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const retailerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, required: false, trim: true, maxlength: 500 },
    logoUrl: { type: String, required: false, trim: true },
    websiteUrl: { type: String, required: false, trim: true },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

retailerSchema.index({ slug: 1 }, { unique: true });

export type RetailerDocument = InferSchemaType<typeof retailerSchema> & { _id: mongoose.Types.ObjectId; createdAt: Date; updatedAt: Date };
export const RetailerModel: Model<RetailerDocument> = mongoose.model<RetailerDocument>('Retailer', retailerSchema);
