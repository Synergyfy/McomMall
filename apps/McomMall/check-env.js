const { loadEnvConfig } = require('@next/env');

async function main() {
    const projectDir = process.cwd();
    loadEnvConfig(projectDir);

    console.log('Cloudinary Config Check:');
    console.log('Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '******' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'MISSING');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'PRESENT' : 'MISSING');
}

main().catch(console.error);
