# Online Medicine Store

This is a university group project developed for the Object-Oriented Programming and Data Structures & Algorithms modules. The application simulates an online medical store using Java Spring Boot for backend services and JSON files for data storage. It includes both user-facing and admin functionalities.

## Project Overview

Users can register, log in, browse available medicines, add them to a cart, and proceed to checkout. The system allows uploading prescriptions as well. Admins can log in via the admin panel to manage medicines by adding or removing items, which immediately reflect in the product store and also they can add or remove users.

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript (located under `static/admin` and `static/e_commerce.pages`)
- **Backend:** Java, Spring Boot
- **Build Tool:** Maven
- **Configuration:** application.yml
- **Data Storage:** JSON files (`orders.json`, `products.json`, `users.json`)

## Key Functionalities

### User Features
- Register and login
- Browse medicines
- Add items to cart and proceed to checkout
- Upload prescription images 

### Admin Features
- Add and remove products via admin panel
- Add, remove and view users
- View all orders

## Data Structures and Algorithms (DSA)

- **Queue:** Used to manage the sequence of orders for processing (order management logic).
- **Quick Sort:** Applied to sort the list of medicines by price (Applied in the product store).

## My Contribution

I was primarily responsible for implementing the shopping cart and checkout functionalities.

Available **CRUD** Operations :-  
- **Create** -   Add items to cart 
- **Read**   -   View items in the cart<br> 
                 View order summary 
- **Update** -   Modify item quantity<br>
                 Edit shipping or payment details in checkout
- **Delete** -   Remove items from the cart 

Additionally, I integrated the queue logic for order processing and assisted with JSON-based CRUD operations for cart management.

## Project Structure (Simplified)
medicare/
├── src/
│ └── main/
│ ├── java/com/medicare/
│ │ ├── controller/ # Controllers for user, admin, orders, etc.
│ │ ├── model/ # POJO classes: Product, User, Order
│ │ ├── repository/ # JSON-based repositories
│ │ ├── service/ # Business logic
│ │ └── util/ # Queue and sorting logic
│ └── resources/
│ ├── data/ # JSON files simulating a database
│ ├── static/
│ │ ├── admin/ # Admin interface HTML/CSS/JS
│ │ └── e_commerce.pages/ # Customer-facing interface
│ └── application.yml
├── pom.xml
└── README.md

## Project Status
The project is functional and demonstrates the integration of OOP and DSA concepts within a web application. While several core features have been implemented successfully, additional improvements and refinements are planned for future development.

**Happy Coding!**
