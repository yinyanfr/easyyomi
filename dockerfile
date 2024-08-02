# Use an official Node.js runtime as the base image
FROM node:20

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

RUN npm run build

# Set environment variable for the port
ENV PORT=3000

# Set environment variables for basic authentication
ENV BASIC_AUTH_USERNAME=username
ENV BASIC_AUTH_PASSWORD=password

# Define a volume for the 'local' directory
VOLUME [ "/app/local" ]

# Expose the port for the application
EXPOSE $PORT

# Define the command to run the application
CMD [ "npm", "start" ]