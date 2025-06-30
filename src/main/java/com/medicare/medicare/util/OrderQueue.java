package com.medicare.medicare.util;

import com.medicare.medicare.model.Order;

public class OrderQueue {
    private Order[] queueArray;
    private int maxSize;
    private int front;
    private int rear;
    private int count;

    public OrderQueue(int maxSize) {
        this.maxSize = maxSize;
        this.queueArray = new Order[maxSize];
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

    public void enqueue(Order order) {
        if (isFull()) {
            System.out.println("Queue is full. Cannot enqueue order: " + order);
            return;
        }
        rear++;
        queueArray[rear] = order;
        count++;
    }

    public Order dequeue() {
        if (isEmpty()) {
            System.out.println("Queue is empty. Cannot dequeue.");
            return null;
        }
        Order temp = queueArray[front];
        front++;
        count--;
        return temp;
    }
}