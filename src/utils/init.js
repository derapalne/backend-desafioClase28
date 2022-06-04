export default function inicializarProductos(archProductos) {
    archProductos.save({
        title: "Onigiri",
        price: 200,
        thumbnail:
            "https://cdn3.iconfinder.com/data/icons/food-solid-in-the-kitchen/512/Onigiri-256.png",
    });

    archProductos.save({
        title: "Biological Warfare",
        price: 800000000,
        thumbnail: "https://cdn0.iconfinder.com/data/icons/infectious-pandemics-1/480/12-virus-256.png",
    });

    archProductos.save({
        title: "Eg",
        price: 120,
        thumbnail:
            "https://cdn3.iconfinder.com/data/icons/food-solid-in-the-kitchen/512/Egg_and_bacon-256.png",
    });
};