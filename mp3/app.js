var Nodo = /** @class */ (function () {
    function Nodo(cancion) {
        this.cancion = cancion;
        this.anterior = null;
        this.siguiente = null;
    }
    return Nodo;
}());
var ListaDoble = /** @class */ (function () {
    function ListaDoble() {
        this.cabeza = null;
        this.cola = null;
    }
    ListaDoble.prototype.agregarFinal = function (c) {
        var n = new Nodo(c);
        if (!this.cabeza)
            this.cabeza = this.cola = n;
        else {
            this.cola.siguiente = n;
            n.anterior = this.cola;
            this.cola = n;
        }
    };
    ListaDoble.prototype.agregarInicio = function (c) {
        var n = new Nodo(c);
        if (!this.cabeza)
            this.cabeza = this.cola = n;
        else {
            n.siguiente = this.cabeza;
            this.cabeza.anterior = n;
            this.cabeza = n;
        }
    };
    ListaDoble.prototype.eliminar = function (nodo) {
        if (nodo.anterior)
            nodo.anterior.siguiente = nodo.siguiente;
        else
            this.cabeza = nodo.siguiente;
        if (nodo.siguiente)
            nodo.siguiente.anterior = nodo.anterior;
        else
            this.cola = nodo.anterior;
    };
    return ListaDoble;
}());
var listaCanciones = new ListaDoble();
var cancionesIniciales = [
   { titulo: "In The End", nombre: "Linkin Park", fuente: "music/test1.mp3" },
{ titulo: "Mind Games", nombre: "Sickick", fuente: "music/test2.mp3" },
{ titulo: "Monster", nombre: "Skillet", fuente: "music/test3.mp3" },
{ titulo: "One of the Girls", nombre: "The Weeknd", fuente: "music/test4.mp3" }

];
cancionesIniciales.forEach(function (c) { return listaCanciones.agregarFinal(c); });
var nodoActual = listaCanciones.cabeza;
var tituloCancion = document.getElementById('tituloCancion');
var nombreArtista = document.getElementById('nombreArtista');
var progreso = document.getElementById('progreso');
var cancion = document.getElementById('cancion');
var iconoControl = document.getElementById('iconoControl');
var botonReproducirPausar = document.getElementById('botonReproducirPausar');
var botonAtras = document.getElementById('botonAtras');
var botonAdelante = document.getElementById('botonAdelante');
var botonAgregar = document.getElementById('botonAgregar');
var botonEliminar = document.getElementById('botonEliminar');
var inputTitulo = document.getElementById('tituloNuevo');
var inputArtista = document.getElementById('artistaNuevo');
var inputFuente = document.getElementById('fuenteNueva');
var selectPosicion = document.getElementById('posicionNueva');
function actualizarInfoCancion() {
    if (!nodoActual) {
        tituloCancion.textContent = "No hay canciones";
        nombreArtista.textContent = "";
        cancion.src = "";
        return;
    }
    tituloCancion.textContent = nodoActual.cancion.titulo;
    nombreArtista.textContent = nodoActual.cancion.nombre;
    cancion.src = nodoActual.cancion.fuente;
}
function reproducirCancion() { cancion.play(); iconoControl.classList.replace('bi-play-fill', 'bi-pause-fill'); }
function pausarCancion() { cancion.pause(); iconoControl.classList.replace('bi-pause-fill', 'bi-play-fill'); }
function reproducirPausar() { if (cancion.paused)
    reproducirCancion();
else
    pausarCancion(); }
cancion.addEventListener('loadedmetadata', function () { return progreso.max = cancion.duration.toString(); });
cancion.addEventListener('timeupdate', function () { return progreso.value = cancion.currentTime.toString(); });
progreso.addEventListener('input', function () { return cancion.currentTime = Number(progreso.value); });
botonReproducirPausar.addEventListener('click', reproducirPausar);
botonAdelante.addEventListener('click', function () { nodoActual = (nodoActual === null || nodoActual === void 0 ? void 0 : nodoActual.siguiente) || listaCanciones.cabeza; actualizarInfoCancion(); reproducirCancion(); });
botonAtras.addEventListener('click', function () { nodoActual = (nodoActual === null || nodoActual === void 0 ? void 0 : nodoActual.anterior) || listaCanciones.cola; actualizarInfoCancion(); reproducirCancion(); });
function agregarCancionDOM() {
    var t = inputTitulo.value.trim(), a = inputArtista.value.trim(), f = inputFuente.value.trim(), p = selectPosicion.value;
    if (!t || !a || !f)
        return;
    if (p === 'inicio')
        listaCanciones.agregarInicio({ titulo: t, nombre: a, fuente: f });
    else
        listaCanciones.agregarFinal({ titulo: t, nombre: a, fuente: f });
    inputTitulo.value = '';
    inputArtista.value = '';
    inputFuente.value = '';
    if (!nodoActual)
        nodoActual = listaCanciones.cabeza;
    actualizarInfoCancion();
}
function eliminarCancionDOM() {
    if (!nodoActual)
        return;
    var nodoAEliminar = nodoActual;
    nodoActual = nodoActual.siguiente || nodoActual.anterior;
    listaCanciones.eliminar(nodoAEliminar);
    actualizarInfoCancion();
}
botonAgregar.addEventListener('click', agregarCancionDOM);
botonEliminar.addEventListener('click', eliminarCancionDOM);
actualizarInfoCancion();
