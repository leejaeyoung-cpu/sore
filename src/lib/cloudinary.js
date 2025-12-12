const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'church_images'

if (!cloudinaryCloudName) {
    console.warn('⚠️ Cloudinary Cloud Name이 설정되지 않았습니다.')
}

export const cloudinaryConfig = {
    cloudName: cloudinaryCloudName,
    uploadPreset: cloudinaryUploadPreset,
    apiUrl: `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/upload`
}

// 이미지 업로드 헬퍼 함수
export async function uploadImage(file) {
    if (!cloudinaryCloudName) {
        throw new Error('Cloudinary가 설정되지 않았습니다.')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', cloudinaryUploadPreset)

    const response = await fetch(cloudinaryConfig.apiUrl, {
        method: 'POST',
        body: formData
    })

    if (!response.ok) {
        throw new Error('이미지 업로드 실패')
    }

    const data = await response.json()
    return data.secure_url
}

// 파일 업로드 (PDF 포함)
export async function uploadFile(file) {
    if (!cloudinaryCloudName) {
        throw new Error('Cloudinary가 설정되지 않았습니다.')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', cloudinaryUploadPreset)

    const response = await fetch(cloudinaryConfig.apiUrl, {
        method: 'POST',
        body: formData
    })

    if (!response.ok) {
        throw new Error('파일 업로드 실패')
    }

    const data = await response.json()
    return {
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format
    }
}

// 이미지 URL 생성 헬퍼 (Cloudinary 변환 기능 사용)
export function getImageUrl(publicId, options = {}) {
    const { width = 800, quality = 'auto', format = 'auto' } = options
    return `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/w_${width},q_${quality},f_${format}/${publicId}`
}

console.log('✅ Cloudinary 설정 완료')
console.log('📍 Cloud Name:', cloudinaryCloudName)
