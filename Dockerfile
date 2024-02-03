# Use the official Node.js image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Install nodemon globally
RUN npm install -g nodemon

# Expose port 3000 for the application
EXPOSE 3000

# Command to run the application using nodemon
CMD ["nodemon", "index.js"]
