// routes/perfumeRoutes.js
import express from 'express';
import upload from '../config/cloudinary.js';
import { addPerfume, deletePerfume, getAllPerfumes,  getPerfumeById, updatePerfume} from '../controllers/perfumeController.js';

const router = express.Router();

router.post('/', upload, addPerfume);         // Create new perfume
router.get('/', getAllPerfumes);              // Get all perfumes
router.get('/:id', getPerfumeById);           // Get single perfume
router.put('/:id', upload, updatePerfume);
router.delete('/:id', deletePerfume);

export default router;