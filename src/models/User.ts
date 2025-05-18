import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    favoriteClubs: { clubId: string; viewCount: number }[];
    blacklistedClubs: { clubId: string; reason: string }[];
    favoriteLeague?: string;
    quizHighScore: number;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    favoriteClubs: [{
        clubId: String,
        viewCount: { type: Number, default: 0 }
    }],
    blacklistedClubs: [{
        clubId: String,
        reason: String
    }],
    favoriteLeague: String,
    quizHighScore: { type: Number, default: 0 }
}, { timestamps: true });

// Wachtwoord hashing voor het opslaan
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Methode om wachtwoorden te vergelijken
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);