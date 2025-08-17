import dotenv from 'dotenv';
import connectDB from './config/db';
import createApp from './expressApp';

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}); 