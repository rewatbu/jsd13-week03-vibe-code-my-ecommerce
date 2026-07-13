require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Inventory = require('./models/Inventory');

const products = [
  {
    name: ' Ethiop Yirgacheffe',
    description: 'กาแฟเอธิโอเปีย ยอร์กาเชฟเฟ่ กลิ่นหอมดอกไม้และผลไม้ รสชาติสดชื่น มีความเปรี้ยวอมหวาน',
    origin: 'เอธิโอเปีย',
    roastLevel: 'Light',
    weight: 250,
    price: 350,
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
    isActive: true
  },
  {
    name: 'Colombia Supremo',
    description: 'กาแฟโคลอมเบีย ซูพรีโม่ รสชาติเข้มข้น หอมกลิ่นช็อกโกแลตและถั่ว บาลานซ์ดีเยี่ยม',
    origin: 'โคลอมเบีย',
    roastLevel: 'Medium',
    weight: 250,
    price: 320,
    imageUrl: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=400',
    isActive: true
  },
  {
    name: 'Brazil Santos',
    description: 'กาแฟบราซิล ซานโตส รสชาตินุ่มนวล หอมกลิ่นถั่วและคาราเมล ดื่มง่าย',
    origin: 'บราซิล',
    roastLevel: 'Medium',
    weight: 250,
    price: 280,
    imageUrl: 'https://images.unsplash.com/photo-1695653421587-8525097bf5e5?w=400',
    isActive: true
  },
  {
    name: 'Guatemala Antigua',
    description: 'กาแฟกัวเตมาลา แอนติกัว รสชาติเข้มข้น หอมกลิ่นช็อกโกแลตและเครื่องเทศเบาๆ',
    origin: 'กัวเตมาลา',
    roastLevel: 'Medium-Dark',
    weight: 250,
    price: 340,
    imageUrl: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400',
    isActive: true
  },
  {
    name: 'Sumatra Mandheling',
    description: 'กาแฟสุมาตรา มันดเฮลลิ่ง รสชาติเข้มเต็มตัว กลิ่นดินและสมุนไพร บอดี้หนัก',
    origin: 'อินโดนีเซีย',
    roastLevel: 'Dark',
    weight: 250,
    price: 360,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=400',
    isActive: true
  },
  {
    name: 'Kenya AA',
    description: 'กาแฟเคนยา เอเอ รสชาติสดใส มีความเปรี้ยวแบบผลไม้ กลิ่นเบอร์รี่เข้มข้น',
    origin: 'เคนยา',
    roastLevel: 'Medium',
    weight: 250,
    price: 380,
    imageUrl: 'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=400',
    isActive: true
  },
  {
    name: 'Costa Rica Tarrazu',
    description: 'กาแฟคอสตาริก้า ทาร์ราซู รสชาติสะอาด หอมกลิ่นซитรัสและน้ำผึ้ง brightness สูง',
    origin: 'คอสตาริก้า',
    roastLevel: 'Light',
    weight: 250,
    price: 350,
    imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400',
    isActive: true
  },
  {
    name: 'Vietnam Robusta',
    description: 'กาแฟเวียดนาม โรบัสต้า รสชาติเข้มจัด คาเฟอีนสูง หอมกลิ่นช็อกโกแลตเข้มข้น',
    origin: 'เวียดนาม',
    roastLevel: 'Dark',
    weight: 250,
    price: 250,
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400',
    isActive: true
  },
  {
    name: 'Jamaica Blue Mountain',
    description: 'กาแฟจาเมกา บลูเมาท์เทน สุดยอดกาแฟระดับโลก รสชาติสมดุล หอมละมุน ไม่ขม',
    origin: 'จาเมกา',
    roastLevel: 'Medium',
    weight: 100,
    price: 650,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    isActive: true
  },
  {
    name: 'Hawaiian Kona',
    description: 'กาแฟฮาวาย โคน่า รสชาติเนียนนุ่ม หอมกลิ่นน้ำตาลทรายแดงและผลไม้ หายากและมีคุณภาพสูง',
    origin: 'สหรัฐอเมริกา',
    roastLevel: 'Medium',
    weight: 100,
    price: 700,
    imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400',
    isActive: true
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Product.deleteMany({});
    await Inventory.deleteMany({});

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'CoffeeBean',
      email: 'admin@coffeebean.com',
      password: 'admin123',
      phone: '0812345678',
      role: 'admin'
    });

    const customer = await User.create({
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      email: 'somchai@email.com',
      password: 'password123',
      phone: '0898765432',
      role: 'customer'
    });

    console.log('Users created');
    console.log('Admin: admin@coffeebean.com / admin123');
    console.log('Customer: somchai@email.com / password123');

    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} products created`);

    const inventoryItems = createdProducts.map(p => ({
      product: p._id,
      quantity: Math.floor(Math.random() * 50) + 20,
      minimumStock: 5,
      maximumStock: 100,
      lastUpdated: new Date()
    }));

    await Inventory.insertMany(inventoryItems);
    console.log(`${inventoryItems.length} inventory items created`);

    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
