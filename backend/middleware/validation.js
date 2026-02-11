/**
 * Validation Schemas for CRUD Operations
 * Provides validation for all admin CRUD operations on destinations, activities, and packages
 */

const { body, param, query, validationResult } = require('express-validator');

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// ============================================
// DESTINATION VALIDATION SCHEMAS
// ============================================

const validateDestinationCreate = [
    body('name')
        .trim()
        .notEmpty().withMessage('Destination name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
    body('slug')
        .trim()
        .notEmpty().withMessage('Slug is required')
        .isLength({ min: 2, max: 100 }).withMessage('Slug must be between 2 and 100 characters')
        .matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    
    body('short_description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Short description cannot exceed 500 characters'),
    
    body('location')
        .trim()
        .notEmpty().withMessage('Location is required')
        .isLength({ max: 200 }).withMessage('Location cannot exceed 200 characters'),
    
    body('region')
        .trim()
        .notEmpty().withMessage('Region is required')
        .isLength({ max: 100 }).withMessage('Region cannot exceed 100 characters'),
    
    body('country')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Country cannot exceed 100 characters')
        .default('Philippines'),
    
    body('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    
    body('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    
    body('hero_image')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isURL().withMessage('Hero image must be a valid URL'),
    
    body('highlights')
        .optional()
        .isArray().withMessage('Highlights must be an array'),
    
    body('highlights.*')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Each highlight cannot exceed 200 characters'),
    
    body('best_time_to_visit')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Best time to visit cannot exceed 200 characters'),
    
    body('average_rating')
        .optional()
        .isFloat({ min: 0, max: 5 }).withMessage('Average rating must be between 0 and 5'),
    
    body('total_reviews')
        .optional()
        .isInt({ min: 0 }).withMessage('Total reviews must be a non-negative integer'),
    
    body('is_featured')
        .optional()
        .isBoolean().withMessage('is_featured must be a boolean'),
    
    body('is_active')
        .optional()
        .isBoolean().withMessage('is_active must be a boolean'),
    
    handleValidationErrors
];

const validateDestinationUpdate = [
    param('id')
        .isUUID(4).withMessage('Invalid destination ID (must be UUID v4)'),
    
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Destination name cannot be empty')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
    body('slug')
        .optional()
        .trim()
        .notEmpty().withMessage('Slug cannot be empty')
        .matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    
    body('short_description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Short description cannot exceed 500 characters'),
    
    body('location')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Location cannot exceed 200 characters'),
    
    body('region')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Region cannot exceed 100 characters'),
    
    body('is_featured')
        .optional()
        .isBoolean().withMessage('is_featured must be a boolean'),
    
    body('is_active')
        .optional()
        .isBoolean().withMessage('is_active must be a boolean'),
    
    handleValidationErrors
];

const validateDestinationId = [
    param('id')
        .isUUID(4).withMessage('Invalid destination ID (must be UUID v4)'),
    
    handleValidationErrors
];

// ============================================
// ACTIVITY VALIDATION SCHEMAS
// ============================================

const validateActivityCreate = [
    body('destination_id')
        .notEmpty().withMessage('Destination ID is required')
        .isUUID(4).withMessage('Destination ID must be a valid UUID v4'),
    
    body('name')
        .trim()
        .notEmpty().withMessage('Activity name is required')
        .isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),
    
    body('slug')
        .trim()
        .notEmpty().withMessage('Slug is required')
        .isLength({ min: 2, max: 200 }).withMessage('Slug must be between 2 and 200 characters')
        .matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    
    body('short_description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Short description cannot exceed 500 characters'),
    
    body('activity_type')
        .trim()
        .notEmpty().withMessage('Activity type is required')
        .isIn(['tour', 'adventure', 'water', 'cultural', 'nature', 'food', 'relaxation', 'other'])
        .withMessage('Invalid activity type'),
    
    body('duration')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Duration cannot exceed 100 characters'),
    
    body('difficulty')
        .optional()
        .trim()
        .isIn(['easy', 'moderate', 'challenging', 'extreme'])
        .withMessage('Invalid difficulty level'),
    
    body('max_group_size')
        .optional()
        .isInt({ min: 1, max: 1000 }).withMessage('Max group size must be between 1 and 1000'),
    
    body('min_participants')
        .optional()
        .isInt({ min: 1, max: 1000 }).withMessage('Min participants must be between 1 and 1000'),
    
    body('max_participants')
        .optional()
        .isInt({ min: 1, max: 1000 }).withMessage('Max participants must be between 1 and 1000'),
    
    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    
    body('discount_price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Discount price must be a positive number'),
    
    body('currency')
        .optional()
        .trim()
        .isIn(['PHP', 'USD']).withMessage('Currency must be PHP or USD')
        .default('PHP'),
    
    body('image_url')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isURL().withMessage('Image URL must be a valid URL'),
    
    body('inclusions')
        .optional()
        .isArray().withMessage('Inclusions must be an array'),
    
    body('exclusions')
        .optional()
        .isArray().withMessage('Exclusions must be an array'),
    
    body('requirements')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Requirements cannot exceed 1000 characters'),
    
    body('cancellation_policy')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Cancellation policy cannot exceed 1000 characters'),
    
    body('average_rating')
        .optional()
        .isFloat({ min: 0, max: 5 }).withMessage('Average rating must be between 0 and 5'),
    
    body('total_reviews')
        .optional()
        .isInt({ min: 0 }).withMessage('Total reviews must be a non-negative integer'),
    
    body('is_featured')
        .optional()
        .isBoolean().withMessage('is_featured must be a boolean'),
    
    body('is_active')
        .optional()
        .isBoolean().withMessage('is_active must be a boolean'),
    
    handleValidationErrors
];

const validateActivityUpdate = [
    param('id')
        .isUUID(4).withMessage('Invalid activity ID (must be UUID v4)'),
    
    body('destination_id')
        .optional()
        .isUUID(4).withMessage('Destination ID must be a valid UUID v4'),
    
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Activity name cannot be empty')
        .isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),
    
    body('price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    
    body('is_featured')
        .optional()
        .isBoolean().withMessage('is_featured must be a boolean'),
    
    body('is_active')
        .optional()
        .isBoolean().withMessage('is_active must be a boolean'),
    
    handleValidationErrors
];

const validateActivityId = [
    param('id')
        .isUUID(4).withMessage('Invalid activity ID (must be UUID v4)'),
    
    handleValidationErrors
];

// ============================================
// PACKAGE VALIDATION SCHEMAS
// ============================================

const validatePackageCreate = [
    body('destination_id')
        .optional()
        .isUUID(4).withMessage('Destination ID must be a valid UUID v4'),
    
    body('name')
        .trim()
        .notEmpty().withMessage('Package name is required')
        .isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),
    
    body('slug')
        .trim()
        .notEmpty().withMessage('Slug is required')
        .isLength({ min: 2, max: 200 }).withMessage('Slug must be between 2 and 200 characters')
        .matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    
    body('short_description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Short description cannot exceed 500 characters'),
    
    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    
    body('duration')
        .optional()
        .isInt({ min: 1, max: 365 }).withMessage('Duration must be between 1 and 365 days')
        .default(1),
    
    body('package_type')
        .optional()
        .trim()
        .isIn(['all-inclusive', 'day-tour', 'custom', 'group'])
        .withMessage('Invalid package type'),
    
    body('hero_image')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isURL().withMessage('Hero image must be a valid URL'),
    
    body('image_url')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isURL().withMessage('Image URL must be a valid URL'),
    
    body('gallery')
        .optional()
        .isArray().withMessage('Gallery must be an array of URLs'),
    
    body('activities')
        .optional()
        .isArray().withMessage('Activities must be an array'),
    
    body('activities.*')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Each activity cannot exceed 200 characters'),
    
    body('inclusions')
        .optional()
        .isArray().withMessage('Inclusions must be an array'),
    
    body('inclusions.*')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Each inclusion cannot exceed 200 characters'),
    
    body('exclusions')
        .optional()
        .isArray().withMessage('Exclusions must be an array'),
    
    body('exclusions.*')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Each exclusion cannot exceed 200 characters'),
    
    body('is_featured')
        .optional()
        .isBoolean().withMessage('is_featured must be a boolean'),
    
    body('is_active')
        .optional()
        .isBoolean().withMessage('is_active must be a boolean'),
    
    handleValidationErrors
];

const validatePackageUpdate = [
    param('id')
        .isUUID(4).withMessage('Invalid package ID (must be UUID v4)'),
    
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Package name cannot be empty')
        .isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),
    
    body('price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    
    body('duration')
        .optional()
        .isInt({ min: 1, max: 365 }).withMessage('Duration must be between 1 and 365 days'),
    
    body('is_featured')
        .optional()
        .isBoolean().withMessage('is_featured must be a boolean'),
    
    body('is_active')
        .optional()
        .isBoolean().withMessage('is_active must be a boolean'),
    
    handleValidationErrors
];

const validatePackageId = [
    param('id')
        .isUUID(4).withMessage('Invalid package ID (must be UUID v4)'),
    
    handleValidationErrors
];

// ============================================
// COMMON VALIDATION SCHEMAS
// ============================================

const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer')
        .toInt(),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
        .toInt(),
    
    query('sortBy')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Sort field cannot exceed 50 characters'),
    
    query('sortOrder')
        .optional()
        .trim()
        .isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
    
    handleValidationErrors
];

const validateSearch = [
    query('search')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Search query cannot exceed 200 characters'),
    
    handleValidationErrors
];

const validateStatusFilter = [
    query('is_active')
        .optional()
        .isIn(['true', 'false']).withMessage('is_active must be true or false'),
    
    query('is_featured')
        .optional()
        .isIn(['true', 'false']).withMessage('is_featured must be true or false'),
    
    handleValidationErrors
];

module.exports = {
    // Destination validators
    validateDestinationCreate,
    validateDestinationUpdate,
    validateDestinationId,
    
    // Activity validators
    validateActivityCreate,
    validateActivityUpdate,
    validateActivityId,
    
    // Package validators
    validatePackageCreate,
    validatePackageUpdate,
    validatePackageId,
    
    // Common validators
    validatePagination,
    validateSearch,
    validateStatusFilter,
    
    // Middleware
    handleValidationErrors
};
