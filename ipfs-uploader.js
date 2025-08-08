const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class IPFSUploader {
    constructor() {
        // Configuration for different IPFS services
        this.config = {
            pinata: {
                apiKey: process.env.PINATA_API_KEY || '',
                secretKey: process.env.PINATA_SECRET_KEY || '',
                baseURL: 'https://api.pinata.cloud'
            },
            web3storage: {
                apiKey: process.env.WEB3STORAGE_API_KEY || '',
                baseURL: 'https://api.web3.storage'
            },
            local: {
                baseURL: 'http://localhost:5001/api/v0',
                enabled: true
            }
        };
    }

    /**
     * Upload JSON content to IPFS using Pinata
     * @param {Object} reviewData - The review data to upload
     * @param {string} filename - Optional filename for the JSON
     * @returns {Promise<Object>} - Returns { success: boolean, hash: string, error?: string }
     */
    async uploadToPinata(reviewData, filename = 'review.json') {
        try {
            if (!this.config.pinata.apiKey || !this.config.pinata.secretKey) {
                throw new Error('Pinata API credentials not configured. Set PINATA_API_KEY and PINATA_SECRET_KEY environment variables.');
            }

            // Create form data
            const formData = new FormData();
            
            // Add the JSON content as a file
            const jsonBuffer = Buffer.from(JSON.stringify(reviewData, null, 2));
            formData.append('file', jsonBuffer, {
                filename: filename,
                contentType: 'application/json'
            });

            // Add metadata
            formData.append('pinataMetadata', JSON.stringify({
                name: filename,
                keyvalues: {
                    type: 'review',
                    timestamp: new Date().toISOString(),
                    productId: reviewData.productId || 'unknown'
                }
            }));

            // Add options
            formData.append('pinataOptions', JSON.stringify({
                cidVersion: 1,
                wrapWithDirectory: false
            }));

            const response = await axios.post(
                `${this.config.pinata.baseURL}/pinning/pinFileToIPFS`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.pinata.apiKey}`,
                        ...formData.getHeaders()
                    },
                    timeout: 30000 // 30 second timeout
                }
            );

            if (response.data && response.data.IpfsHash) {
                return {
                    success: true,
                    hash: response.data.IpfsHash,
                    size: response.data.PinSize,
                    timestamp: response.data.Timestamp,
                    service: 'pinata'
                };
            } else {
                throw new Error('Invalid response from Pinata API');
            }

        } catch (error) {
            console.error('Pinata upload error:', error.message);
            return {
                success: false,
                error: error.message,
                service: 'pinata'
            };
        }
    }

    /**
     * Upload JSON content to IPFS using Web3.Storage
     * @param {Object} reviewData - The review data to upload
     * @param {string} filename - Optional filename for the JSON
     * @returns {Promise<Object>} - Returns { success: boolean, hash: string, error?: string }
     */
    async uploadToWeb3Storage(reviewData, filename = 'review.json') {
        try {
            if (!this.config.web3storage.apiKey) {
                throw new Error('Web3.Storage API key not configured. Set WEB3STORAGE_API_KEY environment variable.');
            }

            // Create form data
            const formData = new FormData();
            
            // Add the JSON content as a file
            const jsonBuffer = Buffer.from(JSON.stringify(reviewData, null, 2));
            formData.append('file', jsonBuffer, {
                filename: filename,
                contentType: 'application/json'
            });

            const response = await axios.post(
                `${this.config.web3storage.baseURL}/upload`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.web3storage.apiKey}`,
                        ...formData.getHeaders()
                    },
                    timeout: 30000 // 30 second timeout
                }
            );

            if (response.data && response.data.cid) {
                return {
                    success: true,
                    hash: response.data.cid,
                    size: response.data.size,
                    timestamp: new Date().toISOString(),
                    service: 'web3storage'
                };
            } else {
                throw new Error('Invalid response from Web3.Storage API');
            }

        } catch (error) {
            console.error('Web3.Storage upload error:', error.message);
            return {
                success: false,
                error: error.message,
                service: 'web3storage'
            };
        }
    }

    /**
     * Upload JSON content to local IPFS node
     * @param {Object} reviewData - The review data to upload
     * @param {string} filename - Optional filename for the JSON
     * @returns {Promise<Object>} - Returns { success: boolean, hash: string, error?: string }
     */
    async uploadToLocalIPFS(reviewData, filename = 'review.json') {
        try {
            if (!this.config.local.enabled) {
                throw new Error('Local IPFS not enabled');
            }

            // Create form data for local IPFS
            const formData = new FormData();
            
            // Add the JSON content as a file
            const jsonBuffer = Buffer.from(JSON.stringify(reviewData, null, 2));
            formData.append('file', jsonBuffer, {
                filename: filename,
                contentType: 'application/json'
            });

            const response = await axios.post(
                `${this.config.local.baseURL}/add`,
                formData,
                {
                    headers: {
                        ...formData.getHeaders()
                    },
                    timeout: 30000 // 30 second timeout
                }
            );

            if (response.data && response.data.Hash) {
                return {
                    success: true,
                    hash: response.data.Hash,
                    size: response.data.Size,
                    timestamp: new Date().toISOString(),
                    service: 'local-ipfs'
                };
            } else {
                throw new Error('Invalid response from local IPFS API');
            }

        } catch (error) {
            console.error('Local IPFS upload error:', error.message);
            return {
                success: false,
                error: error.message,
                service: 'local-ipfs'
            };
        }
    }

    /**
     * Upload JSON content to IPFS with fallback and retry logic
     * @param {Object} reviewData - The review data to upload
     * @param {string} filename - Optional filename for the JSON
     * @param {string} preferredService - 'local-ipfs', 'pinata', or 'web3storage' (default: 'local-ipfs')
     * @returns {Promise<Object>} - Returns upload result with fallback
     */
    async uploadToIPFS(reviewData, filename = 'review.json', preferredService = 'local-ipfs') {
        console.log(`🔄 Uploading review to IPFS using ${preferredService}...`);

        // Prepare the review data with metadata
        const uploadData = {
            ...reviewData,
            _metadata: {
                uploadedAt: new Date().toISOString(),
                filename: filename,
                version: '1.0'
            }
        };

        let result;

        // Try preferred service first
        if (preferredService === 'local-ipfs') {
            result = await this.uploadToLocalIPFS(uploadData, filename);
            if (result.success) {
                console.log(`✅ Successfully uploaded to local IPFS: ${result.hash}`);
                return result;
            }
        } else if (preferredService === 'pinata') {
            result = await this.uploadToPinata(uploadData, filename);
            if (result.success) {
                console.log(`✅ Successfully uploaded to Pinata: ${result.hash}`);
                return result;
            }
        } else if (preferredService === 'web3storage') {
            result = await this.uploadToWeb3Storage(uploadData, filename);
            if (result.success) {
                console.log(`✅ Successfully uploaded to Web3.Storage: ${result.hash}`);
                return result;
            }
        }

        // Fallback to other services if preferred service fails
        console.log(`⚠️ ${preferredService} upload failed, trying fallback...`);
        
        if (preferredService === 'local-ipfs') {
            // Try Pinata as first fallback
            result = await this.uploadToPinata(uploadData, filename);
            if (result.success) {
                console.log(`✅ Successfully uploaded to Pinata (fallback): ${result.hash}`);
                return result;
            }
            // Try Web3.Storage as second fallback
            result = await this.uploadToWeb3Storage(uploadData, filename);
            if (result.success) {
                console.log(`✅ Successfully uploaded to Web3.Storage (fallback): ${result.hash}`);
                return result;
            }
        } else if (preferredService === 'pinata') {
            result = await this.uploadToWeb3Storage(uploadData, filename);
            if (result.success) {
                console.log(`✅ Successfully uploaded to Web3.Storage (fallback): ${result.hash}`);
                return result;
            }
        } else if (preferredService === 'web3storage') {
            result = await this.uploadToPinata(uploadData, filename);
            if (result.success) {
                console.log(`✅ Successfully uploaded to Pinata (fallback): ${result.hash}`);
                return result;
            }
        }

        // If all services fail, return error
        console.error('❌ All IPFS upload attempts failed');
        return {
            success: false,
            error: 'All IPFS upload services failed',
            attempts: 3
        };
    }

    /**
     * Verify IPFS hash by attempting to retrieve the content
     * @param {string} hash - The IPFS hash to verify
     * @param {string} gateway - IPFS gateway to use (default: 'https://ipfs.io/ipfs/')
     * @returns {Promise<Object>} - Returns verification result
     */
    async verifyIPFSHash(hash, gateway = 'https://ipfs.io/ipfs/') {
        try {
            const response = await axios.get(`${gateway}${hash}`, {
                timeout: 10000
            });

            if (response.status === 200 && response.data) {
                return {
                    success: true,
                    hash: hash,
                    content: response.data,
                    gateway: gateway
                };
            } else {
                return {
                    success: false,
                    error: 'Invalid response from IPFS gateway',
                    hash: hash
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                hash: hash,
                gateway: gateway
            };
        }
    }

    /**
     * Get IPFS gateway URLs for a hash
     * @param {string} hash - The IPFS hash
     * @returns {Object} - Returns object with different gateway URLs
     */
    getGatewayURLs(hash) {
        return {
            ipfsIo: `https://ipfs.io/ipfs/${hash}`,
            cloudflare: `https://cloudflare-ipfs.com/ipfs/${hash}`,
            dweb: `https://dweb.link/ipfs/${hash}`,
            gateway: `https://gateway.pinata.cloud/ipfs/${hash}`,
            web3Storage: `https://${hash}.ipfs.w3s.link/`
        };
    }

    /**
     * Check if API credentials are configured
     * @returns {Object} - Returns configuration status
     */
    checkConfiguration() {
        return {
            pinata: {
                configured: !!(this.config.pinata.apiKey && this.config.pinata.secretKey),
                hasApiKey: !!this.config.pinata.apiKey,
                hasSecretKey: !!this.config.pinata.secretKey
            },
            web3storage: {
                configured: !!this.config.web3storage.apiKey,
                hasApiKey: !!this.config.web3storage.apiKey
            },
            local: {
                enabled: !!this.config.local.enabled
            }
        };
    }
}

module.exports = IPFSUploader; 