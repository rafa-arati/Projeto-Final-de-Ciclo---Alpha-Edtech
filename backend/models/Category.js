const pool = require('../config/db');

// Get all categories
const getAllCategories = async () => {
    try {
        const query = 'SELECT * FROM categories ORDER BY name';
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};

// Get category by ID
const getCategoryById = async (id) => {
    try {
        const query = 'SELECT * FROM categories WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        console.error("Error fetching category by ID:", error);
        throw error;
    }
};

// Create new category
const createCategory = async (name) => {
    try {
        const query = 'INSERT INTO categories (name) VALUES ($1) RETURNING *';
        const result = await pool.query(query, [name]);
        return result.rows[0];
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
};

// Get categories with subcategories
const getCategoriesWithSubcategories = async () => {
    try {
        const query = `
      SELECT c.id, c.name, 
        json_agg(json_build_object('id', s.id, 'name', s.name)) as subcategories
      FROM categories c 
      LEFT JOIN subcategories s ON c.id = s.category_id
      GROUP BY c.id, c.name
      ORDER BY c.name
    `;
        const result = await pool.query(query);

        // Handle null subcategories for categories without subcategories
        const processedResult = result.rows.map(category => {
            if (category.subcategories[0] && category.subcategories[0].id === null) {
                category.subcategories = [];
            }
            return category;
        });

        return processedResult;
    } catch (error) {
        console.error("Error fetching categories with subcategories:", error);
        throw error;
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    getCategoriesWithSubcategories
};