// Mock Vendor for frontend-only operation
const Vendor = (address) => {
    return {
        methods: {
            getProductsCount: () => {
                return {
                    call: () => Promise.resolve(3)
                };
            },
            products: (index) => {
                const mockProducts = [
                    {
                        title: 'Quantum Laptop',
                        description: 'A powerful laptop with quantum computing capabilities',
                        productID: 0,
                        price: '999'
                    },
                    {
                        title: 'Smart Watch',
                        description: 'A stylish smartwatch with health monitoring features',
                        productID: 1,
                        price: '299'
                    },
                    {
                        title: 'Wireless Earbuds',
                        description: 'High-quality wireless earbuds with noise cancellation',
                        productID: 2,
                        price: '149'
                    }
                ];
                return {
                    call: () => Promise.resolve(mockProducts[index])
                };
            }
        }
    };
};

module.exports = Vendor;
