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
// Audius search UI elements
var searchInput = document.getElementById('searchInput');
var searchButton = document.getElementById('searchButton');
var searchResults = document.getElementById('searchResults');

// Audius API helpers
var AUDIUS_HOST = 'https://discoveryprovider.audius.co';
var APP_NAME = 'mi-reproductor-ejemplo';
// discover an available Audius API host (best-effort)
function discoverHost() {
    return fetch('https://api.audius.co')
        .then(function (r) { return r.json(); })
        .then(function (j) {
            if (j && j.data && j.data.length) AUDIUS_HOST = j.data[0];
        })
        .catch(function (e) { return console.warn('No se pudo descubrir host Audius, usando default', e); });
}
function searchTracks(query) {
    if (!query) return Promise.resolve([]);
    var url = AUDIUS_HOST + "/v1/tracks/search?query=" + encodeURIComponent(query) + "&app_name=" + APP_NAME;
    return fetch(url).then(function (res) {
        if (!res.ok) throw new Error('Error en búsqueda Audius');
        return res.json();
    }).then(function (j) { return j.data || []; });
}
function renderSearchResults(tracks) {
    if (!searchResults)
        return;
    searchResults.innerHTML = '';
    if (!tracks.length) {
        searchResults.textContent = 'No se encontraron resultados';
        return;
    }
    tracks.forEach(function (t) {
        var row = document.createElement('div');
        row.className = 'resultado';
        var title = document.createElement('div');
        title.textContent = t.title + " — " + ((t.user && (t.user.name || t.user.handle)) || '');
        var btnAdd = document.createElement('button');
        btnAdd.textContent = 'Agregar';
        btnAdd.addEventListener('click', function () {
            var src = AUDIUS_HOST + "/v1/tracks/" + t.id + "/stream?app_name=" + APP_NAME;
            listaCanciones.agregarFinal({ titulo: t.title, nombre: (t.user && (t.user.name || t.user.handle)) || 'Unknown', fuente: src });
            if (!nodoActual)
                nodoActual = listaCanciones.cabeza;
            actualizarInfoCancion();
        });
        var btnPlay = document.createElement('button');
        btnPlay.textContent = 'Reproducir';
        btnPlay.addEventListener('click', function () {
            var src = AUDIUS_HOST + "/v1/tracks/" + t.id + "/stream?app_name=" + APP_NAME;
            cancion.src = src;
            cancion.load();
            cancion.play().then(function () {
                iconoControl.classList.replace('bi-play-fill', 'bi-pause-fill');
            }).catch(function (e) {
                console.warn('Autoplay bloqueado', e);
            });
        });
        row.appendChild(title);
        row.appendChild(btnAdd);
        row.appendChild(btnPlay);
        searchResults.appendChild(row);
    });
}
if (searchButton && searchInput) {
    searchButton.addEventListener('click', function () {
        var q = searchInput.value.trim();
        if (!q)
            return;
        searchButton.disabled = true;
        discoverHost()
            .then(function () { return searchTracks(q); })
            .then(function (results) { return renderSearchResults(results); })
            .catch(function (e) {
            if (searchResults)
                searchResults.textContent = 'Error buscando en Audius';
            console.error(e);
        })
            .finally(function () { return (searchButton.disabled = false); });
    });
}
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
