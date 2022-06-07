const generar = (cant) => {
    const numeros = {};
    for(let i = 0; i < cant; i++) {
        const numero = Math.floor(Math.random()*1000)+1;
        if(numeros[numero]) {
            numeros[numero]++;
        } else {
            numeros[numero] = 1;
        }
    }
    return numeros;
}

process.on('message', msg => {
    console.log(msg);
    const numeros = generar(msg);
    process.send(numeros);
    setTimeout(process.exit, 5000);
})

process.send('listo');