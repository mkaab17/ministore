/**
 * Uploads an image to ImgBB (Alternative to Firebase Storage)
 * @param {Blob|File} imageBlob - The image to upload
 * @returns {Promise<string>} - The direct image URL
 */
export const uploadImageToCloud = async (imageBlob) => {
    const API_KEY = '7c2634ea043bffa1de4bb29180e394ea';

    const formData = new FormData();
    formData.append('image', imageBlob);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        if (data.success) {
            return data.data.url;
        } else {
            throw new Error(data.error.message || 'Upload failed');
        }
    } catch (error) {
        console.error('Cloud Upload Error:', error);
        throw error;
    }
};
