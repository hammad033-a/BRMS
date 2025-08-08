const routes = require('next-routes')();

routes
    .add('/store/register', '/store/register')
    .add('/store/:storeId', '/store/dashboard')
    .add('/store/:storeId/products/add', '/store/products/add')
    .add('/store/:storeId/products', '/store/products')
    .add('/products/:vendorAddress/:productID/pay', 'products/pay')
    // .add('/reviews/addTransaction', '/reviews/send_sms')
    .add('/reviews/send_sms', '/products/thankyou')
    .add('/reviews/thanks', '/reviews/thanks')
    .add('/reviews/:vendorAddress/:productID/:filter/:visualise/show', '/reviews/show')
    .add('/reviews/:vendorAddress/:customerID/:productID/write', '/reviews/write')
    .add('/reviews/:vendorAddress/:customerID/:productID/new', '/reviews/new')
    .add('/login', '/login')
    .add('/dashboard', '/dashboard');

// Export helpers that help automatically navigate users around the app
module.exports = routes;

