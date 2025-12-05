# NodeVault - Dockerized Node.js Application

## 📌 Project Overview

**NodeVault** is a backend application designed to demonstrate advanced software deployment techniques. The project focuses on solving environment inconsistency issues (Node 16 vs Node 18) through containerization. It transforms a basic legacy application into a feature-rich, robust system backed by MongoDB and orchestrated via Docker Compose.

This project was developed across **7 parts**, demonstrating the complete journey from identifying environment inconsistencies to full containerization and orchestration.

### 🚀 Key Objectives Achieved

* **Part 1 - Environment Inconsistency Resolution:** Identified and documented the failure of Node.js v16 servers due to missing `fetch` API (introduced in Node 18).

* **Part 2 - Initial Containerization:** Created Dockerfile with Node 18 base image to resolve compatibility issues, published to Docker Hub.

* **Part 3 - Feature Expansion:** Added Search, Sorting, Automated Backups, Data Export, and Statistics capabilities with MongoDB integration.

* **Part 4 - Containerization:** Containerized the enhanced application with MongoDB, deployed on Ubuntu server.

* **Part 5 - Manual Deployment:** Demonstrated manual Docker CLI deployment with volumes for data persistence.

* **Part 6 - Docker Compose:** Simplified deployment using Docker Compose orchestration.

* **Part 7 - Repository Integration:** Finalized project with docker-compose.yml in repository for one-command deployment.

---

## ✨ Features

This application includes the following enhancements implemented in **Part 3**:

1. **🔍 Search Functionality:** Case-insensitive search by Name or ID.

2. **🔄 Sorting:** Sort records by Name or Creation Date (Ascending/Descending).

3. **📂 Data Export:** Export all vault data to a formatted `export.txt` file.

4. **💾 Automatic Backups:** Auto-generates timestamped JSON backups in `/backups` on every add/delete operation.

5. **📊 Vault Statistics:** View total records, last modification time, and data analytics.

6. **🛢️ MongoDB Persistence:** Data is stored securely in a MongoDB container.

---

## 🛠️ Prerequisites

* Docker Desktop & Docker Compose
* Git

---

## 🚀 Quick Start (Docker Compose)

This is the recommended way to run the application (covers **Part 6 & 7** requirements).

1. **Clone the Repository**

   ```bash
   git clone https://github.com/dawoodjaved5/SCD-Transfer.git
   cd SCD-Transfer
   ```

2. **Checkout Containerization Branch**

   ```bash
   git checkout feature/containerization
   ```

3. **Run the Application**

   This command builds the image from source, sets up the private network (`compose-network`), creates the volume (`mongo-data-compose`), and starts the database and backend.

   ```bash
   docker-compose up --build -d
   ```

   This automatically:
   - Builds the backend image from the local Dockerfile
   - Pulls the MongoDB image from Docker Hub
   - Creates the necessary networks and volumes
   - Starts all services in the correct order

4. **Verify Deployment**

   Check that both `app-compose` and `mongo-compose` are running:

   ```bash
   docker-compose ps
   # or
   docker ps
   ```

5. **Interact with the App**

   Since this is a CLI-based menu application running in a container, verify it by attaching to the process:

   ```bash
   sudo docker attach app-compose
   ```

   *(To detach without stopping: Press `Ctrl + P`, then `Ctrl + Q`)*

   **Alternative:** Execute commands inside the container:

   ```bash
   sudo docker exec -it app-compose npm start
   ```

---

## ⚙️ Manual Deployment (Docker CLI)

### Part 4: Basic Containerization

This demonstrates **Part 4** - Containerizing the application with MongoDB on Ubuntu server.

1. **Create Network**

   ```bash
   sudo docker network create scd-network
   ```

2. **Start MongoDB Container**

   ```bash
   sudo docker run -d --name mongo-container --network scd-network mongo:latest
   ```

3. **Build Application Image**

   ```bash
   sudo docker build -t dawoodjaved5/scd-project-v2:latest .
   ```

4. **Run Application Container**

   ```bash
   sudo docker run -d -it -p 3000:3000 --name scd-app-v2 \
     --network scd-network \
     -e MONGO_URI="mongodb://mongo-container:27017/nodevault" \
     dawoodjaved5/scd-project-v2:latest
   ```

5. **Start Containers**

   ```bash
   sudo docker start mongo-container
   sudo docker start scd-app-v2
   ```

6. **Verify Running Processes**

   ```bash
   sudo docker ps
   sudo docker top scd-app-v2
   sudo docker top mongo-container
   ```

7. **View Container Logs**

   ```bash
   sudo docker logs scd-app-v2
   sudo docker logs mongo-container
   ```

---

### Part 5: Manual Deployment with Data Persistence

This demonstrates **Part 5** - Manual deployment with volumes for data persistence.

1. **Create Network & Volume**

   ```bash
   sudo docker network create manual-network
   sudo docker volume create mongo-data-manual
   ```

2. **Deploy MongoDB (Private & Persistent)**

   ```bash
   sudo docker run -d --name mongo-manual \
     --network manual-network \
     -v mongo-data-manual:/data/db \
     mongo:latest
   ```

