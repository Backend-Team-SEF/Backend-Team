import mongoose from "mongoose";
export const connectionDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log("Database Connected Successfully");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
}