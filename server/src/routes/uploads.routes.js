import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/authenticate.js';
import { uploadResume, uploadItemImage, uploadAvatar } from '../controllers/uploads.controller.js';

const router = Router();

function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError || err.status === 400) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
}

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(Object.assign(new Error('Only PDF files are allowed'), { status: 400 }));
    } else {
      cb(null, true);
    }
  },
});

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(Object.assign(new Error('Only JPEG, PNG, or WEBP images are allowed'), { status: 400 }));
    } else {
      cb(null, true);
    }
  },
});

router.post('/resume',     authenticate, pdfUpload.single('resume'),   multerErrorHandler, uploadResume);
router.post('/avatar',     authenticate, imageUpload.single('avatar'), multerErrorHandler, uploadAvatar);
router.post('/item-image', authenticate, imageUpload.single('image'),  multerErrorHandler, uploadItemImage);

export default router;