3. **Deploy Application (Public Port 3000)**

   ```bash
   sudo docker run -d -it -p 3000:3000 --name app-manual \
     --network manual-network \
     -e MONGO_URI="mongodb://mongo-manual:27017/nodevault" \
     dawoodjaved5/scd-project-v2:latest
   ```

4. **Test Data Persistence**

   To verify data persistence:
   
   ```bash
   # Add data through the application
   sudo docker exec -it app-manual npm start
   
   # Simulate container crash
   sudo docker rm -f mongo-manual
   
   # Recreate MongoDB container with same volume
   sudo docker run -d --name mongo-manual \
     --network manual-network \
     -v mongo-data-manual:/data/db \
     mongo:latest
   
   # Verify data survived
   sudo docker exec -it app-manual npm start
   # List records - data should still be there!
   ```

---

## 📚 Project Phases

### Part 1: Understanding Environment Inconsistency

**Problem Identified:** Application crashed on Node.js v16 server due to missing `fetch` API.

**Root Cause:** The global `fetch` API was introduced in Node.js v18, but the production server was locked to Node.js v16.

**Verification:**
```bash
# Server environment setup
sudo apt update
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # Confirmed v16.20.2

# Application crash observed
node app.js
curl http://localhost:3000/todo/1
# Error: ReferenceError: fetch is not defined
```

---

### Part 2: Solving with Docker Containers

**Solution:** Created Dockerfile with Node.js v18 base image to isolate application environment.

**Dockerfile:**
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN rm -rf node_modules
RUN npm install
EXPOSE 3000
CMD ["node", "app.js"]
```

**Docker Hub:** https://hub.docker.com/r/dawoodjaved5/scd-project-node18

**Result:** Application successfully ran in container while server remained on Node 16.

---

### Part 3: Building Features into a Provided Project

**Features Implemented:**
- Search functionality (case-insensitive by Name or ID)
- Sorting capability (by Name or Creation Date, Ascending/Descending)
- Data export to `export.txt`
- Automatic backup system (timestamped JSON files in `/backups`)
- Vault statistics dashboard
- MongoDB integration (replaced in-memory storage)
- Environment variables (.env file support)

**Branch:** `feature/app-enhancements`

---

### Part 4: Containerize the Application

**Branch:** `feature/containerization`

**Dockerfile Created:**
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "main.js"]
```

**Deployment:**
- Created `scd-network` for container communication
- Deployed MongoDB container (`mongo-container`)
- Built and deployed application container (`scd-app-v2`)
- Published to Docker Hub: https://hub.docker.com/r/dawoodjaved5/scd-project-v2

---

### Part 5: Deploy Containers Manually

**Demonstrated:**
- Manual Docker CLI deployment
- Private bridge network (`manual-network`)
- Data persistence with volumes (`mongo-data-manual`)
- Container isolation and security
- Data persistence verification test

**Containers:** `mongo-manual`, `app-manual`

---

### Part 6: Simplifying with Docker Compose

**Created:** `docker-compose.yml` for orchestration

**Benefits:**
- Single command deployment (`docker-compose up -d`)
- Automatic network and volume creation
- Dependency management (database starts before app)
- Simplified configuration management

**Containers:** `app-compose`, `mongo-compose`

---

### Part 7: Update Project Repo

**Final Integration:**
- Added `docker-compose.yml` to repository
- Verified fresh environment deployment
- One-command setup for developers
- Complete documentation

---

## 📂 Project Structure

```text
SCD-Transfer/
├── backups/               # Auto-generated backup files
├── data/                  # Legacy data directory
├── db/
│   ├── index.js           # Database logic (MongoDB)
│   ├── mongo.js           # Connection handling
│   ├── record.js          # Record utilities
│   └── file.js            # Legacy file operations
├── events/
│   ├── index.js           # Event emitter
│   └── logger.js          # Event logging
├── Dockerfile             # Container definition (Node 18)
├── docker-compose.yml     # Orchestration configuration
├── .dockerignore          # Docker ignore patterns
├── main.js                # Application entry point (CLI Menu)
├── backup.js              # Backup logic
├── package.json           # Dependencies
└── README.md              # Project documentation
```

---

## 🐳 Docker Hub Images

The application images are available on Docker Hub:

1. **Initial Containerization (Part 2):**
   - **https://hub.docker.com/r/dawoodjaved5/scd-project-node18**
   - Base Node.js 18 image for original application (demonstrates environment inconsistency resolution)

2. **Enhanced Application (Part 4, 5, 6, 7):**
   - **https://hub.docker.com/r/dawoodjaved5/scd-project-v2**
   - Full-featured application with MongoDB integration, search, sorting, backups, and statistics

To pull and run:

```bash
# Pull specific version
docker pull dawoodjaved5/scd-project-v2:latest

# Or use docker-compose which builds from source
docker-compose up --build
```

---

## 🔧 Environment Variables

The application supports the following environment variables:

