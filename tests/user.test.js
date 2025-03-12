const { PostgreSqlContainer } = require('@testcontainers/postgresql');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

let container, databaseUrl;
jest.setTimeout(30000);

describe("Test PostGreSQL", () => {
    beforeAll(async () => {
        container = await new PostgreSqlContainer()
        .withDatabase('test')
        .start()
        databaseUrl = container.getConnectionUri();
        console.log("URL PG = ", databaseUrl);
        process.env.DATABASE_URL = databaseUrl;

        prisma = new PrismaClient({
            datasources: {
                db: {url: databaseUrl}
            }
        });
        await prisma.$executeRaw`CREATE TABLE "User" (id SERIAL PRIMARY KEY, name TEXT, email TEXT UNIQUE)`

    });

    afterAll(async () => {
        if(container){
            await prisma.$executeRaw`DROP TABLE "User"`;
            await prisma.$disconnect();
            await container.stop();
        }
    });

    test("Create a user", async() => {
        const user = await prisma.user.create({
            data: {name: "Pierre Braem", email: "pierre.braem@dev.net"},
        });

        expect(user).toHaveProperty("id");
        expect(user.name).toBe("Pierre Braem");
    });
})