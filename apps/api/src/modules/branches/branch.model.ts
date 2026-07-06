import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true, validate: { validator: (value: number[]) => value.length === 2, message: 'Coordinates must contain longitude and latitude' } }
  },
  { _id: false }
);

const branchSchema = new mongoose.Schema(
  {
    retailerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer', required: true, index: true },
    externalBranchId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    postalCode: { type: String, required: false, trim: true },
    country: { type: String, required: true, trim: true, default: 'AR' },
    phone: { type: String, required: false, trim: true },
    location: { type: locationSchema, required: true },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

branchSchema.index({ retailerId: 1, externalBranchId: 1 }, { unique: true });
branchSchema.index({ location: '2dsphere' });

export type BranchDocument = InferSchemaType<typeof branchSchema> & { _id: mongoose.Types.ObjectId; createdAt: Date; updatedAt: Date };
export const BranchModel: Model<BranchDocument> = mongoose.model<BranchDocument>('Branch', branchSchema);
