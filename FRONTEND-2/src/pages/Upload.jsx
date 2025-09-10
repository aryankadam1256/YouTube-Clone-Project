// src/pages/Upload.jsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { videoAPI } from '../api';

// const Upload = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     videoFile: null
//   });
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [error, setError] = useState(null);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Validate file type
//       if (!file.type.startsWith('video/')) {
//         setError('Please select a valid video file');
//         return;
//       }
      
//       // Validate file size (100MB limit)
//       if (file.size > 100 * 1024 * 1024) {
//         setError('File size must be less than 100MB');
//         return;
//       }
      
//       setFormData(prev => ({
//         ...prev,
//         videoFile: file
//       }));
//       setError(null);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!formData.title.trim()) {
//       setError('Title is required');
//       return;
//     }
    
//     if (!formData.videoFile) {
//       setError('Please select a video file');
//       return;
//     }

//     setIsUploading(true);
//     setError(null);

//     try {
//       const uploadData = new FormData();
//       uploadData.append('title', formData.title);
//       uploadData.append('description', formData.description);
//       uploadData.append('videoFile', formData.videoFile);

//       const response = await videoAPI.uploadVideo(uploadData);
      
//       // Redirect to the uploaded video
//       navigate(`/video/${response.data.data._id}`);
//     } catch (error) {
//       console.error('Upload error:', error);
//       setError(error.response?.data?.message || 'Failed to upload video');
//     } finally {
//       setIsUploading(false);
//       setUploadProgress(0);
//     }
//   };

//   return (
//     <div className="px-6 py-6">
//       <div className="max-w-2xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Video</h1>
        
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Video File Upload */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Video File *
//             </label>
//             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
//               <input
//                 type="file"
//                 accept="video/*"
//                 onChange={handleFileChange}
//                 className="hidden"
//                 id="video-upload"
//                 disabled={isUploading}
//               />
//               <label htmlFor="video-upload" className="cursor-pointer">
//                 {formData.videoFile ? (
//                   <div>
//                     <div className="text-green-600 text-lg mb-2">✓</div>
//                     <p className="text-sm text-gray-600">{formData.videoFile.name}</p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       {(formData.videoFile.size / (1024 * 1024)).toFixed(2)} MB
//                     </p>
//                   </div>
//                 ) : (
//                   <div>
//                     <div className="text-gray-400 text-4xl mb-4">📹</div>
//                     <p className="text-lg font-medium text-gray-700">Choose video file</p>
//                     <p className="text-sm text-gray-500 mt-1">
//                       MP4, WebM, or other video formats (max 100MB)
//                     </p>
//                   </div>
//                 )}
//               </label>
//             </div>
//           </div>

//           {/* Title */}
//           <div>
//             <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
//               Title *
//             </label>
//             <input
//               type="text"
//               id="title"
//               name="title"
//               value={formData.title}
//               onChange={handleInputChange}
//               placeholder="Enter video title"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
//               disabled={isUploading}
//               required
//             />
//           </div>

//           {/* Description */}
//           <div>
//             <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
//               Description
//             </label>
//             <textarea
//               id="description"
//               name="description"
//               value={formData.description}
//               onChange={handleInputChange}
//               placeholder="Enter video description"
//               rows="4"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 resize-none"
//               disabled={isUploading}
//             />
//           </div>

//           {/* Error Message */}
//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
//               {error}
//             </div>
//           )}

//           {/* Upload Progress */}
//           {isUploading && (
//             <div className="bg-blue-50 border border-blue-200 rounded p-4">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm font-medium text-blue-700">Uploading...</span>
//                 <span className="text-sm text-blue-600">{uploadProgress}%</span>
//               </div>
//               <div className="w-full bg-blue-200 rounded-full h-2">
//                 <div
//                   className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                   style={{ width: `${uploadProgress}%` }}
//                 ></div>
//               </div>
//             </div>
//           )}

//           {/* Submit Button */}
//           <div className="flex space-x-4">
//             <button
//               type="submit"
//               disabled={isUploading || !formData.title.trim() || !formData.videoFile}
//               className="flex-1 bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isUploading ? 'Uploading...' : 'Upload Video'}
//             </button>
//             <button
//               type="button"
//               onClick={() => navigate('/')}
//               disabled={isUploading}
//               className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Upload;

// src/pages/Upload.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../api';

const Upload = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }
      
      if (file.size > 100 * 1024 * 1024) {
        setError('File size must be less than 100MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        videoFile: file
      }));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.videoFile) {
      setError('Please select a video file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('videoFile', formData.videoFile);

      const response = await videoAPI.uploadVideo(uploadData);
      navigate(`/video/${response.data.data._id}`);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="main-content">
      <div className="form-container" style={{margin: '0 auto', maxWidth: '600px'}}>
        <h1 className="form-title">Upload Video</h1>
        
        <form onSubmit={handleSubmit}>
          {/* Video File Upload */}
          <div className="form-group">
            <label className="form-label">Video File *</label>
            <div className="upload-area" onClick={() => document.getElementById('video-upload').click()}>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                style={{display: 'none'}}
                id="video-upload"
                disabled={isUploading}
              />
              {formData.videoFile ? (
                <div>
                  <div className="upload-icon" style={{color: '#00aa00'}}>✓</div>
                  <div className="upload-text">{formData.videoFile.name}</div>
                  <div className="upload-subtext">
                    {(formData.videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              ) : (
                <div>
                  <div className="upload-icon">📹</div>
                  <div className="upload-text">Choose video file</div>
                  <div className="upload-subtext">
                    MP4, WebM, or other video formats (max 100MB)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter video title"
              className="form-input"
              disabled={isUploading}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter video description"
              className="form-textarea"
              disabled={isUploading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#fee', 
              border: '1px solid #fcc', 
              color: '#c00', 
              padding: '12px', 
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div style={{
              background: '#e3f2fd', 
              border: '1px solid #bbdefb', 
              borderRadius: '4px', 
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <span style={{fontSize: '14px', fontWeight: '500', color: '#1976d2'}}>Uploading...</span>
                <span style={{fontSize: '14px', color: '#1976d2'}}>{uploadProgress}%</span>
              </div>
              <div style={{width: '100%', background: '#bbdefb', borderRadius: '4px', height: '8px'}}>
                <div
                  style={{
                    background: '#1976d2', 
                    height: '8px', 
                    borderRadius: '4px',
                    width: `${uploadProgress}%`,
                    transition: 'width 0.3s'
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div style={{display: 'flex', gap: '12px'}}>
            <button
              type="submit"
              disabled={isUploading || !formData.title.trim() || !formData.videoFile}
              className="btn btn-primary"
              style={{flex: '1'}}
            >
              {isUploading ? 'Uploading...' : 'Upload Video'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              disabled={isUploading}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;