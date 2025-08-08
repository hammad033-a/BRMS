// Mock VendorFactory for frontend-only operation
const VendorFactory = {
    methods: {
        getDeployedVendors: () => {
            return {
                call: () => Promise.resolve(['0x1234567890123456789012345678901234567890'])
            };
        }
    }
};

module.exports = VendorFactory;
