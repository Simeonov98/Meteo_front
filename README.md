# Meteo_front

Meteo_front is the frontend component of the Meteo project, designed to provide a user-friendly interface for displaying meteorological data collected by the backend system. This project is built using the T3 Stack, which includes Next.js, NextAuth.js, Prisma, Tailwind CSS, and tRPC.

## Features

- **Next.js**: A React framework for building server-side rendered and static web applications.
- **NextAuth.js**: Authentication for Next.js applications.
- **Prisma**: A next-generation ORM for Node.js and TypeScript.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **tRPC**: End-to-end typesafe APIs made easy.

## Project Structure

The repository is organized as follows:

- `horizon-tailwind-react/`: Contains components and configurations related to the Horizon Tailwind React UI.
- `prisma/`: Contains Prisma schema and migration files for database management.
- `public/`: Static assets like images and icons.
- `src/`: Source code for the application, including pages, components, and styles.
- `.eslintrc.cjs`: ESLint configuration file.
- `.gitignore`: Specifies files and directories to be ignored by Git.
- `next.config.mjs`: Next.js configuration file.
- `package.json`: Lists the project's dependencies and scripts.
- `postcss.config.cjs`: PostCSS configuration file.
- `prettier.config.cjs`: Prettier configuration file.
- `tailwind.config.ts`: Tailwind CSS configuration file.
- `tsconfig.json`: TypeScript configuration file.

## Installation

To set up the project locally, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Simeonov98/Meteo_front.git
   cd Meteo_front
   ```

2. **Install dependencies**:

   Ensure you have Node.js installed, then install the required packages:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   Create a `.env` file in the root directory to store necessary environment variables. Refer to the `.env.example` file for the required variables.

4. **Database setup**:

   Configure your database settings in the `prisma/schema.prisma` file. After configuring, run the following command to apply migrations:

   ```bash
   npx prisma migrate dev
   ```

## Usage

To start the development server, run:

```bash
npm run dev
```

This command will start the Next.js development server, and you can view the application at `http://localhost:3000`.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes. Ensure that your code adheres to the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## Acknowledgements

- The T3 Stack community for providing a robust framework for building full-stack applications.
- The developers of Next.js, NextAuth.js, Prisma, Tailwind CSS, and tRPC for their excellent tools and documentation.
