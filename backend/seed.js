const bcrypt = require('bcryptjs');
const db = require('./models');

const seed = async () => {
    try {
        console.log('Sincronizando modelos con la base de datos (sin borrar datos)...');
        // Sincroniza los modelos para asegurar que las tablas y columnas existan
        // { alter: true } intenta modificar las tablas para que coincidan con los modelos sin borrar datos
        await db.sequelize.sync({ alter: true });
        console.log('✅ Modelos sincronizados.');

        // --- Creación de Usuarios (solo si no existen) ---
        console.log('Creando o encontrando usuarios de prueba...');
        const usersData = [
            { name: 'Admin', email: 'admin@autogerst.com', password: 'password123', role: 'admin' },
            { name: 'Usuario Normal', email: 'user@autogerst.com', password: 'password123', role: 'user' },
        ];

        const userPromises = usersData.map(async (userData) => {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);
            
            // Busca un usuario por email, y si no lo encuentra, lo crea con los datos por defecto
            const [user, created] = await db.User.findOrCreate({
                where: { email: userData.email },
                defaults: {
                    name: userData.name,
                    password: hashedPassword,
                    role: userData.role,
                }
            });
            if (created) {
                console.log(` -> Usuario de prueba '${user.email}' creado.`);
            }
            return user;
        });
        
        const [adminUser, normalUser] = await Promise.all(userPromises);
        console.log('✅ Usuarios de prueba listos.');

        // --- Creación de Coches (solo si no existen por matrícula) ---
        console.log('Creando o encontrando coches de prueba...');
        const carsData = [
            { make: 'Seat', model: 'León', price: 21000, purchasePrice: 18000, status: 'En venta', km: 45000, licensePlate: '1234 LMN', userId: adminUser.id },
            { make: 'Audi', model: 'A3', price: 32000, purchasePrice: 28500, status: 'En venta', km: 22000, licensePlate: '5678 PQR', userId: adminUser.id },
            { make: 'BMW', model: 'Serie 1', price: 24500, purchasePrice: 21000, salePrice: 24500, status: 'Vendido', km: 68000, licensePlate: '9012 XYZ', userId: normalUser.id },
        ];

        const carPromises = carsData.map(carData => 
            db.Car.findOrCreate({
                where: { licensePlate: carData.licensePlate },
                defaults: carData
            }).then(([car, created]) => {
                if (created) console.log(` -> Coche de prueba '${car.licensePlate}' creado.`);
            })
        );
        await Promise.all(carPromises);
        console.log('✅ Coches de prueba listos.');

        console.log('\n🎉 ¡Semillado no destructivo completado con éxito!');

    } catch (error) {
        console.error('❌ Error durante el semillado:', error);
    } finally {
        await db.sequelize.close();
    }
};

seed();