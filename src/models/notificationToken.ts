import {Schema, models, model} from "mongoose";

const TokenSchema = new Schema({
  userId: { type: String, required: true },
  token: { type: String, required: true, unique: true },
});

const notificationToken = models.Token || model("Token", TokenSchema);

export default notificationToken;