- `MONGO_URI`: MongoDB connection string (default: `mongodb://127.0.0.1:27017/nodevault`)
- `MONGO_DB_NAME`: MongoDB database name (default: `nodevault`)

Create a `.env` file in the project root to override defaults:

```env
MONGO_URI=mongodb://mongo-container:27017/nodevault
MONGO_DB_NAME=nodevault
```

---

## 📋 Application Menu

When running the application, you'll see the following menu:

```
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Records
6. Sort Records
7. Export Data
8. View Vault Statistics
9. Exit
=====================
```

### Feature Descriptions

- **Add Record:** Create a new record with name and value. Automatically creates a backup.
- **List Records:** Display all records in the vault.
- **Update Record:** Modify an existing record by ID.
- **Delete Record:** Remove a record by ID. Automatically creates a backup.
- **Search Records:** Search by name or ID (case-insensitive).
- **Sort Records:** Sort by Name or Creation Date (Ascending/Descending).
- **Export Data:** Export all records to `export.txt` with metadata.
- **View Vault Statistics:** Display analytics including total records, longest name, earliest/latest dates.

---

## 🧪 Testing

### Test the Application Locally

1. Start MongoDB (if not using Docker):
   ```bash
   # Using Docker
   docker run -d --name mongo-local -p 27017:27017 mongo:latest
   
   # Or using MongoDB Community
   mongod --dbpath ~/mongodb-data
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the application:
   ```bash
   npm start
   ```

### Test in Docker Container

```bash
# Using Docker Compose
docker-compose up -d
docker exec -it app-compose npm start

# Or using manual Docker commands
docker exec -it scd-app npm start
```

---

## 📸 Screenshots & Documentation

### Part 4 Requirements

Document the following for containerization verification:

1. **Container Logs:**
   ```bash
   sudo docker logs scd-app-v2
   sudo docker logs mongo-container
   ```

2. **Container Processes:**
   ```bash
   sudo docker top scd-app-v2
   sudo docker top mongo-container
   ```

3. **Container Stats:**
   ```bash
   sudo docker stats scd-app-v2 mongo-container --no-stream
   ```

4. **Docker Hub:** Screenshot of published image:
   - https://hub.docker.com/r/dawoodjaved5/scd-project-v2

### Part 5 Requirements

Document data persistence verification:

1. **Before Container Removal:**
   ```bash
   sudo docker exec -it app-manual npm start
   # Add test record (e.g., "dawood")
   ```

2. **After Container Recreation:**
   ```bash
   sudo docker rm -f mongo-manual
   sudo docker run -d --name mongo-manual --network manual-network -v mongo-data-manual:/data/db mongo:latest
   sudo docker exec -it app-manual npm start
   # List records - verify data persisted
   ```

### Part 6 & 7 Requirements

Document Docker Compose deployment:

1. **Docker Compose Configuration:**
   ```bash
   cat docker-compose.yml
   ```

2. **Build Process:**
   ```bash
   sudo docker-compose up --build -d
   ```

3. **Running Services:**
   ```bash
   sudo docker-compose ps
   sudo docker ps
   ```

---

## 🛠️ Troubleshooting

### Container exits immediately

The application requires an interactive terminal. Use:

```bash
# For Docker Compose
docker attach app-compose

# For manual Docker
docker exec -it scd-app npm start
```

### MongoDB connection errors

1. Check MongoDB container is running:
   ```bash
   docker ps | grep mongo
   ```

2. Verify network connectivity:
   ```bash
   docker network inspect compose-network
   # or
   docker network inspect scd-network
   ```

3. Check MongoDB logs:
   ```bash
   docker logs mongo-compose
   # or
   docker logs mongo-container
   ```

### View application logs

```bash
# Docker Compose
docker-compose logs -f backend

# Manual Docker
docker logs -f scd-app
```

---

## 📝 Development

### Adding New Features

1. Make changes to the codebase
2. Rebuild the Docker image:
   ```bash
   docker-compose build
   # or
   docker build -t dawoodjaved5/scd-project-v2:latest .
   ```
3. Restart containers:
   ```bash
   docker-compose restart
   # or
   docker restart scd-app
   ```

### Clean Up

```bash
# Stop and remove containers (Docker Compose)
sudo docker-compose down

# Stop and remove containers (Part 4)
sudo docker stop scd-app-v2 mongo-container
sudo docker rm scd-app-v2 mongo-container
sudo docker network rm scd-network

# Stop and remove containers (Part 5)
sudo docker stop app-manual mongo-manual
sudo docker rm app-manual mongo-manual
sudo docker network rm manual-network
sudo docker volume rm mongo-data-manual

# Complete cleanup (removes all containers, networks, volumes)
sudo docker system prune -a --volumes
```

---

## 📄 License

This project is part of a Software Construction and Development course project.

---

## 👤 Author

**Dawood Javed**

- GitHub: [@dawoodjaved5](https://github.com/dawoodjaved5)
- Docker Hub: [dawoodjaved5](https://hub.docker.com/u/dawoodjaved5)

---

