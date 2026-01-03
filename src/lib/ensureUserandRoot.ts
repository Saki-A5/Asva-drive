import dbConnect from "./dbConnect";
import User from "@/models/users";
import FileModel from "@/models/files";

export const ensureUserAndRoot = async (decodedToken: any) => {
    const { uid, email, name } = decodedToken;
    if (!email) {
        throw new Error("Invalid token: missing email");
    }
    await dbConnect();

    // Find or create user
    let user = await User.findOne({ email });
}