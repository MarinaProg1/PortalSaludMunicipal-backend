import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
    try {
        const uri = process.env.DATABASE_URL || process.env.DATABASE_URL_ATLAS || '';
        await mongoose.connect(uri);
    } catch (error) {
        console.error('�Y"� Error al conectar a la base de datos:', error);
        process.exit(1);
    }
};

mongoose.connection.on('connected', () => {
    console.log('�YY� Conexi��n a la base de datos establecida');
});

mongoose.connection.on('disconnected', () => {
    console.log('�YY� Conexi��n a la base de datos perdida');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('�Y"� Conexi��n a la base de datos cerrada por terminaci��n de la aplicaci��n');
    process.exit(0);
});
