# VERTO-INVENTORY

VERTO-INVENTORY is a RESTful API service designed to manage product inventory efficiently, built with Node.js (TypeScript), Express, and MongoDB.


### Key Features

- **Product Management**: Create, read, update, and delete products
- **Stock Management**: Add/remove stock with automatic low-stock threshold detection
- **User Management**: Role-based authentication (Admin/User roles)
- **Low Stock Alerts**: Automatic tracking of products below threshold
- **Pagination**: Efficient data retrieval with customizable page sizes
- **Rate Limiting**: API protection with configurable request limits
- **Caching**: Improved performance using node-cache
- **Bulk Operations**: Delete multiple products in a single request

## Live API

🚀 **Hosted Server**: [`https://verto-invertory.onrender.com`](https://verto-invertory.onrender.com)

You can test the live API directly without local setup. Use the Postman collection and update the `{{verto-inventory}}` variable to point to the hosted URL.
### Postman Collection

Please request access to [`VERTO-INVENTORY.postman_collection.json`](https://web.postman.co/workspace/e95697b9-e21c-42e8-84ea-209c07cfd0cd/collection/27279711-2ddfd595-1c25-4282-88d0-d210278e0be3?action=share&source=copy-link&creator=27279711) to test all API endpoints with pre-configured requests and example responses.


## Prerequisites

Before running this project, ensure you have the following installed:

- Node.js (v14 or higher)
- npm
- MongoDB (local instance or MongoDB Atlas account)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/anaghayawale/verto-invertory
cd verto-inventory
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory. Refer to [`.env.sample`](.env.sample) for all required environment variables.

### 4. Database Setup

**For MongoDB Atlas:**
- [Create a MongoDB Atlas cluster](https://www.mongodb.com/docs/atlas/getting-started/) and obtain your connection string
- Update the `MONGODB_URI` in your `.env` file

### 5. Run the Application

**Create build:**
```bash
npm run build
```

**Start server:**
```bash
npm run start
```

The server will start on `http://localhost:3000` (or your configured PORT).

### 6. Verify Installation

Check if the server is running:
```bash
curl http://localhost:3000/ping
```

Expected response:
```json
{
  "message": "pong"
}
```


## Support

For issues and questions:
- Create an issue in the GitHub repository
- Contact: anaghayawale7@gmail.com