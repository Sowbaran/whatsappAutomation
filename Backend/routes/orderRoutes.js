const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', orderController.getAllOrders);
router.get('/:orderId', orderController.getOrderByOrderId);
router.get('/id/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id', authMiddleware, orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
