const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const PaymentSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Customer name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters'],
        match: [/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces']
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    phone: { 
        type: String, 
        required: [true, 'Phone number is required'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^(\+\d{1,3}[-\s]?)?(\(\d{3}\)|\d{3})[-\s]?\d{3}[-\s]?\d{4}$/.test(v);
            },
            message: 'Please provide a valid phone number'
        }
    },
    travelers: { 
        type: Number, 
        required: [true, 'Number of travelers is required'],
        min: [1, 'Travelers must be at least 1'],
        max: [10, 'Maximum 10 travelers allowed'],
        validate: {
            validator: Number.isInteger,
            message: 'Number of travelers must be a whole number'
        }
    },
    paymentMethod: { 
        type: String, 
        required: [true, 'Payment method is required'],
        enum: {
            values: ['credit', 'debit', 'upi', 'netbanking', 'paypal'],
            message: 'Invalid payment method'
        }
    },
    packageDetails: {
        packageId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Package', 
            required: [true, 'Package ID is required']
        },
        packageName: { 
            type: String, 
            required: [true, 'Package name is required'],
            trim: true
        },
        packageCharge: { 
            type: Number, 
            required: [true, 'Package charge is required'],
            min: [0, 'Package charge cannot be negative'],
            validate: {
                validator: Number.isFinite,
                message: 'Package charge must be a valid number'
            }
        },
        duration: { 
            type: String, 
            required: [true, 'Package duration is required'],
            trim: true
        }
    },
    guideDetails: {
        guideId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Guide'
        },
        guideName: {
            type: String,
            trim: true
        },
        guideCharge: { 
            type: Number, 
            min: [0, 'Guide charge cannot be negative'],
            default: 0,
            validate: {
                validator: Number.isFinite,
                message: 'Guide charge must be a valid number'
            }
        }
    },
    totalAmount: { 
        type: Number, 
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative'],
        validate: {
            validator: Number.isFinite,
            message: 'Total amount must be a valid number'
        }
    },
    paymentStatus: {
        type: String,
        enum: {
            values: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
            message: 'Invalid payment status'
        },
        default: 'pending'
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        immutable: true
    },
    cancelledAt: { 
        type: Date, 
        default: null
    },
    transactionId: {
        type: String,
        unique: true,
        default: () => `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual property for formatted total amount
PaymentSchema.virtual('formattedTotalAmount').get(function() {
    return this.totalAmount != null ? `$${this.totalAmount.toFixed(2)}` : 'Amount not set';
});

// Virtual for calculating the expected total amount based on package and guide charges
PaymentSchema.virtual('calculatedAmount').get(function() {
    const packageTotal = this.packageDetails?.packageCharge * this.travelers || 0;
    const guideTotal = this.guideDetails?.guideCharge || 0;
    return packageTotal + guideTotal;
});

// Pre-save hook to validate total amount matches calculated charges
PaymentSchema.pre('save', function(next) {
    // Only auto-calculate if totalAmount isn't explicitly set
    if (this.isNew && this.totalAmount === undefined) {
        const packageTotal = this.packageDetails.packageCharge * this.travelers;
        const guideTotal = this.guideDetails.guideCharge || 0;
        this.totalAmount = packageTotal + guideTotal;
    }
    
    // Optional validation: ensure total matches components (can uncomment if needed)
    /*
    const calculatedTotal = this.calculatedAmount;
    if (Math.abs(this.totalAmount - calculatedTotal) > 0.01) {
        return next(new Error(`Total amount ${this.totalAmount} doesn't match calculated amount ${calculatedTotal}`));
    }
    */
    
    next();
});

// Indexing for better query performance
PaymentSchema.index({ transactionId: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ paymentStatus: 1 });
PaymentSchema.index({ 'packageDetails.packageId': 1 });
PaymentSchema.index({ 'guideDetails.guideId': 1 });

// Add pagination plugin
PaymentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Payment', PaymentSchema);