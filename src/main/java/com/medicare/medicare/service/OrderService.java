package com.medicare.medicare.service;

import com.medicare.medicare.model.Order;
import com.medicare.medicare.model.Product;
import com.medicare.medicare.repository.OrderFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final OrderFileRepository orderRepository;
    private final ProductService productService;
    private final OrderIdQueue pendingOrdersQueue;

    @Autowired
    public OrderService(OrderFileRepository orderRepository, ProductService productService) {
        this.orderRepository = orderRepository;
        this.productService = productService;
        this.pendingOrdersQueue = new OrderIdQueue(100); // Arbitrary queue size
    }

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public List<Order> findByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public Order findById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    public Order placeOrder(Order order) {
        // Save the order with status "Pending" (set by constructor)
        Order savedOrder = orderRepository.save(order);
        // Enqueue the order ID for later processing
        pendingOrdersQueue.enqueue(savedOrder.getId());
        return savedOrder;
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Order order = findById(orderId);
        if (order != null) {
            order.setStatus(status);
            return orderRepository.save(order);
        }
        return null;
    }

    public void processNextOrder() {
        if (pendingOrdersQueue.isEmpty()) {
            System.out.println("No pending orders to process.");
            return;
        }
        Long orderId = pendingOrdersQueue.dequeue();
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            System.out.println("Order not found: " + orderId);
            return;
        }
        // Process the order: update inventory
        for (Order.OrderItem item : order.getItems()) {
            Product product = productService.findById(item.getProductId());
            if (product != null) {
                int newStock = product.getStock() - item.getQuantity();
                product.setStock(Math.max(0, newStock)); // Ensure stock doesn't go below 0
                productService.save(product);
            }
        }
        // Update order status to "Processed"
        order.setStatus("Processed");
        orderRepository.save(order);
    }

    // Inner class for array-based queue of order IDs
    private static class OrderIdQueue {
        private Long[] queueArray;
        private int maxSize;
        private int front;
        private int rear;
        private int count;

        public OrderIdQueue(int maxSize) {
            this.maxSize = maxSize;
            this.queueArray = new Long[maxSize];
            this.front = 0;
            this.rear = -1;
            this.count = 0;
        }

        public boolean isEmpty() {
            return (count == 0);
        }

        public boolean isFull() {
            return (rear == maxSize - 1);
        }

        public void enqueue(Long item) {
            if (isFull()) {
                System.out.println("Queue is full. Cannot enqueue item: " + item);
                return;
            }
            rear++;
            queueArray[rear] = item;
            count++;
        }

        public Long dequeue() {
            if (isEmpty()) {
                System.out.println("Queue is empty. Cannot dequeue.");
                return null;
            }
            Long temp = queueArray[front];
            front++;
            count--;
            return temp;
        }
    }
}