const Category = require('../models/Category');

// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.getAllCategories();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

// Get categories with subcategories
const getCategoriesWithSubcategories = async (req, res) => {
    try {
        const categoriesWithSubs = await Category.getCategoriesWithSubcategories();
        res.status(200).json(categoriesWithSubs);
    } catch (error) {
        console.error('Error fetching categories with subcategories:', error);
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

// Create new category (admin only)
const createCategory = async (req, res) => {
    try {
        // Check if user is authenticated and admin
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized: Admin access required' });
        }

        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const newCategory = await Category.createCategory(name);
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Error creating category', error: error.message });
    }
};

module.exports = {
    getAllCategories,
    getCategoriesWithSubcategories,
    createCategory
};