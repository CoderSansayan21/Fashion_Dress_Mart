import { PrismaClient } from '../node_modules/@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Delete all existing data in correct order (respecting FK constraints)
  console.log('🗑️  Clearing existing data...')
  await db.wishlistItem.deleteMany()
  await db.review.deleteMany()
  await db.cartItem.deleteMany()
  await db.payment.deleteMany()
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.cart.deleteMany()
  await db.product.deleteMany()
  await db.user.deleteMany()
  await db.category.deleteMany()
  console.log('✅ All existing data cleared')

  // 2. Create categories
  console.log('📂 Creating categories...')
  const categories = await Promise.all([
    db.category.create({
      data: {
        name: 'Sarees',
        slug: 'sarees',
        description:
          'Traditional Sri Lankan sarees crafted with the finest silk, cotton, and georgette fabrics',
        image: '/images/categories/sarees.png',
      },
    }),
    db.category.create({
      data: {
        name: 'Dresses',
        slug: 'dresses',
        description: 'Contemporary and fusion dresses for every occasion',
        image: '/images/categories/dresses.png',
      },
    }),
    db.category.create({
      data: {
        name: 'Kurta Sets',
        slug: 'kurta-sets',
        description: 'Elegant kurta sets blending tradition with modern style',
        image: '/images/categories/kurta-sets.png',
      },
    }),
    db.category.create({
      data: {
        name: 'Blouses',
        slug: 'blouses',
        description: 'Designer blouses to pair with sarees and skirts',
        image: '/images/categories/blouses.png',
      },
    }),
    db.category.create({
      data: {
        name: 'Lehengas',
        slug: 'lehengas',
        description: 'Breathtaking lehengas for weddings and celebrations',
        image: '/images/categories/lehengas.png',
      },
    }),
  ])

  const categoryMap = new Map(categories.map((c) => [c.name, c.id]))
  console.log(`✅ ${categories.length} categories created`)

  // 3. Create products
  console.log('🛍️  Creating products...')
  const products = await Promise.all([
    db.product.create({
      data: {
        name: 'Royal Blue Banarasi Silk Saree',
        slug: 'royal-blue-banarasi-silk-saree',
        price: 18500,
        discountPrice: 15990,
        stock: 15,
        sku: 'FDM-SR-001',
        brand: 'Lakpahana',
        size: 'Free Size',
        color: 'Royal Blue',
        material: 'Silk',
        imageUrl: '/images/products/sari-1.png',
        isFeatured: true,
        categoryId: categoryMap.get('Sarees')!,
        description:
          'Exquisite Banarasi silk saree in royal blue with intricate gold zari work. Perfect for weddings and special occasions.',
      },
    }),
    db.product.create({
      data: {
        name: 'Emerald Green Georgette Saree',
        slug: 'emerald-green-georgette-saree',
        price: 12500,
        discountPrice: null,
        stock: 20,
        sku: 'FDM-SR-002',
        brand: 'Odel',
        size: 'Free Size',
        color: 'Emerald Green',
        material: 'Georgette',
        imageUrl: '/images/products/sari-2.png',
        isFeatured: true,
        categoryId: categoryMap.get('Sarees')!,
        description:
          'Lightweight georgette saree in emerald green with delicate embroidery border. Ideal for festive gatherings.',
      },
    }),
    db.product.create({
      data: {
        name: 'Pink Organza Floral Dress',
        slug: 'pink-organza-floral-dress',
        price: 8900,
        discountPrice: 7500,
        stock: 12,
        sku: 'FDM-DR-001',
        brand: 'Nithya',
        size: 'S, M, L, XL',
        color: 'Pink',
        material: 'Organza',
        imageUrl: '/images/products/dress-1.png',
        isFeatured: true,
        categoryId: categoryMap.get('Dresses')!,
        description:
          'Dreamy pink organza dress with floral prints, perfect for daytime events and garden parties.',
      },
    }),
    db.product.create({
      data: {
        name: 'Black Lace Evening Gown',
        slug: 'black-lace-evening-gown',
        price: 22000,
        discountPrice: 18900,
        stock: 8,
        sku: 'FDM-DR-002',
        brand: 'Pride Lanka',
        size: 'S, M, L',
        color: 'Black',
        material: 'Lace',
        imageUrl: '/images/products/dress-2.png',
        isFeatured: false,
        categoryId: categoryMap.get('Dresses')!,
        description:
          'Sophisticated black lace evening gown with floor-length design. A showstopper for formal events.',
      },
    }),
    db.product.create({
      data: {
        name: 'White Cotton Block Print Kurta',
        slug: 'white-cotton-block-print-kurta',
        price: 6500,
        discountPrice: null,
        stock: 25,
        sku: 'FDM-KT-001',
        brand: 'Barefoot',
        size: 'S, M, L, XL, XXL',
        color: 'White',
        material: 'Cotton',
        imageUrl: '/images/products/kurta-1.png',
        isFeatured: false,
        categoryId: categoryMap.get('Kurta Sets')!,
        description:
          'Comfortable white cotton kurta with traditional blue block printing. Perfect for casual and everyday wear.',
      },
    }),
    db.product.create({
      data: {
        name: 'Maroon Silk Kurta Set',
        slug: 'maroon-silk-kurta-set',
        price: 14500,
        discountPrice: 12990,
        stock: 10,
        sku: 'FDM-KT-002',
        brand: 'Lakpahana',
        size: 'S, M, L, XL',
        color: 'Maroon',
        material: 'Silk',
        imageUrl: '/images/products/kurta-2.png',
        isFeatured: true,
        categoryId: categoryMap.get('Kurta Sets')!,
        description:
          'Luxurious maroon silk kurta set with gold embroidery. Ideal for festive occasions and celebrations.',
      },
    }),
    db.product.create({
      data: {
        name: 'Red Velvet Embroidered Blouse',
        slug: 'red-velvet-embroidered-blouse',
        price: 5500,
        discountPrice: null,
        stock: 18,
        sku: 'FDM-BL-001',
        brand: 'Avirate',
        size: '32, 34, 36, 38',
        color: 'Red',
        material: 'Velvet',
        imageUrl: '/images/products/blouse-1.png',
        isFeatured: false,
        categoryId: categoryMap.get('Blouses')!,
        description:
          'Stunning red velvet blouse with intricate gold embroidery work. Traditional Sri Lankan design.',
      },
    }),
    db.product.create({
      data: {
        name: 'Royal Purple Bridal Lehenga',
        slug: 'royal-purple-bridal-lehenga',
        price: 45000,
        discountPrice: 38900,
        stock: 5,
        sku: 'FDM-LH-001',
        brand: 'Pride Lanka',
        size: 'S, M, L',
        color: 'Royal Purple',
        material: 'Silk',
        imageUrl: '/images/products/lehenga-1.png',
        isFeatured: true,
        categoryId: categoryMap.get('Lehengas')!,
        description:
          'Breathtaking royal purple lehenga with mirror work and gold embroidery. The perfect bridal ensemble.',
      },
    }),
  ])
  console.log(`✅ ${products.length} products created`)

  // 4. Create admin user
  console.log('🔑 Creating admin user...')
  const adminHashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await db.user.create({
    data: {
      full_name: 'FDM Admin',
      email: 'admin@fashiondressmart.lk',
      hashedPassword: adminHashedPassword,
      phone: '+94 11 234 5678',
      address: 'Fashion Dress Mart HQ, Colombo 07, Sri Lanka',
      role: 'admin',
      isActive: true,
      isVerified: true,
    },
  })
  console.log(`✅ Admin user created: ${admin.email} (password: admin123)`)

  // 5. Create test customer user
  console.log('👤 Creating test user...')
  const customerHashedPassword = await bcrypt.hash('customer123', 10)
  const user = await db.user.create({
    data: {
      full_name: 'Amaya Perera',
      email: 'amaya@example.com',
      hashedPassword: customerHashedPassword,
      phone: '+94 77 123 4567',
      address: '45 Galle Road, Colombo 03, Sri Lanka',
      role: 'customer',
      isActive: true,
      isVerified: true,
    },
  })
  console.log(`✅ Test user created: ${user.email} (password: customer123)`)

  // 6. Create cart for test user
  console.log('🛒 Creating cart for test user...')
  await db.cart.create({
    data: {
      userId: user.id,
    },
  })
  console.log('✅ Cart created for test user')

  console.log('\n🎉 Seeding complete!')
  console.log(`   Categories: ${categories.length}`)
  console.log(`   Products:   ${products.length}`)
  console.log(`   Users:      2 (1 admin + 1 customer)`)
  console.log(`   Carts:      1`)
  console.log(`   Admin Login: admin@fashiondressmart.lk / admin123`)
  console.log(`   Customer Login: amaya@example.com / customer123`)
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await db.$disconnect()
    process.exit(1)
  })