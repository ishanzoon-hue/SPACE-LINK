"use client";

import { CldUploadWidget } from 'next-cloudinary';

const ImageUpload = () => {
  return (
    <CldUploadWidget 
      uploadPreset="elimeno_uploads" // මෙය Cloudinary settings වල පසුව සකස් කරමු
      onSuccess={(result: any) => {
        console.log("Image URL is:", imageUrl);
        // මෙහිදී ලැබෙන URL එක ඔබේ Database එකට (Supabase) යැවිය හැකියි
      }}
    >
      {({ open }) => {
        return (
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => open()}
          >
            Upload an Image
          </button>
        );
      }}
    </CldUploadWidget>
  );
};

export default ImageUpload;