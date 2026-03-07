import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Создаем категории
  const categories = [
    {
      name: "Недвижимость",
      slug: "nedvizhimost",
      description: "Квартиры, дома, участки",
      children: [
        { name: "Квартиры", slug: "kvartiry" },
        { name: "Дома", slug: "doma" },
        { name: "Участки", slug: "uchastki" },
        { name: "Коммерческая", slug: "kommercheskaya" },
      ],
    },
    {
      name: "Автомобили",
      slug: "avtomobili",
      description: "Легковые, грузовые, мотоциклы",
      children: [
        { name: "Легковые", slug: "legkovye" },
        { name: "Грузовые", slug: "gruzovye" },
        { name: "Мотоциклы", slug: "mototsikly" },
        { name: "Запчасти", slug: "zapchasti" },
      ],
    },
    {
      name: "Электроника",
      slug: "elektronika",
      description: "Телефоны, компьютеры, техника",
      children: [
        { name: "Телефоны", slug: "telefony" },
        { name: "Компьютеры", slug: "kompyutery" },
        { name: "Бытовая техника", slug: "bytovaya-tekhnika" },
        { name: "Аудио/Видео", slug: "audio-video" },
      ],
    },
    {
      name: "Работа",
      slug: "rabota",
      description: "Вакансии и резюме",
      children: [
        { name: "Вакансии", slug: "vakansii" },
        { name: "Резюме", slug: "rezume" },
      ],
    },
    {
      name: "Услуги",
      slug: "uslugi",
      description: "Различные услуги",
      children: [
        { name: "Ремонт", slug: "remont" },
        { name: "Образование", slug: "obrazovanie" },
        { name: "Красота и здоровье", slug: "krasota-i-zdorove" },
        { name: "Доставка", slug: "dostavka" },
      ],
    },
    {
      name: "Аренда",
      slug: "arenda",
      description: "Аренда недвижимости и транспорта",
      children: [
        { name: "Аренда квартир", slug: "arenda-kvartir" },
        { name: "Аренда транспорта", slug: "arenda-transporta" },
      ],
    },
  ];

  for (const category of categories) {
    const { children, ...categoryData } = category;
    const createdCategory = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: categoryData,
    });

    for (const child of children) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: {},
        create: {
          ...child,
          parentId: createdCategory.id,
        },
      });
    }
  }

  console.log("✅ Categories seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

