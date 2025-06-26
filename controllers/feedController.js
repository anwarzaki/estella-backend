import { Feed } from '../models/feed.js';
import { v2 as cloudinary } from 'cloudinary';

// Helper function for consistent error handling
const handleError = (res, error, message) => {
  console.error(`Error in ${message}:`, error);
  return res.status(500).json({
    success: false,
    message: `Error ${message}`,
    error: error.message
  });
};

export const addFeed = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const validCategories = ["men", "women", "unisex"];
    if (!validCategories.includes(category.toLowerCase())) {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    // Get the optimized Cloudinary URL
    const optimizedUrl = req.file.path.replace('/upload/', '/upload/q_auto:best,f_auto/');

    const newFeed = new Feed({
      title: title.trim(),
      content: content.trim(),
      category: category.toLowerCase(),
      imgSrc: optimizedUrl,
    });

    const savedFeed = await newFeed.save();

    res.status(201).json({ success: true, data: savedFeed });
  } catch (error) {
    handleError(res, error, "adding feed");
  }
};

// Get all feeds
export const getAllFeeds = async (req, res) => {
  try {
    const feeds = await Feed.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feeds.length,
      data: feeds
    });
  } catch (error) {
    handleError(res, error, 'fetching feeds');
  }
};

// Get single feed
export const getFeedById = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    
    if (!feed) {
      return res.status(404).json({
        success: false,
        message: 'Feed not found'
      });
    }

    res.status(200).json({
      success: true,
      data: feed
    });
  } catch (error) {
    handleError(res, error, 'fetching feed');
  }
};

// Update feed
export const updateFeed = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;
    let updates = { title, content, category };

    // Validate title length if provided
    if (title && title.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Title must be less than 100 characters'
      });
    }

    // Validate category if provided
    if (category) {
      const normalizedCategory = category.toLowerCase();
      const validCategories = ['men', 'women', 'unisex'];
      if (!validCategories.includes(normalizedCategory)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
      updates.category = normalizedCategory;
    }

    // Handle image update if new file is uploaded
    if (req.file) {
      try {
        // Delete old image from Cloudinary if it exists
        const existingFeed = await Feed.findById(id);
        if (existingFeed && existingFeed.imgSrc) {
          const publicId = existingFeed.imgSrc.split('/').slice(-1)[0].split('.')[0];
          await cloudinary.uploader.destroy(`feeds/${publicId}`);
        }
        updates.imgSrc = req.file.path;
      } catch (cloudinaryError) {
        console.error('Cloudinary error:', cloudinaryError);
        return res.status(500).json({
          success: false,
          message: 'Error processing image upload'
        });
      }
    }

    // Update feed document
    const updatedFeed = await Feed.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedFeed) {
      return res.status(404).json({
        success: false,
        message: 'Feed not found'
      });
    }

    res.json({
      success: true,
      message: 'Feed updated successfully',
      data: updatedFeed
    });

  } catch (error) {
    handleError(res, error, 'updating feed');
  }
};

// Delete feed
export const deleteFeed = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    
    if (!feed) {
      return res.status(404).json({
        success: false,
        message: 'Feed not found'
      });
    }

    // Delete image from Cloudinary
    if (feed.imgSrc) {
      try {
        const publicId = feed.imgSrc.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(`feeds/${publicId}`);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
      }
    }

    // Delete feed document
    await Feed.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Feed deleted successfully'
    });

  } catch (error) {
    handleError(res, error, 'deleting feed');
  }
};