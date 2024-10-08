const express = require('express');
const app = express();

const userRoutes = require('./routes/User');
const profileRoutes = require('./routes/Profile');
const paymentRoutes = require('./routes/Payments');
const courseRoutes = require('./routes/Course');

const { dbConnect } = require('./config/database'); // Correct import for dbConnect
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { cloudinaryConnect } = require('./config/cloudinary');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT || 5000;

// DB connect
dbConnect();

// Middleware

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "https://study-notion-six-eta.vercel.app",
        credentials: true,
        methods: 'GET, POST, PUT, DELETE',
        allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    })
);

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp',
    })
);

// Cloudinary connection
cloudinaryConnect();

// Routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/payment', paymentRoutes);

// Default route
app.get('/', (req, res) => {
    return res.json({
        success: true,
        message: "Your server is up and running",
    });
});

app.listen(PORT, () => {
    console.log(`Server online at ${PORT}`);
});
