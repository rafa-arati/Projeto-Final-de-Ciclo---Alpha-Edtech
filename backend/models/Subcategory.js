const pool = require('../config/db');

// Get all subcategories
const getAllSubcategories = async () => {
    try {
        const query = `
      SELECT s.*, c.name as category_name 
      FROM subcategories s
      JOIN categories c ON s.category_id = c.id
      ORDER BY c.name, s.name
    `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        throw error;
    }
};

// Get subcategories by category ID
const getSubcategoriesByCategory = async (categoryId) => {
    try {
        const query = 'SELECT * FROM subcategories WHERE category_id = $1 ORDER BY name';
        const result = await pool.query(query, [categoryId]);
        return result.rows;
    } catch (error) {
        console.error("Error fetching subcategories by category:", error);
        throw error;
    }
};

// Create new subcategory
const createSubcategory = async (name, categoryId) => {
    try {
        const query = 'INSERT INTO subcategories (name, category_id) VALUES ($1, $2) RETURNING *';
        const result = await pool.query(query, [name, categoryId]);
        return result.rows[0];
    } catch (error) {
        console.error("Error creating subcategory:", error);
        throw error;
    }
};

module.exports = {
    getAllSubcategories,
    getSubcategoriesByCategory,
    createSubcategory
};