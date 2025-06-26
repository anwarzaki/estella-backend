import  Perfume  from '../models/Perfume.js';
import { v2 as cloudinary } from 'cloudinary';

// Unified error handler
const handleError = (res, error, message) => {
    console.error(`Error in ${message}:`, error);
    return res.status(500).json({
        success: false,
        message: `Error ${message}`,
        error: error.message
    });
};

export const addPerfume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image'
            });
        }

        const { name, brand, price, category, stock, description, ratings } = req.body;

        const newPerfume = new Perfume({
            name,
            brand,
            price: Number(price),
            category,
            stock: Number(stock),
            imgSrc: req.file.path,
            description: description || '',
            ratings: Number(ratings) || 0
        });

        const savedPerfume = await newPerfume.save();
        res.status(201).json({ success: true, data: savedPerfume });

    } catch (error) {
        handleError(res, error, 'adding perfume');
    }
};


export const getAllPerfumes = async (req, res) => {
    try {
        const perfumes = await Perfume.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: perfumes.length,
            data: perfumes
        });
    } catch (error) {
        handleError(res, error, 'fetching perfumes');
    }
};

export const getPerfumeById = async (req, res) => {
    try {
        const perfume = await Perfume.findById(req.params.id);
        
        if (!perfume) {
            return res.status(404).json({
                success: false,
                message: 'Perfume not found'
            });
        }

        res.status(200).json({ success: true, data: perfume });
    } catch (error) {
        handleError(res, error, 'fetching perfume');
    }
};


//   // edit and delete perfume
// export const updatePerfume = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updates = req.body;
//         let imageUpdate = {};

//         // Handle image upload if a new image is provided
//         if (req.file) {
//             // Delete old image from cloudinary
//             const existingPerfume = await Perfume.findById(id);
//             if (existingPerfume && existingPerfume.imgSrc) {
//                 const publicId = existingPerfume.imgSrc.split('/').pop().split('.')[0];
//                 await cloudinary.uploader.destroy(`perfumes/${publicId}`);
//             }

//             // Upload new image
//             const result = await cloudinary.uploader.upload(req.file.path, {
//                 folder: 'perfumes',
//             });
//             imageUpdate = { imgSrc: result.secure_url };
//         }

//         // Update perfume data
//         const updatedPerfume = await Perfume.findByIdAndUpdate(
//             id,
//             { ...updates, ...imageUpdate },
//             { new: true, runValidators: true }
//         );

//         if (!updatedPerfume) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Perfume not found'
//             });
//         }

//         res.json({
//             success: true,
//             message: 'Perfume updated successfully',
//             data: updatedPerfume
//         });

//     } catch (error) {
//         handleError(res, error, 'updating perfume');
//     }
// };

// export const deletePerfume = async (req, res) => {
//     try {
//         const perfume = await Perfume.findById(req.params.id);
        
//         if (!perfume) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Perfume not found'
//             });
//         }

//         // Delete image from cloudinary
//         if (perfume.imgSrc) {
//             const publicId = perfume.imgSrc.split('/').pop().split('.')[0];
//             await cloudinary.uploader.destroy(`perfumes/${publicId}`);
//         }

//         await Perfume.findByIdAndDelete(req.params.id);

//         res.json({ 
//             success: true, 
//             message: 'Perfume deleted successfully' 
//         });

//     } catch (error) {
//         handleError(res, error, 'deleting perfume');
//     }
// };



export const updatePerfume = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Convert price and stock to numbers
        if (updates.price) updates.price = Number(updates.price);
        if (updates.stock) updates.stock = Number(updates.stock);

        let imageUpdate = {};

        // Handle image upload if a new image is provided
        if (req.file) {
            try {
                // Delete old image from cloudinary if it exists
                const existingPerfume = await Perfume.findById(id);
                if (existingPerfume && existingPerfume.imgSrc) {
                    const publicId = existingPerfume.imgSrc.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`perfumes/${publicId}`);
                }

                // Upload new image
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'perfumes',
                });
                imageUpdate = { imgSrc: result.secure_url };
            } catch (cloudinaryError) {
                console.error('Cloudinary error:', cloudinaryError);
                return res.status(500).json({
                    success: false,
                    message: 'Error processing image upload'
                });
            }
        }

        // Update perfume data
        const updatedPerfume = await Perfume.findByIdAndUpdate(
            id,
            { ...updates, ...imageUpdate },
            { new: true, runValidators: true }
        );

        if (!updatedPerfume) {
            return res.status(404).json({
                success: false,
                message: 'Perfume not found'
            });
        }

        res.json({
            success: true,
            message: 'Perfume updated successfully',
            data: updatedPerfume
        });

    } catch (error) {
        console.error('Update error:', error);
        handleError(res, error, 'updating perfume');
    }
};

export const deletePerfume = async (req, res) => {
    try {
        const perfume = await Perfume.findById(req.params.id);
        
        if (!perfume) {
            return res.status(404).json({
                success: false,
                message: 'Perfume not found'
            });
        }

        // Delete image from cloudinary if it exists
        if (perfume.imgSrc) {
            try {
                const publicId = perfume.imgSrc.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`perfumes/${publicId}`);
            } catch (cloudinaryError) {
                console.error('Cloudinary delete error:', cloudinaryError);
                // Continue with perfume deletion even if image deletion fails
            }
        }

        await Perfume.findByIdAndDelete(req.params.id);

        res.json({ 
            success: true, 
            message: 'Perfume deleted successfully' 
        });

    } catch (error) {
        handleError(res, error, 'deleting perfume');
    }
};