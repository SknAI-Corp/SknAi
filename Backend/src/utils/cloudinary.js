import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET
  });

const uploadOnCloudinary = async (localfilePath) => {
    try {
        if(!localfilePath) return null
        const response = await cloudinary.uploader.upload(localfilePath, {
            resource_type: 'auto',
        })
        console.log("File has been Successfully Uploaded!", response.url)
        fs.unlinkSync(localfilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localfilePath)
        return null
    }
}

const uploadPdfToCloudinary = async (localfilePath) => {
    try {
        if (!localfilePath) return null;
        const response = await cloudinary.uploader.upload(localfilePath, {
            resource_type: 'raw', // use 'raw' for PDF
        });
        console.log("PDF uploaded successfully", response.url);
        fs.unlinkSync(localfilePath); // Delete local file after upload
        return response;
    } catch (error) {
        fs.unlinkSync(localfilePath);
        return null;
    }
}

export {uploadOnCloudinary, uploadPdfToCloudinary}