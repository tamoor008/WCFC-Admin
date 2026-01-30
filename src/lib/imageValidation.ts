/**
 * Image validation utilities for admin panel uploads
 */

export interface ImageDimensions {
    width: number;
    height: number;
}

export interface ValidationResult {
    valid: boolean;
    error?: string;
    dimensions?: ImageDimensions;
}

/**
 * Get image dimensions from a File object
 */
export const getImageDimensions = (file: File): Promise<ImageDimensions> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
            URL.revokeObjectURL(img.src);
        };
        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            reject(new Error('Failed to load image'));
        };
        img.src = URL.createObjectURL(file);
    });
};

/**
 * Validate product image (1:1 square, min 800x800px)
 */
export const validateProductImage = async (file: File): Promise<ValidationResult> => {
    try {
        const { width, height } = await getImageDimensions(file);

        // Check if square
        if (width !== height) {
            return {
                valid: false,
                error: 'Product image must be square (1:1 aspect ratio)',
                dimensions: { width, height }
            };
        }

        // Check minimum size
        if (width < 800 || height < 800) {
            return {
                valid: false,
                error: 'Product image must be at least 800x800px',
                dimensions: { width, height }
            };
        }

        return { valid: true, dimensions: { width, height } };
    } catch (error) {
        return { valid: false, error: 'Failed to validate image' };
    }
};

/**
 * Validate category image (1:1 square, exactly 300x300px)
 */
export const validateCategoryImage = async (file: File): Promise<ValidationResult> => {
    try {
        const { width, height } = await getImageDimensions(file);

        // Check exact dimensions
        if (width !== 300 || height !== 300) {
            return {
                valid: false,
                error: `Category image must be exactly 300x300px (got ${width}x${height}px)`,
                dimensions: { width, height }
            };
        }

        return { valid: true, dimensions: { width, height } };
    } catch (error) {
        return { valid: false, error: 'Failed to validate image' };
    }
};

/**
 * Validate customer profile image (1:1 square, exactly 400x400px)
 */
export const validateCustomerImage = async (file: File): Promise<ValidationResult> => {
    try {
        const { width, height } = await getImageDimensions(file);

        // Check exact dimensions
        if (width !== 400 || height !== 400) {
            return {
                valid: false,
                error: `Customer profile image must be exactly 400x400px (got ${width}x${height}px)`,
                dimensions: { width, height }
            };
        }

        return { valid: true, dimensions: { width, height } };
    } catch (error) {
        return { valid: false, error: 'Failed to validate image' };
    }
};

/**
 * Validate banner image (2:1 aspect ratio, exactly 1000x500px)
 */
export const validateBannerImage = async (file: File): Promise<ValidationResult> => {
    try {
        const { width, height } = await getImageDimensions(file);

        // Check exact dimensions
        if (width !== 1000 || height !== 500) {
            return {
                valid: false,
                error: `Banner image must be exactly 1000x500px (got ${width}x${height}px)`,
                dimensions: { width, height }
            };
        }

        return { valid: true, dimensions: { width, height } };
    } catch (error) {
        return { valid: false, error: 'Failed to validate image' };
    }
};
