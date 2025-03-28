const Subcategory = require('../models/Subcategory');

// Get all subcategories
const getAllSubcategories = async (req, res) => {
    try {
        const subcategories = await Subcategory.getAllSubcategories();
        res.status(200).json(subcategories);
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({ message: 'Error fetching subcategories', error: error.message });
    }
};

// Get subcategories by category
const getSubcategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const subcategories = await Subcategory.getSubcategoriesByCategory(categoryId);
        res.status(200).json(subcategories);
    } catch (error) {
        console.error('Error fetching subcategories by category:', error);
        res.status(500).json({ message: 'Error fetching subcategories', error: error.message });
    }
};

// Create new subcategory (admin only)
const createSubcategory = async (req, res) => {
    try {
        // Check if user is authenticated and admin
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized: Admin access required' });
        }

        const { name, category_id } = req.body;
        if (!name || !category_id) {
            return res.status(400).json({ message: 'Subcategory name and category ID are required' });
        }

        const newSubcategory = await Subcategory.createSubcategory(name, category_id);
        res.status(201).json(newSubcategory);
    } catch (error) {
        console.error('Error creating subcategory:', error);
        res.status(500).json({ message: 'Error creating subcategory', error: error.message });
    }
};

module.exports = {
    getAllSubcategories,
    getSubcategoriesByCategory,
    createSubcategory
};