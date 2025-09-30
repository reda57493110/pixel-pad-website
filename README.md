# COD Computer Shop Website

A professional e-commerce website for a computer shop that specializes in Cash on Delivery (COD) payments. Built with modern web technologies and a clean, responsive design.

## Features

### Customer Features
- **Product Browsing**: Browse computers, laptops, and accessories by category
- **Product Details**: View detailed product information with images and specifications
- **Shopping Cart**: Add/remove items, update quantities, view cart summary
- **COD Checkout**: Complete orders with Cash on Delivery payment method
- **Order Confirmation**: Receive order confirmation with unique order ID
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

### Admin Features
- **Order Management**: View all customer orders in a comprehensive dashboard
- **Status Updates**: Update order status (Pending → Confirmed → Shipped → Delivered)
- **Order Details**: View complete customer and product information for each order
- **Secure Login**: Admin authentication system

### Technical Features
- **Modern UI/UX**: Clean, professional design with smooth animations
- **Database Integration**: SQLite database for products, orders, and user management
- **RESTful API**: Well-structured backend API for all operations
- **Real-time Updates**: Dynamic cart updates and order status changes
- **Mobile Responsive**: Optimized for all device sizes

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Custom CSS with modern design principles
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation Steps

1. **Clone or Download the Project**
   ```bash
   # If using git
   git clone <repository-url>
   cd cod-computer-shop
   
   # Or extract the downloaded files to a folder
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Server**
   ```bash
   # For development (with auto-restart)
   npm run dev
   
   # For production
   npm start
   ```

4. **Access the Website**
   - Open your browser and go to: `http://localhost:3000`
   - The website will be fully functional with sample data

## Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

*Note: Change these credentials in production by updating the database or modifying the server.js file.*

## Project Structure

```
cod-computer-shop/
├── server.js              # Main server file with API routes
├── package.json           # Project dependencies and scripts
├── computer_shop.db       # SQLite database (created automatically)
├── public/                # Frontend files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   └── script.js          # JavaScript functionality
└── README.md              # This file
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/categories` - Get product categories

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders (admin)
- `PUT /api/orders/:id/status` - Update order status

### Authentication
- `POST /api/auth/login` - Admin login

## Database Schema

### Products Table
- `id` - Primary key
- `name` - Product name
- `category` - Product category (Desktop, Laptop, Accessories)
- `price` - Product price
- `stock` - Available quantity
- `description` - Product description
- `image` - Product image path
- `created_at` - Creation timestamp

### Orders Table
- `id` - Primary key
- `customer_name` - Customer full name
- `customer_phone` - Customer phone number
- `customer_address` - Delivery address
- `customer_email` - Customer email (optional)
- `notes` - Order notes
- `total_amount` - Order total
- `payment_method` - Payment method (COD)
- `status` - Order status
- `created_at` - Order timestamp

### Order Items Table
- `id` - Primary key
- `order_id` - Foreign key to orders
- `product_id` - Foreign key to products
- `quantity` - Item quantity
- `price` - Item price at time of order

### Users Table
- `id` - Primary key
- `username` - Admin username
- `email` - Admin email
- `password` - Hashed password
- `role` - User role (admin)
- `created_at` - Creation timestamp

## Customization

### Adding New Products
1. Access the admin panel
2. Modify the `server.js` file to add products to the `sampleProducts` array
3. Restart the server

### Changing Styling
- Modify `public/styles.css` for visual changes
- Update color scheme, fonts, or layout as needed

### Adding New Features
- Extend the API in `server.js`
- Add new routes and database operations
- Update the frontend in `public/script.js`

## Deployment

### Local Deployment
1. Follow the installation steps above
2. Run `npm start`
3. Access via `http://localhost:3000`

### Production Deployment
1. Set environment variables:
   - `PORT` - Server port (default: 3000)
   - `JWT_SECRET` - Secret key for JWT tokens

2. Deploy to your preferred hosting platform:
   - Heroku
   - DigitalOcean
   - AWS
   - Vercel
   - Netlify

3. Update database credentials if using external database

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS protection
- SQL injection prevention

## Performance Features

- Optimized database queries
- Efficient frontend rendering
- Responsive image handling
- Minimal external dependencies
- Fast loading times

## Support

For technical support or questions:
- Check the code comments for implementation details
- Review the API endpoints documentation
- Ensure all dependencies are properly installed
- Verify database connectivity

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**COD Computer Shop** - Professional computer solutions with Cash on Delivery payment.

