const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = ['uploads', 'uploads/partners', 'uploads/news', 'uploads/portfolio'];
  
  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage for partner logos
const partnerStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/partners'));
  },
  filename: function(req, file, cb) {
    cb(null, `partner-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Configure storage for news images
const newsStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/news'));
  },
  filename: function(req, file, cb) {
    cb(null, `news-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Configure storage for portfolio images
const portfolioStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/portfolio');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `portfolio-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Create multer instances
const uploadPartnerLogo = multer({
  storage: partnerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
}).single('logo');

const uploadNewsImage = multer({
  storage: newsStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
}).single('featuredImage');

const uploadPortfolioImage = multer({
  storage: portfolioStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
}).single('featuredImage'); // Changed from 'image' to 'featuredImage'

// Middleware wrappers
const uploadPartnerLogoMiddleware = (req, res, next) => {
  // Skip file upload if we're just updating isActive status
  if (req.method === 'PUT' && req.body && (req.body.isActive !== undefined) && Object.keys(req.body).length === 1) {
    console.log('Skipping file upload for isActive update');
    return next();
  }
  
  uploadPartnerLogo(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

const uploadNewsImageMiddleware = (req, res, next) => {
  uploadNewsImage(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

const uploadPortfolioImageMiddleware = (req, res, next) => {
  uploadPortfolioImage(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    // Log the file information
    if (req.file) {
      console.log('File uploaded successfully:', req.file);
    } else {
      console.log('No file uploaded');
      // Don't require file for updates
      if (req.method === 'PUT') {
        console.log('Update operation - file not required');
      }
    }
    
    next();
  });
};

module.exports = {
  uploadPartnerLogoMiddleware,
  uploadNewsImageMiddleware,
  uploadPortfolioImageMiddleware
};