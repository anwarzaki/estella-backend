import express from 'express';
import { addFeed, deleteFeed, getAllFeeds, getFeedById, updateFeed } from '../controllers/feedController.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

router.post('/', upload , addFeed);
router.get('/', getAllFeeds);
router.get('/:id', getFeedById);
router.put('/:id',upload, updateFeed);
router.delete('/:id', deleteFeed);

export default router;

