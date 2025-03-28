const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const subcategoryController = require('../controllers/subcategoryController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// Category routes
router.get('/categories', categoryController.getAllCategories);
router.get('/categories-with-subcategories', categoryController.getCategoriesWithSubcategories);
router.post('/categories', authenticate, isAdmin, categoryController.createCategory);

// Subcategory routes
router.get('/subcategories', subcategoryController.getAllSubcategories);
router.get('/categories/:categoryId/subcategories', subcategoryController.getSubcategoriesByCategory);
router.post('/subcategories', authenticate, isAdmin, subcategoryController.createSubcategory);

module.exports = router;