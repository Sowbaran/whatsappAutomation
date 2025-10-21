const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', orderController.getAllOrders);
router.get('/:orderId', orderController.getOrderByOrderId);
router.get('/id/:id', orderController.getOrderByIdOrOrderId);
router.post('/', orderController.createOrder);
router.post('/assign-orders', authMiddleware, orderController.assignOrders);
router.patch('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
